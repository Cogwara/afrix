import { Prisma, PrismaClient } from "@prisma/client";
import { prisma as defaultPrisma } from "../prisma";

export type TransactionClient = Omit<
  PrismaClient,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>;

export class LedgerService {
  /**
   * Helper to ensure a wallet exists for the given user ID.
   */
  static async getOrCreateWallet(
    userId: string,
    client: TransactionClient | PrismaClient = defaultPrisma,
    currency: string = "USD"
  ) {
    let wallet = await client.wallet.findUnique({
      where: { userId },
    });

    if (!wallet) {
      wallet = await client.wallet.create({
        data: {
          userId,
          currency,
          availableBalance: new Prisma.Decimal(0),
          pendingBalance: new Prisma.Decimal(0),
          lifetimeEarned: new Prisma.Decimal(0),
          lifetimeWithdrawn: new Prisma.Decimal(0),
        },
      });
    }

    return wallet;
  }

  /**
   * Credit worker for approved task submission.
   * Atomically updates ledger, wallet balances, worker profile earnings and counts.
   * Idempotent: checks for reference before crediting to prevent double credit.
   */
  static async creditWorkerForTask(params: {
    submissionId: string;
    workerUserId: string;
    rewardAmount: number | Prisma.Decimal;
    currency?: string;
    taskId: string;
    taskTitle: string;
    tx?: TransactionClient;
  }) {
    const { submissionId, workerUserId, rewardAmount, currency = "USD", taskId, taskTitle, tx } = params;
    const decimalAmount = new Prisma.Decimal(rewardAmount);

    if (decimalAmount.lessThanOrEqualTo(0)) {
      throw new Error("Reward amount must be greater than zero");
    }

    const run = async (prismaTx: TransactionClient) => {
      const reference = `task_reward:${submissionId}`;

      // Check if reference already processed
      const existingTx = await prismaTx.ledgerTransaction.findUnique({
        where: { reference },
      });

      if (existingTx) {
        return {
          success: true,
          alreadyProcessed: true,
          transaction: existingTx,
        };
      }

      // Ensure wallet exists
      const wallet = await this.getOrCreateWallet(workerUserId, prismaTx, currency);

      // Create immutable ledger record
      const ledgerEntry = await prismaTx.ledgerTransaction.create({
        data: {
          walletId: wallet.id,
          transactionType: "TASK_REWARD",
          amount: decimalAmount,
          currency,
          direction: "CREDIT",
          reference,
          description: `Reward for completed task: ${taskTitle}`,
          status: "COMPLETED",
          metadata: {
            submissionId,
            taskId,
          },
        },
      });

      // Update wallet balance atomically
      const updatedWallet = await prismaTx.wallet.update({
        where: { id: wallet.id },
        data: {
          availableBalance: {
            increment: decimalAmount,
          },
          lifetimeEarned: {
            increment: decimalAmount,
          },
        },
      });

      // Update worker profile
      await prismaTx.workerProfile.updateMany({
        where: { userId: workerUserId },
        data: {
          totalEarned: {
            increment: decimalAmount,
          },
          tasksCompleted: {
            increment: 1,
          },
        },
      });

      return {
        success: true,
        alreadyProcessed: false,
        transaction: ledgerEntry,
        wallet: updatedWallet,
      };
    };

    if (tx) {
      return run(tx);
    } else {
      return defaultPrisma.$transaction(run);
    }
  }

  /**
   * Credit referral bonus to referrer.
   * Atomically updates ledger and wallet balances.
   * Idempotent by referralId.
   */
  static async creditReferralBonus(params: {
    referralId: string;
    referrerUserId: string;
    rewardAmount: number | Prisma.Decimal;
    currency?: string;
    referredUserEmail?: string;
    tx?: TransactionClient;
  }) {
    const { referralId, referrerUserId, rewardAmount, currency = "USD", referredUserEmail, tx } = params;
    const decimalAmount = new Prisma.Decimal(rewardAmount);

    if (decimalAmount.lessThanOrEqualTo(0)) {
      throw new Error("Referral reward amount must be greater than zero");
    }

    const run = async (prismaTx: TransactionClient) => {
      const reference = `referral_reward:${referralId}`;

      const existingTx = await prismaTx.ledgerTransaction.findUnique({
        where: { reference },
      });

      if (existingTx) {
        return { success: true, alreadyProcessed: true, transaction: existingTx };
      }

      const wallet = await this.getOrCreateWallet(referrerUserId, prismaTx, currency);

      const ledgerEntry = await prismaTx.ledgerTransaction.create({
        data: {
          walletId: wallet.id,
          transactionType: "REFERRAL_REWARD",
          amount: decimalAmount,
          currency,
          direction: "CREDIT",
          reference,
          description: `Referral reward for user ${referredUserEmail || "referral"}`,
          status: "COMPLETED",
          metadata: { referralId },
        },
      });

      const updatedWallet = await prismaTx.wallet.update({
        where: { id: wallet.id },
        data: {
          availableBalance: {
            increment: decimalAmount,
          },
          lifetimeEarned: {
            increment: decimalAmount,
          },
        },
      });

      // Update referral status to REWARDED
      await prismaTx.referral.update({
        where: { id: referralId },
        data: {
          status: "REWARDED",
          rewardAmount: decimalAmount,
        },
      });

      return {
        success: true,
        alreadyProcessed: false,
        transaction: ledgerEntry,
        wallet: updatedWallet,
      };
    };

    if (tx) {
      return run(tx);
    } else {
      return defaultPrisma.$transaction(run);
    }
  }

  /**
   * Request a withdrawal.
   * Atomically checks available balance, creates withdrawal record,
   * creates pending debit in ledger, and reserves funds (deducting available, adding to pending).
   * Prevents negative balances and race conditions.
   */
  static async requestWithdrawal(params: {
    userId: string;
    amount: number | Prisma.Decimal;
    currency?: string;
    method: "BANK" | "MOBILE_MONEY" | "STABLECOIN" | "OTHER";
    destination: Record<string, unknown>;
    fee?: number | Prisma.Decimal;
    riskScore?: number | Prisma.Decimal;
    tx?: TransactionClient;
  }) {
    const {
      userId,
      amount,
      currency = "USD",
      method,
      destination,
      fee = 0,
      riskScore = 0,
      tx,
    } = params;

    const decimalAmount = new Prisma.Decimal(amount);
    const decimalFee = new Prisma.Decimal(fee);
    const netAmount = decimalAmount.minus(decimalFee);

    if (decimalAmount.lessThanOrEqualTo(0)) {
      throw new Error("Withdrawal amount must be greater than zero");
    }

    if (netAmount.lessThanOrEqualTo(0)) {
      throw new Error("Net withdrawal amount after fee must be greater than zero");
    }

    const run = async (prismaTx: TransactionClient) => {
      // Find wallet
      const wallet = await prismaTx.wallet.findUnique({
        where: { userId },
      });

      if (!wallet) {
        throw new Error("Wallet not found for user");
      }

      if (wallet.availableBalance.lessThan(decimalAmount)) {
        throw new Error(
          `Insufficient available balance. Available: ${wallet.availableBalance.toString()}, Requested: ${decimalAmount.toString()}`
        );
      }

      // Create withdrawal record
      const withdrawal = await prismaTx.withdrawal.create({
        data: {
          userId,
          walletId: wallet.id,
          amount: decimalAmount,
          fee: decimalFee,
          netAmount,
          currency,
          method,
          destination: destination as unknown as Prisma.InputJsonValue,
          status: "REQUESTED",
          riskScore: new Prisma.Decimal(riskScore),
        },
      });

      const reference = `withdrawal_req:${withdrawal.id}`;

      // Create pending debit ledger entry
      const ledgerEntry = await prismaTx.ledgerTransaction.create({
        data: {
          walletId: wallet.id,
          transactionType: "WITHDRAWAL",
          amount: decimalAmount,
          currency,
          direction: "DEBIT",
          reference,
          description: `Withdrawal request #${withdrawal.id.slice(0, 8)} via ${method}`,
          status: "PENDING",
          metadata: {
            withdrawalId: withdrawal.id,
            method,
            fee: decimalFee.toString(),
            netAmount: netAmount.toString(),
          },
        },
      });

      // Atomically reserve funds: reduce availableBalance, increase pendingBalance
      const updatedWallet = await prismaTx.wallet.update({
        where: { id: wallet.id },
        data: {
          availableBalance: {
            decrement: decimalAmount,
          },
          pendingBalance: {
            increment: decimalAmount,
          },
        },
      });

      // Safety check: verify balance did not go negative
      if (updatedWallet.availableBalance.lessThan(0)) {
        throw new Error("Balance would become negative. Transaction aborted.");
      }

      return {
        withdrawal,
        ledgerTransaction: ledgerEntry,
        wallet: updatedWallet,
      };
    };

    if (tx) {
      return run(tx);
    } else {
      return defaultPrisma.$transaction(run);
    }
  }

  /**
   * Complete a withdrawal when payment is confirmed.
   * Atomically settles the pending balance and updates lifetimeWithdrawn.
   */
  static async completeWithdrawal(params: {
    withdrawalId: string;
    providerReference?: string;
    tx?: TransactionClient;
  }) {
    const { withdrawalId, providerReference, tx } = params;

    const run = async (prismaTx: TransactionClient) => {
      const withdrawal = await prismaTx.withdrawal.findUnique({
        where: { id: withdrawalId },
      });

      if (!withdrawal) {
        throw new Error("Withdrawal not found");
      }

      if (withdrawal.status === "COMPLETED") {
        return { success: true, alreadyCompleted: true, withdrawal };
      }

      if (withdrawal.status !== "REQUESTED" && withdrawal.status !== "PROCESSING") {
        throw new Error(`Cannot complete withdrawal with status: ${withdrawal.status}`);
      }

      // Update withdrawal
      const updatedWithdrawal = await prismaTx.withdrawal.update({
        where: { id: withdrawalId },
        data: {
          status: "COMPLETED",
          providerReference: providerReference || withdrawal.providerReference,
        },
      });

      // Update ledger transaction status
      const reference = `withdrawal_req:${withdrawalId}`;
      await prismaTx.ledgerTransaction.updateMany({
        where: { reference },
        data: { status: "COMPLETED" },
      });

      // Update wallet pending balance and lifetimeWithdrawn
      const updatedWallet = await prismaTx.wallet.update({
        where: { id: withdrawal.walletId },
        data: {
          pendingBalance: {
            decrement: withdrawal.amount,
          },
          lifetimeWithdrawn: {
            increment: withdrawal.amount,
          },
        },
      });

      return {
        success: true,
        alreadyCompleted: false,
        withdrawal: updatedWithdrawal,
        wallet: updatedWallet,
      };
    };

    if (tx) {
      return run(tx);
    } else {
      return defaultPrisma.$transaction(run);
    }
  }

  /**
   * Settle a failed or rejected withdrawal.
   * Atomically returns reserved funds back to the user's available balance,
   * creates an immutable reversal ledger entry, and marks withdrawal as FAILED or CANCELLED.
   */
  static async failWithdrawal(params: {
    withdrawalId: string;
    reason: string;
    newStatus?: "FAILED" | "CANCELLED";
    tx?: TransactionClient;
  }) {
    const { withdrawalId, reason, newStatus = "FAILED", tx } = params;

    const run = async (prismaTx: TransactionClient) => {
      const withdrawal = await prismaTx.withdrawal.findUnique({
        where: { id: withdrawalId },
      });

      if (!withdrawal) {
        throw new Error("Withdrawal not found");
      }

      if (withdrawal.status === "FAILED" || withdrawal.status === "CANCELLED") {
        return { success: true, alreadyHandled: true, withdrawal };
      }

      if (withdrawal.status === "COMPLETED") {
        throw new Error("Cannot reverse a withdrawal that has already completed successfully");
      }

      // Mark withdrawal as failed/cancelled
      const updatedWithdrawal = await prismaTx.withdrawal.update({
        where: { id: withdrawalId },
        data: { status: newStatus },
      });

      // Update original pending ledger entry
      const originalRef = `withdrawal_req:${withdrawalId}`;
      await prismaTx.ledgerTransaction.updateMany({
        where: { reference: originalRef },
        data: { status: "FAILED" },
      });

      // Create immutable reversal ledger entry
      const reversalRef = `withdrawal_rev:${withdrawalId}`;
      const reversalEntry = await prismaTx.ledgerTransaction.create({
        data: {
          walletId: withdrawal.walletId,
          transactionType: "WITHDRAWAL_REVERSAL",
          amount: withdrawal.amount,
          currency: withdrawal.currency,
          direction: "CREDIT",
          reference: reversalRef,
          description: `Reversal of failed withdrawal #${withdrawal.id.slice(0, 8)}: ${reason}`,
          status: "COMPLETED",
          metadata: {
            withdrawalId,
            reason,
          },
        },
      });

      // Release reserved funds: reduce pendingBalance, return to availableBalance
      const updatedWallet = await prismaTx.wallet.update({
        where: { id: withdrawal.walletId },
        data: {
          pendingBalance: {
            decrement: withdrawal.amount,
          },
          availableBalance: {
            increment: withdrawal.amount,
          },
        },
      });

      return {
        success: true,
        alreadyHandled: false,
        withdrawal: updatedWithdrawal,
        reversalEntry,
        wallet: updatedWallet,
      };
    };

    if (tx) {
      return run(tx);
    } else {
      return defaultPrisma.$transaction(run);
    }
  }

  /**
   * Get user wallet with recent transactions.
   */
  static async getUserWalletWithTransactions(userId: string, limit: number = 20) {
    const wallet = await this.getOrCreateWallet(userId);

    const transactions = await defaultPrisma.ledgerTransaction.findMany({
      where: { walletId: wallet.id },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    const withdrawals = await defaultPrisma.withdrawal.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    return {
      wallet,
      transactions,
      withdrawals,
    };
  }
}

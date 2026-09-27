import { describe, it, expect, vi } from "vitest";
import { Prisma } from "@prisma/client";
import { LedgerService, TransactionClient } from "@/lib/ledger/service";

describe("Critical Financial Ledger & Transaction Invariance Tests", () => {
  it("prevents double credit for identical task submission reference", async () => {
    const existingTx = {
      id: "tx-123",
      walletId: "wallet-123",
      transactionType: "TASK_REWARD",
      amount: new Prisma.Decimal("0.50"),
      reference: "task_reward:sub-dup-check",
      status: "COMPLETED",
    };

    const mockTxClient = {
      ledgerTransaction: {
        findUnique: vi.fn().mockResolvedValue(existingTx),
        create: vi.fn(),
      },
      wallet: {
        update: vi.fn(),
      },
      workerProfile: {
        updateMany: vi.fn(),
      },
    } as unknown as TransactionClient;

    const result = await LedgerService.creditWorkerForTask({
      submissionId: "sub-dup-check",
      workerUserId: "user-123",
      rewardAmount: 0.50,
      taskId: "task-1",
      taskTitle: "Verify Shop",
      tx: mockTxClient,
    });

    expect(result.alreadyProcessed).toBe(true);
    expect(mockTxClient.ledgerTransaction.create).not.toHaveBeenCalled();
    expect(mockTxClient.wallet.update).not.toHaveBeenCalled();
  });

  it("throws error and prevents negative balance if withdrawal exceeds available funds", async () => {
    const mockTxClient = {
      wallet: {
        findUnique: vi.fn().mockResolvedValue({
          id: "wallet-1",
          userId: "user-1",
          availableBalance: new Prisma.Decimal("5.00"),
        }),
      },
    } as unknown as TransactionClient;

    await expect(
      LedgerService.requestWithdrawal({
        userId: "user-1",
        amount: 20.00, // Exceeds 5.00 available!
        method: "BANK",
        destination: { accountNumber: "123" },
        tx: mockTxClient,
      })
    ).rejects.toThrow("Insufficient available balance");
  });

  it("reverses reserved funds back into available balance when withdrawal fails", async () => {
    const mockWithdrawal = {
      id: "w-fail-test",
      walletId: "wallet-fail",
      userId: "user-fail",
      amount: new Prisma.Decimal("10.00"),
      currency: "USD",
      status: "REQUESTED",
    };

    const mockTxClient = {
      withdrawal: {
        findUnique: vi.fn().mockResolvedValue(mockWithdrawal),
        update: vi.fn().mockResolvedValue({ ...mockWithdrawal, status: "FAILED" }),
      },
      ledgerTransaction: {
        updateMany: vi.fn().mockResolvedValue({ count: 1 }),
        create: vi.fn().mockResolvedValue({ id: "reversal-tx" }),
      },
      wallet: {
        update: vi.fn().mockResolvedValue({
          id: "wallet-fail",
          availableBalance: new Prisma.Decimal("15.00"),
          pendingBalance: new Prisma.Decimal("0.00"),
        }),
      },
    } as unknown as TransactionClient;

    const result = await LedgerService.failWithdrawal({
      withdrawalId: "w-fail-test",
      reason: "Account number rejected by bank",
      tx: mockTxClient,
    });

    expect(result.success).toBe(true);
    expect(mockTxClient.withdrawal.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { status: "FAILED" } })
    );
    expect(mockTxClient.wallet.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          pendingBalance: { decrement: mockWithdrawal.amount },
          availableBalance: { increment: mockWithdrawal.amount },
        }),
      })
    );
  });

  it("uses exact decimal arithmetic for financial rewards", () => {
    const r1 = new Prisma.Decimal("0.15");
    const r2 = new Prisma.Decimal("0.35");
    const r3 = new Prisma.Decimal("1.20");

    const sum = r1.plus(r2).plus(r3);
    expect(sum.toString()).toBe("1.7");
    expect(sum.toFixed(2)).toBe("1.70");

    // Float error avoidance: 0.1 + 0.2 in JS float is 0.30000000000000004
    const d1 = new Prisma.Decimal("0.1");
    const d2 = new Prisma.Decimal("0.2");
    expect(d1.plus(d2).toString()).toBe("0.3");
  });
});

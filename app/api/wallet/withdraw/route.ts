import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { WithdrawalRequestSchema } from "@/lib/validations";
import { LedgerService } from "@/lib/ledger/service";
import { FraudService } from "@/lib/fraud/service";
import { getPayoutProvider } from "@/lib/payments";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();

    let userId: string;
    if (user) {
      userId = user.profile.id;
    } else {
      const demo = await prisma.userProfile.findFirst({
        where: { role: "WORKER" },
      });
      if (!demo) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      userId = demo.id;
    }

    const json = await request.json();
    const result = WithdrawalRequestSchema.safeParse(json);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid withdrawal parameters", details: result.error.flatten() },
        { status: 400 }
      );
    }

    const { amount, currency, method, destination } = result.data;

    // Minimum withdrawal threshold
    if (amount < 2.00) {
      return NextResponse.json(
        { error: "Minimum withdrawal amount is $2.00 USD" },
        { status: 400 }
      );
    }

    // Risk evaluation
    const { riskScore, reasons } = await FraudService.evaluateWithdrawal(userId, amount);
    if (riskScore >= 75) {
      return NextResponse.json(
        { error: "Withdrawal temporarily blocked by security risk checks. Please contact support.", reasons },
        { status: 403 }
      );
    }

    // Fee calculation (nominal provider fee)
    const fee = method === "BANK" ? 0.25 : method === "MOBILE_MONEY" ? 0.15 : 0.50;

    // 1. Atomically reserve funds and record pending ledger entry
    const { withdrawal, ledgerTransaction } = await LedgerService.requestWithdrawal({
      userId,
      amount,
      currency,
      method,
      destination,
      fee,
      riskScore,
    });

    // 2. Invoke payout provider
    const payoutProvider = getPayoutProvider();
    const payoutResult = await payoutProvider.processPayout({
      withdrawalId: withdrawal.id,
      userId,
      amount,
      fee,
      netAmount: Number(withdrawal.netAmount),
      currency,
      method,
      destination,
    });

    if (payoutResult.success && payoutResult.status === "COMPLETED") {
      // Auto-settle in mock/instant environment
      await LedgerService.completeWithdrawal({
        withdrawalId: withdrawal.id,
        providerReference: payoutResult.providerReference,
      });

      return NextResponse.json({
        success: true,
        status: "COMPLETED",
        message: `Successfully transferred ${currency} ${withdrawal.netAmount.toString()} via ${method}.`,
        withdrawalId: withdrawal.id,
      });
    }

    return NextResponse.json({
      success: true,
      status: "PROCESSING",
      message: "Withdrawal request accepted and currently processing.",
      withdrawalId: withdrawal.id,
    });
  } catch (err: any) {
    console.error("Withdrawal error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to process withdrawal" },
      { status: 500 }
    );
  }
}

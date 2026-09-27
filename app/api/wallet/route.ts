import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { LedgerService } from "@/lib/ledger/service";
import { prisma } from "@/lib/prisma";

export async function GET() {
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

    const data = await LedgerService.getUserWalletWithTransactions(userId, 30);

    return NextResponse.json({
      wallet: {
        id: data.wallet.id,
        currency: data.wallet.currency,
        availableBalance: Number(data.wallet.availableBalance),
        pendingBalance: Number(data.wallet.pendingBalance),
        lifetimeEarned: Number(data.wallet.lifetimeEarned),
        lifetimeWithdrawn: Number(data.wallet.lifetimeWithdrawn),
      },
      transactions: data.transactions.map((tx) => ({
        id: tx.id,
        transactionType: tx.transactionType,
        amount: Number(tx.amount),
        currency: tx.currency,
        direction: tx.direction,
        reference: tx.reference,
        description: tx.description,
        status: tx.status,
        createdAt: tx.createdAt,
      })),
      withdrawals: data.withdrawals.map((w) => ({
        id: w.id,
        amount: Number(w.amount),
        fee: Number(w.fee),
        netAmount: Number(w.netAmount),
        currency: w.currency,
        method: w.method,
        status: w.status,
        createdAt: w.createdAt,
      })),
    });
  } catch (err: any) {
    console.error("Wallet API error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to load wallet data" },
      { status: 500 }
    );
  }
}

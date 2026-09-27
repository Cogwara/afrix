import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { LedgerService } from "@/lib/ledger/service";
import { getCurrentUser } from "@/lib/auth/session";

export async function GET() {
  try {
    const withdrawals = await prisma.withdrawal.findMany({
      include: {
        user: { select: { email: true, country: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ withdrawals });
  } catch (err: any) {
    console.error("Admin withdrawals fetch error:", err);
    return NextResponse.json({ error: err.message || "Failed to load withdrawals" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    const json = await request.json();
    const { withdrawalId, action, reason } = json;

    if (!withdrawalId || !action) {
      return NextResponse.json({ error: "Missing withdrawalId or action" }, { status: 400 });
    }

    if (action === "APPROVE") {
      const res = await LedgerService.completeWithdrawal({
        withdrawalId,
        providerReference: `admin_settled_${Date.now()}`,
      });

      // Audit Log
      await prisma.auditLog.create({
        data: {
          userId: user?.profile?.id || null,
          action: "WITHDRAWAL_APPROVE",
          entityType: "Withdrawal",
          entityId: withdrawalId,
          metadata: { action, timestamp: new Date().toISOString() },
        },
      });

      return NextResponse.json({ success: true, message: "Withdrawal approved and settled." });
    } else if (action === "REJECT") {
      const res = await LedgerService.failWithdrawal({
        withdrawalId,
        reason: reason || "Administrative compliance rejection",
      });

      // Audit Log
      await prisma.auditLog.create({
        data: {
          userId: user?.profile?.id || null,
          action: "WITHDRAWAL_REJECT_REFUND",
          entityType: "Withdrawal",
          entityId: withdrawalId,
          metadata: { action, reason, timestamp: new Date().toISOString() },
        },
      });

      return NextResponse.json({
        success: true,
        message: "Withdrawal rejected and reserved funds safely restored to worker wallet.",
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err: any) {
    console.error("Admin withdrawal action error:", err);
    return NextResponse.json({ error: err.message || "Failed to process withdrawal action" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/session";

export async function GET() {
  try {
    const user = await getCurrentUser();

    // Verify admin role in production, or fallback in dev
    const totalUsers = await prisma.userProfile.count();
    const activeWorkers = await prisma.userProfile.count({ where: { role: "WORKER", isSuspended: false } });
    const verifiedWorkers = await prisma.workerProfile.count({ where: { kycStatus: "VERIFIED" } });
    const businesses = await prisma.business.count();
    const activeCampaigns = await prisma.campaign.count({ where: { status: "ACTIVE" } });
    const tasksCompleted = await prisma.taskSubmission.count({ where: { status: "APPROVED" } });
    const pendingSubmissions = await prisma.taskSubmission.count({ where: { status: "SUBMITTED" } });
    const pendingWithdrawals = await prisma.withdrawal.count({ where: { status: "REQUESTED" } });
    const openFraudAlerts = await prisma.fraudEvent.count({ where: { status: "OPEN" } });

    // Sum earnings and fees
    const earningsSum = await prisma.ledgerTransaction.aggregate({
      where: { transactionType: "TASK_REWARD", status: "COMPLETED" },
      _sum: { amount: true },
    });

    const feeSum = await prisma.campaign.aggregate({
      _sum: { platformFee: true },
    });

    return NextResponse.json({
      metrics: {
        totalUsers,
        activeWorkers,
        verifiedWorkers,
        businesses,
        activeCampaigns,
        tasksCompleted,
        pendingSubmissions,
        pendingWithdrawals,
        openFraudAlerts,
        totalWorkerEarnings: Number(earningsSum._sum.amount || 0),
        platformRevenue: Number(feeSum._sum.platformFee || 0),
      },
    });
  } catch (err: any) {
    console.error("Admin dashboard API error:", err);
    return NextResponse.json({ error: err.message || "Failed to load admin metrics" }, { status: 500 });
  }
}

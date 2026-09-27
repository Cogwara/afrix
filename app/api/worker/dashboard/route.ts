import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { LedgerService } from "@/lib/ledger/service";
import { ReputationService } from "@/lib/reputation/service";

export async function GET() {
  try {
    const user = await getCurrentUser();

    // If unauthenticated, return demo worker data for preview
    let workerUserId: string;
    let workerProfileRecord = null;
    let walletRecord = null;

    if (user) {
      workerUserId = user.profile.id;
      workerProfileRecord = await prisma.workerProfile.findUnique({
        where: { userId: workerUserId },
      });
      walletRecord = await LedgerService.getOrCreateWallet(workerUserId);
    } else {
      // Find first seeded demo worker
      const demoWorker = await prisma.userProfile.findFirst({
        where: { role: "WORKER" },
        include: { workerProfile: true, wallet: true },
      });

      if (demoWorker) {
        workerUserId = demoWorker.id;
        workerProfileRecord = demoWorker.workerProfile;
        walletRecord = demoWorker.wallet;
      } else {
        // Fallback mock
        return NextResponse.json({
          availableBalance: 48.50,
          pendingBalance: 3.20,
          lifetimeEarned: 142.50,
          tasksCompleted: 78,
          levelInfo: { level: 3, name: "Verified", minXP: 2500, nextLevelXP: 10000, progressPercent: 32 },
          xp: 3200,
          reputationScore: 98.5,
          accuracyScore: 97.2,
          completionScore: 99.0,
          todayEarnings: 2.45,
          dailyTarget: 5.00,
          recommendedTasks: [],
          missions: [],
        });
      }
    }

    const xp = workerProfileRecord ? workerProfileRecord.xp : 0;
    const levelInfo = ReputationService.getLevelInfo(xp);

    // Calculate today's earnings from ledger
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const todayEarningsAgg = walletRecord
      ? await prisma.ledgerTransaction.aggregate({
          where: {
            walletId: walletRecord.id,
            transactionType: "TASK_REWARD",
            createdAt: { gte: startOfToday },
          },
          _sum: { amount: true },
        })
      : { _sum: { amount: null } };

    const todayEarnings = todayEarningsAgg._sum.amount
      ? Number(todayEarningsAgg._sum.amount)
      : 0;

    // Recommended tasks
    const recommendedTasks = await prisma.task.findMany({
      where: {
        status: "ACTIVE",
        requiredLevel: { lte: levelInfo.level },
      },
      include: {
        category: true,
      },
      orderBy: { createdAt: "desc" },
      take: 4,
    });

    // Active missions with user progress
    const missions = await prisma.mission.findMany({
      where: { isActive: true },
      include: {
        progresses: {
          where: { userId: workerUserId },
        },
      },
      take: 3,
    });

    // Recent submissions
    const recentSubmissions = await prisma.taskSubmission.findMany({
      where: { workerId: workerUserId },
      include: {
        task: {
          select: { title: true, currency: true, rewardAmount: true },
        },
      },
      orderBy: { submittedAt: "desc" },
      take: 5,
    });

    return NextResponse.json({
      availableBalance: walletRecord ? Number(walletRecord.availableBalance) : 0,
      pendingBalance: walletRecord ? Number(walletRecord.pendingBalance) : 0,
      lifetimeEarned: walletRecord ? Number(walletRecord.lifetimeEarned) : 0,
      tasksCompleted: workerProfileRecord ? workerProfileRecord.tasksCompleted : 0,
      tasksRejected: workerProfileRecord ? workerProfileRecord.tasksRejected : 0,
      xp,
      levelInfo,
      reputationScore: workerProfileRecord ? Number(workerProfileRecord.reputationScore) : 100,
      accuracyScore: workerProfileRecord ? Number(workerProfileRecord.accuracyScore) : 100,
      completionScore: workerProfileRecord ? Number(workerProfileRecord.completionScore) : 100,
      reliabilityScore: workerProfileRecord ? Number(workerProfileRecord.reliabilityScore) : 100,
      todayEarnings,
      dailyTarget: 5.00,
      recommendedTasks,
      missions,
      recentSubmissions,
    });
  } catch (err: any) {
    console.error("Worker dashboard API error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}

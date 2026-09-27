import { Prisma } from "@prisma/client";
import { prisma } from "../prisma";

export interface LevelInfo {
  level: number;
  name: string;
  minXP: number;
  nextLevelXP: number;
  progressPercent: number;
}

export const WORKER_LEVELS = [
  { level: 1, name: "Newbie", minXP: 0 },
  { level: 2, name: "Worker", minXP: 500 },
  { level: 3, name: "Verified", minXP: 2500 },
  { level: 4, name: "Trusted", minXP: 10000 },
  { level: 5, name: "Pro", minXP: 50000 },
] as const;

export class ReputationService {
  /**
   * Determine worker level from XP
   */
  static getLevelInfo(xp: number): LevelInfo {
    const safeXp = Math.max(0, xp);
    let currentLevel: (typeof WORKER_LEVELS)[number] = WORKER_LEVELS[0];
    let nextLevel: (typeof WORKER_LEVELS)[number] = WORKER_LEVELS[1];

    for (let i = WORKER_LEVELS.length - 1; i >= 0; i--) {
      if (safeXp >= WORKER_LEVELS[i].minXP) {
        currentLevel = WORKER_LEVELS[i];
        nextLevel = WORKER_LEVELS[i + 1] || WORKER_LEVELS[i];
        break;
      }
    }

    if (currentLevel.level === 5) {
      return {
        level: 5,
        name: "Pro",
        minXP: 50000,
        nextLevelXP: 50000,
        progressPercent: 100,
      };
    }

    const range = nextLevel.minXP - currentLevel.minXP;
    const gained = safeXp - currentLevel.minXP;
    const progressPercent = Math.min(100, Math.max(0, Math.round((gained / range) * 100)));

    return {
      level: currentLevel.level,
      name: currentLevel.name,
      minXP: currentLevel.minXP,
      nextLevelXP: nextLevel.minXP,
      progressPercent,
    };
  }

  /**
   * Calculate overall reputation score (0 - 100)
   * Formula:
   * Accuracy: 40%
   * Completion Rate: 20%
   * Reliability: 20%
   * Task Quality: 10%
   * Fraud History penalty: 10%
   */
  static calculateReputation({
    accuracy = 100,
    completionRate = 100,
    reliability = 100,
    taskQuality = 100,
    fraudScore = 0,
  }: {
    accuracy?: number;
    completionRate?: number;
    reliability?: number;
    taskQuality?: number;
    fraudScore?: number;
  }): number {
    const accPart = (accuracy * 0.40);
    const compPart = (completionRate * 0.20);
    const relPart = (reliability * 0.20);
    const qualPart = (taskQuality * 0.10);
    const fraudPenalty = Math.max(0, 10 - (fraudScore * 0.10));

    const total = accPart + compPart + relPart + qualPart + fraudPenalty;
    return Math.max(0, Math.min(100, Math.round(total * 10) / 10));
  }

  /**
   * Award XP to a user and auto-update worker level if threshold reached
   */
  static async awardXP(
    userId: string,
    amount: number,
    reason: string,
    reference?: string
  ) {
    if (amount <= 0) return;

    return prisma.$transaction(async (tx) => {
      // Record XP transaction
      const xpTx = await tx.xPTransaction.create({
        data: {
          userId,
          amount,
          reason,
          reference,
        },
      });

      // Update worker profile
      const worker = await tx.workerProfile.findUnique({
        where: { userId },
      });

      if (worker) {
        const newXP = worker.xp + amount;
        const levelInfo = this.getLevelInfo(newXP);

        await tx.workerProfile.update({
          where: { userId },
          data: {
            xp: newXP,
            level: levelInfo.level,
          },
        });
      }

      return xpTx;
    });
  }

  /**
   * Recalculate worker scores based on submission history
   */
  static async recalculateWorkerScores(userId: string) {
    const submissions = await prisma.taskSubmission.findMany({
      where: { workerId: userId },
      select: {
        status: true,
        qualityScore: true,
      },
    });

    const total = submissions.length;
    if (total === 0) return;

    const approved = submissions.filter((s) => s.status === "APPROVED").length;
    const rejected = submissions.filter((s) => s.status === "REJECTED").length;

    // Accuracy = approved / (approved + rejected)
    const reviewedCount = approved + rejected;
    const accuracy = reviewedCount > 0 ? (approved / reviewedCount) * 100 : 100;

    // Completion rate = approved / total started
    const completionRate = total > 0 ? (approved / total) * 100 : 100;

    // Task quality average
    const scores = submissions
      .map((s) => (s.qualityScore ? Number(s.qualityScore) : null))
      .filter((s): s is number => s !== null);
    const avgQuality = scores.length > 0
      ? (scores.reduce((a, b) => a + b, 0) / scores.length) * 10
      : 100;

    const worker = await prisma.workerProfile.findUnique({ where: { userId } });
    const fraudScore = worker ? Number(worker.fraudScore) : 0;

    const reputationScore = this.calculateReputation({
      accuracy,
      completionRate,
      reliability: 100 - (rejected * 2),
      taskQuality: avgQuality,
      fraudScore,
    });

    await prisma.workerProfile.update({
      where: { userId },
      data: {
        accuracyScore: new Prisma.Decimal(accuracy.toFixed(2)),
        completionScore: new Prisma.Decimal(completionRate.toFixed(2)),
        reputationScore: new Prisma.Decimal(reputationScore.toFixed(2)),
      },
    });
  }
}

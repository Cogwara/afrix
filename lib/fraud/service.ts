import { Prisma } from "@prisma/client";
import { prisma } from "../prisma";

export interface FraudCheckParams {
  userId: string;
  submissionId?: string;
  deviceFingerprint?: string;
  startedAt?: Date;
  submittedAt?: Date;
  ipAddress?: string;
  answers?: Record<string, unknown>;
  latitude?: number;
  longitude?: number;
}

export interface FraudCheckResult {
  riskScore: number;
  action: "ALLOW" | "CHALLENGE" | "REQUIRE_REVIEW" | "RESTRICT" | "BLOCK";
  reasons: string[];
}

export class FraudService {
  /**
   * Evaluate a task submission for fraud signals
   */
  static async evaluateSubmission(params: FraudCheckParams): Promise<FraudCheckResult> {
    const { userId, submissionId, deviceFingerprint, startedAt, submittedAt, answers } = params;
    let score = 0;
    const reasons: string[] = [];

    // 1. Completion time check (impossible speed)
    if (startedAt && submittedAt) {
      const durationSeconds = (new Date(submittedAt).getTime() - new Date(startedAt).getTime()) / 1000;
      if (durationSeconds < 3) {
        score += 45;
        reasons.push("Impossible completion speed (< 3 seconds)");
      } else if (durationSeconds < 10) {
        score += 20;
        reasons.push("Unusually fast completion (< 10 seconds)");
      }
    }

    // 2. Device reuse check
    if (deviceFingerprint) {
      const deviceUsers = await prisma.taskSubmission.groupBy({
        by: ["workerId"],
        where: {
          deviceFingerprint,
          workerId: { not: userId },
        },
      });

      if (deviceUsers.length >= 3) {
        score += 50;
        reasons.push(`Device fingerprint used across ${deviceUsers.length + 1} different worker accounts`);
      } else if (deviceUsers.length >= 1) {
        score += 25;
        reasons.push("Device fingerprint previously detected on another account");
      }
    }

    // 3. Repeated answers check
    if (answers && typeof answers === "object") {
      const answerValues = Object.values(answers).map((v) => String(v).toLowerCase().trim());
      const uniqueValues = new Set(answerValues);
      if (answerValues.length >= 4 && uniqueValues.size === 1) {
        score += 25;
        reasons.push("Identical repetitive answer given for all fields");
      }
    }

    // Determine recommended action
    let action: FraudCheckResult["action"] = "ALLOW";
    if (score >= 90) {
      action = "BLOCK";
    } else if (score >= 80) {
      action = "RESTRICT";
    } else if (score >= 60) {
      action = "REQUIRE_REVIEW";
    } else if (score >= 30) {
      action = "CHALLENGE";
    }

    // If high risk and DB is connected, record a FraudEvent
    if (score >= 30 && process.env.DATABASE_URL) {
      try {
        await prisma.fraudEvent.create({
          data: {
            userId,
            submissionId,
            eventType: score >= 50 ? "DEVICE_REUSE" : "IMPOSSIBLE_SPEED",
            riskScore: new Prisma.Decimal(score),
            details: {
              reasons,
              deviceFingerprint,
              timestamp: new Date().toISOString(),
            },
            status: score >= 80 ? "OPEN" : "REVIEWING",
          },
        });

        // Update worker's aggregate fraud score
        await prisma.workerProfile.updateMany({
          where: { userId },
          data: {
            fraudScore: new Prisma.Decimal(Math.min(100, score)),
          },
        });
      } catch (e) {
        console.warn("FraudEvent logging skipped in mock/test environment:", e);
      }
    }

    return {
      riskScore: score,
      action,
      reasons,
    };
  }

  /**
   * Check withdrawal request for velocity or anomaly
   */
  static async evaluateWithdrawal(userId: string, amount: number): Promise<{ riskScore: number; reasons: string[] }> {
    let score = 0;
    const reasons: string[] = [];

    // Check recent withdrawals in last 24h
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentWithdrawals = await prisma.withdrawal.findMany({
      where: {
        userId,
        createdAt: { gte: oneDayAgo },
      },
    });

    if (recentWithdrawals.length >= 3) {
      score += 35;
      reasons.push(`High velocity: ${recentWithdrawals.length} withdrawal requests in last 24 hours`);
    }

    // Check worker profile reputation
    const worker = await prisma.workerProfile.findUnique({ where: { userId } });
    if (worker && Number(worker.fraudScore) > 40) {
      score += 30;
      reasons.push("Worker account has active elevated fraud risk score");
    }

    if (amount > 500) {
      score += 15;
      reasons.push("Large single withdrawal amount requires standard compliance review");
    }

    return { riskScore: score, reasons };
  }
}

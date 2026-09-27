import { prisma } from "../prisma";
import { LedgerService } from "../ledger/service";

export const REFERRAL_QUALIFICATION_THRESHOLD = 3; // 3 completed legitimate tasks
export const REFERRAL_REWARD_USD = 0.50; // $0.50 legitimate bonus

export class ReferralService {
  /**
   * Check if a newly completed/approved task qualifies the referred worker,
   * and if qualified, automatically award the referrer.
   */
  static async checkAndProcessQualification(workerUserId: string) {
    // Find pending referral where this worker is the referred user
    const referral = await prisma.referral.findFirst({
      where: {
        referredUserId: workerUserId,
        status: { in: ["REGISTERED", "VERIFIED"] },
      },
      include: {
        referredUser: true,
        referrer: true,
      },
    });

    if (!referral) return null;

    // Check worker's approved tasks count
    const approvedTasksCount = await prisma.taskSubmission.count({
      where: {
        workerId: workerUserId,
        status: "APPROVED",
      },
    });

    // Check fraud score
    const workerProfile = await prisma.workerProfile.findUnique({
      where: { userId: workerUserId },
    });

    const isFraudulent = workerProfile && Number(workerProfile.fraudScore) >= 40;

    if (isFraudulent) {
      await prisma.referral.update({
        where: { id: referral.id },
        data: { status: "BLOCKED" },
      });
      return { status: "BLOCKED", reason: "Fraud risk detected on referred account" };
    }

    if (approvedTasksCount >= REFERRAL_QUALIFICATION_THRESHOLD) {
      // Qualify referral!
      await prisma.referral.update({
        where: { id: referral.id },
        data: {
          status: "QUALIFIED",
          qualifiedAt: new Date(),
        },
      });

      // Credit the referrer using our immutable ledger service
      const creditResult = await LedgerService.creditReferralBonus({
        referralId: referral.id,
        referrerUserId: referral.referrerId,
        rewardAmount: REFERRAL_REWARD_USD,
        currency: "USD",
        referredUserEmail: referral.referredUser.email,
      });

      return {
        status: "REWARDED",
        creditResult,
      };
    }

    return {
      status: referral.status,
      tasksRemaining: Math.max(0, REFERRAL_QUALIFICATION_THRESHOLD - approvedTasksCount),
    };
  }
}

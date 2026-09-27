import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ReviewSubmissionSchema } from "@/lib/validations";
import { LedgerService } from "@/lib/ledger/service";
import { ReputationService } from "@/lib/reputation/service";
import { ReferralService } from "@/lib/referrals/service";
import { getCurrentUser } from "@/lib/auth/session";
import { Prisma } from "@prisma/client";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: campaignId } = await params;

    const submissions = await prisma.taskSubmission.findMany({
      where: {
        task: { campaignId },
      },
      include: {
        worker: {
          select: { email: true, country: true },
        },
        task: {
          select: { title: true, rewardAmount: true, currency: true },
        },
        reviews: true,
      },
      orderBy: { submittedAt: "desc" },
    });

    return NextResponse.json({ submissions });
  } catch (err: any) {
    console.error("Fetch campaign submissions error:", err);
    return NextResponse.json({ error: err.message || "Failed to load submissions" }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    const reviewerId = user?.profile?.id || null;

    const json = await request.json();
    const parsed = ReviewSubmissionSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid review parameters", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { submissionId, decision, score = 10, notes } = parsed.data;

    const submission = await prisma.taskSubmission.findUnique({
      where: { id: submissionId },
      include: {
        task: { include: { campaign: true } },
      },
    });

    if (!submission) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 });
    }

    if (submission.status === "APPROVED") {
      return NextResponse.json({ error: "Submission has already been approved" }, { status: 400 });
    }

    // In a transaction, record review decision and update submission
    const result = await prisma.$transaction(async (tx) => {
      // Create Review record
      await tx.submissionReview.create({
        data: {
          submissionId,
          reviewerId,
          reviewType: "MANUAL",
          decision,
          score: new Prisma.Decimal(score),
          notes: notes || null,
        },
      });

      // Update TaskSubmission
      const updatedSubmission = await tx.taskSubmission.update({
        where: { id: submissionId },
        data: {
          status: decision,
          qualityScore: new Prisma.Decimal(score),
          reviewNotes: notes || null,
          reviewedAt: new Date(),
        },
      });

      if (decision === "APPROVED") {
        // Update Campaign stats
        await tx.campaign.update({
          where: { id: submission.task.campaignId },
          data: {
            approvedTasks: { increment: 1 },
            completedTasks: { increment: 1 },
            amountSpent: { increment: submission.task.rewardAmount },
          },
        });
      } else if (decision === "REJECTED") {
        await tx.campaign.update({
          where: { id: submission.task.campaignId },
          data: {
            rejectedTasks: { increment: 1 },
          },
        });

        await tx.workerProfile.updateMany({
          where: { userId: submission.workerId },
          data: {
            tasksRejected: { increment: 1 },
          },
        });
      }

      return updatedSubmission;
    });

    // If APPROVED, trigger atomic ledger credit to worker wallet!
    if (decision === "APPROVED") {
      await LedgerService.creditWorkerForTask({
        submissionId: submission.id,
        workerUserId: submission.workerId,
        rewardAmount: submission.task.rewardAmount,
        currency: submission.task.currency,
        taskId: submission.taskId,
        taskTitle: submission.task.title,
      });

      // Award XP
      await ReputationService.awardXP(
        submission.workerId,
        50,
        `Approved task: ${submission.task.title}`,
        submission.id
      );

      // Check referral qualification
      await ReferralService.checkAndProcessQualification(submission.workerId);

      // Recalculate reputation scores
      await ReputationService.recalculateWorkerScores(submission.workerId);
    }

    return NextResponse.json({
      success: true,
      decision,
      submissionId,
      message: `Submission ${decision.toLowerCase()} successfully.`,
    });
  } catch (err: any) {
    console.error("Submission review error:", err);
    return NextResponse.json({ error: err.message || "Failed to process review" }, { status: 500 });
  }
}

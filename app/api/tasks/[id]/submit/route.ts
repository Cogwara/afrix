import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { SubmitTaskSchema } from "@/lib/validations";
import { FraudService } from "@/lib/fraud/service";
import { LedgerService } from "@/lib/ledger/service";
import { ReputationService } from "@/lib/reputation/service";
import { ReferralService } from "@/lib/referrals/service";
import { Prisma } from "@prisma/client";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: taskId } = await params;
    const user = await getCurrentUser();

    // In dev demo mode, if not authenticated, find demo worker
    let workerUserId: string;
    if (user) {
      workerUserId = user.profile.id;
    } else {
      const demo = await prisma.userProfile.findFirst({
        where: { role: "WORKER" },
      });
      if (!demo) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      workerUserId = demo.id;
    }

    const json = await request.json();
    const parsed = SubmitTaskSchema.safeParse({ ...json, taskId });

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { answers, evidence, latitude, longitude, deviceFingerprint, startedAt } = parsed.data;

    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: { questions: true },
    });

    if (!task || task.status !== "ACTIVE") {
      return NextResponse.json({ error: "Task is not active or not found" }, { status: 404 });
    }

    if (task.completedSubmissions >= task.maxSubmissions) {
      return NextResponse.json({ error: "Task has already reached its maximum submission quota" }, { status: 400 });
    }

    // Evaluate fraud signals
    const submittedAt = new Date();
    const fraudEvaluation = await FraudService.evaluateSubmission({
      userId: workerUserId,
      deviceFingerprint,
      startedAt: startedAt ? new Date(startedAt) : new Date(Date.now() - 30000),
      submittedAt,
      answers,
      latitude,
      longitude,
    });

    if (fraudEvaluation.action === "BLOCK") {
      return NextResponse.json(
        { error: "Submission blocked due to severe policy/automation violation." },
        { status: 403 }
      );
    }

    const isAutoApprovable =
      task.validationType === "AUTOMATIC" &&
      fraudEvaluation.action === "ALLOW";

    const initialStatus = isAutoApprovable
      ? "APPROVED"
      : fraudEvaluation.action === "CHALLENGE" || fraudEvaluation.action === "REQUIRE_REVIEW"
      ? "FLAGGED"
      : "SUBMITTED";

    // Create submission record
    const submission = await prisma.taskSubmission.create({
      data: {
        taskId,
        workerId: workerUserId,
        answers: answers as unknown as Prisma.InputJsonValue,
        evidence: evidence as unknown as Prisma.InputJsonValue,
        latitude: latitude ? new Prisma.Decimal(latitude) : null,
        longitude: longitude ? new Prisma.Decimal(longitude) : null,
        deviceFingerprint: deviceFingerprint || null,
        startedAt: startedAt ? new Date(startedAt) : new Date(Date.now() - 30000),
        submittedAt,
        status: initialStatus,
        rewardAmount: task.rewardAmount,
        reviewedAt: isAutoApprovable ? new Date() : null,
        qualityScore: isAutoApprovable ? new Prisma.Decimal(10.0) : null,
      },
    });

    // Increment completed submissions on task
    await prisma.task.update({
      where: { id: taskId },
      data: { completedSubmissions: { increment: 1 } },
    });

    // If auto-approved, trigger immutable financial ledger credit & rewards!
    if (isAutoApprovable) {
      await LedgerService.creditWorkerForTask({
        submissionId: submission.id,
        workerUserId,
        rewardAmount: task.rewardAmount,
        currency: task.currency,
        taskId: task.id,
        taskTitle: task.title,
      });

      // Award XP
      await ReputationService.awardXP(workerUserId, 50, `Completed task: ${task.title}`, submission.id);

      // Check if this qualifies worker's referrer
      await ReferralService.checkAndProcessQualification(workerUserId);

      // Recalculate reputation
      await ReputationService.recalculateWorkerScores(workerUserId);
    }

    return NextResponse.json({
      success: true,
      submissionId: submission.id,
      status: submission.status,
      autoApproved: isAutoApprovable,
      rewardAmount: isAutoApprovable ? task.rewardAmount.toString() : null,
      message: isAutoApprovable
        ? `Task approved! $${task.rewardAmount.toString()} credited to your wallet.`
        : "Submission received. You will be notified once reviewed.",
    });
  } catch (err: any) {
    console.error("Task submission error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to process task submission" },
      { status: 500 }
    );
  }
}

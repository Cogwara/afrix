import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { CreateCampaignSchema } from "@/lib/validations";
import { Prisma } from "@prisma/client";

export async function GET() {
  try {
    const user = await getCurrentUser();

    let businessId: string;
    if (user?.business) {
      businessId = user.business.id;
    } else {
      const demoBiz = await prisma.business.findFirst();
      if (!demoBiz) return NextResponse.json({ campaigns: [] });
      businessId = demoBiz.id;
    }

    const campaigns = await prisma.campaign.findMany({
      where: { businessId },
      include: {
        category: true,
        tasks: {
          select: { id: true, title: true, rewardAmount: true, completedSubmissions: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ campaigns });
  } catch (err: any) {
    console.error("Business campaigns fetch error:", err);
    return NextResponse.json({ error: err.message || "Failed to load campaigns" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();

    let businessId: string;
    if (user?.business) {
      businessId = user.business.id;
    } else {
      const demoBiz = await prisma.business.findFirst();
      if (!demoBiz) return NextResponse.json({ error: "No business found" }, { status: 400 });
      businessId = demoBiz.id;
    }

    const json = await request.json();
    const parsed = CreateCampaignSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const taskBudget = data.rewardPerTask * data.maxSubmissions;
    const platformFee = taskBudget * 0.10; // 10% platform fee
    const totalRequiredBudget = taskBudget + platformFee;

    const campaign = await prisma.$transaction(async (tx) => {
      // Create Campaign
      const newCampaign = await tx.campaign.create({
        data: {
          businessId,
          name: data.name,
          description: data.description,
          categoryId: data.categoryId,
          country: data.country,
          totalTasks: data.maxSubmissions,
          budget: new Prisma.Decimal(totalRequiredBudget),
          amountReserved: new Prisma.Decimal(taskBudget),
          platformFee: new Prisma.Decimal(platformFee),
          status: "ACTIVE",
          startDate: new Date(),
        },
      });

      // Create primary Task
      const newTask = await tx.task.create({
        data: {
          campaignId: newCampaign.id,
          categoryId: data.categoryId,
          title: data.taskTitle,
          description: data.description,
          instructions: data.taskInstructions,
          rewardAmount: new Prisma.Decimal(data.rewardPerTask),
          currency: "USD",
          maxSubmissions: data.maxSubmissions,
          requiredLevel: data.requiredLevel,
          requiresPhoto: data.requiresPhoto,
          requiresAudio: data.requiresAudio,
          requiresVideo: data.requiresVideo,
          requiresLocation: data.requiresLocation,
          validationType: data.validationType,
          status: "ACTIVE",
        },
      });

      // Create Questions
      if (data.questions && data.questions.length > 0) {
        await tx.taskQuestion.createMany({
          data: data.questions.map((q, idx) => ({
            taskId: newTask.id,
            question: q.question,
            questionType: q.questionType,
            options: q.options ? (q.options as unknown as Prisma.InputJsonValue) : undefined,
            isRequired: q.isRequired,
            sortOrder: idx + 1,
          })),
        });
      }

      return newCampaign;
    });

    return NextResponse.json({
      success: true,
      campaignId: campaign.id,
      message: "Campaign launched successfully!",
    });
  } catch (err: any) {
    console.error("Create campaign error:", err);
    return NextResponse.json({ error: err.message || "Failed to create campaign" }, { status: 500 });
  }
}

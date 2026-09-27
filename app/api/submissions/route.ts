import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/session";

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();

    let workerUserId: string;
    if (user) {
      workerUserId = user.profile.id;
    } else {
      const demo = await prisma.userProfile.findFirst({
        where: { role: "WORKER" },
      });
      if (!demo) {
        return NextResponse.json({ submissions: [] });
      }
      workerUserId = demo.id;
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const where: any = { workerId: workerUserId };
    if (status && status !== "ALL") {
      where.status = status;
    }

    const submissions = await prisma.taskSubmission.findMany({
      where,
      include: {
        task: {
          include: { category: true },
        },
        reviews: {
          take: 1,
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { submittedAt: "desc" },
    });

    return NextResponse.json({ submissions });
  } catch (err: any) {
    console.error("Worker submissions fetch error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to load submissions" },
      { status: 500 }
    );
  }
}

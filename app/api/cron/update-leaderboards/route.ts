import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ReputationService } from "@/lib/reputation/service";

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized cron trigger" }, { status: 401 });
    }

    // Recalculate top active workers scores
    const topWorkers = await prisma.workerProfile.findMany({
      take: 20,
      select: { userId: true },
    });

    for (const w of topWorkers) {
      await ReputationService.recalculateWorkerScores(w.userId);
    }

    return NextResponse.json({
      success: true,
      updatedWorkersCount: topWorkers.length,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error("Cron update leaderboards error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

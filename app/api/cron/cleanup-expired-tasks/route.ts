import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized cron trigger" }, { status: 401 });
    }

    const now = new Date();

    // Mark campaigns whose end dates have passed as COMPLETED
    const expired = await prisma.campaign.updateMany({
      where: {
        status: "ACTIVE",
        endDate: { lte: now },
      },
      data: { status: "COMPLETED" },
    });

    return NextResponse.json({
      success: true,
      completedCampaigns: expired.count,
      timestamp: now.toISOString(),
    });
  } catch (err: any) {
    console.error("Cron cleanup error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

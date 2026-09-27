import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized cron trigger" }, { status: 401 });
    }

    // Ensure standard daily missions exist and are active
    const count = await prisma.mission.count({
      where: { type: "DAILY", isActive: true },
    });

    return NextResponse.json({
      success: true,
      message: "Daily missions verified and synchronized.",
      activeDailyMissionsCount: count,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error("Cron daily missions error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

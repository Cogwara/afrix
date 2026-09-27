import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        category: true,
        campaign: {
          include: {
            business: {
              select: { name: true, verificationStatus: true, logo: true },
            },
          },
        },
        questions: {
          orderBy: { sortOrder: "asc" },
        },
      },
    });

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    return NextResponse.json({ task });
  } catch (err: any) {
    console.error("Task detail fetch error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to load task details" },
      { status: 500 }
    );
  }
}

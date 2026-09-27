import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const categorySlug = searchParams.get("category");
    const minLevel = searchParams.get("level") ? parseInt(searchParams.get("level")!) : undefined;
    const search = searchParams.get("q");

    const where: any = {
      status: "ACTIVE",
    };

    if (categorySlug && categorySlug !== "all") {
      where.category = { slug: categorySlug };
    }

    if (minLevel !== undefined) {
      where.requiredLevel = { lte: minLevel };
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    const tasks = await prisma.task.findMany({
      where,
      include: {
        category: true,
        campaign: {
          select: { name: true, business: { select: { name: true, verificationStatus: true } } },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const categories = await prisma.taskCategory.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ tasks, categories });
  } catch (err: any) {
    console.error("Tasks fetch error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to load tasks" },
      { status: 500 }
    );
  }
}

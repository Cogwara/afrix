import React from "react";
import Link from "next/link";
import {
  Briefcase,
  Search,
  Filter,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  DollarSign,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { prisma } from "@/lib/prisma";

export default async function TasksMarketplacePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string; level?: string }>;
}) {
  const params = await searchParams;
  const selectedCategory = params.category || "all";
  const searchQuery = params.q || "";

  const categories = await prisma.taskCategory.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
  });

  const where: any = {
    status: "ACTIVE",
  };

  if (selectedCategory && selectedCategory !== "all") {
    where.category = { slug: selectedCategory };
  }

  if (searchQuery) {
    where.OR = [
      { title: { contains: searchQuery, mode: "insensitive" } },
      { description: { contains: searchQuery, mode: "insensitive" } },
    ];
  }

  const tasks = await prisma.task.findMany({
    where,
    include: {
      category: true,
      campaign: {
        include: {
          business: { select: { name: true, verificationStatus: true } },
        },
      },
    },
    orderBy: { rewardAmount: "desc" },
  });

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8 space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
              Task Marketplace
            </h1>
            <Badge variant="default" className="text-xs">
              {tasks.length} Active Tasks
            </Badge>
          </div>
          <p className="text-xs text-slate-400">
            Pick a legitimate microtask, complete instructions on your phone, and receive instant ledger rewards.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/submissions">
            <Button size="sm" variant="outline" className="border-slate-700 text-xs">
              <CheckCircle2 className="mr-1.5 h-4 w-4 text-emerald-400" /> My Submissions
            </Button>
          </Link>
          <Link href="/wallet">
            <Button size="sm" variant="outline" className="border-slate-700 text-xs">
              <DollarSign className="mr-1.5 h-4 w-4 text-secondary" /> Wallet
            </Button>
          </Link>
        </div>
      </div>

      {/* Category Pills Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <Link
          href={`/tasks?category=all${searchQuery ? `&q=${searchQuery}` : ""}`}
          className={`whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
            selectedCategory === "all"
              ? "bg-primary text-white font-semibold"
              : "border border-slate-800 bg-[#12182D] text-slate-300 hover:text-white"
          }`}
        >
          All Categories
        </Link>
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/tasks?category=${cat.slug}${searchQuery ? `&q=${searchQuery}` : ""}`}
            className={`whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
              selectedCategory === cat.slug
                ? "bg-primary text-white font-semibold"
                : "border border-slate-800 bg-[#12182D] text-slate-300 hover:text-white"
            }`}
          >
            {cat.name}
          </Link>
        ))}
      </div>

      {/* Tasks Grid */}
      {tasks.length === 0 ? (
        <Card className="border-slate-800 bg-[#12182D] p-12 text-center space-y-3">
          <div className="mx-auto h-12 w-12 rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
            <Briefcase className="h-6 w-6" />
          </div>
          <h3 className="text-base font-semibold text-white">No tasks found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            There are currently no active tasks matching your criteria. Try switching categories or clearing search filters.
          </p>
          <Link href="/tasks">
            <Button size="sm" variant="outline" className="border-slate-700">
              Clear Filters
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {tasks.map((task) => (
            <Card
              key={task.id}
              className="border-slate-800 bg-[#12182D] hover:border-slate-700 transition-all flex flex-col justify-between p-5 group"
            >
              <div className="space-y-3">
                {/* Header tags */}
                <div className="flex items-center justify-between">
                  <Badge variant="default" className="text-[10px]">
                    {task.category.name}
                  </Badge>
                  <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                    <Clock className="h-3 w-3" /> ~3 mins
                  </span>
                </div>

                {/* Title & Description */}
                <div>
                  <h3 className="font-bold text-white text-base group-hover:text-primary transition-colors">
                    <Link href={`/tasks/${task.id}`}>{task.title}</Link>
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                    {task.description}
                  </p>
                </div>

                {/* Requirements badges */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <Badge variant="outline" className="text-[10px] text-slate-300 border-slate-700">
                    Min. Level {task.requiredLevel}
                  </Badge>
                  {task.requiresLocation && (
                    <Badge variant="outline" className="text-[10px] text-amber-400 border-amber-500/30">
                      GPS Required
                    </Badge>
                  )}
                  {task.requiresPhoto && (
                    <Badge variant="outline" className="text-[10px] text-blue-400 border-blue-500/30">
                      Photo Evidence
                    </Badge>
                  )}
                  {task.requiresAudio && (
                    <Badge variant="outline" className="text-[10px] text-purple-400 border-purple-500/30">
                      Audio Recording
                    </Badge>
                  )}
                </div>

                {/* Business Info */}
                <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
                  <span>By {task.campaign.business.name}</span>
                  {task.campaign.business.verificationStatus === "VERIFIED" && (
                    <ShieldCheck className="h-3.5 w-3.5 text-secondary shrink-0" />
                  )}
                </div>
              </div>

              {/* Reward & Start Action */}
              <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-800/80">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 block">Reward</span>
                  <span className="text-xl font-black text-emerald-400">
                    {formatCurrency(Number(task.rewardAmount))}
                  </span>
                </div>
                <Link href={`/tasks/${task.id}`}>
                  <Button size="sm" className="bg-primary hover:bg-primary/90 text-white font-semibold">
                    Start Task <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

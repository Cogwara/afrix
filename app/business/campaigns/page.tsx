import React from "react";
import Link from "next/link";
import { Plus, Layers, ArrowRight, ShieldCheck, Clock, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/session";

export default async function BusinessCampaignsListPage() {
  const user = await getCurrentUser();

  let businessId = user?.business?.id;
  if (!businessId) {
    const demo = await prisma.business.findFirst();
    if (demo) businessId = demo.id;
  }

  const campaigns = businessId
    ? await prisma.campaign.findMany({
        where: { businessId },
        include: {
          category: true,
          tasks: true,
        },
        orderBy: { createdAt: "desc" },
      })
    : [];

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
            Campaigns Management
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Monitor progress, inspect submissions, and review dataset output.
          </p>
        </div>

        <Link href="/business/campaigns/new">
          <Button size="sm" className="bg-secondary text-white font-semibold">
            <Plus className="mr-1.5 h-4 w-4" /> Create New Campaign
          </Button>
        </Link>
      </div>

      <div className="space-y-4">
        {campaigns.length === 0 ? (
          <Card className="border-slate-800 bg-[#12182D] p-12 text-center space-y-3">
            <h3 className="text-base font-semibold text-white">No campaigns found</h3>
            <p className="text-xs text-slate-400">Launch your first data collection campaign to get started.</p>
            <Link href="/business/campaigns/new">
              <Button size="sm" className="bg-secondary text-white">Launch Campaign</Button>
            </Link>
          </Card>
        ) : (
          campaigns.map((c) => {
            const percent = c.totalTasks > 0 ? Math.round((c.approvedTasks / c.totalTasks) * 100) : 0;
            return (
              <Card key={c.id} className="border-slate-800 bg-[#12182D] p-6 hover:border-slate-700 transition-colors">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-2 max-w-xl">
                    <div className="flex items-center gap-2">
                      <Badge variant="default" className="text-[10px]">{c.category.name}</Badge>
                      <Badge variant={c.status === "ACTIVE" ? "success" : "outline"} className="text-[10px]">{c.status}</Badge>
                      <span className="text-[11px] text-slate-400">{c.country}</span>
                    </div>

                    <h2 className="text-lg font-bold text-white font-display">
                      {c.name}
                    </h2>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {c.description}
                    </p>

                    <div className="space-y-1 pt-2 w-full max-w-md">
                      <div className="flex justify-between text-[11px] text-slate-400">
                        <span>Progress: {c.approvedTasks} of {c.totalTasks} approved</span>
                        <span className="text-emerald-400 font-bold">{percent}%</span>
                      </div>
                      <Progress value={percent} indicatorClassName="bg-secondary" />
                    </div>
                  </div>

                  <div className="flex flex-col md:items-end justify-between gap-4 border-t md:border-t-0 pt-4 md:pt-0 border-slate-800/80">
                    <div className="text-left md:text-right">
                      <span className="text-[10px] uppercase text-slate-400 block">Budget Allocated</span>
                      <span className="text-xl font-bold text-white">{formatCurrency(Number(c.budget))}</span>
                      <span className="text-[11px] text-emerald-400 block mt-0.5">
                        Spent: {formatCurrency(Number(c.amountSpent))}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link href={`/business/campaigns/${c.id}/submissions`}>
                        <Button size="sm" className="bg-primary text-white text-xs">
                          Review Submissions
                        </Button>
                      </Link>
                      <Link href={`/business/results?campaignId=${c.id}`}>
                        <Button size="sm" variant="outline" className="border-slate-700 text-xs">
                          Export Results
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}

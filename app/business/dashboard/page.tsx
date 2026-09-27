import React from "react";
import Link from "next/link";
import {
  Layers,
  Plus,
  CheckCircle2,
  Clock,
  TrendingUp,
  DollarSign,
  ArrowRight,
  ShieldCheck,
  FileSpreadsheet,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/session";

export default async function BusinessDashboardPage() {
  const user = await getCurrentUser();

  let business = user?.business
    ? await prisma.business.findUnique({
        where: { id: user.business.id },
        include: {
          campaigns: {
            include: { category: true, tasks: true },
            orderBy: { createdAt: "desc" },
          },
        },
      })
    : await prisma.business.findFirst({
        include: {
          campaigns: {
            include: { category: true, tasks: true },
            orderBy: { createdAt: "desc" },
          },
        },
      });

  const campaigns = business?.campaigns || [];
  const totalCampaigns = campaigns.length;
  const activeCampaigns = campaigns.filter((c) => c.status === "ACTIVE").length;

  const totalTasks = campaigns.reduce((sum, c) => sum + c.totalTasks, 0);
  const approvedTasks = campaigns.reduce((sum, c) => sum + c.approvedTasks, 0);
  const totalBudgetSpent = campaigns.reduce((sum, c) => sum + Number(c.amountSpent), 0);
  const totalBudgetReserved = campaigns.reduce((sum, c) => sum + Number(c.amountReserved), 0);

  // Count pending submissions needing review
  const pendingSubmissionsCount = await prisma.taskSubmission.count({
    where: {
      status: "SUBMITTED",
      task: { campaign: { businessId: business?.id } },
    },
  });

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8 space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
              {business?.name || "Enterprise Workspace"}
            </h1>
            <Badge variant="secondary" className="text-xs">
              <ShieldCheck className="h-3.5 w-3.5 mr-1" />
              Verified Partner
            </Badge>
          </div>
          <p className="text-xs text-slate-400">
            Deploy microtask campaigns, collect on-the-ground African datasets, and review submissions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/business/campaigns/new">
            <Button size="sm" className="bg-secondary hover:bg-secondary/90 text-white font-bold shadow-glow-green">
              <Plus className="mr-1.5 h-4 w-4" /> Launch Campaign
            </Button>
          </Link>
          <Link href="/business/results">
            <Button size="sm" variant="outline" className="border-slate-700 text-xs">
              <FileSpreadsheet className="mr-1.5 h-4 w-4 text-emerald-400" /> Export Data
            </Button>
          </Link>
        </div>
      </div>

      {/* Review Queue Alert */}
      {pendingSubmissionsCount > 0 && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">
                {pendingSubmissionsCount} Submissions Awaiting Your Review
              </h4>
              <p className="text-[11px] text-slate-300">
                Workers have submitted task answers and evidence. Review them to release ledger rewards.
              </p>
            </div>
          </div>
          {campaigns[0] && (
            <Link href={`/business/campaigns/${campaigns[0].id}/submissions`}>
              <Button size="sm" className="bg-amber-400 text-slate-900 font-bold hover:bg-amber-300 whitespace-nowrap text-xs">
                Review Queue →
              </Button>
            </Link>
          )}
        </div>
      )}

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-slate-800 bg-[#12182D] p-5">
          <span className="text-xs text-slate-400 font-medium">Active Campaigns</span>
          <div className="text-2xl sm:text-3xl font-black text-white mt-1">
            {activeCampaigns} <span className="text-xs font-normal text-slate-400">/ {totalCampaigns} total</span>
          </div>
          <span className="text-[11px] text-blue-400 flex items-center gap-1 mt-2">
            <Layers className="h-3 w-3" /> Real-time workforce execution
          </span>
        </Card>

        <Card className="border-slate-800 bg-[#12182D] p-5">
          <span className="text-xs text-slate-400 font-medium">Approved Submissions</span>
          <div className="text-2xl sm:text-3xl font-black text-emerald-400 mt-1">
            {approvedTasks} <span className="text-xs font-normal text-slate-400">/ {totalTasks} quota</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-2 block">
            Quality verified & dataset ready
          </span>
        </Card>

        <Card className="border-slate-800 bg-[#12182D] p-5">
          <span className="text-xs text-slate-400 font-medium">Budget Spent</span>
          <div className="text-2xl sm:text-3xl font-black text-white mt-1">
            {formatCurrency(totalBudgetSpent)}
          </div>
          <span className="text-[11px] text-emerald-400 mt-2 block">
            Credited to verified contributors
          </span>
        </Card>

        <Card className="border-slate-800 bg-[#12182D] p-5">
          <span className="text-xs text-slate-400 font-medium">Budget in Reserve</span>
          <div className="text-2xl sm:text-3xl font-black text-amber-400 mt-1">
            {formatCurrency(totalBudgetReserved)}
          </div>
          <span className="text-[11px] text-slate-400 mt-2 block">
            Held in escrow for remaining quota
          </span>
        </Card>
      </div>

      {/* Campaigns Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white font-display">Active Campaigns</h2>
          <Link href="/business/campaigns" className="text-xs text-secondary hover:underline flex items-center gap-1">
            View all campaigns <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {campaigns.length === 0 ? (
          <Card className="border-slate-800 bg-[#12182D] p-12 text-center space-y-3">
            <h3 className="text-base font-semibold text-white">No campaigns launched yet</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Start by creating your first microtask campaign. Set rewards, build dynamic questions, and access thousands of workers.
            </p>
            <Link href="/business/campaigns/new">
              <Button size="sm" className="bg-secondary text-white">
                Create First Campaign
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-800 bg-[#12182D]">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-800 bg-slate-900/80 text-slate-400 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Campaign Name</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Country Target</th>
                  <th className="py-3 px-4">Progress</th>
                  <th className="py-3 px-4">Budget Spent</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {campaigns.map((camp) => {
                  const percent = camp.totalTasks > 0 ? Math.round((camp.approvedTasks / camp.totalTasks) * 100) : 0;
                  return (
                    <tr key={camp.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 px-4 font-bold text-white">
                        <Link href={`/business/campaigns/${camp.id}`} className="hover:text-secondary">
                          {camp.name}
                        </Link>
                      </td>
                      <td className="py-3 px-4 text-slate-300">
                        {camp.category.name}
                      </td>
                      <td className="py-3 px-4 text-slate-400">
                        {camp.country}
                      </td>
                      <td className="py-3 px-4 w-40">
                        <div className="space-y-1">
                          <div className="flex justify-between text-[10px] text-slate-400">
                            <span>{camp.approvedTasks} / {camp.totalTasks}</span>
                            <span>{percent}%</span>
                          </div>
                          <Progress value={percent} indicatorClassName="bg-secondary" />
                        </div>
                      </td>
                      <td className="py-3 px-4 font-semibold text-emerald-400">
                        {formatCurrency(Number(camp.amountSpent))}
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={camp.status === "ACTIVE" ? "success" : "outline"} className="text-[10px]">
                          {camp.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Link href={`/business/campaigns/${camp.id}/submissions`}>
                          <Button size="sm" variant="outline" className="border-slate-700 text-xs h-7">
                            Review Submissions
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

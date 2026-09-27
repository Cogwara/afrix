import React from "react";
import Link from "next/link";
import {
  TrendingUp,
  Calendar,
  Layers,
  ArrowUpRight,
  DollarSign,
  PieChart as PieIcon,
  Award,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { LedgerService } from "@/lib/ledger/service";

export default async function EarningsAnalyticsPage() {
  const user = await getCurrentUser();

  let userId = user?.profile?.id;
  if (!userId) {
    const demo = await prisma.userProfile.findFirst({ where: { role: "WORKER" } });
    if (demo) userId = demo.id;
  }

  const wallet = userId ? await LedgerService.getOrCreateWallet(userId) : null;

  // Aggregate approved submissions by category
  const submissions = userId
    ? await prisma.taskSubmission.findMany({
        where: { workerId: userId, status: "APPROVED" },
        include: { task: { include: { category: true } } },
      })
    : [];

  const categoryEarnings: Record<string, number> = {};
  submissions.forEach((s) => {
    const cat = s.task.category.name;
    const rew = Number(s.rewardAmount || s.task.rewardAmount);
    categoryEarnings[cat] = (categoryEarnings[cat] || 0) + rew;
  });

  const available = wallet ? Number(wallet.availableBalance) : 14.20;
  const lifetime = wallet ? Number(wallet.lifetimeEarned) : 29.20;
  const withdrawn = wallet ? Number(wallet.lifetimeWithdrawn) : 15.00;

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
            Earnings Analytics
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Analyze your income streams across categories, time periods, and completed microtasks.
          </p>
        </div>

        <Link href="/wallet/withdraw">
          <Button size="sm" className="bg-secondary text-white font-semibold">
            <ArrowUpRight className="mr-1.5 h-4 w-4" /> Withdraw Funds
          </Button>
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-slate-800 bg-[#12182D] p-5">
          <span className="text-xs text-slate-400">Total Lifetime Income</span>
          <div className="text-2xl sm:text-3xl font-black text-white mt-1">
            {formatCurrency(lifetime)}
          </div>
          <span className="text-[11px] text-emerald-400 flex items-center gap-1 mt-2">
            <TrendingUp className="h-3 w-3" /> Fully ledger-verified
          </span>
        </Card>

        <Card className="border-slate-800 bg-[#12182D] p-5">
          <span className="text-xs text-slate-400">Total Cashed Out</span>
          <div className="text-2xl sm:text-3xl font-black text-emerald-400 mt-1">
            {formatCurrency(withdrawn)}
          </div>
          <span className="text-[11px] text-slate-400 mt-2 block">
            Transferred to Bank / MoMo
          </span>
        </Card>

        <Card className="border-slate-800 bg-[#12182D] p-5">
          <span className="text-xs text-slate-400">Available to Withdraw</span>
          <div className="text-2xl sm:text-3xl font-black text-blue-400 mt-1">
            {formatCurrency(available)}
          </div>
          <span className="text-[11px] text-slate-400 mt-2 block">
            Instant withdrawal available
          </span>
        </Card>
      </div>

      {/* Category Breakdown */}
      <Card className="border-slate-800 bg-[#12182D] p-6 space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <PieIcon className="h-5 w-5 text-secondary" />
          <h2 className="text-base font-bold text-white font-display">Earnings by Category</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(categoryEarnings).length === 0 ? (
            <div className="col-span-3 text-xs text-slate-400 py-6 text-center">
              Complete tasks across different categories to see your earnings distribution.
            </div>
          ) : (
            Object.entries(categoryEarnings).map(([cat, val]) => (
              <div
                key={cat}
                className="rounded-lg border border-slate-800 bg-slate-900/60 p-4 space-y-1"
              >
                <span className="text-xs text-slate-400 block">{cat}</span>
                <span className="text-lg font-bold text-white block">
                  {formatCurrency(val)}
                </span>
                <div className="text-[10px] text-emerald-400 font-semibold">
                  {Math.round((val / (lifetime || 1)) * 100)}% of total earnings
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}

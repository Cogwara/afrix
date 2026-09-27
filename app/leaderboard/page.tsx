import React from "react";
import Link from "next/link";
import { Trophy, Medal, Award, Star, ShieldCheck, ArrowRight, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { prisma } from "@/lib/prisma";

export default async function LeaderboardPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; country?: string }>;
}) {
  const params = await searchParams;
  const currentTab = params.type || "weekly";
  const selectedCountry = params.country || "All";

  // Fetch top workers ordered by legitimate totalEarned
  const where: any = {};
  if (selectedCountry !== "All") {
    where.user = { country: selectedCountry };
  }

  const topWorkers = await prisma.workerProfile.findMany({
    where,
    include: {
      user: {
        select: { country: true, email: true },
      },
    },
    orderBy: { totalEarned: "desc" },
    take: 15,
  });

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
              Worker Leaderboard
            </h1>
            <Badge variant="accent" className="text-xs">
              Verified Legitimate Earnings
            </Badge>
          </div>
          <p className="text-xs text-slate-400">
            Recognizing the top productive contributors across Africa based solely on verified, approved task completions.
          </p>
        </div>

        <Link href="/tasks">
          <Button size="sm" className="bg-primary text-white">
            Climb the Leaderboard
          </Button>
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          {["daily", "weekly", "monthly", "all-time"].map((t) => (
            <Link
              key={t}
              href={`/leaderboard?type=${t}${selectedCountry !== "All" ? `&country=${selectedCountry}` : ""}`}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold capitalize transition-all ${
                currentTab === t
                  ? "bg-primary text-white"
                  : "border border-slate-800 bg-[#12182D] text-slate-400 hover:text-white"
              }`}
            >
              {t}
            </Link>
          ))}
        </div>

        {/* Country Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
          {["All", "Nigeria", "Kenya", "Ghana", "South Africa", "Uganda"].map((c) => (
            <Link
              key={c}
              href={`/leaderboard?type=${currentTab}&country=${c}`}
              className={`rounded-full px-3 py-1 text-[11px] font-medium transition-colors ${
                selectedCountry === c
                  ? "bg-secondary text-white font-bold"
                  : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              {c}
            </Link>
          ))}
        </div>
      </div>

      {/* Top 3 Podium */}
      {topWorkers.length >= 3 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
          {/* Rank 2 */}
          <Card className="border-slate-800 bg-[#12182D] p-5 text-center order-2 sm:order-1 relative">
            <div className="mx-auto h-12 w-12 rounded-full bg-slate-700/50 text-slate-300 flex items-center justify-center font-bold text-lg mb-2">
              🥈
            </div>
            <h3 className="font-bold text-white text-sm">
              {topWorkers[1].firstName} {topWorkers[1].lastName[0]}.
            </h3>
            <p className="text-[11px] text-slate-400 flex items-center justify-center gap-1 mt-0.5">
              <MapPin className="h-3 w-3" /> {topWorkers[1].user.country}
            </p>
            <div className="mt-3 text-lg font-black text-emerald-400">
              {formatCurrency(Number(topWorkers[1].totalEarned))}
            </div>
            <span className="text-[10px] text-slate-400">
              {topWorkers[1].tasksCompleted} tasks approved
            </span>
          </Card>

          {/* Rank 1 */}
          <Card className="border-amber-500/50 bg-gradient-to-b from-[#1E2540] to-[#12182D] p-6 text-center order-1 sm:order-2 relative shadow-glow">
            <div className="mx-auto h-14 w-14 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold text-2xl mb-2 border border-amber-500/40">
              👑
            </div>
            <Badge variant="accent" className="text-[10px] mb-1">
              Top Earner
            </Badge>
            <h3 className="font-bold text-white text-base">
              {topWorkers[0].firstName} {topWorkers[0].lastName[0]}.
            </h3>
            <p className="text-[11px] text-slate-400 flex items-center justify-center gap-1 mt-0.5">
              <MapPin className="h-3 w-3" /> {topWorkers[0].user.country}
            </p>
            <div className="mt-3 text-2xl font-black text-amber-400">
              {formatCurrency(Number(topWorkers[0].totalEarned))}
            </div>
            <span className="text-[10px] text-slate-300">
              {topWorkers[0].tasksCompleted} tasks approved
            </span>
          </Card>

          {/* Rank 3 */}
          <Card className="border-slate-800 bg-[#12182D] p-5 text-center order-3 relative">
            <div className="mx-auto h-12 w-12 rounded-full bg-amber-900/30 text-amber-600 flex items-center justify-center font-bold text-lg mb-2">
              🥉
            </div>
            <h3 className="font-bold text-white text-sm">
              {topWorkers[2].firstName} {topWorkers[2].lastName[0]}.
            </h3>
            <p className="text-[11px] text-slate-400 flex items-center justify-center gap-1 mt-0.5">
              <MapPin className="h-3 w-3" /> {topWorkers[2].user.country}
            </p>
            <div className="mt-3 text-lg font-black text-emerald-400">
              {formatCurrency(Number(topWorkers[2].totalEarned))}
            </div>
            <span className="text-[10px] text-slate-400">
              {topWorkers[2].tasksCompleted} tasks approved
            </span>
          </Card>
        </div>
      )}

      {/* Leaderboard Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-800 bg-[#12182D]">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-slate-800 bg-slate-900/80 text-slate-400 uppercase tracking-wider text-[10px]">
            <tr>
              <th className="py-3 px-4 w-12 text-center">Rank</th>
              <th className="py-3 px-4">Worker</th>
              <th className="py-3 px-4">Country</th>
              <th className="py-3 px-4">Tier / Level</th>
              <th className="py-3 px-4 text-center">Completed Tasks</th>
              <th className="py-3 px-4 text-right">Legitimate Earnings</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80">
            {topWorkers.map((worker, i) => (
              <tr key={worker.id} className="hover:bg-slate-800/30 transition-colors">
                <td className="py-3 px-4 text-center font-bold text-slate-300">
                  {i + 1}
                </td>
                <td className="py-3 px-4">
                  <div className="font-semibold text-white">
                    {worker.firstName} {worker.lastName[0]}.
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Reputation: {Number(worker.reputationScore).toFixed(0)}%
                  </div>
                </td>
                <td className="py-3 px-4 text-slate-300">
                  {worker.user.country}
                </td>
                <td className="py-3 px-4">
                  <Badge variant="default" className="text-[10px]">
                    Lvl {worker.level}
                  </Badge>
                </td>
                <td className="py-3 px-4 text-center text-slate-300">
                  {worker.tasksCompleted}
                </td>
                <td className="py-3 px-4 text-right font-bold text-emerald-400">
                  {formatCurrency(Number(worker.totalEarned))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

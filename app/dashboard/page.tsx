import React from "react";
import Link from "next/link";
import {
  Wallet,
  ArrowUpRight,
  TrendingUp,
  Award,
  CheckCircle2,
  Clock,
  ArrowRight,
  Briefcase,
  Star,
  ShieldCheck,
  Target,
  Sparkles,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { formatCurrency } from "@/lib/utils";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { LedgerService } from "@/lib/ledger/service";
import { ReputationService } from "@/lib/reputation/service";

export default async function WorkerDashboardPage() {
  const user = await getCurrentUser();

  // Find user data or fallback to first demo worker for immediate rich experience
  let workerUserId = user?.profile?.id;
  let workerProfile = null;
  let wallet = null;

  if (workerUserId) {
    workerProfile = await prisma.workerProfile.findUnique({
      where: { userId: workerUserId },
    });
    wallet = await LedgerService.getOrCreateWallet(workerUserId);
  } else {
    const demo = await prisma.userProfile.findFirst({
      where: { role: "WORKER" },
      include: { workerProfile: true, wallet: true },
    });
    if (demo) {
      workerUserId = demo.id;
      workerProfile = demo.workerProfile;
      wallet = demo.wallet;
    }
  }

  const xp = workerProfile?.xp || 850;
  const levelInfo = ReputationService.getLevelInfo(xp);
  const availableBalance = wallet ? Number(wallet.availableBalance) : 14.20;
  const pendingBalance = wallet ? Number(wallet.pendingBalance) : 1.50;
  const lifetimeEarned = wallet ? Number(wallet.lifetimeEarned) : 29.20;
  const tasksCompleted = workerProfile?.tasksCompleted || 19;
  const reputationScore = workerProfile ? Number(workerProfile.reputationScore) : 98.5;
  const accuracyScore = workerProfile ? Number(workerProfile.accuracyScore) : 97.2;

  // Active tasks recommended for worker's level
  const recommendedTasks = await prisma.task.findMany({
    where: {
      status: "ACTIVE",
      requiredLevel: { lte: levelInfo.level },
    },
    include: {
      category: true,
    },
    orderBy: { rewardAmount: "desc" },
    take: 3,
  });

  // Missions
  const missions = await prisma.mission.findMany({
    where: { isActive: true },
    take: 2,
  });

  const dailyTarget = 5.0;
  const todayEarnings = 1.85;
  const targetPercent = Math.min(100, Math.round((todayEarnings / dailyTarget) * 100));

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8 space-y-8">
      {/* Top Welcome & Level Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
              Hello, {workerProfile?.firstName || "Worker"}! 👋
            </h1>
            <Badge variant="secondary" className="font-semibold text-xs">
              Level {levelInfo.level} {levelInfo.name}
            </Badge>
          </div>
          <p className="text-xs text-slate-400">
            Welcome to your digital work station. Complete tasks, boost your reputation, and earn.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/tasks">
            <Button size="sm" className="bg-primary hover:bg-primary/90 text-white font-semibold">
              <Briefcase className="mr-1.5 h-4 w-4" /> Browse Tasks
            </Button>
          </Link>
          <Link href="/wallet/withdraw">
            <Button size="sm" variant="outline" className="border-secondary/40 text-secondary hover:bg-secondary/10">
              <ArrowUpRight className="mr-1.5 h-4 w-4" /> Withdraw
            </Button>
          </Link>
        </div>
      </div>

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Available Balance */}
        <Card className="border-slate-800 bg-[#12182D] relative overflow-hidden">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Available to Cash Out</span>
              <div className="h-7 w-7 rounded-lg bg-emerald-500/10 text-secondary flex items-center justify-center">
                <Wallet className="h-4 w-4" />
              </div>
            </div>
            <CardTitle className="text-2xl sm:text-3xl font-black text-white mt-1">
              {formatCurrency(availableBalance)}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800/60">
              <span className="text-slate-400">Pending Review</span>
              <span className="text-amber-400 font-semibold">{formatCurrency(pendingBalance)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Lifetime Earnings */}
        <Card className="border-slate-800 bg-[#12182D]">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Lifetime Earnings</span>
              <div className="h-7 w-7 rounded-lg bg-blue-500/10 text-primary flex items-center justify-center">
                <TrendingUp className="h-4 w-4" />
              </div>
            </div>
            <CardTitle className="text-2xl sm:text-3xl font-black text-white mt-1">
              {formatCurrency(lifetimeEarned)}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800/60">
              <span className="text-slate-400">Tasks Approved</span>
              <span className="text-emerald-400 font-semibold">{tasksCompleted} completed</span>
            </div>
          </CardContent>
        </Card>

        {/* Worker Level & XP */}
        <Card className="border-slate-800 bg-[#12182D]">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Tier Progression</span>
              <div className="h-7 w-7 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
                <Zap className="h-4 w-4" />
              </div>
            </div>
            <div className="flex items-baseline justify-between mt-1">
              <CardTitle className="text-2xl sm:text-3xl font-black text-white">
                {xp} <span className="text-xs font-normal text-slate-400">XP</span>
              </CardTitle>
              <span className="text-xs font-semibold text-purple-400">{levelInfo.progressPercent}%</span>
            </div>
          </CardHeader>
          <CardContent className="pt-1 space-y-1.5">
            <Progress value={levelInfo.progressPercent} indicatorClassName="bg-purple-500" />
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>Lvl {levelInfo.level} ({levelInfo.name})</span>
              <span>Next: {levelInfo.nextLevelXP} XP</span>
            </div>
          </CardContent>
        </Card>

        {/* Reputation Score */}
        <Card className="border-slate-800 bg-[#12182D]">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Reputation Score</span>
              <div className="h-7 w-7 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
                <ShieldCheck className="h-4 w-4" />
              </div>
            </div>
            <CardTitle className="text-2xl sm:text-3xl font-black text-white mt-1">
              {reputationScore}%
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800/60">
              <span className="text-slate-400">Accuracy Rate</span>
              <span className="text-emerald-400 font-semibold">{accuracyScore}%</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Daily Target Progress Banner */}
      <Card className="border-primary/30 bg-gradient-to-r from-primary/10 via-[#12182D] to-secondary/10 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-bold text-white">Today's Daily Target</h3>
              <Badge variant="outline" className="text-[10px] text-blue-300">
                {targetPercent}% Achieved
              </Badge>
            </div>
            <p className="text-xs text-slate-400">
              Earned {formatCurrency(todayEarnings)} of your {formatCurrency(dailyTarget)} daily target today.
            </p>
          </div>
          <div className="w-full sm:w-64">
            <Progress value={targetPercent} indicatorClassName="bg-primary" />
          </div>
        </div>
      </Card>

      {/* Main Two-Column Section: Recommended Tasks & Missions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Recommended Tasks (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-400" />
              <h2 className="text-lg font-bold text-white font-display">Recommended For You</h2>
            </div>
            <Link href="/tasks" className="text-xs text-primary hover:underline flex items-center gap-1">
              View all tasks <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="space-y-3">
            {recommendedTasks.map((task) => (
              <Card key={task.id} className="border-slate-800 bg-[#12182D] hover:border-slate-700 transition-colors p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="default" className="text-[10px]">
                        {task.category.name}
                      </Badge>
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Clock className="h-3 w-3" /> ~3 mins
                      </span>
                    </div>
                    <h3 className="font-semibold text-white text-sm hover:text-primary transition-colors">
                      <Link href={`/tasks/${task.id}`}>{task.title}</Link>
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-1">
                      {task.description}
                    </p>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 shrink-0">
                    <span className="text-base font-bold text-emerald-400">
                      +{formatCurrency(Number(task.rewardAmount))}
                    </span>
                    <Link href={`/tasks/${task.id}`}>
                      <Button size="sm" className="h-8 text-xs bg-primary hover:bg-primary/90 text-white font-medium">
                        Start Task
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Right Column: Missions & Quick Links (1 col) */}
        <div className="space-y-6">
          {/* Active Missions */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white font-display flex items-center gap-2">
                <Award className="h-4 w-4 text-secondary" /> Active Missions
              </h2>
              <Link href="/missions" className="text-xs text-slate-400 hover:text-white">
                All Missions
              </Link>
            </div>

            <div className="space-y-3">
              {missions.map((mission) => (
                <Card key={mission.id} className="border-slate-800 bg-[#12182D] p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge variant={mission.type === "DAILY" ? "default" : "secondary"} className="text-[10px]">
                      {mission.type} MISSION
                    </Badge>
                    <span className="text-xs font-semibold text-amber-400">
                      +{mission.xpReward} XP {mission.cashReward ? `+ $${Number(mission.cashReward).toFixed(2)}` : ""}
                    </span>
                  </div>
                  <h4 className="text-xs font-semibold text-white">{mission.title}</h4>
                  <p className="text-[11px] text-slate-400 leading-snug">{mission.description}</p>
                  <div className="pt-1">
                    <Progress value={50} indicatorClassName="bg-secondary" />
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Quick Actions Card */}
          <Card className="border-slate-800 bg-slate-900/50 p-4 space-y-2.5">
            <h4 className="text-xs font-semibold uppercase text-slate-400">Quick Shortcuts</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <Link
                href="/submissions"
                className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-800/40 p-2.5 text-slate-200 hover:bg-slate-800 transition-colors"
              >
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span>My Submissions</span>
              </Link>
              <Link
                href="/referrals"
                className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-800/40 p-2.5 text-slate-200 hover:bg-slate-800 transition-colors"
              >
                <Award className="h-4 w-4 text-amber-400" />
                <span>Refer & Earn</span>
              </Link>
              <Link
                href="/leaderboard"
                className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-800/40 p-2.5 text-slate-200 hover:bg-slate-800 transition-colors"
              >
                <Star className="h-4 w-4 text-blue-400" />
                <span>Leaderboard</span>
              </Link>
              <Link
                href="/wallet"
                className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-800/40 p-2.5 text-slate-200 hover:bg-slate-800 transition-colors"
              >
                <Wallet className="h-4 w-4 text-purple-400" />
                <span>Transaction History</span>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

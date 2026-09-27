import React from "react";
import Link from "next/link";
import {
  User,
  ShieldCheck,
  Award,
  Zap,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Mail,
  Phone,
  Calendar,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { ReputationService } from "@/lib/reputation/service";

export default async function WorkerProfilePage() {
  const user = await getCurrentUser();

  let userProfile: any = user?.profile;
  let workerProfile: any = user?.workerProfile;

  if (!userProfile) {
    const demo = await prisma.userProfile.findFirst({
      where: { role: "WORKER" },
      include: { workerProfile: true },
    });
    if (demo) {
      userProfile = demo;
      workerProfile = demo.workerProfile;
    }
  }

  const xp = workerProfile?.xp || 850;
  const levelInfo = ReputationService.getLevelInfo(xp);
  const reputation = workerProfile ? Number(workerProfile.reputationScore) : 98.5;
  const accuracy = workerProfile ? Number(workerProfile.accuracyScore) : 97.2;
  const completion = workerProfile ? 99.0 : 100;
  const reliability = workerProfile ? 98.0 : 100;
  const kycStatus = workerProfile?.kycStatus || "VERIFIED";

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8 space-y-8">
      {/* Profile Header */}
      <Card className="border-slate-800 bg-[#12182D] p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-gradient-to-br from-primary to-secondary text-white font-extrabold flex items-center justify-center text-2xl shadow-glow">
              {workerProfile?.firstName?.[0] || "W"}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-white font-display">
                  {workerProfile?.firstName} {workerProfile?.lastName}
                </h1>
                <Badge variant="secondary" className="text-xs">
                  Level {levelInfo.level} {levelInfo.name}
                </Badge>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-2">
                <Mail className="h-3.5 w-3.5" /> {userProfile?.email}
              </p>
              <p className="text-xs text-slate-400 flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 text-red-400" /> {userProfile?.country || "Nigeria"}
              </p>
            </div>
          </div>

          <div className="flex sm:flex-col items-center sm:items-end gap-2 shrink-0">
            <Badge
              variant={kycStatus === "VERIFIED" ? "success" : "warning"}
              className="text-xs py-1 px-3"
            >
              <ShieldCheck className="h-3.5 w-3.5 mr-1" />
              KYC {kycStatus}
            </Badge>
            <Link href="/settings">
              <Button size="sm" variant="outline" className="border-slate-700 text-xs">
                Edit Settings
              </Button>
            </Link>
          </div>
        </div>

        {/* Level Progression */}
        <div className="mt-8 pt-6 border-t border-slate-800/80 space-y-2">
          <div className="flex justify-between text-xs">
            <span className="font-semibold text-slate-300">
              Tier Progress: Level {levelInfo.level} ({levelInfo.name})
            </span>
            <span className="text-purple-400 font-bold">
              {xp} / {levelInfo.nextLevelXP} XP ({levelInfo.progressPercent}%)
            </span>
          </div>
          <Progress value={levelInfo.progressPercent} indicatorClassName="bg-purple-500" />
        </div>
      </Card>

      {/* Reputation Breakdown Grid */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white font-display flex items-center gap-2">
          <Award className="h-5 w-5 text-amber-400" /> Reputation & Performance Metrics
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-slate-800 bg-[#12182D] p-5">
            <span className="text-xs text-slate-400">Overall Reputation</span>
            <div className="text-2xl font-black text-amber-400 mt-1">
              {reputation}%
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">
              Weighted composite quality score
            </span>
          </Card>

          <Card className="border-slate-800 bg-[#12182D] p-5">
            <span className="text-xs text-slate-400">Submission Accuracy</span>
            <div className="text-2xl font-black text-emerald-400 mt-1">
              {accuracy}%
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">
              Approved vs total reviewed
            </span>
          </Card>

          <Card className="border-slate-800 bg-[#12182D] p-5">
            <span className="text-xs text-slate-400">Completion Rate</span>
            <div className="text-2xl font-black text-blue-400 mt-1">
              {completion}%
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">
              Started tasks completed
            </span>
          </Card>

          <Card className="border-slate-800 bg-[#12182D] p-5">
            <span className="text-xs text-slate-400">Reliability Score</span>
            <div className="text-2xl font-black text-purple-400 mt-1">
              {reliability}%
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">
              Instructions followed
            </span>
          </Card>
        </div>
      </div>
    </div>
  );
}

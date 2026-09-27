import React from "react";
import Link from "next/link";
import { Award, Zap, CheckCircle2, Clock, Sparkles, ArrowRight, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { formatCurrency } from "@/lib/utils";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/session";

export default async function MissionsPage() {
  const user = await getCurrentUser();

  const missions = await prisma.mission.findMany({
    where: { isActive: true },
    orderBy: { type: "asc" },
  });

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
              Worker Missions & Quests
            </h1>
            <Badge variant="accent" className="text-xs">
              Bonus XP & Cash
            </Badge>
          </div>
          <p className="text-xs text-slate-400">
            Complete daily and weekly challenge milestones to accelerate your worker tier advancement and unlock bonus payouts.
          </p>
        </div>

        <Link href="/tasks">
          <Button size="sm" className="bg-primary text-white">
            Find Tasks for Missions
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {missions.map((mission) => {
          const isDaily = mission.type === "DAILY";
          const isWeekly = mission.type === "WEEKLY";

          return (
            <Card
              key={mission.id}
              className="border-slate-800 bg-[#12182D] hover:border-slate-700 transition-colors p-6 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Badge
                    variant={isDaily ? "default" : isWeekly ? "secondary" : "accent"}
                    className="text-[10px] uppercase font-bold"
                  >
                    {mission.type} MISSION
                  </Badge>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
                    <Zap className="h-3.5 w-3.5 fill-amber-400" />
                    +{mission.xpReward} XP
                    {mission.cashReward && (
                      <span className="text-emerald-400">
                        + {formatCurrency(Number(mission.cashReward))}
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-white text-base font-display">
                    {mission.title}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed mt-1">
                    {mission.description}
                  </p>
                </div>

                <div className="space-y-1.5 pt-2">
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>Progress: 1 / 2 completed</span>
                    <span className="font-semibold text-slate-300">50%</span>
                  </div>
                  <Progress value={50} indicatorClassName={isDaily ? "bg-primary" : "bg-secondary"} />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Clock className="h-3 w-3" /> Resets at midnight UTC
                </span>
                <Link href="/tasks">
                  <Button size="sm" variant="outline" className="border-slate-700 text-xs">
                    Work on Mission
                  </Button>
                </Link>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

import React from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  ArrowRight,
  Filter,
  DollarSign,
  Star,
  FileCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/session";

export default async function SubmissionsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const params = await searchParams;
  const filterStatus = params.status || "ALL";

  const user = await getCurrentUser();

  let workerUserId = user?.profile?.id;
  if (!workerUserId) {
    const demo = await prisma.userProfile.findFirst({
      where: { role: "WORKER" },
    });
    if (demo) workerUserId = demo.id;
  }

  const where: any = workerUserId ? { workerId: workerUserId } : {};
  if (filterStatus !== "ALL") {
    where.status = filterStatus;
  }

  const submissions = await prisma.taskSubmission.findMany({
    where,
    include: {
      task: {
        include: { category: true },
      },
      reviews: {
        take: 1,
        orderBy: { createdAt: "desc" },
      },
    },
    orderBy: { submittedAt: "desc" },
  });

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
            My Submissions
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Track your task submissions, review decisions, quality scores, and reward credits.
          </p>
        </div>
        <Link href="/tasks">
          <Button size="sm" className="bg-primary text-white">
            Find New Tasks <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
          </Button>
        </Link>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {["ALL", "APPROVED", "SUBMITTED", "UNDER_REVIEW", "REJECTED"].map((st) => (
          <Link
            key={st}
            href={`/submissions${st === "ALL" ? "" : `?status=${st}`}`}
            className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              filterStatus === st
                ? "bg-primary text-white"
                : "border border-slate-800 bg-[#12182D] text-slate-400 hover:text-white"
            }`}
          >
            {st.replace("_", " ")}
          </Link>
        ))}
      </div>

      {/* Submissions List */}
      {submissions.length === 0 ? (
        <Card className="border-slate-800 bg-[#12182D] p-12 text-center space-y-3">
          <div className="mx-auto h-12 w-12 rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
            <FileCheck className="h-6 w-6" />
          </div>
          <h3 className="text-base font-semibold text-white">No submissions yet</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            You haven't submitted any tasks matching this filter. Head over to the marketplace to get started.
          </p>
          <Link href="/tasks">
            <Button size="sm" className="bg-primary text-white">
              Browse Available Tasks
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-4">
          {submissions.map((sub) => {
            const isApproved = sub.status === "APPROVED";
            const isPending = sub.status === "SUBMITTED" || sub.status === "UNDER_REVIEW";
            const isRejected = sub.status === "REJECTED";

            return (
              <Card
                key={sub.id}
                className="border-slate-800 bg-[#12182D] hover:border-slate-700 transition-colors p-5"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <Badge variant="default" className="text-[10px]">
                        {sub.task.category.name}
                      </Badge>
                      {isApproved && (
                        <Badge variant="secondary" className="text-[10px] bg-emerald-500/20 text-emerald-400">
                          APPROVED
                        </Badge>
                      )}
                      {isPending && (
                        <Badge variant="outline" className="text-[10px] text-amber-400 border-amber-500/30">
                          UNDER REVIEW
                        </Badge>
                      )}
                      {isRejected && (
                        <Badge variant="destructive" className="text-[10px]">
                          REJECTED
                        </Badge>
                      )}
                      <span className="text-[11px] text-slate-400">
                        {formatDateTime(sub.submittedAt)}
                      </span>
                    </div>

                    <h3 className="font-semibold text-white text-base">
                      {sub.task.title}
                    </h3>

                    {sub.reviewNotes && (
                      <p className="text-xs text-slate-300 italic bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                        "{sub.reviewNotes}"
                      </p>
                    )}
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-800/80 shrink-0">
                    <span className="text-xs text-slate-400 block sm:text-right">
                      {isApproved ? "Reward Paid" : "Estimated Reward"}
                    </span>
                    <span
                      className={`text-xl font-bold ${
                        isApproved
                          ? "text-emerald-400"
                          : isRejected
                          ? "text-slate-500 line-through"
                          : "text-amber-400"
                      }`}
                    >
                      {formatCurrency(Number(sub.rewardAmount || sub.task.rewardAmount))}
                    </span>

                    {sub.qualityScore && (
                      <span className="text-xs text-amber-400 flex items-center gap-1">
                        <Star className="h-3 w-3 fill-amber-400" />
                        Quality: {Number(sub.qualityScore).toFixed(1)}/10
                      </span>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

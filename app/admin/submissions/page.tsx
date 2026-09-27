import React from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, XCircle, Clock, ShieldCheck, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { prisma } from "@/lib/prisma";

export default async function AdminSubmissionsPage() {
  const submissions = await prisma.taskSubmission.findMany({
    include: {
      worker: { select: { email: true, country: true } },
      task: {
        include: {
          category: true,
          campaign: { select: { name: true, business: { select: { name: true } } } },
        },
      },
      reviews: true,
    },
    orderBy: { submittedAt: "desc" },
    take: 40,
  });

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8 space-y-6">
      <Link
        href="/admin"
        className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Admin
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-white font-display">Platform Submission Queue</h1>
          <p className="text-xs text-slate-400">
            Global review queue across all enterprise campaigns for consensus checking and quality assurance.
          </p>
        </div>
        <Badge variant="outline" className="text-xs">{submissions.length} Total Submissions</Badge>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-800 bg-[#12182D]">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-slate-800 bg-slate-900/80 text-slate-400 uppercase text-[10px]">
            <tr>
              <th className="py-3 px-4">Date</th>
              <th className="py-3 px-4">Worker</th>
              <th className="py-3 px-4">Task & Campaign</th>
              <th className="py-3 px-4">Reward</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Quality</th>
              <th className="py-3 px-4 text-right">Notes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80">
            {submissions.map((s) => (
              <tr key={s.id} className="hover:bg-slate-800/30 transition-colors">
                <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
                  {formatDateTime(s.submittedAt)}
                </td>
                <td className="py-3 px-4">
                  <div className="font-semibold text-white">{s.worker.email}</div>
                  <div className="text-[10px] text-slate-400">{s.worker.country}</div>
                </td>
                <td className="py-3 px-4">
                  <div className="font-semibold text-white">{s.task.title}</div>
                  <div className="text-[10px] text-slate-400">{s.task.campaign.name}</div>
                </td>
                <td className="py-3 px-4 font-bold text-emerald-400">
                  {formatCurrency(Number(s.rewardAmount || s.task.rewardAmount))}
                </td>
                <td className="py-3 px-4">
                  <Badge
                    variant={
                      s.status === "APPROVED"
                        ? "success"
                        : s.status === "REJECTED"
                        ? "destructive"
                        : "warning"
                    }
                    className="text-[10px]"
                  >
                    {s.status}
                  </Badge>
                </td>
                <td className="py-3 px-4 text-slate-300">
                  {s.qualityScore ? `${Number(s.qualityScore).toFixed(1)}/10` : "-"}
                </td>
                <td className="py-3 px-4 text-right text-slate-400 italic max-w-xs truncate">
                  {s.reviewNotes || "Standard submission"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

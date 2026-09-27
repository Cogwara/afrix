import React from "react";
import Link from "next/link";
import { Download, FileSpreadsheet, FileJson, CheckCircle2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/session";

export default async function BusinessResultsPage() {
  const user = await getCurrentUser();

  let businessId = user?.business?.id;
  if (!businessId) {
    const demo = await prisma.business.findFirst();
    if (demo) businessId = demo.id;
  }

  const submissions = businessId
    ? await prisma.taskSubmission.findMany({
        where: {
          task: { campaign: { businessId } },
          status: "APPROVED",
        },
        include: {
          task: { select: { title: true, campaign: { select: { name: true } } } },
          worker: { select: { country: true } },
        },
        take: 50,
      })
    : [];

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8 space-y-6">
      <Link
        href="/business/dashboard"
        className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Business Dashboard
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
            Dataset Export & Results
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Download your verified on-the-ground African datasets in machine-readable formats.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" className="border-slate-700 text-xs">
            <FileJson className="h-4 w-4 mr-1.5 text-amber-400" /> Export JSON
          </Button>
          <Button size="sm" className="bg-secondary text-white text-xs font-semibold">
            <FileSpreadsheet className="h-4 w-4 mr-1.5" /> Export CSV
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-slate-800 bg-[#12182D] p-5">
          <span className="text-xs text-slate-400">Approved Data Records</span>
          <div className="text-2xl font-black text-emerald-400 mt-1">{submissions.length}</div>
          <span className="text-[11px] text-slate-400 mt-1 block">Ready for model training</span>
        </Card>
        <Card className="border-slate-800 bg-[#12182D] p-5">
          <span className="text-xs text-slate-400">Quality Verified</span>
          <div className="text-2xl font-black text-white mt-1">100%</div>
          <span className="text-[11px] text-emerald-400 mt-1 block">Passed fraud & quality checks</span>
        </Card>
        <Card className="border-slate-800 bg-[#12182D] p-5">
          <span className="text-xs text-slate-400">Geographic Coverage</span>
          <div className="text-2xl font-black text-blue-400 mt-1">5 Countries</div>
          <span className="text-[11px] text-slate-400 mt-1 block">Nigeria, Kenya, Ghana, SA, Uganda</span>
        </Card>
      </div>

      <Card className="border-slate-800 bg-[#12182D] p-6 space-y-4">
        <h2 className="text-base font-bold text-white font-display">Sample Dataset Preview</h2>
        <div className="overflow-x-auto rounded-lg border border-slate-800 bg-slate-900/60">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-800 bg-slate-900 text-slate-400 uppercase text-[10px]">
              <tr>
                <th className="py-2.5 px-3">Record ID</th>
                <th className="py-2.5 px-3">Campaign / Task</th>
                <th className="py-2.5 px-3">Country</th>
                <th className="py-2.5 px-3">Geotag</th>
                <th className="py-2.5 px-3">Sample Answer</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {submissions.map((s) => (
                <tr key={s.id} className="hover:bg-slate-800/30">
                  <td className="py-2 px-3 font-mono text-[10px] text-slate-400">{s.id.slice(0, 8)}</td>
                  <td className="py-2 px-3 font-semibold text-white">{s.task.title}</td>
                  <td className="py-2 px-3 text-slate-300">{s.worker.country}</td>
                  <td className="py-2 px-3 text-[11px] text-amber-400 font-mono">
                    {s.latitude ? `${Number(s.latitude).toFixed(3)}, ${Number(s.longitude).toFixed(3)}` : "None"}
                  </td>
                  <td className="py-2 px-3 text-slate-300 truncate max-w-xs">
                    {JSON.stringify(s.answers)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

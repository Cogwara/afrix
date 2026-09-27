import React from "react";
import Link from "next/link";
import { AlertTriangle, ArrowLeft, ShieldAlert, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/utils";
import { prisma } from "@/lib/prisma";

export default async function AdminFraudPage() {
  const fraudEvents = await prisma.fraudEvent.findMany({
    include: {
      user: { select: { email: true, country: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 30,
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
          <h1 className="text-2xl font-bold text-white font-display">Fraud & Abuse Signals</h1>
          <p className="text-xs text-slate-400">
            Real-time automated anomaly flags: velocity abuse, impossible speed, multi-account devices, and GPS mismatches.
          </p>
        </div>
        <Badge variant="destructive" className="text-xs">{fraudEvents.length} Active Events</Badge>
      </div>

      {fraudEvents.length === 0 ? (
        <Card className="border-slate-800 bg-[#12182D] p-12 text-center text-xs text-slate-400">
          No fraud events detected. Platform security rules active.
        </Card>
      ) : (
        <div className="space-y-4">
          {fraudEvents.map((event) => (
            <Card key={event.id} className="border-slate-800 bg-[#12182D] p-5 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5">
                <div className="flex items-center gap-2">
                  <Badge variant="destructive" className="text-[10px]">
                    {event.eventType}
                  </Badge>
                  <span className="text-xs font-semibold text-white">
                    User: {event.user?.email || "Unknown Guest"}
                  </span>
                  {event.user?.country && (
                    <Badge variant="outline" className="text-[10px]">{event.user.country}</Badge>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-red-400">
                    Risk Score: {Number(event.riskScore).toFixed(0)}/100
                  </span>
                  <span className="text-[11px] text-slate-400">{formatDateTime(event.createdAt)}</span>
                </div>
              </div>

              <div className="rounded-lg bg-slate-900/60 p-3 text-xs text-slate-300 font-mono">
                {JSON.stringify(event.details, null, 2)}
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-slate-400">Status: <strong className="text-white">{event.status}</strong></span>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="border-slate-700 text-xs h-7">
                    Resolve
                  </Button>
                  <Button size="sm" variant="outline" className="border-red-900/50 text-red-400 text-xs h-7">
                    Suspend User
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

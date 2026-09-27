"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, XCircle, Clock, ShieldCheck, DollarSign, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDateTime } from "@/lib/utils";

interface WithdrawalItem {
  id: string;
  amount: number;
  fee: number;
  netAmount: number;
  currency: string;
  method: string;
  destination: any;
  status: string;
  riskScore: number;
  createdAt: string;
  user: { email: string; country: string };
}

export default function AdminWithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState<WithdrawalItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/admin/withdrawals");
        if (res.ok) {
          const data = await res.json();
          setWithdrawals(data.withdrawals || []);
        }
      } catch (err) {
        console.error("Failed to load withdrawals", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleAction = async (withdrawalId: string, action: "APPROVE" | "REJECT") => {
    setProcessingId(withdrawalId);
    setMsg(null);

    try {
      const res = await fetch("/api/admin/withdrawals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ withdrawalId, action }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Action failed");

      setMsg(data.message);
      setWithdrawals((prev) =>
        prev.map((w) =>
          w.id === withdrawalId ? { ...w, status: action === "APPROVE" ? "COMPLETED" : "FAILED" } : w
        )
      );
    } catch (err: any) {
      alert(err.message || "Operation failed");
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

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
          <h1 className="text-2xl font-bold text-white font-display">Withdrawal Operations</h1>
          <p className="text-xs text-slate-400">
            Review worker payout requests, verify destinations, and settle transfers through the immutable ledger.
          </p>
        </div>
      </div>

      {msg && (
        <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3 text-xs text-emerald-400 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{msg}</span>
        </div>
      )}

      {withdrawals.length === 0 ? (
        <Card className="border-slate-800 bg-[#12182D] p-12 text-center text-xs text-slate-400">
          No withdrawal requests on file.
        </Card>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-800 bg-[#12182D]">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-800 bg-slate-900/80 text-slate-400 uppercase text-[10px]">
              <tr>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Worker</th>
                <th className="py-3 px-4">Channel & Destination</th>
                <th className="py-3 px-4">Net Amount</th>
                <th className="py-3 px-4">Risk</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {withdrawals.map((w) => {
                const isPending = w.status === "REQUESTED" || w.status === "PROCESSING";
                return (
                  <tr key={w.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
                      {formatDateTime(w.createdAt)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-white">{w.user.email}</div>
                      <div className="text-[10px] text-slate-400">{w.user.country}</div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="outline" className="text-[10px] mb-1">
                        {w.method}
                      </Badge>
                      <div className="text-[11px] text-slate-300 font-mono">
                        {w.destination?.accountNumber || w.destination?.mobileNumber || w.destination?.walletAddress || "Direct"}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-bold text-emerald-400">
                      {formatCurrency(Number(w.netAmount), w.currency)}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`text-[11px] font-bold ${Number(w.riskScore) > 30 ? "text-red-400" : "text-emerald-400"}`}>
                        {Number(w.riskScore).toFixed(0)}/100
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <Badge
                        variant={w.status === "COMPLETED" ? "success" : w.status === "FAILED" ? "destructive" : "warning"}
                        className="text-[10px]"
                      >
                        {w.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {isPending ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            size="sm"
                            onClick={() => handleAction(w.id, "APPROVE")}
                            disabled={processingId === w.id}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] h-7 px-2.5"
                          >
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleAction(w.id, "REJECT")}
                            disabled={processingId === w.id}
                            className="border-red-900/60 text-red-400 text-[11px] h-7 px-2"
                          >
                            Reject & Refund
                          </Button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-500 italic">Settled</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

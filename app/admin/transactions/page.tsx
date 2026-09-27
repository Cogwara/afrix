import React from "react";
import Link from "next/link";
import { History, ArrowLeft, ShieldCheck, DollarSign, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { prisma } from "@/lib/prisma";

export default async function AdminTransactionsPage() {
  const transactions = await prisma.ledgerTransaction.findMany({
    include: {
      wallet: {
        include: {
          user: { select: { email: true, country: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
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
          <h1 className="text-2xl font-bold text-white font-display">Immutable Ledger Records</h1>
          <p className="text-xs text-slate-400">
            Cryptographically auditable double-entry platform ledger. Transaction records cannot be updated or deleted.
          </p>
        </div>
        <Badge variant="outline" className="text-xs">{transactions.length} Total Records</Badge>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-800 bg-[#12182D]">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-slate-800 bg-slate-900/80 text-slate-400 uppercase text-[10px]">
            <tr>
              <th className="py-3 px-4">Date</th>
              <th className="py-3 px-4">Account Holder</th>
              <th className="py-3 px-4">Description & Reference</th>
              <th className="py-3 px-4">Type</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80">
            {transactions.map((tx) => {
              const isCredit = tx.direction === "CREDIT";
              return (
                <tr key={tx.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
                    {formatDateTime(tx.createdAt)}
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-white">{tx.wallet.user.email}</div>
                    <div className="text-[10px] text-slate-400">{tx.wallet.user.country}</div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-200">{tx.description}</div>
                    <div className="font-mono text-[10px] text-slate-500 mt-0.5">{tx.reference}</div>
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant={isCredit ? "default" : "outline"} className="text-[10px]">
                      {tx.transactionType.replace("_", " ")}
                    </Badge>
                  </td>
                  <td className="py-3 px-4">
                    <Badge
                      variant={tx.status === "COMPLETED" ? "success" : tx.status === "PENDING" ? "warning" : "destructive"}
                      className="text-[10px]"
                    >
                      {tx.status}
                    </Badge>
                  </td>
                  <td className={`py-3 px-4 text-right font-bold whitespace-nowrap ${isCredit ? "text-emerald-400" : "text-amber-400"}`}>
                    {isCredit ? "+" : "-"}{formatCurrency(Number(tx.amount), tx.currency)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

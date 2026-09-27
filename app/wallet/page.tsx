import React from "react";
import Link from "next/link";
import {
  Wallet,
  ArrowUpRight,
  TrendingUp,
  History,
  CheckCircle2,
  Clock,
  AlertCircle,
  ShieldCheck,
  CreditCard,
  Building,
  Smartphone,
  Coins,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { LedgerService } from "@/lib/ledger/service";

export default async function WalletPage() {
  const user = await getCurrentUser();

  let userId = user?.profile?.id;
  if (!userId) {
    const demo = await prisma.userProfile.findFirst({
      where: { role: "WORKER" },
    });
    if (demo) userId = demo.id;
  }

  const walletData = userId
    ? await LedgerService.getUserWalletWithTransactions(userId, 25)
    : null;

  const wallet = walletData?.wallet;
  const transactions = walletData?.transactions || [];
  const withdrawals = walletData?.withdrawals || [];

  const available = wallet ? Number(wallet.availableBalance) : 14.20;
  const pending = wallet ? Number(wallet.pendingBalance) : 0.00;
  const lifetimeEarned = wallet ? Number(wallet.lifetimeEarned) : 29.20;
  const lifetimeWithdrawn = wallet ? Number(wallet.lifetimeWithdrawn) : 15.00;

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8 space-y-8">
      {/* Wallet Banner & Cash Out Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
            Earnings & Wallet
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Backed by an immutable financial ledger. Track every verified reward and withdrawal.
          </p>
        </div>

        <Link href="/wallet/withdraw">
          <Button className="bg-secondary hover:bg-secondary/90 text-white font-semibold shadow-glow-green">
            <ArrowUpRight className="mr-1.5 h-4 w-4" /> Request Withdrawal
          </Button>
        </Link>
      </div>

      {/* Balance Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-secondary/40 bg-gradient-to-br from-[#12182D] to-[#0A1A22] p-5 relative overflow-hidden">
          <div className="text-xs text-slate-400 font-medium">Available Balance</div>
          <div className="text-3xl font-black text-white mt-1">
            {formatCurrency(available)}
          </div>
          <div className="text-[11px] text-emerald-400 flex items-center gap-1 mt-2">
            <CheckCircle2 className="h-3 w-3" /> Ready for immediate payout
          </div>
        </Card>

        <Card className="border-slate-800 bg-[#12182D] p-5">
          <div className="text-xs text-slate-400 font-medium">Reserved / Pending</div>
          <div className="text-3xl font-black text-amber-400 mt-1">
            {formatCurrency(pending)}
          </div>
          <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-2">
            <Clock className="h-3 w-3" /> In processing withdrawals
          </div>
        </Card>

        <Card className="border-slate-800 bg-[#12182D] p-5">
          <div className="text-xs text-slate-400 font-medium">Lifetime Earned</div>
          <div className="text-3xl font-black text-white mt-1">
            {formatCurrency(lifetimeEarned)}
          </div>
          <div className="text-[11px] text-blue-400 flex items-center gap-1 mt-2">
            <TrendingUp className="h-3 w-3" /> All verified task rewards
          </div>
        </Card>

        <Card className="border-slate-800 bg-[#12182D] p-5">
          <div className="text-xs text-slate-400 font-medium">Total Withdrawn</div>
          <div className="text-3xl font-black text-white mt-1">
            {formatCurrency(lifetimeWithdrawn)}
          </div>
          <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-2">
            <ShieldCheck className="h-3 w-3" /> Settled to bank/MoMo
          </div>
        </Card>
      </div>

      {/* Payout Channels Banner */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3">
          <span className="text-slate-400 font-semibold uppercase tracking-wider">Supported Channels:</span>
          <div className="flex items-center gap-2 text-slate-200">
            <Building className="h-4 w-4 text-blue-400" /> Local Banks (NGN, GHS, KES, ZAR)
          </div>
          <div className="flex items-center gap-2 text-slate-200">
            <Smartphone className="h-4 w-4 text-secondary" /> Mobile Money (M-Pesa, MTN)
          </div>
          <div className="flex items-center gap-2 text-slate-200">
            <Coins className="h-4 w-4 text-amber-400" /> Stablecoin (USDT / USDC)
          </div>
        </div>
        <Link href="/wallet/withdraw" className="text-primary hover:underline font-medium">
          Cash Out →
        </Link>
      </div>

      {/* Immutable Transaction Ledger Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white font-display flex items-center gap-2">
            <History className="h-5 w-5 text-primary" /> Immutable Ledger Records
          </h2>
          <span className="text-xs text-slate-400">Strict double-entry audit trail</span>
        </div>

        {transactions.length === 0 ? (
          <Card className="border-slate-800 bg-[#12182D] p-12 text-center text-xs text-slate-400">
            No financial transactions recorded yet. Complete tasks to earn ledger credits!
          </Card>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-800 bg-[#12182D]">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-800 bg-slate-900/80 text-slate-400 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Transaction / Reference</th>
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
                        <div className="font-semibold text-white">{tx.description}</div>
                        <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                          Ref: {tx.reference}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge
                          variant={isCredit ? "default" : "outline"}
                          className="text-[10px]"
                        >
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
        )}
      </div>
    </div>
  );
}

import React from "react";
import Link from "next/link";
import {
  Shield,
  Users,
  Briefcase,
  Layers,
  DollarSign,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Clock,
  History,
  CheckCircle2,
  FileCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { prisma } from "@/lib/prisma";

export default async function AdminDashboardPage() {
  const totalUsers = await prisma.userProfile.count();
  const activeWorkers = await prisma.userProfile.count({ where: { role: "WORKER", isSuspended: false } });
  const verifiedWorkers = await prisma.workerProfile.count({ where: { kycStatus: "VERIFIED" } });
  const businesses = await prisma.business.count();
  const activeCampaigns = await prisma.campaign.count({ where: { status: "ACTIVE" } });
  const tasksCompleted = await prisma.taskSubmission.count({ where: { status: "APPROVED" } });
  const pendingSubmissions = await prisma.taskSubmission.count({ where: { status: "SUBMITTED" } });
  const pendingWithdrawals = await prisma.withdrawal.count({ where: { status: "REQUESTED" } });
  const openFraudAlerts = await prisma.fraudEvent.count({ where: { status: "OPEN" } });

  const earningsSum = await prisma.ledgerTransaction.aggregate({
    where: { transactionType: "TASK_REWARD", status: "COMPLETED" },
    _sum: { amount: true },
  });

  const feeSum = await prisma.campaign.aggregate({
    _sum: { platformFee: true },
  });

  const totalWorkerEarnings = Number(earningsSum._sum.amount || 0);
  const platformRevenue = Number(feeSum._sum.platformFee || 0);

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8 space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Shield className="h-6 w-6 text-amber-400" />
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
              AFRIX Platform Administration
            </h1>
            <Badge variant="accent" className="text-xs">
              Super Admin
            </Badge>
          </div>
          <p className="text-xs text-slate-400">
            System health, compliance monitoring, fraud detection, and immutable financial oversight.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Workers */}
        <Card className="border-slate-800 bg-[#12182D] p-5">
          <span className="text-xs text-slate-400 font-medium">Registered Workers</span>
          <div className="text-2xl sm:text-3xl font-black text-white mt-1">
            {activeWorkers}
          </div>
          <span className="text-[11px] text-emerald-400 flex items-center gap-1 mt-2">
            <CheckCircle2 className="h-3 w-3" /> {verifiedWorkers} KYC Verified
          </span>
        </Card>

        {/* Enterprises */}
        <Card className="border-slate-800 bg-[#12182D] p-5">
          <span className="text-xs text-slate-400 font-medium">Active Businesses</span>
          <div className="text-2xl sm:text-3xl font-black text-white mt-1">
            {businesses}
          </div>
          <span className="text-[11px] text-blue-400 flex items-center gap-1 mt-2">
            <Layers className="h-3 w-3" /> {activeCampaigns} active campaigns
          </span>
        </Card>

        {/* Total Worker Earnings */}
        <Card className="border-slate-800 bg-[#12182D] p-5">
          <span className="text-xs text-slate-400 font-medium">Total Worker Earnings</span>
          <div className="text-2xl sm:text-3xl font-black text-emerald-400 mt-1">
            {formatCurrency(totalWorkerEarnings)}
          </div>
          <span className="text-[11px] text-slate-400 mt-2 block">
            {tasksCompleted} tasks approved
          </span>
        </Card>

        {/* Platform Revenue */}
        <Card className="border-slate-800 bg-[#12182D] p-5">
          <span className="text-xs text-slate-400 font-medium">Platform Fee Revenue</span>
          <div className="text-2xl sm:text-3xl font-black text-amber-400 mt-1">
            {formatCurrency(platformRevenue)}
          </div>
          <span className="text-[11px] text-slate-400 mt-2 block">
            Enterprise campaign fee share
          </span>
        </Card>
      </div>

      {/* Action Center Banners */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Pending Submissions */}
        <Card className="border-slate-800 bg-slate-900/60 p-5 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 block">Pending Submissions</span>
            <span className="text-xl font-bold text-white">{pendingSubmissions} in review</span>
          </div>
          <Link href="/admin/submissions">
            <Button size="sm" variant="outline" className="border-slate-700 text-xs">
              Audit Queue →
            </Button>
          </Link>
        </Card>

        {/* Pending Withdrawals */}
        <Card className="border-slate-800 bg-slate-900/60 p-5 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 block">Pending Withdrawals</span>
            <span className="text-xl font-bold text-amber-400">{pendingWithdrawals} requests</span>
          </div>
          <Link href="/admin/withdrawals">
            <Button size="sm" variant="outline" className="border-slate-700 text-xs">
              Review Payouts →
            </Button>
          </Link>
        </Card>

        {/* Fraud Alerts */}
        <Card className="border-red-900/40 bg-red-950/20 p-5 flex items-center justify-between">
          <div>
            <span className="text-xs text-red-400 block">Active Fraud Alerts</span>
            <span className="text-xl font-bold text-red-400">{openFraudAlerts} flags</span>
          </div>
          <Link href="/admin/fraud">
            <Button size="sm" variant="outline" className="border-red-900/60 text-red-400 hover:bg-red-500/10 text-xs">
              Inspect Flags →
            </Button>
          </Link>
        </Card>
      </div>

      {/* Admin Modules Navigation */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white font-display">Administration Modules</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          <Link
            href="/admin/users"
            className="flex items-center gap-3 p-4 rounded-xl border border-slate-800 bg-[#12182D] hover:border-slate-700 transition-colors"
          >
            <div className="h-10 w-10 rounded-lg bg-blue-500/10 text-primary flex items-center justify-center shrink-0">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Users Management</h4>
              <p className="text-slate-400 text-[11px]">Inspect worker profiles, KYC status, and suspensions</p>
            </div>
          </Link>

          <Link
            href="/admin/submissions"
            className="flex items-center gap-3 p-4 rounded-xl border border-slate-800 bg-[#12182D] hover:border-slate-700 transition-colors"
          >
            <div className="h-10 w-10 rounded-lg bg-secondary/10 text-secondary flex items-center justify-center shrink-0">
              <FileCheck className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Submission Audits</h4>
              <p className="text-slate-400 text-[11px]">Quality consensus and task compliance reviews</p>
            </div>
          </Link>

          <Link
            href="/admin/withdrawals"
            className="flex items-center gap-3 p-4 rounded-xl border border-slate-800 bg-[#12182D] hover:border-slate-700 transition-colors"
          >
            <div className="h-10 w-10 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
              <DollarSign className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Withdrawal Operations</h4>
              <p className="text-slate-400 text-[11px]">Settle or reverse payout requests with ledger safety</p>
            </div>
          </Link>

          <Link
            href="/admin/transactions"
            className="flex items-center gap-3 p-4 rounded-xl border border-slate-800 bg-[#12182D] hover:border-slate-700 transition-colors"
          >
            <div className="h-10 w-10 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0">
              <History className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Ledger Transactions</h4>
              <p className="text-slate-400 text-[11px]">Immutable double-entry financial transaction logs</p>
            </div>
          </Link>

          <Link
            href="/admin/fraud"
            className="flex items-center gap-3 p-4 rounded-xl border border-slate-800 bg-[#12182D] hover:border-slate-700 transition-colors"
          >
            <div className="h-10 w-10 rounded-lg bg-red-500/10 text-red-400 flex items-center justify-center shrink-0">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Fraud Detection</h4>
              <p className="text-slate-400 text-[11px]">Device reuse, impossible completion speeds, VPNs</p>
            </div>
          </Link>

          <Link
            href="/admin/audit"
            className="flex items-center gap-3 p-4 rounded-xl border border-slate-800 bg-[#12182D] hover:border-slate-700 transition-colors"
          >
            <div className="h-10 w-10 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Audit Trail</h4>
              <p className="text-slate-400 text-[11px]">Immutable system audit logs of all admin actions</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}

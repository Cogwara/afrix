import React from "react";
import Link from "next/link";
import {
  Users,
  Award,
  Copy,
  CheckCircle2,
  Clock,
  ShieldCheck,
  AlertCircle,
  Share2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/session";

export default async function ReferralsPage() {
  const user = await getCurrentUser();

  let userProfile = user?.profile;
  if (!userProfile) {
    const demo = await prisma.userProfile.findFirst({
      where: { role: "WORKER" },
    });
    if (demo) userProfile = demo;
  }

  const referralCode = userProfile?.referralCode || "AFX-DEMO";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://afrix.work";
  const referralLink = `${appUrl}/register?ref=${referralCode}`;

  // Fetch referrals made by this user
  const referrals = userProfile
    ? await prisma.referral.findMany({
        where: { referrerId: userProfile.id },
        include: {
          referredUser: {
            select: { email: true, country: true, createdAt: true },
          },
        },
        orderBy: { createdAt: "desc" },
      })
    : [];

  const qualifiedCount = referrals.filter((r) => r.status === "QUALIFIED" || r.status === "REWARDED").length;
  const totalBonusEarned = referrals.reduce((sum, r) => sum + Number(r.rewardAmount), 0);

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
              Refer & Earn Program
            </h1>
            <Badge variant="secondary" className="text-xs">
              Productivity-Linked Bonuses
            </Badge>
          </div>
          <p className="text-xs text-slate-400">
            Earn $0.50 for every friend who joins AFRIX and completes their first 3 legitimate tasks.
          </p>
        </div>
      </div>

      {/* Referral Link & Stats Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Referral Link Copy Box (2 cols) */}
        <Card className="border-slate-800 bg-[#12182D] p-6 md:col-span-2 space-y-4">
          <h3 className="text-base font-bold text-white font-display flex items-center gap-2">
            <Share2 className="h-4 w-4 text-primary" /> Your Unique Referral Link
          </h3>
          <p className="text-xs text-slate-400">
            Share this link with fellow digital workers in your university, neighborhood, or online communities.
          </p>

          <div className="flex items-center gap-2">
            <Input
              readOnly
              value={referralLink}
              className="bg-slate-900 border-slate-700 font-mono text-xs text-primary"
            />
            <Button
              size="sm"
              onClick={() => {
                if (typeof window !== "undefined") {
                  navigator.clipboard.writeText(referralLink);
                  alert("Referral link copied to clipboard!");
                }
              }}
              className="bg-primary text-white shrink-0"
            >
              <Copy className="h-4 w-4 mr-1.5" /> Copy
            </Button>
          </div>

          <div className="flex items-center gap-3 pt-2 text-xs text-slate-400">
            <span>Referral Code:</span>
            <span className="font-mono font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
              {referralCode}
            </span>
          </div>
        </Card>

        {/* Stats (1 col) */}
        <Card className="border-slate-800 bg-[#12182D] p-6 space-y-4">
          <h3 className="text-base font-bold text-white font-display flex items-center gap-2">
            <Award className="h-4 w-4 text-amber-400" /> Referral Earnings
          </h3>

          <div className="space-y-3">
            <div>
              <span className="text-xs text-slate-400 block">Total Rewarded</span>
              <span className="text-2xl font-black text-emerald-400">
                {formatCurrency(totalBonusEarned)}
              </span>
            </div>

            <div className="flex justify-between border-t border-slate-800/80 pt-2 text-xs text-slate-400">
              <span>Friends Invited:</span>
              <span className="text-white font-bold">{referrals.length}</span>
            </div>

            <div className="flex justify-between border-t border-slate-800/80 pt-2 text-xs text-slate-400">
              <span>Qualified & Paid:</span>
              <span className="text-emerald-400 font-bold">{qualifiedCount}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Compliance & Qualification Rules Box */}
      <Card className="border-slate-800 bg-slate-900/60 p-5 space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
          <ShieldCheck className="h-4 w-4 text-secondary" /> Anti-Scam & Qualification Policy
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-400">
          <div className="rounded-lg bg-slate-900 p-3 border border-slate-800">
            <span className="font-bold text-white block mb-1">1. User Registers</span>
            Worker creates an account with verified email & country.
          </div>
          <div className="rounded-lg bg-slate-900 p-3 border border-slate-800">
            <span className="font-bold text-white block mb-1">2. Completes 3 Tasks</span>
            Worker must complete at least 3 legitimate, approved microtasks.
          </div>
          <div className="rounded-lg bg-slate-900 p-3 border border-slate-800">
            <span className="font-bold text-white block mb-1">3. Automated Bonus</span>
            Once verified without fraud, $0.50 is immediately credited to your ledger.
          </div>
        </div>
      </Card>

      {/* Referred Users Table */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white font-display">Referred Workers</h2>

        {referrals.length === 0 ? (
          <Card className="border-slate-800 bg-[#12182D] p-12 text-center text-xs text-slate-400">
            You haven't referred any workers yet. Copy your referral link above and share it!
          </Card>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-800 bg-[#12182D]">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-800 bg-slate-900/80 text-slate-400 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Worker</th>
                  <th className="py-3 px-4">Country</th>
                  <th className="py-3 px-4">Date Joined</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Reward</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {referrals.map((ref) => (
                  <tr key={ref.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-4 font-semibold text-white">
                      {ref.referredUser.email.replace(/(.{2})(.*)(@.*)/, "$1***$3")}
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      {ref.referredUser.country}
                    </td>
                    <td className="py-3 px-4 text-slate-400">
                      {formatDateTime(ref.createdAt)}
                    </td>
                    <td className="py-3 px-4">
                      <Badge
                        variant={
                          ref.status === "REWARDED"
                            ? "success"
                            : ref.status === "QUALIFIED"
                            ? "default"
                            : ref.status === "BLOCKED"
                            ? "destructive"
                            : "outline"
                        }
                        className="text-[10px]"
                      >
                        {ref.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-emerald-400">
                      {Number(ref.rewardAmount) > 0 ? formatCurrency(Number(ref.rewardAmount)) : "$0.00"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

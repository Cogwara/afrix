import React from "react";
import Link from "next/link";
import { Users, ArrowLeft, Shield, ShieldAlert, CheckCircle2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/utils";
import { prisma } from "@/lib/prisma";

export default async function AdminUsersPage() {
  const users = await prisma.userProfile.findMany({
    include: {
      workerProfile: true,
      businesses: true,
      wallet: true,
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
          <h1 className="text-2xl font-bold text-white font-display">User Accounts & Roles</h1>
          <p className="text-xs text-slate-400">Manage worker profiles, enterprises, KYC approvals, and account status.</p>
        </div>
        <Badge variant="outline" className="text-xs">{users.length} Registered Accounts</Badge>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-800 bg-[#12182D]">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-slate-800 bg-slate-900/80 text-slate-400 uppercase text-[10px]">
            <tr>
              <th className="py-3 px-4">User</th>
              <th className="py-3 px-4">Role</th>
              <th className="py-3 px-4">Country</th>
              <th className="py-3 px-4">KYC / Verified</th>
              <th className="py-3 px-4">Referral Code</th>
              <th className="py-3 px-4">Joined</th>
              <th className="py-3 px-4 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-slate-800/30 transition-colors">
                <td className="py-3 px-4">
                  <div className="font-semibold text-white">{u.email}</div>
                  {u.workerProfile && (
                    <div className="text-[10px] text-slate-400">
                      {u.workerProfile.firstName} {u.workerProfile.lastName} (Lvl {u.workerProfile.level})
                    </div>
                  )}
                  {u.businesses?.[0] && (
                    <div className="text-[10px] text-secondary">
                      {u.businesses[0].name}
                    </div>
                  )}
                </td>
                <td className="py-3 px-4">
                  <Badge variant={u.role === "ADMIN" ? "accent" : u.role === "BUSINESS" ? "secondary" : "default"} className="text-[10px]">
                    {u.role}
                  </Badge>
                </td>
                <td className="py-3 px-4 text-slate-300">{u.country}</td>
                <td className="py-3 px-4">
                  {u.workerProfile?.kycStatus === "VERIFIED" || u.isVerified ? (
                    <Badge variant="success" className="text-[10px]">VERIFIED</Badge>
                  ) : (
                    <Badge variant="outline" className="text-[10px]">UNVERIFIED</Badge>
                  )}
                </td>
                <td className="py-3 px-4 font-mono text-[11px] text-slate-400">{u.referralCode}</td>
                <td className="py-3 px-4 text-slate-400 whitespace-nowrap">{formatDateTime(u.createdAt)}</td>
                <td className="py-3 px-4 text-right">
                  {u.isSuspended ? (
                    <Badge variant="destructive" className="text-[10px]">SUSPENDED</Badge>
                  ) : (
                    <Badge variant="success" className="text-[10px]">ACTIVE</Badge>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

import React from "react";
import Link from "next/link";
import { Shield, ArrowLeft, Clock, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/utils";
import { prisma } from "@/lib/prisma";

export default async function AdminAuditPage() {
  const auditLogs = await prisma.auditLog.findMany({
    include: {
      user: { select: { email: true } },
    },
    orderBy: { createdAt: "desc" },
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
          <h1 className="text-2xl font-bold text-white font-display">System Audit Trail</h1>
          <p className="text-xs text-slate-400">
            Immutable log of all administrative actions, financial disbursements, and policy overrides.
          </p>
        </div>
        <Badge variant="outline" className="text-xs">{auditLogs.length} Logged Entries</Badge>
      </div>

      {auditLogs.length === 0 ? (
        <Card className="border-slate-800 bg-[#12182D] p-12 text-center text-xs text-slate-400">
          No administrative audit records logged yet.
        </Card>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-800 bg-[#12182D]">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-800 bg-slate-900/80 text-slate-400 uppercase text-[10px]">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Admin Actor</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Entity Type</th>
                <th className="py-3 px-4">Entity ID</th>
                <th className="py-3 px-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
                    {formatDateTime(log.createdAt)}
                  </td>
                  <td className="py-3 px-4 font-semibold text-white">
                    {log.user?.email || "System"}
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant="outline" className="text-[10px]">
                      {log.action}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-slate-300">{log.entityType}</td>
                  <td className="py-3 px-4 font-mono text-[10px] text-slate-400">
                    {log.entityId ? log.entityId.slice(0, 8) : "-"}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-[10px] text-slate-400">
                    {JSON.stringify(log.metadata)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

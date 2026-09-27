import React from "react";
import Link from "next/link";
import { Building, ShieldCheck, Mail, Phone, Globe, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/session";

export default async function BusinessSettingsPage() {
  const user = await getCurrentUser();

  const business = user?.business
    ? await prisma.business.findUnique({ where: { id: user.business.id } })
    : await prisma.business.findFirst();

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8 space-y-6">
      <div className="border-b border-slate-800/80 pb-4">
        <h1 className="text-2xl font-bold text-white font-display">Enterprise Settings</h1>
        <p className="text-xs text-slate-400">Manage business profile, organization verification, and API access.</p>
      </div>

      <Card className="border-slate-800 bg-[#12182D] p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Building className="h-5 w-5 text-secondary" />
            <h2 className="text-base font-bold text-white font-display">Company Profile</h2>
          </div>
          <Badge variant="success" className="text-xs">
            <ShieldCheck className="h-3.5 w-3.5 mr-1" />
            Verification Status: {business?.verificationStatus || "VERIFIED"}
          </Badge>
        </div>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <label className="text-xs text-slate-300">Company / Organization Name</label>
            <Input defaultValue={business?.name || "Kuda Market Intelligence"} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs text-slate-300">Official Email</label>
              <Input defaultValue={business?.email || "partner@kudaresearch.africa"} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-slate-300">Contact Phone</label>
              <Input defaultValue={business?.phone || "+2348012345678"} />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-slate-300">Website</label>
            <Input defaultValue={business?.website || "https://kudaresearch.africa"} />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-slate-300">Headquarters Address</label>
            <Input defaultValue={business?.address || "Victoria Island, Lagos, Nigeria"} />
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <Button size="sm" className="bg-secondary text-white font-semibold">
            Save Company Details
          </Button>
        </div>
      </Card>
    </div>
  );
}

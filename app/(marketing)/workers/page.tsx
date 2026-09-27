import React from "react";
import Link from "next/link";
import { ArrowRight, Trophy, Zap, Shield, HeartHandshake, PhoneCall } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function WorkersPage() {
  return (
    <div className="container mx-auto max-w-5xl px-4 py-16">
      <div className="text-center space-y-4 mb-16">
        <Badge variant="secondary">Worker Network</Badge>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white font-display">
          Earn with Dignity & Flexibility
        </h1>
        <p className="text-slate-400 max-w-xl mx-auto text-sm sm:text-base">
          Join Africa’s premier network of verified smartphone contributors. Earn real USD by helping global technology and local consumer goods companies.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        <Card className="border-slate-800 bg-[#12182D] p-6 space-y-3">
          <div className="h-10 w-10 rounded-lg bg-blue-500/10 text-primary flex items-center justify-center">
            <Zap className="h-5 w-5" />
          </div>
          <h3 className="text-lg font-bold text-white">Daily Payouts</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Your earnings go into your internal wallet as soon as tasks are approved. Request payouts to your Nigerian Bank, Kenya M-Pesa, Ghana MTN MoMo, or crypto.
          </p>
        </Card>

        <Card className="border-slate-800 bg-[#12182D] p-6 space-y-3">
          <div className="h-10 w-10 rounded-lg bg-secondary/10 text-secondary flex items-center justify-center">
            <Trophy className="h-5 w-5" />
          </div>
          <h3 className="text-lg font-bold text-white">Level Progression & XP</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Advance from Newbie to Pro worker status by maintaining high accuracy. Higher tiers gain access to premium $5-$25 field tasks and research bonuses.
          </p>
        </Card>

        <Card className="border-slate-800 bg-[#12182D] p-6 space-y-3">
          <div className="h-10 w-10 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
            <Shield className="h-5 w-5" />
          </div>
          <h3 className="text-lg font-bold text-white">Guaranteed Transparency</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Never pay a registration fee or deposit to work. All task funds are securely reserved in advance by business clients before campaigns go live.
          </p>
        </Card>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-8 text-center space-y-4">
        <h2 className="text-2xl font-bold text-white font-display">Ready to start earning from your phone?</h2>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          Sign up takes under 2 minutes. No prior experience needed, all instructions provided in English, French, and local African languages.
        </p>
        <Link href="/register" className="inline-block pt-2">
          <Button size="lg" className="bg-primary text-white font-semibold">
            Join the Worker Community <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}

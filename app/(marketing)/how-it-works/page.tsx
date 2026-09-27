import React from "react";
import Link from "next/link";
import { ArrowRight, Smartphone, ShieldCheck, CheckCircle2, DollarSign, Award, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function HowItWorksPage() {
  return (
    <div className="container mx-auto max-w-5xl px-4 py-16">
      <div className="text-center space-y-4 mb-16">
        <Badge variant="default">Simple 4-Step Process</Badge>
        <h1 className="text-4xl font-extrabold text-white font-display">How AFRIX Works</h1>
        <p className="text-slate-400 max-w-xl mx-auto text-sm sm:text-base">
          AFRIX provides legitimate digital microtasks funded by real enterprises. Earn money from anywhere in Africa using just your smartphone.
        </p>
      </div>

      <div className="space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-3">
            <span className="text-primary font-bold text-sm">STEP 01</span>
            <h2 className="text-2xl font-bold text-white">Create Your Free Account</h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Sign up in seconds using your email and specify your country (Nigeria, Kenya, Ghana, Uganda, or South Africa). Zero fees or deposits are ever required to start working.
            </p>
          </div>
          <Card className="p-6 bg-slate-900/60 border-slate-800">
            <div className="flex items-center gap-3 text-secondary font-semibold text-sm mb-2">
              <CheckCircle2 className="h-5 w-5" /> Instant Onboarding
            </div>
            <p className="text-xs text-slate-400">
              Complete your profile, link a payout method (Bank account, Mobile Money like M-Pesa/Airtel Money, or Stablecoins), and explore active microtasks immediately.
            </p>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-3 order-1 md:order-2">
            <span className="text-primary font-bold text-sm">STEP 02</span>
            <h2 className="text-2xl font-bold text-white">Select and Accept Tasks</h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Browse tasks matching your interests. Review instructions, estimated completion time, required proof (photos, audio recording, surveys), and guaranteed reward in USD.
            </p>
          </div>
          <Card className="p-6 bg-slate-900/60 border-slate-800 order-2 md:order-1">
            <div className="flex items-center gap-3 text-primary font-semibold text-sm mb-2">
              <Smartphone className="h-5 w-5" /> Built for Mobile
            </div>
            <p className="text-xs text-slate-400">
              Tasks are optimized for low data usage and mobile browsers. You can complete tasks on transit, in your neighborhood, or at home.
            </p>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-3">
            <span className="text-primary font-bold text-sm">STEP 03</span>
            <h2 className="text-2xl font-bold text-white">Submit Evidence & Review</h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Answer the questions and upload proof directly through the task runner. Depending on the task, validation is either automatic (instant check) or manually reviewed by the business team.
            </p>
          </div>
          <Card className="p-6 bg-slate-900/60 border-slate-800">
            <div className="flex items-center gap-3 text-amber-400 font-semibold text-sm mb-2">
              <Award className="h-5 w-5" /> Build Reputation & XP
            </div>
            <p className="text-xs text-slate-400">
              Accurate submissions earn you XP points that level up your worker tier from Newbie to Pro, unlocking higher-paying exclusive tasks.
            </p>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-3 order-1 md:order-2">
            <span className="text-primary font-bold text-sm">STEP 04</span>
            <h2 className="text-2xl font-bold text-white">Receive Earnings in Your Wallet</h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Every approved task immediately credits your immutable financial ledger. Request a withdrawal at any time to receive funds directly to your preferred account.
            </p>
          </div>
          <Card className="p-6 bg-slate-900/60 border-slate-800 order-2 md:order-1">
            <div className="flex items-center gap-3 text-secondary font-semibold text-sm mb-2">
              <DollarSign className="h-5 w-5" /> Transparent Financial Ledger
            </div>
            <p className="text-xs text-slate-400">
              Every credit and debit is permanently recorded with full auditability. No hidden deductions, no delayed payout games.
            </p>
          </Card>
        </div>
      </div>

      <div className="mt-16 text-center">
        <Link href="/register">
          <Button size="lg" className="bg-primary text-white font-bold px-8 shadow-glow">
            Get Started Now <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}

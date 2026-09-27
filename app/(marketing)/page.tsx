import React from "react";
import Link from "next/link";
import {
  Smartphone,
  Globe,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  DollarSign,
  TrendingUp,
  MapPin,
  Mic,
  Cpu,
  Store,
  Layers,
  Award,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function LandingPage() {
  return (
    <div className="flex flex-col w-full overflow-hidden">
      {/* Hero Section */}
      <section className="relative px-4 pt-16 pb-20 md:pt-24 md:pb-32 bg-gradient-to-b from-[#0B1020] via-[#0D152F] to-[#0B1020]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(11,92,255,0.25),rgba(255,255,255,0))] pointer-events-none" />

        <div className="container mx-auto max-w-5xl text-center relative z-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-medium text-blue-400 mb-6 backdrop-blur-sm">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Pan-African Digital Work Marketplace</span>
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-6xl md:text-7xl font-display leading-[1.1]">
            Work from your phone. <br />
            <span className="bg-gradient-to-r from-blue-400 via-secondary to-amber-300 bg-clip-text text-transparent">
              Earn globally.
            </span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed font-normal">
            AFRIX connects African workers with verified businesses that need legitimate digital work: AI data labeling, local business verification, audio transcription, and market research.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-white font-semibold text-base shadow-glow px-8 h-13">
                Start Earning
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/business/campaigns/new" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full sm:w-auto border-slate-700 hover:bg-slate-800 text-slate-200 text-base h-13">
                Post a Task
              </Button>
            </Link>
          </div>

          {/* Value Badges */}
          <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-4 max-w-3xl mx-auto border-t border-slate-800/80 pt-8 text-left">
            <div className="space-y-1">
              <div className="text-xl sm:text-2xl font-bold text-white">100%</div>
              <div className="text-xs text-slate-400">Legitimate Microtasks</div>
            </div>
            <div className="space-y-1">
              <div className="text-xl sm:text-2xl font-bold text-secondary">Zero Fee</div>
              <div className="text-xs text-slate-400">Free to Join & Work</div>
            </div>
            <div className="space-y-1">
              <div className="text-xl sm:text-2xl font-bold text-amber-400">Instant USD</div>
              <div className="text-xs text-slate-400">Withdraw to Bank / MoMo</div>
            </div>
            <div className="space-y-1">
              <div className="text-xl sm:text-2xl font-bold text-blue-400">5+ Countries</div>
              <div className="text-xs text-slate-400">Pan-African Network</div>
            </div>
          </div>
        </div>
      </section>

      {/* Principle Banner */}
      <section className="border-y border-slate-800 bg-[#0E1528] py-4 px-4">
        <div className="container mx-auto max-w-4xl flex items-center justify-center gap-3 text-xs sm:text-sm text-slate-300 text-center">
          <ShieldCheck className="h-5 w-5 text-secondary shrink-0" />
          <span>
            <strong>Our Commitment:</strong> AFRIX is a real work marketplace. Workers earn from business-funded work. Not an investment scheme, zero deposit required to earn.
          </span>
        </div>
      </section>

      {/* How AFRIX Works */}
      <section className="py-20 px-4 bg-[#0B1020]">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center space-y-3 mb-16">
            <Badge variant="default" className="text-xs">Simple & Mobile-Friendly</Badge>
            <h2 className="text-3xl font-bold text-white sm:text-4xl font-display">
              How AFRIX Works
            </h2>
            <p className="text-slate-400 text-sm sm:text-base max-w-xl mx-auto">
              You only need a smartphone and an internet connection to begin earning real rewards.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="border-slate-800/80 bg-slate-900/60 relative overflow-hidden">
              <div className="absolute top-4 right-4 text-4xl font-black text-slate-800/40 select-none">01</div>
              <CardHeader>
                <div className="h-12 w-12 rounded-xl bg-blue-500/10 text-primary flex items-center justify-center mb-2">
                  <Smartphone className="h-6 w-6" />
                </div>
                <CardTitle className="text-xl">Pick a Task</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-slate-400 leading-relaxed">
                Choose tasks that match your skills: classify pictures, record local language voice clips, verify nearby stores, or test websites.
              </CardContent>
            </Card>

            <Card className="border-slate-800/80 bg-slate-900/60 relative overflow-hidden">
              <div className="absolute top-4 right-4 text-4xl font-black text-slate-800/40 select-none">02</div>
              <CardHeader>
                <div className="h-12 w-12 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center mb-2">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <CardTitle className="text-xl">Complete & Submit</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-slate-400 leading-relaxed">
                Follow simple instructions right on your phone. Upload required photos, audio snippets, or survey answers with automatic validation.
              </CardContent>
            </Card>

            <Card className="border-slate-800/80 bg-slate-900/60 relative overflow-hidden">
              <div className="absolute top-4 right-4 text-4xl font-black text-slate-800/40 select-none">03</div>
              <CardHeader>
                <div className="h-12 w-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-2">
                  <DollarSign className="h-6 w-6" />
                </div>
                <CardTitle className="text-xl">Get Paid Directly</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-slate-400 leading-relaxed">
                Approved work immediately credits your immutable wallet ledger. Cash out your earnings to local bank accounts, Mobile Money, or stablecoins.
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Popular Task Types */}
      <section className="py-20 px-4 bg-[#080D1A] border-t border-slate-800/80">
        <div className="container mx-auto max-w-5xl">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <Badge variant="secondary" className="mb-2">Diverse Opportunities</Badge>
              <h2 className="text-3xl font-bold text-white font-display">Popular Work on AFRIX</h2>
            </div>
            <Link href="/tasks">
              <Button variant="outline" className="border-slate-700 text-xs">
                Explore All Categories <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="rounded-xl border border-slate-800 bg-[#12182D] p-5 hover:border-primary/50 transition-all group">
              <div className="h-10 w-10 rounded-lg bg-blue-500/10 text-primary flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Store className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-white mb-1">Business Verification</h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-3">
                Verify local neighborhood stores, signs, and operating hours.
              </p>
              <div className="text-xs font-semibold text-emerald-400">$0.15 - $0.50 / task</div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-[#12182D] p-5 hover:border-secondary/50 transition-all group">
              <div className="h-10 w-10 rounded-lg bg-secondary/10 text-secondary flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Cpu className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-white mb-1">AI Data Labeling</h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-3">
                Tag text, categorize sentiment, and label images for AI algorithms.
              </p>
              <div className="text-xs font-semibold text-emerald-400">$0.08 - $0.40 / task</div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-[#12182D] p-5 hover:border-amber-500/50 transition-all group">
              <div className="h-10 w-10 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Mic className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-white mb-1">Voice & Audio Collection</h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-3">
                Record speech samples in indigenous African languages & accents.
              </p>
              <div className="text-xs font-semibold text-emerald-400">$0.35 - $1.50 / audio</div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-[#12182D] p-5 hover:border-purple-500/50 transition-all group">
              <div className="h-10 w-10 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Globe className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-white mb-1">Website & App Testing</h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-3">
                Test fintech flows and latency on local African telco networks.
              </p>
              <div className="text-xs font-semibold text-emerald-400">$1.00 - $3.50 / test</div>
            </div>
          </div>
        </div>
      </section>

      {/* For Businesses Section */}
      <section className="py-20 px-4 bg-[#0B1020]">
        <div className="container mx-auto max-w-5xl">
          <div className="rounded-2xl border border-slate-800 bg-gradient-to-br from-[#12182D] to-[#0D1426] p-8 md:p-12 relative overflow-hidden">
            <div className="max-w-xl space-y-5">
              <Badge variant="accent">For Enterprises & AI Teams</Badge>
              <h2 className="text-3xl sm:text-4xl font-bold text-white font-display">
                High-Quality African Data at Scale
              </h2>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                Train your AI models on authentic African accents, dialects, and retail realities. Access thousands of verified on-the-ground contributors across Nigeria, Kenya, Ghana, Uganda, and South Africa.
              </p>

              <div className="space-y-2.5 pt-2">
                <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-300">
                  <CheckCircle2 className="h-4 w-4 text-secondary shrink-0" />
                  GPS-tagged and timestamped evidence collection
                </div>
                <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-300">
                  <CheckCircle2 className="h-4 w-4 text-secondary shrink-0" />
                  Consensus reviews and automated anomaly detection
                </div>
                <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-300">
                  <CheckCircle2 className="h-4 w-4 text-secondary shrink-0" />
                  Only pay for approved, verified submissions
                </div>
              </div>

              <div className="pt-4 flex flex-wrap gap-4">
                <Link href="/business/campaigns/new">
                  <Button className="bg-secondary hover:bg-secondary/90 text-white font-semibold">
                    Launch a Campaign
                  </Button>
                </Link>
                <Link href="/businesses">
                  <Button variant="outline" className="border-slate-700">
                    Learn About Enterprise Solutions
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 px-4 bg-gradient-to-t from-[#060913] to-[#0B1020] text-center border-t border-slate-800/80">
        <div className="container mx-auto max-w-3xl space-y-6">
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white font-display">
            Ready to earn your first dollar today?
          </h2>
          <p className="text-slate-400 text-sm sm:text-base max-w-lg mx-auto">
            Join thousands of African workers already completing tasks, levelling up their reputation, and earning with their smartphones.
          </p>
          <div className="pt-4">
            <Link href="/register">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-white font-bold text-base px-8 h-13 shadow-glow">
                Create Free Account
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

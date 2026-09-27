import React from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, ShieldAlert, Database, MapPin, Mic, FileSpreadsheet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function BusinessesPage() {
  return (
    <div className="container mx-auto max-w-5xl px-4 py-16">
      <div className="text-center space-y-4 mb-16">
        <Badge variant="accent">Enterprise Data Solutions</Badge>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white font-display">
          Authentic African Data for Global AI & Enterprise
        </h1>
        <p className="text-slate-400 max-w-2xl mx-auto text-sm sm:text-base">
          Stop relying on synthetic data or inaccurate proxies. Collect verified physical evidence, local speech samples, and retail audit data directly from the ground across Africa.
        </p>
        <div className="pt-2 flex justify-center gap-4">
          <Link href="/business/campaigns/new">
            <Button size="lg" className="bg-secondary text-white font-semibold">
              Create a Campaign <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Link href="/login">
            <Button size="lg" variant="outline" className="border-slate-700">
              Business Portal Login
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
        <Card className="border-slate-800 bg-[#12182D] p-6 space-y-4">
          <div className="h-10 w-10 rounded-lg bg-blue-500/10 text-primary flex items-center justify-center">
            <Mic className="h-5 w-5" />
          </div>
          <h3 className="text-xl font-bold text-white">African Speech & NLP Datasets</h3>
          <p className="text-sm text-slate-300 leading-relaxed">
            Train generative AI, voice bots, and ASR models on real African speakers. Collect accents and dialects across Yoruba, Igbo, Hausa, Swahili, Amharic, Zulu, and Nigerian Pidgin.
          </p>
          <div className="space-y-2 text-xs text-slate-400">
            <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-secondary" /> Native acoustic environments & varied telephony codecs</div>
            <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-secondary" /> Acoustic metadata and demographic segmentation</div>
          </div>
        </Card>

        <Card className="border-slate-800 bg-[#12182D] p-6 space-y-4">
          <div className="h-10 w-10 rounded-lg bg-secondary/10 text-secondary flex items-center justify-center">
            <MapPin className="h-5 w-5" />
          </div>
          <h3 className="text-xl font-bold text-white">Field Verification & Retail Audits</h3>
          <p className="text-sm text-slate-300 leading-relaxed">
            Monitor shelf placement, out-of-stock frequency, retail compliance, and price changes across informal kiosks and open-air markets that traditional scanners miss.
          </p>
          <div className="space-y-2 text-xs text-slate-400">
            <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-secondary" /> Anti-tamper GPS geolocation tagging</div>
            <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-secondary" /> High-resolution storefront and receipt verification</div>
          </div>
        </Card>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="text-white font-semibold">Need custom enterprise data collection?</h4>
          <p className="text-xs text-slate-400">We provide dedicated campaign managers and bulk CSV/JSON API streaming.</p>
        </div>
        <Link href="/register?role=BUSINESS">
          <Button variant="outline" className="border-slate-700 whitespace-nowrap">
            Register as Business
          </Button>
        </Link>
      </div>
    </div>
  );
}

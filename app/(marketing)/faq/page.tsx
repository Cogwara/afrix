import React from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const FAQS = [
  {
    q: "Is AFRIX free to join?",
    a: "Yes, 100% free. AFRIX will never ask you to pay a registration fee, purchase VIP levels, or deposit money to start working. Legitimate work marketplaces never charge workers to earn.",
  },
  {
    q: "How do workers get paid?",
    a: "When your task submission is approved, the reward amount is instantly credited to your AFRIX wallet ledger. You can withdraw your earnings to your local bank account, Mobile Money (e.g. M-Pesa, MTN MoMo), or supported stablecoins.",
  },
  {
    q: "Where does the reward money come from?",
    a: "Rewards are funded by legitimate business clients—such as AI technology companies, FMCG manufacturers, and market research institutions—who fund campaigns to collect data, transcribe audio, or verify local retail stores.",
  },
  {
    q: "What types of tasks are available?",
    a: "Tasks include local business signboard verification, AI bounding box labeling, recording speech snippets in African languages, transcription, translation, and retail price checks.",
  },
  {
    q: "How does the referral program work?",
    a: "You earn a legitimate bonus when an invited friend registers, passes fraud checks, and completes at least 3 approved tasks. Rewards are only given for real, productive platform activity, never for recruitment alone.",
  },
  {
    q: "What is the reputation score and XP?",
    a: "Your reputation score reflects your submission accuracy, completion rate, and reliability. High scores and earned XP increase your worker level from Newbie to Pro, unlocking higher-paying priority tasks.",
  },
];

export default function FAQPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-16">
      <div className="text-center space-y-4 mb-12">
        <Badge variant="default">Answers to Common Questions</Badge>
        <h1 className="text-4xl font-extrabold text-white font-display">Frequently Asked Questions</h1>
        <p className="text-slate-400 text-sm sm:text-base">
          Everything you need to know about working, posting tasks, and earning on AFRIX.
        </p>
      </div>

      <div className="space-y-4">
        {FAQS.map((faq, i) => (
          <Card key={i} className="border-slate-800 bg-[#12182D]/90 p-5">
            <h3 className="text-base font-semibold text-white mb-2">{faq.q}</h3>
            <p className="text-sm text-slate-300 leading-relaxed">{faq.a}</p>
          </Card>
        ))}
      </div>

      <div className="mt-12 text-center p-8 rounded-xl border border-slate-800 bg-slate-900/40 space-y-3">
        <h3 className="text-lg font-bold text-white">Still have questions?</h3>
        <p className="text-xs text-slate-400">Our support team is available to assist both workers and enterprise partners.</p>
        <Link href="/register">
          <Button className="bg-primary text-white">Create Account & Start Earning</Button>
        </Link>
      </div>
    </div>
  );
}

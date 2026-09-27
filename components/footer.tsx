import React from "react";
import Link from "next/link";
import { ShieldCheck, Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-[#070B16] text-slate-400 text-sm">
      <div className="container mx-auto px-4 py-12 sm:px-6">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4 lg:grid-cols-5">
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-secondary text-white font-bold">
                <span className="text-lg">A</span>
              </div>
              <span className="text-xl font-black tracking-wider text-white">AFRIX</span>
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              Work from your phone. Earn globally. Connecting motivated African digital workers with global and regional enterprises needing microtasks, AI dataset labeling, and field verification.
            </p>
            <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-3 text-[11px] text-slate-400 flex items-start gap-2 max-w-sm">
              <ShieldCheck className="h-4 w-4 text-secondary shrink-0 mt-0.5" />
              <span>
                <strong>Legitimate Work Marketplace:</strong> Workers earn solely from completing verified enterprise-funded tasks. AFRIX is not an investment scheme and never charges registration fees to work.
              </span>
            </div>
          </div>

          {/* For Workers */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200">For Workers</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/tasks" className="hover:text-white transition-colors">Browse Microtasks</Link></li>
              <li><Link href="/how-it-works" className="hover:text-white transition-colors">How It Works</Link></li>
              <li><Link href="/leaderboard" className="hover:text-white transition-colors">Earnings Leaderboard</Link></li>
              <li><Link href="/missions" className="hover:text-white transition-colors">Daily Missions</Link></li>
              <li><Link href="/referrals" className="hover:text-white transition-colors">Referral Program</Link></li>
            </ul>
          </div>

          {/* For Businesses */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200">For Businesses</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/businesses" className="hover:text-white transition-colors">Post a Campaign</Link></li>
              <li><Link href="/business/campaigns/new" className="hover:text-white transition-colors">AI Data Labeling</Link></li>
              <li><Link href="/businesses#field-audit" className="hover:text-white transition-colors">Retail & Store Audit</Link></li>
              <li><Link href="/businesses#voice" className="hover:text-white transition-colors">African Voice Datasets</Link></li>
              <li><Link href="/faq" className="hover:text-white transition-colors">Enterprise SLA</Link></li>
            </ul>
          </div>

          {/* Legal & Compliance */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200">Trust & Legal</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/faq" className="hover:text-white transition-colors">Help & FAQ</Link></li>
              <li><span className="text-slate-500">Nigeria • Kenya • Ghana • SA</span></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between border-t border-slate-800/80 pt-6 sm:flex-row text-xs text-slate-500">
          <p>© {new Date().getFullYear()} AFRIX Marketplace Ltd. All rights reserved.</p>
          <p className="mt-2 sm:mt-0 flex items-center gap-1">
            Built for the African Digital Economy <Heart className="h-3 w-3 text-red-500 fill-red-500" />
          </p>
        </div>
      </div>
    </footer>
  );
}

"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Briefcase,
  Wallet,
  Trophy,
  Award,
  Users,
  Menu,
  X,
  Shield,
  Layers,
  LogOut,
  ChevronDown,
} from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

interface NavbarProps {
  user?: {
    email: string;
    role: string;
    availableBalance?: string | number;
  } | null;
}

export function Navbar({ user }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const isWorker = user?.role === "WORKER" || !user;
  const isBusiness = user?.role === "BUSINESS";
  const isAdmin = user?.role === "ADMIN";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800/80 bg-[#0B1020]/90 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-secondary text-white font-bold shadow-glow">
            <span className="text-xl tracking-tighter">A</span>
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-black tracking-wider text-white">AFRIX</span>
            <span className="hidden text-[10px] text-slate-400 font-medium sm:inline-block -mt-1">
              Earn Globally
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {user ? (
            <>
              {isWorker && (
                <>
                  <Link
                    href="/dashboard"
                    className={cn(
                      "text-sm font-medium transition-colors hover:text-white flex items-center gap-1.5",
                      pathname === "/dashboard" ? "text-primary font-semibold" : "text-slate-300"
                    )}
                  >
                    <Layers className="h-4 w-4" />
                    Dashboard
                  </Link>
                  <Link
                    href="/tasks"
                    className={cn(
                      "text-sm font-medium transition-colors hover:text-white flex items-center gap-1.5",
                      pathname.startsWith("/tasks") ? "text-primary font-semibold" : "text-slate-300"
                    )}
                  >
                    <Briefcase className="h-4 w-4" />
                    Tasks
                  </Link>
                  <Link
                    href="/missions"
                    className={cn(
                      "text-sm font-medium transition-colors hover:text-white flex items-center gap-1.5",
                      pathname === "/missions" ? "text-primary font-semibold" : "text-slate-300"
                    )}
                  >
                    <Award className="h-4 w-4" />
                    Missions
                  </Link>
                  <Link
                    href="/leaderboard"
                    className={cn(
                      "text-sm font-medium transition-colors hover:text-white flex items-center gap-1.5",
                      pathname === "/leaderboard" ? "text-primary font-semibold" : "text-slate-300"
                    )}
                  >
                    <Trophy className="h-4 w-4" />
                    Leaderboard
                  </Link>
                  <Link
                    href="/wallet"
                    className={cn(
                      "text-sm font-medium transition-colors hover:text-white flex items-center gap-1.5",
                      pathname.startsWith("/wallet") ? "text-primary font-semibold" : "text-slate-300"
                    )}
                  >
                    <Wallet className="h-4 w-4" />
                    Wallet
                  </Link>
                </>
              )}

              {isBusiness && (
                <>
                  <Link
                    href="/business/dashboard"
                    className={cn(
                      "text-sm font-medium transition-colors hover:text-white",
                      pathname === "/business/dashboard" ? "text-secondary font-semibold" : "text-slate-300"
                    )}
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/business/campaigns"
                    className={cn(
                      "text-sm font-medium transition-colors hover:text-white",
                      pathname.startsWith("/business/campaigns") ? "text-secondary font-semibold" : "text-slate-300"
                    )}
                  >
                    Campaigns
                  </Link>
                  <Link
                    href="/business/results"
                    className={cn(
                      "text-sm font-medium transition-colors hover:text-white",
                      pathname === "/business/results" ? "text-secondary font-semibold" : "text-slate-300"
                    )}
                  >
                    Results & Analytics
                  </Link>
                </>
              )}

              {isAdmin && (
                <>
                  <Link
                    href="/admin"
                    className={cn(
                      "text-sm font-medium transition-colors hover:text-white flex items-center gap-1.5",
                      pathname === "/admin" ? "text-amber-400 font-semibold" : "text-slate-300"
                    )}
                  >
                    <Shield className="h-4 w-4" />
                    Admin Center
                  </Link>
                  <Link
                    href="/admin/submissions"
                    className={cn(
                      "text-sm font-medium transition-colors hover:text-white",
                      pathname.startsWith("/admin/submissions") ? "text-amber-400 font-semibold" : "text-slate-300"
                    )}
                  >
                    Review Queue
                  </Link>
                  <Link
                    href="/admin/withdrawals"
                    className={cn(
                      "text-sm font-medium transition-colors hover:text-white",
                      pathname.startsWith("/admin/withdrawals") ? "text-amber-400 font-semibold" : "text-slate-300"
                    )}
                  >
                    Withdrawals
                  </Link>
                </>
              )}
            </>
          ) : (
            <>
              <Link
                href="/tasks"
                className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
              >
                Browse Tasks
              </Link>
              <Link
                href="/how-it-works"
                className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
              >
                How It Works
              </Link>
              <Link
                href="/businesses"
                className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
              >
                For Businesses
              </Link>
              <Link
                href="/leaderboard"
                className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
              >
                Leaderboard
              </Link>
            </>
          )}
        </nav>

        {/* Right CTA / Auth Status */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              {isWorker && user.availableBalance !== undefined && (
                <Link
                  href="/wallet"
                  className="flex items-center gap-1.5 rounded-full bg-slate-800/80 px-3.5 py-1.5 text-xs font-semibold text-emerald-400 border border-slate-700/60 hover:border-secondary/50 transition-colors"
                >
                  <span className="h-2 w-2 rounded-full bg-secondary animate-pulse" />
                  ${Number(user.availableBalance).toFixed(2)}
                </Link>
              )}

              <div className="flex items-center gap-2">
                <Link
                  href={isBusiness ? "/business/settings" : isWorker ? "/profile" : "/admin"}
                  className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-1.5 text-xs text-slate-200 hover:bg-slate-800 transition-colors"
                >
                  <span className="max-w-[120px] truncate">{user.email}</span>
                  <ChevronDown className="h-3 w-3 text-slate-400" />
                </Link>
                <form action="/api/auth/logout" method="POST">
                  <button
                    type="submit"
                    title="Log out"
                    className="p-2 text-slate-400 hover:text-red-400 transition-colors rounded-lg hover:bg-slate-800"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </form>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm" className="bg-primary hover:bg-primary/90 text-white font-semibold">
                  Start Earning
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-slate-300 hover:text-white"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-800 bg-[#0B1020] px-4 py-5 space-y-4">
          {user ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <span className="text-xs text-slate-400 truncate">{user.email}</span>
                {user.availableBalance !== undefined && (
                  <span className="text-xs font-bold text-emerald-400">
                    ${Number(user.availableBalance).toFixed(2)}
                  </span>
                )}
              </div>
              {isWorker && (
                <>
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-sm font-medium text-slate-200 py-1"
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/tasks"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-sm font-medium text-slate-200 py-1"
                  >
                    Marketplace Tasks
                  </Link>
                  <Link
                    href="/submissions"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-sm font-medium text-slate-200 py-1"
                  >
                    My Submissions
                  </Link>
                  <Link
                    href="/wallet"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-sm font-medium text-slate-200 py-1"
                  >
                    Wallet & Withdrawals
                  </Link>
                  <Link
                    href="/missions"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-sm font-medium text-slate-200 py-1"
                  >
                    Daily Missions
                  </Link>
                  <Link
                    href="/leaderboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-sm font-medium text-slate-200 py-1"
                  >
                    Leaderboard
                  </Link>
                  <Link
                    href="/referrals"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-sm font-medium text-slate-200 py-1"
                  >
                    Refer & Earn
                  </Link>
                  <Link
                    href="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-sm font-medium text-slate-200 py-1"
                  >
                    Profile & Reputation
                  </Link>
                </>
              )}
              {isBusiness && (
                <>
                  <Link
                    href="/business/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-sm font-medium text-slate-200 py-1"
                  >
                    Business Dashboard
                  </Link>
                  <Link
                    href="/business/campaigns"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-sm font-medium text-slate-200 py-1"
                  >
                    Manage Campaigns
                  </Link>
                  <Link
                    href="/business/campaigns/new"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-sm font-medium text-secondary py-1"
                  >
                    + Create New Campaign
                  </Link>
                </>
              )}
              {isAdmin && (
                <>
                  <Link
                    href="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-sm font-medium text-amber-400 py-1"
                  >
                    Admin Dashboard
                  </Link>
                  <Link
                    href="/admin/submissions"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-sm font-medium text-slate-200 py-1"
                  >
                    Review Submissions
                  </Link>
                  <Link
                    href="/admin/withdrawals"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-sm font-medium text-slate-200 py-1"
                  >
                    Approve Withdrawals
                  </Link>
                </>
              )}
              <form action="/api/auth/logout" method="POST" className="pt-2">
                <Button variant="outline" size="sm" className="w-full text-red-400 border-red-900/40">
                  Log Out
                </Button>
              </form>
            </div>
          ) : (
            <div className="space-y-3">
              <Link
                href="/tasks"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-sm font-medium text-slate-200 py-1"
              >
                Browse Tasks
              </Link>
              <Link
                href="/how-it-works"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-sm font-medium text-slate-200 py-1"
              >
                How It Works
              </Link>
              <Link
                href="/businesses"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-sm font-medium text-slate-200 py-1"
              >
                For Businesses
              </Link>
              <div className="pt-2 flex flex-col gap-2">
                <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full">
                    Sign In
                  </Button>
                </Link>
                <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full bg-primary font-semibold">
                    Start Earning
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      )}
    </header>
  );
}

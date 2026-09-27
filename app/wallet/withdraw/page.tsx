"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Building,
  Smartphone,
  Coins,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";

type MethodType = "BANK" | "MOBILE_MONEY" | "STABLECOIN";

export default function WithdrawPage() {
  const router = useRouter();

  const [availableBalance, setAvailableBalance] = useState<number>(0);
  const [loadingWallet, setLoadingWallet] = useState(true);
  const [method, setMethod] = useState<MethodType>("BANK");
  const [amount, setAmount] = useState<string>("10.00");

  // Destination fields
  const [bankName, setBankName] = useState("Access Bank (Nigeria)");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [mobileNetwork, setMobileNetwork] = useState("MTN MoMo");
  const [walletAddress, setWalletAddress] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    async function fetchWallet() {
      try {
        const res = await fetch("/api/wallet");
        if (res.ok) {
          const data = await res.json();
          setAvailableBalance(data.wallet.availableBalance);
        }
      } catch (err) {
        console.error("Failed to load wallet balance", err);
      } finally {
        setLoadingWallet(false);
      }
    }
    fetchWallet();
  }, []);

  const numAmount = parseFloat(amount) || 0;
  const fee = method === "BANK" ? 0.25 : method === "MOBILE_MONEY" ? 0.15 : 0.50;
  const netAmount = Math.max(0, numAmount - fee);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const destination: Record<string, string> = {};
      if (method === "BANK") {
        destination.bankCode = bankName;
        destination.accountNumber = accountNumber;
        destination.accountName = accountName;
      } else if (method === "MOBILE_MONEY") {
        destination.mobileNetwork = mobileNetwork;
        destination.mobileNumber = mobileNumber;
      } else {
        destination.walletAddress = walletAddress;
        destination.network = "USDT (TRC20)";
      }

      const res = await fetch("/api/wallet/withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: numAmount,
          currency: "USD",
          method,
          destination,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Withdrawal failed");
      }

      setSuccessMsg(data.message || "Withdrawal request processed successfully!");
      setAvailableBalance((prev) => Math.max(0, prev - numAmount));
    } catch (err: any) {
      setError(err.message || "Failed to process withdrawal");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8 space-y-6">
      <Link
        href="/wallet"
        className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Wallet
      </Link>

      <Card className="border-slate-800 bg-[#12182D] p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
          <div>
            <h1 className="text-xl font-bold text-white font-display">Request Withdrawal</h1>
            <p className="text-xs text-slate-400">Cash out your verified task rewards</p>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-400 block font-semibold uppercase">Available</span>
            <span className="text-xl font-black text-emerald-400">
              {formatCurrency(availableBalance)}
            </span>
          </div>
        </div>

        {successMsg ? (
          <div className="text-center py-8 space-y-4">
            <div className="mx-auto h-12 w-12 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-bold text-white font-display">Withdrawal Initiated</h3>
            <p className="text-xs text-slate-300 max-w-sm mx-auto">{successMsg}</p>
            <div className="pt-2 flex justify-center gap-3">
              <Link href="/wallet">
                <Button size="sm" className="bg-primary text-white">
                  View Wallet Ledger
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button size="sm" variant="outline" className="border-slate-700">
                  Return to Dashboard
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-xs text-red-400 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Payout Method Tabs */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">Choose Payout Method</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setMethod("BANK")}
                  className={`flex flex-col items-center justify-center p-3 rounded-lg border text-xs transition-colors ${
                    method === "BANK"
                      ? "border-primary bg-primary/10 text-white font-bold"
                      : "border-slate-800 bg-slate-900/40 text-slate-400 hover:text-white"
                  }`}
                >
                  <Building className="h-5 w-5 mb-1 text-blue-400" />
                  <span>Local Bank</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMethod("MOBILE_MONEY")}
                  className={`flex flex-col items-center justify-center p-3 rounded-lg border text-xs transition-colors ${
                    method === "MOBILE_MONEY"
                      ? "border-secondary bg-secondary/10 text-white font-bold"
                      : "border-slate-800 bg-slate-900/40 text-slate-400 hover:text-white"
                  }`}
                >
                  <Smartphone className="h-5 w-5 mb-1 text-secondary" />
                  <span>Mobile Money</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMethod("STABLECOIN")}
                  className={`flex flex-col items-center justify-center p-3 rounded-lg border text-xs transition-colors ${
                    method === "STABLECOIN"
                      ? "border-amber-400 bg-amber-400/10 text-white font-bold"
                      : "border-slate-800 bg-slate-900/40 text-slate-400 hover:text-white"
                  }`}
                >
                  <Coins className="h-5 w-5 mb-1 text-amber-400" />
                  <span>Stablecoin</span>
                </button>
              </div>
            </div>

            {/* Amount input */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <label className="font-semibold text-slate-300">Withdrawal Amount ($ USD)</label>
                <button
                  type="button"
                  onClick={() => setAmount(availableBalance.toFixed(2))}
                  className="text-primary hover:underline text-[11px]"
                >
                  Max Available (${availableBalance.toFixed(2)})
                </button>
              </div>
              <Input
                type="number"
                step="0.01"
                min="2.00"
                max={availableBalance}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>

            {/* Method specific fields */}
            {method === "BANK" && (
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-300">Bank Name</label>
                  <Input
                    placeholder="e.g. Access Bank, GTBank, Equity Bank, Standard Bank"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs text-slate-300">Account Number</label>
                    <Input
                      placeholder="0123456789"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-slate-300">Account Name</label>
                    <Input
                      placeholder="Full Name on Account"
                      value={accountName}
                      onChange={(e) => setAccountName(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {method === "MOBILE_MONEY" && (
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-300">Mobile Money Operator</label>
                  <select
                    className="flex h-10 w-full rounded-lg border border-slate-700/80 bg-slate-900/60 px-3 py-2 text-sm text-slate-100"
                    value={mobileNetwork}
                    onChange={(e) => setMobileNetwork(e.target.value)}
                  >
                    <option value="M-Pesa (Kenya/Tanzania)">M-Pesa (Kenya/Tanzania)</option>
                    <option value="MTN MoMo (Ghana/Uganda/Nigeria)">MTN MoMo (Ghana/Uganda/Nigeria)</option>
                    <option value="Airtel Money (Kenya/Uganda/Nigeria)">Airtel Money</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-300">Phone Number (registered with MoMo)</label>
                  <Input
                    placeholder="+254... or +233..."
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    required
                  />
                </div>
              </div>
            )}

            {method === "STABLECOIN" && (
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-300">USDT / USDC TRC20 or Polygon Wallet Address</label>
                  <Input
                    placeholder="T... or 0x..."
                    value={walletAddress}
                    onChange={(e) => setWalletAddress(e.target.value)}
                    required
                  />
                </div>
              </div>
            )}

            {/* Fee & Net preview */}
            <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Requested Amount</span>
                <span className="text-white font-medium">${numAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Network / Processing Fee</span>
                <span className="text-amber-400 font-medium">-${fee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-white border-t border-slate-800 pt-1.5">
                <span>You will receive</span>
                <span className="text-emerald-400">${netAmount.toFixed(2)} USD</span>
              </div>
            </div>

            <Button
              type="submit"
              disabled={submitting || numAmount > availableBalance || numAmount < 2}
              className="w-full bg-secondary hover:bg-secondary/90 text-white font-bold h-11"
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing Payout...
                </>
              ) : (
                `Confirm Withdrawal of $${netAmount.toFixed(2)}`
              )}
            </Button>
          </form>
        )}
      </Card>
    </div>
  );
}

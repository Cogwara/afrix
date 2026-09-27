"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, AlertCircle, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";

const COUNTRIES = [
  "Nigeria",
  "Kenya",
  "Ghana",
  "Uganda",
  "South Africa",
  "Rwanda",
  "Cameroon",
  "Egypt",
];

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [role, setRole] = useState<"WORKER" | "BUSINESS">("WORKER");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [country, setCountry] = useState("Nigeria");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [phone, setPhone] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const ref = searchParams?.get("ref");
    if (ref) setReferralCode(ref.toUpperCase());
    const roleParam = searchParams?.get("role");
    if (roleParam === "BUSINESS") setRole("BUSINESS");
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          country,
          role,
          firstName: role === "WORKER" ? firstName : undefined,
          lastName: role === "WORKER" ? lastName : undefined,
          businessName: role === "BUSINESS" ? businessName : undefined,
          phone: phone || undefined,
          referralCode: referralCode || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Registration failed");
      }

      // Auto login or redirect to dashboard
      if (role === "BUSINESS") {
        router.push("/business/dashboard");
      } else {
        router.push("/dashboard");
      }
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Failed to create account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-16">
      <Card className="w-full max-w-lg border-slate-800 bg-[#12182D]/95">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold font-display">Create AFRIX Account</CardTitle>
          <CardDescription>
            Join the pan-African digital work marketplace
          </CardDescription>

          {/* Role Toggle */}
          <div className="flex rounded-lg bg-slate-900/80 p-1 border border-slate-800 mt-4">
            <button
              type="button"
              onClick={() => setRole("WORKER")}
              className={`flex-1 rounded-md py-1.5 text-xs font-semibold transition-all ${
                role === "WORKER"
                  ? "bg-primary text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              I Want to Work & Earn
            </button>
            <button
              type="button"
              onClick={() => setRole("BUSINESS")}
              className={`flex-1 rounded-md py-1.5 text-xs font-semibold transition-all ${
                role === "BUSINESS"
                  ? "bg-secondary text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              I Want to Post Tasks (Business)
            </button>
          </div>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-xs text-red-400 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {role === "WORKER" ? (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">First Name</label>
                  <Input
                    placeholder="Chidi"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">Last Name</label>
                  <Input
                    placeholder="Okonkwo"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">Business / Organization Name</label>
                <Input
                  placeholder="Kuda Research Labs"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  required
                />
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Email Address</label>
              <Input
                type="email"
                placeholder="you@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">Country</label>
                <select
                  className="flex h-10 w-full rounded-lg border border-slate-700/80 bg-slate-900/60 px-3 py-2 text-sm text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  required
                >
                  {COUNTRIES.map((c) => (
                    <option key={c} value={c} className="bg-slate-900 text-white">
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">Phone (Optional)</label>
                <Input
                  type="tel"
                  placeholder="+234..."
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Password (min. 8 characters)</label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
              />
            </div>

            {role === "WORKER" && (
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">
                  Referral Code <span className="text-slate-500 font-normal">(Optional)</span>
                </label>
                <Input
                  placeholder="AFX-XXXXXX"
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                />
              </div>
            )}
          </CardContent>

          <CardFooter className="flex flex-col gap-4">
            <Button
              type="submit"
              disabled={loading}
              className={`w-full font-semibold ${
                role === "WORKER"
                  ? "bg-primary hover:bg-primary/90 text-white"
                  : "bg-secondary hover:bg-secondary/90 text-white"
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating Account...
                </>
              ) : (
                <>
                  {role === "WORKER" ? "Start Earning Free" : "Create Business Account"}{" "}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>

            <p className="text-center text-xs text-slate-400">
              Already have an account?{" "}
              <Link href="/login" className="text-primary font-medium hover:underline">
                Sign In
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

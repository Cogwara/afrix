"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate / call password reset
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 800);
  };

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-16">
      <Card className="w-full max-w-md border-slate-800 bg-[#12182D]/95">
        <CardHeader className="text-center space-y-1">
          <CardTitle className="text-2xl font-bold font-display">Reset Password</CardTitle>
          <CardDescription>
            Enter your account email to receive a password reset link
          </CardDescription>
        </CardHeader>
        {submitted ? (
          <CardContent className="space-y-4 text-center py-6">
            <div className="mx-auto h-12 w-12 rounded-full bg-secondary/10 text-secondary flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-semibold text-white">Check your email</h3>
            <p className="text-xs text-slate-400">
              We’ve sent instructions to <strong>{email}</strong> if an account exists with that address.
            </p>
            <div className="pt-4">
              <Link href="/login">
                <Button variant="outline" className="w-full border-slate-700">
                  Return to Sign In
                </Button>
              </Link>
            </div>
          </CardContent>
        ) : (
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
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
            </CardContent>
            <CardFooter className="flex flex-col gap-3">
              <Button type="submit" disabled={loading} className="w-full bg-primary text-white">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send Reset Link"}
              </Button>
              <Link href="/login" className="text-xs text-slate-400 hover:text-white flex items-center justify-center gap-1">
                <ArrowLeft className="h-3 w-3" /> Back to Sign In
              </Link>
            </CardFooter>
          </form>
        )}
      </Card>
    </div>
  );
}

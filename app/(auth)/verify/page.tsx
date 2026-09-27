import React from "react";
import Link from "next/link";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function VerifyPage() {
  return (
    <div className="flex flex-1 items-center justify-center px-4 py-16">
      <Card className="w-full max-w-md border-slate-800 bg-[#12182D]/95 text-center">
        <CardHeader className="space-y-2">
          <div className="mx-auto h-12 w-12 rounded-full bg-secondary/10 text-secondary flex items-center justify-center">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <CardTitle className="text-2xl font-bold font-display">Account Verified</CardTitle>
          <CardDescription>
            Your email has been confirmed. You are ready to explore tasks and start earning.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-2">
          <Link href="/dashboard">
            <Button className="w-full bg-primary text-white font-semibold">
              Go to Dashboard <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}

import React from "react";
import { Badge } from "@/components/ui/badge";

export default function PrivacyPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-16 prose prose-invert prose-slate">
      <div className="not-prose mb-8">
        <Badge variant="outline">Privacy</Badge>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white mt-2">Privacy Policy</h1>
        <p className="text-xs text-slate-400">Effective Date: September 2026</p>
      </div>

      <div className="space-y-6 text-sm text-slate-300 leading-relaxed">
        <section>
          <h2 className="text-lg font-bold text-white mb-2">1. Information We Collect</h2>
          <p>
            We collect account information (email, name, country, optional phone), task submissions (answers, submitted photos, audio recordings), and device signals (approximate location when required for field verification, device fingerprint) for fraud prevention.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-white mb-2">2. How We Protect Your Data</h2>
          <p>
            Private task evidence is stored securely in Supabase Storage with signed, time-limited access URLs. We never sell your personal contact details to third parties.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-white mb-2">3. Storage & Security</h2>
          <p>
            All network communication uses TLS 1.3 encryption. Passwords and credentials are cryptographically hashed and managed through Supabase Auth.
          </p>
        </section>
      </div>
    </div>
  );
}

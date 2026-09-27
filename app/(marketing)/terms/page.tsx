import React from "react";
import { Badge } from "@/components/ui/badge";

export default function TermsPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-16 prose prose-invert prose-slate">
      <div className="not-prose mb-8">
        <Badge variant="outline">Legal</Badge>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white mt-2">Terms of Service</h1>
        <p className="text-xs text-slate-400">Effective Date: September 2026</p>
      </div>

      <div className="space-y-6 text-sm text-slate-300 leading-relaxed">
        <section>
          <h2 className="text-lg font-bold text-white mb-2">1. Nature of the Marketplace</h2>
          <p>
            AFRIX is a digital work platform connecting independent digital workers with verified businesses needing microtasks, AI dataset labeling, and field verification. AFRIX is not an investment platform, multi-level marketing system, or deposit-based scheme.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-white mb-2">2. Worker Obligations & Integrity</h2>
          <p>
            Workers agree to submit authentic, truthful, and high-quality work. The use of automated bots, VPNs to circumvent geographic restrictions, duplicated responses, multiple accounts, or fraudulent submissions is strictly prohibited and subject to immediate account termination and forfeiture of unapproved balances.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-white mb-2">3. Business Client Terms</h2>
          <p>
            Businesses agree that campaigns must be funded in advance. Campaign funds are held in reserve for worker task rewards. Submissions must be reviewed in good faith according to published criteria.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-white mb-2">4. Payouts & Internal Ledger</h2>
          <p>
            Approved submissions are credited in accordance with the immutable internal ledger. Withdrawals are processed through authorized payment and payout providers.
          </p>
        </section>
      </div>
    </div>
  );
}

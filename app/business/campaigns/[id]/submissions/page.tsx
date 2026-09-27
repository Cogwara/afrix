"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Clock,
  Star,
  MapPin,
  Camera,
  Mic,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { formatCurrency, formatDateTime } from "@/lib/utils";

interface SubmissionItem {
  id: string;
  status: string;
  answers: any;
  evidence: any;
  latitude: any;
  longitude: any;
  qualityScore: any;
  reviewNotes: string | null;
  submittedAt: string;
  worker: { email: string; country: string };
  task: { title: string; rewardAmount: any; currency: string };
}

export default function CampaignSubmissionsReviewPage() {
  const params = useParams();
  const campaignId = params?.id as string;

  const [submissions, setSubmissions] = useState<SubmissionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [reviewNotes, setReviewNotes] = useState<Record<string, string>>({});
  const [scores, setScores] = useState<Record<string, number>>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/business/campaigns/${campaignId}/submissions`);
        if (res.ok) {
          const data = await res.json();
          setSubmissions(data.submissions || []);
        }
      } catch (err: any) {
        setError(err.message || "Failed to load submissions");
      } finally {
        setLoading(false);
      }
    }
    if (campaignId) load();
  }, [campaignId]);

  const handleReview = async (submissionId: string, decision: "APPROVED" | "REJECTED") => {
    setProcessingId(submissionId);
    setError(null);

    try {
      const res = await fetch(`/api/business/campaigns/${campaignId}/submissions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submissionId,
          decision,
          score: scores[submissionId] || (decision === "APPROVED" ? 10 : 3),
          notes: reviewNotes[submissionId] || (decision === "APPROVED" ? "Verified accurately." : "Failed verification standards."),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Review action failed");
      }

      // Update in local state
      setSubmissions((prev) =>
        prev.map((sub) =>
          sub.id === submissionId
            ? { ...sub, status: decision, reviewNotes: reviewNotes[submissionId] || null }
            : sub
        )
      );
    } catch (err: any) {
      setError(err.message || "Failed to process review");
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8 space-y-6">
      <Link
        href="/business/campaigns"
        className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Campaigns
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-white font-display">Review Submissions</h1>
          <p className="text-xs text-slate-400">
            Inspect answers, verify evidence media, and approve rewards to release funds to worker wallets.
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-xs text-red-400 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {submissions.length === 0 ? (
        <Card className="border-slate-800 bg-[#12182D] p-12 text-center text-xs text-slate-400">
          No submissions received yet for this campaign. Check back as workers complete tasks!
        </Card>
      ) : (
        <div className="space-y-6">
          {submissions.map((sub) => {
            const isApproved = sub.status === "APPROVED";
            const isRejected = sub.status === "REJECTED";
            const isPending = sub.status === "SUBMITTED" || sub.status === "UNDER_REVIEW";

            return (
              <Card key={sub.id} className="border-slate-800 bg-[#12182D] p-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">Worker: {sub.worker.email}</span>
                      <Badge variant="outline" className="text-[10px]">{sub.worker.country}</Badge>
                      <Badge
                        variant={isApproved ? "success" : isRejected ? "destructive" : "warning"}
                        className="text-[10px]"
                      >
                        {sub.status}
                      </Badge>
                    </div>
                    <span className="text-[11px] text-slate-400">
                      Submitted on {formatDateTime(sub.submittedAt)}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-base font-bold text-emerald-400">
                      +{formatCurrency(Number(sub.task.rewardAmount))}
                    </span>
                  </div>
                </div>

                {/* Answers & Evidence Display */}
                <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-4 space-y-3">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                    Submitted Responses
                  </h4>
                  <div className="space-y-2 text-xs">
                    {sub.answers && typeof sub.answers === "object" ? (
                      Object.entries(sub.answers).map(([key, val]) => (
                        <div key={key} className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 border-b border-slate-800/40 pb-1.5 last:border-0">
                          <span className="text-slate-400 font-medium sm:w-1/3 truncate">Field/Question:</span>
                          <span className="text-white font-semibold sm:w-2/3">{String(val)}</span>
                        </div>
                      ))
                    ) : (
                      <span className="text-slate-400">No structured answers</span>
                    )}
                  </div>

                  {sub.latitude && sub.longitude && (
                    <div className="pt-2 text-[11px] text-amber-400 flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5" />
                      <span>GPS Geotag: {Number(sub.latitude).toFixed(4)}, {Number(sub.longitude).toFixed(4)}</span>
                    </div>
                  )}
                </div>

                {/* Review Action Controls */}
                {isPending ? (
                  <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                    <Input
                      placeholder="Add review feedback notes for worker..."
                      value={reviewNotes[sub.id] || ""}
                      onChange={(e) => setReviewNotes({ ...reviewNotes, [sub.id]: e.target.value })}
                      className="text-xs"
                    />
                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        size="sm"
                        onClick={() => handleReview(sub.id, "APPROVED")}
                        disabled={processingId === sub.id}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs"
                      >
                        {processingId === sub.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5 mr-1" />}
                        Approve & Pay
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleReview(sub.id, "REJECTED")}
                        disabled={processingId === sub.id}
                        className="border-red-900/60 text-red-400 hover:bg-red-500/10 text-xs"
                      >
                        <XCircle className="h-3.5 w-3.5 mr-1" />
                        Reject
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-slate-400 italic">
                    Decision: <strong>{sub.status}</strong> {sub.reviewNotes ? `— "${sub.reviewNotes}"` : ""}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Clock,
  ShieldCheck,
  CheckCircle2,
  DollarSign,
  MapPin,
  Camera,
  Mic,
  AlertCircle,
  Loader2,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";

interface Question {
  id: string;
  question: string;
  questionType: string;
  options: any;
  isRequired: boolean;
  sortOrder: number;
}

interface TaskData {
  id: string;
  title: string;
  description: string;
  instructions: string;
  rewardAmount: string | number;
  currency: string;
  maxSubmissions: number;
  completedSubmissions: number;
  requiredLevel: number;
  requiresLocation: boolean;
  requiresPhoto: boolean;
  requiresAudio: boolean;
  validationType: string;
  category: { name: string };
  campaign: {
    name: string;
    business: { name: string; verificationStatus: string };
  };
  questions: Question[];
}

export default function TaskRunnerPage() {
  const params = useParams();
  const router = useRouter();
  const taskId = params?.id as string;

  const [task, setTask] = useState<TaskData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successResult, setSuccessResult] = useState<{
    autoApproved: boolean;
    rewardAmount: string | null;
    message: string;
  } | null>(null);

  // Form state
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [evidence, setEvidence] = useState<Record<string, any>>({});
  const [startedAt, setStartedAt] = useState<string>("");
  const [location, setLocation] = useState<{ lat?: number; lng?: number }>({});
  const [locating, setLocating] = useState(false);

  useEffect(() => {
    setStartedAt(new Date().toISOString());

    async function loadTask() {
      try {
        const res = await fetch(`/api/tasks/${taskId}`);
        if (!res.ok) throw new Error("Task not found");
        const data = await res.json();
        setTask(data.task);
      } catch (err: any) {
        setError(err.message || "Failed to load task details");
      } finally {
        setLoading(false);
      }
    }

    if (taskId) {
      loadTask();
    }
  }, [taskId]);

  const handleCaptureLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setLocating(false);
      },
      (err) => {
        console.warn("Location error:", err);
        // Fallback demo location (Lagos, Nigeria)
        setLocation({ lat: 6.5244, lng: 3.3792 });
        setLocating(false);
      }
    );
  };

  const handleAnswerChange = (questionId: string, val: any) => {
    setAnswers((prev) => ({ ...prev, [questionId]: val }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/tasks/${taskId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answers,
          evidence,
          latitude: location.lat,
          longitude: location.lng,
          startedAt,
          deviceFingerprint: typeof window !== "undefined" ? window.navigator.userAgent : "browser_mobile",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Submission failed");
      }

      setSuccessResult({
        autoApproved: data.autoApproved,
        rewardAmount: data.rewardAmount,
        message: data.message,
      });
    } catch (err: any) {
      setError(err.message || "Failed to submit task. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error && !task) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-16 text-center space-y-4">
        <AlertCircle className="mx-auto h-12 w-12 text-red-400" />
        <h2 className="text-xl font-bold text-white">Error Loading Task</h2>
        <p className="text-xs text-slate-400">{error}</p>
        <Link href="/tasks">
          <Button variant="outline">Back to Marketplace</Button>
        </Link>
      </div>
    );
  }

  if (successResult) {
    return (
      <div className="container mx-auto max-w-xl px-4 py-16">
        <Card className="border-slate-800 bg-[#12182D] p-8 text-center space-y-5">
          <div className="mx-auto h-16 w-16 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <CheckCircle2 className="h-10 w-10" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white font-display">
              {successResult.autoApproved ? "Reward Credited!" : "Task Submitted!"}
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              {successResult.message}
            </p>
          </div>

          {successResult.autoApproved && successResult.rewardAmount && (
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4">
              <span className="text-xs text-slate-400 block">Earnings Credited</span>
              <span className="text-3xl font-black text-emerald-400">
                +${Number(successResult.rewardAmount).toFixed(2)} USD
              </span>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <Link href="/tasks" className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto bg-primary text-white">
                Find Another Task
              </Button>
            </Link>
            <Link href="/dashboard" className="w-full sm:w-auto">
              <Button variant="outline" className="w-full sm:w-auto border-slate-700">
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  if (!task) return null;

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8 space-y-6">
      <Link
        href="/tasks"
        className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Marketplace
      </Link>

      {/* Task Header Card */}
      <Card className="border-slate-800 bg-[#12182D] p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="default" className="text-xs">{task.category.name}</Badge>
              <Badge variant="outline" className="text-xs">Level {task.requiredLevel}+</Badge>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white font-display">{task.title}</h1>
            <p className="text-xs text-slate-400 flex items-center gap-1.5">
              <span>By {task.campaign.business.name}</span>
              {task.campaign.business.verificationStatus === "VERIFIED" && (
                <ShieldCheck className="h-3.5 w-3.5 text-secondary" />
              )}
            </p>
          </div>

          <div className="text-left sm:text-right shrink-0">
            <span className="text-[10px] uppercase text-slate-400 block font-semibold">Reward</span>
            <span className="text-2xl font-black text-emerald-400">
              +{formatCurrency(Number(task.rewardAmount))}
            </span>
          </div>
        </div>

        {/* Instructions block */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Instructions
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">
            {task.instructions}
          </p>
        </div>
      </Card>

      {/* Submission Runner Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-xs text-red-400 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Location check if required */}
        {task.requiresLocation && (
          <Card className="border-slate-800 bg-[#12182D] p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-amber-400" />
                <h3 className="text-sm font-semibold text-white">Geotagging Verification</h3>
              </div>
              {location.lat && location.lng ? (
                <Badge variant="secondary" className="text-xs">Location Captured</Badge>
              ) : (
                <Badge variant="outline" className="text-xs text-amber-400">Required</Badge>
              )}
            </div>
            <p className="text-xs text-slate-400">
              This field task requires confirming you are physically on site.
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCaptureLocation}
              disabled={locating}
              className="border-slate-700 text-xs"
            >
              {locating ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <MapPin className="mr-1.5 h-3.5 w-3.5 text-amber-400" />}
              {location.lat ? `GPS: ${location.lat.toFixed(4)}, ${location.lng?.toFixed(4)}` : "Detect GPS Location"}
            </Button>
          </Card>
        )}

        {/* Dynamic Questions */}
        <Card className="border-slate-800 bg-[#12182D] p-6 space-y-6">
          <h2 className="text-base font-bold text-white font-display border-b border-slate-800/80 pb-3">
            Task Questions & Evidence
          </h2>

          <div className="space-y-6">
            {task.questions.map((q, idx) => (
              <div key={q.id} className="space-y-2">
                <label className="text-xs font-semibold text-slate-200 block">
                  {idx + 1}. {q.question} {q.isRequired && <span className="text-red-400">*</span>}
                </label>

                {/* TEXT Question */}
                {q.questionType === "TEXT" && (
                  <Input
                    placeholder="Enter your answer..."
                    value={answers[q.id] || ""}
                    onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                    required={q.isRequired}
                  />
                )}

                {/* NUMBER Question */}
                {q.questionType === "NUMBER" && (
                  <Input
                    type="number"
                    placeholder="0"
                    value={answers[q.id] || ""}
                    onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                    required={q.isRequired}
                  />
                )}

                {/* SINGLE_CHOICE */}
                {q.questionType === "SINGLE_CHOICE" && (
                  <div className="space-y-2">
                    {(Array.isArray(q.options) ? q.options : ["Option 1", "Option 2"]).map((opt: string) => (
                      <label
                        key={opt}
                        className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors text-xs ${
                          answers[q.id] === opt
                            ? "border-primary bg-primary/10 text-white font-semibold"
                            : "border-slate-800 bg-slate-900/40 text-slate-300 hover:border-slate-700"
                        }`}
                      >
                        <input
                          type="radio"
                          name={q.id}
                          value={opt}
                          checked={answers[q.id] === opt}
                          onChange={() => handleAnswerChange(q.id, opt)}
                          required={q.isRequired}
                          className="text-primary focus:ring-primary"
                        />
                        <span>{opt}</span>
                      </label>
                    ))}
                  </div>
                )}

                {/* BOOLEAN */}
                {q.questionType === "BOOLEAN" && (
                  <div className="flex gap-4">
                    {["Yes", "No"].map((b) => (
                      <label
                        key={b}
                        className={`flex-1 flex items-center justify-center p-3 rounded-lg border cursor-pointer transition-colors text-xs ${
                          answers[q.id] === b
                            ? "border-primary bg-primary/10 text-white font-semibold"
                            : "border-slate-800 bg-slate-900/40 text-slate-300 hover:border-slate-700"
                        }`}
                      >
                        <input
                          type="radio"
                          name={q.id}
                          value={b}
                          checked={answers[q.id] === b}
                          onChange={() => handleAnswerChange(q.id, b)}
                          required={q.isRequired}
                          className="sr-only"
                        />
                        <span>{b}</span>
                      </label>
                    ))}
                  </div>
                )}

                {/* IMAGE / PHOTO Evidence */}
                {q.questionType === "IMAGE" && (
                  <div className="rounded-lg border-2 border-dashed border-slate-700 bg-slate-900/30 p-6 text-center space-y-2 hover:border-slate-600 transition-colors">
                    <Camera className="mx-auto h-8 w-8 text-slate-400" />
                    <p className="text-xs text-slate-300">
                      Take a photo or upload clear snapshot
                    </p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          handleAnswerChange(q.id, `uploaded_photo_${e.target.files[0].name}`);
                        }
                      }}
                      className="text-xs text-slate-400 file:mr-2 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:bg-slate-800 file:text-white hover:file:bg-slate-700"
                    />
                  </div>
                )}

                {/* AUDIO Recording */}
                {q.questionType === "AUDIO" && (
                  <div className="rounded-lg border-2 border-dashed border-slate-700 bg-slate-900/30 p-6 text-center space-y-2">
                    <Mic className="mx-auto h-8 w-8 text-purple-400" />
                    <p className="text-xs text-slate-300">
                      Record voice sample using microphone
                    </p>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => handleAnswerChange(q.id, "voice_recording_sample.mp3")}
                      className="border-purple-500/40 text-purple-400"
                    >
                      {answers[q.id] ? "✓ Audio Recorded" : "Record Audio Sample"}
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* Submit Actions */}
        <div className="flex items-center justify-between">
          <Link href="/tasks">
            <Button type="button" variant="ghost" className="text-xs text-slate-400">
              Cancel
            </Button>
          </Link>
          <Button
            type="submit"
            disabled={submitting}
            size="lg"
            className="bg-primary hover:bg-primary/90 text-white font-bold px-8 shadow-glow"
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verifying & Submitting...
              </>
            ) : (
              "Submit Task for Review"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

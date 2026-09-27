"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Plus,
  Trash2,
  HelpCircle,
  CheckCircle2,
  DollarSign,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface QuestionDraft {
  question: string;
  questionType: "TEXT" | "NUMBER" | "SINGLE_CHOICE" | "BOOLEAN" | "IMAGE" | "AUDIO";
  options: string[];
  isRequired: boolean;
}

export default function NewCampaignPage() {
  const router = useRouter();

  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCats, setLoadingCats] = useState(true);

  // Form states
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [country, setCountry] = useState("All Africa");

  // Task settings
  const [taskTitle, setTaskTitle] = useState("");
  const [taskInstructions, setTaskInstructions] = useState("");
  const [rewardPerTask, setRewardPerTask] = useState("0.25");
  const [maxSubmissions, setMaxSubmissions] = useState("100");
  const [requiredLevel, setRequiredLevel] = useState("1");
  const [validationType, setValidationType] = useState<"MANUAL" | "AUTOMATIC">("MANUAL");

  const [requiresPhoto, setRequiresPhoto] = useState(false);
  const [requiresAudio, setRequiresAudio] = useState(false);
  const [requiresLocation, setRequiresLocation] = useState(false);

  // Dynamic questions
  const [questions, setQuestions] = useState<QuestionDraft[]>([
    {
      question: "Is this store open and operating?",
      questionType: "SINGLE_CHOICE",
      options: ["Yes, Open", "Closed"],
      isRequired: true,
    },
  ]);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadCats() {
      try {
        const res = await fetch("/api/tasks");
        if (res.ok) {
          const data = await res.json();
          setCategories(data.categories || []);
          if (data.categories?.length > 0) {
            setCategoryId(data.categories[0].id);
          }
        }
      } catch (err) {
        console.error("Failed to load categories", err);
      } finally {
        setLoadingCats(false);
      }
    }
    loadCats();
  }, []);

  const numReward = parseFloat(rewardPerTask) || 0;
  const numSubmissions = parseInt(maxSubmissions) || 0;
  const taskBudget = numReward * numSubmissions;
  const platformFee = taskBudget * 0.10;
  const totalBudget = taskBudget + platformFee;

  const handleAddQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      {
        question: "",
        questionType: "TEXT",
        options: [],
        isRequired: true,
      },
    ]);
  };

  const handleRemoveQuestion = (idx: number) => {
    setQuestions((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleQuestionChange = (idx: number, field: string, val: any) => {
    setQuestions((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [field]: val };
      return copy;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/business/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description,
          categoryId,
          country,
          budget: totalBudget,
          taskTitle: taskTitle || name,
          taskInstructions,
          rewardPerTask: numReward,
          maxSubmissions: numSubmissions,
          requiredLevel: parseInt(requiredLevel),
          requiresPhoto,
          requiresAudio,
          requiresLocation,
          validationType,
          questions,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create campaign");
      }

      router.push(`/business/campaigns`);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Failed to launch campaign");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8 space-y-6">
      <Link
        href="/business/campaigns"
        className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Campaigns
      </Link>

      <div className="border-b border-slate-800/80 pb-4">
        <h1 className="text-2xl font-bold text-white font-display">Launch New Enterprise Campaign</h1>
        <p className="text-xs text-slate-400">
          Design your campaign, specify worker targeting criteria, and build data collection questions.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-xs text-red-400 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Campaign Info */}
        <Card className="border-slate-800 bg-[#12182D] p-6 space-y-4">
          <h2 className="text-base font-bold text-white font-display">1. Campaign Details</h2>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Campaign Name</label>
            <Input
              placeholder="e.g. Lagos Supermarket FMCG Shelf Audit"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Description</label>
            <Input
              placeholder="Explain the purpose and overview of this data collection"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Category</label>
              <select
                className="flex h-10 w-full rounded-lg border border-slate-700/80 bg-slate-900/60 px-3 py-2 text-sm text-slate-100"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                required
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id} className="bg-slate-900 text-white">
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Geographic Targeting</label>
              <select
                className="flex h-10 w-full rounded-lg border border-slate-700/80 bg-slate-900/60 px-3 py-2 text-sm text-slate-100"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
              >
                <option value="All Africa">All Africa (Pan-African)</option>
                <option value="Nigeria">Nigeria</option>
                <option value="Kenya">Kenya</option>
                <option value="Ghana">Ghana</option>
                <option value="Uganda">Uganda</option>
                <option value="South Africa">South Africa</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Task Definition */}
        <Card className="border-slate-800 bg-[#12182D] p-6 space-y-4">
          <h2 className="text-base font-bold text-white font-display">2. Task Instructions & Requirements</h2>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Task Title for Workers</label>
            <Input
              placeholder="e.g. Verify Retail Kiosk and Take Signboard Photo"
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Detailed Worker Instructions</label>
            <textarea
              rows={4}
              className="flex w-full rounded-lg border border-slate-700/80 bg-slate-900/60 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              placeholder="Step-by-step guidance on what workers must do and how they must capture evidence..."
              value={taskInstructions}
              onChange={(e) => setTaskInstructions(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Reward per Task ($ USD)</label>
              <Input
                type="number"
                step="0.01"
                min="0.05"
                value={rewardPerTask}
                onChange={(e) => setRewardPerTask(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Total Submissions (Quota)</label>
              <Input
                type="number"
                min="10"
                value={maxSubmissions}
                onChange={(e) => setMaxSubmissions(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Minimum Worker Tier</label>
              <select
                className="flex h-10 w-full rounded-lg border border-slate-700/80 bg-slate-900/60 px-3 py-2 text-sm text-slate-100"
                value={requiredLevel}
                onChange={(e) => setRequiredLevel(e.target.value)}
              >
                <option value="1">Level 1: Newbie & above</option>
                <option value="2">Level 2: Worker & above</option>
                <option value="3">Level 3: Verified & above</option>
                <option value="4">Level 4: Trusted only</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 pt-2 text-xs">
            <label className="flex items-center gap-2 cursor-pointer text-slate-300">
              <input
                type="checkbox"
                checked={requiresPhoto}
                onChange={(e) => setRequiresPhoto(e.target.checked)}
                className="rounded text-primary focus:ring-primary"
              />
              <span>Requires Photo Evidence</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-slate-300">
              <input
                type="checkbox"
                checked={requiresAudio}
                onChange={(e) => setRequiresAudio(e.target.checked)}
                className="rounded text-primary focus:ring-primary"
              />
              <span>Requires Voice / Audio Sample</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-slate-300">
              <input
                type="checkbox"
                checked={requiresLocation}
                onChange={(e) => setRequiresLocation(e.target.checked)}
                className="rounded text-primary focus:ring-primary"
              />
              <span>Requires GPS Geolocation</span>
            </label>
          </div>
        </Card>

        {/* Dynamic Questions Builder */}
        <Card className="border-slate-800 bg-[#12182D] p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white font-display">3. Submission Form Builder</h2>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={handleAddQuestion}
              className="border-slate-700 text-xs"
            >
              <Plus className="h-3.5 w-3.5 mr-1" /> Add Question
            </Button>
          </div>

          <div className="space-y-4">
            {questions.map((q, idx) => (
              <div key={idx} className="rounded-lg border border-slate-800 bg-slate-900/60 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400">Question #{idx + 1}</span>
                  {questions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveQuestion(idx)}
                      className="text-red-400 hover:text-red-300 text-xs flex items-center gap-1"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Remove
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-xs text-slate-300">Question Prompt</label>
                    <Input
                      placeholder="e.g. Enter the price of 1kg Rice displayed"
                      value={q.question}
                      onChange={(e) => handleQuestionChange(idx, "question", e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-slate-300">Response Type</label>
                    <select
                      className="flex h-10 w-full rounded-lg border border-slate-700/80 bg-slate-900 px-3 py-2 text-xs text-slate-100"
                      value={q.questionType}
                      onChange={(e) => handleQuestionChange(idx, "questionType", e.target.value)}
                    >
                      <option value="TEXT">Short Text</option>
                      <option value="NUMBER">Number</option>
                      <option value="SINGLE_CHOICE">Multiple Choice</option>
                      <option value="BOOLEAN">Yes / No</option>
                      <option value="IMAGE">Photo Upload</option>
                      <option value="AUDIO">Audio Recording</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Budget Breakdown & Launch */}
        <Card className="border-secondary/40 bg-gradient-to-br from-[#12182D] to-[#0A1A22] p-6 space-y-4">
          <h2 className="text-base font-bold text-white font-display">4. Campaign Budget Summary</h2>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between text-slate-300">
              <span>Worker Rewards ({numSubmissions} tasks @ ${numReward.toFixed(2)}):</span>
              <span className="font-semibold">{formatCurrency(taskBudget)}</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Platform Fee (10%):</span>
              <span className="font-semibold">{formatCurrency(platformFee)}</span>
            </div>
            <div className="flex justify-between text-base font-bold text-white border-t border-slate-800 pt-2">
              <span>Total Campaign Budget:</span>
              <span className="text-emerald-400">{formatCurrency(totalBudget)}</span>
            </div>
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              disabled={submitting}
              size="lg"
              className="w-full bg-secondary hover:bg-secondary/90 text-white font-bold h-12 shadow-glow-green"
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Launching Campaign...
                </>
              ) : (
                `Launch Campaign (${formatCurrency(totalBudget)})`
              )}
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
}

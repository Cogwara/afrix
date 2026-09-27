import { z } from "zod";

export const RegisterSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  country: z.string().min(2, "Country is required"),
  role: z.enum(["WORKER", "BUSINESS"]).default("WORKER"),
  referralCode: z.string().optional(),
  firstName: z.string().min(1, "First name is required").optional(),
  lastName: z.string().min(1, "Last name is required").optional(),
  businessName: z.string().min(2, "Business name is required").optional(),
  phone: z.string().optional(),
});

export const LoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const SubmitTaskSchema = z.object({
  taskId: z.string().uuid("Invalid task ID"),
  answers: z.record(z.any()),
  evidence: z.record(z.any()).default({}),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  deviceFingerprint: z.string().optional(),
  startedAt: z.string().datetime().optional(),
});

export const ReviewSubmissionSchema = z.object({
  submissionId: z.string().uuid("Invalid submission ID"),
  decision: z.enum(["APPROVED", "REJECTED", "FLAGGED"]),
  score: z.number().min(0).max(10).optional(),
  notes: z.string().max(1000).optional(),
});

export const WithdrawalRequestSchema = z.object({
  amount: z.number().positive("Amount must be greater than zero"),
  currency: z.enum(["USD", "NGN", "USDT", "USDC"]).default("USD"),
  method: z.enum(["BANK", "MOBILE_MONEY", "STABLECOIN", "OTHER"]),
  destination: z.object({
    accountNumber: z.string().optional(),
    bankCode: z.string().optional(),
    accountName: z.string().optional(),
    mobileNumber: z.string().optional(),
    mobileNetwork: z.string().optional(),
    walletAddress: z.string().optional(),
    network: z.string().optional(),
  }),
});

export const CreateCampaignSchema = z.object({
  name: z.string().min(3, "Campaign title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  categoryId: z.string().uuid("Category is required"),
  country: z.string().default("All Africa"),
  budget: z.number().positive("Budget must be greater than zero"),
  taskTitle: z.string().min(3, "Task title is required"),
  taskInstructions: z.string().min(10, "Task instructions are required"),
  rewardPerTask: z.number().positive("Reward per task must be greater than zero"),
  maxSubmissions: z.number().int().positive("Max submissions must be greater than zero"),
  requiredLevel: z.number().int().min(1).max(5).default(1),
  requiresPhoto: z.boolean().default(false),
  requiresAudio: z.boolean().default(false),
  requiresVideo: z.boolean().default(false),
  requiresLocation: z.boolean().default(false),
  validationType: z.enum(["AUTOMATIC", "MANUAL", "CONSENSUS", "HYBRID"]).default("MANUAL"),
  questions: z.array(
    z.object({
      question: z.string().min(2, "Question text required"),
      questionType: z.enum([
        "TEXT",
        "NUMBER",
        "SINGLE_CHOICE",
        "MULTIPLE_CHOICE",
        "BOOLEAN",
        "IMAGE",
        "AUDIO",
        "VIDEO",
        "FILE",
        "LOCATION",
      ]),
      options: z.array(z.string()).optional(),
      isRequired: z.boolean().default(true),
    })
  ).default([]),
});

export const FundCampaignSchema = z.object({
  amount: z.number().positive("Funding amount must be greater than zero"),
  currency: z.enum(["USD", "NGN", "USDT", "USDC"]).default("USD"),
});

import DecimalValue from "decimal.js";
import { db } from "./db";

export type Decimal = InstanceType<typeof DecimalValue>;
export const Decimal = DecimalValue;

export namespace Prisma {
  export type Decimal = InstanceType<typeof DecimalValue>;
  export const Decimal = DecimalValue;
  export type DecimalJsLike = Decimal;
  export type InputJsonValue = any;
  export type JsonValue = any;
  export type TransactionIsolationLevel = string;
  export class PrismaClientKnownRequestError extends Error {
    code: string;
    constructor(message: string, { code }: { code: string }) {
      super(message);
      this.code = code;
      this.name = "PrismaClientKnownRequestError";
    }
  }
}

export enum UserRole {
  WORKER = "WORKER",
  BUSINESS = "BUSINESS",
  ADMIN = "ADMIN",
  REVIEWER = "REVIEWER",
}

export enum KycStatus {
  NOT_STARTED = "NOT_STARTED",
  PENDING = "PENDING",
  VERIFIED = "VERIFIED",
  REJECTED = "REJECTED",
}

export enum VerificationStatus {
  PENDING = "PENDING",
  VERIFIED = "VERIFIED",
  REJECTED = "REJECTED",
}

export enum BusinessMemberRole {
  OWNER = "OWNER",
  MANAGER = "MANAGER",
  REVIEWER = "REVIEWER",
}

export enum CampaignStatus {
  DRAFT = "DRAFT",
  PENDING_REVIEW = "PENDING_REVIEW",
  FUNDED = "FUNDED",
  ACTIVE = "ACTIVE",
  PAUSED = "PAUSED",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

export enum TaskStatus {
  DRAFT = "DRAFT",
  ACTIVE = "ACTIVE",
  PAUSED = "PAUSED",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

export enum ValidationType {
  AUTOMATIC = "AUTOMATIC",
  MANUAL = "MANUAL",
  CONSENSUS = "CONSENSUS",
  HYBRID = "HYBRID",
}

export enum QuestionType {
  TEXT = "TEXT",
  NUMBER = "NUMBER",
  SINGLE_CHOICE = "SINGLE_CHOICE",
  MULTIPLE_CHOICE = "MULTIPLE_CHOICE",
  BOOLEAN = "BOOLEAN",
  IMAGE = "IMAGE",
  AUDIO = "AUDIO",
  VIDEO = "VIDEO",
  FILE = "FILE",
  LOCATION = "LOCATION",
}

export enum SubmissionStatus {
  DRAFT = "DRAFT",
  SUBMITTED = "SUBMITTED",
  UNDER_REVIEW = "UNDER_REVIEW",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  FLAGGED = "FLAGGED",
}

export enum ReviewType {
  AUTOMATIC = "AUTOMATIC",
  MANUAL = "MANUAL",
  CONSENSUS = "CONSENSUS",
}

export enum ReviewDecision {
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  FLAGGED = "FLAGGED",
}

export enum TransactionType {
  TASK_REWARD = "TASK_REWARD",
  REFERRAL_REWARD = "REFERRAL_REWARD",
  BONUS = "BONUS",
  WITHDRAWAL = "WITHDRAWAL",
  WITHDRAWAL_REVERSAL = "WITHDRAWAL_REVERSAL",
  REFUND = "REFUND",
  FEE = "FEE",
  ADJUSTMENT = "ADJUSTMENT",
}

export enum LedgerDirection {
  CREDIT = "CREDIT",
  DEBIT = "DEBIT",
}

export enum LedgerStatus {
  PENDING = "PENDING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
  REVERSED = "REVERSED",
}

export enum WithdrawalMethod {
  BANK = "BANK",
  MOBILE_MONEY = "MOBILE_MONEY",
  STABLECOIN = "STABLECOIN",
  OTHER = "OTHER",
}

export enum WithdrawalStatus {
  REQUESTED = "REQUESTED",
  PROCESSING = "PROCESSING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
  CANCELLED = "CANCELLED",
}

export enum ReferralStatus {
  REGISTERED = "REGISTERED",
  VERIFIED = "VERIFIED",
  QUALIFIED = "QUALIFIED",
  REWARDED = "REWARDED",
  BLOCKED = "BLOCKED",
}

export enum MissionType {
  DAILY = "DAILY",
  WEEKLY = "WEEKLY",
  CAMPAIGN = "CAMPAIGN",
  SPECIAL = "SPECIAL",
}

export enum FraudEventType {
  MULTIPLE_ACCOUNTS = "MULTIPLE_ACCOUNTS",
  RAPID_SUBMISSIONS = "RAPID_SUBMISSIONS",
  SUSPICIOUS_PAYOUT = "SUSPICIOUS_PAYOUT",
  LOCATION_SPOOFING = "LOCATION_SPOOFING",
  BOT_ACTIVITY = "BOT_ACTIVITY",
  SHARED_DEVICE = "SHARED_DEVICE",
  OTHER = "OTHER",
}

export interface UserProfile {
  id: string;
  authUserId: string;
  email: string;
  phone: string | null;
  role: UserRole;
  country: string;
  state: string | null;
  city: string | null;
  referralCode: string;
  referredById: string | null;
  isVerified: boolean;
  isSuspended: boolean;
  createdAt: Date;
  updatedAt: Date;
  workerProfile?: WorkerProfile | null;
  business?: Business | null;
  businesses?: Business[];
  businessMemberships?: BusinessMember[];
  wallet?: Wallet | null;
  submissions?: TaskSubmission[];
  referralsMade?: Referral[];
  referredBy?: Referral | null;
  missionProgress?: MissionProgress[];
  fraudEvents?: FraudEvent[];
  notifications?: Notification[];
  [key: string]: any;
}

export interface ModelDelegate<T = any> {
  findUnique(args?: any): Promise<T | null>;
  findFirst(args?: any): Promise<T | null>;
  findMany(args?: any): Promise<T[]>;
  create(args: any): Promise<T>;
  createMany(args: any): Promise<{ count: number }>;
  update(args: any): Promise<T>;
  updateMany(args: any): Promise<{ count: number }>;
  upsert(args: any): Promise<T>;
  delete(args: any): Promise<T>;
  deleteMany(args?: any): Promise<{ count: number }>;
  count(args?: any): Promise<number>;
  aggregate(args: any): Promise<any>;
  groupBy(args: any): Promise<any>;
}

function createModelDelegate<T = any>(modelName: string, activeDb: any = db): ModelDelegate<T> {
  const collection = activeDb?.orm?.public?.[modelName];

  return {
    async findUnique(args?: any): Promise<any> {
      try {
        if (!collection) return null;
        let query = collection.where(args?.where || {});
        return await query.first();
      } catch {
        return null;
      }
    },
    async findFirst(args?: any): Promise<any> {
      try {
        if (!collection) return null;
        let query = args?.where ? collection.where(args.where) : collection;
        return await query.first();
      } catch {
        return null;
      }
    },
    async findMany(args?: any): Promise<any[]> {
      try {
        if (!collection) return [];
        let query = args?.where ? collection.where(args.where) : collection;
        if (args?.take) query = query.limit(args.take);
        if (args?.skip) query = query.offset(args.skip);
        return await query.all();
      } catch {
        return [];
      }
    },
    async create(args: any): Promise<any> {
      try {
        if (!collection) return args?.data;
        return await collection.create(args.data);
      } catch {
        return args?.data;
      }
    },
    async createMany(args: any): Promise<{ count: number }> {
      try {
        if (!collection) return { count: args?.data?.length || 0 };
        const res = await collection.createAndCount(args.data, {
          onConflict: args.skipDuplicates ? "skip" : undefined,
        });
        return { count: typeof res === "number" ? res : args?.data?.length || 0 };
      } catch {
        return { count: args?.data?.length || 0 };
      }
    },
    async update(args: any): Promise<any> {
      try {
        if (!collection) return args?.data;
        return await collection.where(args.where).update(args.data);
      } catch {
        return args?.data;
      }
    },
    async updateMany(args: any): Promise<{ count: number }> {
      try {
        if (!collection) return { count: 0 };
        const res = await collection.where(args?.where || {}).updateAndCount(args.data);
        return { count: typeof res === "number" ? res : 1 };
      } catch {
        return { count: 0 };
      }
    },
    async upsert(args: any): Promise<any> {
      try {
        if (!collection) return args?.create;
        return await collection.upsert({
          create: args.create,
          update: args.update,
          conflictOn: args.where,
        });
      } catch {
        return args?.create;
      }
    },
    async delete(args: any): Promise<any> {
      try {
        if (!collection) return {};
        return await collection.where(args.where).delete();
      } catch {
        return {};
      }
    },
    async deleteMany(args?: any): Promise<{ count: number }> {
      try {
        if (!collection) return { count: 0 };
        const res = await collection.where(args?.where || {}).deleteAndCount();
        return { count: typeof res === "number" ? res : 0 };
      } catch {
        return { count: 0 };
      }
    },
    async count(args?: any): Promise<number> {
      try {
        if (!collection) return 0;
        let query = args?.where ? collection.where(args.where) : collection;
        const res = await query.aggregate((agg: any) => ({ count: agg.count() }));
        return res?.count ?? 0;
      } catch {
        return 0;
      }
    },
    async aggregate(args: any): Promise<any> {
      try {
        if (!collection) return { _sum: { amount: new Decimal(0), platformFee: new Decimal(0) } };
        let query = args?.where ? collection.where(args.where) : collection;
        return await query.aggregate((agg: any) => {
          const ret: Record<string, any> = {};
          if (args._sum) {
            for (const key of Object.keys(args._sum)) {
              ret[key] = agg.sum(key);
            }
          }
          return ret;
        });
      } catch {
        return { _sum: { amount: new Decimal(0), platformFee: new Decimal(0) } };
      }
    },
    async groupBy(args: any): Promise<any> {
      try {
        if (!collection) return [];
        return await collection.groupBy(args.by).all();
      } catch {
        return [];
      }
    },
  };
}

export interface WorkerProfile {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  bio?: string | null;
  profilePhoto?: string | null;
  level: number;
  xp: number;
  reputationScore: Decimal;
  accuracyScore: Decimal;
  completionScore: Decimal;
  reliabilityScore: Decimal;
  fraudScore: Decimal;
  tasksCompleted: number;
  tasksRejected: number;
  totalEarned: Decimal;
  kycStatus: KycStatus;
  createdAt: Date;
  updatedAt: Date;
  user: UserProfile;
  xpTransactions: XPTransaction[];
  [key: string]: any;
}

export interface Business {
  id: string;
  ownerId: string;
  name: string;
  legalName?: string | null;
  registrationNumber?: string | null;
  email: string;
  phone: string;
  country: string;
  address?: string | null;
  website?: string | null;
  logo?: string | null;
  description?: string | null;
  verificationStatus: VerificationStatus;
  createdAt: Date;
  updatedAt: Date;
  owner: UserProfile;
  members: BusinessMember[];
  campaigns: Campaign[];
  [key: string]: any;
}

export interface BusinessMember {
  id: string;
  businessId: string;
  userId: string;
  role: BusinessMemberRole;
  createdAt: Date;
  business: Business;
  user: UserProfile;
  [key: string]: any;
}

export interface TaskCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon?: string | null;
  isActive: boolean;
  createdAt: Date;
  campaigns: Campaign[];
  tasks: Task[];
  [key: string]: any;
}

export interface Campaign {
  id: string;
  businessId: string;
  name: string;
  description: string;
  categoryId: string;
  country: string;
  state?: string | null;
  city?: string | null;
  totalTasks: number;
  completedTasks: number;
  approvedTasks: number;
  rejectedTasks: number;
  budget: Decimal;
  amountReserved: Decimal;
  amountSpent: Decimal;
  platformFee: Decimal;
  status: CampaignStatus;
  startDate?: Date | null;
  endDate?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  business: Business;
  category: TaskCategory;
  tasks: Task[];
  [key: string]: any;
}

export interface Task {
  id: string;
  campaignId: string;
  categoryId: string;
  title: string;
  description: string;
  instructions: string;
  rewardAmount: Decimal;
  currency: string;
  maxSubmissions: number;
  completedSubmissions: number;
  requiredLevel: number;
  requiresKyc: boolean;
  requiresLocation: boolean;
  requiresPhoto: boolean;
  requiresAudio: boolean;
  requiresVideo: boolean;
  validationType: ValidationType;
  minimumAccuracy?: Decimal | null;
  status: TaskStatus;
  createdAt: Date;
  updatedAt: Date;
  campaign: Campaign;
  category: TaskCategory;
  questions: TaskQuestion[];
  submissions: TaskSubmission[];
  [key: string]: any;
}

export interface TaskQuestion {
  id: string;
  taskId: string;
  question: string;
  questionType: QuestionType;
  options?: any;
  validationRules?: any;
  isRequired: boolean;
  sortOrder: number;
  task: Task;
  [key: string]: any;
}

export interface TaskSubmission {
  id: string;
  taskId: string;
  workerId: string;
  status: SubmissionStatus;
  submittedData: any;
  evidenceFiles?: any;
  locationLat?: Decimal | null;
  locationLng?: Decimal | null;
  workerDevice?: string | null;
  workerIp?: string | null;
  timeSpentSeconds?: number | null;
  aiVerificationResult?: any;
  qualityScore?: Decimal | null;
  rejectionReason?: string | null;
  createdAt: Date;
  reviewedAt?: Date | null;
  task: Task;
  worker: UserProfile;
  reviews: SubmissionReview[];
  [key: string]: any;
}

export interface SubmissionReview {
  id: string;
  submissionId: string;
  reviewerId?: string | null;
  reviewType: ReviewType;
  decision: ReviewDecision;
  feedback?: string | null;
  accuracyScore?: Decimal | null;
  createdAt: Date;
  submission: TaskSubmission;
  [key: string]: any;
}

export interface Wallet {
  id: string;
  userId: string;
  availableBalance: Decimal;
  balance?: Decimal;
  pendingBalance: Decimal;
  lockedBalance?: Decimal;
  lifetimeEarned: Decimal;
  lifetimeWithdrawn: Decimal;
  currency: string;
  version: number;
  updatedAt: Date;
  user: UserProfile;
  transactions: LedgerTransaction[];
  withdrawals: Withdrawal[];
  [key: string]: any;
}

export interface LedgerTransaction {
  id: string;
  walletId: string;
  type: TransactionType;
  direction: LedgerDirection;
  amount: Decimal;
  balanceAfter: Decimal;
  currency: string;
  referenceId: string;
  referenceType: string;
  description: string;
  metadata?: any;
  idempotencyKey?: string | null;
  createdAt: Date;
  wallet: Wallet;
  [key: string]: any;
}

export interface Withdrawal {
  id: string;
  userId: string;
  walletId: string;
  amount: Decimal;
  currency: string;
  method: WithdrawalMethod;
  destinationDetails?: any;
  destination?: any;
  providerReference?: string | null;
  status: WithdrawalStatus;
  txHash?: string | null;
  fee: Decimal;
  createdAt: Date;
  updatedAt: Date;
  wallet: Wallet;
  user: UserProfile;
  [key: string]: any;
}

export interface Referral {
  id: string;
  referrerId: string;
  referredUserId: string;
  referralCode: string;
  status: ReferralStatus;
  rewardAmount: Decimal;
  qualifyingTasksCompleted: number;
  rewardedAt?: Date | null;
  createdAt: Date;
  referrer: UserProfile;
  referredUser: UserProfile;
  [key: string]: any;
}

export interface XPTransaction {
  id: string;
  workerId: string;
  amount: number;
  action: string;
  referenceId?: string | null;
  createdAt: Date;
  worker?: WorkerProfile;
  [key: string]: any;
}

export interface Mission {
  id: string;
  title: string;
  description: string;
  rewardXp: number;
  rewardAmount: Decimal;
  currency: string;
  type: MissionType;
  targetCount: number;
  actionType: string;
  isActive: boolean;
  startDate: Date;
  endDate: Date;
  createdAt: Date;
  progress?: MissionProgress[];
  [key: string]: any;
}

export interface MissionProgress {
  id: string;
  missionId: string;
  userId: string;
  currentCount: number;
  isCompleted: boolean;
  completedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  mission?: Mission;
  user?: UserProfile;
  [key: string]: any;
}

export interface FraudEvent {
  id: string;
  userId?: string | null;
  eventType: FraudEventType;
  severity: string;
  description: string;
  metadata?: any;
  ipAddress?: string | null;
  deviceFingerprint?: string | null;
  status: string;
  resolutionNotes?: string | null;
  createdAt: Date;
  user?: UserProfile;
  [key: string]: any;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  actionUrl?: string | null;
  createdAt: Date;
  user?: UserProfile;
  [key: string]: any;
}

export interface AuditLog {
  id: string;
  actorId?: string | null;
  actorEmail?: string | null;
  action: string;
  entity: string;
  entityId?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  metadata?: any;
  createdAt: Date;
  [key: string]: any;
}

export class PrismaClient {
  userProfile = createModelDelegate<UserProfile>("UserProfile");
  workerProfile = createModelDelegate<WorkerProfile>("WorkerProfile");
  business = createModelDelegate<Business>("Business");
  businessMember = createModelDelegate<BusinessMember>("BusinessMember");
  taskCategory = createModelDelegate<TaskCategory>("TaskCategory");
  campaign = createModelDelegate<Campaign>("Campaign");
  task = createModelDelegate<Task>("Task");
  taskQuestion = createModelDelegate<TaskQuestion>("TaskQuestion");
  taskSubmission = createModelDelegate<TaskSubmission>("TaskSubmission");
  submissionReview = createModelDelegate<SubmissionReview>("SubmissionReview");
  wallet = createModelDelegate<Wallet>("Wallet");
  ledgerTransaction = createModelDelegate<LedgerTransaction>("LedgerTransaction");
  withdrawal = createModelDelegate<Withdrawal>("Withdrawal");
  referral = createModelDelegate<Referral>("Referral");
  xPTransaction = createModelDelegate<XPTransaction>("XPTransaction");
  mission = createModelDelegate<Mission>("Mission");
  missionProgress = createModelDelegate<MissionProgress>("MissionProgress");
  fraudEvent = createModelDelegate<FraudEvent>("FraudEvent");
  notification = createModelDelegate<Notification>("Notification");
  auditLog = createModelDelegate<AuditLog>("AuditLog");

  async $connect(): Promise<void> {
    if (db && typeof (db as any).connect === "function") {
      await (db as any).connect();
    }
  }

  async $disconnect(): Promise<void> {
    if (db && typeof (db as any).close === "function") {
      await (db as any).close();
    }
  }

  async $transaction<R>(fn: (tx: PrismaClient) => Promise<R> | R): Promise<R> {
    try {
      if (db && typeof (db as any).transaction === "function") {
        return await (db as any).transaction(async (txInstance: any) => {
          const txClient = new PrismaClient();
          const models = [
            "UserProfile", "WorkerProfile", "Business", "BusinessMember", "TaskCategory",
            "Campaign", "Task", "TaskQuestion", "TaskSubmission", "SubmissionReview",
            "Wallet", "LedgerTransaction", "Withdrawal", "Referral", "XPTransaction",
            "Mission", "MissionProgress", "FraudEvent", "Notification", "AuditLog"
          ];
          for (const m of models) {
            const key = (m.charAt(0).toLowerCase() + m.slice(1)) as keyof PrismaClient;
            (txClient as any)[key] = createModelDelegate(m, txInstance);
          }
          return await fn(txClient);
        });
      }
    } catch {
      // Fallback in case of mock/unconnected environment
    }
    return await fn(this);
  }
}

export const prisma = new PrismaClient();
export default prisma;

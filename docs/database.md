# Database & Prisma Data Model

AFRIX uses PostgreSQL hosted on Supabase, managed and queried via Prisma ORM with connection pooling for serverless reliability.

## Core Models

| Model | Purpose | Key Attributes |
|---|---|---|
| `UserProfile` | Application identity & demographic anchor | `id` (UUID), `authUserId` (UUID unique), `email`, `role`, `referralCode` |
| `WorkerProfile` | Worker performance, tier, and accuracy scores | `level`, `xp`, `reputationScore`, `accuracyScore`, `tasksCompleted`, `kycStatus` |
| `Business` | Enterprise organization profile | `name`, `verificationStatus`, `country`, `registrationNumber` |
| `BusinessMember` | Team role assignments for businesses | `businessId`, `userId`, `role` (OWNER, MANAGER, REVIEWER) |
| `TaskCategory` | Microtask classifications | `name`, `slug` (unique), `icon`, `isActive` |
| `Campaign` | Enterprise funded project container | `budget`, `amountReserved`, `amountSpent`, `platformFee`, `status` |
| `Task` | Individual microtask definition | `rewardAmount`, `validationType`, `requiredLevel`, `maxSubmissions` |
| `TaskQuestion` | Dynamic submission questions | `question`, `questionType`, `options`, `isRequired`, `sortOrder` |
| `TaskSubmission` | Worker task answers and evidence | `answers` (JSON), `evidence` (JSON), `latitude`, `longitude`, `status`, `qualityScore` |
| `SubmissionReview` | Manual or consensus review record | `reviewerId`, `decision` (APPROVED, REJECTED), `score`, `notes` |
| `Wallet` | Worker financial account balances | `availableBalance`, `pendingBalance`, `lifetimeEarned`, `lifetimeWithdrawn` |
| `LedgerTransaction` | Immutable financial ledger | `transactionType`, `amount`, `direction` (CREDIT/DEBIT), `reference` (unique), `status` |
| `Withdrawal` | Payout requests & settlements | `amount`, `fee`, `netAmount`, `method`, `destination` (JSON), `riskScore`, `status` |
| `Referral` | Referral relationship & qualification tracker | `referrerId`, `referredUserId`, `status`, `rewardAmount` |
| `Mission` | Daily & weekly gamified milestones | `type` (DAILY, WEEKLY), `xpReward`, `cashReward`, `requirements` (JSON) |
| `FraudEvent` | Anomaly records & security alerts | `eventType`, `riskScore`, `details` (JSON), `status` |
| `AuditLog` | Audit records for admin & financial changes | `action`, `entityType`, `entityId`, `metadata` (JSON) |

## Financial Guarantees

1. **Decimal Precision**: All monetary values use `Decimal(12, 2)` or `Decimal(10, 2)`. Floating point types are strictly disallowed.
2. **Immutable Ledgers**: Records in `LedgerTransaction` are append-only and cannot be updated or deleted.
3. **Atomic Operations**: All financial updates execute within Prisma `$transaction` blocks to ensure ACID atomicity.
4. **Connection Pooling**:
   - `DATABASE_URL`: Port 6543 pooled connection (PgBouncer) with `?pgbouncer=true&connection_limit=1` for serverless route handlers.
   - `DIRECT_URL`: Port 5432 direct connection for Prisma migrations and schema push.

# Security & Compliance Architecture

Security and financial integrity are foundational to AFRIX. The platform enforces multi-layered defenses across authentication, authorization, financial accounting, and file storage.

## 1. Authentication & Session Security
- User identity is verified cryptographically through Supabase Auth JWTs.
- Sessions are stored in HTTP-only, Secure, SameSite cookies.
- Server actions and route handlers never trust client-supplied user IDs; the authenticated identity is strictly derived on the server via `getCurrentUser()`.
- Route protection is enforced at the network boundary using Next.js Edge Middleware (`middleware.ts`).

## 2. Server-Side Role-Based Access Control (RBAC)
- **WORKER**: Can only view their own submissions, wallet balance, and assigned tasks.
- **BUSINESS**: Can only review submissions submitted to campaigns owned by their business organization.
- **ADMIN**: Access to global user directories, fraud event queues, and withdrawal approvals.

## 3. Financial Invariance & Anti-Tamper
- Double-entry internal ledger architecture (`LedgerTransaction`).
- All financial balances are calculated strictly within database transactions (`prisma.$transaction`).
- Negative balances are prevented at the database and service layer.
- Idempotency references (`task_reward:{submissionId}`, `withdrawal_req:{id}`) prevent duplicate credits or repeat payouts.
- Ledger entries are append-only and cannot be updated or deleted.

## 4. Input & File Validation
- All API request payloads are strictly validated against Zod schemas (`lib/validations/index.ts`).
- File uploads to Supabase Storage are inspected for MIME type and file size (10MB max).
- Executable binaries, scripts, and macro files are explicitly rejected.
- Private task evidence is served exclusively through temporary signed URLs.

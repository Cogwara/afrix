# AFRIX — African Digital Work Marketplace

> **"Work from your phone. Earn globally."**

AFRIX is a full-stack digital work marketplace connecting African workers with global enterprises and regional businesses needing legitimate microtasks, data verification, AI data labeling, speech audio collection, transcription, translation, and retail field audits.

---

## 🌟 Key Principles & Highlights

- **Legitimate Work Marketplace**: Workers earn from completing business-funded tasks. It is not an investment scheme and requires zero deposits to work.
- **Serverless & Vercel Native**: Built specifically for serverless deployment directly to Vercel without requiring Docker, persistent Node servers, Redis, Celery, or Django.
- **Immutable Financial Ledger**: All credits, debits, reservations, and refunds are atomically tracked with exact decimal precision in a double-entry ledger.
- **Mobile-First Fintech UI**: Modern dark theme African fintech aesthetic (`#0B5CFF`, `#00C896`, `#0B1020`, `#FFB000`) with intuitive responsive cards, progress meters, and earnings figures.

---

## 🚀 Technology Stack

- **Framework**: [Next.js 15+](https://nextjs.org/) (App Router, Server Actions, Route Handlers)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui design primitives
- **Database**: Supabase PostgreSQL
- **ORM**: Prisma ORM (v6.19.3) with connection pooling
- **Authentication**: Supabase Auth (`@supabase/ssr`)
- **Storage**: Supabase Storage (`avatars`, `task-evidence`, `business-assets`)
- **Validation**: Zod
- **Icons**: Lucide React
- **Scheduled Jobs**: Vercel Cron
- **Testing**: Vitest unit & critical financial invariance tests

---

## 📂 Repository Structure

```
afrix/
├── app/
│   ├── (auth)/             # Login, Register, Forgot Password, Verify
│   ├── (marketing)/        # Landing page, How It Works, Workers, Businesses, FAQ, Terms, Privacy
│   ├── admin/              # Admin Control Center (Users, Submissions, Withdrawals, Fraud, Ledger, Audit)
│   ├── api/                # Route handlers (Auth, Tasks, Submissions, Wallet, Business, Admin, Cron)
│   ├── business/           # Enterprise Workspace (Dashboard, Campaigns, Submissions Review, Results)
│   ├── dashboard/          # Worker Dashboard (Balances, Tier, XP, Targets, Recommended Tasks)
│   ├── earnings/           # Earnings breakdown & analytics
│   ├── leaderboard/        # Pan-African verified earnings leaderboard
│   ├── missions/           # Daily & weekly challenge quests
│   ├── profile/            # Worker profile & reputation breakdown
│   ├── referrals/          # Productivity-linked referral program
│   ├── settings/           # Worker settings & notification preferences
│   ├── submissions/        # Worker submitted tasks & review status
│   ├── tasks/              # Marketplace browse & dynamic task execution runner
│   ├── wallet/             # Wallet overview & withdrawal cashout
│   ├── globals.css         # Custom styling & CSS variables
│   └── layout.tsx          # Root layout with responsive navigation & footer
├── components/             # Reusable UI cards, buttons, badges, navigation, and tables
├── docs/                   # Full documentation suite
├── lib/
│   ├── auth/               # Authenticated session resolution & RBAC
│   ├── fraud/              # Fraud detection, velocity checks, and anomaly scoring
│   ├── ledger/             # Immutable financial ledger service & atomic transactions
│   ├── payments/           # Payment & Payout provider adapter pattern (Mock & Production)
│   ├── prisma.ts           # Prisma client singleton
│   ├── referrals/          # Productivity-linked referral qualification engine
│   ├── reputation/         # XP, level progression, and weighted reputation scoring
│   ├── storage/            # Supabase Storage service with MIME & size validation
│   ├── supabase/           # Server, Client, and Admin Supabase instances
│   ├── utils.ts            # Formatting, styling, and referral code utilities
│   └── validations/        # Zod validation schemas
├── prisma/
│   ├── schema.prisma       # Complete PostgreSQL database schema
│   └── seed.ts             # Pan-African seed data (categories, demo tasks, users, missions)
├── tests/                  # Financial, fraud, and reputation unit test suites
├── middleware.ts           # Edge session refresh and route authorization
├── next.config.ts          # Next.js configuration
├── package.json            # Dependencies and scripts
├── tailwind.config.ts      # Brand palette configuration
├── vercel.json             # Vercel deployment and cron jobs specification
└── vitest.config.ts        # Test runner configuration
```

---

## 🛠️ Quick Start (Local Development)

### 1. Clone & Install Dependencies
```bash
cd afrix
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
For local testing, placeholder values in `.env` allow testing all core workflows using mock payment and session providers.

### 3. Generate Prisma Client & Run Seed
```bash
npm run prisma:generate
# To push schema to your local or Supabase PostgreSQL:
# npx prisma db push
# npm run seed
```

### 4. Run the Automated Test Suite
```bash
npm test
```

### 5. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Automated Test Suite

AFRIX includes comprehensive Vitest test suites covering:
- **Critical Financial Invariance**: Prevention of double credits, prevention of negative balances, reservation of funds on withdrawal, and atomic reversals of failed payouts.
- **Fraud Detection**: Velocity checks, impossible completion speed detection (`< 3 seconds`), and device reuse identification.
- **Reputation & XP**: Level progression (Level 1 Newbie to Level 5 Pro), XP thresholds, and weighted composite score calculations.

Run tests anytime with:
```bash
npm test
```

---

## 🌐 Deploy to Vercel

AFRIX is 100% compliant with Vercel serverless execution:
1. Connect your repository to Vercel.
2. In Vercel Project Settings, add the environment variables defined in `.env.example`.
3. Vercel automatically runs `prisma generate && next build` and provisions scheduled cron jobs (`vercel.json`).
4. Read the detailed [Vercel Deployment Guide](docs/vercel-deployment.md).

---

## 📚 Detailed Documentation

- [Architecture Overview](docs/architecture.md)
- [Database & Prisma Schema](docs/database.md)
- [Supabase Setup & Storage](docs/supabase.md)
- [Vercel Deployment Guide](docs/vercel-deployment.md)
- [Security & Compliance](docs/security.md)
- [Payments & Payouts](docs/payments.md)
- [Fraud Detection & Reputation](docs/fraud.md)
- [Business Model & Economics](docs/business-model.md)

---

## 📄 License

MIT © AFRIX Marketplace Ltd.

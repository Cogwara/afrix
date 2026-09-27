# Vercel Production Deployment Guide

AFRIX is optimized for direct deployment to Vercel without requiring Docker, Redis, Celery, or persistent servers.

## Step-by-Step Deployment

### 1. Create a Supabase Project
1. Log in to [Supabase](https://supabase.com) and create a new project.
2. Note your project URL, anon key, and service role key.
3. Under **Storage**, create buckets: `avatars`, `task-evidence` (set to Private), and `business-assets`.

### 2. Configure Vercel Project
1. Push your repository to GitHub.
2. Log in to [Vercel](https://vercel.com) and click **Add New > Project**.
3. Import your AFRIX repository.
4. Set the Framework Preset to **Next.js**.
5. Set Build Command to:
   ```bash
   prisma generate && next build
   ```
6. Set Install Command to:
   ```bash
   npm install
   ```

### 3. Configure Environment Variables in Vercel
Add the following variables under **Project Settings > Environment Variables**:

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL (`https://xyz.supabase.co`) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Private Supabase service role key (Never expose to client!) |
| `DATABASE_URL` | Supabase pooled connection string (port 6543) |
| `DIRECT_URL` | Supabase direct connection string (port 5432) |
| `NEXT_PUBLIC_APP_URL` | Production URL (e.g. `https://afrix.vercel.app`) |
| `CRON_SECRET` | Secret key for authenticating Vercel Cron jobs |
| `RESEND_API_KEY` | (Optional) Resend API key for transactional emails |
| `RESEND_FROM_EMAIL` | (Optional) Sender email address |
| `PAYMENT_PROVIDER` | `mock` (for testing) or production provider adapter |

### 4. Run Migrations & Database Seed
From your local terminal or CI pipeline, push the schema to Supabase:
```bash
DATABASE_URL="<your-pooled-url>" DIRECT_URL="<your-direct-url>" npx prisma db push
DATABASE_URL="<your-pooled-url>" DIRECT_URL="<your-direct-url>" npm run seed
```

### 5. Verify Vercel Cron Jobs
Vercel automatically detects the cron jobs configured in `vercel.json`:
- `/api/cron/daily-missions` (Runs daily at midnight)
- `/api/cron/update-leaderboards` (Runs every 30 minutes)
- `/api/cron/cleanup-expired-tasks` (Runs hourly)

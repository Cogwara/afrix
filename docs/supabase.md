# Supabase Integration Guide

AFRIX leverages Supabase for PostgreSQL, Authentication, and Storage.

## 1. Authentication Configuration

- **Provider**: Supabase Auth (email + password, optional magic link).
- **Session Management**: Handled via `@supabase/ssr` with cookie storage in Next.js Server Components, Server Actions, and Middleware.
- **Profile Synchronization**:
  When a user signs up through `/api/auth/register`, their Supabase `auth.users.id` is linked to `UserProfile.authUserId`.
- **Security Rule**: The `SUPABASE_SERVICE_ROLE_KEY` is strictly confined to server-side code (`lib/supabase/admin.ts`). Never export it in client bundles.

## 2. Storage Buckets

Create the following storage buckets in your Supabase dashboard:

| Bucket Name | Access Level | Purpose | Max Size |
|---|---|---|---|
| `avatars` | Public Read | Worker profile photos and company logos | 2MB |
| `task-evidence` | Private (Signed URLs) | Photos, audio clips, and PDFs uploaded by workers | 10MB |
| `business-assets` | Public Read | Campaign graphics and guidelines | 5MB |

### Storage Security & Validation

- File types are strictly validated by MIME type before upload (`image/jpeg`, `image/png`, `audio/mpeg`, etc.).
- Executables (`.exe`, `.sh`, `.bat`, etc.) are blocked.
- Private task evidence is accessed only through signed URLs generated with `StorageService.getSignedUrl(bucket, path, 3600)` with a 1-hour expiration.

## 3. Database Connection URLs

In your Supabase project settings under **Database > Connection Pooling**:
1. Copy the **Transaction Mode (Pooled)** connection string and set it as `DATABASE_URL`.
2. Copy the **Session Mode (Direct)** connection string and set it as `DIRECT_URL`.

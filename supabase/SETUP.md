# Dear Guest — Supabase setup

**Project:** `jxtmjmsxziowyihktpoq`  
**Dashboard:** https://supabase.com/dashboard/project/jxtmjmsxziowyihktpoq  
**SQL Editor:** https://supabase.com/dashboard/project/jxtmjmsxziowyihktpoq/sql/new

## 1. Environment

```bash
cp .env.local.example .env.local
```

Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` from **Project Settings → API**.

## 2. Database & Storage

### Step 1: Clean up legacy tables (if present)

If you see extra tables (`couples`, `gallery_images`, `rsvps`, `timeline_events`), those are **old Lovable tables** — run:

**`supabase/scripts/DROP-LEGACY-TABLES.sql`**

### Step 2: Run main database setup (RLS, RPC, triggers)

**`supabase/scripts/FULL-SETUP.sql`**

### Step 3: Fix RLS recursion (if you see the error)

If you see `infinite recursion detected in policy for relation "profiles"`:

Run **`supabase/scripts/FIX-PROFILES-RLS-RECURSION.sql`**, then sign out and sign in again.

### Step 4: Create storage buckets (for uploads)

To enable photo and music uploads, run:

**`supabase/scripts/SETUP-STORAGE-BUCKETS.sql`**

This creates:
- **`photos`** bucket (50MB limit) — for wedding gallery
- **`music`** bucket (100MB limit) — for background music

### Tables the app actually uses

| Table | Purpose |
|-------|---------|
| `profiles` | Couple account, slug, theme, super admin |
| `settings` | Invite content (names, venue, hero, gifts) |
| `guests` | Guest list + RSVP (`attendance_status`) |
| `wishes` | Guest messages |
| `program_schedule` | Timeline / program |
| `photos` | Gallery |

### Storage buckets the app uses

| Bucket | Purpose | Max Size |
|--------|---------|----------|
| `photos` | Wedding gallery images | 50MB each |
| `music` | Background music | 100MB each |

## 3. Super admin

After signing up at `/admin`:

```sql
UPDATE public.profiles SET is_super_admin = true
WHERE email ILIKE 'your-email@example.com';
```

## 4. Dev server

```powershell
cd dear-guest-app
npm run dev
```

http://localhost:8080

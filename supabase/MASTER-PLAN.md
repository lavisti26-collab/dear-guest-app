# Dear Guest App — Master Plan (discussion doc)

Use this document to align before running SQL or changing production data.  
**Nothing below runs automatically** — you choose what to execute in Supabase SQL Editor.

---

## 1. What this app is

| Piece | Purpose |
|--------|---------|
| **Public invite** | `/invite/:slug` — guests see wedding page, RSVP, wishes |
| **Couple admin** | `/admin` — login, edit settings, guests, photos, program |
| **Super admin** | `/admin/super` — see all couples (one master account) |
| **Backend** | Supabase project `jxtmjmsxziowyihktpoq` |
| **Frontend** | React + Vite on **http://localhost:8080** |

---

## 2. Correct Supabase project (important)

| Item | Value |
|------|--------|
| **Project ID** | `jxtmjmsxziowyihktpoq` |
| **URL** | `https://jxtmjmsxziowyihktpoq.supabase.co` |
| **Dashboard** | https://supabase.com/dashboard/project/jxtmjmsxziowyihktpoq |
| **SQL Editor** | https://supabase.com/dashboard/project/jxtmjmsxziowyihktpoq/sql/new |

Do **not** use `fydvwbwpvjlmdsvkymkn` — that was a wrong project used earlier in `.env`.

**Super admin email:** `phatsopheakdey08@gmail.com`

---

## 3. Your real database schema (what Supabase actually has)

The repo migrations assumed different column names. **Your live DB** looks like this:

### `profiles`
- `id`, `user_id`, `slug`, `email`, `display_name`
- `groom_name`, `bride_name` (Khmer defaults)
- `wedding_date`, `theme` (e.g. `classic-elegant-khmer`)
- `background_music_url`, `bank_qr_url`
- `is_super_admin`

### `guests`
- `guest_name` (not `name`)
- `attendance_status` (not `rsvp_status`) — values: `pending`, `attending`, `not_attending`
- `total_guests` (not `number_of_guests`)
- `meal_preference`, `note`, `phone_number`, `dietary_notes`
- `user_id` → `auth.users`

### `wishes`
- `guest_name`, `wish_message` (not `message`)

### `program_schedule`
- **Required:** `event_time`, `event_title`
- **Also:** `time_en`, `time_km`, `title_en`, `title_km`, `order_index`

### `settings`
- `couple_names`, `couple_names_km`, `wedding_date`, `venue`, `venue_maps`
- `hero_image`, `music_file`, `music_url`
- `gift_*`, `user_id`, `created_by`, `gift_enabled`

### `photos`
- `url`, `user_id`, `created_by`, optional `caption`

### `admin` table
- **Not used by this app** — auth is Supabase Auth + `profiles.is_super_admin`

---

## 4. What went wrong (summary)

| Problem | Cause |
|---------|--------|
| Login: `permission denied for function is_super_admin` | RLS called `is_super_admin()` but DB revoked EXECUTE from `authenticated` |
| Login: `null value in column "id" on profiles` | `profiles.id` had no default; inserts omitted `id` |
| Blank invite page | Wrong columns in app; envelope hid content; `profiles_public` / RPC incomplete |
| Add guest failed | App used `name` / `rsvp_status`; DB expects `guest_name` / `attendance_status` |
| SQL: `function does not exist` | Migrations never fully applied on live DB |
| SQL: `cannot change return type` | Must `DROP FUNCTION` before recreating `get_public_profile_by_slug` |
| Two Supabase projects | `.env` pointed at wrong project for a while |

---

## 5. What we already changed in the codebase (local)

| File / area | Change |
|-------------|--------|
| `.env.local` | Project `jxtmjmsxziowyihktpoq` + correct anon key |
| `src/lib/db-schema.ts` | **Maps your DB columns ↔ app fields** |
| `src/contexts/WeddingDataContext.tsx` | Uses `db-schema` for read/write |
| `src/pages/PublicInvitationPage.tsx` | RPC profile + auto-open invitation |
| `src/pages/InvitationPage.tsx` | Loading state + auto-show content |
| `src/pages/AdminRoute.tsx` | Profile insert includes `id` |
| `src/integrations/supabase/client.ts` | Single client from `.env` |
| `supabase/config.toml` | `project_id = jxtmjmsxziowyihktpoq` |

**You still need to run SQL in Supabase** for DB functions, RLS, and grants.

---

## 6. SQL scripts — what each one does (run in order)

All paths: `dear-guest-app/supabase/scripts/`

| Order | File | When to run | Purpose |
|-------|------|-------------|---------|
| **A** | `BOOTSTRAP.sql` | Once, if DB never fully set up | Profiles, RLS, triggers, super admin, backfill |
| **B** | `fix-profiles-id.sql` | If login fails on `profiles.id` | `id` default + signup trigger |
| **C** | `align-app-views.sql` | **Required for invite links** | RPC `get_public_profile_by_slug` + `profiles_public` view (includes DROP FUNCTION) |
| **D** | `fix-invite-and-guests.sql` | If invite/guests still broken | Grants, guest policies, id defaults |
| **E** | `fix-guests-user-id.sql` | If admin “add guest” still fails | `guests.user_id` + insert policies |

**How to run:** SQL Editor → Ctrl+A → delete → paste **one full file** → **Run** → wait for Success → next file.

**Do not** mix random snippets from old tabs — use the files above only.

---

## 7. Recommended “fresh start” path (discussion)

### Phase A — Confirm environment (5 min)
- [ ] Supabase project = `jxtmjmsxziowyihktpoq`
- [ ] `.env.local` matches dashboard → Settings → API
- [ ] `npm install` then `npm run dev` → http://localhost:8080
- [ ] Clear browser storage for localhost (old wrong-project session)

### Phase B — Database (15 min, in SQL Editor)
- [ ] Run `align-app-views.sql` (after our DROP FUNCTION fix)
- [ ] If login issues: `fix-profiles-id.sql`
- [ ] If guests fail: `fix-guests-user-id.sql`
- [ ] Optional full reset: `BOOTSTRAP.sql` only if you accept it may touch policies/triggers (review file first)

### Phase C — Accounts
- [ ] Sign up / sign in at `/admin` with `phatsopheakdey08@gmail.com`
- [ ] Confirm super admin: run in SQL:
  ```sql
  UPDATE public.profiles SET is_super_admin = true
  WHERE lower(email) = lower('phatsopheakdey08@gmail.com');
  ```
- [ ] Note your **public slug** from admin dashboard (e.g. `metauzi12-8056a5`)

### Phase D — Content
- [ ] Admin → Settings: couple names, date, venue, hero image
- [ ] Or rely on `profiles.groom_name` / `bride_name` (app reads both)
- [ ] Add 1–2 test guests
- [ ] Open `/invite/YOUR-SLUG`

### Phase E — Verify
- [ ] Invite shows names, hero, sections (after load / open)
- [ ] Add guest works + toast success
- [ ] `/admin/super` works for super admin email

---

## 8. URLs cheat sheet

| URL | Who |
|-----|-----|
| http://localhost:8080/ | Landing |
| http://localhost:8080/admin | Couple login |
| http://localhost:8080/admin/super | Super admin |
| http://localhost:8080/invite/SLUG | Public invitation |
| http://localhost:8080/invite/SLUG?guest=Name | Personalized invite |
| http://localhost:8080/invite/SLUG?envelope=1 | Force envelope tap before content |

---

## 9. Decisions to discuss before “everything new”

Answer these so we don’t redo work:

1. **Wipe data?**  
   - Keep existing profiles/guests/settings?  
   - Or delete test rows and start clean?

2. **Single source for couple names?**  
   - **Option A:** Only `settings.couple_names` (admin edits settings)  
   - **Option B:** Only `profiles.groom_name` + `bride_name`  
   - **Option C:** Both (app merges — current code)

3. **Envelope animation?**  
   - **Auto-open** after load (current code)  
   - **Always require tap** (`?envelope=1` or change code)

4. **One SQL bundle?**  
   - We can merge A–E into one `FULL-SETUP.sql` for a single Run — say if you want that.

5. **Production deploy?**  
   - Vercel/Netlify + same Supabase project + env vars copy from `.env.local`

6. **Email confirm / Google login?**  
   - Supabase Auth settings (confirm email on/off affects signup)

---

## 10. What “success” looks like

- [ ] Login at `/admin` with no `is_super_admin` or `id` errors  
- [ ] Super admin sees `/admin/super`  
- [ ] Public link shows wedding content (not empty cream page)  
- [ ] Add guest saves and appears in list  
- [ ] RSVP / wishes work on public page (if you test them)

---

## 11. Files to ignore (old / messy)

| Ignore | Use instead |
|--------|-------------|
| Old SQL in saved query “Wedding Website Schema” mixed snippets | `scripts/*.sql` files only |
| Multiple patch migrations not applied via CLI | Run `scripts/` in dashboard |
| `fydvwbwpvjlmdsvkymkn` keys | `jxtmjmsxziowyihktpoq` only |

---

## 12. Next step for our discussion

Reply with:

1. Phase B: which scripts you already ran successfully  
2. Answers to section 9 (wipe data? names source? envelope?)  
3. Whether you want **one combined SQL file** for a single Run  
4. Your current **slug** and whether invite still blank after `align-app-views.sql` + DROP FUNCTION fix  

Then we can lock the plan and execute step-by-step without more trial-and-error.

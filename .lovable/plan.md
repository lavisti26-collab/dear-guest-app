# Multi-Tenant Wedding SaaS Upgrade

This is a large architectural change. I'll execute in 4 phases. Please approve the plan and I'll start with Phase 1 immediately.

## Phase 1 — Database multi-tenancy & auth (foundation)

Migrate the backend to be per-couple. Without this, nothing else works.

**Schema changes (new migration):**
- `profiles` table: `user_id` (FK auth.users), `display_name`, `slug` (unique URL handle, e.g. `sokha-dara`), `is_super_admin` (bool), `theme` (text), `created_at`. Auto-created via `handle_new_user` trigger on signup. Slug auto-derived from email, editable later.
- Add `user_id uuid NOT NULL` to: `settings`, `guests`, `wishes`, `photos`, `program_schedule`. Backfill existing rows to a placeholder, then enforce NOT NULL.
- Drop the existing permissive `*_public_all` policies. Replace with:
  - **Owner policies** (authenticated): full CRUD where `user_id = auth.uid()`.
  - **Public read policies** (anon + authenticated): SELECT only, scoped by slug lookup via security-definer function `get_user_id_by_slug(slug)` so guests can read by visiting `/invite/:slug` without auth.
- GRANT statements for anon (SELECT) + authenticated (ALL) + service_role.
- `has_role` pattern is overkill here; super admin is a single boolean on `profiles` set manually for your email.

**Auth:**
- Google OAuth already configured. Keep email/password. Add signup → trigger creates blank profile + default `settings` row + 3 starter `program_schedule` rows so new couples see a working blank slate.

## Phase 2 — Routing, public link & QR code

- New routes:
  - `/` → marketing landing (signup CTA)
  - `/invite/:slug` → public guest invitation (current InvitationPage, but loads data by slug)
  - `/admin` → couple's own dashboard (auth required)
  - `/admin/super` → super admin (super_admin only, shows couples list + stats)
- `InvitationPage` refactored to fetch by slug via `WeddingDataContext`.
- Admin dashboard: show public link + QR code (use `qrcode` lib, already familiar) with download button.

## Phase 3 — Themes, fonts, music, envelope autoplay

- Add Google Fonts: **Moul** (Khmer headings), **Battambang** + keep **Kantumruy Pro** (body). Update `index.html` preconnect + `tailwind.config.ts` font families: `font-khmer-display` (Moul), `font-khmer` (Kantumruy Pro), `font-khmer-serif` (Battambang).
- Fix Khmer CSS: tighter line-height for Moul headings, proper letter-spacing, scale tweaks per font.
- **Envelope autoplay fix**: in `EnvelopeAnimation.onClick`, call `audio.play()` synchronously inside the click handler (user gesture satisfies autoplay policy). Wire via shared `MusicContext` so MusicToggle stays in sync.
- Theme selector in admin: "Classic Elegant Khmer" (gold + Moul), "Modern Minimalist" (clean sans, neutral), "Romantic Luxury" (current rose-gold). Already have `ThemeContext`; persist choice to `profiles.theme` so guests see chosen theme.

## Phase 4 — RSVP tracker, gift QR, super admin

- Extend `guests` table: `meal_preference` text, `note` text. Update RSVP form on public page + admin table view with columns Name / Attendance / Meal / Note + CSV export.
- Gift section: already has `gift_bank_name/account/qr_code` in settings + a `gift_enabled` bool toggle.
- Super admin dashboard: list all profiles, total guests, total RSVPs, recent signups. Guarded by `profile.is_super_admin`.

## Technical notes

- The current `pink/lavender/rainbow` theme system stays as guest-facing presets — couples pick from this list in admin.
- Existing tables already have data from earlier seeding. Migration will assign that data to the first signed-up user OR delete it — I'll delete it since it's placeholder/seed.
- QR code lib: `qrcode.react` (lightweight, ~5kb).
- I will NOT change unrelated UI (petals, hearts, emoji trail all stay).

## What I need from you

1. **Approve this plan** (reply yes / make changes).
2. **Your master email** for super admin access — tell me which email is yours so I seed `is_super_admin = true` on it after you sign up.
3. Confirm it's OK to **wipe the existing demo data** in `guests/wishes/photos/program_schedule/settings` (it's seed data, no real users yet).

After approval I'll execute phases sequentially in follow-up messages.

# Complete Supabase Setup Checklist

## ✅ Prerequisites
- [ ] Supabase project created: `jxtmjmsxziowyihktpoq`
- [ ] `.env.local` exists with correct credentials (already done ✓)
- [ ] You're logged in to Supabase: https://supabase.com/dashboard/project/jxtmjmsxziowyihktpoq

---

## 📋 Phase 1: Database Tables & Functions

### Run in Supabase SQL Editor (in order):

**1️⃣ Clean Legacy Tables (if present)**
```
Copy & paste: supabase/scripts/DROP-LEGACY-TABLES.sql
Click "Run"
```
✓ This removes old `couples`, `gallery_images`, `rsvps`, `timeline_events` tables

**2️⃣ Create Tables + RLS + Functions**
```
Copy & paste: supabase/scripts/FULL-SETUP.sql
Click "Run"
```
✓ Creates: `profiles`, `settings`, `guests`, `wishes`, `program_schedule`, `photos`
✓ Sets up RLS policies (security)
✓ Creates RPC function `get_public_profile_by_slug()`

**3️⃣ Fix RLS Recursion (if needed)**
If you see error: `infinite recursion detected in policy for relation "profiles"`
```
Copy & paste: supabase/scripts/FIX-PROFILES-RLS-RECURSION.sql
Click "Run"
Sign out and sign in again
```

---

## 📦 Phase 2: Storage Buckets (for uploads)

### Run in Supabase SQL Editor:

**4️⃣ Create Storage Buckets** ← **THIS IS WHAT WAS MISSING**
```
Copy & paste: supabase/scripts/SETUP-STORAGE-BUCKETS.sql
Click "Run"
```
✓ Creates `photos` bucket (50MB per file)
✓ Creates `music` bucket (100MB per file)
✓ Sets public read permissions
✓ Allows authenticated users to upload

**Verify in Supabase UI:**
1. Go to https://supabase.com/dashboard/project/jxtmjmsxziowyihktpoq/storage/buckets
2. You should see:
   - 📷 `photos` bucket
   - 🎵 `music` bucket

---

## 👤 Phase 3: Super Admin (Optional)

**5️⃣ Make yourself super admin**
```sql
UPDATE public.profiles SET is_super_admin = true
WHERE email = 'your-email@example.com';
```

This lets you:
- See all couples' invitations
- Access `/admin/super` page

---

## 🧪 Phase 4: Test Locally

**6️⃣ Start dev server**
```powershell
cd "dear-guest-app"
npm run dev
```
Opens: http://localhost:8080

**7️⃣ Test uploads**
1. Go to http://localhost:8080/admin
2. Sign in with your credentials
3. Go to **Photos** tab
4. Click upload, select an image
5. Should see ✅ "Uploaded!" message

**8️⃣ Test invitation**
1. Set wedding details in **Wedding** tab
2. Note the slug shown (e.g., `your-wedding-slug`)
3. Go to http://localhost:8080/invite/your-wedding-slug
4. Should see your invitation page with all details

---

## 📊 What Each Table Stores

| Table | Purpose | Key Columns |
|-------|---------|------------|
| `profiles` | Couple accounts | `user_id`, `slug`, `display_name`, `theme`, `is_super_admin` |
| `settings` | Wedding info | `couple_names`, `wedding_date`, `venue`, `hero_image` |
| `guests` | Guest list | `guest_name`, `attendance_status`, `total_guests` |
| `wishes` | Guest messages | `guest_name`, `wish_message`, `created_at` |
| `program_schedule` | Timeline | `event_time`, `event_title`, `order_index` |
| `photos` | Gallery images | `url`, `user_id` |

---

## 🔒 Storage Buckets

| Bucket | Purpose | File Types | Max Size |
|--------|---------|-----------|----------|
| `photos` | Wedding gallery | JPG, PNG, WebP, GIF, SVG | 50MB |
| `music` | Background audio | MP3, WAV, OGG, WebM | 100MB |

---

## ❌ Common Issues & Fixes

| Error | Cause | Fix |
|-------|-------|-----|
| `Upload failed: Bucket not found` | Buckets not created | Run `SETUP-STORAGE-BUCKETS.sql` |
| `infinite recursion detected in policy` | RLS policy issue | Run `FIX-PROFILES-RLS-RECURSION.sql` |
| `permission denied for function` | Function not created | Re-run `FULL-SETUP.sql` |
| Blank invitation page | Wrong slug or profile not found | Check table `profiles`, ensure `slug` exists |
| Can't add guests | Table structure mismatch | Verify `guests` table has `guest_name`, `attendance_status` |

---

## 📝 SQL File Locations

All scripts are in: `supabase/scripts/`

```
supabase/
├── scripts/
│   ├── DROP-LEGACY-TABLES.sql
│   ├── FULL-SETUP.sql
│   ├── FIX-PROFILES-RLS-RECURSION.sql
│   └── SETUP-STORAGE-BUCKETS.sql ← **NEW**
├── config.toml
├── SETUP.md
└── MASTER-PLAN.md
```

---

## ✨ Summary of Setup Steps

1. ✅ Environment already configured (`.env.local`)
2. 🔧 Run: `DROP-LEGACY-TABLES.sql`
3. 🔧 Run: `FULL-SETUP.sql`
4. 🔧 Run: `FIX-PROFILES-RLS-RECURSION.sql` (if error)
5. 🔧 **Run: `SETUP-STORAGE-BUCKETS.sql`** ← Do this now!
6. 🧪 Test by uploading photos
7. 🎉 Done!

---

## Need Help?

- 📖 Read: `supabase/SETUP.md`
- 📖 Read: `supabase/MASTER-PLAN.md`
- 🔗 Supabase Dashboard: https://supabase.com/dashboard/project/jxtmjmsxziowyihktpoq

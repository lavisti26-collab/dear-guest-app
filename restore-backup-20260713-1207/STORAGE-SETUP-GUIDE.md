# Quick Fix: Storage Bucket Setup Guide

## Problem
`Upload failed: Bucket not found` error when trying to upload photos or music.

## Root Cause
The Supabase storage buckets (`photos` and `music`) have not been created yet.

---

## Solution: 4 Steps

### Step 1: Go to Supabase SQL Editor
👉 https://supabase.com/dashboard/project/jxtmjmsxziowyihktpoq/sql/new

### Step 2: Run the database setup scripts IN THIS ORDER:

**If this is a fresh project, run all:**
1. `supabase/scripts/DROP-LEGACY-TABLES.sql` (if old tables exist)
2. `supabase/scripts/FULL-SETUP.sql` (creates tables + RLS)
3. `supabase/scripts/FIX-PROFILES-RLS-RECURSION.sql` (if you get recursion error)
4. `supabase/scripts/SETUP-STORAGE-BUCKETS.sql` ✨ **NEW** (creates photo/music buckets)

**If your database is already set up, just run:**
- `supabase/scripts/SETUP-STORAGE-BUCKETS.sql`

### Step 3: Copy and paste into Supabase SQL Editor

```sql
-- Copy the entire content from:
-- supabase/scripts/SETUP-STORAGE-BUCKETS.sql
-- And paste into SQL Editor, then click "Run"
```

### Step 4: Verify in Supabase

Go to: **Storage** → You should see two buckets:
- ✅ `photos` (50MB max)
- ✅ `music` (100MB max)

---

## Test It

1. Refresh your app: http://localhost:8080/admin
2. Go to **Photos** or **Music** tab
3. Try uploading an image or audio file
4. Should see: ✅ "Uploaded!" message

---

## What Each Bucket Does

| Bucket | Usage | File Type | Max Size |
|--------|-------|-----------|----------|
| **photos** | Wedding gallery images | JPG, PNG, WebP, GIF | 50MB |
| **music** | Background music | MP3, WAV, OGG | 100MB |

---

## Troubleshooting

### Still getting "Bucket not found"?
- ✅ Did you run the SQL script?
- ✅ Click "Run" in SQL Editor
- ✅ Refresh the page
- ✅ Check Supabase > Storage tab

### "Policy already exists" error?
- This is OK! It means the script ran before. Just refresh your app.

### Can't upload - "Permission denied"?
- Make sure you're **logged in** as an admin (`/admin`)
- The SQL sets permissions for authenticated users only

---

## Files Updated

✨ **NEW:**
- `supabase/scripts/SETUP-STORAGE-BUCKETS.sql` — SQL to create buckets

📝 **UPDATED:**
- `supabase/SETUP.md` — Added storage bucket setup instructions

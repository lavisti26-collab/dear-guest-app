import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const BUCKET = process.env.SUPABASE_BUCKET || 'fonts';

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Set SUPABASE_URL and SUPABASE_SERVICE_KEY environment variables before running.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { persistSession: false },
});

function getContentType(filename) {
  if (/\.woff2$/i.test(filename)) return 'font/woff2';
  if (/\.woff$/i.test(filename)) return 'font/woff';
  if (/\.ttf$/i.test(filename)) return 'font/ttf';
  return 'application/octet-stream';
}

async function ensureBucketExists(bucket) {
  console.log(`Ensuring bucket exists: ${bucket}`);
  const { error: createError } = await supabase.storage.createBucket(bucket, { public: true });
  if (createError && !createError.message?.toLowerCase().includes('already exists')) {
    throw createError;
  }
}

async function uploadFile(localPath, destPath) {
  const file = fs.readFileSync(localPath);
  const { data, error } = await supabase.storage.from(BUCKET).upload(destPath, file, {
    cacheControl: '3600',
    contentType: getContentType(destPath),
    upsert: true,
  });
  if (error) throw error;
  return data;
}

async function main() {
  const fontsDir = path.join(__dirname, '..', 'public', 'assets', 'fonts');
  if (!fs.existsSync(fontsDir)) {
    console.error('Fonts directory not found:', fontsDir);
    process.exit(1);
  }
  const files = fs.readdirSync(fontsDir).filter(f => /\.(ttf|woff2|woff)$/i.test(f));
  if (files.length === 0) {
    console.error('No font files found in', fontsDir);
    process.exit(1);
  }

  try {
    await ensureBucketExists(BUCKET);
  } catch (err) {
    console.error('Could not ensure bucket exists:', err.message || err);
    process.exit(1);
  }

  for (const f of files) {
    const localPath = path.join(fontsDir, f);
    const destPath = f;
    console.log('Uploading', f, '→', `${BUCKET}/${destPath}`);
    try {
      const res = await uploadFile(localPath, destPath);
      console.log('Uploaded:', res.path || JSON.stringify(res));
    } catch (err) {
      console.error('Upload failed for', f, err.message || err);
    }
  }
  console.log('Done. Ensure your storage bucket is public or configure a signed URL for access.');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});

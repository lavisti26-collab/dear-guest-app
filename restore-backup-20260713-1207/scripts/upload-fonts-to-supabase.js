import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const BUCKET = process.env.SUPABASE_BUCKET || 'fonts';
const FONTS_DIR = process.env.SUPABASE_FONTS_DIR
  ? path.resolve(process.env.SUPABASE_FONTS_DIR)
  : path.join(__dirname, '..', 'fonts');

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
  const fontsDir = FONTS_DIR;
  if (!fs.existsSync(fontsDir)) {
    console.error('Fonts directory not found:', fontsDir);
    process.exit(1);
  }

  const files = [];
  function walkDirectory(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const entryPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walkDirectory(entryPath);
      } else if (/\.(ttf|woff2|woff)$/i.test(entry.name)) {
        files.push(entryPath);
      }
    }
  }
  walkDirectory(fontsDir);

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

  for (const filePath of files) {
    const localPath = filePath;
    const destPath = path.basename(filePath);
    console.log('Uploading', filePath, '→', `${BUCKET}/${destPath}`);
    try {
      const res = await uploadFile(localPath, destPath);
      console.log('Uploaded:', res.path || JSON.stringify(res));
    } catch (err) {
      console.error('Upload failed for', filePath, err.message || err);
    }
  }
  console.log('Done. Ensure your storage bucket is public or configure a signed URL for access.');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});

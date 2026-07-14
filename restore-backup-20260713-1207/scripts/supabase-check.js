import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

function parseEnv(text) {
  const out = {};
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx === -1) continue;
    const k = trimmed.slice(0, idx).trim();
    let v = trimmed.slice(idx + 1).trim();
    if (v.startsWith('"') && v.endsWith('"')) v = v.slice(1, -1);
    out[k] = v;
  }
  return out;
}

function loadLocalEnv() {
  const p = path.resolve(process.cwd(), '.env.local');
  try {
    const txt = fs.readFileSync(p, 'utf8');
    return parseEnv(txt);
  } catch (e) {
    return {};
  }
}

const local = loadLocalEnv();
const url = local.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const key = local.VITE_SUPABASE_ANON_KEY || local.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!url || !key) {
  console.error('Missing Supabase environment variables. Check .env.local or environment.');
  console.error('Found:', { url: !!url, key: !!key });
  process.exit(2);
}

console.log('Using Supabase URL:', url.replace(/(^https?:\/\/)|(:\/\/)/, ''));

const supabase = createClient(url, key);

(async () => {
  try {
    console.log('Checking connectivity by fetching 1 row from `profiles` (if table exists)...');
    const { data, error, status } = await supabase.from('profiles').select('id').limit(1);
    if (error) {
      console.error('Query returned error:', error.message || error);
      process.exit(3);
    }
    console.log('Query OK — returned rows:', Array.isArray(data) ? data.length : 'unknown', 'status:', status);
    console.log('Sample:', data);
  } catch (e) {
    console.error('Unexpected error during check:', e);
    process.exit(4);
  }
})();

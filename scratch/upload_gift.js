import fs from 'fs';
import path from 'path';
import https from 'https';
import { createClient } from '@supabase/supabase-js';

function loadEnv() {
  const envPath = path.resolve('c:/Users/GATEWAY/OneDrive/Attachments/OneDrive/Desktop/WDLAST(0711)/dear-guest-app', '.env.local');
  const content = fs.readFileSync(envPath, 'utf8');
  const env = {};
  content.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const parts = trimmed.split('=');
    if (parts.length >= 2) {
      const key = parts[0].trim();
      const val = parts.slice(1).join('=').trim().replace(/^['"]|['"]$/g, '');
      env[key] = val;
    }
  });
  return env;
}

const env = loadEnv();
const CLIENT_ID = env.ICONSCOUT_CLIENT_ID;
const SECRET_KEY = env.ICONSCOUT_SECRET_KEY;
const SUPABASE_URL = env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

function request(url, options = {}, postData = null) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ statusCode: res.statusCode, body: data }));
    });
    req.on('error', reject);
    if (postData) req.write(JSON.stringify(postData));
    req.end();
  });
}

function downloadRawFile(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

async function run() {
  const uuid = 'a77c83f0-5ef7-11eb-8ebd-0242ac140003';
  console.log('Downloading gift icon...');
  const res = await request(`https://api.iconscout.com/v3/items/${uuid}/api-download`, {
    method: 'POST',
    headers: {
      'Client-ID': CLIENT_ID,
      'Client-Secret': SECRET_KEY,
      'Content-Type': 'application/json'
    }
  }, { format: 'svg' });

  const json = JSON.parse(res.body);
  const downloadUrl = json.response.download.url;
  const rawSvg = await downloadRawFile(downloadUrl);
  
  // Normalize
  let normalized = rawSvg.replace(/stroke="[^"]+"/g, (match) => match.includes('none') ? match : 'stroke="currentColor"');
  normalized = normalized.replace(/fill="[^"]+"/g, (match) => match.includes('none') ? match : 'fill="currentColor"');

  const { error } = await supabase.storage
    .from('photos')
    .upload('icons/gift.svg', Buffer.from(normalized), {
      contentType: 'image/svg+xml',
      upsert: true
    });

  if (error) throw error;
  console.log('Gift icon uploaded successfully!');
}

run().catch(console.error);

import fs from 'fs';
import path from 'path';
import https from 'https';
import { createClient } from '@supabase/supabase-js';

// Parse .env.local
function loadEnv() {
  const envPath = path.resolve(process.cwd(), '.env.local');
  if (!fs.existsSync(envPath)) {
    console.error('.env.local not found');
    process.exit(1);
  }
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
const ICONSCOUT_CLIENT_ID = env.ICONSCOUT_CLIENT_ID;
const ICONSCOUT_SECRET_KEY = env.ICONSCOUT_SECRET_KEY;
const SUPABASE_URL = env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;

if (!ICONSCOUT_CLIENT_ID || !ICONSCOUT_SECRET_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Selected UUIDs for the 13 categories (all verified free outline icons)
const SELECTED_UUIDS = {
  guests: '506904e0-e4af-11f0-8612-0242ac140003',
  rsvp: '76a02ed2-9d1b-11e8-aa5b-16f546a19484',
  wishes: 'e7567d30-9672-11ea-ad30-0242ac140003',
  photos: 'c63ef860-ba6e-11e9-811c-0242ac140003',
  wedding: '1a8adbd0-c26e-11ec-b03a-0242ac140003',
  program: 'e756fc70-9672-11ea-b896-0242ac140003',
  map: 'c9daa0a0-2df1-11e9-9fff-0242ac140003',
  bank: '63250320-bfe6-11e9-8f96-0242ac140003',
  contacts: 'b784ae10-0d1e-11eb-8bcb-0242ac140003',
  music: 'b49a90b0-b2ab-11e9-a23a-0242ac140003',
  theme: 'd5850ba0-63da-11f0-9311-0242ac140003',
  home: 'e7566dd0-9672-11ea-8d76-0242ac140003',
  gallery: 'b3a3fce0-e4f0-11ed-8c13-0242ac140003',
};

// Extra concepts to search and download
const EXTRA_SEARCHES = {};

// Helper for https requests
function request(url, options = {}, postData = null) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ statusCode: res.statusCode, body: data }));
    });
    req.on('error', reject);
    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
}

// Download file from URL as text
function downloadRawFile(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

// Normalize SVG code for dynamic coloring with currentColor
function normalizeSvg(svgContent) {
  // Replace stroke="#..." or stroke="rgb(...)" with stroke="currentColor"
  let normalized = svgContent.replace(/stroke="[^"]+"/g, (match) => {
    if (match.includes('none')) return match;
    return 'stroke="currentColor"';
  });

  // Replace fill="#..." or fill="rgb(...)" with fill="currentColor" (except fill="none")
  normalized = normalized.replace(/fill="[^"]+"/g, (match) => {
    if (match.includes('none')) return match;
    return 'fill="currentColor"';
  });

  return normalized;
}

// Retrieve SVG URL using Iconscout download API
async function getDownloadUrl(uuid) {
  console.log(`Requesting download URL for UUID ${uuid}...`);
  const res = await request(`https://api.iconscout.com/v3/items/${uuid}/api-download`, {
    method: 'POST',
    headers: {
      'Client-ID': ICONSCOUT_CLIENT_ID,
      'Client-Secret': ICONSCOUT_SECRET_KEY,
      'Content-Type': 'application/json'
    },
  }, { format: 'svg' });

  if (res.statusCode !== 200) {
    throw new Error(`Failed to request download for ${uuid}: status ${res.statusCode}, body: ${res.body}`);
  }

  const json = JSON.parse(res.body);
  const downloadObj = json.response?.download;
  if (!downloadObj || !downloadObj.url) {
    throw new Error(`Invalid response for download API of ${uuid}: ${res.body}`);
  }

  return downloadObj.url;
}

// Search for an outline icon and return the first item's UUID
async function searchForIcon(query) {
  console.log(`Searching for "${query}"...`);
  const encodedQuery = encodeURIComponent(query);
  const res = await request(`https://api.iconscout.com/v3/search?asset=icon&per_page=1&query=${encodedQuery}`, {
    headers: {
      'Client-ID': ICONSCOUT_CLIENT_ID
    }
  });

  if (res.statusCode !== 200) {
    throw new Error(`Search failed for ${query}: status ${res.statusCode}`);
  }

  const json = JSON.parse(res.body);
  const items = json.response?.items?.data || [];
  if (items.length === 0) {
    throw new Error(`No icons found for query "${query}"`);
  }

  return items[0].uuid;
}

async function run() {
  const finalIcons = {};

  // 1. Process selected UUIDs
  for (const [name, uuid] of Object.entries(SELECTED_UUIDS)) {
    finalIcons[name] = uuid;
  }

  // 2. Search and process extra icons
  for (const [name, query] of Object.entries(EXTRA_SEARCHES)) {
    try {
      const uuid = await searchForIcon(query);
      finalIcons[name] = uuid;
      console.log(`Resolved extra icon "${name}" to UUID: ${uuid}`);
    } catch (err) {
      console.error(`Failed to resolve extra icon ${name}:`, err.message);
    }
  }

  // Create temporary directory for verification
  const tempDir = path.resolve(process.cwd(), 'scratch_downloaded_svgs');
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  // 3. Download, normalize, and upload
  for (const [name, uuid] of Object.entries(finalIcons)) {
    try {
      console.log(`Processing "${name}" (${uuid})...`);
      const downloadUrl = await getDownloadUrl(uuid);
      const rawSvg = await downloadRawFile(downloadUrl);
      const normalizedSvg = normalizeSvg(rawSvg);

      // Save locally for debug/record
      const localPath = path.join(tempDir, `${name}.svg`);
      fs.writeFileSync(localPath, normalizedSvg);
      console.log(`Saved locally to ${localPath}`);

      // Upload to Supabase Storage
      const storagePath = `icons/${name}.svg`;
      console.log(`Uploading to Supabase: photos/${storagePath}...`);

      const { data, error } = await supabase.storage
        .from('photos')
        .upload(storagePath, Buffer.from(normalizedSvg), {
          contentType: 'image/svg+xml',
          upsert: true,
        });

      if (error) {
        throw error;
      }
      console.log(`Uploaded successfully! URL: ${SUPABASE_URL}/storage/v1/object/public/photos/${storagePath}`);

      // If this is the "program" icon, let's also upload/copy it to "details" for Guest Nav
      if (name === 'program') {
        const detailsStoragePath = 'icons/details.svg';
        console.log(`Uploading duplicate of program to: photos/${detailsStoragePath}...`);
        const { error: copyErr } = await supabase.storage
          .from('photos')
          .upload(detailsStoragePath, Buffer.from(normalizedSvg), {
            contentType: 'image/svg+xml',
            upsert: true,
          });
        if (copyErr) throw copyErr;
        console.log('Details icon uploaded successfully!');
      }

    } catch (err) {
      console.error(`Error processing icon "${name}":`, err.message);
    }
  }

  console.log('All icons processed successfully!');
}

run().catch(console.error);

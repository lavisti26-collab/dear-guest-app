import fs from 'fs';
import path from 'path';
import https from 'https';

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

function request(url, options = {}) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ statusCode: res.statusCode, body: data }));
    });
    req.on('error', reject);
    req.end();
  });
}

async function run() {
  const CONCEPTS = {
    guests: 'users',
    rsvp: 'clipboard',
    wishes: 'heart',
    photos: 'camera',
    wedding: 'wedding rings',
    program: 'calendar',
    map: 'map pin',
    bank: 'bank',
    contacts: 'phone',
    music: 'music',
    theme: 'palette',
    home: 'home',
    gallery: 'image'
  };

  console.log('Searching for free outline icons...');
  for (const [name, query] of Object.entries(CONCEPTS)) {
    const encodedQuery = encodeURIComponent(query);
    const res = await request(`https://api.iconscout.com/v3/search?asset=icon&price=free&per_page=1&query=${encodedQuery}`, {
      headers: { 'Client-ID': CLIENT_ID }
    });
    
    const json = JSON.parse(res.body);
    const items = json.response?.items?.data || [];
    if (items.length > 0) {
      console.log(`- ${name.toUpperCase()} ("${query}"): Name: "${items[0].name}", UUID: "${items[0].uuid}"`);
    } else {
      console.log(`- ${name.toUpperCase()} ("${query}"): NO FREE ICON FOUND`);
    }
  }
}

run().catch(console.error);

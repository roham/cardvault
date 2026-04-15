#!/usr/bin/env node
// Fetches real card images from eBay Browse API for sports cards
// Usage: node scripts/fetch-card-images.mjs [--limit 100] [--sport baseball]

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import path from 'path';

const envContent = readFileSync('.env.local', 'utf8');
const CLIENT_ID = envContent.match(/EBAY_CLIENT_ID=(.*)/)?.[1]?.trim();
const CLIENT_SECRET = envContent.match(/EBAY_CLIENT_SECRET=(.*)/)?.[1]?.trim();

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error('Missing EBAY_CLIENT_ID or EBAY_CLIENT_SECRET in .env.local');
  process.exit(1);
}

// Parse args
const args = process.argv.slice(2);
const limitIdx = args.indexOf('--limit');
const sportIdx = args.indexOf('--sport');
const LIMIT = limitIdx >= 0 ? parseInt(args[limitIdx + 1]) : 200;
const SPORT_FILTER = sportIdx >= 0 ? args[sportIdx + 1] : null;

const IMAGE_DIR = path.join('public', 'images', 'cards');
mkdirSync(IMAGE_DIR, { recursive: true });

// Load existing image map if present
const MAP_FILE = path.join('data', 'card-images.json');
let imageMap = {};
if (existsSync(MAP_FILE)) {
  imageMap = JSON.parse(readFileSync(MAP_FILE, 'utf8'));
}

async function getToken() {
  const auth = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');
  const res = await fetch('https://api.ebay.com/identity/v1/oauth2/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${auth}`,
    },
    body: 'grant_type=client_credentials&scope=https://api.ebay.com/oauth/api_scope',
  });
  const data = await res.json();
  if (!data.access_token) throw new Error('Failed to get token: ' + JSON.stringify(data));
  return data.access_token;
}

async function searchCard(token, query) {
  const encoded = encodeURIComponent(query);
  const url = `https://api.ebay.com/buy/browse/v1/item_summary/search?q=${encoded}&category_ids=213&limit=3&filter=conditionIds:{3000}`;

  const res = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'X-EBAY-C-MARKETPLACE-ID': 'EBAY_US',
      'X-EBAY-C-ENDUSERCTX': 'contextualLocation=country=US',
    },
  });

  if (!res.ok) {
    if (res.status === 429) return null;
    return null;
  }

  const data = await res.json();
  if (!data.itemSummaries?.length) return null;

  for (const item of data.itemSummaries) {
    if (item.image?.imageUrl) return item.image.imageUrl;
    if (item.thumbnailImages?.[0]?.imageUrl) return item.thumbnailImages[0].imageUrl;
  }
  return null;
}

async function downloadImage(url, filename) {
  const res = await fetch(url);
  if (!res.ok) return false;
  const buffer = Buffer.from(await res.arrayBuffer());
  writeFileSync(filename, buffer);
  return true;
}

async function main() {
  console.log('Fetching eBay OAuth token...');
  const token = await getToken();
  console.log('Token acquired.');

  const tsContent = readFileSync('data/sports-cards.ts', 'utf8');
  const cardRegex = /slug: '([^']+)'.*?name: '([^']+)'.*?sport: '([^']+)'.*?player: '([^']+)'/g;

  const cards = [];
  let match;
  while ((match = cardRegex.exec(tsContent)) !== null) {
    cards.push({ slug: match[1], name: match[2], sport: match[3], player: match[4] });
  }

  console.log(`Found ${cards.length} cards in database.`);

  let filtered = SPORT_FILTER ? cards.filter(c => c.sport === SPORT_FILTER) : cards;
  filtered = filtered.filter(c => !imageMap[c.slug]);
  filtered = filtered.slice(0, LIMIT);
  console.log(`Fetching images for ${filtered.length} cards...`);

  let success = 0, failed = 0;

  for (let i = 0; i < filtered.length; i++) {
    const card = filtered[i];
    const query = `${card.name} PSA graded`;
    process.stdout.write(`[${i + 1}/${filtered.length}] ${card.name}... `);

    const imageUrl = await searchCard(token, query);
    if (!imageUrl) {
      // Try simpler query
      const simpleUrl = await searchCard(token, card.name);
      if (!simpleUrl) { failed++; console.log('x'); continue; }
      const fn = path.join(IMAGE_DIR, `${card.slug}.jpg`);
      if (await downloadImage(simpleUrl, fn)) {
        imageMap[card.slug] = `/images/cards/${card.slug}.jpg`;
        success++;
        console.log('ok (simple)');
      } else { failed++; console.log('x'); }
    } else {
      const fn = path.join(IMAGE_DIR, `${card.slug}.jpg`);
      if (await downloadImage(imageUrl, fn)) {
        imageMap[card.slug] = `/images/cards/${card.slug}.jpg`;
        success++;
        console.log('ok');
      } else { failed++; console.log('x'); }
    }

    // Rate limit: ~5 req/sec
    if (i % 5 === 4) await new Promise(r => setTimeout(r, 1200));
  }

  writeFileSync(MAP_FILE, JSON.stringify(imageMap, null, 2));
  console.log(`\nDone. ${success} fetched, ${failed} failed. ${Object.keys(imageMap).length} total in map.`);
}

main().catch(console.error);

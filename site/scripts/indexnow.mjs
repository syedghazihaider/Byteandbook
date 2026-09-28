#!/usr/bin/env node
// IndexNow notify-on-publish: tells Bing (and other IndexNow engines)
// which URLs changed, so they re-crawl them now instead of waiting.
//
// Run AFTER a deploy has been uploaded and verified live, never as part
// of `npm run build`: the pages must already be live when the engines
// come to fetch them.
//
//   npm run indexnow                       dry run: every sitemap URL
//   npm run indexnow -- --url privacy/     dry run: only the given page(s)
//   npm run indexnow -- --submit ...       actually send
//
// --url takes a full URL (https://byteandbook.com/privacy/) or a path
// without the leading slash (privacy/, services/seo/). Git Bash rewrites
// arguments starting with "/" into Windows paths; the host check below
// rejects those rather than sending them.
//
// Prefer --url with just the pages a deploy changed; IndexNow is meant
// for added/updated/deleted URLs, not resubmitting the whole site.
//
// The key is the 32-hex-character public/<key>.txt file (content ==
// filename). Before sending, this script checks that exact file is live,
// because IndexNow rejects the request (403) if it can't verify the key.

import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const HOST = 'byteandbook.com';
const SITE = `https://${HOST}`;
const ENDPOINT = 'https://api.indexnow.org/indexnow';

const args = process.argv.slice(2);
const submit = args.includes('--submit');
const explicit = args.flatMap((a, i) => (a === '--url' && args[i + 1] ? [args[i + 1]] : []));

function fail(msg) {
  console.error(`indexnow: ${msg}`);
  process.exit(1);
}

// --- key -------------------------------------------------------------------
const keyFiles = readdirSync(join(ROOT, 'public')).filter((f) => /^[0-9a-f]{32}\.txt$/.test(f));
if (keyFiles.length !== 1) fail(`expected exactly one public/<32-hex>.txt key file, found ${keyFiles.length}`);
const key = keyFiles[0].slice(0, -4);
if (readFileSync(join(ROOT, 'public', keyFiles[0]), 'utf-8') !== key) fail(`public/${keyFiles[0]} must contain only the key`);
const keyLocation = `${SITE}/${key}.txt`;

// --- URLs ------------------------------------------------------------------
let urls;
if (explicit.length > 0) {
  urls = explicit.map((u) => new URL(u, SITE).toString());
} else {
  const sitemap = join(ROOT, 'dist', 'sitemap-0.xml');
  if (!existsSync(sitemap)) fail('dist/sitemap-0.xml not found: run `npm run build` first, or pass --url');
  urls = [...readFileSync(sitemap, 'utf-8').matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
}
const offHost = urls.filter((u) => new URL(u).host !== HOST);
if (offHost.length > 0) fail(`only ${HOST} URLs can be submitted, got: ${offHost.join(', ')}`);
if (urls.length === 0) fail('no URLs to submit');

console.log(`indexnow: ${urls.length} URL(s), key ${key}`);
for (const u of urls) console.log(`  ${u}`);

// Everything after this point uses the network, so it never calls
// process.exit(): exiting while a fetch connection is still closing
// crashes Node on Windows (libuv UV_HANDLE_CLOSING assertion). It sets
// process.exitCode and lets the process end on its own instead.
async function send() {
  // --- key must be live before submitting ----------------------------------
  let live;
  try {
    live = await fetch(keyLocation, { cache: 'no-store' });
  } catch (e) {
    return `could not fetch ${keyLocation}: ${e.message}`;
  }
  const liveText = (await live.text()).trim();
  if (!live.ok || liveText !== key) return `${keyLocation} is not serving the key (HTTP ${live.status}); deploy it first`;

  // --- submit --------------------------------------------------------------
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({ host: HOST, key, keyLocation, urlList: urls }),
  });
  await res.text();
  const meaning = {
    200: 'OK, URLs received',
    202: 'Accepted, key validation pending',
    400: 'Bad request (invalid format)',
    403: 'Forbidden: key not valid / not found at keyLocation',
    422: 'Unprocessable: URLs do not belong to the host, or key mismatch',
    429: 'Too many requests: slow down',
  };
  console.log(`indexnow: HTTP ${res.status} ${meaning[res.status] ?? ''}`.trim());
  return res.status === 200 || res.status === 202 ? null : `submission rejected (HTTP ${res.status})`;
}

if (!submit) {
  console.log('indexnow: dry run, nothing sent. Add --submit to send.');
} else {
  const error = await send();
  if (error) {
    console.error(`indexnow: ${error}`);
    process.exitCode = 1;
  }
}

// Monthly monitoring helper (docs/monitoring-cadence.md): requests every
// external link found in dist/ and reports the ones that look dead.
// Read-only and polite: one request per distinct URL, small concurrency.
// A 404/410 is a server answer; "no response" means DNS/connection failure.
// 403/429 are usually bot blocks and are reported separately, not as dead.
// Usage: npm run build && npm run check-links
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const DIST = join(dirname(fileURLToPath(import.meta.url)), '..', 'dist');
const SELF = /^https?:\/\/(www\.)?byteandbook\.com/i;
const SKIP = /(^https?:\/\/(www\.)?(facebook|instagram|linkedin|x|twitter)\.com|schema\.org|w3\.org\/2000|googletagmanager|google-analytics|wa\.me)/i;

const walk = (dir) =>
  readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? walk(p) : p.endsWith('.html') ? [p] : [];
  });

const urls = new Map(); // url -> first page seen on
for (const file of walk(DIST)) {
  const html = readFileSync(file, 'utf8');
  for (const m of html.matchAll(/href="(https?:\/\/[^"#]+)/g)) {
    const u = m[1].replace(/&amp;/g, '&');
    if (SELF.test(u) || SKIP.test(u) || urls.has(u)) continue;
    urls.set(u, file.slice(DIST.length).replace(/\\/g, '/'));
  }
}

const check = async (u) => {
  for (const method of ['HEAD', 'GET']) {
    try {
      const res = await fetch(u, {
        method,
        redirect: 'follow',
        headers: { 'user-agent': 'Mozilla/5.0 (compatible; byteandbook-link-check)' },
        signal: AbortSignal.timeout(20000),
      });
      if (method === 'HEAD' && (res.status === 405 || res.status >= 400)) continue; // retry with GET
      return res.status;
    } catch {
      if (method === 'GET') return 0;
    }
  }
  return 0;
};

const list = [...urls];
const results = [];
for (let i = 0; i < list.length; i += 6) {
  results.push(...(await Promise.all(list.slice(i, i + 6).map(async ([u, page]) => ({ u, page, status: await check(u) })))));
}

const dead = results.filter((r) => r.status === 404 || r.status === 410 || r.status === 0);
const blocked = results.filter((r) => r.status === 403 || r.status === 429);
console.log(`check-links: ${results.length} external URLs, ${dead.length} dead, ${blocked.length} blocked (403/429, verify by hand)`);
for (const r of dead) console.log(`  DEAD ${r.status || 'no response'}  ${r.u}  (on ${r.page})`);
for (const r of blocked) console.log(`  CHECK ${r.status}  ${r.u}  (on ${r.page})`);
process.exitCode = dead.length > 0 ? 1 : 0;

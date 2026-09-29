#!/usr/bin/env node
// Post-deploy live verification against https://byteandbook.com. Run
// after uploading a new release and confirming it's live, to catch what
// `npm test` (build-time, against dist/) can't: whether the server is
// actually serving what was deployed, with the right redirects, security
// headers, cache headers, and stale files removed.
//
//   npm run build && npm test          # before deploying
//   ... upload dist/ to public_html ...
//   npm run verify-live
//
// Dependency-free like qa-check.mjs: plain checks against real HTTP
// responses, using Node's built-in fetch. Prints every failure found
// rather than stopping at the first one, and exits non-zero on any
// failure.
//
// Flags:
//   --skip-files      skip the dist/-vs-live byte-identical file check
//                      (slow: fetches every file in dist/)
//   --delete-list <f>  a specific *-delete-after-deploy.txt to verify
//                      (defaults to the most recently modified one in
//                      site/, if any exists)

import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, dirname, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const DIST = join(ROOT, 'dist');
const SITE = 'https://byteandbook.com';

const args = process.argv.slice(2);
const skipFiles = args.includes('--skip-files');
const deleteListArg = (() => {
  const i = args.indexOf('--delete-list');
  return i >= 0 ? args[i + 1] : undefined;
})();

const failures = [];
const fail = (msg) => failures.push(msg);
let checks = 0;
const check = (label, condition) => {
  checks++;
  if (!condition) fail(label);
};

async function get(path, opts = {}) {
  const res = await fetch(SITE + path, { redirect: 'manual', ...opts });
  const body = opts.method === 'HEAD' ? '' : await res.text();
  return { res, body };
}
async function getBuffer(path) {
  const res = await fetch(SITE + path);
  const buf = Buffer.from(await res.arrayBuffer());
  return { res, buf };
}

// Parses every <script type="application/ld+json"> on a page and returns
// the first object of the given @type, looking inside a top-level @graph
// array too (BaseLayout.astro emits Organization/WebSite as one script
// with @graph, and FAQPage as its own separate script).
// Decodes the small set of HTML entities Astro emits when rendering
// question/answer text (it doesn't escape anything else). The FAQPage
// JSON-LD carries the raw string; the visible <summary>/<p> markup has it
// HTML-escaped, so comparing them requires decoding one side first.
function decodeEntities(s) {
  return s
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

function findLdType(html, type) {
  const scripts = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => m[1]);
  for (const s of scripts) {
    let parsed;
    try {
      parsed = JSON.parse(s);
    } catch {
      continue;
    }
    const docs = Array.isArray(parsed) ? parsed : [parsed];
    for (const doc of docs) {
      const list = Array.isArray(doc?.['@graph']) ? doc['@graph'] : [doc];
      const found = list.find((o) => o?.['@type'] === type);
      if (found) return found;
    }
  }
  return null;
}

console.log(`verify-live: checking ${SITE} ...`);

// ---- 1. Redirects -------------------------------------------------------
{
  const wwwRes = await fetch('https://www.byteandbook.com/some/path/?q=1', { redirect: 'manual' }).catch((e) => e);
  if (wwwRes instanceof Error) {
    fail(`www -> apex redirect: request failed (${wwwRes.message})`);
    checks++;
  } else {
    check('www -> apex redirect: 301', wwwRes.status === 301);
    check(
      'www -> apex redirect: preserves path + query',
      (wwwRes.headers.get('location') || '') === `${SITE}/some/path/?q=1`
    );
  }

  const idx = await fetch(`${SITE}/about/index.html`, { redirect: 'manual' });
  check('/about/index.html -> /about/: 301', idx.status === 301);
  check('/about/index.html -> /about/: correct target', (idx.headers.get('location') || '') === `${SITE}/about/`);

  const rootIdx = await fetch(`${SITE}/index.html`, { redirect: 'manual' });
  check('/index.html -> /: 301', rootIdx.status === 301);
  check('/index.html -> /: correct target', (rootIdx.headers.get('location') || '') === `${SITE}/`);
}

// ---- 2. 404 handling ------------------------------------------------------
{
  const { res } = await get('/this-path-should-never-exist-verify-live/');
  check('unknown path returns 404', res.status === 404);
  const { body } = await get('/this-path-should-never-exist-verify-live/');
  check('404 page is the custom 404, not a server default', /404/i.test(body) && body.length > 200);
}

// ---- 3. Security ----------------------------------------------------------
{
  const errLog = await fetch(`${SITE}/api/error_log`);
  check('api/error_log is not publicly served', errLog.status === 403 || errLog.status === 404);

  for (const dir of ['/api/', '/_astro/']) {
    const { res, body } = await get(dir);
    const looksLikeListing = res.status === 200 && /Index of/i.test(body);
    check(`no directory listing on ${dir}`, !looksLikeListing);
  }
}

// ---- 4. Cache headers -------------------------------------------------------
{
  const { res: htmlRes } = await get('/');
  check('HTML: Cache-Control no-cache', (htmlRes.headers.get('cache-control') || '') === 'no-cache');

  const { body: homeHtml } = await get('/');
  const hashedCss = homeHtml.match(/\/styles\.[a-f0-9]{10}\.css/) || homeHtml.match(/\/_astro\/[^"'\s]+\.[A-Za-z0-9_-]{8}\.css/);
  if (hashedCss) {
    const { res } = await get(hashedCss[0]);
    check(
      `hashed CSS (${hashedCss[0]}): 1-year immutable cache`,
      (res.headers.get('cache-control') || '').includes('max-age=31536000')
    );
  } else {
    fail('could not find a hashed CSS asset on / to check its cache header');
    checks++;
  }

  const { res: robotsRes } = await get('/robots.txt');
  check(
    'unhashed static (/robots.txt): 1-week cache',
    (robotsRes.headers.get('cache-control') || '').includes('max-age=604800')
  );
}

// ---- 5. IndexNow key file --------------------------------------------------
{
  const keyFiles = readdirSync(join(ROOT, 'public')).filter((f) => /^[a-f0-9]{32}\.txt$/.test(f));
  if (keyFiles.length !== 1) {
    fail(`expected exactly one IndexNow key file in public/, found ${keyFiles.length}`);
    checks++;
  } else {
    const key = keyFiles[0];
    const localKey = readFileSync(join(ROOT, 'public', key), 'utf-8').trim();
    const { res, body } = await get(`/${key}`);
    check(`IndexNow key file (${key}) is live`, res.status === 200);
    check('IndexNow key file content matches local', body.trim() === localKey);
  }
}

// ---- 6. Organization schema: NY/US only, no street address ----------------
{
  const { body } = await get('/');
  const org = findLdType(body, 'Organization');
  if (!org) {
    fail('Organization JSON-LD not found on /');
    checks++;
  } else {
    const addr = org.address;
    check('Organization schema has an address', !!addr);
    if (addr) {
      check('Organization address: addressRegion is NY', addr.addressRegion === 'NY');
      check('Organization address: addressCountry is US', addr.addressCountry === 'US');
      check('Organization address: no streetAddress', !addr.streetAddress);
      check('Organization address: no postalCode', !addr.postalCode);
    }
  }
}

// ---- 7. FAQs: 14 pages, schema matches visible copy exactly ---------------
{
  // Keys of src/data/serviceFaqs.ts — the 3 category pages plus 11
  // individual services, each rendered at /services/<slug>/. Kept as an
  // explicit list (rather than parsed from the .ts file) so this script
  // stays dependency-free; cross-checked against the source file below.
  const FAQ_SLUGS = [
    'web-brand-publishing', 'web-development', 'software-development', 'branding', 'ebook-publishing',
    'infrastructure-automation', 'devops', 'cloud', 'computer-hardware',
    'growth-ai-discovery', 'digital-marketing', 'social-media-marketing', 'geo', 'seo',
  ];

  const srcKeys = [...readFileSync(join(ROOT, 'src', 'data', 'serviceFaqs.ts'), 'utf-8')
    .matchAll(/^\s*(?:'([a-z-]+)'|([a-z-]+)):\s*\[/gm)]
    .map((m) => m[1] || m[2]);
  check(
    'FAQ_SLUGS list matches src/data/serviceFaqs.ts keys',
    srcKeys.length === FAQ_SLUGS.length && srcKeys.every((k) => FAQ_SLUGS.includes(k))
  );

  let totalAnswers = 0;
  for (const slug of FAQ_SLUGS) {
    const { res, body } = await get(`/services/${slug}/`);
    if (res.status !== 200) {
      fail(`/services/${slug}/: expected 200, got ${res.status}`);
      checks++;
      continue;
    }

    const faqPage = findLdType(body, 'FAQPage');
    check(`/services/${slug}/: has FAQPage schema`, !!faqPage);
    if (!faqPage) continue;

    const schemaQAs = faqPage.mainEntity.map((q) => ({
      question: q.name,
      answer: q.acceptedAnswer.text,
    }));
    totalAnswers += schemaQAs.length;

    // Visible copy: <summary>question...<svg.../></summary><p ...>answer</p>
    const visible = [...body.matchAll(
      /<summary[^>]*>([\s\S]*?)<svg[\s\S]*?<\/svg>\s*<\/summary>\s*<p[^>]*>([\s\S]*?)<\/p>/g
    )].map((m) => ({
      question: decodeEntities(m[1].replace(/<[^>]+>/g, '')).trim(),
      answer: decodeEntities(m[2].replace(/<[^>]+>/g, '')).trim(),
    }));

    check(`/services/${slug}/: visible FAQ count matches schema count`, visible.length === schemaQAs.length);
    const n = Math.min(visible.length, schemaQAs.length);
    for (let i = 0; i < n; i++) {
      check(
        `/services/${slug}/: FAQ #${i + 1} question, schema === visible`,
        schemaQAs[i].question.trim() === visible[i].question
      );
      check(
        `/services/${slug}/: FAQ #${i + 1} answer, schema === visible`,
        schemaQAs[i].answer.trim() === visible[i].answer
      );
    }
  }
  check(`FAQ pages: 14 pages carry FAQs`, FAQ_SLUGS.length === 14);
  check(`FAQ answers: 52 total across all FAQ pages`, totalAnswers === 52);
}

// ---- 8. Deleted-after-deploy files are actually gone -----------------------
{
  let listPath = deleteListArg ? join(ROOT, deleteListArg) : null;
  if (!listPath) {
    const candidates = readdirSync(ROOT)
      .filter((f) => f.endsWith('-delete-after-deploy.txt'))
      .map((f) => ({ f, mtime: statSync(join(ROOT, f)).mtimeMs }))
      .sort((a, b) => b.mtime - a.mtime);
    if (candidates.length) listPath = join(ROOT, candidates[0].f);
  }
  if (!listPath || !existsSync(listPath)) {
    console.log('  (no *-delete-after-deploy.txt found — skipping stale-file check)');
  } else {
    const lines = readFileSync(listPath, 'utf-8')
      .split(/\r?\n/)
      .filter((l) => l && !l.startsWith('#'))
      .map((l) => l.replace(/^public_html\//, ''));
    for (const rel of lines) {
      const { res } = await get(`/${rel}`);
      check(`stale file gone: /${rel}`, res.status === 404);
    }
  }
}

// ---- 9. dist/ byte-identical with live -------------------------------------
if (skipFiles) {
  console.log('  (--skip-files: skipping dist/-vs-live byte comparison)');
} else if (!existsSync(join(DIST, 'index.html'))) {
  console.log('  (dist/ not found — run `npm run build` first to enable the byte-identical check)');
} else {
  const files = [];
  (function walk(dir) {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      const p = join(dir, e.name);
      if (e.isDirectory()) walk(p);
      else files.push(relative(DIST, p).split(sep).join('/'));
    }
  })(DIST);
  files.sort();

  let mismatched = 0;
  // Not raw-fetchable, by design: .htaccess is server config (LiteSpeed
  // returns 403 for it), and the PHP endpoints execute rather than serve
  // their source (a plain GET gets 405, not the file). Checked for
  // existence/behavior elsewhere (security section, manual testing) —
  // skip them here instead of treating "not served as static text" as a
  // deploy mismatch.
  const NOT_RAW_COMPARABLE = [/^\.htaccess$/, /^api\/.*\.php$/];
  let skipped = 0;
  for (const rel of files) {
    if (NOT_RAW_COMPARABLE.some((re) => re.test(rel))) {
      skipped++;
      continue;
    }
    const local = readFileSync(join(DIST, ...rel.split('/')));
    const { res, buf } = await getBuffer(`/${rel}`);
    checks++;
    if (res.status !== 200 || !local.equals(buf)) {
      mismatched++;
      fail(`file not byte-identical live: /${rel} (status ${res.status})`);
    }
  }
  console.log(
    `  dist/ vs live: ${files.length} files, ${files.length - skipped - mismatched} byte-identical`
      + (skipped ? `, ${skipped} skipped (not raw-fetchable)` : '')
  );
}

// ---- Report -----------------------------------------------------------------
console.log('');
if (failures.length) {
  console.log(`verify-live: ${failures.length}/${checks} checks FAILED\n`);
  for (const f of failures) console.log(`  ✗ ${f}`);
  process.exitCode = 1;
} else {
  console.log(`verify-live: all ${checks} checks passed ✓`);
}

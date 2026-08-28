#!/usr/bin/env node
// Phase 12 — lightweight, dependency-free QA check against the built
// `dist/` output. No test framework: plain regex/string checks against
// real HTML, run via `npm test`. Fails (non-zero exit) on any check
// that doesn't hold, printing every failure found rather than stopping
// at the first one.

import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST = join(__dirname, '..', 'dist');

const failures = [];
const fail = (msg) => failures.push(msg);
let checks = 0;
const check = (label, condition) => {
  checks++;
  if (!condition) fail(label);
};

if (!existsSync(DIST)) {
  console.error('dist/ does not exist — run `npm run build` first.');
  process.exit(1);
}

// ---- 1. Expected routes ----------------------------------------------
const SERVICE_SLUGS = [
  'digital-marketing', 'seo', 'geo', 'social-media-marketing',
  'web-development', 'software-development', 'devops', 'cloud',
  'computer-hardware', 'branding', 'ebook-publishing',
];

const indexablePages = {
  '/': 'index.html',
  '/about/': 'about/index.html',
  '/contact/': 'contact/index.html',
  '/services/': 'services/index.html',
  '/process/': 'process/index.html',
  ...Object.fromEntries(SERVICE_SLUGS.map((s) => [`/services/${s}/`, `services/${s}/index.html`])),
};
// V2-1: standalone route architecture for pages whose full content is
// scoped to later phases (V2-4/V2-5/V2-7) — present, linked, and built,
// but not yet indexed until real content/functionality lands.
const nonIndexablePages = {
  '/404.html': '404.html',
  '/style-guide/': 'style-guide/index.html',
  '/checkout/': 'checkout/index.html',
  '/terms/': 'terms/index.html',
  '/privacy/': 'privacy/index.html',
  '/refund-policy/': 'refund-policy/index.html',
  '/work/': 'work/index.html',
  '/insights/': 'insights/index.html',
};
const allPages = { ...indexablePages, ...nonIndexablePages };

for (const [route, relPath] of Object.entries(allPages)) {
  check(`route exists: ${route} -> dist/${relPath}`, existsSync(join(DIST, relPath)));
}
check('exactly 24 known routes defined in this check', Object.keys(allPages).length === 24);

// ---- 2. Core static assets --------------------------------------------
check('styles.css exists', existsSync(join(DIST, 'styles.css')));
check('styles.css is non-empty', existsSync(join(DIST, 'styles.css')) && statSync(join(DIST, 'styles.css')).size > 1000);
check('robots.txt exists', existsSync(join(DIST, 'robots.txt')));
check('sitemap-index.xml exists', existsSync(join(DIST, 'sitemap-index.xml')));
const sitemapFiles = existsSync(DIST) ? readdirSync(DIST).filter((f) => /^sitemap-\d+\.xml$/.test(f)) : [];
check('at least one sitemap-N.xml exists', sitemapFiles.length > 0);

// ---- helpers ------------------------------------------------------------
const readHtml = (relPath) => readFileSync(join(DIST, relPath), 'utf-8');
const jsonLdBlocks = (html) => [...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)].map((m) => m[1]);

function resolveHref(href, fromRoute) {
  if (/^(https?:|mailto:|tel:)/i.test(href)) return 'external';
  if (href.startsWith('#')) return 'anchor';
  let path = href.split('#')[0].split('?')[0];
  if (path === '') return 'self';
  if (!path.startsWith('/')) return 'relative-unexpected';
  if (path === '/') return existsSync(join(DIST, 'index.html')) ? 'ok' : 'missing';
  if (path === '/404.html') return existsSync(join(DIST, '404.html')) ? 'ok' : 'missing';
  if (path.endsWith('.css') || path.endsWith('.js') || path.endsWith('.txt') || path.endsWith('.xml')) {
    return existsSync(join(DIST, path.slice(1))) ? 'ok' : 'missing';
  }
  const asDir = path.endsWith('/') ? path : path + '/';
  return existsSync(join(DIST, asDir.slice(1), 'index.html')) ? 'ok' : 'missing';
}

// ---- 3. Internal link + SEO + a11y checks, per page ----------------------
const titles = new Map();
const descriptions = new Map();

for (const [route, relPath] of Object.entries(allPages)) {
  if (!existsSync(join(DIST, relPath))) continue;
  const html = readHtml(relPath);
  const isIndexable = route in indexablePages;

  // --- internal links ---
  const hrefs = [...html.matchAll(/href="([^"]+)"/g)].map((m) => m[1]);
  for (const href of hrefs) {
    const result = resolveHref(href, route);
    if (result === 'missing') fail(`${route}: broken internal link href="${href}"`);
    if (result === 'relative-unexpected') fail(`${route}: unexpected relative href="${href}" (should be absolute path)`);
  }

  // --- SEO metadata (Phase 9) ---
  const canonical = html.match(/<link rel="canonical" href="([^"]+)"/);
  check(`${route}: canonical present`, !!canonical);
  if (canonical) check(`${route}: canonical is absolute https://byteandbook.com`, canonical[1].startsWith('https://byteandbook.com'));

  const title = html.match(/<title>([^<]*)<\/title>/);
  check(`${route}: <title> present`, !!title);
  if (title) titles.set(route, title[1]);

  const desc = html.match(/<meta name="description" content="([^"]*)"/);
  check(`${route}: meta description present`, !!desc);
  if (desc) descriptions.set(route, desc[1]);

  check(`${route}: og:title present`, /<meta property="og:title"/.test(html));
  check(`${route}: og:url present`, /<meta property="og:url"/.test(html));
  check(`${route}: twitter:card present`, /<meta name="twitter:card"/.test(html));

  const robotsMeta = html.match(/<meta name="robots" content="([^"]+)"/);
  check(`${route}: robots meta present`, !!robotsMeta);
  if (robotsMeta) {
    if (isIndexable) check(`${route}: robots = index,follow`, robotsMeta[1] === 'index, follow');
    else check(`${route}: robots = noindex,nofollow`, robotsMeta[1] === 'noindex, nofollow');
  }

  // JSON-LD validity + expected schema types
  const blocks = jsonLdBlocks(html);
  check(`${route}: has at least one JSON-LD block`, blocks.length > 0);
  const parsed = [];
  blocks.forEach((b, i) => {
    try { parsed.push(JSON.parse(b)); }
    catch (e) { fail(`${route}: JSON-LD block #${i} failed to parse (${e.message})`); }
  });
  const types = new Set();
  for (const p of parsed) {
    if (Array.isArray(p['@graph'])) p['@graph'].forEach((n) => types.add(n['@type']));
    else if (p['@type']) types.add(p['@type']);
  }
  check(`${route}: Organization schema present`, types.has('Organization'));
  check(`${route}: WebSite schema present`, types.has('WebSite'));
  if (route.startsWith('/services/') && route !== '/services/') {
    check(`${route}: Service schema present`, types.has('Service'));
    check(`${route}: BreadcrumbList schema present`, types.has('BreadcrumbList'));
  }
  if (route === '/services/' || route === '/process/') {
    check(`${route}: BreadcrumbList schema present`, types.has('BreadcrumbList'));
  }
  if (route === '/') {
    check(`${route}: FAQPage schema present`, types.has('FAQPage'));
  }

  // --- accessibility (Phase 10) ---
  check(`${route}: skip-link present`, /class="skip-link"/.test(html));
  check(`${route}: main-content target with tabindex="-1"`, /id="main-content"\s+tabindex="-1"/.test(html));
  const h1Count = (html.match(/<h1[\s>]/g) || []).length;
  check(`${route}: exactly one <h1>`, h1Count === 1);
}

// robots.txt / sitemap content checks
const robotsTxt = readFileSync(join(DIST, 'robots.txt'), 'utf-8');
check('robots.txt references sitemap-index.xml', robotsTxt.includes('https://byteandbook.com/sitemap-index.xml'));
check('robots.txt disallows /style-guide/', robotsTxt.includes('Disallow: /style-guide/'));
check('robots.txt disallows /404.html', robotsTxt.includes('Disallow: /404.html'));
for (const route of Object.keys(nonIndexablePages).filter((r) => r.endsWith('/'))) {
  check(`robots.txt disallows ${route}`, robotsTxt.includes(`Disallow: ${route}`));
}

for (const f of sitemapFiles) {
  const xml = readFileSync(join(DIST, f), 'utf-8');
  check(`${f}: does not list /style-guide/`, !xml.includes('/style-guide/'));
  check(`${f}: does not list /404.html`, !xml.includes('/404.html'));
  for (const route of Object.keys(nonIndexablePages).filter((r) => r.endsWith('/'))) {
    check(`${f}: does not list ${route}`, !xml.includes(`>https://byteandbook.com${route}<`));
  }
}
const sitemapUrlCount = sitemapFiles.reduce(
  (n, f) => n + (readFileSync(join(DIST, f), 'utf-8').match(/<loc>/g) || []).length,
  0
);
check('sitemap contains exactly 16 indexable URLs', sitemapUrlCount === 16);

// duplicate title/description check across all pages
const titleValues = [...titles.values()];
const descValues = [...descriptions.values()];
check('no duplicate <title> across pages', new Set(titleValues).size === titleValues.length);
check('no duplicate meta description across pages', new Set(descValues).size === descValues.length);

// ---- 4. V2-2: Start Project modal + legacy-content guard ------------------
// The modal is rendered once in BaseLayout, so it (and its form fields)
// appear in every page's static HTML — checked here against the
// homepage as a representative page rather than repeating per route.
const homeHtml = readHtml('index.html');

check('start-project-modal: <dialog> present', /<dialog id="start-project-dialog"/.test(homeHtml));
check('start-project-modal: aria-labelledby present', /aria-labelledby="sp-title"/.test(homeHtml));
check('start-project-modal: aria-describedby present', /aria-describedby="sp-desc"/.test(homeHtml));

// Required-field attributes (QA items 12-16 of the V2-2 brief)
check('start-project-modal: fullName required', /name="fullName"[^>]*required/.test(homeHtml));
const emailTag = /<input[^>]*name="email"[^>]*>/.exec(homeHtml)?.[0] ?? '';
check('start-project-modal: email required', emailTag.includes('required'));
check('start-project-modal: email type=email', emailTag.includes('type="email"'));

const mobileTag = /<input[^>]*name="mobile"[^>]*>/.exec(homeHtml)?.[0] ?? '';
check('start-project-modal: mobile required', mobileTag.includes('required'));
check('start-project-modal: description required', /<textarea[^>]*name="description"[^>]*>/.test(homeHtml) && (/<textarea[^>]*name="description"[^>]*>/.exec(homeHtml)?.[0] ?? '').includes('required'));
check('start-project-modal: termsAccepted checkbox required', (/<input[^>]*name="termsAccepted"[^>]*>/.exec(homeHtml)?.[0] ?? '').includes('required'));
check('start-project-modal: privacyAcknowledged checkbox required', (/<input[^>]*name="privacyAcknowledged"[^>]*>/.exec(homeHtml)?.[0] ?? '').includes('required'));
check('start-project-modal: terms checkbox unchecked by default', !(/<input[^>]*name="termsAccepted"[^>]*>/.exec(homeHtml)?.[0] ?? '').includes('checked'));
check('start-project-modal: privacy checkbox unchecked by default', !(/<input[^>]*name="privacyAcknowledged"[^>]*>/.exec(homeHtml)?.[0] ?? '').includes('checked'));

// Other-service support
check('start-project-modal: "Other" service checkbox present', /name="services" value="other"/.test(homeHtml));
check('start-project-modal: other-service specify field present', /name="otherService"/.test(homeHtml));

// Service checklist sourced from the content collection (all 11 slugs)
for (const slug of SERVICE_SLUGS) {
  check(`start-project-modal: service checkbox for ${slug}`, homeHtml.includes(`name="services" value="${slug}"`));
}

// Terms/Privacy/Refund links inside the modal resolve to the standalone
// legal pages (also covered generically by the internal-link check
// above, asserted explicitly here per the V2-2 QA checklist).
check('start-project-modal: links to /terms/', /href="\/terms\/"/.test(homeHtml));
check('start-project-modal: links to /privacy/', /href="\/privacy\/"/.test(homeHtml));
check('start-project-modal: links to /refund-policy/', /href="\/refund-policy\/"/.test(homeHtml));

// Start Project trigger presence on the pages named in the V2-2 brief
const triggerPages = {
  '/ (homepage)': 'index.html',
  '/services/': 'services/index.html',
  '/services/devops/ (individual service page)': 'services/devops/index.html',
  '/process/': 'process/index.html',
  '/about/': 'about/index.html',
  '/contact/': 'contact/index.html',
};
for (const [label, relPath] of Object.entries(triggerPages)) {
  const html = readHtml(relPath);
  check(`${label}: Start Project trigger present`, /data-start-project-trigger/.test(html));
}

// Individual-service preselection wiring
const devopsHtml = readHtml('services/devops/index.html');
check('services/devops/: preselects "devops"', /data-preselect-service="devops"/.test(devopsHtml));

// Legacy/forbidden contact info must not appear anywhere in the built
// output (V2-2 brief: strict across all files changed this phase).
const FORBIDDEN_STRINGS = [
  'andbookbyte@gmail.com',
  '346-908-1336',
  '347-847-1904',
  '347)847-1904',
  '7234 fairchild',
  'Alexandria, Virginia',
];
const allDistHtmlFiles = [...Object.values(allPages)];
for (const relPath of allDistHtmlFiles) {
  if (!existsSync(join(DIST, relPath))) continue;
  const html = readHtml(relPath);
  for (const forbidden of FORBIDDEN_STRINGS) {
    check(`${relPath}: does not contain forbidden legacy text "${forbidden}"`, !html.includes(forbidden));
  }
  // No public phone number: no tel: links anywhere on the live site.
  check(`${relPath}: no tel: link`, !/href="tel:/.test(html));
}

// ---- Report ---------------------------------------------------------------
console.log(`QA check: ${checks} assertions, ${failures.length} failure(s).`);
if (failures.length > 0) {
  console.log('\nFailures:');
  for (const f of failures) console.log(`  - ${f}`);
  process.exit(1);
} else {
  console.log('All checks passed.');
}

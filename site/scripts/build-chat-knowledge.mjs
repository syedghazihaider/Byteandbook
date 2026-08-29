#!/usr/bin/env node
// V2.1 — chatbot knowledge pipeline.
//
// Runs after `astro build` (package.json's "build" script) and produces
// dist/api/chatbot-knowledge.json: a compact, structured index of
// ByteAndBook's real published content, read server-side by
// public/api/chat.php to ground the AI assistant's answers.
//
// Two sources, both mechanically derived (never hand-duplicated prose):
//   1. Services — parsed directly from src/content/services/*.md
//      (frontmatter + body), the same single source of truth the
//      /services/ pages and Start Project modal already use.
//   2. Everything else (process, about, work, insights, contact,
//      checkout, terms, privacy, refund-policy, homepage) — scraped from
//      the already-built dist/**/index.html output: <main> content is
//      split into chunks at heading boundaries, and the homepage's
//      FAQPage JSON-LD is read directly for clean Q&A pairs.
//
// Nothing here talks to an AI provider — this is pure static extraction,
// re-run on every build so the knowledge base can never drift from the
// real site content (CLAUDE.md's "no fabricated/duplicated knowledge
// base" rule).

import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const DIST = join(ROOT, 'dist');
const SERVICES_DIR = join(ROOT, 'src', 'content', 'services');
const OUT_DIR = join(DIST, 'api');
const OUT_PATH = join(OUT_DIR, 'chatbot-knowledge.json');

if (!existsSync(DIST)) {
  console.error('build-chat-knowledge: dist/ not found — run `astro build` first.');
  process.exit(1);
}

// ---------------------------------------------------------------------
// Small text helpers
// ---------------------------------------------------------------------

const STOPWORDS = new Set([
  'the', 'and', 'for', 'that', 'this', 'with', 'from', 'your', 'you', 'are',
  'was', 'were', 'have', 'has', 'had', 'not', 'but', 'what', 'when', 'where',
  'which', 'who', 'how', 'why', 'can', 'will', 'would', 'could', 'should',
  'about', 'into', 'than', 'then', 'them', 'they', 'their', 'our', 'ours',
  'its', 'it', 'a', 'an', 'is', 'be', 'as', 'to', 'of', 'in', 'on', 'or',
  'by', 'we', 'us', 'do', 'does', 'did', 'so', 'if', 'all', 'any', 'each',
]);

function decodeEntities(str) {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&rsquo;/g, '’')
    .replace(/&lsquo;/g, '‘')
    .replace(/&rdquo;/g, '”')
    .replace(/&ldquo;/g, '“')
    .replace(/&mdash;/g, '—')
    .replace(/&ndash;/g, '–')
    .replace(/&nbsp;/g, ' ');
}

function stripTags(html) {
  return decodeEntities(html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim());
}

function cleanTrailingArtifacts(text) {
  // Heading-boundary slicing occasionally captures the next item's
  // leading step-number label (e.g. an ordered-list "02" marker) as a
  // trailing token — strip a lone 1-2 digit trailer rather than leaving
  // it dangling on the chunk.
  return text.replace(/\s\d{1,2}$/, '');
}

function truncate(text, maxChars) {
  if (text.length <= maxChars) return text;
  const slice = text.slice(0, maxChars);
  const lastStop = Math.max(slice.lastIndexOf('. '), slice.lastIndexOf('? '), slice.lastIndexOf('! '));
  return (lastStop > maxChars * 0.5 ? slice.slice(0, lastStop + 1) : slice).trim() + '…';
}

function keywordsFor(...texts) {
  const words = texts
    .join(' ')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOPWORDS.has(w));
  return [...new Set(words)].slice(0, 15);
}

let chunkCounter = 0;
function makeChunk(category, heading, text) {
  const clean = cleanTrailingArtifacts(truncate(text, 700));
  if (clean.length < 20) return null;
  return {
    id: `${category}#${chunkCounter++}`,
    category,
    heading,
    keywords: keywordsFor(heading, clean),
    text: clean,
  };
}

// ---------------------------------------------------------------------
// 1. Services — parsed from src/content/services/*.md frontmatter+body.
//    Small hand-rolled parser: the frontmatter here is a controlled,
//    regular subset (scalars + single-line ['a', 'b'] arrays), so a full
//    YAML dependency isn't warranted — matches this repo's existing
//    "no unnecessary dependency" convention (see hash-css.mjs, qa-check.mjs).
// ---------------------------------------------------------------------

function parseFrontmatter(raw) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) return { data: {}, body: raw };
  const [, fmBlock, body] = match;
  const data = {};
  for (const line of fmBlock.split(/\r?\n/)) {
    const m = line.match(/^([a-zA-Z]+):\s*(.*)$/);
    if (!m) continue;
    const [, key, rawValue] = m;
    const value = rawValue.trim();
    if (value.startsWith('[')) {
      data[key] = [...value.matchAll(/'([^']*)'|"([^"]*)"/g)].map((m2) => m2[1] ?? m2[2]);
    } else {
      data[key] = value.replace(/^'(.*)'$/, '$1').replace(/^"(.*)"$/, '$1');
    }
  }
  return { data, body: body.trim() };
}

// Curated synonym list, small and colocated with the one script that
// owns knowledge generation — not a duplicate content base, just the
// alias vocabulary CLAUDE.md's service-recommendation examples rely on
// (e.g. "rank on Google" -> seo, "messy deployment" -> devops/cloud).
const SERVICE_ALIASES = {
  'digital-marketing': ['marketing', 'ads', 'advertising', 'campaigns', 'ppc'],
  seo: ['rank on google', 'search ranking', 'organic traffic', 'search engine optimization'],
  geo: ['ai search', 'chatgpt', 'generative engine optimization', 'ai recommendations', 'llm visibility'],
  'social-media-marketing': ['social media', 'instagram', 'tiktok', 'social ads', 'content distribution'],
  'web-development': ['website', 'web app', 'web design', 'web dev', 'landing page'],
  'software-development': ['software', 'app development', 'custom software', 'saas', 'application'],
  devops: ['ci/cd', 'deployment', 'kubernetes', 'docker', 'infrastructure automation'],
  cloud: ['cloud hosting', 'aws', 'server', 'cloud migration', 'scaling'],
  'computer-hardware': ['hardware', 'workstation', 'pc build', 'server hardware'],
  branding: ['logo', 'brand identity', 'brand design', 'visual identity'],
  'ebook-publishing': ['ebook', 'book publishing', 'digital publishing', 'manuscript'],
};

const services = readdirSync(SERVICES_DIR)
  .filter((f) => f.endsWith('.md'))
  .map((file) => {
    const slug = file.replace(/\.md$/, '');
    const raw = readFileSync(join(SERVICES_DIR, file), 'utf-8');
    const { data, body } = parseFrontmatter(raw);
    const bodyText = stripTags(body.replace(/[#*_`]/g, ''));
    const chunk = makeChunk(`service:${slug}`, data.title, `${data.summary} ${bodyText}`.trim());
    return {
      service: {
        slug,
        title: data.title,
        pillar: data.pillar,
        summary: data.summary,
        capabilities: data.capabilities ?? [],
        aliases: SERVICE_ALIASES[slug] ?? [],
      },
      chunk,
    };
  });

const serviceEntries = services.map((s) => s.service).sort((a, b) => a.slug.localeCompare(b.slug));
const serviceChunks = services.map((s) => s.chunk).filter(Boolean);

// ---------------------------------------------------------------------
// 2. Non-service pages — scraped from built dist HTML.
// ---------------------------------------------------------------------

const SCRAPE_PAGES = [
  { route: '/', relPath: 'index.html', category: 'home' },
  { route: '/process/', relPath: 'process/index.html', category: 'process' },
  { route: '/about/', relPath: 'about/index.html', category: 'about' },
  { route: '/work/', relPath: 'work/index.html', category: 'work' },
  { route: '/insights/', relPath: 'insights/index.html', category: 'insights' },
  { route: '/contact/', relPath: 'contact/index.html', category: 'contact' },
  { route: '/checkout/', relPath: 'checkout/index.html', category: 'checkout' },
  { route: '/terms/', relPath: 'terms/index.html', category: 'terms' },
  { route: '/privacy/', relPath: 'privacy/index.html', category: 'privacy' },
  { route: '/refund-policy/', relPath: 'refund-policy/index.html', category: 'refund-policy' },
  { route: '/services/', relPath: 'services/index.html', category: 'services-overview' },
];

function extractMain(html) {
  const match = html.match(/<main[^>]*>([\s\S]*?)<\/main>/);
  if (!match) return '';
  // Drop breadcrumb nav (low-value "Home / X" links) and decorative
  // script/style blocks before heading-splitting.
  return match[1]
    .replace(/<nav[^>]*aria-label="Breadcrumb"[\s\S]*?<\/nav>/g, '')
    .replace(/<script[\s\S]*?<\/script>/g, '')
    .replace(/<style[\s\S]*?<\/style>/g, '');
}

function chunkByHeadings(mainHtml, category) {
  const headingRe = /<h[12][^>]*>([\s\S]*?)<\/h[12]>/g;
  const headings = [...mainHtml.matchAll(headingRe)];
  if (headings.length === 0) {
    const text = stripTags(mainHtml);
    const chunk = makeChunk(category, category, text);
    return chunk ? [chunk] : [];
  }
  const chunks = [];
  headings.forEach((h, i) => {
    const headingText = stripTags(h[1]);
    const start = h.index + h[0].length;
    const end = i + 1 < headings.length ? headings[i + 1].index : mainHtml.length;
    const bodyText = stripTags(mainHtml.slice(start, end));
    const chunk = makeChunk(category, headingText || category, bodyText || headingText);
    if (chunk) chunks.push(chunk);
  });
  return chunks;
}

function extractFaqChunks(html) {
  const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
  const chunks = [];
  for (const b of blocks) {
    let parsed;
    try {
      parsed = JSON.parse(b[1]);
    } catch {
      continue;
    }
    if (parsed['@type'] !== 'FAQPage' || !Array.isArray(parsed.mainEntity)) continue;
    for (const q of parsed.mainEntity) {
      const question = q.name;
      const answer = q.acceptedAnswer?.text;
      if (!question || !answer) continue;
      const chunk = makeChunk('faq', question, answer);
      if (chunk) chunks.push(chunk);
    }
  }
  return chunks;
}

const scrapedChunks = [];
for (const page of SCRAPE_PAGES) {
  const filePath = join(DIST, page.relPath);
  if (!existsSync(filePath)) {
    console.warn(`build-chat-knowledge: skipping missing ${page.relPath}`);
    continue;
  }
  const html = readFileSync(filePath, 'utf-8');
  scrapedChunks.push(...extractFaqChunks(html));
  const mainHtml = extractMain(html);
  if (mainHtml) scrapedChunks.push(...chunkByHeadings(mainHtml, page.category));
}

// ---------------------------------------------------------------------
// Write output
// ---------------------------------------------------------------------

const allChunks = [...serviceChunks, ...scrapedChunks];

const output = {
  generatedAt: new Date().toISOString(),
  email: 'info@byteandbook.com',
  services: serviceEntries,
  chunks: allChunks,
};

mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(OUT_PATH, JSON.stringify(output));

console.log(
  `build-chat-knowledge: ${serviceEntries.length} services, ${allChunks.length} chunks -> dist/api/chatbot-knowledge.json (${JSON.stringify(output).length.toLocaleString()} bytes)`
);

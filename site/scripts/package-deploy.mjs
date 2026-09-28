#!/usr/bin/env node
// Packages site/dist/ into a deploy zip for the manual cPanel upload, and
// writes the "delete after this deploy" list: files the currently-live
// release shipped that this build no longer contains. Extracting a zip
// over public_html never removes old files, so without this list stale
// content-hashed chunks pile up on the server with every deploy.
//
//   npm run build && npm test
//   npm run package -- --name seo-phase4 --previous seo-privacy-meta-deploy.zip
//
// --name      output name: writes <name>-deploy.zip and
//             <name>-delete-after-deploy.txt in site/
// --previous  the deploy zip that is LIVE right now (the rollback copy).
//             Required: the delete list is only correct against the
//             release actually on the server.
//
// After uploading and verifying the new zip, move the listed files to the
// cPanel trash. The list never contains anything under .well-known/ (SSL
// validation) or api/error_log, even if an old zip had them.
//
// Uses Windows' built-in bsdtar (C:\Windows\System32\tar.exe) to read and
// write zips: no npm dependency. Zip entries use forward slashes.

import { execFileSync } from 'node:child_process';
import { readdirSync, readFileSync, writeFileSync, existsSync, statSync, unlinkSync, mkdtempSync, rmSync } from 'node:fs';
import { join, dirname, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = join(ROOT, 'dist');
const TAR = process.env.SystemRoot ? join(process.env.SystemRoot, 'System32', 'tar.exe') : 'tar';
const SITE = 'https://byteandbook.com';
const PROTECTED = [/^\.well-known\//, /^api\/error_log$/];

const args = process.argv.slice(2);
const opt = (name) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : undefined;
};
function fail(msg) {
  console.error(`package: ${msg}`);
  process.exit(1);
}

const name = opt('name');
const previous = opt('previous');
if (!name || !/^[a-z0-9][a-z0-9-]*$/.test(name)) fail('--name is required (lowercase letters, digits, dashes)');
const zips = readdirSync(ROOT).filter((f) => f.endsWith('.zip'));
if (!previous) fail(`--previous is required: the zip that is live now. Candidates:\n  ${zips.join('\n  ')}`);
const prevPath = join(ROOT, previous);
if (!existsSync(prevPath)) fail(`--previous ${previous} not found in site/`);
if (!existsSync(join(DIST, 'index.html'))) fail('dist/ is missing: run `npm run build && npm test` first');

const outZip = join(ROOT, `${name}-deploy.zip`);
const outList = join(ROOT, `${name}-delete-after-deploy.txt`);
if (existsSync(outZip)) fail(`${name}-deploy.zip already exists; pick a new --name`);

// --- current build ---------------------------------------------------------
const files = [];
(function walk(dir) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else files.push(relative(DIST, p).split(sep).join('/'));
  }
})(DIST);
files.sort();
const current = new Set(files);

// --- previous (live) release ---------------------------------------------------
// Older zips were made with Compress-Archive and use backslashes; keep the
// raw entry name for extraction and a normalized one for comparison.
const prevEntries = execFileSync(TAR, ['-tf', prevPath], { encoding: 'utf-8', maxBuffer: 1 << 26 })
  .split(/\r?\n/)
  .filter((l) => l && !l.endsWith('/') && !l.endsWith('\\'))
  .map((raw) => ({ raw, path: raw.replace(/\\/g, '/') }));
const prevPaths = new Set(prevEntries.map((e) => e.path));

const toDelete = [...prevPaths].filter((p) => !current.has(p) && !PROTECTED.some((re) => re.test(p))).sort();
const added = files.filter((p) => !prevPaths.has(p));

// Changed files: compare bytes against the previous release.
const tmp = mkdtempSync(join(tmpdir(), 'bb-prev-'));
let changed = [];
try {
  execFileSync(TAR, ['-xf', prevPath, '-C', tmp]);
  const prevFile = (e) => {
    for (const candidate of [join(tmp, ...e.path.split('/')), join(tmp, e.raw)]) {
      if (existsSync(candidate) && statSync(candidate).isFile()) return candidate;
    }
    return null;
  };
  const byPath = new Map(prevEntries.map((e) => [e.path, e]));
  changed = files.filter((p) => {
    const e = byPath.get(p);
    if (!e) return false;
    const f = prevFile(e);
    return !f || !readFileSync(f).equals(readFileSync(join(DIST, ...p.split('/'))));
  });
} finally {
  rmSync(tmp, { recursive: true, force: true });
}

// --- write the zip -----------------------------------------------------------
const listFile = join(tmpdir(), `bb-files-${process.pid}.txt`);
writeFileSync(listFile, files.join('\n') + '\n');
try {
  execFileSync(TAR, ['--format', 'zip', '-c', '-f', outZip, '-C', DIST, '-T', listFile]);
} finally {
  unlinkSync(listFile);
}
const written = execFileSync(TAR, ['-tf', outZip], { encoding: 'utf-8', maxBuffer: 1 << 26 }).split(/\r?\n/).filter(Boolean);
if (written.length !== files.length || written.some((w) => w.includes('\\'))) {
  unlinkSync(outZip);
  fail(`zip check failed: ${written.length} entries written for ${files.length} files`);
}

writeFileSync(
  outList,
  toDelete.length
    ? `# Move to cPanel trash AFTER ${name}-deploy.zip is uploaded and verified.\n` +
        `# Computed against ${previous} (the release live before this one).\n` +
        toDelete.map((p) => `public_html/${p}`).join('\n') + '\n'
    : `# Nothing to delete: ${name}-deploy.zip removes no files that ${previous} shipped.\n`
);

// --- report ------------------------------------------------------------------
const pages = [...added, ...changed]
  .filter((p) => p.endsWith('index.html') && !p.startsWith('style-guide/') && !p.startsWith('checkout/'))
  .map((p) => p.replace(/index\.html$/, ''));
console.log(`package: ${name}-deploy.zip, ${files.length} files, ${(statSync(outZip).size / 1024).toFixed(0)} KB`);
console.log(`  vs ${previous}: ${added.length} new, ${changed.length} changed, ${toDelete.length} to delete after deploy`);
for (const p of added) console.log(`    + ${p}`);
for (const p of changed) console.log(`    ~ ${p}`);
console.log(`  delete list: ${name}-delete-after-deploy.txt (${toDelete.length} file(s))`);
if (pages.length) {
  console.log(`  changed pages (for IndexNow, after the deploy is live):`);
  console.log(`    npm run indexnow -- --submit ${pages.map((p) => `--url "${p || SITE + '/'}"`).join(' ')}`);
}

# ByteAndBook — Phase 13 Deployment Plan

Date: 2026-08-28
Status: Planning only — nothing in this document has been executed.
No files were uploaded, no remote was configured, no production system
was touched while producing this plan.

## 1. Verified final build

Local commit at time of validation: `3c6cff9e87eb61a463060b035bba023ae3b7b6d4`
(Phase 12). Clean `npm run build` from that commit produces:

- 16 HTML pages, 23 JS files (1 shared Three.js chunk + 8 tiny per-scene
  entry chunks + 8 lazy scene-creator chunks + GSAP core + ScrollTrigger
  + small shared helpers), 1 CSS file, 2 sitemap XML files, 1 robots.txt.
- 43 files total, ~1.1MB.
- `npm test` (site/scripts/qa-check.mjs): 293/293 assertions pass.

## 2. Exact contents to deploy in Phase 14

Deploy **only the contents of `site/dist/`** — not the `dist/` folder
itself, its contents — into `/home/bytesbra/public_html`:

```
dist/
├── index.html
├── 404.html
├── robots.txt
├── sitemap-index.xml
├── sitemap-0.xml
├── styles.css
├── about/index.html
├── contact/index.html
├── style-guide/index.html
├── services/{branding,cloud,computer-hardware,devops,digital-marketing,
│   ebook-publishing,geo,seo,social-media-marketing,
│   software-development,web-development}/index.html
└── _astro/  (23 JS chunks, content-hashed filenames)
```

No `node_modules`, source `.astro`/`.ts` files, `.git`, the legacy
`bytesbra_wp928.sql`, or either backup ZIP are anywhere near this
folder — `dist/` only ever contains build output.

## 3. Production paths that must NOT be touched

- `/home/bytesbra/public_html/.well-known/` — including everything
  inside `pki-validation/` (SSL validation files). Never delete or
  overwrite this directory or its contents during upload.
- `/home/bytesbra/byteandbook-backup-2026-08-26.zip` — leave in place.
- The legacy WordPress database (`bytesbra_wp928`) — not part of this
  deployment at all; no action touches it.
- SSL/TLS configuration in cPanel — out of scope, not touched.

Practical implication for the upload step: whatever upload method Phase
14 uses (SFTP client, cPanel File Manager, etc.) must **selectively
upload/replace only the files that come from `dist/`**, not perform a
"wipe the directory then upload" operation, so `.well-known` and the
backup ZIP survive untouched.

## 4. Rollback plan (documented only — not executed)

If the Phase 14 deployment needs to be reversed:

1. **Before deploying**, create a fresh dated backup of the current
   live `public_html` contents (e.g.
   `byteandbook-backup-2026-08-28-pre-deploy.zip`), downloaded off the
   server to a local/other location before any files are overwritten.
   Do not delete the existing 2026-08-26 backup.
2. Confirm the new pre-deploy backup includes `.well-known/` intact
   (verify the zip listing, don't just trust the operation succeeded).
3. Perform the deployment (Phase 14, not this phase).
4. If something is broken post-deploy: restore the previous site files
   from the fresh pre-deploy backup created in step 1, re-uploading
   them over the broken state — again without touching `.well-known`.
5. After restoring, verify HTTPS still resolves correctly
   (`https://byteandbook.com` loads without a certificate warning) —
   confirms `.well-known`/SSL was never disturbed by the failed
   deploy or the rollback itself.
6. Only after HTTPS is confirmed healthy is the rollback considered
   complete.

## 5. GitHub reconciliation plan (documented only — not executed)

Existing repository: `https://github.com/syedghazihaider/Byteandbook`
(pushed there separately, outside this local repo, per the user).
This local repo currently has **no remote configured**.

Safe steps for Phase 14 to reconcile, in order:

1. Inspect the existing remote state first, without adding it as a
   remote yet: `git ls-remote https://github.com/syedghazihaider/Byteandbook`
   to see its branches/refs, or fetch into a throwaway local check.
2. Add the remote (`git remote add origin <url>`) only after reviewing
   that output, then `git fetch origin` — this downloads history
   without touching the local working tree or branches.
3. Compare `origin/main` (or whatever its default branch is) against
   local `master` — diff the two, don't assume they're compatible.
   If the remote history is unrelated to this local repo's history
   (likely, since it was pushed independently via ChatGPT Work), a
   plain `git push` will be rejected — that's the correct, safe
   outcome, not a bug to force past.
4. Decide reconciliation approach based on what's actually found —
   options in increasing order of disruption: push local history to a
   new branch on the existing repo for review; or, if the user
   confirms the remote copy is disposable/outdated, replace it
   deliberately with explicit approval (never `--force` without that
   explicit go-ahead).
5. Only after the user has reviewed and approved a specific
   reconciliation approach does Phase 14 push — and only to the
   branch/manner the user approved, never a force-push to a shared
   default branch without direct confirmation.

## 6. Deployment method / access review

Checked this local environment only — no connections were attempted.

- `ssh`, `sftp`, and `scp` CLI tools are available on this machine
  (Git Bash / Windows OpenSSH client).
- `~/.ssh/` contains a `config` file and `known_hosts` — but **no SSH
  keypair** (no `id_rsa`, `id_ed25519`, or similar) is present in the
  default location, and nothing in the project or this environment
  references Namecheap/cPanel connection details.
- No `.env` or deployment-config file exists in the project.

**Conclusion:** direct SFTP/SSH deployment from Claude Code is
*technically possible* (the client tools exist) but is **not currently
configured** — there's no credential, key, or host detail available to
this session. To deploy directly from here in Phase 14, the user would
need to provide one of:
- Namecheap cPanel SFTP/FTP host, username, and password (entered
  interactively when prompted, never stored in the repo or typed into
  chat as plain text if avoidable), or
- An SSH key already authorized on the Namecheap account, with its
  path.

Per this session's standing safety rules, credentials will never be
requested to be pasted into chat and entered on the user's behalf —
only a password-manager-style flow or the user running the connection
step themselves would be appropriate when that time comes.

## 7. Deployment package

No ZIP was created in this phase — `site/dist/` already *is* the exact
deployable payload, and packaging it now would just be a stale copy by
the time Phase 14 actually deploys. Phase 14 should re-run `npm run
build` immediately before uploading (or reuse a build no older than
that) and either upload `dist/`'s contents directly via SFTP or zip
them fresh at that time.

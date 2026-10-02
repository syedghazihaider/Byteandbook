# Monitoring cadence (Phase 12, formalised 2026-10-02)

Built for a small team. Weekly takes about 20 minutes, monthly about 90. If a week is missed, do not
double up: do the next one and look at the longer trend. The goal is to catch problems early and to have
numbers ready when real search data accumulates, not to produce reports.

Where things live:
- **Search Console (GSC):** property for byteandbook.com. **Bing Webmaster Tools:** imported from GSC.
- **GA4:** property G-EEQFCCDHDR (loads after the page is idle).
- **Repo checks:** run from `site/`: `npm test`, `npm run verify-live`, `npm run check-links`.
- **Where to record results:** a dated note in `docs/seo-data/` (one file per month is enough).

---

## After every deploy (5 minutes, do not skip)

1. `npm run verify-live`. All checks must pass. If one fails, stop and look before doing anything else.
2. `npm run indexnow -- --submit --url "<each changed page>"` (the package script prints the list).
3. Glance at the homepage, `/contact/` and one article on a phone. Open the Start Project form.
4. Add the commit hash and zip name to the monthly note.

## Weekly (about 20 minutes, pick a fixed day)

| Check | Where | What to look for | Act if |
|---|---|---|---|
| Indexing | GSC, Pages (indexing) report | Count of indexed pages, any new "not indexed" reasons | Any new error class, or a page that should be indexed dropping out |
| Search performance | GSC, Performance, last 7 days vs previous 7 | Clicks, impressions, average position; top 5 queries and pages | A drop of more than a third in clicks or impressions that is not explained by a holiday or a deploy |
| Security and manual actions | GSC | Messages and the Manual actions and Security issues pages | Anything at all |
| Traffic | GA4, Reports, Acquisition | Users and sessions, last 7 days vs previous; share from organic search | Sudden change; a source disappearing |
| Conversions | GA4 | Whether Start Project submissions are being recorded (see note below) | Submissions in the inbox that GA4 does not show |
| Inbox | info@byteandbook.com | Project requests arrive with a reference ID; no bounces | Missing requests, spam flood |
| Site up | Open byteandbook.com and the API form once | Page loads; the form accepts a test submission only if you are checking something specific (use clearly marked test data and delete it) | Anything broken |

**Conversion tracking note.** The GA4 loader is global (`window.gtag` exists). A form-submit event for
Start Project is only counted if one has been added in code and marked as a key event in GA4. If it has
not, add it as a small separate task so that the weekly "conversions" line has a real number. Until then
count reference IDs in the inbox as the source of truth.

## Monthly (about 90 minutes, first week of the month)

1. **Roadmap re-assessment.** Re-score the phases (percent complete) and write down what moved. Do not
   let the percentages drift without a written reason.
2. **Content performance review.** In GSC, Performance, last 28 days, by page: which articles have
   impressions but no clicks (title and description problem), which have clicks (candidates for a
   refresh), which have neither (check indexing first). List one action per article, not a rewrite of
   everything.
3. **Broken-link check on our own site.** `npm run build` then `npm run check-links`. It requests every
   external URL in `dist/` and prints dead ones. Internal links are already covered by `npm test`.
   Report 403/429 results as "verify by hand", not as dead.
4. **Core Web Vitals.** GSC Core Web Vitals report once field data exists (it needs about a month of real
   traffic). Until then, spot-check the homepage and one service page with Lighthouse on mobile.
5. **Freshness.** Check any article whose facts can go stale (prices, tool features, platform rules, for
   example the KDP specifications in the Kindle formatting guide). Update the page and set `updatedDate`.
6. **Link-building log.** Update the outreach tracker (sent, replies, published links). Re-check
   published links. See `docs/link-building-prospects-2026-10-02.md`.
7. **Write the monthly note:** what changed, what was found, what is next, and any numbers that need
   to be compared later.

## Quarterly (about half a day)

- **AI-answer spot check.** Re-run the same fixed set of customer questions (a dozen or fewer) in Google,
  ChatGPT, Perplexity and Gemini, as described in `/insights/geo-vs-seo/`. Record who is cited. Repeat
  each question more than once on different days, because answers vary run to run.
- **Keyword mapping.** Revisit `docs/keyword-mapping-2026-10-01.csv` against real GSC queries.
- **Competitor glance.** Look at who ranks for your five most important terms and whether the SERP changed.
- **Terms and privacy.** If anything material changed, bump `TERMS_VERSION` in both places
  (see CLAUDE.md).

## Scheduled items (do not do early)

- **GSC re-export and keyword baseline: on hold until about 30 October to 13 November 2026** (four to six
  weeks after 2 October 2026), when there is enough real search data. This is deliberately not part of
  the cadence above until then.

## When something goes wrong

| Symptom | First step |
|---|---|
| verify-live fails after a deploy | Check whether the whole zip was extracted into `public_html` (partial uploads have happened before) before suspecting the code |
| Pages dropped out of the index | GSC URL Inspection on one page: crawl allowed? canonical? noindex? Then check `robots.txt` and the last deploy |
| Contact form silent | Test with a clearly marked submission; check `info@byteandbook.com` spam folder; read `api/project-request.php` error handling |
| Traffic drop | Compare GSC and GA4; check Search Console messages; check whether a deploy or a Google update coincides |

Never touch `.well-known`, SSL settings or the legacy database while troubleshooting (see CLAUDE.md).

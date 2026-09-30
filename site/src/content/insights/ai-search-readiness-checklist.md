---
title: "AI Search Readiness Checklist"
description: "A free, fully inline AI search readiness checklist covering crawlability, structured data, entity clarity and content structure. No email required."
publishedDate: 2026-09-30
category: "GEO & AI Search"
relatedServices: ["geo", "seo"]
tags: ["geo", "ai-search", "checklist", "audit"]
targetKeyword: "AI search readiness checklist"
sources:
  - label: "Google Search Central: AI features and your website"
    url: "https://developers.google.com/search/docs/appearance/ai-features"
  - label: "OpenAI: Overview of OpenAI crawlers"
    url: "https://developers.openai.com/api/docs/bots"
  - label: "Perplexity: Perplexity crawlers documentation"
    url: "https://docs.perplexity.ai/docs/resources/perplexity-crawlers"
faqs:
  - question: "Do I need to complete every item on this checklist?"
    answer: "No. Start with crawlability and indexing — nothing else matters if AI crawlers can't reach your pages. After that, work through the sections in order of effort versus impact for your site: structured data and entity clarity are usually quick wins, while rewriting content into answer-first structure takes longer but tends to matter most for actually being quoted."
  - question: "How often should I re-run this checklist?"
    answer: "A full pass every quarter is reasonable for most small business sites. Re-check sooner after a site redesign, a CMS migration, or any change to your robots.txt — those are the changes most likely to accidentally break AI crawler access."
draft: false
---

Most "AI search readiness checklists" you'll find right now are landing pages: a headline, a stat, and a "Get your copy" button that gates the actual checklist behind an email form. We checked several of the currently ranking ones before writing this, and that pattern is real, though not universal — at least one of the higher-ranking guides does publish its full checklist inline with no gate at all, so it's a common shortcut, not an industry requirement.

This is the second kind. Everything below is the actual checklist, in full, free to work through right now. No download, no email. If you'd rather see the reasoning behind these categories — how AI platforms actually retrieve and cite content — read [How to Get Cited by AI](/insights/how-to-get-cited-by-ai/) first; this article is the do-it-yourself audit that follows from it.

## How to use this checklist

Work through the six sections in order. The first two (crawlability and structured data) are foundational — if AI crawlers can't reach or parse your site, nothing else here matters. The later sections (content structure, entity clarity, FAQ hygiene, measurement) are where most of the actual citation-worthiness gets built or lost.

## 1. Crawlability and indexing

- [ ] **Confirm your site is indexed by Google.** Search `site:yourdomain.com` in Google, or check the Pages report in Google Search Console. If pages aren't indexed by regular Search, they're also ineligible for Google AI Overviews and AI Mode — Google's own documentation confirms AI features draw on the same index as standard Search, with no separate technical bar.
- [ ] **Check your robots.txt for accidental blanket AI bot blocks.** A common mistake is a rule like `User-agent: *` with `Disallow: /` left over from a staging environment, or a plugin that blocked "all AI bots" without distinguishing search-facing crawlers from training-only ones. Fetch `yourdomain.com/robots.txt` directly and read it.
- [ ] **Explicitly allow the search-facing crawlers you want citing you.** At minimum: `OAI-SearchBot` (ChatGPT search), `PerplexityBot` (Perplexity), and `Googlebot` (Google Search and AI features — there's no separate Google AI crawler). Add `Claude-SearchBot` if you also want to be surfaced when people ask Claude to search.
- [ ] **Decide deliberately on training crawlers**, `GPTBot`, `Google-Extended` and `ClaudeBot`. Blocking them stops your content from being used to train future models; it has no effect on whether you can be cited in live answers. Allowing or blocking is a real choice — make it on purpose rather than by default.
- [ ] **Verify with a live fetch, not just the file's contents.** Robots.txt syntax errors (a stray character, wrong casing on a user-agent token, a rule placed under the wrong group) are common and silent. Use Google Search Console's robots.txt tester, or fetch the file with `curl -A "OAI-SearchBot" yourdomain.com` to confirm what a real crawler sees.
- [ ] **Check server logs (or your CDN's bot analytics) for actual crawler visits.** Confirming `OAI-SearchBot`, `PerplexityBot` or `Googlebot` hits in your logs tells you retrieval is actually happening, not just theoretically allowed.
- [ ] **Make sure key pages don't require JavaScript execution to show their core content.** Most AI crawlers, like most traditional search crawlers, work best against content present in the initial HTML response. If your key facts only render after a client-side fetch, confirm server-side rendering or static generation is producing them in the raw HTML.
- [ ] **Check that pagination and internal linking actually reach every important page.** A crawler that has to guess at a URL structure, or that only discovers deep pages through a search box, will miss content an XML sitemap and clear internal links would have surfaced directly.
- [ ] **Submit and keep your XML sitemap current.** It's a low-effort way to make sure new or updated pages are discoverable quickly rather than waiting for organic re-crawl, and it's referenced by the same robots.txt file you're already checking.

## 2. Structured data

- [ ] **Add Organization schema** with your legal or trading name, logo, and (if applicable) an `alternateName` covering any stylized or shortened version people actually use to refer to you.
- [ ] **Add Service schema to each core service or product page**, describing what the service is in the `description` field — not just a name.
- [ ] **Add BreadcrumbList schema** matching your visible navigation path, so the hierarchy of your site is machine-readable, not just visually implied.
- [ ] **Add FAQPage schema only where you have genuine, visible FAQs on the page**, and make sure the schema text matches the visible text exactly. Mismatched FAQ schema (markup that says one thing, visible copy that says another) is a trust problem, not a shortcut.
- [ ] **Validate every schema block**, using Google's Rich Results Test or the Schema Markup Validator, after publishing. Invalid JSON-LD is often silently ignored rather than flagged, so it can sit broken for months unnoticed.
- [ ] **Add BreadcrumbList and Organization schema at the template level, not per page**, wherever your CMS allows it. Schema that depends on someone remembering to add it manually to every new page will eventually have gaps; schema generated from your layout won't.

## 3. Entity clarity

- [ ] **Use one consistent business name everywhere** — your site, social profiles, directory listings (Google Business Profile, industry directories), and any press mentions you control. Inconsistent naming gives AI systems conflicting evidence to reconcile about who you actually are.
- [ ] **Write a plain "who we are, what we do, who it's for" statement** somewhere prominent (an About page, your homepage) in ordinary sentences, not just marketing taglines. This is the passage a model is most likely to lift when it needs to describe your business in one or two sentences.
- [ ] **Link your entity across the web where you legitimately can** — a Google Business Profile, Wikidata (if you're notable enough to qualify), LinkedIn company page, and industry directories, each pointing back to your official site. This gives retrieval systems corroborating sources, not just your own claim about yourself.
- [ ] **Keep your logo and name pairing consistent** across the assets referenced in your Organization schema and what's actually visible on the page — a mismatch is a small thing that still adds ambiguity.
- [ ] **State clearly what you do NOT do, if it's commonly confused with what you do.** A short, explicit disambiguation ("we build custom software; we don't resell off-the-shelf licenses") gives a model a sharper boundary to describe you by, rather than leaving it to infer scope from adjacent language.

## 4. Content structure and answer-first writing

- [ ] **Rewrite key headings as the actual questions people ask**, not vague topic labels. "Pricing" tells a model nothing extractable; "How much does a DevOps migration cost?" as an H2 sets up a directly quotable answer underneath it.
- [ ] **Answer the question in the first sentence under each heading**, before caveats, context or a story. If someone deleted every paragraph after the first sentence of each section, the page should still make sense as a list of direct answers.
- [ ] **Convert comparison-heavy prose into tables.** Anywhere you're describing multiple options, trade-offs, pricing tiers or timelines in paragraph form, a table with clear row and column labels is both easier for a human to scan and easier for a model to extract accurately.
- [ ] **Replace vague claims with specific, checkable ones.** "Fast turnaround" is unusable; "typical delivery in 2–3 weeks for a five-page site" is citable. Every superlative in your content is a candidate for this rewrite.
- [ ] **Use real semantic HTML** — actual `<h2>`/`<h3>` heading levels, `<table>`, `<ul>`/`<ol>` — rather than achieving the same visual look with styled `<div>`s. Crawlers and extraction models rely on the underlying structure, not the rendered appearance.
- [ ] **Keep each section focused on one question.** A section that tries to answer three related questions at once is harder to extract cleanly than three short sections, each answering one.
- [ ] **Put facts a model might want to cite into real text, not only images, charts or video.** Information that only exists inside an infographic or a spoken video track is effectively invisible to text-based extraction, even if a human viewer finds it perfectly clear.
- [ ] **Date time-sensitive claims and keep them current.** Pricing, statistics, version numbers and "current as of" statements should carry a visible date and get revisited when the underlying facts change, so a model has a reason to treat the page as current rather than hedging around it.

## 5. FAQ and schema hygiene

- [ ] **Only include questions people genuinely ask.** Invented FAQ questions written purely to insert keywords are both a weak signal for AI extraction and a real risk if you also mark them up as FAQPage schema without them reflecting real user questions.
- [ ] **Keep FAQ answers self-contained.** Each answer should make sense read on its own, without needing the surrounding page for context, since that's exactly how a model is likely to lift it.
- [ ] **Update FAQs when the underlying facts change.** A stale FAQ that a model quotes as current information is worse than no FAQ at all — it's actively misleading whoever reads the citation.
- [ ] **Cross-check FAQPage schema against visible text after every content edit.** This is the single easiest place for schema and copy to drift apart, since editors often update visible text without touching the corresponding JSON-LD.

## 6. Measurement and ongoing checks

- [ ] **Set a fixed list of 5–10 real questions your customers ask**, and record how ChatGPT search, Perplexity and Google (checking for an AI Overview) answer each one today, including whether you're cited.
- [ ] **Re-run that same question list on a schedule** — monthly for a small site is reasonable — and track changes over time rather than treating any single check as a verdict.
- [ ] **Watch analytics for AI referral traffic** as a distinct source from generic "Direct" traffic; most modern analytics tools now separate out ChatGPT, Perplexity and Gemini referrals.
- [ ] **Re-check this whole list after any site redesign, CMS migration, or robots.txt change.** These are the events most likely to silently break crawler access or drop structured data that had been working.

## What we found researching this

Before writing this checklist, we looked at several currently-ranking "AI search readiness checklist" and "GEO checklist" pages to see what the standard actually looks like. The pattern of a landing page promoting a gated PDF or email-gated download is real and common among them — but it isn't universal. At least one widely-cited guide we checked runs a genuinely thorough, ungated checklist inline on the page itself, organized into clear categories with specific test-and-fix guidance for each item. So the honest finding is: gating is common, not guaranteed, and the better competing content is the ungated kind. This checklist follows that better pattern — fully inline, specific enough to act on without more research, and free.

For the reasoning behind why these categories matter — how ChatGPT search, Perplexity and Google AI Overviews actually source their citations differently — see [How to Get Cited by AI](/insights/how-to-get-cited-by-ai/). For background on GEO as a discipline, see [What Is GEO?](/insights/what-is-geo/). If you'd like this audit done for you, with the fixes implemented, see our [GEO service](/services/geo/).

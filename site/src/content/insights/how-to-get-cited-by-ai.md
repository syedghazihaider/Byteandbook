---
title: "How to Get Cited by AI (ChatGPT, Perplexity, Google AI Overviews)"
description: "A platform-by-platform guide to how ChatGPT search, Perplexity and Google AI Overviews actually source citations, with real robots.txt and llms.txt examples."
publishedDate: 2026-09-30
category: "GEO & AI Search"
relatedServices: ["geo", "seo"]
tags: ["geo", "ai-search", "llms.txt", "robots.txt", "citations"]
targetKeyword: "how to get cited by AI"
sources:
  - label: "OpenAI: Overview of OpenAI crawlers (GPTBot, OAI-SearchBot, ChatGPT-User)"
    url: "https://developers.openai.com/api/docs/bots"
  - label: "Perplexity: Perplexity crawlers documentation"
    url: "https://docs.perplexity.ai/docs/resources/perplexity-crawlers"
  - label: "Anthropic: Does Anthropic crawl data from the web, and how can site owners block the crawler?"
    url: "https://support.claude.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler"
  - label: "Google Search Central: AI features and your website"
    url: "https://developers.google.com/search/docs/appearance/ai-features"
  - label: "Google for Developers: Google's common crawlers"
    url: "https://developers.google.com/crawling/docs/crawlers-fetchers/google-common-crawlers"
faqs:
  - question: "Is there a way to guarantee my page gets cited by ChatGPT or Perplexity?"
    answer: "No. None of the major AI search tools publish their exact ranking or citation logic, and it changes as the underlying models are updated. Anyone promising guaranteed citations is overselling. What you can control is whether your content is crawlable, well-structured and factually clear enough to be a strong retrieval candidate."
  - question: "Do llms.txt files actually work?"
    answer: "No major AI platform has confirmed it reads or uses llms.txt to decide what to crawl, index or cite. It's a proposed convention, not a standard any of the big engines have committed to supporting. It's low-cost to publish and doesn't hurt, but treat it as a nice-to-have, not a fix for citation problems, and never as a substitute for a correct robots.txt."
  - question: "Should I block AI crawlers from my site?"
    answer: "That depends on your goal, and the crawlers aren't interchangeable. Search-facing crawlers like OAI-SearchBot, PerplexityBot and Googlebot retrieve pages to answer live queries; training crawlers like GPTBot and Google-Extended feed model training. You can allow the search crawlers so you're eligible to be cited while blocking the training crawlers, or block everything, or allow everything. There's no universally correct answer, only a deliberate one."
draft: false
---

If you've read a "get cited by AI" guide before, it probably told you to write clear content, add schema markup, and keep your information consistent. That advice isn't wrong. It's also not enough, because it treats "AI search" as one thing. It isn't.

ChatGPT search, Perplexity and Google's AI Overviews are built differently, pull from different indexes, and use different signals to decide what to cite. A page that gets picked up constantly by Perplexity can be invisible in ChatGPT search, and vice versa. If you want to actually improve your odds, you need to understand each platform's mechanics well enough to act on them, not just apply one generic checklist to all three.

This article covers how each platform actually sources its citations, the real crawler names and code you need to configure access correctly, and what changes to your content genuinely move the needle. No plugin to sell, no gated download. For the difference between GEO and SEO in general, see [What Is GEO?](/insights/what-is-geo/); for a step-by-step audit, see the companion [AI Search Readiness Checklist](/insights/ai-search-readiness-checklist/).

## The one thing all three platforms have in common

Before the differences: every platform that cites live sources follows the same three-stage process described in the original GEO research — retrieval, extraction, synthesis. A crawler (or an index built from one) finds candidate pages, the model reads them and pulls out passages that answer the question, and it writes a response that cites the sources it used. If your page never gets retrieved, nothing downstream matters. That's why crawler access is the first thing to get right, not an afterthought.

Where the platforms diverge is in what they retrieve from, how aggressively they fan a single question out into multiple sub-searches, and how they decide which passages are trustworthy enough to quote. That's the part worth understanding platform by platform.

## Platform by platform: how each one actually sources citations

| Platform | What it searches | Search-facing crawler | Separate training crawler? | Notably different behavior |
| --- | --- | --- | --- | --- |
| ChatGPT search | Bing's index plus OpenAI's own crawl, live at query time | OAI-SearchBot | Yes — GPTBot | Opting a page out of OAI-SearchBot removes it from ChatGPT search results entirely; it's a hard gate, not a ranking signal |
| Perplexity | Its own index, built by PerplexityBot, refreshed frequently | PerplexityBot | No official separate training crawler documented | Tends to cite multiple sources per answer and shows them inline as numbered footnotes, so being one of several citations is normal, not a failure |
| Google AI Overviews / AI Mode | The regular Google Search index — no separate AI index | Googlebot | Yes — Google-Extended (training/grounding opt-out) | Uses "query fan-out": it breaks one question into several related searches and pulls supporting pages for each, which is why Google explicitly says there's no separate technical requirement to appear here beyond normal Search eligibility |

### ChatGPT search (OpenAI)

OpenAI runs three distinct crawlers, and confusing them is the single most common robots.txt mistake:

- **OAI-SearchBot** — retrieves pages to power ChatGPT's search feature. OpenAI states plainly that sites opted out of OAI-SearchBot "will not be shown in ChatGPT search answers." This is the one to allow if you want to be cited.
- **GPTBot** — a separate crawler used to gather content that may train future models. Blocking it has nothing to do with whether you can be cited in search; it only affects training.
- **ChatGPT-User** — fires when someone inside a ChatGPT conversation triggers a live fetch of a specific page (for example, asking ChatGPT to look at a URL). OpenAI notes this isn't automated web-wide crawling, and robots.txt rules may not fully apply to it since it's a direct, user-initiated request.

Practically: if you want ChatGPT search citations, OAI-SearchBot must be allowed. Whether you allow or block GPTBot is a separate, purely training-related decision.

### Perplexity

Perplexity runs a simpler two-crawler setup:

- **PerplexityBot** — the indexing crawler. Perplexity's own documentation states it "does not train AI models" and exists to index sites for search results. It respects robots.txt.
- **Perplexity-User** — fires on-demand when a user's question requires fetching a specific live page. Similar to ChatGPT-User, it's tied to an individual request rather than broad crawling, and Perplexity notes it largely ignores robots.txt since the fetch was directly requested by a person.

Perplexity answers tend to carry visibly numbered citations, often five or more per answer, pulled from PerplexityBot's index. Because it's not layering a training-vs-search split the way OpenAI does, the access decision is simpler: allow PerplexityBot if you want in, block it if you don't.

### Google AI Overviews and AI Mode

Google's approach is the odd one out, and it's worth explaining because it surprises people. There is no separate "AI crawler" building a separate AI index. AI Overviews and AI Mode draw on the same index Googlebot has always built for ordinary Search. Google's own documentation is direct about this: "There are no additional technical requirements" to appear in AI Overviews or AI Mode beyond being indexed and eligible to show with a snippet in regular Search results.

What is different is retrieval behavior. Google has described using "query fan-out" — breaking a single prompt into multiple related searches across subtopics, then pulling from a wider, more varied set of supporting pages than a single ten-blue-links result page would show. That's why a page that ranks respectably, but not necessarily #1, for a narrow sub-question can still get pulled into an AI Overview: it doesn't need to win the whole query, just win one of the fanned-out sub-searches.

Google-Extended is the separate, AI-specific token here, but it controls training and grounding data use for Google's other AI systems (like Gemini), not eligibility for AI Overviews or AI Mode, which run on the standard Search index and standard Googlebot access.

### A note on Anthropic (Claude)

Claude doesn't currently run a consumer-facing search-and-cite product comparable to ChatGPT search or Perplexity, but Anthropic does run three separate crawlers worth knowing if you're setting robots.txt rules anyway: **ClaudeBot** (training), **Claude-SearchBot** (used to improve search result quality when Claude is asked to search), and **Claude-User** (fires on user-directed fetches, similar to ChatGPT-User). Anthropic's own support documentation lays out all three separately so site owners can make a distinct decision about each rather than blocking or allowing Claude wholesale.

### Why the platform differences matter in practice

This isn't a technicality. Three concrete consequences follow directly from the table above:

- **Opting out of one platform's search crawler doesn't affect the others.** Disallowing OAI-SearchBot has no bearing on whether Perplexity or Google can still cite you, and vice versa. Each is an independent decision, and a robots.txt written to block "all bots matching /bot/i" often ends up blocking search-facing crawlers by accident along with training ones.
- **Google can cite you without you ever "optimizing for AI Overviews."** Because it draws on the same index as ordinary Search, ranking work you'd do for SEO reasons already applies. There's no separate AI Overview ranking system to reverse-engineer.
- **Perplexity and ChatGPT search are closer to building genuinely separate indexes**, meaning your visibility in each is more independent of your Google rankings than you might assume. A page that ranks on page two of Google can still be a strong PerplexityBot or OAI-SearchBot retrieval candidate if it answers a specific question clearly.

## Common mistakes that quietly block citations

A few patterns show up repeatedly on sites that assume they're doing everything right:

**Blocking "AI bots" as a category in a security plugin.** Several WordPress security and firewall plugins ship with a one-click "block AI crawlers" toggle that doesn't distinguish OAI-SearchBot from GPTBot, or PerplexityBot from Perplexity-User. Flipping it on can silently remove you from ChatGPT search and Perplexity citations while you believe you've only opted out of training. Check the plugin's actual rule list, not just its label.

**A CDN or WAF challenge page that crawlers can't pass.** Bot-management tools that present a JavaScript challenge or CAPTCHA to anything that looks automated will also stop legitimate search-facing crawlers unless those crawlers are explicitly allow-listed by IP or user-agent. Cross-check your CDN's bot-management rules against the crawler list above, not just robots.txt.

**Treating llms.txt as the fix and skipping the actual content work.** Because it's new and easy to publish, llms.txt gets treated as a checkbox that solves AI visibility. As covered above, no major platform has confirmed using it at all — it's a nice-to-have, not a substitute for crawlable, well-structured, factually specific content.

**Copying competitor FAQ questions instead of using your own customers' real questions.** FAQPage schema and answer-first headers only work if the questions are ones people are actually asking a model. Generic, keyword-stuffed questions read as filler to both users and extraction systems.

**Letting structured data drift from visible content after an edit.** This is less a one-time mistake than a maintenance failure: a page's visible FAQ text gets updated for accuracy, but the FAQPage JSON-LD next to it doesn't, and now the two disagree. Systems that can detect this kind of inconsistency treat it as a trust signal against you, not a neutral oversight.

## Crawler access: a real robots.txt block

Here's a working example that allows every search-facing crawler (so you're eligible to be cited) while blocking the crawlers that exist purely for model training. Adjust it to your own policy — there's no universally correct answer, only a deliberate one:

```txt
# Search-facing crawlers — allow, so pages are eligible to be cited
User-agent: OAI-SearchBot
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Googlebot
Allow: /

User-agent: Claude-SearchBot
Allow: /

# Training-only crawlers — block if you don't want content used for model training
User-agent: GPTBot
Disallow: /

User-agent: Google-Extended
Disallow: /

User-agent: ClaudeBot
Disallow: /

# User-initiated fetch bots — these respond to a specific person's request,
# not broad crawling; most sites leave them allowed
User-agent: ChatGPT-User
Allow: /

User-agent: Perplexity-User
Allow: /

User-agent: Claude-User
Allow: /

Sitemap: https://example.com/sitemap.xml
```

A few things worth being precise about:

- **Order and grouping don't create priority.** Each `User-agent` block is evaluated independently against its own name; there's no "first match wins" behavior across different bot names the way there is with multiple rules for the same bot.
- **Blocking by robots.txt is a request, not a lock.** It relies on the crawler honoring it. Anthropic's own documentation specifically warns that trying to block a crawler at the IP level instead can backfire, because it can prevent the crawler from even reading your robots.txt file in the first place — which is the opposite of what you want if your goal is a clean opt-out.
- **This is a training/search split, not a single "block all AI" switch.** GPTBot, Google-Extended and ClaudeBot existing as separate tokens from OAI-SearchBot, Googlebot and Claude-SearchBot is intentional. Treating "AI bots" as one category means either accidentally blocking yourself out of citations, or accidentally opting everything into training when you only meant to allow search.

## llms.txt: a real example, and an honest caveat

llms.txt is a proposed file, placed at the root of your domain, meant to give AI systems a clean, markdown-formatted summary of a site — what it is, and links to its most important pages — instead of making a model try to parse full HTML navigation and layout.

The caveat first, since most articles bury it: as of this writing, no major AI platform (not OpenAI, not Perplexity, not Google, not Anthropic) has publicly confirmed that it reads or uses llms.txt to decide what to crawl, retrieve or cite. It's a community-proposed convention, not an adopted standard. Publishing one costs you almost nothing and can't hurt, but don't treat it as a lever that moves citations — the crawler and content work above does that.

With that said, here's a real, working example:

```markdown
# ByteAndBook

> Digital technology and growth agency providing SEO, GEO, web development,
> software development, DevOps, cloud infrastructure and branding services.

## Services

- [SEO](https://byteandbook.com/services/seo/): Technical and content search engine optimization.
- [GEO](https://byteandbook.com/services/geo/): Generative engine optimization for AI answer engines.
- [Web Development](https://byteandbook.com/services/web-development/): Custom website design and development.
- [DevOps](https://byteandbook.com/services/devops/): CI/CD, infrastructure automation and monitoring.
- [Cloud](https://byteandbook.com/services/cloud/): Cloud architecture, migration and management.

## Insights

- [What Is GEO?](https://byteandbook.com/insights/what-is-geo/): What generative engine optimization is and how it differs from SEO.
- [AI Search Readiness Checklist](https://byteandbook.com/insights/ai-search-readiness-checklist/): A self-audit checklist for AI search visibility.

## About

- [About ByteAndBook](https://byteandbook.com/about/): Company background and approach.
- [Contact](https://byteandbook.com/contact/): Start a project inquiry.
```

Keep it short, factual and link-driven. It's a table of contents, not a marketing page — duplicate marketing copy from your homepage into it doesn't help, since the model still has to read your actual pages to extract anything citable.

## What actually changes your odds: content structure

Crawler access gets you into consideration. Whether you're the passage a model chooses to quote comes down to how extractable your content is. This is the part that's genuinely shared across all three platforms, because it follows directly from how the extraction step works — a model looking for a self-contained answer to quote:

**Answer the question in the first sentence of the section, not the third paragraph.** If your H2 is "How long does a DevOps migration take?", the sentence immediately under it should answer that, plainly, before you get into caveats and context. A model extracting a passage to quote favors text that already reads like a standalone answer.

**Use real tables for comparisons.** A markdown or HTML table with clear row and column labels is far easier for a model to extract and restate accurately than the same information written as flowing prose. If you're comparing options, costs, timelines or trade-offs, a table beats paragraphs.

**Name specific things.** "Some businesses see faster load times" is not citable. "Moving from shared hosting to a CDN-backed static build typically drops Time to First Byte from 800ms+ to under 200ms" is a specific, checkable claim a model can attribute to you. Vague superlatives get paraphrased or dropped; specific mechanisms and numbers get quoted.

**Keep your entity name and description consistent everywhere.** Your site, your social profiles, any directories you're listed in — if your business name, description or key facts differ across these, you're giving the model conflicting evidence about what you actually are, which makes it less confident citing you at all.

**Structured data removes ambiguity, it doesn't buy placement.** Organization, Service and FAQPage JSON-LD tell a system unambiguously what a page is and who's behind it. It won't get you cited on its own, but it removes one more source of confusion for a system trying to decide whether your page is a reliable source.

**Don't bury the answer under an image or a video.** If the fact a model would want to cite only exists inside an infographic, a chart with no accompanying text, or spoken narration in an embedded video, it's effectively invisible to text-based extraction. Put the same information into real text on the page, even if it's also presented visually elsewhere — the visual can be the illustration, but the sentence needs to exist in the HTML too.

**Freshness matters more for time-sensitive facts than for evergreen ones.** A page stating "as of 2026" pricing, statistics or version numbers should be updated when those change, and it's worth using a genuine `updatedDate` where your CMS supports one. Models retrieving a page with a visible, accurate update date have less reason to treat a fact as stale or to hedge around citing it.

## Measuring whether any of this is working

Because no platform publishes citation logs the way Google Search Console publishes impressions, tracking this is manual and platform-specific:

1. **Build a fixed set of real questions** your customers actually ask — five to ten is enough to start.
2. **Ask each question directly in ChatGPT search, Perplexity, and Google (checking for an AI Overview), on a recurring schedule** — monthly is reasonable for a small site. Record whether you're cited, what was quoted, and which competitors also appeared.
3. **Watch your server logs for search-facing crawler activity** — OAI-SearchBot, PerplexityBot and Googlebot hits confirm you're at least being retrieved, which is a precondition for being cited even if it doesn't guarantee it.
4. **Track referral traffic from AI platforms in your analytics.** ChatGPT, Perplexity and Gemini traffic increasingly show up as distinct referral sources in most analytics tools, separate from generic "Direct" traffic, letting you see if citations are actually converting to visits.

This is slower and less precise than SEO rank tracking. Treat it as directional evidence over months, not a weekly dashboard.

## Quick reference: what to configure for each platform

If you only take one table away from this article, use this one to check your own setup against:

| Platform | Allow this crawler to be citable | Block this crawler to opt out of training | If blocked from search-facing crawler |
| --- | --- | --- | --- |
| ChatGPT search | OAI-SearchBot | GPTBot | Won't appear in ChatGPT search answers at all |
| Perplexity | PerplexityBot | Not documented as separate | Won't be indexed or cited |
| Google AI Overviews / AI Mode | Googlebot | Google-Extended | Won't appear in Search or AI features (same index) |
| Claude (search context) | Claude-SearchBot | ClaudeBot | Won't be used to improve Claude's search results |

Run each of the four search-facing crawlers against your live robots.txt before assuming any of this article applies to you — it's a five-minute check that catches the majority of avoidable citation gaps.

## What doesn't work

Skip anything that promises guaranteed placement, "AI SEO packages" sold as a fixed monthly fee for a specific number of citations, or tactics built around gaming a single platform's current quirks. These systems change their retrieval and ranking behavior as the underlying models are updated, sometimes without any announcement. The durable version of this work is the boring version: keep the right crawlers allowed, keep your entity information consistent, and write content that answers the question in the first sentence with something specific enough to quote.

If you want a structured way to work through this yourself, see the [AI Search Readiness Checklist](/insights/ai-search-readiness-checklist/). For background on how GEO relates to conventional SEO, see [What Is GEO?](/insights/what-is-geo/). If you'd rather have it handled, see our [GEO service](/services/geo/).

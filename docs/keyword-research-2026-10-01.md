# Keyword research, 2026-10-01 (free sources only)

Companion files: [`keyword-mapping-2026-10-01.csv`](keyword-mapping-2026-10-01.csv) (the prioritized
keyword-to-page mapping, 25 rows) and the raw data in [`seo-data/`](seo-data/).

**Nothing in this report is a search-volume number.** No volume, difficulty or CPC figure appears
anywhere, because no free source provides them. Demand is shown only as **relative** interest
(Google Trends) and presence in Google autocomplete. Where real volume is needed, it says so.

## Bottom line

1. **The site uses the wrong words in the places that matter most.** None of the 11 service pages has
   its main commercial phrase in its title or H1 (e.g. "Cloud Services", "SEO", "DevOps"), and the
   largest-demand term in several areas is not the one the site uses (table below).
2. **GEO is a niche name for a bigger topic.** In the US over the last 12 months, "AI SEO" runs about
   **5-6x** "generative engine optimization" in relative interest, and "AEO" about 3-4x. On this site "AI SEO"
   appears **2 times**, and "answer engine optimization", "AEO", "AI search optimization" and "LLM SEO"
   appear **0 times**, including on `/services/geo/` itself.
3. **Where the SERP is winnable.** For the commercial queries checked, the top 10 is mostly *mid-size
   agencies' own service pages* (GEO, AI SEO, DevOps) or *small specialists* (ebook formatting, server
   hardware), not tool giants or marketplaces. **ByteAndBook is not in the top 10 for any of the 15
   queries I could check.**
4. **Some of the roadmap ideas have no measurable demand** (Terraform vs Ansible, cloud migration
   checklist, ebook cover design: all below Trends' reporting threshold), and "SaaS SEO" demand is
   **falling**, so the SaaS beachhead should be treated as a positioning choice, not something keyword
   demand proves.
5. **Two real assets are unused for search:** the verified hard-to-source RAM case study (and "server
   memory" is the *rising* hardware term), and the team's real Intune / Microsoft 365 / Azure reviews
   ("Intune" is a very large topic). The second is a **business decision**, flagged below.

## What I could and could not use

| Source | Used? | Notes |
|---|---|---|
| Google Search Console | **No** | I cannot log into GSC, and there is no export in the repo. "Current ranking" is therefore a proxy only (see below). |
| Google Trends | Yes | Relative interest, US, last 12 months, 12 comparison groups. Relative **within** a group only; groups cannot be compared with each other; values near 0 are noise. |
| Google autocomplete | Yes | 152 queries across 19 seeds x 8 modifiers; real long-tail phrasing. Presence only, no magnitude. |
| SERP checks | Partly | DuckDuckGo blocked automated queries after 2; Bing returned no parseable results. I used the connected Firecrawl search tool for **15 queries (30 credits)** and was rate-limited (429) on the rest. This is a search-engine proxy, **not Google's own SERP**. |
| People Also Ask | **No** | Not obtainable without scraping Google. |
| Search volume / difficulty / CPC | **No** | Needs a paid tool (Ahrefs, Semrush, Ubersuggest and similar). |

**To complete the "current ranking" column:** export from GSC, Performance, Queries and Pages, last 3 months,
as CSV, and drop them in `docs/seo-data/`. With 2 clicks and 8 impressions so far, the export will be short,
but it shows which queries Google already associates with the site.

## 1. Demand signals (Google Trends, US, last 12 months, relative within each group)

Higher = more searched *relative to the others in the same group*. Arrow compares the first and last third of the year.

| Group | Ranking (relative index) |
|---|---|
| GEO naming | **AI SEO 52** (flat/down) > **AEO 35** (up, ambiguous abbreviation) > generative engine optimization 9 (up) > answer engine optimization 6 (up) > geo seo 5 > LLM SEO 3 |
| AI search topics | ai overviews 49 (up) ~ ai search optimization 48 > chatgpt seo 20 (down) > **llms.txt 16.5 (up)** > perplexity seo 9 (down) |
| AI search vs GEO terms | ai visibility 46 > ai search optimization 14 > generative engine optimization 12 (up) > geo agency 2 > "generative engine optimization services" 1.3 |
| Our service categories | **seo services 64 (up)** > digital marketing services 26 > web development services 9 > social media marketing services 8 (down) > devops services 6 |
| Cloud / IT | **managed it services 64 (up)** > custom software development 12 (up) > aws consulting 5 > cloud migration services 5 (down) > devops consulting 1.5 |
| Book publishing | **book formatting 66** > self publishing services 7 (up) > ebook formatting 5 (down) > kindle formatting 4 (down) > ebook cover design 0.7 |
| Branding | logo design 50 > **brand guidelines 25 (down)** > brand identity design 2 > logo design cost 1.8 > logo design services 1.7 |
| Technical SEO | technical seo 47 (up) > **core web vitals 38 (up)** > kubernetes vs docker 11 (down) > terraform vs ansible 0.7 > cloud migration checklist 0.2 |
| SaaS angle | seo audit 56 > technical seo 42 > saas seo 24 (**down**) > seo for saas 14 (**down**) > saas seo agency 2.7 |
| Cost-intent | seo cost 58 (down) > devops cost 15 (down) > web development cost 13 (down) > logo design cost 10 (down) > custom software development cost 2 |
| Hardware | **server memory 37 (up)** > server hardware 21 > workstation build 3 > used server hardware 3 > refurbished servers 0.5 |
| Microsoft / MSP | **intune 75** > managed it services 46 (up) > microsoft 365 support 10 > azure consulting 2.6 > microsoft 365 migration 2 |

Caveats: "AEO" is also an unrelated abbreviation, so its 35 is an upper bound for the topic. Terms under about 2
are too small for Trends to rank reliably. All cost-intent terms are *declining*.

## 2. What Google autocomplete says people type

Phrasing that real searchers use, found for the seeds checked (full list in `seo-data/`):

- **GEO / AI SEO:** "...services", "...agency", "...cost", "...tools", "...for small business / shopify / ecommerce / wordpress"; "ai seo for **saas**"; "answer engine optimization vs generative engine optimization"; "geo vs seo".
- **SEO:** "seo services cost 2026", "technical seo audit cost", "technical seo for **saas** / **ai search** / developers".
- **Services in general:** nearly every service seed autocompletes with **cost / pricing / for startups / for small business**.
- **DevOps:** "devops services for startups", "devops services pricing", "devops cost".
- **Hardware:** "server hardware for **ai** / small business / home lab", "...price increases".
- **Ebook:** "ebook formatting for kindle / kdp / amazon", "ebook formatting software / template / free / ai".
- **Ambiguity found:** the bare query **"what is geo"** autocompletes to geocaching, geography, geometry and geology. The GEO article's title already uses the full phrase; its internal `targetKeyword` should too.

## 3. What the SERPs look like (15 queries, proxy)

| Query | Who ranks (top 10) | Read |
|---|---|---|
| generative engine optimization services | Percepture, Power Digital, OrangeMantra, Epic Web Studios, Perrill, First Pier (service pages); two "best GEO agencies" listicles; Semrush guide | Winnable by a good service page |
| ai seo services | Ayatas, Thrive, The Ad Firm, Coalition, SEO.co, Omnius; Reddit; listicles | Strong agencies, loud claims |
| seo services for saas | Impression Digital, OuterBox, Percepture, Growfusely + many "best SaaS SEO agencies" lists | Crowded niche |
| technical seo audit | Semrush, Ahrefs, Ubersuggest, SEOptimer, technicalseo.com; agency pages at #5 and #10 | Free tools own it |
| digital marketing services for startups | Listicles, Clutch, Reddit, Wellfound | Directories win, not agency pages |
| devops consulting services | Dedicatted, MeteorOps, Algoworks, TierPoint, Mission Cloud, 10Pearls; listicles | Agency pages rank |
| cloud migration services | AWS, Google Cloud, CDW, ScienceSoft, Andersen, Navisite | Owned by large vendors |
| server hardware sourcing | LinkSource, Server-Fuel, ServerPartDeals, SmartSource IT; Reddit, Spiceworks | Small specialists rank |
| logo design services | DesignCrowd, Fiverr, Vistaprint, Upwork, Designhill, Logo.com | Marketplaces |
| ebook formatting services | BookBaby, Scribendi, Word 2 Kindle, eBook Launch, HMD Publishing, Palmetto | Small specialists rank |
| llms.txt | llmstxt.org, Chrome Lighthouse docs, Semrush, Ahrefs, GitBook, Mintlify | Authoritative only |
| managed it services for small business | VC3, Dataprise, TPx, ConnectWise, Secur-Serv | Established MSPs |
| how to rank in chatgpt | LinkedIn post, YouTube, Reddit, Quora, Neil Patel, Power Digital, Ahrefs, Omnius | UGC and mid-authority rank |
| technical seo checklist | Semrush, DashThis, Yotpo, Backlinko, NoGood, Exposure Ninja | Tool vendors and large agencies |
| how to format an ebook for kindle | Amazon KDP, Reddit, Writing Forums, Medium, PickFu, YouTube | Low-authority sites rank beside KDP |

`byteandbook.com` appears in **none** of them (and in neither DuckDuckGo result I could get). Not checked
(rate-limited, or skipped to conserve credits): custom software development, web development, AWS consulting,
brand identity design, answer engine optimization, social media marketing, Kindle formatting services, self
publishing services.

## 4. On-page coverage (what the site actually says)

Every service page's title today (all live):

| Page | Title today | Words |
|---|---|---|
| /services/geo/ | GEO (Generative Engine Optimization) | 705 |
| /services/seo/ | SEO Services: Technical & Content SEO | 962 |
| /services/devops/ | DevOps Services: CI/CD & Cloud Automation | 349 |
| /services/ebook-publishing/ | eBook & Digital Publishing | 672 |
| /services/web-development/ | Web Development | 570 |
| /services/software-development/ | Software Development | 273 |
| /services/digital-marketing/ | Digital Marketing | 289 |
| /services/social-media-marketing/ | Social Media Marketing | 275 |
| /services/computer-hardware/ | Computer Hardware | 368 |
| /services/branding/ | Branding & Logo Design | 366 |
| /services/cloud/ | Cloud Services | 281 |

(Title length today: most are 28-40 characters with the brand, leaving room for the keyword.)

Synonym coverage for the flagship topic (site-wide mentions): generative engine optimization 37; "geo" 171;
**ai seo 2**; **answer engine optimization 0**; **aeo 0**; **ai search optimization 0**; **llm seo 0**;
ai overviews 30; chatgpt 83; perplexity 59; llms.txt 19. The GEO service page has **0** mentions of AI SEO,
AEO and AI search optimization.

## 5. Recommended on-page changes (proposals only, nothing applied)

Titles below are already length-checked (46-59 characters including "| ByteAndBook").

| Page | Proposed title | Other change |
|---|---|---|
| /services/geo/ | Generative Engine Optimization (GEO) Services \| ByteAndBook | Add "GEO, AEO and AI SEO: same thing?" section |
| /services/seo/ | Technical SEO Audit & SEO Services \| ByteAndBook | Mention "startups and mid-market" (already published on /case-studies/) |
| /services/ebook-publishing/ | Book & eBook Formatting Services \| ByteAndBook | Confirm print interior formatting is offered first |
| /services/computer-hardware/ | Server Memory & Hardware Sourcing \| ByteAndBook | Use only the case study's facts |
| /services/devops/ | DevOps Services for Startups: CI/CD & Cloud \| ByteAndBook | FAQ: how is DevOps work priced (cost drivers, no prices) |
| /services/web-development/ | Web Development Services for Startups \| ByteAndBook | - |
| /services/software-development/ | Custom Software Development for Startups \| ByteAndBook | Page is the thinnest (273 words) |
| /services/digital-marketing/ | Digital Marketing Services for Startups \| ByteAndBook | Real lever is off-page (Clutch, "best agencies" lists) |
| /insights/what-is-geo/ | (unchanged) | Set `targetKeyword` to "what is generative engine optimization" |
| /insights/how-to-get-cited-by-ai/ | (unchanged) | Add H2/FAQ "Can you rank in ChatGPT?" |

New content, in priority order: (1) "GEO vs AEO vs AI SEO" terminology article; (2) "How we took our own site's CLS
from 0.100 to 0.000", a **first-party** article using the real numbers from our own Lighthouse runs (differentiated,
fully verifiable); (3) a practical "how to format an ebook for Kindle" guide drawn from the 100+ ebook projects.
Not recommended (no demand or an unwinnable SERP): Terraform vs Ansible, cloud migration checklist, ebook cover
design, a standalone llms.txt article, a technical SEO checklist, and logo-design or cloud-migration head terms.

## 6. Decisions only you can make

- **Intune / Microsoft 365 / managed IT.** Demand is large ("intune" is the biggest term I measured) and the team has
  31 real reviews in this area, but the head term is owned by established MSPs, and nothing on the site
  offers it as a service. Do you want to sell this? If yes, a niche page or an Intune setup guide using the real
  reviews as evidence is the credible way in.
- **Pricing content.** Every service autocompletes with "cost"/"pricing", but all measured cost terms are declining and
  your policy is "scoped individually". I recommend FAQs about cost *drivers* (no figures) rather than price pages.
- **The SaaS beachhead.** Keyword demand neither confirms nor contradicts it ("seo for saas" is falling). Keep the
  positioning if the strategy is sound, but don't expect keyword data to carry it.
- **Book formatting scope.** The biggest ebook term is "book formatting" (print included). Confirm print interior
  formatting is part of the offer before the page leans on it.

## 7. Where a paid tool is genuinely needed

Real **search volume**, **keyword difficulty**, **CPC**, SERP-feature presence (AI Overviews, featured snippets), and a
backlink gap against the agencies above. A one-month subscription to any mainstream keyword tool would settle the
P1/P2 ordering in the CSV. Until then, the ordering rests on relative Trends data and SERP composition.

## 8. Re-running this (it is also the Monitoring baseline)

The two JSON files in `seo-data/` and the CSV are a dated baseline. Re-running the same collection in about 3 months
(Trends comparisons, autocomplete seeds, SERP checks) shows movement in demand and in whether ByteAndBook enters any
top 10, which GSC then confirms with real impressions and positions.

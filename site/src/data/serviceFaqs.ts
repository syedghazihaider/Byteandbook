// Phase 4: FAQ blocks for service pages, keyed by service slug
// (src/content/services/<slug>.md). Kept here rather than in the service
// frontmatter because the chatbot knowledge build parses that frontmatter
// with a small hand-rolled parser that doesn't handle nested lists.
//
// Every answer is reviewed and approved before it ships. Rules: concrete,
// defensible claims (a mechanism, a real trade-off, or a verified figure
// already published on the site); no guarantees, no invented results.
// Each entry renders visibly on its page AND as FAQPage schema from the
// same data, so the two can never drift apart.
import type { Faq } from '../lib/faq';

// Keys are service slugs, plus the three category slugs
// (web-brand-publishing, infrastructure-automation, growth-ai-discovery)
// for the category pages.
export const serviceFaqs: Record<string, Faq[]> = {
  'web-brand-publishing': [
    {
      question: 'Can I hire you for just one of these, like only a logo?',
      answer:
        'Yes. A project can be a single service (just a logo, just an ebook, just a website) or combine several. The process is the same either way, scaled to the scope.',
    },
    {
      // Terms of Service §18 (Intellectual property) and §19 (Pre-existing
      // tools/frameworks).
      question: 'Do I own the website, code or brand files when the project ends?',
      answer:
        "Yes. Ownership of the final deliverables created for you transfers to you on full payment, unless we agree otherwise in writing. At handoff you get the working, deployed product plus the files and access to maintain it. Pre-existing tools and frameworks we build with stay ours (or their creators'), and you're licensed to use them as part of your project.",
    },
    {
      question: 'Why do wireframes and concepts come before code or a final logo?',
      answer:
        'Because changes are cheap early and expensive late. Moving a section in a wireframe takes minutes; moving it in a built, tested page means redesigning, re-coding and re-testing it. Agreeing structure first means the build phase is spent building, not redoing.',
    },
    {
      // Terms of Service §15 (Project timelines) and §16 (Client-caused delays).
      question: 'How long does a project take?',
      answer:
        "Timelines are estimated per project in the proposal, based on the agreed scope. They move if the scope changes, or if feedback, content or access arrive later than planned, and we'll tell you when that happens instead of letting a deadline slip quietly.",
    },
  ],
  'web-development': [
    {
      question: 'Will my site work properly on phones?',
      answer:
        "Every layout is checked at real responsive breakpoints, and tested on real devices before launch, not just in a desktop browser's resized window.",
    },
    {
      // Verifiable on byteandbook.com itself: self-hosted fonts, GA4 loaded
      // after load, mobile CLS measured at 0.000 (Phase 3/3b, Lighthouse).
      question: 'What does "performance-optimized" mean in practice?',
      answer:
        "The site you're reading is an example: fonts are self-hosted instead of loaded from a third party, analytics loads after the page has rendered, and layout shift on mobile is measured at zero. Performance work is measured before and after with real test runs, not assumed.",
    },
    {
      question: 'Can I update the content myself after launch?',
      answer:
        "If you need to edit content regularly, we integrate a content management system (traditional or headless) so you can update text and pages without touching code. If you don't, a static build is faster and has less to maintain, and we'll recommend whichever fits how you'll actually use the site.",
    },
  ],
  'software-development': [
    {
      question: 'Why design the frontend, API, backend and database together?',
      answer:
        'Because they constrain each other. An API designed after the interface tends to mirror one screen instead of the data, and a database designed after the API tends to fight it. Planning all four together avoids the most expensive kind of rework: changing the data model after the application is built on it.',
    },
    {
      question: 'What happens after launch?',
      answer:
        'Software ships into active monitoring, not just deployment: we watch errors and behavior in production, and support continues as part of the same engagement process.',
    },
    {
      question: 'Can you work on an existing codebase?',
      answer: 'Yes. We take over and extend existing projects, as well as building new ones from scratch.',
    },
  ],
  branding: [
    {
      question: 'What do I actually receive?',
      answer:
        'A documented brand system, not a single logo file: the logo and its variations, the typography and color system behind it, and brand guidelines showing how to use them consistently. Files come in every format you need: SVG, PNG and PDF, plus the editable source file (.ai or .fig).',
    },
    {
      // Terms of Service §10 (Change requests) and §11 (Revisions).
      question: 'How many revisions are included?',
      answer:
        "The number of revision rounds is defined in your proposal before work starts. Further rounds are quoted separately, and a change that alters the agreed scope is handled as a change request, so you always know what's included.",
    },
    {
      question: 'Why build from geometry and typography instead of a template?',
      answer:
        "A template mark can be sold to other businesses too, so it can't reliably be distinctive, and it's built around someone else's name. Building from geometry and type gives you a mark designed for your name and use, whose proportions stay consistent from a favicon to a sign.",
    },
  ],
  'ebook-publishing': [
    {
      // Same verified figures as /case-studies/#ebook-design-and-publishing
      // (src/data/anonymizedCaseStudies.ts).
      question: 'What experience do you have with ebooks?',
      answer:
        "We've delivered over 100 ebook projects end to end: cover, interior layout and publishing preparation. At peak, one production run delivered more than 50 books in a single month, and several titles have reached bestseller rankings in their category on Amazon. The anonymized write-up is on our case studies page.",
    },
    {
      question: 'What does "one pipeline" mean for my book?',
      answer:
        "Editing, layout and cover decisions are made with the final published format in mind from the start. Formatting problems (broken layouts, images that don't scale, a cover that fails a store's requirements) get prevented instead of fixed after the fact.",
    },
    {
      // Terms of Service §13 (client-supplied content) and §18 (IP).
      question: 'Do I keep the rights to my book?',
      answer:
        'Yes. Your manuscript is yours, and ownership of the cover and layout work we create for you transfers to you on full payment, unless we agree otherwise in writing.',
    },
    {
      question: 'Which formats and stores do you prepare books for?',
      answer:
        'All the main formats: EPUB, Kindle and print-ready PDF, for all the major stores, including Kindle Direct Publishing, Apple Books and Google Play, and others as needed.',
    },
  ],
  geo: [
    {
      question: 'How is GEO different from SEO?',
      answer:
        "SEO gets a page ranked in a list of links; GEO gets your business correctly understood and cited inside an AI-generated answer. They share foundations (crawlable pages, clear content, structured data), but a site can rank well and still be misdescribed or skipped by ChatGPT or Perplexity if its business information is inconsistent or buried. GEO closes that gap on top of SEO; it doesn't replace it.",
    },
    {
      question: "I already rank on Google. Why am I not showing up in ChatGPT or Perplexity answers?",
      answer:
        'Ranking and being cited are different selection processes. An AI answer is assembled from several sources at once, and models favor information they can extract and cross-check: a clear, consistent description of what you do, structured data that states it explicitly, and mentions of you on other sites. A page can rank on its own strength and still lose that cross-check, for example when your service names differ between your site and your profiles, or the answer is buried in marketing copy.',
    },
    {
      question: 'Can you guarantee that AI tools will recommend my business?',
      answer:
        "No, and nobody can: no one controls how a given model answers a given question. What we control are the structural reasons a business gets misread or skipped: inconsistent entity information, missing or incorrect schema, content that doesn't state answers directly, and AI crawlers being blocked. We fix those and measure whether citations change.",
    },
    {
      question: 'How do you measure GEO results?',
      answer:
        "We fix a set of questions your buyers actually ask, record how ChatGPT, Perplexity, Gemini and Google's AI Overviews answer them before any work starts (whether you're named, how you're described, and which sources get cited), then re-run the same questions on a schedule. That turns \"AI visibility\" into a before-and-after comparison instead of an impression.",
    },
    {
      question: 'What actually changes on my website in a GEO engagement?',
      answer:
        "Typically: Organization, Service and FAQPage schema that states your business facts explicitly; one consistent name and description across your site and linked profiles; robots.txt access for the AI crawlers you want to allow; and key pages restructured so the answer to a buyer's question sits in the first lines, not after the marketing copy.",
    },
  ],
  seo: [
    {
      question: 'How long does SEO take to show results?',
      answer:
        "It depends on the stage. Technical fixes such as redirects, indexing problems and structured data can be picked up by Google within days to a few weeks of being re-crawled. Ranking gains from content and authority usually take months and depend heavily on your site's age and how competitive the search terms are. Anyone promising page-one rankings in weeks is either targeting terms nobody searches for or taking risks with your domain.",
    },
    {
      question: 'What does a technical SEO audit actually check?',
      answer:
        'Whether search engines can crawl and index the site correctly: duplicate URL versions (www and non-www, /index.html), redirect chains, canonical tags, robots.txt and sitemap accuracy, broken links and missing 404 pages, structured-data validity, metadata coverage, and Core Web Vitals (loading speed and layout stability). Every finding comes with the exact page, the fix, and a way to verify it.',
    },
    {
      // Google Search Central, "Do you need an SEO?": "No one can
      // guarantee a #1 ranking on Google."
      // https://developers.google.com/search/docs/fundamentals/do-i-need-seo
      question: 'Do you guarantee first-page rankings?',
      answer:
        "No. Google's own guidance warns that no one can guarantee a ranking, and a guarantee usually signals shortcuts that risk a penalty. We commit to the work, to explaining the reasoning behind it, and to reporting against real Search Console data.",
    },
    {
      // Same verified figures and wording as /case-studies/#seo
      // (src/data/anonymizedCaseStudies.ts).
      question: 'What results have your SEO clients seen?',
      answer:
        "We've worked with more than 20 SEO clients across Europe, the United States and Canada, mostly mid-market businesses and startups. In one representative engagement, a client on a retainer of about $500 a month now sees a measurable return of about $6,000 a month attributed to the SEO work. The full, anonymized write-up is on our case studies page.",
    },
    {
      question: 'How do you approach link building?',
      answer:
        "We use two methods that hold up over time. The first is guest posts on sites that are genuinely relevant to your niche: editorial placements where the article itself adds value to that site's readers, not link farms or paid link networks. The second is broken-link building: we find dead links on authoritative pages in your space and offer your content as the replacement, which fixes a real problem for the site owner. Both are manual and relationship-driven rather than bulk or automated, which keeps the links relevant and durable instead of the kind search engines discount or penalize. Guest-post links use natural anchor text — your brand name or the article title — rather than exact-match keywords.",
    },
  ],
};

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

export const serviceFaqs: Record<string, Faq[]> = {
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

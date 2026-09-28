import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
import { authors } from './data/authors';

// Content Layer API (Astro v5+). Schema enforces SEO fields on every
// service entry at build time — a service page cannot ship without a
// title/description/summary.
const services = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/services' }),
  schema: z.object({
    title: z.string(),
    pillar: z.enum(['Growth', 'Technology', 'Infrastructure', 'Creative']),
    // Phase 1-IA: the public-facing grouping (3 categories) shown in nav,
    // /services/, the homepage, and each service page's breadcrumb.
    // `pillar` stays as the internal 4-way split driving badge/icon color
    // (lib/pillarColors.ts) — unchanged so existing styling isn't touched.
    category: z.enum(['growth-ai-discovery', 'web-brand-publishing', 'infrastructure-automation']),
    summary: z.string().max(160),
    metaDescription: z.string().max(160),
    icon: z.string(),
    animationLevel: z.enum(['1', '2', '3']),
    order: z.number(),
    // Visual-concept flow steps from CLAUDE.md (e.g. SEO: Website ->
    // Crawler -> Index -> ...). Consumed by Phase 7 diagram components.
    flowSteps: z.array(z.string()).optional(),
    // Concrete, non-fabricated capability bullets shown on the service
    // page — descriptive of what the discipline covers, not claims
    // about clients/results that would need verification.
    capabilities: z.array(z.string()).optional(),
  }),
});

// Insights articles: one markdown file per article in
// src/content/insights/, published at /insights/<file-name>/ by
// src/pages/insights/[slug].astro. Only real, reviewed articles go here
// (CLAUDE.md: never fabricate articles).
const insights = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/insights' }),
  schema: z.object({
    title: z.string(),
    description: z.string().max(160),
    publishedDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    // Must exactly match a real person in src/data/authors.ts (build
    // fails otherwise). Omitted means the article is published under
    // the ByteAndBook organization, never a generic placeholder name.
    author: z
      .string()
      .refine((name) => authors.some((a) => a.name === name), {
        message: 'author must match a name in src/data/authors.ts',
      })
      .optional(),
    category: z.enum(['Growth', 'Technology', 'Infrastructure', 'Creative', 'GEO & AI Search']),
    relatedServices: z.array(z.string()).optional(),
    tags: z.array(z.string()).optional(),
    canonical: z.string().optional(),
    featured: z.boolean().default(false),
    // Draft articles never render on /insights/ or get a route — see
    // insights/[slug].astro's getStaticPaths filter.
    draft: z.boolean().default(false),
    sources: z.array(z.object({ label: z.string(), url: z.string() })).optional(),
    // Phase 4: the primary query this article targets. Not rendered;
    // used for QA/reporting (one article per target keyword).
    targetKeyword: z.string().optional(),
    // Optional visible FAQ section, also emitted as FAQPage schema.
    faqs: z.array(z.object({ question: z.string(), answer: z.string() })).optional(),
  }),
});

export const collections = { services, insights };

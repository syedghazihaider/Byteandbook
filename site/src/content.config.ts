import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Content Layer API (Astro v5+). Schema enforces SEO fields on every
// service entry at build time — a service page cannot ship without a
// title/description/summary.
const services = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/services' }),
  schema: z.object({
    title: z.string(),
    pillar: z.enum(['Growth', 'Technology', 'Infrastructure', 'Creative']),
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

// V2-7: article architecture for the future Insights hub. No entries
// exist yet — src/content/insights/ is deliberately empty (not even a
// placeholder file), and there is deliberately no /insights/<slug>/
// route yet either, per CLAUDE.md's rule against fabricating articles
// or routes. The schema is ready so publishing a real, reviewed
// article later just means adding one markdown file plus a small
// getStaticPaths route — no schema/collection changes needed then.
const insights = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/insights' }),
  schema: z.object({
    title: z.string(),
    description: z.string().max(160),
    publishedDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    // Only ever set to a real, verified author — omitted (not a
    // fallback "ByteAndBook Team" placeholder) when unset.
    author: z.string().optional(),
    category: z.enum(['Growth', 'Technology', 'Infrastructure', 'Creative', 'GEO & AI Search']),
    relatedServices: z.array(z.string()).optional(),
    tags: z.array(z.string()).optional(),
    canonical: z.string().optional(),
    featured: z.boolean().default(false),
    // Draft articles never render on /insights/ or get a route — see
    // insights/[slug].astro's getStaticPaths filter.
    draft: z.boolean().default(false),
    sources: z.array(z.object({ label: z.string(), url: z.string() })).optional(),
  }),
});

export const collections = { services, insights };

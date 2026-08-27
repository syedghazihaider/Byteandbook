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
  }),
});

export const collections = { services };

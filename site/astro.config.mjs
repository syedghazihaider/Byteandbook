import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

// Placeholder until the domain goes live on this build — required for
// correct canonical URLs and sitemap generation (Phase 9 / SEO).
const SITE_URL = 'https://byteandbook.com';

export default defineConfig({
  site: SITE_URL,
  integrations: [sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
});

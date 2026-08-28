import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Placeholder until the domain goes live on this build — required for
// correct canonical URLs and sitemap generation (Phase 9 / SEO).
const SITE_URL = 'https://byteandbook.com';

// Tailwind is intentionally NOT wired in here as a Vite/Astro
// integration. Three different approaches (the @tailwindcss/vite
// plugin, @tailwindcss/postcss, and the official v3 @astrojs/tailwind
// integration) all produced a completely empty compiled stylesheet
// specifically in `astro build` production output on this toolchain —
// isolating the bug to Astro/Vite's build-time CSS asset emission in
// this environment, not to Tailwind itself. CSS is compiled separately
// by the standalone Tailwind CLI (see package.json's "css:build"
// script) into public/styles.css and linked as a plain stylesheet in
// BaseLayout.astro, bypassing Vite's CSS pipeline entirely.
export default defineConfig({
  site: SITE_URL,
  integrations: [sitemap()],
});

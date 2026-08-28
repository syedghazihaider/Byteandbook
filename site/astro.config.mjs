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
  integrations: [
    sitemap({
      // Internal design-system reference page and V2-1 route
      // placeholders whose real content is still scoped to later V2
      // phases (work/insights — V2-5/V2-7) are kept out of the sitemap,
      // matching their noindex meta tag. /checkout/ stays excluded too:
      // it's a payment workflow page for people who already have an
      // order reference, not a search landing page — see the V2-4
      // report for why forcing it into the sitemap wouldn't help
      // anyone. /terms/, /privacy/, and /refund-policy/ got real
      // published content in V2-4 and are indexable like any other
      // professional-site legal page, so they're no longer excluded
      // here. The 404 page is already excluded automatically by
      // Astro/the sitemap integration and isn't a real content route.
      filter: (page) =>
        !page.includes('/style-guide/') &&
        !page.includes('/checkout/') &&
        !page.includes('/work/') &&
        !page.includes('/insights/'),
    }),
  ],
});

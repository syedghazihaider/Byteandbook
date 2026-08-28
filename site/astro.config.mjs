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
      // Internal design-system reference page is kept out of the
      // sitemap, matching its noindex meta tag. /checkout/ stays
      // excluded too: it's a payment workflow page for people who
      // already have an order reference, not a search landing page —
      // see the V2-4 report for why forcing it into the sitemap
      // wouldn't help anyone. /terms/, /privacy/, /refund-policy/
      // (V2-4), /work/ (V2-5), and /insights/ (V2-7) all got real,
      // substantial, permanent content independent of article/case-
      // study count and are indexable like any other professional-site
      // page, so none of them are excluded here. The 404 page is
      // already excluded automatically by Astro/the sitemap
      // integration and isn't a real content route.
      filter: (page) =>
        !page.includes('/style-guide/') &&
        !page.includes('/checkout/'),
    }),
  ],
});

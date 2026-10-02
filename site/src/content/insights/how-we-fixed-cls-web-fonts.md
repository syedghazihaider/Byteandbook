---
title: "How We Took Our Own Site's Layout Shift From 0.100 to 0.000"
description: "A measured case study: the web-font swap that caused our layout shift, the size-matched fallback CSS that fixed it, and what we could not verify."
publishedDate: 2026-10-02
category: "Technology"
relatedServices: ["web-development", "seo"]
tags: ["core-web-vitals", "cls", "web-fonts", "performance"]
targetKeyword: "core web vitals cumulative layout shift"
sources:
  - label: "web.dev: Cumulative Layout Shift (CLS)"
    url: "https://web.dev/articles/cls"
  - label: "web.dev: Optimize Cumulative Layout Shift"
    url: "https://web.dev/articles/optimize-cls"
  - label: "Chrome for Developers: Improved font fallbacks (Katie Hempenius)"
    url: "https://developer.chrome.com/blog/font-fallbacks"
  - label: "DebugBear: Fixing Layout Shifts Caused by Web Fonts"
    url: "https://www.debugbear.com/blog/web-font-layout-shift"
faqs:
  - question: "What is a good CLS score?"
    answer: "Google's guidance on web.dev is 0.1 or less, measured at the 75th percentile of page loads across mobile and desktop. Values above 0.25 are rated poor. Our homepage sat at 0.100, exactly on the edge, before the fix described here."
  - question: "Does self-hosting fonts fix layout shift by itself?"
    answer: "No, in our case it did not. Moving Inter and Sora from Google Fonts to our own server made first paint about a third faster, but the homepage layout shift stayed at 0.099 before and 0.100 after. The shift comes from the browser swapping a differently sized fallback font for the web font, wherever the web font is hosted."
  - question: "Do I need a tool to compute the fallback values?"
    answer: "Not strictly. The size-adjust, ascent-override, descent-override and line-gap-override values can be calculated from the font files, and frameworks such as Next.js (next/font) and Nuxt (fontaine) generate them automatically. We computed ours from our exact font files because we build with Astro, without a framework plugin for this."
  - question: "Is a lab score of 0.000 the same as what real visitors see?"
    answer: "No. Our numbers come from repeated Lighthouse runs on mobile settings, not from real-visitor data. Google's field data for a site appears in Search Console's Core Web Vitals report only after enough real traffic has accumulated, so treat lab results as strong evidence of a fix rather than proof of the field score."
draft: false
---

Our own homepage had a Cumulative Layout Shift (CLS) of 0.100, which is exactly the line Google draws between "good" and "needs improvement." After one change to our CSS it measured 0.000 in five of five live test runs, on the homepage and on a service page. This article shows what caused the shift, the exact CSS that fixed it, and what the fix does not prove.

Most guides on this topic explain the technique and the CSS descriptors, and some, like DebugBear's walkthrough, hand the final step back to the reader with an "exercise for the reader" section. Here you get the calculated values from a real production site, with before and after measurements.

## What CLS measures, and the threshold that matters

Cumulative Layout Shift scores how much visible content moves unexpectedly while a page loads. Google's web.dev documentation says sites should aim for a CLS of 0.1 or less, measured at the 75th percentile of page loads and segmented across mobile and desktop. Values above 0.25 are rated poor.

A layout shift score is the product of two fractions: how much of the viewport the moving element affects, and how far it moves. web.dev's own example works it out: an element affecting 75% of the viewport that moves by 25% of the viewport height scores 0.75 × 0.25 = 0.1875. That is why one large headline shifting a little can cost more than a small icon shifting a lot.

## Our starting point

Before the fix, mobile Lighthouse runs (median of five) gave these layout shift scores:

| Page | CLS before |
|---|---|
| Homepage | 0.100 |
| A service page (SEO) | 0.017 |

The homepage was passing by the narrowest possible margin, and a trace of the live page showed where the shift came from: the headline. The swap from the fallback font to the Sora web font on the homepage H1 alone accounted for 0.082 of the score, and a paragraph below it added another 0.018.

## Step one did not fix it: self-hosting the fonts

We had already moved Inter and Sora from Google Fonts to our own server. That was worthwhile: it removed a render-blocking request, and first paint on the live site improved by about a third on both pages we measured. But the layout shift did not move:

| Page | CLS with Google Fonts | CLS self-hosted |
|---|---|---|
| Homepage | 0.099 | 0.100 |
| A service page (SEO) | 0.017 | 0.017 |

This is the common misconception. Layout shift from fonts is not caused by where the font file lives. It happens because the browser draws text in a fallback font first, then redraws it in the web font when it arrives. If the two fonts occupy different amounts of space, everything below the text jumps.

## Why the fallback was the problem

We use `font-display: swap`, which shows text immediately in a fallback and swaps when the web font loads. That is the right choice for readability and for first paint, but it makes the swap visible, so the fallback has to be the same size as the web font to avoid a shift.

Our headline font, Sora, is noticeably wider than the system fallback. On a phone, we measured the same headline rendering as three lines in the web font and as two lines, at a smaller height, in the default fallback:

| Element (phone width) | Web font | Old fallback | New fallback |
|---|---|---|---|
| H1 | 143.3 px, 3 lines | 95.6 px, 2 lines | 143.3 px, 3 lines |
| Badge | 46 px, 2 lines | 30 px, 1 line | 46 px, 2 lines |
| Paragraph | 72 px, 3 lines | 72 px, 3 lines | 72 px, 3 lines |

A headline that grows by almost 48 pixels when the font swaps is consistent with the 0.082 we saw on the live page, since everything below it is pushed down.

## The fix: a fallback that occupies the same box

CSS lets you define a fallback face from a locally installed font and adjust its metrics so it takes the same space as the web font. Chrome's documentation describes the four descriptors involved: `size-adjust` scales the glyphs, and `ascent-override`, `descent-override` and `line-gap-override` adjust vertical spacing. web.dev's guide on optimizing CLS recommends exactly this approach for web fonts.

This is the CSS we shipped for the headline font, Sora, in regular and bold:

```css
@font-face {
  font-family: 'Sora Fallback';
  font-style: normal;
  font-weight: 400;
  src: local('Arial'), local('ArialMT'), local('Liberation Sans'), local('Arimo');
  size-adjust: 113.88%;
  ascent-override: 85.18%;
  descent-override: 25.47%;
  line-gap-override: 0%;
}

@font-face {
  font-family: 'Sora Fallback';
  font-style: normal;
  font-weight: 700;
  src: local('Arial Bold'), local('Arial-BoldMT'), local('Liberation Sans Bold'), local('Arimo Bold');
  size-adjust: 107.38%;
  ascent-override: 90.34%;
  descent-override: 27.01%;
  line-gap-override: 0%;
}

:root {
  --bb-font-display: 'Sora', 'Sora Fallback', system-ui, sans-serif;
}
```

The body font, Inter, has an equivalent pair of rules with its own values (107.34% and 101.99% size adjustment for regular and bold). A few details that matter:

- **Separate regular and bold faces.** If you define only one weight, the browser fakes bold by smearing the regular glyphs, which changes the widths again. Separate faces let bold text use real Arial Bold.
- **Arial-compatible alternatives.** `Liberation Sans` and `Arimo` are metric-compatible with Arial, so Linux and ChromeOS devices get the same result.
- **Values computed from the exact files.** We calculated the numbers with the Python library fontTools from the two woff2 files we ship, comparing letter-frequency-weighted average character widths against Arial. That is the same method Chrome's article describes and that tools such as next/font use. If the font files ever change, the values must be recalculated.

The font stack lists the web font first, then the matched fallback, then generic system fonts. Until Sora arrives, the headline is drawn in scaled Arial; when Sora arrives, nothing moves.

## The results

With a throttled network that forced the swap to happen late, layout shift in local testing went from 0.020 to 0.000 in four of four runs. That locally measured number was small because the large Sora shift (0.082 on the live site) never reproduced on our fast local connection, so the live numbers were the real test.

After deploying, five live mobile Lighthouse runs per page gave:

| Page | CLS before | CLS after |
|---|---|---|
| Homepage | 0.100 | 0.000 (5 of 5 runs) |
| A service page (SEO) | 0.017 | 0.000 (5 of 5 runs) |

The same release also improved the Lighthouse performance score and largest contentful paint on both pages, but it did not improve Total Blocking Time on the homepage, which got worse. Fixing layout shift does not fix everything, and we say so rather than reporting only the good number.

## Do you need to write this by hand?

Not necessarily. Chrome's font-fallback article lists tools that generate the values for you: Next.js's `next/font` applies font metric overrides and `size-adjust` automatically, and the Nuxt module `fontaine` generates and inserts matching fallbacks into your stylesheets. If you use one of those frameworks, use the built-in option first.

We hand-wrote ours because our site is built with Astro and the standalone Tailwind CLI, without a plugin that does this, and because computing the values from the exact font files left us with numbers we could verify. The trade-off is maintenance: if you ever change the font files, the numbers must be recalculated, so we left a comment in the stylesheet saying so.

Chrome's article also describes two levels of effort. Using the metric overrides on their own is the simpler approach and is typically enough to noticeably reduce the shift; adding `size-adjust` makes the match tighter. We shipped all four descriptors; we did not test the overrides-only variant separately.

One more rule from web.dev's guide is easy to miss: always declare a generic fallback in the font stack. Without it, Chrome's default is Times, a serif font that is a much worse match than the default sans-serif.

## What this does not prove

Three limits are worth stating plainly:

1. **These are lab results.** They come from repeated Lighthouse runs, not from real visitors. Search Console's Core Web Vitals report only shows field data after enough real traffic has accumulated, usually about a month.
2. **Android phones may not benefit.** Our fallback relies on Arial or an Arial-compatible font being installed. Android devices generally do not ship Arial, so they may skip the matched fallback and still show some swap shift. We have not measured real Android hardware.
3. **It only fixes shifts caused by fonts.** Images without dimensions, late-inserted banners and ads are separate causes with separate fixes, and web.dev's CLS guide covers them.

## A short method you can reuse

1. Run Lighthouse (or a real-user tool) and open the layout-shift entries to find which element moved.
2. If it is text, confirm a font swap is the cause by comparing the element's height with the web font and with the fallback, as in the table above.
3. Build a local-font fallback with `size-adjust`, `ascent-override`, `descent-override` and `line-gap-override`, with separate regular and bold faces.
4. Add the fallback second in your font stack, after the web font.
5. Re-measure several times. Lab scores vary from run to run, so use the median, not one result.

If you would rather have this handled as part of a build, it falls under our [web development](/services/web-development/) work, and the measurement side overlaps with [technical SEO](/services/seo/).

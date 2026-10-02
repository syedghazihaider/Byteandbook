---
title: "What to Put in Brand Guidelines: A One-Page Minimum With a Worked Example"
description: "A one-page brand guidelines minimum for small businesses, with real colour-contrast ratios and a type system you can copy, plus the checks most templates skip."
publishedDate: 2026-10-02
category: "Creative"
relatedServices: ["branding", "web-development"]
tags: ["brand-guidelines", "branding", "accessibility", "design-system"]
targetKeyword: "brand guidelines"
sources:
  - label: "Bynder: Brand guidelines, what they are, how to create them and examples"
    url: "https://www.bynder.com/en/glossary/brand-guidelines-definition/"
  - label: "W3C: Understanding Success Criterion 1.4.3, Contrast (Minimum)"
    url: "https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html"
  - label: "W3C: Web Content Accessibility Guidelines (WCAG) 2.2"
    url: "https://www.w3.org/TR/WCAG22/"
faqs:
  - question: "What is the minimum a small business needs in brand guidelines?"
    answer: "One page covering four things: how the logo may and may not be used, the colours with exact codes and which pairs are safe for text, the fonts with weights and sizes, and a short description of the voice. Longer documents covering imagery, templates and digital product rules matter once several people or agencies produce material for you."
  - question: "What contrast ratio should brand colours meet?"
    answer: "The W3C's WCAG 2.2 standard requires a contrast ratio of at least 4.5:1 for normal text and at least 3:1 for large text. Large text means 18 point, or 14 point bold. Checking this when you choose the palette is far cheaper than discovering it later when a button or link fails an accessibility audit."
  - question: "Should brand guidelines be a PDF or live on a web page?"
    answer: "Whichever your team will actually open. A web page or a shared document can be updated in one place, while a PDF goes stale the moment a colour changes. If your website is built from design tokens, the tokens in code are the most reliable source of truth, and the guidelines can point to them."
  - question: "Do brand guidelines need rules for AI tools?"
    answer: "They can. Some current guides, including Bynder's, now list rules for how generative tools may be used to create on-brand content, such as review steps and human approval. For a small business, a single sentence saying who signs off on anything AI-generated before it is published is enough to start."
draft: false
---

Most small businesses need one page, not a forty-page brand book. That page should cover the logo rules, the colours with exact codes and which combinations are safe for text, the typefaces with weights and sizes, and a few lines on voice. Anything longer pays off only when several people or agencies are producing material for you.

Generic checklists tell you which sections to include. Bynder's guide, for example, lists ten elements: company information, logo, colour palette, typography, imagery, tone and voice, cards and letterheads, digital and product usage, accessibility standards, and AI usage rules. What they rarely show is what a finished, tested entry looks like. This article gives you a worked example from our own website, including measured contrast ratios, and a template you can copy.

## What the example covers, and what it does not

The two parts of our visual system that live in public code, and so can be checked by anyone, are colour and typography. That is what the example below uses. Logo clear-space rules and voice guidelines depend on a brand's own decisions and are better written from scratch, so we describe how to approach those in the template instead of inventing examples.

## Colour: record the pairs, not just the swatches

A palette page that lists hex codes is half a palette. The useful half is which text colour is allowed on which background. The W3C's contrast criterion (WCAG 2.2, success criterion 1.4.3) requires a contrast ratio of at least 4.5:1 for normal text and 3:1 for large text, where large means 18 point or 14 point bold.

Our site uses a dark background (`#08090c`) and a small set of text and accent tones. We calculated each pair with the WCAG relative-luminance formula:

| Colour (role) | Hex | Contrast on `#08090c` | Normal text (4.5:1)? |
|---|---|---|---|
| Ink 50 (headings, primary text) | `#f5f6f9` | 18.42:1 | Pass |
| Ink 200 (secondary text) | `#b6bccb` | 10.47:1 | Pass |
| Ink 300 (muted text) | `#868da3` | 6.02:1 | Pass |
| Signal 300 (link hover) | `#94aff9` | 9.25:1 | Pass |
| Signal 400 (links) | `#6088f5` | 6.01:1 | Pass |
| Signal 500 (primary button fill) | `#3866f0` | 4.10:1 | Fail as text |
| Ink 400 | `#5b6178` | 3.25:1 | Fail (large text and UI only) |

Two lessons are in that table. First, the brand's primary blue (Signal 500) is a fill colour, not a text colour: on the dark background it falls short of 4.5:1, so links use the lighter Signal 400 instead. Second, a palette needs to say so. Without a note such as "Signal 500 is for fills only," the next designer will use it for text.

### A real catch while writing this

While preparing this article we checked our own button. The primary button used near-white text (`#f5f6f9`) on the Signal 500 fill, which measures 4.49:1, a hair under the 4.5:1 requirement for normal-sized text (the buttons use small semibold text, which does not count as large). We changed the button text to white, which measures 4.85:1, and the hover fill to the darker Signal 600, which gives white text 6.83:1. A one-point difference like that is invisible to the eye, which is exactly why it has to be measured.

## Typography: weights, roles and a fallback

Our system uses two families, each with a clear job: Sora for headings and Inter for body text, both self-hosted. The weights actually used are 400, 500, 600 and 700. Listing the used weights, rather than "all weights," matters because every extra weight is a font file or a larger variable file to download.

A guidelines page should also say what happens before the font loads. We define a metric-matched fallback for each family so text does not jump when the web font arrives; the technique and our measurements are in [how we took our own site's layout shift from 0.100 to 0.000](/insights/how-we-fixed-cls-web-fonts/).

The type scale is also written down as tokens, with sizes that grow smoothly with the screen width instead of jumping at breakpoints. For example, our base size runs from 1rem to about 1.06rem and our largest display size from 3.25rem to 5rem, using CSS `clamp()`. You do not need that level of detail on day one, but you do need the minimum and maximum sizes for body text and headings written down.

## Logo and voice: what to decide even without a worked example

Two sections of the template depend on decisions only you can make, but both have a clear standard of completeness.

**Logo.** Bynder's guide describes the essentials as approved variations, minimum sizes, clear-space rules and explicit do's and don'ts, and notes the logo should remain identifiable in black and white. The black-and-white test is a practical one: if the mark only works in full colour, it will fail on a fax-style receipt, a single-colour embroidery job or a stamp. Decide the minimum size by trying the real smallest use you have, such as a browser tab icon or an email signature, and write down the number you find readable.

**Voice.** The same guide recommends defining a stable voice and describing how tone adapts by context, with examples of on-brand and off-brand phrasing. The examples do the work: "friendly" means different things to different writers, but two real sentences, one on-brand and one off-brand, end the argument. Draw them from your own existing copy so they reflect how you actually write, and include a "never claim" line for anything you cannot document, such as results, awards or testimonials.

These two sections are also where an outside designer or writer adds the most. Picking a colour is a few minutes; deciding what the mark must survive, and what the voice refuses to say, is the part worth paying for.

## Tokens: make the rules enforceable

The most durable move is to name colours by role and store them once. In our stylesheet, "muted text" is defined as a reference to one specific ink tone, so changing it in one place updates every page. A role-based name carries the usage rule with it. "Muted text" tells a developer where it belongs; a raw hex code does not.

If your brand lives in a website, put the tokens in code and let the guidelines page point to them. That keeps the document from drifting out of date.

## A one-page template you can copy

Copy this into a document and fill in each line. Anything you cannot fill in yet is a decision still to be made.

**1. Logo**
- Approved versions: full colour, one colour, reversed (for dark backgrounds).
- Minimum size: ___ px on screen, ___ mm in print.
- Clear space: the space kept empty around the logo, measured in a unit taken from the logo itself.
- Never: stretch, recolour, add effects, place on a busy image.

**2. Colour**
- Primary, secondary and accent: name, role, HEX (and CMYK if you print).
- For each text colour: the background it may sit on and its measured contrast ratio.
- Fill-only colours: list any that fail 4.5:1 as text.

**3. Typography**
- Heading family and body family, with the weights you use.
- Size range for body text and for headings, minimum and maximum.
- Fallback fonts for when the web font has not loaded.

**4. Voice**
- Three words that describe how you write, each with one "we say this / we do not say this" example from your real copy.
- What you never claim. For a business that should include any figure, testimonial or result you cannot document.

**5. Ownership**
- Who approves new material, including anything produced with AI tools.
- Where the master files and tokens live.

## When to go beyond one page

Add sections for imagery, templates and digital product rules when more than one person produces material, when agencies join, or when you have several products to keep consistent. Until then, a short page that is tested and kept current is more useful than a long one nobody opens.

If you would like the system designed and documented for you, that is part of our [branding and logo design](/services/branding/) service, and the tokens can be implemented directly in your site through [web development](/services/web-development/).

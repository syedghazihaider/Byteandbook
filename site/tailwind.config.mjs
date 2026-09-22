/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        ink: {
          950: 'var(--bb-ink-950)',
          900: 'var(--bb-ink-900)',
          800: 'var(--bb-ink-800)',
          700: 'var(--bb-ink-700)',
          600: 'var(--bb-ink-600)',
          500: 'var(--bb-ink-500)',
          400: 'var(--bb-ink-400)',
          300: 'var(--bb-ink-300)',
          200: 'var(--bb-ink-200)',
          100: 'var(--bb-ink-100)',
          50: 'var(--bb-ink-50)',
        },
        signal: {
          700: 'var(--bb-signal-700)',
          600: 'var(--bb-signal-600)',
          // V2-6 fix: rgb(<channels> / <alpha-value>) instead of a plain
          // var() so `bg-signal-500/NN`-style opacity modifiers actually
          // compile — see global.css's --bb-signal-500-rgb comment for
          // why. <alpha-value> defaults to 1 when no modifier is given,
          // so this renders identically to the old plain-var() form for
          // every existing non-opacity usage (bg-signal-500, etc.).
          500: 'rgb(var(--bb-signal-500-rgb) / <alpha-value>)',
          400: 'var(--bb-signal-400)',
          300: 'var(--bb-signal-300)',
        },
        ember: {
          600: 'var(--bb-ember-600)',
          500: 'rgb(var(--bb-ember-500-rgb) / <alpha-value>)',
          400: 'var(--bb-ember-400)',
        },
        // V2-6 pillar accent families — see global.css's :root comment
        // for what each maps to and why. Creative-pillar services reuse
        // `ember` above rather than adding a fourth family.
        growth: {
          500: 'rgb(var(--bb-growth-500-rgb) / <alpha-value>)',
          400: 'var(--bb-growth-400)',
        },
        tech: {
          500: 'rgb(var(--bb-tech-500-rgb) / <alpha-value>)',
          400: 'var(--bb-tech-400)',
        },
        infra: {
          500: 'rgb(var(--bb-infra-500-rgb) / <alpha-value>)',
          400: 'var(--bb-infra-400)',
        },
      },
      fontFamily: {
        display: 'var(--bb-font-display)',
        body: 'var(--bb-font-body)',
      },
      // Phase 1-IA: semantic roles over the fluid clamp() scale already
      // defined in global.css's :root (previously computed but never
      // wired to a utility class). Maps a small, meaningful set of names
      // — not every raw size — to how they're actually used: `display`
      // (hero H1), `page-title` (H1 on every other page), `section-title`
      // (H2 inside SectionHeading), `body` (paragraph text), `caption`
      // (small/eyebrow text). Existing fixed-size text-* utilities keep
      // working unchanged; these are additive.
      fontSize: {
        display: ['var(--bb-text-5xl)', { lineHeight: '1.05' }],
        'page-title': ['var(--bb-text-4xl)', { lineHeight: '1.1' }],
        'section-title': ['var(--bb-text-3xl)', { lineHeight: '1.15' }],
        body: ['var(--bb-text-base)', { lineHeight: '1.6' }],
        caption: ['var(--bb-text-xs)', { lineHeight: '1.4' }],
      },
      borderRadius: {
        'bb-sm': 'var(--bb-radius-sm)',
        'bb-md': 'var(--bb-radius-md)',
        'bb-lg': 'var(--bb-radius-lg)',
      },
    },
  },
  plugins: [],
};

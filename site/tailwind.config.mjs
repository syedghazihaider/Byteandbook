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
          500: 'var(--bb-signal-500)',
          400: 'var(--bb-signal-400)',
          300: 'var(--bb-signal-300)',
        },
        ember: {
          600: 'var(--bb-ember-600)',
          500: 'var(--bb-ember-500)',
          400: 'var(--bb-ember-400)',
        },
      },
      fontFamily: {
        display: 'var(--bb-font-display)',
        body: 'var(--bb-font-body)',
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

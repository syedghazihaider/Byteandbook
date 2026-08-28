// V2-6: single source of truth for pillar-based color identity (see
// global.css's :root comment for what each token maps to and why).
// Written as literal string maps — not built dynamically from the
// pillar name — because the Tailwind CLI content scanner needs each
// class name to appear as real text somewhere under src/ to generate
// it; a template-interpolated class name (`text-${x}-400`) would
// silently never be produced by the build. Import this module (rather
// than redefining the maps per page) so every page stays in sync.
export type Pillar = 'Growth' | 'Technology' | 'Infrastructure' | 'Creative';

/** CSS custom-property name, for the NodeGraph3D/DataEcosystem3D
 *  `accentVar` prop. */
export const pillarAccentVar: Record<Pillar, string> = {
  Growth: '--bb-growth-500',
  Technology: '--bb-tech-500',
  Infrastructure: '--bb-infra-500',
  Creative: '--bb-ember-500',
};

export const pillarBadgeClass: Record<Pillar, string> = {
  Growth: 'text-growth-400',
  Technology: 'text-tech-400',
  Infrastructure: 'text-infra-400',
  Creative: 'text-ember-400',
};

export const pillarDotClass: Record<Pillar, string> = {
  Growth: 'bg-growth-400',
  Technology: 'bg-tech-400',
  Infrastructure: 'bg-infra-400',
  Creative: 'bg-ember-400',
};

export const pillarIconBgClass: Record<Pillar, string> = {
  Growth: 'bg-growth-500/10 text-growth-400',
  Technology: 'bg-tech-500/10 text-tech-400',
  Infrastructure: 'bg-infra-500/10 text-infra-400',
  Creative: 'bg-ember-500/10 text-ember-400',
};

// V2-5 / Phase 3 job 1: central config for verified external profile/
// review-platform URLs. Anything reading this config (Organization
// schema's `sameAs`, Footer social links) must render nothing for a
// null entry — never a placeholder or "#" link. GitHub, Clutch, and
// Trustpilot stay null — no confirmed ByteAndBook presence on those yet.
// Instagram, X, Facebook, and LinkedIn are real, verified, active
// company accounts (confirmed 2026-09-22) — the LinkedIn URL is the
// public company page, not the /admin/dashboard/ link, which requires
// login and would be broken for visitors.
export interface SiteSocial {
  linkedin: string | null;
  instagram: string | null;
  x: string | null;
  facebook: string | null;
  github: string | null;
  clutch: string | null;
  trustpilot: string | null;
}

export const SITE_SOCIAL: SiteSocial = {
  linkedin: 'https://www.linkedin.com/company/144809939/',
  instagram: 'https://www.instagram.com/bytenbook/',
  x: 'https://x.com/ByteandBook',
  facebook: 'https://www.facebook.com/profile.php?id=61594200381025',
  github: null,
  clutch: null,
  trustpilot: null,
};

/** Non-null, verified URLs only — the safe list for sameAs/social UI. */
export const verifiedSocialUrls = (): string[] =>
  Object.values(SITE_SOCIAL).filter((url): url is string => typeof url === 'string' && url.length > 0);

// WhatsApp business line (click-to-chat). Digits only in the URL, no
// plus/spaces/dashes, per wa.me format. This is deliberately a WhatsApp
// link, not a tel: link: the site publishes no voice-call number.
export const WHATSAPP = {
  display: '+1 (585) 683-4300',
  url: 'https://wa.me/15856834300',
} as const;

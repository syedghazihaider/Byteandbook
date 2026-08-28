// V2-5: central config for verified external profile/review-platform
// URLs. Every field starts null — ByteAndBook has no confirmed LinkedIn,
// GitHub, Clutch, or Trustpilot presence yet. Anything reading this
// config (Organization schema's `sameAs`, Footer social links) must
// render nothing for a null entry — never a placeholder or "#" link.
// Fill in a real, verified URL here and it propagates automatically.
export interface SiteSocial {
  linkedin: string | null;
  github: string | null;
  clutch: string | null;
  trustpilot: string | null;
}

export const SITE_SOCIAL: SiteSocial = {
  linkedin: null,
  github: null,
  clutch: null,
  trustpilot: null,
};

/** Non-null, verified URLs only — the safe list for sameAs/social UI. */
export const verifiedSocialUrls = (): string[] =>
  Object.values(SITE_SOCIAL).filter((url): url is string => typeof url === 'string' && url.length > 0);

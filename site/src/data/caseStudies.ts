// V2-5: reusable data structure for future verified case studies. The
// array is intentionally empty — no case study has client authorization
// to publish yet (see CLAUDE.md's content-integrity rule: never
// fabricate clients, results, or metrics). /work/ and CaseStudyCard.astro
// both handle an empty array gracefully. Add an entry here, with
// permissionConfirmed explicitly set once real written authorization
// exists, and it will render automatically — no other code changes
// needed.
export interface CaseStudy {
  slug: string;
  clientName: string;
  clientUrl?: string;
  industry: string;
  services: string[];
  challenge: string;
  solution: string;
  technologies?: string[];
  metrics?: {
    label: string;
    value: string;
    evidence?: string;
  }[];
  testimonial?: {
    quote: string;
    person: string;
    role?: string;
    company?: string;
    sourceUrl?: string;
  };
  logo?: string;
  screenshots?: string[];
  liveUrl?: string;
  verificationUrl?: string;
  permissionConfirmed: true;
}

export const caseStudies: CaseStudy[] = [];

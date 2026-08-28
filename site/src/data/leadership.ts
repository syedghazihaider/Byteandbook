// V2-5: reusable data structure for future verified leadership profiles
// and certifications. Both arrays are intentionally empty — no team
// member details or certifications have been approved for public
// display yet (see CLAUDE.md: never publish unverified team/credential
// claims). about.astro and LeadershipCard.astro both handle empty
// arrays gracefully — populate an entry once real, approved details
// exist and it renders automatically.
export interface Certification {
  name: string;
  issuer: string;
  holder: string;
  issueDate: string;
  expiryDate?: string;
  credentialUrl?: string;
  credentialId?: string;
}

export interface LeadershipProfile {
  slug: string;
  fullName: string;
  role: string;
  bio: string;
  linkedinUrl?: string;
  githubUrl?: string;
  professionalProfileUrl?: string;
  certifications?: Certification[];
  expertiseAreas?: string[];
  photo?: string;
  verified: true;
}

export const leadershipProfiles: LeadershipProfile[] = [];

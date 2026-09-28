// Phase 4: bylines for Insights articles. An article's `author`
// frontmatter must match a `name` here exactly, or the build fails
// (content.config.ts). Only real people, with details the business has
// approved for publication (CLAUDE.md: never fabricate team members).
// Deliberately separate from leadership.ts, which renders leadership
// profiles on /about/.
export interface Author {
  name: string;
  role: string;
  bio: string;
  profileUrl?: string;
}

export const authors: Author[] = [
  {
    name: 'Elizabeth Luna',
    role: 'Sales Manager',
    bio: 'Sales Manager at ByteAndBook.',
  },
];

export const authorByName = (name: string | undefined) => authors.find((a) => a.name === name);

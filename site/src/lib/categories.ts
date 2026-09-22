// Phase 1-IA: the three public service categories that replace the old
// 4-pillar / 11-card flat structure in nav, /services/, the homepage, and
// each service page's breadcrumb. `pillar` (see pillarColors.ts) stays the
// internal styling split — unchanged. This file is the single source of
// truth for category copy and routing so nav, the services index, the
// category pages, and service-page breadcrumbs never drift from each other.
import { pillarBadgeClass, pillarIconBgClass, pillarDotClass, pillarAccentVar } from './pillarColors';

export type CategorySlug = 'growth-ai-discovery' | 'web-brand-publishing' | 'infrastructure-automation';

export interface CategoryMeta {
  slug: CategorySlug;
  path: string;
  navLabel: string;
  heading: string;
  eyebrow: string;
  /** Buyer-focused one-liner, shown under the heading. */
  promise: string;
  /** Short label used on the /services/ selector. */
  selectorLabel: string;
  selectorHint: string;
  whoFor: string[];
  howWeWork: { title: string; description: string }[];
  serviceIds: string[];
  badgeClass: string;
  iconBgClass: string;
  dotClass: string;
  /** CSS custom-property name for this category's pillar accent (see
   *  pillarColors.ts's pillarAccentVar map) — Phase 2's hero scene reads
   *  this to color each category's 3D marker with its real pillar color. */
  accentVar: string;
}

export const CATEGORIES: CategoryMeta[] = [
  {
    slug: 'growth-ai-discovery',
    path: '/services/growth-ai-discovery/',
    navLabel: 'Growth & AI Discovery',
    heading: 'Growth & AI Discovery',
    eyebrow: 'Growth & AI Discovery',
    promise: 'Get found by customers on Google and by the AI tools they now search with, then turn that traffic into leads.',
    selectorLabel: 'Get Discovered Online',
    selectorHint: 'Marketing, SEO, GEO, and social media',
    whoFor: [
      'You rely on referrals and want a repeatable way to bring in new customers',
      'Your site ranks poorly, or you are not sure how AI search tools describe your business',
      'You post on social media but cannot tell what it is actually generating',
    ],
    howWeWork: [
      { title: 'Research', description: 'We look at your audience, your current traffic, and how AI and search engines currently understand your business.' },
      { title: 'Plan', description: 'We pick the channels and content that fit your budget and timeline, not a generic package.' },
      { title: 'Build & Launch', description: 'Campaigns, landing pages, content, and structured data go live on an agreed schedule.' },
      { title: 'Track & Improve', description: 'We report what is working in plain numbers and adjust the plan from there.' },
    ],
    serviceIds: ['digital-marketing', 'seo', 'geo', 'social-media-marketing'],
    badgeClass: pillarBadgeClass.Growth,
    iconBgClass: pillarIconBgClass.Growth,
    dotClass: pillarDotClass.Growth,
    accentVar: pillarAccentVar.Growth,
  },
  {
    slug: 'web-brand-publishing',
    path: '/services/web-brand-publishing/',
    navLabel: 'Web, Brand & Publishing',
    heading: 'Web, Brand & Publishing',
    eyebrow: 'Web, Brand & Publishing',
    promise: 'Get a website, application, brand identity, or ebook designed and built by one team, from first sketch to launch.',
    selectorLabel: 'Build a Website, Brand or Ebook',
    selectorHint: 'Web, software, branding, and ebook publishing',
    whoFor: [
      'You need a new website or web app, or your current one is slow, dated, or hard to update',
      'You are launching a business or product and do not have a logo or brand system yet',
      'You have a manuscript or long-form content that needs to become a published ebook',
    ],
    howWeWork: [
      { title: 'Discovery', description: 'We define what you are building, who it is for, and what it needs to do on day one.' },
      { title: 'Design', description: 'Wireframes, UI, or brand concepts come first, so structure is agreed before we write code or finalize a logo.' },
      { title: 'Build', description: 'We develop, test on real devices, and review with you before anything ships.' },
      { title: 'Launch & Handoff', description: 'You get a working, deployed product plus the files and access to maintain it.' },
    ],
    serviceIds: ['web-development', 'software-development', 'branding', 'ebook-publishing'],
    badgeClass: pillarBadgeClass.Technology,
    iconBgClass: pillarIconBgClass.Technology,
    dotClass: pillarDotClass.Technology,
    accentVar: pillarAccentVar.Technology,
  },
  {
    slug: 'infrastructure-automation',
    path: '/services/infrastructure-automation/',
    navLabel: 'Infrastructure, Cloud & Automation',
    heading: 'Infrastructure, Cloud & Automation',
    eyebrow: 'Infrastructure, Cloud & Automation',
    promise: 'Get your servers, deployments, and hardware set up to run reliably and scale when you need them to.',
    selectorLabel: 'Improve Your Infrastructure',
    selectorHint: 'DevOps, cloud, and hardware',
    whoFor: [
      'Deployments are manual, risky, or nobody but one person understands them',
      'You need cloud infrastructure that is monitored and can handle real traffic',
      'You are specifying a workstation or server build and want it matched to the actual workload',
    ],
    howWeWork: [
      { title: 'Assess', description: 'We review your current setup, traffic, and where it breaks or slows down.' },
      { title: 'Design', description: 'We plan the pipeline, cloud architecture, or hardware spec around your real workload.' },
      { title: 'Implement', description: 'We build and configure it, with monitoring in place from the start.' },
      { title: 'Hand Off & Support', description: 'You get documentation and a working system your team can operate.' },
    ],
    serviceIds: ['devops', 'cloud', 'computer-hardware'],
    badgeClass: pillarBadgeClass.Infrastructure,
    iconBgClass: pillarIconBgClass.Infrastructure,
    dotClass: pillarDotClass.Infrastructure,
    accentVar: pillarAccentVar.Infrastructure,
  },
];

export const getCategory = (slug: string): CategoryMeta | undefined =>
  CATEGORIES.find((c) => c.slug === slug);

export const getCategoryForService = (serviceId: string): CategoryMeta | undefined =>
  CATEGORIES.find((c) => c.serviceIds.includes(serviceId));

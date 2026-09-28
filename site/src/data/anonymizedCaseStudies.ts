// Phase 3: the four real, anonymized, client-approved-for-use case
// studies (client identities withheld). Single source of truth, read by
// /case-studies/ (full write-ups + Article JSON-LD) and /work/ (summary
// cards linking to them). Moved verbatim out of case-studies.astro — see
// that page's header for the content-integrity notes behind each entry.
// Not to be confused with src/data/caseStudies.ts, the separate
// structure for future named-client case studies (still empty).
export interface AnonymizedCaseStudy {
  id: string;
  icon: 'book-open' | 'git-branch' | 'search' | 'cpu';
  eyebrow: string;
  title: string;
  context: string;
  work: string;
  outcome: string;
  relatedServices: { label: string; href: string }[];
}

export const anonymizedCaseStudies: AnonymizedCaseStudy[] = [
  {
    id: 'ebook-design-and-publishing',
    icon: 'book-open',
    eyebrow: 'eBook Design & Publishing',
    title: 'Production at scale for independent authors and publishers',
    context:
      'Authors and small publishers regularly need an ebook taken from manuscript to a fully published, storefront-ready product, without piecing that process together across separate freelancers for cover design, layout, and formatting.',
    work:
      'Over 100 ebook projects have been delivered end to end: cover design, interior layout, and full publishing preparation handled as one connected pipeline rather than separate handoffs. At peak, one production run delivered more than 50 books, each with its own cover design, layout, and publishing prep, within a single month.',
    outcome:
      'Several titles produced through this process have reached bestseller rankings in their category on Amazon. A ranking reflects a point in time rather than a permanent status, but it is a real, independently visible signal that the production quality holds up in a competitive storefront.',
    relatedServices: [{ label: 'eBook & Digital Publishing', href: '/services/ebook-publishing/' }],
  },
  {
    id: 'devops-and-cloud-infrastructure',
    icon: 'git-branch',
    eyebrow: 'DevOps & Cloud Infrastructure',
    title: 'Automated, documented infrastructure across a range of environments',
    context:
      'Engagements have run across university IT departments, individual and student clients, and small-to-mid-sized offices, each arriving with the same underlying problem: infrastructure and deployment processes that depended on manual steps or on one specific person’s knowledge.',
    work:
      'Core work across these engagements has included CI/CD pipeline builds, server migrations, jump-server (bastion host) setup, Docker containerization, and ongoing MSP-style infrastructure support, with deep, hands-on Ansible automation used throughout to make the resulting setups repeatable rather than one-off.',
    outcome:
      'This reads as a capability and engagement-type summary rather than a single flagship project, because that is what the work actually is: a consistent approach applied across genuinely different environments, each one left running on automated, documented infrastructure instead of manual, single-person-dependent processes.',
    relatedServices: [
      { label: 'DevOps', href: '/services/devops/' },
      { label: 'Cloud Services', href: '/services/cloud/' },
    ],
  },
  {
    id: 'seo',
    icon: 'search',
    eyebrow: 'SEO',
    title: 'Ongoing SEO work across more than 20 clients',
    context:
      'More than 20 SEO clients have been served across Europe, the United States, and Canada, mostly mid-market businesses and startups looking for organic growth rather than a one-time audit.',
    work:
      'One recent, representative engagement: a client retained SEO work at roughly $500 a month.',
    outcome:
      'That engagement is now producing a measurable return of roughly $6,000 a month attributable to the SEO work, several times the retainer cost. The precise nature of that figure (what it counts, and over what exact period) hasn’t been independently itemized here, so it is presented as a measurable return rather than a specific revenue claim.',
    relatedServices: [{ label: 'SEO', href: '/services/seo/' }],
  },
  {
    id: 'computer-hardware-sourcing',
    icon: 'cpu',
    eyebrow: 'Computer Hardware Sourcing',
    title: 'Hard-to-source hardware, delivered on deadline',
    context:
      'Vendors and offices sometimes need computer hardware, including RAM and hard drives, that isn’t readily available through common retail channels, and need it on a deadline rather than a best-effort timeline.',
    work:
      'Sourcing is backed by a BrokerBin subscription and direct U.S. inventory and vendor access, supplying hardware to vendors and offices at competitive market pricing. In one instance, a Japanese company with U.S. operations needed hard-to-source RAM and hard drives on a tight deadline; the components were sourced and supplied at competitive pricing without a quality compromise.',
    outcome:
      'The BrokerBin-backed sourcing network and direct vendor access mean hardware requests that would stall through normal retail channels can still be filled reliably and on schedule.',
    relatedServices: [{ label: 'Computer Hardware', href: '/services/computer-hardware/' }],
  },
];

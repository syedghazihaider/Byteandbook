// Shared FAQ type + FAQPage JSON-LD builder, used by the homepage,
// service pages (src/data/serviceFaqs.ts) and Insights articles (their
// `faqs` frontmatter). The schema is always generated from the same array
// the page renders visibly, as Google requires for FAQPage markup.
export interface Faq {
  question: string;
  answer: string;
}

export function faqPageJsonLd(faqs: Faq[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: { '@type': 'Answer', text: faq.answer },
    })),
  };
}

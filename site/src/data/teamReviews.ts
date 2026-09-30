// Phase 5 (content): real Upwork reviews earned by ByteAndBook's own
// engineers (Noor, Hassan, Moiz, Waleed, Atta) and video shoutouts
// received by ByteAndBook's sales manager (Elizabeth Luna), all while on
// ByteAndBook's payroll, via their individual freelance-platform profiles
// — this predates byteandbook.com existing as a business site. Framed
// honestly as "our team's track record," not as formal ByteAndBook
// client testimonials implying direct engagements with the ByteAndBook
// business entity. Matches the anonymizedCaseStudies.ts pattern: a
// single source-of-truth data file, aggregate stats computed here in
// code (never hand-copied), rendered on its own page kept clearly
// separate from /case-studies/ and /work/'s named case studies.
//
// Per Google's guidelines on self-serving review rich snippets, this
// data is intentionally never wrapped in Review/AggregateRating
// schema.org markup — plain testimonial content only.
//
// Privacy: reviewer names are first name + last initial only, as given
// in the source data. Company names are kept as given (already public
// on Upwork).

export interface TeamReview {
  reviewer: string;
  rating: number; // out of 5
  company?: string;
  jobTitle: string;
  feedback?: string; // omitted where the client left a rating only, no written review
}

export interface TeamMemberReviews {
  member: string; // first name only, matches how the team is described elsewhere
  discipline: string;
  reviews: TeamReview[];
}

export const teamReviews: TeamMemberReviews[] = [
  {
    member: 'Noor',
    discipline: 'Microsoft 365 & MSP',
    reviews: [
      { reviewer: 'Jorge L.', rating: 4.6, company: 'Wolar Industrial, Inc', jobTitle: 'Microsoft Teams Message Search', feedback: 'Quick work. No hiccups.' },
      { reviewer: 'Vlad V.', rating: 5, company: 'Happy Tube sro', jobTitle: 'Call meeting charges', feedback: 'Muhammed is an excellent expert in his field and he helped me a lot with my task.' },
      { reviewer: 'Al J.', rating: 5, company: 'Boomerang', jobTitle: 'Microsoft exchange expert to setup smtp connector', feedback: 'Great freelancer, very patient and always willing to help. Thank you for the great work!' },
      { reviewer: 'Faisal A.', rating: 5, jobTitle: 'Azure Exam AZ-204', feedback: 'Azure guru, his teaching skills are excellent.' },
      { reviewer: 'James H.', rating: 4.9, company: 'Outrun', jobTitle: 'Azure Infrastructure Engineer needed for consultation/support on mapping Azure storage to IIS app', feedback: 'Muhammad helped us understand some of the options available to us.' },
      { reviewer: 'Adil K.', rating: 5, jobTitle: 'Cloud service', feedback: "Muhammad was excellent to work with! He quickly understood our needs and helped us configure Microsoft Teams in a way that perfectly suited our small firm's structure. His expertise made the setup process smooth and efficient, especially when it came to enabling access for both internal staff and external collaborators. He was responsive, knowledgeable, and a true professional throughout. Highly recommended!" },
      { reviewer: 'Nathan A.', rating: 5, company: 'Wiznucleus', jobTitle: 'Troubleshoot an Azure VM failed deployment', feedback: "Completed a complex data restoration effort in Azure after our internal team's user error corrupted our active server." },
      { reviewer: 'Steve S.', rating: 5, jobTitle: 'Microsoft Office 365 Mac', feedback: "As a Mac user, I've found that support for Office 365 is often limited, but Noor has been an absolute standout. His technical expertise with Office 365 is truly exceptional. For any high-level Microsoft technical issues, Noor is without a doubt the go-to person." },
      { reviewer: 'Robert B.', rating: 5, jobTitle: 'Convert gmail to microsoft exchange email', feedback: 'Muhammed was a great teammate to help us with this problem. He recognized some nuanced settings and fixed them which allowed the microsoft exchange email to start working. I would say he is very knowledgable in his field and when we need these types of services, I will definitely reach back out to Muhammed.' },
      { reviewer: 'Hafiz Mubeen A.', rating: 5, jobTitle: 'WINDOWS server2022', feedback: 'Outstanding work! The freelancer delivered not one, but two complex Windows Server assignments, both completed well before the deadline and with perfect accuracy. Communication was smooth, and he followed every instruction precisely.' },
      { reviewer: 'Adil K.', rating: 5, jobTitle: 'Expert Microsoft 365 Setup', feedback: 'We hired Muhammad to handle a full Microsoft 365 setup and system optimization, and they exceeded every expectation. From configuring Exchange Online, SharePoint, Teams, and Intune to implementing best practices around security, compliance, and device management—everything was done with precision, clarity, and professionalism.' },
      { reviewer: 'Adil K.', rating: 5, jobTitle: 'Expert Microsoft 365 Setup', feedback: 'Muhammad handled the end-to-end setup of our Microsoft 365 tenant professionally and ensured everything was configured properly for our organization. Security was implemented with best practices, including MFA, Conditional Access policies, and other compliance configurations, which significantly improved the security of our environment.' },
    ],
  },
  {
    member: 'Hassan',
    discipline: 'MSP & DevOps',
    reviews: [
      { reviewer: 'Patrick H.', rating: 5, company: 'GJ Gardner Homes', jobTitle: 'Ongoing Windows PC Support & Microsoft Intune Setup', feedback: 'Hassan was great and understood our requirement clearly. He set up Intune and provided ongoing support for various IT projects for our remote team. He was communicative and saw all tasks through to completion. Definitely would recommend working with him.' },
      { reviewer: 'Denis D.', rating: 5, jobTitle: 'Senior Microsoft Outlook Expert Needed' },
      { reviewer: 'Rick P.', rating: 5, jobTitle: 'MS 365 Expert Needed for Separation of Email Addresses on Tenants' },
      { reviewer: 'Mike C.', rating: 4, company: 'TOSS Corporation', jobTitle: 'Weekend Help Desk Engineer' },
      { reviewer: 'Dana B.', rating: 5, company: 'Sana Labs', jobTitle: 'Technical Support & Coordinator' },
      { reviewer: 'Ari G.', rating: 4.6, jobTitle: 'General IT Support' },
      { reviewer: 'Adam', rating: 5, company: 'Acfours Technologies', jobTitle: 'Azure Expert Needed for AVD, Intune Policies, and Entra ID Configuration' },
      { reviewer: 'Houman D.', rating: 4.6, jobTitle: 'Azure container setup', feedback: 'Highly recommend Hassan, he is super proficient in DevOps.' },
      { reviewer: 'Mahmut S.', rating: 5, jobTitle: "Intune Compliance Policy doesn't recognize SentinelOne", feedback: 'Thanks a lot to Hassan. We were able to tackle the issue and resolve it quickly. Thanks again for your quick response and assistance!' },
      { reviewer: 'Neil S.', rating: 5, company: 'Siman Builds', jobTitle: 'Expert Microsoft 365 Setup / Administration' },
      { reviewer: 'Leland F.', rating: 5, company: 'Miller Electric Mfg. LLC', jobTitle: 'Azure Entra ID Enterprise Application Registration Expert Needed', feedback: 'Hassan was very flexible with our schedule. Thank you Hassan!' },
      { reviewer: 'Robert L.', rating: 4, company: 'Earnest Software Engineering', jobTitle: 'Active Directory assistance' },
      { reviewer: 'Rick P. (Pingert)', rating: 4.1, company: 'Network Craze Technologies, Inc', jobTitle: 'DNS snap-in access is denied', feedback: 'Efficient & knowledgeable.' },
      { reviewer: 'Trevor S.', rating: 5, company: 'NFEC', jobTitle: 'WordPress Administration Expert' },
    ],
  },
  {
    member: 'Moiz',
    discipline: 'Microsoft 365 & MSP',
    reviews: [
      { reviewer: 'Angela S.', rating: 4.9, company: 'Controlled Logic LLC', jobTitle: 'Microsoft Intune & Purview DLP Setup – Expert Walkthrough & Policy Configuration', feedback: 'Thank you for your help and expertise! Hope to work with you again!' },
    ],
  },
  {
    member: 'Waleed',
    discipline: 'DevOps',
    reviews: [
      { reviewer: 'Arthur G.', rating: 5, jobTitle: 'Intune & Azure Training', feedback: 'Great freelancer.' },
      { reviewer: 'Cleef M.', rating: 4.8, company: 'Bennu Technologies', jobTitle: 'Deploy a single NestJS App to Azure App Service', feedback: 'Syed was knowledgeable and very flexible in helping us achieve our goals. He was always available and provided valuable insights.' },
      { reviewer: 'Kiran S.', rating: 5, company: 'Lokafy Inc', jobTitle: 'DevOps Consultancy for CI/CD Pipeline', feedback: 'Waleed worked on a DevOps project for us, analyzing our Jenkins pipelines and making several improvements to the security and speed of our setup. He documented his findings clearly in a report, which will make it easy for us to take action. Since no one on our dev team is a DevOps expert, it was great to have someone experienced take a fresh look at things. Waleed communicated well throughout and always delivered what he promised, on time.' },
    ],
  },
  {
    member: 'Atta',
    discipline: 'DevOps',
    reviews: [
      { reviewer: 'Ivana M.', rating: 5, company: 'Elunic AG', jobTitle: 'DevOps Engineer Needed', feedback: 'It was a real pleasure collaborating with this freelancer. Communication was clear and easy throughout, tasks were handled with care, and everything was delivered in a professional and reliable way.' },
    ],
  },
];

// Computed in code, never hand-copied, so it stays accurate if the data
// above changes.
export const teamReviewStats = (() => {
  const all = teamReviews.flatMap((m) => m.reviews);
  const withFeedback = all.filter((r) => r.feedback);
  const avg = all.reduce((sum, r) => sum + r.rating, 0) / all.length;
  return {
    totalReviews: all.length,
    withWrittenFeedback: withFeedback.length,
    averageRating: Math.round(avg * 10) / 10,
    disciplines: [...new Set(teamReviews.map((m) => m.discipline))],
  };
})();

// Elizabeth Luna's video shoutouts: genuine, unsolicited shoutouts from
// individual streamer/content-creator clients for freelance graphic and
// video work (channel banners, thumbnails, Twitch emotes, fursuit/fursona
// art) sold and delivered while Elizabeth was ByteAndBook's Sales
// Manager. Kept in its own bucket rather than mixed into the MSP/DevOps
// reviews above: it's a genuinely different kind of work (individual
// creator-branding/design, not ByteAndBook's core B2B service lineup),
// so grouping it separately keeps both sections honest about what they
// actually show.
export interface VideoShoutout {
  id: string;
  video: string; // path under public/
  poster: string;
  summary: string; // plain-language description of what the client says, not a verbatim transcript claim
}

export const elizabethVideoShoutouts: VideoShoutout[] = [
  {
    id: 'shoutout-1',
    video: '/media/team-track-record/elizabeth-shoutout-1.mp4',
    poster: '/media/team-track-record/elizabeth-shoutout-1-poster.jpg',
    summary: 'A YouTube creator thanks Elizabeth for a new channel banner, logo, and thumbnails, and credits the redesign with helping grow the channel\'s community.',
  },
  {
    id: 'shoutout-2',
    video: '/media/team-track-record/elizabeth-shoutout-2.mp4',
    poster: '/media/team-track-record/elizabeth-shoutout-2-poster.jpg',
    summary: 'A Twitch streamer thanks Elizabeth for setting up channel emotes and other graphics, and describes her as easy to work with and in good communication throughout.',
  },
  {
    id: 'shoutout-3',
    video: '/media/team-track-record/elizabeth-shoutout-3.mp4',
    poster: '/media/team-track-record/elizabeth-shoutout-3-poster.jpg',
    summary: "A content creator describes Elizabeth's design work as fantastic, professional, and accommodating.",
  },
];

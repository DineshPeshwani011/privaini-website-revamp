// The resources hub, as published on privaini.com/resources: the library's contents, the featured report,
// the podcast and the articles it lists (blog posts, by slug, in the order the page shows them).
import { posts, type Post } from './posts';

export const library = [
  { name: 'Featured report', meta: '2026', text: 'The Privacy Risk Gap: what cyber insurers are seeing in 2026.', href: '#featured-report' },
  { name: 'Case studies & use cases', meta: '4 stories', text: 'Bakkt, healthcare, education, and insurer portfolios: real deployments, real findings.', href: '#case-studies' },
  { name: 'The Privacy Risk Podcast', meta: '3 episodes', text: 'Underwriters, regulators, and litigators on the front lines of privacy enforcement.', href: '#podcast' },
  { name: 'Latest articles', meta: 'Field notes', text: 'Enforcement, litigation, and what regulators observe from the outside.', href: '#articles' },
  { name: 'Find by role', meta: '6 roles', text: 'Enterprises, insurers, brokers, law firms, risk advisors, and M&A teams.', href: '#by-role' },
];

export const featuredReport = {
  title: 'The Privacy Risk Gap',
  subtitle: 'What Cyber Insurers Are Seeing in 2026',
  text: 'Privacy litigation surged 78% between 2020 and 2024. This report examines the gap between breach-risk models and lawsuit risk, the signals insurers now use, and where claims are heading.',
  href: '/privacy-risk-gap',
  note: 'Full report launching soon',
  figures: [
    { figure: '78%', count: 78, suffix: '%', label: 'Litigation surge 2020–24' },
    { figure: '90', count: 90, suffix: '', label: 'Jurisdictions mapped' },
    { figure: '100+', count: 100, suffix: '+', label: 'Signals per company' },
  ],
};

/** Podcast episodes. The last three had no published link on privaini.com, so they are listed without one. */
export const episodes: { title: string; meta: string; href?: string }[] = [
  { title: 'Game On Privacy: Founders Edition', meta: '#GameOnPrivacy', href: 'https://www.youtube.com/watch?v=lCxbBpT8lVo' },
  { title: 'Navigating the AI Landscape with Kevin Morgan', meta: '#GameOnPrivacy', href: 'https://www.youtube.com/watch?v=PzxDgGZhRJI' },
  { title: 'Game On Privacy: Privacy as Freedom', meta: '#GameOnPrivacy', href: 'https://www.youtube.com/watch?v=sF3GTC97_jI' },
  { title: 'How Underwriters Are Using Privacy Signals to Rethink Cyber Risk', meta: 'March 2026 · 42 min' },
  { title: 'VPPA in 2026: Why Video Tracking Is the Class Action Everyone Missed', meta: 'Feb 2026 · 38 min' },
  { title: 'The Privacy Due Diligence Gap in M&A: What Every Acquirer Inherits', meta: 'Jan 2026 · 45 min' },
];

const articleSlugs = [
  'winning-the-privacy-game-competitive-analysis-through-privainis-lens-5642f',
  'why-you-need-an-outside-in-approach-to-privacy-risk-monitoring-ad4f2',
  'security-ratings-privacy-gap',
  'what-regulators-look-for',
  'vppa-enforcement-2026',
  'the-state-of-global-data-privacy-in-2023-a-comprehensive-overview-0c8b3',
  'privacy-risk-gap-2026',
  'policy-practice-gap',
  'the-mobile-privacy-mirage-hidden-risks-in-your-app-store-footprint',
];

export const articles: Post[] = articleSlugs
  .map((slug) => posts.find((p) => p.slug === slug))
  .filter((p): p is Post => !!p);

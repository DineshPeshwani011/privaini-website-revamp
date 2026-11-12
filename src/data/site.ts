// Site-wide navigation and contact facts, taken from the current privaini.com.

export const PLATFORM_URL = 'https://platform.privaini.com';
export const DEMO_URL = '/request-a-demo';

export type NavLink = { label: string; href: string; note?: string };
export type NavGroup = { label: string; href?: string; items: NavLink[] };

export const solutions: NavLink[] = [
  { label: 'Enterprises', href: '/enterprises', note: 'Find the gaps between policy and practice.' },
  { label: 'Insurers', href: '/insurers', note: 'Spot privacy loss drivers before claims surface.' },
  { label: 'Brokers', href: '/brokers', note: 'Win placements with outside-in privacy evidence.' },
  { label: 'Law Firms', href: '/law-firms', note: "See the evidence plaintiffs' counsel already scanned." },
  { label: 'M&A Advisors', href: '/ma-advisors', note: 'Find privacy & AI risk before it impacts the deal.' },
  { label: 'Risk Advisors', href: '/risk-advisors', note: 'Bring evidence-backed privacy risk to every client.' },
];

export const partners: NavLink[] = [
  { label: 'Arch Insurance', href: '/arch-insurance' },
  { label: 'Beazley', href: '/beazley' },
  { label: 'Chubb', href: '/chubb' },
  { label: 'Marsh', href: '/marsh' },
  { label: 'Sompo', href: '/sompo' },
  { label: 'WTW', href: '/wtw' },
];

export const platform: NavLink[] = [
  { label: 'Risk Intelligence', href: '/risk-intelligence', note: 'Why outside-in observation is the new standard.' },
  { label: 'Platform overview', href: '/platform-overview', note: 'Observe, detect, recommend.' },
  { label: 'How it works', href: '/how-it-works', note: 'From a domain name to statute-mapped findings.' },
  { label: 'What we find', href: '/what-we-find', note: 'Eight finding categories, each statute-mapped.' },
  { label: 'The privacy risk gap', href: '/privacy-risk-gap', note: 'Where inside-out tools stop seeing.' },
];

export const statutes: NavLink[] = [
  { label: 'VPPA', href: '/vppa' },
  { label: 'BIPA', href: '/bipa' },
  { label: 'CCPA / CPRA', href: '/ccpa-cpra' },
  { label: 'GDPR', href: '/gdpr' },
  { label: 'COPPA', href: '/coppa' },
  { label: 'Wiretapping / CIPA', href: '/wiretapping-cipa' },
  { label: 'State privacy laws', href: '/state-privacy-laws' },
];

export const resources: NavLink[] = [
  { label: 'Resources', href: '/resources' },
  { label: 'Blog', href: '/blog' },
  { label: 'Case studies', href: '/case-studies' },
  { label: 'Bakkt case study', href: '/bakkt-case-study' },
  { label: 'Healthcare', href: '/healthcare-use-case' },
  { label: 'Education', href: '/education-use-case' },
  { label: 'Risk aggregators', href: '/risk-aggregator-use-case' },
];

export const mainNav: (NavGroup | NavLink)[] = [
  { label: 'Platform', href: '/platform-overview', items: platform },
  { label: 'Solutions', href: '/solutions', items: solutions },
  { label: 'Partners', href: '/partner-program', items: partners },
  { label: 'Company', href: '/about-us' },
  { label: 'Resources', href: '/resources' },
];

export const legal: NavLink[] = [
  { label: 'Terms of Service', href: '/terms-of-service' },
  { label: 'Service Agreement', href: '/service-agreement' },
  { label: 'Privacy Notice', href: '/privacy-notice' },
  { label: 'Cookie Notice', href: '/cookie-notice' },
];

export const contact = {
  address: ['3 E 3rd Ave Suite 200', 'San Mateo, CA 94401', 'USA'],
  sales: 'sales@privaini.com',
  support: 'support@privaini.com',
};

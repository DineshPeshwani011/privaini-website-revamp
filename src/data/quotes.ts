// Customer and partner words, as published on privaini.com.
export interface Quote { text: string; name: string; org: string; initials: string; href?: string }

export const quotes: Record<string, Quote> = {
  viaquest: {
    text: 'Instead of treating security as a ‘have to,’ it has become an integral part of how we operate, embedded naturally into our culture. Their partnership is more than a service. It’s a strategic advantage.',
    name: 'Chief Technology Officer', org: 'ViaQuest', initials: 'VQ', href: '/case-studies',
  },
  bakkt: {
    text: 'Privaini was indispensable for Bakkt, highlighting gaps in our privacy program and providing actionable insights to ensure our global expansion was compliant. It was our compass for navigating the complex landscape of international privacy laws.',
    name: 'Kevin Morgan', org: 'Privacy & Risk, Bakkt', initials: 'KM', href: '/bakkt-case-study',
  },
  healthcare: {
    text: 'We had a consent banner and assumed we were covered. Privaini showed us exactly what was firing, on which pages, and under which statute, before a plaintiff’s firm did.',
    name: 'VP, Privacy & Compliance', org: 'Top-10 US Health System (anonymized)', initials: 'HS', href: '/healthcare-use-case',
  },
  education: {
    text: 'Districts kept asking us to prove our privacy posture. Privaini gave us evidence, mapped to the exact statute, instead of another attestation.',
    name: 'Chief Privacy Officer', org: 'National Education Platform (anonymized)', initials: 'EP', href: '/education-use-case',
  },
  aggregator: {
    text: 'Security ratings told us who might get breached. Privaini tells us who’s getting sued, across our entire book.',
    name: 'Head of Cyber Underwriting', org: 'Top-tier cyber insurer (anonymized)', initials: 'CU', href: '/risk-aggregator-use-case',
  },
  arch: {
    text: 'Privaini risk intelligence allows us to make informed underwriting decisions.',
    name: 'Vice President, Underwriting', org: 'Arch Insurance', initials: 'AI', href: '/arch-insurance',
  },
  wtw: {
    text: 'Privacy is the new MFA. We are watching privacy claims heat up. Use Privaini to compete for new business.',
    name: 'Legal Counsel and Head of Global Cyber Risk & Insurance', org: 'WTW', initials: 'WT', href: '/wtw',
  },
  marsh: {
    text: 'Privacy is the new MFA. We are watching privacy claims heat up.',
    name: 'Marsh', org: 'Marsh', initials: 'MA', href: '/marsh',
  },
  macko: {
    text: 'Dark patterns aren’t about intent. They are about effect.',
    name: 'Michael Macko', org: 'Director of Enforcement, California Privacy Protection Agency', initials: 'MM',
  },
};

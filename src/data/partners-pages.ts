// The six insurer and broker partner pages, as published on privaini.com.
// Disclaimers, eligibility lines and pricing terms are kept word for word: they are legal or
// commercial text agreed with each partner. Do not edit them without sign-off.
import { quotes, type Quote } from '@/data/quotes';
import { DEMO_URL } from '@/data/site';

export type PartnerKey = 'arch-insurance' | 'beazley' | 'chubb' | 'marsh' | 'sompo' | 'wtw';
export type Link = { label: string; href: string };
export type PanelRow = { label: string; value: string; state?: 'ok' | 'warn' | 'bad' | 'info' };
export interface Figure { figure: string; label: string; count?: number; prefix?: string; suffix?: string; decimals?: number }
export interface Item { title: string; text: string }

export interface PartnerPageData {
  name: string;
  meta: { title: string; description: string };
  hero: { title: string; lead: string; primary: Link; secondary: Link };
  /** The co-branded panel from the old hero: header, rows, and the highlighted closing line. */
  panel: { title: string; subject: string; rows: PanelRow[]; total: { label: string; value: string } };
  /** WTW's one-line argument band. */
  gap?: { title: string; lit?: string; link: Link };
  /** What policyholders unlock, shown beside a product figure. */
  capabilities?: {
    heading: string;
    items: Item[];
    figure: 'report' | 'briefing' | 'outside-in-scanner' | 'exposure-scale';
    note?: string;
    /** Verbatim legal or eligibility line. */
    fine?: string;
  };
  /** Beazley's three Risk Management Offering tiers. A value of true is a check, '' is not included. */
  tiers?: { heading: string; label: string; sizes: string[]; rows: { feature: string; values: (string | boolean)[] }[]; note: string };
  /** The partner's policyholder pricing. */
  offer?: { heading: string; text: string; figures: Figure[] };
  proof?: { heading: string; quote: Quote; figures: Figure[] };
  faq?: { heading: string; items: { q: string; a: string }[] };
}

const learn: Link = { label: 'Learn about Privaini', href: '/platform-overview' };
const included = (label: string): PanelRow => ({ label, value: 'Included', state: 'ok' });
const upTo25 = { label: 'Policyholder discount', value: 'up to 25%' };

const policyholderPricing: Figure[] = [
  { figure: '25%', count: 25, suffix: '%', label: 'For new subscriptions' },
  { figure: '15%', count: 15, suffix: '%', label: 'For subsequent renewals' },
  { figure: '$0', label: 'Set-up cost' },
];

const preferredPricingRows: PanelRow[] = [
  { label: 'New subscriptions', value: '25% off', state: 'ok' },
  { label: 'Renewals', value: '15% off', state: 'ok' },
  { label: 'Installation', value: 'None required', state: 'info' },
];

const fourCapabilities: Item[] = [
  { title: 'Outside-in risk assessment', text: 'Evidence-backed, timestamped findings on how your website and digital assets handle visitor data.' },
  { title: 'Continuous monitoring', text: 'Ongoing alerts when new privacy risks emerge across your digital footprint.' },
  { title: 'Exposure estimates', text: 'Potential regulatory fines and litigation exposure, so you can see which issues carry real financial risk.' },
  { title: 'Risk reports', text: 'Regulator-grade findings with prioritized remediation, mapped to the governing statute.' },
];

const settlement: Figure = { figure: '$11.5M', count: 11.5, decimals: 1, prefix: '$', suffix: 'M', label: 'Avg BIPA & VPPA settlement, 2024 to 2025' };
const fines: Figure = { figure: '$7B+', count: 7, prefix: '$', suffix: 'B+', label: 'in global privacy fines and settlements since 2020' };
const brokers: Figure = { figure: '2 of 3', label: 'Top global brokers use Privaini' };

const whatAssessed = {
  q: 'What does Privaini assess?',
  a: 'Your public-facing digital properties: consent flows, trackers, and policy-practice gaps, mapped to laws like VPPA, BIPA, CCPA/CPRA and GDPR across 90 countries and 20 U.S. states.',
};
const installQ = {
  q: 'Do I need to install anything?',
  a: 'No. Privaini works entirely from the outside. Your company name and domain are the only input.',
};

export const partnerPages: Record<PartnerKey, PartnerPageData> = {
  chubb: {
    name: 'Chubb',
    meta: {
      title: 'Chubb × Privaini',
      description: 'Chubb partners with Privaini to offer Privacy Risk Management: outside-in privacy and AI risk intelligence.',
    },
    hero: {
      title: 'Privacy Risk Management, powered by Privaini.',
      lead: 'Through our partnership, Chubb and Privaini bring policyholders a powerful outside-in view of privacy and AI risk.',
      primary: { label: 'Get started', href: DEMO_URL },
      secondary: learn,
    },
    panel: {
      title: 'Chubb × Privaini',
      subject: 'co-branded',
      rows: [included('Privacy dashboard'), included('Continuous monitoring'), included('Risk reports')],
      total: upTo25,
    },
    capabilities: {
      heading: 'Unlock your privacy and AI risk intelligence.',
      figure: 'report',
      items: [
        { title: 'Outside-in assessment', text: 'A complete outside-in assessment of your organization’s privacy posture from your domain.' },
        { title: 'Continuous monitoring', text: 'Ongoing alerts when new privacy risks emerge across your digital footprint.' },
        { title: 'Risk reports', text: 'Regulator-grade findings with prioritized remediation, mapped to the governing statute.' },
      ],
      fine: 'The non-insurance products and services described herein are provided by Privaini, not Chubb.',
    },
    offer: {
      heading: 'Privaini discounts for Chubb cyber policyholders.',
      text: 'As a valued Chubb client, you can take advantage of special pricing on Privaini.',
      figures: policyholderPricing,
    },
  },

  beazley: {
    name: 'Beazley',
    meta: {
      title: 'Beazley × Privaini',
      description: 'Beazley clients: privacy risk monitoring is part of your Risk Management Offering, powered by Privaini.',
    },
    hero: {
      title: 'Privacy risk monitoring is part of your risk management offering.',
      lead: 'Beazley clients can monitor enterprise privacy risk across their business ecosystem, seamlessly integrated into the Risk Management Offering.',
      primary: { label: 'Contact Beazley to activate', href: DEMO_URL },
      secondary: learn,
    },
    panel: {
      title: 'Risk Management Offering',
      subject: 'beazley',
      rows: [included('Privacy dashboard'), included('Ecosystem analysis'), included('Tracking review')],
      total: upTo25,
    },
    tiers: {
      heading: 'Three tiers. Choose the coverage that fits your organization.',
      label: 'Premium',
      sizes: ['30k+', '50k+', '100k+'],
      rows: [
        { feature: 'Privacy dashboard', values: [true, true, true] },
        { feature: 'Ecosystem privacy analysis', values: ['2 Organizations', '5 Organizations', '10 Organizations'] },
        { feature: 'Tracking technologies review', values: [true, true, true] },
        { feature: 'Expert privacy consultation', values: ['', '', true] },
        { feature: 'Tailored regulatory review', values: ['', '', true] },
      ],
      note: 'Integrated into the Beazley Risk Management Offering: no separate installation.',
    },
    offer: {
      heading: 'Privaini discounts for Beazley cyber policyholders.',
      text: 'As a valued Beazley client, you get special discounts on your Privaini subscription.',
      figures: policyholderPricing,
    },
  },

  sompo: {
    name: 'Sompo',
    meta: {
      title: 'Sompo × Privaini',
      description: 'Sompo adds Privaini to Cyber Risk Services: outside-in privacy risk monitoring for policyholders.',
    },
    hero: {
      title: 'Sompo adds Privaini to Cyber Risk Services.',
      lead: 'Sompo clients can now access Privaini’s privacy risk monitoring, outside-in, continuous, and with no installation.',
      primary: { label: 'Get started', href: DEMO_URL },
      secondary: learn,
    },
    panel: {
      title: 'Sompo × Privaini',
      subject: 'cyber risk services',
      rows: [included('Actionable insights'), included('Proactive monitoring'), included('Better posture')],
      total: upTo25,
    },
    capabilities: {
      heading: 'Empowering Sompo clients with Privaini.',
      figure: 'outside-in-scanner',
      items: [
        { title: 'Unlock actionable insights', text: 'Privaini provides actionable insights that help you navigate privacy and AI risk.' },
        { title: 'Proactive monitoring', text: 'Stay ahead of potential privacy threats with continuous outside-in monitoring.' },
        { title: 'Improve your posture', text: 'Enhance your compliance strategy with objective, outside-in evidence.' },
      ],
      fine: 'For primary insureds with premiums greater than $25k, Sompo may fund Privaini for eligible clients.',
    },
    offer: {
      heading: 'Privaini discounts for Sompo cyber policyholders.',
      text: 'As a valued Sompo client, you can take advantage of special pricing on Privaini.',
      figures: policyholderPricing,
    },
  },

  'arch-insurance': {
    name: 'Arch Insurance',
    meta: {
      title: 'Arch Insurance × Privaini',
      description: 'Arch policyholders: see your privacy exposure before regulators do, with preferred pricing arranged by Arch.',
    },
    hero: {
      title: 'Arch policyholders: see your privacy exposure before regulators do.',
      lead: 'From your domain alone, Privaini surfaces consent failures, tracker behavior, and policy-practice gaps, mapped to the laws that apply to you, with preferred pricing arranged by Arch.',
      primary: { label: 'Request a demo', href: DEMO_URL },
      secondary: learn,
    },
    panel: {
      title: 'Arch × Privaini',
      subject: 'insurance partner',
      rows: preferredPricingRows,
      total: { label: 'Preferred pricing', value: 'via Arch' },
    },
    capabilities: {
      heading: 'Four capabilities. One domain. Zero installation.',
      figure: 'exposure-scale',
      items: fourCapabilities,
      note: 'Activated from your company name and domain: no IT ticket, no questionnaires.',
    },
    proof: {
      heading: 'Arch didn’t wait for claims data. They built privacy risk into underwriting.',
      quote: quotes.arch,
      figures: [settlement, fines, { figure: '25%', count: 25, suffix: '%', label: 'Off new subscriptions for Arch clients' }],
    },
    faq: {
      heading: 'Common questions from Arch policyholders.',
      items: [
        {
          q: 'Is Privaini included with my Arch policy?',
          a: 'Privaini is not bundled with your policy, but Arch has arranged preferred pricing for policyholders: 25% off new subscriptions and 15% off renewals.',
        },
        { q: 'Why does Arch recommend Privaini?', a: 'Arch uses Privaini to assess privacy risk across the companies it underwrites.' },
        whatAssessed,
        installQ,
      ],
    },
  },

  marsh: {
    name: 'Marsh',
    meta: {
      title: 'Marsh × Privaini',
      description: 'Marsh clients: see your privacy exposure before regulators do, with preferred pricing arranged by Marsh.',
    },
    hero: {
      title: 'Marsh clients: see your privacy exposure before regulators do.',
      lead: 'From your domain alone, Privaini surfaces consent failures, tracker behavior, and policy-practice gaps, mapped to the laws that apply to you, with preferred pricing arranged by Marsh.',
      primary: { label: 'Request a demo', href: DEMO_URL },
      secondary: learn,
    },
    panel: {
      title: 'Marsh × Privaini',
      subject: 'broker partner',
      rows: preferredPricingRows,
      total: { label: 'Preferred pricing', value: 'via Marsh' },
    },
    capabilities: {
      heading: 'Four capabilities. One domain. Zero installation.',
      figure: 'exposure-scale',
      items: fourCapabilities,
      note: 'Activated from your company name and domain: no IT ticket, no questionnaires.',
    },
    proof: {
      heading: 'Privacy violations are a top driver of cyber claims.',
      quote: quotes.marsh,
      figures: [settlement, fines, { figure: '25%', count: 25, suffix: '%', label: 'Off new subscriptions for Marsh clients' }, brokers],
    },
    faq: {
      heading: 'Common questions from Marsh clients.',
      items: [
        {
          q: 'Is Privaini included with my insurance program?',
          a: 'Privaini is not bundled with your policy, but Marsh has arranged preferred pricing for its clients: 25% off new subscriptions and 15% off renewals.',
        },
        {
          q: 'Why does Marsh recommend Privaini?',
          a: 'Privacy violations are now a primary driver of cyber claims, and Privaini shows that exposure from the outside, the way regulators and plaintiffs see it.',
        },
        whatAssessed,
        installQ,
      ],
    },
  },

  wtw: {
    name: 'WTW',
    meta: {
      title: 'WTW × Privaini',
      description: 'WTW uses Privaini as part of its global cyber risk advisory: privacy risk, visible from the outside.',
    },
    hero: {
      title: 'Privacy is the new MFA. Your broker is already watching.',
      lead: 'WTW uses Privaini to assess client privacy risk as part of its global cyber risk advisory. Privacy violations are the fastest-growing driver of cyber claims, and the exposure is visible from the outside. Your WTW advisor uses this intelligence. Now you can access it directly.',
      primary: { label: 'See your exposure', href: DEMO_URL },
      secondary: learn,
    },
    panel: {
      title: 'WTW × Privaini',
      subject: 'cyber advisory',
      rows: [included('Privacy Risk Score'), included('Continuous Monitoring'), included('Privacy & AI Signals')],
      total: { label: 'Top brokers using Privaini', value: '2 of 3' },
    },
    gap: {
      title: 'Security ratings measure breach risk. Privaini measures lawsuit risk. Both drive claims.',
      lit: 'Privaini measures lawsuit risk.',
      link: { label: 'See the full picture', href: '/privacy-risk-gap' },
    },
    capabilities: {
      heading: 'Four capabilities. One domain. Zero installation.',
      figure: 'briefing',
      items: [
        { title: 'Privacy risk score', text: 'A complete outside-in assessment of your organization’s privacy posture.' },
        { title: 'Continuous monitoring', text: 'Ongoing alerts when new privacy risks emerge across your digital footprint.' },
        { title: 'Privacy and AI signals', text: 'Live signals detecting privacy and AI compliance events as they surface.' },
        { title: 'Risk reports', text: 'Regulator-grade findings with prioritized remediation, mapped to statute.' },
      ],
      note: 'Activated from your company name and domain: no questionnaires, no IT involvement.',
    },
    proof: {
      heading: 'Privacy violations are a top driver of cyber claims.',
      quote: quotes.wtw,
      figures: [
        { ...settlement, label: 'Average BIPA & VPPA settlement (2024–2025)' },
        { figure: '$1.9M', count: 1.9, decimals: 1, prefix: '$', suffix: 'M', label: 'Average wrongful data collection claim' },
        { figure: '78%', count: 78, suffix: '%', label: 'US privacy litigation increase, 2020–2024' },
        brokers,
      ],
    },
    faq: {
      heading: 'Common questions from WTW clients.',
      items: [
        { q: 'How does WTW use Privaini?', a: 'WTW advisors use Privaini to assess client privacy posture and inform cyber risk advisory.' },
        { q: 'What does Privaini find?', a: 'Consent failures, unauthorized tracker behavior, and policy-practice gaps, from the outside.' },
        { q: 'Why doesn’t my current program cover this?', a: 'Inside-out tools manage what you report, not what’s observable.' },
        { q: 'Is any installation required?', a: 'None. Privaini works entirely from outside your organization.' },
      ],
    },
  },
};

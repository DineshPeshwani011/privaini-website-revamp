// Privaini's published sample report (your-company.com) and the facts it rests on.
// Every figure here appears on the current privaini.com.

export type Severity = 'high' | 'med' | 'low';

export interface Finding {
  id: string;
  severity: Severity;
  statute: string;
  citation?: string;
  law: string;
  title: string;
  observation?: string;
  perViolation?: string;
  exposure: string;
  low: number;   // USD millions (EUR shown as published)
  high: number;
  currency: '$' | '€';
}

export const sampleFindings: Finding[] = [
  {
    id: 'F-0042', severity: 'high', statute: 'VPPA §2710', citation: '18 USC §2710', law: 'VPPA',
    title: 'Video tracking without consent',
    observation: 'Tracking pixel detected on patient-facing video pages of a Top-10 US healthcare system, firing on video engagement without prior consent.',
    perViolation: '$2,500 / violation', exposure: '$8.9M – $22.4M', low: 8.9, high: 22.4, currency: '$',
  },
  {
    id: 'F-0039', severity: 'high', statute: 'CCPA §1798', law: 'CCPA',
    title: 'Third-party pixel on health pages', exposure: '$2.1M – $8.4M', low: 2.1, high: 8.4, currency: '$',
  },
  {
    id: '', severity: 'high', statute: 'BIPA', law: 'BIPA',
    title: 'Biometric capture without notice', exposure: '$3.4M – $14.2M', low: 3.4, high: 14.2, currency: '$',
  },
  {
    id: 'F-0037', severity: 'med', statute: 'GDPR Art.6', law: 'GDPR',
    title: 'Cross-border data transfer gap', exposure: '€3.5M – €12M', low: 3.5, high: 12, currency: '€',
  },
];

export const sampleReport = {
  domain: 'your-company.com',
  detected: '2026-04-11 09:27:43 UTC',
  risk: 'High',
  jurisdictions: 19,
  findings: 10,
  markets: 7,
  total: '$18M – $58M',
  validated: 'These findings have been validated in a live UK ICO regulatory response.',
};

export const enforcement = [
  { figure: '$7B+', count: 7, prefix: '$', suffix: 'B+', label: 'in global privacy fines and settlements since 2020' },
  { figure: '65%', count: 65, suffix: '%', label: 'of large cyber claims driven by data & privacy' },
  { figure: '32%', count: 32, suffix: '%', label: 'of third-party cyber claims triggered by privacy' },
  { figure: '$11.5M', count: 11.5, decimals: 1, prefix: '$', suffix: 'M', label: 'average BIPA & VPPA settlement (2024–2025)' },
];

export const settlements = ['Kaiser $46M', 'Criteo €40M', 'Mass General Brigham $18.4M', 'BuzzFeed $9M', 'Flo Health $8M'];

export const categories = [
  { name: 'Wrongful Collection', law: 'CCPA / CPRA', text: 'Data collected outside disclosed purpose, beyond scope, or without a lawful basis.', href: '/ccpa-cpra' },
  { name: 'Consent Flow Failures', law: 'GDPR / ePrivacy', text: 'Trackers firing before or after rejection; pre-checked or dark-pattern banners.', href: '/gdpr' },
  { name: 'AI Governance Gaps', law: 'EU AI Act / State AI', text: 'Automated decisioning and model use without disclosure or assessment.', href: '/what-we-find' },
  { name: 'Video & Tracking Disclosure', law: 'VPPA / CIPA', text: 'Pixels and trackers that trigger video-privacy and wiretap exposure.', href: '/vppa' },
  { name: 'Biometric Handling', law: 'BIPA', text: 'Face, voice, or fingerprint processing without notice or consent.', href: '/bipa' },
  { name: "Children's Data", law: 'COPPA', text: 'Collection from minors without verifiable parental consent.', href: '/coppa' },
  { name: 'Data Sharing & Sale', law: 'CCPA / CPRA', text: 'Undisclosed sharing or sale of personal data to third parties.', href: '/ccpa-cpra' },
  { name: 'Retention & Deletion', law: 'GDPR / CCPA', text: 'Data kept beyond stated periods; deletion rights unhonored.', href: '/gdpr' },
];

export const customers = [
  'Bakkt', 'Chubb', 'Blackhawk', 'Grammarly', 'Sompo', 'Paychex', 'PGA', 'my529',
  'Deciphera', 'Herbalife', 'Dayforce', 'American National Bank', 'Columbia', 'CFG', 'McGraw', 'ViaQuest',
];

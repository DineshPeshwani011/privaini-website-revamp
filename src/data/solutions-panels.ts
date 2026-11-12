// The product panel each solutions page carries in its hero, as published on privaini.com.
// Used by the audience pages (their hero) and by /solutions (all six side by side).
import type { StatusRow } from '@/components/StatusPanel.astro';

export interface AudiencePanel {
  key: string;
  audience: string;
  href: string;
  title: string;
  subject: string;
  rows: StatusRow[];
  total: { label: string; value: string; state?: 'ok' | 'warn' | 'bad' | 'info' };
}

export const panels: Record<string, AudiencePanel> = {
  enterprises: {
    key: 'enterprises', audience: 'Enterprises', href: '/enterprises',
    title: 'Program verification', subject: 'your-company.com',
    rows: [
      { label: 'Consent flows', value: 'Verified', state: 'ok' },
      { label: 'Tracker behavior', value: '2 gaps', state: 'warn' },
      { label: 'Policy vs. practice', value: 'Review', state: 'warn' },
      { label: 'Jurisdiction coverage', value: '19 mapped', state: 'ok' },
    ],
    total: { label: 'Program integrity', value: '72%' },
  },
  insurers: {
    key: 'insurers', audience: 'Insurers', href: '/insurers',
    title: 'Portfolio signal', subject: 'book-of-business',
    rows: [
      { label: 'Applicant privacy posture', value: 'Elevated', state: 'warn' },
      { label: 'VPPA exposure', value: '3 policyholders', state: 'warn' },
      { label: 'Consent-flow gaps', value: 'Review', state: 'warn' },
      { label: 'Jurisdictions monitored', value: '42', state: 'ok' },
    ],
    total: { label: 'Portfolio risk', value: '68%' },
  },
  brokers: {
    key: 'brokers', audience: 'Brokers', href: '/brokers',
    title: 'Client submission', subject: 'client-portfolio',
    rows: [
      { label: 'Privacy posture', value: 'Needs review', state: 'warn' },
      { label: 'VPPA / CIPA exposure', value: '2 flags', state: 'warn' },
      { label: 'Submission readiness', value: 'Ready', state: 'ok' },
      { label: 'Clients monitored', value: '18', state: 'ok' },
    ],
    total: { label: 'Renewal risk', value: 'Low', state: 'ok' },
  },
  'law-firms': {
    key: 'law-firms', audience: 'Law Firms', href: '/law-firms',
    title: 'Case signal', subject: 'target-domain.com',
    rows: [
      { label: 'VPPA §2710', value: 'Detected', state: 'warn' },
      { label: 'BIPA collection', value: 'Strict liability', state: 'warn' },
      { label: 'CIPA / session replay', value: 'Present', state: 'warn' },
      { label: 'Statutes mapped', value: '12', state: 'ok' },
    ],
    total: { label: 'Litigation exposure', value: 'High', state: 'bad' },
  },
  'ma-advisors': {
    key: 'ma-advisors', audience: 'M&A Advisors', href: '/ma-advisors',
    title: 'Target diligence', subject: 'target-co.com',
    rows: [
      { label: 'Observable posture', value: 'Elevated', state: 'warn' },
      { label: 'Undisclosed trackers', value: '4 found', state: 'warn' },
      { label: 'Cross-border transfer', value: 'Gap', state: 'warn' },
      { label: 'Jurisdictions', value: '9 mapped', state: 'ok' },
    ],
    total: { label: 'Transfer risk', value: 'High', state: 'bad' },
  },
  'risk-advisors': {
    key: 'risk-advisors', audience: 'Risk Advisors', href: '/risk-advisors',
    title: 'Client assessment', subject: 'any-client.com',
    rows: [
      { label: 'Privacy posture', value: 'Assessed', state: 'warn' },
      { label: 'Third-party runtime', value: '3 vendors', state: 'warn' },
      { label: 'Consent flows', value: 'Review', state: 'warn' },
      { label: 'Jurisdictions', value: '27', state: 'ok' },
    ],
    total: { label: 'Client risk', value: 'Medium', state: 'warn' },
  },
};

export const panelOrder = ['enterprises', 'insurers', 'brokers', 'law-firms', 'ma-advisors', 'risk-advisors'] as const;

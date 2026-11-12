// The seven statute pages (/vppa, /bipa, /ccpa-cpra, /gdpr, /coppa, /wiretapping-cipa, /state-privacy-laws).
// Every figure, panel value and sentence below is carried over from the page of the same slug on privaini.com.
import type { StatusRow } from '@/components/StatusPanel.astro';
import type { Fact } from '@/components/FactGrid.astro';
import type { Point } from '@/components/PointList.astro';

export type StatuteSlug = 'vppa' | 'bipa' | 'ccpa-cpra' | 'gdpr' | 'coppa' | 'wiretapping-cipa' | 'state-privacy-laws';

export interface Statute {
  slug: StatuteSlug;
  /** Short name, as the nav and the related-statutes index print it. */
  name: string;
  /** The law's full name and citation (the old page's eyebrow). */
  act: string;
  /** One figure that sums the statute up in the related-statutes index. */
  teaser: string;
  meta: { title: string; description: string };
  hero: { title: string; lead: string };
  panel: { title: string; rows: StatusRow[]; total: { label: string; value: string; state?: StatusRow['state'] } };
  guide: { heading: string; text: string; items: Point[] };
  penalties: { heading: string; text: string; items: Fact[] };
  who: { heading: string; items: Point[]; note: string };
}

const see = (label: string, href: string) => ({ href, linkLabel: `See ${label}` });

export const statutes: Record<StatuteSlug, Statute> = {
  vppa: {
    slug: 'vppa',
    name: 'VPPA',
    act: 'Video Privacy Protection Act · 18 U.S.C. §2710',
    teaser: '$2,500 per violation',
    meta: {
      title: 'VPPA Exposure | Privaini',
      description: 'The Video Privacy Protection Act: $2,500 per violation. See your VPPA exposure from the outside, mapped to §2710.',
    },
    hero: {
      title: 'VPPA: $11.5M liability hidden in video.',
      lead: 'The Video Privacy Protection Act applies to any site with video content that shares viewing data with third parties, observable from the outside, and the basis for a wave of class actions.',
    },
    panel: {
      title: 'VPPA finding · F-0042',
      rows: [
        { label: 'Video pixel detected', value: 'Meta Pixel', state: 'warn' },
        { label: 'Prior consent', value: 'Absent', state: 'warn' },
        { label: 'Statute triggered', value: '§2710', state: 'ok' },
        { label: 'Class exposure', value: '$8.9M – $22.4M', state: 'info' },
      ],
      total: { label: 'Severity', value: 'High', state: 'bad' },
    },
    guide: {
      heading: 'VPPA: what your business needs to know.',
      text: 'The Video Privacy Protection Act (18 U.S.C. §2710) prohibits sharing video viewing data without informed consent. Passed in 1988, it now drives one of the largest waves of privacy class actions.',
      items: [
        { title: 'What is the VPPA?', text: 'A 1988 federal law (18 U.S.C. §2710) barring disclosure of video viewing records without consent: statutory damages of $2,500 per violation.' },
        { title: 'Who does it apply to?', text: 'Any website or app that embeds video content and uses analytics or advertising trackers: media, healthcare, retail, and education.' },
        { title: 'What Privaini detects', text: 'Video-player pixels, replay widgets, and session-recording tools firing on video engagement without prior informed consent, observed from the outside.' },
      ],
    },
    penalties: {
      heading: 'Statutory damages, multiplied by every viewer.',
      text: 'A 1988 law with a fixed figure per violation, now the basis for a wave of class actions.',
      items: [
        { figure: '$2,500', label: 'statutory damages per violation, 18 U.S.C. §2710' },
        { figure: '$11.5M', count: 11.5, decimals: 1, prefix: '$', suffix: 'M', label: 'average BIPA & VPPA settlement (2024–2025)' },
        { figure: '1988', label: 'the year the VPPA was passed' },
      ],
    },
    who: {
      heading: 'Who faces VPPA exposure.',
      items: [
        { title: 'Insurers', text: 'VPPA is a top driver of cyber claims. Assess policyholder video exposure at underwriting and across the portfolio.', ...see('Insurers', '/insurers') },
        { title: 'Law Firms', text: 'Plaintiff’s counsel files VPPA cases using observable signals. See the same evidence first.', ...see('Law Firms', '/law-firms') },
        { title: 'Brokers', text: 'Client sites with video content create VPPA exposure that surfaces at renewal. Bring the assessment.', ...see('Brokers', '/brokers') },
        { title: 'Risk Advisors', text: 'Assess any client for VPPA exposure: company name and domain only, no cooperation required.', ...see('Risk Advisors', '/risk-advisors') },
      ],
      note: 'Every VPPA finding is mapped to §2710, timestamped, and reproducible, from one assessment.',
    },
  },

  bipa: {
    slug: 'bipa',
    name: 'BIPA',
    act: 'Biometric Information Privacy Act · Illinois',
    teaser: '$5,000 per violation, strict liability',
    meta: {
      title: 'BIPA Exposure | Privaini',
      description: 'BIPA: $5,000 per violation, strict liability, no breach required. See your biometric exposure from the outside.',
    },
    hero: {
      title: 'BIPA: strict liability, $5,000 per violation.',
      lead: 'Illinois’ Biometric Information Privacy Act creates strict liability for collecting biometric identifiers without consent: collection alone triggers standing.',
    },
    panel: {
      title: 'BIPA finding · F-0153',
      rows: [
        { label: 'Biometric capture', value: 'Detected', state: 'warn' },
        { label: 'Written consent', value: 'Absent', state: 'warn' },
        { label: 'Liability standard', value: 'Strict', state: 'ok' },
        { label: 'Per violation', value: '$5,000', state: 'info' },
      ],
      total: { label: 'Severity', value: 'High', state: 'bad' },
    },
    guide: {
      heading: 'BIPA: Illinois’ biometric privacy law.',
      text: 'The Illinois Biometric Information Privacy Act regulates collection of biometric identifiers, and drives massive class actions because collection alone creates standing.',
      items: [
        { title: 'What is BIPA?', text: 'Illinois’ Biometric Information Privacy Act: governs fingerprint, facial-geometry, and voiceprint collection. $5,000 per reckless violation.' },
        { title: 'Why does it drive class actions?', text: 'Strict liability. No breach, no harm required. Collection without written consent is enough.' },
        { title: 'What Privaini detects', text: 'Face-recognition tools, fingerprint scanners, and voice-ID systems, observed from the outside.' },
      ],
    },
    penalties: {
      heading: 'Strict liability, priced per violation.',
      text: 'Fingerprints, facial geometry and voiceprints: collection alone creates standing.',
      items: [
        { figure: '$5,000', label: 'per reckless violation under BIPA' },
        { figure: '$650M', count: 650, prefix: '$', suffix: 'M', label: 'Meta’s BIPA settlement' },
        { figure: '$11.5M', count: 11.5, decimals: 1, prefix: '$', suffix: 'M', label: 'average BIPA & VPPA settlement (2024–2025)' },
      ],
    },
    who: {
      heading: 'Who faces BIPA exposure.',
      items: [
        { title: 'Law Firms', text: 'BIPA creates plaintiff’s standing from collection alone. Meta settled for $650M.', ...see('Law Firms', '/law-firms') },
        { title: 'Insurers', text: 'IL-domiciled insureds with employee or customer biometric collection.', ...see('Insurers', '/insurers') },
        { title: 'M&A Advisors', text: 'Post-close strict liability for any biometric data the target collects.', ...see('M&A Advisors', '/ma-advisors') },
        { title: 'Enterprises', text: 'Employee timekeeping, facial recognition, and retail biometrics.', ...see('Enterprises', '/enterprises') },
      ],
      note: 'Every BIPA finding identifies the biometric collection detected, timestamped and reproducible.',
    },
  },

  'ccpa-cpra': {
    slug: 'ccpa-cpra',
    name: 'CCPA / CPRA',
    act: 'California Consumer Privacy Act · CPRA',
    teaser: '$7,500 per intentional violation',
    meta: {
      title: 'CCPA / CPRA Exposure | Privaini',
      description: 'CCPA/CPRA: $7,500 per intentional violation, no cap. See your California privacy exposure from the outside.',
    },
    hero: {
      title: 'CCPA/CPRA: $7,500 per violation. No cap.',
      lead: 'California’s privacy law applies to businesses serving California residents above revenue or data thresholds: consent flows and opt-out mechanisms are observable from the outside.',
    },
    panel: {
      title: 'CCPA finding · F-0207',
      rows: [
        { label: 'Data sold to third parties', value: 'Detected', state: 'warn' },
        { label: 'Opt-out mechanism', value: 'Missing', state: 'warn' },
        { label: 'Statute triggered', value: '§1798', state: 'ok' },
        { label: 'Per intentional violation', value: '$7,500', state: 'info' },
      ],
      total: { label: 'Severity', value: 'High', state: 'bad' },
    },
    guide: {
      heading: 'California privacy law for businesses.',
      text: 'CCPA and its 2023 CPRA amendment give California residents rights over their data, and give regulators $7,500 per intentional violation, with no cap.',
      items: [
        { title: 'What is CCPA/CPRA?', text: 'California’s Consumer Privacy Act and its 2023 CPRA amendment: consumer rights over data, enforced by the CPPA.' },
        { title: 'Who does it apply to?', text: 'Businesses serving California residents that meet revenue or data-volume thresholds.' },
        { title: 'What Privaini detects', text: 'Missing or broken opt-out links, dark patterns in consent, and undisclosed data sales, from the outside.' },
      ],
    },
    penalties: {
      heading: 'Per intentional violation, with no cap.',
      text: 'Enforced by the California Privacy Protection Agency (CPPA) since the 2023 CPRA amendment.',
      items: [
        { figure: '$7,500', label: 'per intentional violation' },
        { figure: 'No cap', label: 'on the total: every intentional violation counts' },
        { figure: '2023', label: 'the CPRA amendment, enforced by the CPPA' },
      ],
    },
    who: {
      heading: 'Who faces CCPA/CPRA exposure.',
      items: [
        { title: 'Enterprises', text: 'Any company serving California residents above revenue or data thresholds.', ...see('Enterprises', '/enterprises') },
        { title: 'Insurers', text: 'California-domiciled policyholders and their consent practices.', ...see('Insurers', '/insurers') },
        { title: 'Brokers', text: 'Client CCPA compliance (consent flows and opt-out mechanisms) before renewal.', ...see('Brokers', '/brokers') },
        { title: 'M&A Advisors', text: 'California target acquisition. CCPA exposure maps before the deal.', ...see('M&A Advisors', '/ma-advisors') },
      ],
      note: 'Every CCPA/CPRA finding cites the provision triggered, timestamped and reproducible.',
    },
  },

  gdpr: {
    slug: 'gdpr',
    name: 'GDPR',
    act: 'General Data Protection Regulation · EU',
    teaser: '€20M or 4% of global revenue',
    meta: {
      title: 'GDPR Exposure | Privaini',
      description: 'GDPR: up to €20M or 4% of global revenue. See your exposure from the outside, mapped to the article.',
    },
    hero: {
      title: 'GDPR: €20M or 4% of global revenue.',
      lead: 'GDPR applies to any organization processing EU resident data, regardless of where you’re headquartered. Observable from the outside, and enforced with record fines.',
    },
    panel: {
      title: 'GDPR finding · F-0118',
      rows: [
        { label: 'EU data processing', value: 'Detected', state: 'warn' },
        { label: 'Lawful basis', value: 'Missing', state: 'warn' },
        { label: 'Statute triggered', value: 'Art. 6', state: 'ok' },
        { label: 'Class exposure', value: '€3.5M – €12M', state: 'info' },
      ],
      total: { label: 'Severity', value: 'High', state: 'bad' },
    },
    guide: {
      heading: 'GDPR: who it reaches, how regulators check.',
      text: 'The EU’s General Data Protection Regulation applies to any organization processing personal data of EU residents, with fines up to €20M or 4% of global revenue.',
      items: [
        { title: 'What is GDPR?', text: 'The EU’s data protection regulation. Applies extraterritorially under Art. 3: €20M or 4% of global turnover, whichever is higher.' },
        { title: 'Who does it apply to?', text: 'Any organization with a website accessible to EU residents that processes their personal data, including US companies.' },
        { title: 'What Privaini detects', text: 'Consent-mechanism failures, missing privacy disclosures, unlawful transfers, and tracker behavior, from the outside.' },
      ],
    },
    penalties: {
      heading: 'Whichever is higher: €20M or 4%.',
      text: 'Under Art. 3, GDPR reaches any organization processing EU residents’ data, including US companies.',
      items: [
        { figure: '€20M', count: 20, prefix: '€', suffix: 'M', label: 'maximum fine under GDPR' },
        { figure: '4%', count: 4, suffix: '%', label: 'of global turnover, whichever is higher' },
        { figure: 'Art. 3', label: 'extraterritorial reach: EU residents, wherever you are headquartered' },
      ],
    },
    who: {
      heading: 'Who faces GDPR exposure.',
      items: [
        { title: 'Enterprises', text: 'US companies with EU-facing operations, EU employees, or EU customers.', ...see('Enterprises', '/enterprises') },
        { title: 'M&A Advisors', text: 'EU target acquisition requires GDPR assessment pre-LOI (Art. 3 reach).', ...see('M&A Advisors', '/ma-advisors') },
        { title: 'Insurers', text: 'EU-headquartered policyholders create cross-border exposure.', ...see('Insurers', '/insurers') },
        { title: 'Risk Advisors', text: 'Assess any client with EU exposure. 90 countries covered.', ...see('Risk Advisors', '/risk-advisors') },
      ],
      note: 'Every GDPR finding cites the specific article, timestamped and reproducible.',
    },
  },

  coppa: {
    slug: 'coppa',
    name: 'COPPA',
    act: 'Children’s Online Privacy Protection Act · FTC',
    teaser: '$51,744 per violation, per day',
    meta: {
      title: 'COPPA Exposure | Privaini',
      description: 'COPPA: up to $51,744 per violation, per day. See your children’s-data exposure from the outside.',
    },
    hero: {
      title: 'COPPA: $51,744 per violation, per day.',
      lead: 'The Children’s Online Privacy Protection Act creates substantial FTC penalties for collecting children’s data without verifiable parental consent, observable from the outside.',
    },
    panel: {
      title: 'COPPA finding · F-0089',
      rows: [
        { label: 'Children’s data collected', value: 'Detected', state: 'warn' },
        { label: 'Parental consent', value: 'Absent', state: 'warn' },
        { label: 'Enforcer', value: 'FTC', state: 'ok' },
        { label: 'Per violation, per day', value: '$51,744', state: 'info' },
      ],
      total: { label: 'Severity', value: 'High', state: 'bad' },
    },
    guide: {
      heading: 'COPPA: who it covers, how the FTC enforces.',
      text: 'COPPA applies to websites, apps, and online services directed to children under 13, or that knowingly collect their data, with penalties of $51,744 per violation, per day.',
      items: [
        { title: 'What is COPPA?', text: 'The Children’s Online Privacy Protection Act: governs data collection from children under 13, enforced by the FTC.' },
        { title: 'Who does it apply to?', text: 'Online services directed to children, or that knowingly collect data from children under 13.' },
        { title: 'What Privaini detects', text: 'Age-gating mechanisms, parental-consent flows, and child-directed trackers, from the outside.' },
      ],
    },
    penalties: {
      heading: 'Per violation, and again every day.',
      text: 'The FTC enforces COPPA for any service directed to children under 13, or that knowingly collects their data.',
      items: [
        { figure: '$51,744', label: 'per violation, per day' },
        { figure: 'Under 13', label: 'the age COPPA protects; verifiable parental consent required' },
      ],
    },
    who: {
      heading: 'Who faces COPPA exposure.',
      items: [
        { title: 'Enterprises', text: 'Any site accessible to children: gaming, education, retail, and media.', ...see('Enterprises', '/enterprises') },
        { title: 'Insurers', text: 'Policyholders with consumer-facing sites face COPPA exposure.', ...see('Insurers', '/insurers') },
        { title: 'Risk Advisors', text: 'Assess any client for COPPA exposure. Observable children’s-data signals.', ...see('Risk Advisors', '/risk-advisors') },
      ],
      note: 'Every COPPA finding identifies the observable signal and provision, timestamped and reproducible.',
    },
  },

  'wiretapping-cipa': {
    slug: 'wiretapping-cipa',
    name: 'Wiretapping / CIPA',
    act: 'California Invasion of Privacy Act · ECPA',
    teaser: 'Per-interaction exposure',
    meta: {
      title: 'Wiretapping / CIPA Exposure | Privaini',
      description: 'CIPA and ECPA: session replay and chat widgets create per-interaction exposure. See it from the outside.',
    },
    hero: {
      title: 'CIPA: session replay, per-interaction risk.',
      lead: 'California’s Invasion of Privacy Act has become the primary vector for privacy litigation: session replay, chat widgets, and tracking pixels trigger claims, observable from the outside.',
    },
    panel: {
      title: 'CIPA finding · F-0176',
      rows: [
        { label: 'Session replay', value: 'Detected', state: 'warn' },
        { label: 'Consent', value: 'Absent', state: 'warn' },
        { label: 'Statute triggered', value: 'CIPA §631', state: 'ok' },
        { label: 'Claim trend', value: '300%+ surge', state: 'info' },
      ],
      total: { label: 'Severity', value: 'High', state: 'bad' },
    },
    guide: {
      heading: 'CIPA, ECPA and what they mean for you.',
      text: 'Federal and state wiretapping laws now cover session replay, chat interception, and tracking; CIPA has become the fastest-growing privacy litigation vector.',
      items: [
        { title: 'What are ECPA and CIPA?', text: 'ECPA (1968) is the federal wiretapping law. CIPA is California’s, now applied to session replay and chat widgets.' },
        { title: 'What triggers exposure?', text: 'Session-replay scripts, third-party chat widgets that intercept messages, and tracking pixels.' },
        { title: 'What Privaini detects', text: 'Session-recording tools, chat interceptors, and tracking pixels firing without consent, from the outside.' },
      ],
    },
    penalties: {
      heading: 'The fastest-growing litigation vector.',
      text: 'Session replay, chat widgets and tracking pixels each trigger claims, one interaction at a time.',
      items: [
        { figure: '300%+', count: 300, suffix: '%+', label: 'surge in CIPA claims' },
        { figure: '§631', label: 'the CIPA section session replay triggers' },
        { figure: '1968', label: 'the year ECPA, the federal wiretapping law, was passed' },
      ],
    },
    who: {
      heading: 'Who faces CIPA exposure.',
      items: [
        { title: 'Law Firms', text: 'CIPA is the fastest-growing privacy litigation vector. Plaintiff-side signals.', ...see('Law Firms', '/law-firms') },
        { title: 'Brokers', text: 'Client sites with session replay or chat widgets face CIPA claims.', ...see('Brokers', '/brokers') },
        { title: 'Insurers', text: 'CIPA claims are a top driver of cyber loss. Policyholder signals.', ...see('Insurers', '/insurers') },
        { title: 'Risk Advisors', text: 'Assess any client for CIPA exposure. Observable from outside.', ...see('Risk Advisors', '/risk-advisors') },
      ],
      note: 'Every CIPA finding identifies the tool and provision, timestamped and reproducible.',
    },
  },

  'state-privacy-laws': {
    slug: 'state-privacy-laws',
    name: 'State privacy laws',
    act: 'US state privacy laws · 20+ active',
    teaser: '20+ active statutes',
    meta: {
      title: 'State Privacy Laws Exposure | Privaini',
      description: '20+ active US state privacy laws. See your multi-state exposure, jurisdiction-mapped, from the outside.',
    },
    hero: {
      title: '20+ state privacy laws, 19+ pending.',
      lead: 'Virginia, Colorado, Connecticut, Texas, Montana and more: US state privacy laws create multi-state exposure that maps to where your data subjects are.',
    },
    panel: {
      title: 'State finding · F-0231',
      rows: [
        { label: 'Universal opt-out', value: 'Missing', state: 'warn' },
        { label: 'Consumer rights honored', value: 'No', state: 'warn' },
        { label: 'States triggered', value: '6', state: 'ok' },
        { label: 'Exposure', value: 'Multi-state', state: 'info' },
      ],
      total: { label: 'Severity', value: 'High', state: 'bad' },
    },
    guide: {
      heading: 'Which state laws apply, and why it’s hard.',
      text: '25+ US states have enacted or are passing consumer privacy laws. There’s no single standard: each state sets its own applicability thresholds and rules.',
      items: [
        { title: 'Why harder than GDPR?', text: 'No single standard. Each state sets its own thresholds, definitions, and consumer rights; compliance is jurisdiction-by-jurisdiction.' },
        { title: 'Which states are active?', text: 'California (CPRA), Virginia (CDPA), Colorado (CPA), Connecticut, Texas, Montana, and more: 20+ active today.' },
        { title: 'What Privaini detects', text: 'Consent failures, opt-out violations, and data-rights gaps, jurisdiction-mapped from the outside.' },
      ],
    },
    penalties: {
      heading: 'No single standard, state by state.',
      text: 'Same behavior, different rules: exposure follows where your data subjects are.',
      items: [
        { figure: '20+', count: 20, suffix: '+', label: 'active US state privacy statutes' },
        { figure: '19+', count: 19, suffix: '+', label: 'more state laws pending' },
        { figure: '25+', count: 25, suffix: '+', label: 'states that have enacted or are passing consumer privacy laws' },
      ],
    },
    who: {
      heading: 'Who faces state privacy law exposure.',
      items: [
        { title: 'Enterprises', text: 'Multi-state data subjects create multi-state exposure.', ...see('Enterprises', '/enterprises') },
        { title: 'M&A Advisors', text: 'Target’s state exposure maps to data-subject locations.', ...see('M&A Advisors', '/ma-advisors') },
        { title: 'Brokers', text: 'Client state-law compliance observable before renewal.', ...see('Brokers', '/brokers') },
        { title: 'Risk Advisors', text: 'Assess any client across all 20+ active state laws from a domain.', ...see('Risk Advisors', '/risk-advisors') },
      ],
      note: 'Every finding is jurisdiction-mapped to the applicable state statutes, timestamped and reproducible.',
    },
  },
};

/** Nav order, used by the related-statutes index. */
export const statuteOrder: StatuteSlug[] = ['vppa', 'bipa', 'ccpa-cpra', 'gdpr', 'coppa', 'wiretapping-cipa', 'state-privacy-laws'];

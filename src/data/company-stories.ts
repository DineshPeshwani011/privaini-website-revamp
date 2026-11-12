// The four customer stories (one case study, three use cases) and the downloadable full case studies,
// as published on privaini.com. Every figure, name and quotation here appears on the current site.
import { quotes, type Quote } from './quotes';

export type StoryKey = 'bakkt' | 'healthcare' | 'education' | 'aggregator';
type State = 'ok' | 'warn' | 'bad' | 'info';

export interface Panel {
  title: string;
  subject: string;
  rows: { label: string; value: string; state?: State }[];
  total?: { label: string; value: string; state?: State };
  note?: string;
}
export interface StoryPoint { title: string; text: string }
export interface StoryFact { figure: string; label: string; count?: number; prefix?: string; suffix?: string; decimals?: number }
export interface StoryPdf { title: string; text: string; href: string; meta: string }

export interface Story {
  key: StoryKey;
  seo: { title: string; description: string };
  hero: { title: string; lead: string; panel: Panel };
  challenge: { heading: string; items: StoryPoint[]; turn?: string };
  solution: { heading: string; items: StoryPoint[]; note?: string; panel?: Panel; caption?: string };
  numbers: { text: string; items: StoryFact[] };
  quote: Quote;
  pdf?: StoryPdf;
}

// The case-study PDFs from the old site, downloaded into public/media/docs.
const PDF = '/media/docs/';

/** The full case studies offered as PDFs on /case-studies and /resources. */
export const fullCaseStudies = [
  { title: 'A large education publisher', href: `${PDF}privaini-case-study-education-publisher.pdf` },
  { title: 'A top-tier cyber insurer', href: `${PDF}privaini-case-study-cyber-insurer.pdf` },
  { title: 'A top-3 global broker', href: `${PDF}privaini-case-study-global-broker.pdf` },
];

/** The shorter Bakkt quotation used on /case-studies (as published there). */
export const bakktShort: Quote = {
  text: 'Privaini was indispensable for Bakkt; it became our compliance backbone across every jurisdiction we operate in.',
  name: 'Kevin Morgan', org: 'Privacy Officer, Bakkt', initials: 'KM', href: '/bakkt-case-study',
};

/** The featured-case panel on /case-studies. */
export const featuredCase: Panel = {
  title: 'Featured case',
  subject: 'bakkt.com',
  rows: [
    { label: 'Jurisdictions', value: '22 managed', state: 'ok' },
    { label: 'Compliance ops', value: '1 FTE saved', state: 'ok' },
    { label: 'Coordination', value: '−50%', state: 'ok' },
    { label: 'Existing tooling', value: 'Inside-out compliance tooling', state: 'info' },
  ],
  total: { label: 'Outcome', value: 'Scaled' },
};

export const stories: Record<StoryKey, Story> = {
  bakkt: {
    key: 'bakkt',
    seo: {
      title: 'Bakkt Case Study | Privaini',
      description: 'How Bakkt automated global privacy compliance across 22 jurisdictions with Privaini, at half the cost per market.',
    },
    hero: {
      title: 'Bakkt automates privacy compliance.',
      lead: 'How a NYSE-listed digital assets platform moved from a UK ICO notification to continuous, outside-in privacy monitoring, at half the cost per market.',
      panel: {
        title: 'Bakkt Holdings',
        subject: 'financial services',
        rows: [
          { label: 'Company size', value: '~750 employees', state: 'info' },
          { label: 'Markets', value: 'US, EU, UK +8', state: 'info' },
          { label: 'Jurisdictions', value: '22 monitored', state: 'ok' },
        ],
        total: { label: 'Outcome', value: 'Scaled' },
      },
    },
    challenge: {
      heading: 'The challenge.',
      turn: 'In December 2023, a UK ICO notification flagged tracking technologies firing before consent: a UK GDPR and PECR violation.',
      items: [
        { title: 'Regulatory compliance', text: 'Privacy enforcement accelerating across 12 US states, the UK, and the EU, with 20+ more states in development.' },
        { title: 'International expansion', text: 'Seven new markets, each with distinct rules. Internal per-market legal estimate: $200K+.' },
        { title: 'Audit reporting', text: 'NYDFS, SEC, and the board expected auditable, ongoing documentation, not a one-time snapshot.' },
      ],
    },
    solution: {
      heading: 'An outside-in review across 22 jurisdictions.',
      items: [
        { title: 'Tracking Technology Review', text: 'A full audit of Bakkt’s tracking infrastructure: cookies and tags firing before or without consent across the UK, Connecticut, and Utah. Remediated within days.' },
        { title: 'International Expansion Reviews', text: 'Automated regulatory assessments for seven markets (LGPD, PIPL, APP, PDPA & more): consent models, policy-practice alignment, and prioritized gaps.' },
        { title: 'Ongoing Monitoring & Reporting', text: 'Continuous, auditable dashboards by geography, regulation, and status, structured to meet NYDFS and SEC documentation standards.' },
      ],
      note: 'Privaini’s assessment drew on 100+ data sources across privacy, corporate, regulatory, and security signals.',
      panel: {
        title: 'Outside-in review',
        subject: 'bakkt.com',
        rows: [
          { label: 'Tracking technology · UK, CT, UT', value: 'Remediated within days', state: 'ok' },
          { label: 'Expansion reviews · LGPD, PIPL, APP, PDPA', value: '7 markets', state: 'info' },
          { label: 'Monitoring & reporting', value: 'Continuous', state: 'ok' },
          { label: 'Data sources', value: '100+', state: 'info' },
        ],
        total: { label: 'Jurisdictions monitored', value: '22' },
        note: 'Dashboards by geography, regulation and status, structured to NYDFS and SEC documentation standards.',
      },
    },
    numbers: {
      text: 'From incident-response compliance to continuous, proactive monitoring across every market Bakkt operates in.',
      items: [
        { figure: '22', count: 22, label: 'Jurisdictions monitored' },
        { figure: '50%', count: 50, suffix: '%', label: 'Cost reduction per market ($100K saved)' },
        { figure: 'Days', label: 'To remediate the UK ICO findings' },
        { figure: '100+', count: 100, suffix: '+', label: 'Data sources in the assessment' },
      ],
    },
    quote: quotes.bakkt,
    pdf: {
      title: 'Bakkt automates global privacy compliance across 22 jurisdictions',
      text: 'The complete Bakkt story: the UK ICO trigger, the 22-jurisdiction rollout, and continuous outside-in monitoring at half the cost per market.',
      href: `${PDF}bakkt-case-study.pdf`,
      meta: 'Full case study · PDF',
    },
  },

  healthcare: {
    key: 'healthcare',
    seo: {
      title: 'Healthcare Use Case | Privaini',
      description: 'How a top-10 US health system surfaced hidden tracking exposure across patient-facing web properties: VPPA, HIPAA, and wiretapping risk.',
    },
    hero: {
      title: 'What the consent banner missed.',
      lead: 'A top-10 US health system’s patient portals and scheduling tools were leaking data to ad and analytics trackers, creating VPPA, HIPAA, and wiretapping exposure its internal stack couldn’t see.',
      panel: {
        title: 'Health system',
        subject: 'patient-facing web',
        rows: [
          { label: 'Web properties', value: '60+ assessed', state: 'ok' },
          { label: 'Trackers found', value: '40+', state: 'warn' },
          { label: 'PHI-adjacent pages', value: 'Flagged', state: 'bad' },
        ],
        total: { label: 'Remediation', value: 'Days' },
      },
    },
    challenge: {
      heading: 'The challenge.',
      turn: 'A consent banner was in place, but trackers were firing before consent on pages handling health information.',
      items: [
        { title: 'A pixel-litigation wave', text: 'Plaintiffs’ firms target hospital websites for trackers firing on health-information pages; VPPA and wiretapping claims are climbing.' },
        { title: 'An inside-out blind spot', text: 'Consent tools manage what the organization declares. They can’t see what third-party tags actually transmit from a patient’s browser.' },
        { title: 'Multi-state exposure', text: 'Facilities across many states mean overlapping privacy statutes and different enforcement postures to track at once.' },
      ],
    },
    solution: {
      heading: 'Every patient-facing property, reviewed.',
      items: [
        { title: 'Tracking Technology Review', text: 'Audited all patient-facing domains and subdomains; identified trackers firing before or without consent on health-information pages.' },
        { title: 'Jurisdiction Mapping', text: 'Mapped exposure across every state the system operates in: VPPA, HIPAA, CIPA-style wiretapping, and state privacy law.' },
        { title: 'Policy-Practice Gap Analysis', text: 'Compared the published privacy notice to observed data flows and flagged the exact gaps a regulator or litigator would.' },
      ],
      note: 'Findings delivered with prioritized remediation: no access to internal systems, no cooperation required.',
      caption: 'Sample finding F-0042 from Privaini’s published report: a tracking pixel on a top-10 US healthcare system’s patient-facing video pages.',
    },
    numbers: {
      text: 'Representative results from an outside-in assessment of a large, multi-state US health system.',
      items: [
        { figure: '40+', count: 40, suffix: '+', label: 'Third-party trackers identified' },
        { figure: '12', count: 12, label: 'Firing on PHI-adjacent pages' },
        { figure: 'Days', label: 'To remediate the highest-risk findings' },
        { figure: '60+', count: 60, suffix: '+', label: 'Web properties monitored continuously' },
      ],
    },
    quote: quotes.healthcare,
  },

  education: {
    key: 'education',
    seo: {
      title: 'Education Use Case | Privaini',
      description: 'How a national education platform closed COPPA, FERPA, and student-privacy gaps across student-facing web properties before enforcement.',
    },
    hero: {
      title: 'Closing FERPA and COPPA gaps.',
      lead: 'A national education platform’s student-facing pages were running ad and analytics trackers, triggering COPPA, FERPA, and state student-privacy exposure across millions of learners.',
      panel: {
        title: 'EdTech platform',
        subject: 'student-facing web',
        rows: [
          { label: 'Students reached', value: 'Millions', state: 'info' },
          { label: 'Trackers on student pages', value: '25+', state: 'warn' },
          { label: 'COPPA-relevant flows', value: 'Flagged', state: 'bad' },
        ],
        total: { label: 'Remediation', value: 'Days' },
      },
    },
    challenge: {
      heading: 'The challenge.',
      turn: 'Districts increasingly require proof of compliance before renewing, not just a policy PDF.',
      items: [
        { title: 'Trackers on student pages', text: 'Analytics and advertising tags on pages used by minors trigger COPPA and student-privacy exposure that self-attestation doesn’t catch.' },
        { title: 'FERPA & state scrutiny', text: 'The FTC and state attorneys general have sharpened focus on edtech data practices and third-party sharing.' },
        { title: 'Disclosure vs. practice', text: 'Data-sharing disclosures to districts didn’t match the trackers actually observed firing in the wild.' },
      ],
    },
    solution: {
      heading: 'Every student-facing property, in view.',
      items: [
        { title: 'Tracking Review on Student Properties', text: 'Identified third-party tags firing on pages used by K-12 and under-13 users, before and without consent.' },
        { title: 'COPPA / FERPA Mapping', text: 'Mapped every finding to COPPA, FERPA, and 20+ state student-privacy statutes with reproducible evidence.' },
        { title: 'Third-Party Data-Flow Mapping', text: 'Surfaced where student data flowed to advertising and analytics vendors across the platform.' },
      ],
      note: 'Turned a policy claim into evidence districts and regulators can independently verify.',
      panel: {
        title: 'Statute mapping',
        subject: 'student-facing web',
        rows: [
          { label: 'COPPA', value: 'Flows flagged', state: 'bad' },
          { label: 'FERPA', value: 'Mapped', state: 'ok' },
          { label: 'State student-privacy statutes', value: '20+ mapped', state: 'ok' },
          { label: 'Third-party data flows', value: 'Surfaced', state: 'warn' },
        ],
        total: { label: 'Evidence', value: 'Reproducible' },
      },
    },
    numbers: {
      text: 'Representative results from an outside-in assessment of a national K-12 education platform.',
      items: [
        { figure: '25+', count: 25, suffix: '+', label: 'Trackers on student-facing pages' },
        { figure: 'COPPA', label: 'Flows flagged for review' },
        { figure: '20+', count: 20, suffix: '+', label: 'State student-privacy laws mapped' },
        { figure: 'Days', label: 'To remediate the top findings' },
      ],
    },
    quote: quotes.education,
    pdf: {
      title: 'A large education publisher verifies its privacy program from the outside in',
      text: 'The complete study: the challenge, the regulatory landscape (VPPA, COPPA, wiretapping, state laws), and how the gaps were closed.',
      href: fullCaseStudies[0].href,
      meta: 'Full case study · PDF · 13 pages',
    },
  },

  aggregator: {
    key: 'aggregator',
    seo: {
      title: 'Risk Aggregator Use Case | Privaini',
      description: 'How cyber insurers and brokers use Privaini to identify and mitigate privacy risk across an entire book of business.',
    },
    hero: {
      title: 'Privacy risk across an entire book.',
      lead: 'Cyber insurers and brokers use Privaini to assess privacy and AI risk across every company in a portfolio, from the outside: pricing exposure at submission, monitoring it at renewal, and mitigating it before a lawsuit or fine lands.',
      panel: {
        title: 'Portfolio view',
        subject: 'book of business',
        rows: [
          { label: 'Companies assessed', value: 'Hundreds', state: 'ok' },
          { label: 'Signals per company', value: '100+', state: 'ok' },
          { label: 'Jurisdictions', value: '90', state: 'ok' },
        ],
        total: { label: 'View', value: 'Portfolio' },
      },
    },
    challenge: {
      heading: 'Underwriting privacy risk you can’t see.',
      items: [
        { title: 'Security ratings miss privacy', text: 'Breach-focused scores don’t capture VPPA, BIPA, and wiretapping litigation: the fastest-growing driver of cyber claims.' },
        { title: 'No visibility at scale', text: 'Assessing privacy posture across hundreds of applicants and policyholders by questionnaire doesn’t scale and isn’t verifiable.' },
        { title: 'Aggregation blind spots', text: 'Concentrated exposure to the same trackers, vendors, or statutes across a book goes unseen until claims cluster.' },
      ],
    },
    solution: {
      heading: 'One assessment, across the whole book.',
      items: [
        { title: 'Assess at submission', text: 'Score any applicant’s privacy posture from its domain alone (no cooperation required) to price and select risk.' },
        { title: 'Monitor at renewal', text: 'Continuous re-assessment flags new exposure across the portfolio between renewals, not just at bind.' },
        { title: 'Aggregate & mitigate', text: 'See portfolio-wide concentrations by statute, tracker, and vendor; steer policyholders to remediation before exposure becomes loss.' },
      ],
      caption: 'A sample risk briefing from Privaini’s published report: one company, scored from its domain alone.',
    },
    numbers: {
      text: 'Representative results for a cyber insurer or broker deploying Privaini across a portfolio.',
      items: [
        { figure: '100+', count: 100, suffix: '+', label: 'Companies assessed from a domain alone' },
        { figure: 'Zero', label: 'Installation or cooperation required from each company' },
        { figure: '90', count: 90, label: 'Countries + 20 US states mapped' },
        { figure: '2 of 3', count: 2, suffix: ' of 3', label: 'Top brokers use Privaini' },
      ],
    },
    quote: quotes.aggregator,
    pdf: {
      title: 'A top-tier cyber insurer rewrites its underwriting guidelines',
      text: 'The complete study: the statutes driving claims, portfolio-scale assessment from domains alone, and the formal guidelines change.',
      href: fullCaseStudies[1].href,
      meta: 'Full case study · PDF · 13 pages',
    },
  },
};

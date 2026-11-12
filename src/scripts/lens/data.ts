// Content of the Lens world: what a company emits (left), what the lens is made of (centre),
// the briefing that comes out (right) and the decisions it enables (far right).
// Statute descriptions use only figures published on privaini.com.

export type SignalKind = 'statute' | 'signal' | 'icon' | 'company';
export interface Signal {
  text: string;
  kind: SignalKind;
  icon?: IconName;
  at: [number, number, number];
  note?: string;
  href?: string;
  hot?: boolean;
}
export type IconName = 'globe' | 'cookie' | 'doc' | 'code' | 'cloud' | 'camera' | 'db' | 'phone' | 'nodes' | 'grid' | 'shield' | 'finger';

// Only what the site itself talks about: six things a company emits and the six statutes they trigger,
// around the one input Privaini needs. Laid out on a spaced grid (x is multiplied by SPREAD in world.ts)
// so no label overlaps another from the overview or the "what you emit" camera.
export const signals: Signal[] = [
  { text: 'Your Company', kind: 'company', at: [-9.375, -0.5, 0.9], note: 'Your domain. The only input Privaini needs.' },
  // row 1
  { text: 'Cookies', kind: 'signal', icon: 'cookie', at: [-10.625, 2.45, -0.4], note: 'Set before consent, or after a rejection.' },
  { text: 'meta pixels', kind: 'signal', icon: 'code', at: [-6.625, 2.45, -0.6], note: 'Pixels that share page and video events with ad platforms.' },
  // row 2
  { text: 'CIPA', kind: 'statute', at: [-11.875, 1.45, 0.2], note: 'California wiretapping claims over pixels, chat and session replay', href: '/wiretapping-cipa' },
  { text: 'VPPA', kind: 'statute', at: [-9, 1.45, 0.5], hot: true, note: 'Video Privacy Protection Act · $2,500 per violation', href: '/vppa' },
  { text: 'EU AI Act', kind: 'statute', at: [-6.125, 1.45, -0.4], note: 'Automated decisioning without disclosure or assessment.' },
  // row 3
  { text: 'Policy Gaps', kind: 'signal', at: [-11.5, 0.45, 0.3], note: 'What the policy says against what the site does.', href: '/privacy-risk-gap' },
  { text: 'Digital Properties', kind: 'signal', icon: 'grid', at: [-6.5, 0.45, -0.5], note: 'Microsites, subdomains, apps and store listings.' },
  // row 5
  { text: 'GDPR', kind: 'statute', icon: 'db', at: [-12, -1.55, 0.4], note: 'EU · up to €20M or 4% of revenue', href: '/gdpr' },
  { text: 'CCPA', kind: 'statute', icon: 'camera', at: [-9, -1.55, -0.2], note: 'California · $7,500 per intentional violation', href: '/ccpa-cpra' },
  { text: 'Device Fingerprints', kind: 'signal', icon: 'finger', at: [-6.125, -1.55, -0.3], note: 'Identifiers built without a cookie.' },
  // row 6
  { text: 'Dark Patterns', kind: 'signal', icon: 'nodes', at: [-11.25, -2.55, 0.5], note: 'Consent flows designed to steer the choice.' },
  { text: 'BIPA', kind: 'statute', at: [-7.75, -2.55, 0.3], hot: true, note: 'Illinois biometrics · $5,000 per violation, strict liability', href: '/bipa' },
];

export const capabilities = [
  { text: 'Regulatory Repository', angle: 92 },
  { text: 'Market Observations', angle: 60 },
  { text: 'AI Transparency', angle: -8 },
  { text: 'Jurisdiction Mapping', angle: -48 },
  { text: 'Evidence Collection', angle: -80 },
  { text: 'Litigation Patterns', angle: -120 },
  { text: 'Technology Detection', angle: 140 },
];

export const decisions = [
  'Fix what matters first',
  'Quantify exposure',
  'Brief the board',
  'Price or transfer risk',
  'Deal Diligence',
];

export const acts = [
  { key: 'intro', label: 'Overview' },
  { key: 'signals', label: 'What you emit' },
  { key: 'lens', label: 'The lens' },
  { key: 'briefing', label: 'The briefing' },
  { key: 'decisions', label: 'Your decisions' },
] as const;

// The lens story told by the home page's hero (LensHero.astro): its copy, chapters and scroll timing.
import { DEMO_URL } from '@/data/site';

export const lensIntro = {
  title: 'See what regulators & litigators detect, before they do.',
  lead: 'Your program and current stack look inwards. Enforcement and litigation come from outside. Privaini is the lens that shows you what they see, from your domain alone.',
  demo: DEMO_URL,
};

export type LensAct = {
  key: 'signals' | 'lens' | 'briefing' | 'decisions';
  title: string;
  text: string;
  hint?: string;
  link?: { label: string; href: string };
  cta?: boolean;
};

export const lensActs: LensAct[] = [
  {
    key: 'signals',
    title: 'Everything you publish is evidence.',
    text: 'Cookies, pixels, policies, device fingerprints, consent banners. Every property your company runs emits signals, and each one maps to a statute: VPPA, BIPA, CIPA, GDPR, CCPA, the EU AI Act.',
    hint: 'Point at a signal to see what it triggers.',
  },
  {
    key: 'lens',
    title: 'Privaini is the lens.',
    text: 'It reads those signals the way regulators and plaintiffs’ firms do: technology detection, evidence collection, litigation patterns, jurisdiction mapping, market observations, and a regulatory repository covering 90 countries and 20 US states.',
  },
  {
    key: 'briefing',
    title: 'Noise in. Evidence out.',
    text: 'A risk briefing for your company: findings mapped to the statute they trigger, exposure in dollars, timestamped evidence, and remediation staged by what matters most.',
    link: { label: 'See a sample report', href: '/request-a-demo#sample' },
  },
  {
    key: 'decisions',
    title: 'Then you decide.',
    text: 'Fix what matters first. Quantify exposure. Brief the board. Price or transfer the risk. Run diligence on a deal. From your domain alone: no questionnaires, no installation, no IT lift.',
    cta: true,
  },
];

export const lensChapters = ['Overview', 'What you emit', 'The lens', 'The briefing', 'Your decisions'];

// act windows over scroll progress: [fade-in start, in, fade-out start, out], and where each chapter sits
export const lensWindows: [number, number, number, number][] = [
  [-1, 0, 0.07, 0.12], [0.12, 0.17, 0.31, 0.36], [0.36, 0.41, 0.47, 0.5], [0.6, 0.66, 0.81, 0.85], [0.86, 0.91, 2, 3],
];
export const lensChapterAt = [0, 0.2, 0.42, 0.72, 0.95];

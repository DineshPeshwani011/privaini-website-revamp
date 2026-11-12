// What flows into the lens behind each page's hero: the signals and statutes that page is about.
const base = ['cookies', 'meta pixels', 'policy gaps', 'consent banner', 'session replay', 'GDPR', 'CCPA', 'VPPA', 'BIPA', 'CIPA'];

const byPath: Record<string, string[]> = {
  '/risk-intelligence': ['observed behavior', 'statute map', 'VPPA §2710', 'CCPA §1798', 'GDPR Art.6', 'evidence', 'timestamp', 'exposure range'],
  '/platform-overview': ['company name', 'domain', '100+ signals', '90 countries', '20 US states', 'findings', 'exposure', 'remediation'],
  '/how-it-works': ['corporate intelligence', 'policy analysis', 'jurisdiction mapping', 'signal detection', 'microsites', 'subsidiaries', 'trackers'],
  '/what-we-find': ['wrongful collection', 'consent failures', 'AI governance', 'video tracking', 'biometrics', "children's data", 'data sale', 'retention'],
  '/privacy-risk-gap': ['inside-out', 'self-reported', 'questionnaire', 'audit snapshot', 'observed', 'litigated', 'enforced'],
  '/vppa': ['meta pixel', 'video_play', '§2710', 'no prior consent', '$2,500 / violation', 'video page', 'class action'],
  '/bipa': ['face geometry', 'voiceprint', 'fingerprint', 'no written notice', '$5,000 / violation', 'strict liability'],
  '/ccpa-cpra': ['sale or share', 'opt-out signal', 'GPC', '$7,500 / violation', 'pixel on health pages', 'notice at collection'],
  '/gdpr': ['Art. 6', 'Art. 7 consent', 'Art. 13', 'transfer gap', '€20M or 4%', 'pre-checked boxes'],
  '/coppa': ['under 13', 'parental consent', 'ad identifiers', 'education apps', 'FTC'],
  '/wiretapping-cipa': ['session replay', 'chat widget', 'pixel', 'interception', 'CIPA §631', 'two-party consent'],
  '/state-privacy-laws': ['Virginia', 'Colorado', 'Connecticut', 'Texas', 'Montana', 'Oregon', 'opt-out', 'sensitive data'],
  '/solutions': ['enterprises', 'insurers', 'brokers', 'law firms', 'M&A', 'risk advisors', 'one assessment'],
  '/enterprises': ['policy', 'practice', 'consent flows', 'tracker behavior', 'sub-processors', 'AI systems'],
  '/insurers': ['submission', 'renewal', 'claims', 'portfolio', 'privacy loss drivers', 'VPPA', 'BIPA'],
  '/brokers': ['placement', 'client posture', 'renewal', 'differentiation', 'evidence', 'markets'],
  '/law-firms': ['plaintiff scan', 'VPPA', 'BIPA', 'wiretap', 'evidence', 'pre-discovery'],
  '/ma-advisors': ['target', 'diligence', 'liability', 'close', 'AI risk', 'jurisdictions'],
  '/risk-advisors': ['client', 'self-attestation', 'observed', 'statute-mapped', 'no questionnaire'],
  '/partner-program': ['insurers', 'brokers', 'policyholders', 'co-branded', 'monitoring'],
  '/about-us': ['privacy', 'AI', 'outside-in', 'evidence', 'regulators', 'litigators'],
  '/case-studies': ['22 jurisdictions', 'health system', 'education', 'cyber book', 'evidence'],
  '/bakkt-case-study': ['22 jurisdictions', 'OneTrust', 'global expansion', 'UK ICO', 'verification'],
  '/healthcare-use-case': ['patient portal', 'meta pixel', 'HIPAA', 'VPPA', 'wiretap', 'consent banner'],
  '/education-use-case': ['FERPA', 'COPPA', 'districts', 'students', 'attestation'],
  '/risk-aggregator-use-case': ['portfolio', 'submission', 'renewal', 'claims', 'security ratings'],
  '/resources': ['enforcement', 'litigation', 'research', 'case studies', 'field notes'],
  '/request-a-demo': ['your domain', 'findings', 'exposure', 'evidence', 'remediation'],
  '/cookie-notice': ['cookies', 'local storage', 'third parties', 'GPC', 'none'],
};

export function lensSignals(path: string): string[] {
  const p = path.replace(/\.html$/, '').replace(/\/$/, '') || '/';
  return byPath[p] ?? base;
}

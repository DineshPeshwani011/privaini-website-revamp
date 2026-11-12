// Privaini's leadership and advisors, exactly as listed on privaini.com/about-us (names, titles, bios,
// LinkedIn links). Headshots are the site's own photographs, downloaded into public/media.
export interface Person { name: string; role: string; bio?: string; photo: string; linkedin?: string }

export const leadership: Person[] = [
  {
    name: 'Sanjay Saini', role: 'CEO & Co-Founder',
    bio: 'Wharton MBA, BITS Pilani, CIPP/US. 30 years building category-defining B2B software.',
    photo: '/media/headshot-sanjay-saini-d6e5f0.png', linkedin: 'https://www.linkedin.com/in/sanjaysainisf/',
  },
  {
    name: 'John Liu', role: 'Chief Customer Officer & Co-Founder',
    bio: 'JD, U.C. Davis. Leads customer strategy and success across the platform.',
    photo: '/media/headshot-john-liu-4583af.png', linkedin: 'https://www.linkedin.com/in/johnkliu/',
  },
  {
    name: 'Yousong Xiao', role: 'VP Engineering',
    bio: 'MS Computer Science. Leads the outside-in intelligence platform.',
    photo: '/media/headshot-yousong-xiao-91ad71.png', linkedin: 'https://www.linkedin.com/in/yousong/',
  },
  {
    name: 'Ranjani SV', role: 'Head of Privaini India',
    bio: 'Leads Privaini’s India operations and delivery.',
    photo: '/media/headshot-ranjani-sv-0da2d8.png', linkedin: 'https://www.linkedin.com/in/ranjani-sv-0ba823107/',
  },
  {
    name: 'Bill Porter', role: 'Head of Marketing',
    bio: 'Leads marketing and brand for Privaini.',
    photo: '/media/headshot-bill-porter-71e720.png', linkedin: 'https://www.linkedin.com/in/williamphilipporter/',
  },
];

export const advisors: Person[] = [
  { name: 'Maureen Ohlhausen', role: 'Partner, Wilson Sonsini Goodrich & Rosati', photo: '/media/headshot-maureen-ohlhausen-3b0bb5.png' },
  { name: 'Prashant Pai', role: 'EVP, KnowBe4', photo: '/media/headshot-prashant-pai-0a213b.png' },
  { name: 'Pavi Ramamurthy', role: 'Global CISO & CIO, Blackhawk Network', photo: '/media/headshot-pavi-ramamurthy-095e4d.png' },
  { name: 'Mark Kahn', role: 'General Counsel, Twilio', photo: '/media/headshot-mark-kahn-38be23.png' },
  { name: 'David Tennenhouse', role: 'Ex-SVP & Chief Research Officer, VMware', photo: '/media/headshot-david-tennenhouse-c0e511.png' },
  { name: 'Liad Wagman', role: 'Dean, Lally School of Management, Rensselaer Polytechnic Institute', photo: '/media/headshot-liad-wagman-6feefd.png' },
  { name: 'Guy Miasnik', role: 'CEO, AtHoc', photo: '/media/headshot-guy-miasnik-d392f2.png' },
];

// Turns a crawl of the current privaini.com (raw Webflow HTML) into site data:
//   src/data/posts.json   blog posts with sanitized article HTML
//   src/data/legal.json   legal documents
//   src/data/media.json   remote image URL -> local /media path
// and downloads every referenced image into public/media.
//
// usage: node scripts/extract-content.mjs <crawl-dir>   (crawl-dir contains raw/*.html and images.txt)
import { parseHTML } from 'linkedom';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const ROOT = process.env.SITE_ROOT || path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/(\w:)/, '$1')), '..');
const CRAWL = process.argv[2];
if (!CRAWL) throw new Error('usage: node scripts/extract-content.mjs <crawl-dir>');
const RAW = path.join(CRAWL, 'raw');
const DATA = path.join(ROOT, 'src', 'data');
const MEDIA = path.join(ROOT, 'public', 'media');
fs.mkdirSync(DATA, { recursive: true });
fs.mkdirSync(MEDIA, { recursive: true });

const read = (slug) => fs.readFileSync(path.join(RAW, slug + '.html'), 'utf8');
const clean = (s) => (s || '').replace(/\s+/g, ' ').trim();

// ---------- media ----------
const media = {};
function localName(url) {
  const u = new URL(url);
  let base = decodeURIComponent(u.pathname.split('/').pop());
  base = base.replace(/^([0-9a-f]{24}_)+/i, '').replace(/[^a-z0-9._-]+/gi, '-').toLowerCase();
  if (base.length > 80) base = base.slice(-80);
  const hash = crypto.createHash('sha1').update(url).digest('hex').slice(0, 6);
  const ext = path.extname(base) || '.png';
  return `${path.basename(base, ext)}-${hash}${ext}`;
}
const mediaUrl = (url) => {
  if (!url || !/^https:\/\/(cdn\.prod\.website-files\.com|uploads-ssl\.webflow\.com)\//.test(url)) return url;
  if (!media[url]) media[url] = '/media/' + localName(url);
  return media[url];
};

// ---------- html sanitizer ----------
const KEEP = new Set(['p', 'h2', 'h3', 'h4', 'h5', 'ul', 'ol', 'li', 'strong', 'em', 'b', 'i', 'a', 'blockquote', 'figure', 'figcaption', 'img', 'table', 'thead', 'tbody', 'tr', 'td', 'th', 'br', 'hr', 'code', 'sup', 'sub', 'u']);
const UNWRAP = new Set(['div', 'span', 'section', 'article', 'header', 'main', 'font', 'small', 'label', 'center']);
const slugify = (s) => clean(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 64);

function rewriteHref(href) {
  if (!href) return null;
  try {
    const u = new URL(href, 'https://www.privaini.com/');
    if (u.host === 'www.privaini.com' || u.host === 'privaini.com') {
      let p = u.pathname.replace(/\/+$/, '') || '/';
      if (p === '/terms/privacy-policy' || p === '/privacy-policy') p = '/privacy-notice';
      if (p === '/terms-of-use') p = '/terms-of-service';
      if (p === '/case-study/bakkt') p = '/bakkt-case-study';
      if (p === '/features') p = '/platform-overview';
      return p + u.hash;
    }
    if (u.protocol === 'mailto:' || u.protocol === 'tel:' || u.protocol === 'https:' || u.protocol === 'http:') return u.toString();
  } catch { /* fall through */ }
  return null;
}

function sanitize(root, { headings, demote = 0 } = {}) {
  const out = [];
  const walk = (node) => {
    for (const child of [...node.childNodes]) {
      if (child.nodeType === 3) { out.push(escapeText(child.textContent)); continue; }
      if (child.nodeType !== 1) continue;
      let tag = child.tagName.toLowerCase();
      if (['script', 'style', 'noscript', 'svg', 'iframe', 'button', 'form', 'input'].includes(tag)) continue;
      if (tag === 'h1') tag = 'h2';
      if (/^h[2-5]$/.test(tag) && demote) tag = 'h' + Math.min(5, +tag[1] + demote);
      if (UNWRAP.has(tag) || !KEEP.has(tag)) { walk(child); continue; }
      if (tag === 'img') {
        const src = mediaUrl(child.getAttribute('src'));
        if (src) out.push(`<img src="${src}" alt="${escapeAttr(child.getAttribute('alt') || '')}" loading="lazy" decoding="async">`);
        continue;
      }
      if (tag === 'br' || tag === 'hr') { out.push(`<${tag}>`); continue; }
      let attrs = '';
      if (tag === 'a') {
        const href = rewriteHref(child.getAttribute('href'));
        if (!href) { walk(child); continue; }
        const ext = /^https?:/.test(href);
        attrs = ` href="${escapeAttr(href)}"${ext ? ' target="_blank" rel="noopener"' : ''}`;
      }
      if (/^h[2-3]$/.test(tag) && headings) {
        const text = clean(child.textContent);
        if (!text) continue;
        let id = slugify(text) || 'section';
        while (headings.some((h) => h.id === id)) id += '-x';
        headings.push({ id, text, depth: +tag[1] });
        attrs = ` id="${id}"`;
      }
      out.push(`<${tag}${attrs}>`);
      walk(child);
      out.push(`</${tag}>`);
    }
  };
  walk(root);
  return out.join('')
    .replace(/<(p|li|h[2-5]|strong|em|b|i)>\s*<\/\1>/g, '')
    .replace(/<p>(\s|&nbsp;)*<\/p>/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}
const escapeText = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const escapeAttr = (s) => escapeText(s).replace(/"/g, '&quot;');

// ---------- blog ----------
const blog = parseHTML(read('blog')).document;
const cards = new Map();
for (const a of blog.querySelectorAll('a.bcard')) {
  const slug = a.getAttribute('href').replace(/^\/post\//, '');
  cards.set(slug, {
    summary: clean(a.querySelector('.bcard-sum')?.textContent),
    category: clean(a.querySelector('.bcard-cat')?.textContent),
    thumb: a.querySelector('.bcard-img')?.getAttribute('src') || '',
  });
}

const posts = [];
for (const file of fs.readdirSync(RAW).filter((f) => f.startsWith('post__'))) {
  const slug = file.replace(/^post__/, '').replace(/\.html$/, '');
  const { document } = parseHTML(read('post__' + slug));
  const art = document.querySelector('.art');
  if (!art) { console.warn('no article', slug); continue; }
  const metaDivs = [...art.querySelectorAll('.art-meta > div')].map((d) => clean(d.textContent));
  const [author = 'Privaini', dateText = '', readTime = ''] = metaDivs;
  const rich = art.querySelector('.w-richtext');
  const headings = [];
  const html = rich ? sanitize(rich, { headings }) : '';
  const card = cards.get(slug) || {};
  const date = new Date(dateText);
  const authorCard = document.querySelector('.authorcard-row');
  const plain = clean(rich?.textContent || '');
  posts.push({
    slug,
    title: clean(art.querySelector('.art-title')?.textContent),
    category: clean(art.querySelector('.art-cat')?.textContent) || card.category || 'Insights',
    author,
    authorRole: clean(authorCard?.querySelector('.authorcard-role')?.textContent),
    authorBio: clean(authorCard?.querySelector('.authorcard-edu')?.textContent),
    authorImage: mediaUrl(authorCard?.querySelector('img')?.getAttribute('src') || ''),
    date: isNaN(date) ? null : date.toISOString().slice(0, 10),
    dateText,
    readTime,
    hero: mediaUrl(art.querySelector('.art-hero')?.getAttribute('src') || card.thumb || ''),
    summary: card.summary || plain.slice(0, 180).replace(/\s\S*$/, '') + '…',
    headings,
    html,
  });
}
posts.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
fs.writeFileSync(path.join(DATA, 'posts.json'), JSON.stringify(posts, null, 1));
console.log('posts', posts.length);

// ---------- legal ----------
const legal = [];
for (const slug of ['terms-of-service', 'service-agreement', 'privacy-notice']) {
  const { document } = parseHTML(read(slug));
  const slot = document.querySelector('.legal-slot');
  const header = slot.querySelector('header');
  const title = clean(header?.querySelector('h1')?.textContent);
  const updated = clean(header?.querySelector('p')?.textContent);
  header?.remove();
  const headings = [];
  const html = sanitize(slot, { headings });
  legal.push({ slug, title, updated, headings, html });
}
fs.writeFileSync(path.join(DATA, 'legal.json'), JSON.stringify(legal, null, 1));
console.log('legal', legal.length);

// ---------- every other image found in the crawl ----------
for (const url of fs.readFileSync(path.join(CRAWL, 'images.txt'), 'utf8').split(/\r?\n/)) {
  if (/\.(png|jpe?g|webp|svg|gif|avif)$/i.test(url)) mediaUrl(url);
}
fs.writeFileSync(path.join(DATA, 'media.json'), JSON.stringify(media, null, 1));

// ---------- download ----------
const entries = Object.entries(media).filter(([, local]) => !fs.existsSync(path.join(ROOT, 'public', local)));
let done = 0, failed = 0;
const worker = async () => {
  while (entries.length) {
    const [url, local] = entries.shift();
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(res.status);
      fs.writeFileSync(path.join(ROOT, 'public', local), Buffer.from(await res.arrayBuffer()));
      done++;
    } catch (e) { failed++; console.warn('fail', url, String(e)); }
  }
};
await Promise.all(Array.from({ length: 8 }, worker));
console.log('media', Object.keys(media).length, 'downloaded', done, 'failed', failed);

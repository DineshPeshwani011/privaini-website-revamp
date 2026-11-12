// Preview builds only: the site is written for the domain root (href="/v5", src="/media/…").
// GitHub Pages serves it under /<repo>/, so after `astro build` this prefixes every root-relative
// URL in dist/*.html and dist/**/*.css with BASE_PATH. Paths already under the base are left alone.
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join, extname } from 'node:path';

const base = (process.env.BASE_PATH || '').replace(/\/$/, '');
if (!base) { console.log('rebase-dist: no BASE_PATH, nothing to do'); process.exit(0); }

const fix = (p) => (p.startsWith(base + '/') || p === base ? p : base + p);
// a root-relative path: one leading slash, not two (protocol-relative)
const ROOT = /^\/(?!\/)/;

async function* walk(dir) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) yield* walk(p); else yield p;
  }
}

let files = 0;
for await (const file of walk('dist')) {
  const ext = extname(file);
  if (ext !== '.html' && ext !== '.css') continue;
  const src = await readFile(file, 'utf8');
  let out = src;
  if (ext === '.html') {
    out = out.replace(/\b(href|src|poster|action|data-src|content)=(["'])(\/[^"']*)\2/g, (m, a, q, v) =>
      ROOT.test(v) ? `${a}=${q}${fix(v)}${q}` : m);
    out = out.replace(/\bsrcset=(["'])([^"']*)\1/g, (m, q, v) =>
      `srcset=${q}${v.split(',').map((part) => part.replace(/^(\s*)(\/(?!\/)\S*)/, (_, s, u) => s + fix(u))).join(',')}${q}`);
  }
  out = out.replace(/url\((["']?)(\/(?!\/)[^"')]*)\1\)/g, (_, q, v) => `url(${q}${fix(v)}${q})`);
  if (out !== src) { await writeFile(file, out); files++; }
}
console.log(`rebase-dist: prefixed root URLs with ${base} in ${files} files`);

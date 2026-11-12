// sitemap.xml built from the page files plus every blog post.
import type { APIRoute } from 'astro';
import { posts } from '@/data/posts';

const pageFiles = Object.keys(import.meta.glob('./**/*.astro'));

export const GET: APIRoute = ({ site }) => {
  const base = (site ?? new URL('https://www.privaini.com')).origin;
  const routes = pageFiles
    .filter((f) => !f.includes('[') && !/\/(dev-|_)/.test(f))
    .map((f) => f.replace(/^\.\//, '/').replace(/\.astro$/, '').replace(/\/index$/, '/'));
  const urls = [
    ...routes.sort(),
    ...posts.map((p) => `/post/${p.slug}`),
  ];
  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
    .map((u) => `  <url><loc>${base}${u === '/' ? '' : u}</loc></url>`)
    .join('\n')}\n</urlset>\n`;
  return new Response(body, { headers: { 'Content-Type': 'application/xml' } });
};

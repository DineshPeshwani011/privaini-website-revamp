// Typed access to the blog posts extracted from privaini.com (src/data/posts.json).
import raw from './posts.json';

export interface Post {
  slug: string;
  title: string;
  category: string;
  author: string;
  authorRole: string;
  authorBio: string;
  authorImage: string;
  date: string | null;
  dateText: string;
  readTime: string;
  hero: string;
  summary: string;
  headings: { id: string; text: string; depth: number }[];
  html: string;
}

export const posts = (raw as Post[]).slice().sort((a, b) => (b.date ?? '').localeCompare(a.date ?? ''));

export const categories = [...new Set(posts.map((p) => p.category))].sort(
  (a, b) => posts.filter((p) => p.category === b).length - posts.filter((p) => p.category === a).length,
);

export const formatDate = (iso: string | null, fallback = '') =>
  iso ? new Date(iso + 'T00:00:00Z').toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' }) : fallback;

export function related(post: Post, n = 3) {
  const same = posts.filter((p) => p.slug !== post.slug && p.category === post.category);
  const rest = posts.filter((p) => p.slug !== post.slug && p.category !== post.category);
  return [...same, ...rest].slice(0, n);
}

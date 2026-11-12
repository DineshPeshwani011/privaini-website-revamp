import { defineConfig } from 'astro/config';

export default defineConfig({
  // SITE_URL and BASE_PATH are set only by the GitHub Pages preview build (.github/workflows/pages.yml)
  site: process.env.SITE_URL || 'https://www.privaini.com',
  base: process.env.BASE_PATH || '/',
  trailingSlash: 'never',
  build: { format: 'file' },
  prefetch: { prefetchAll: true, defaultStrategy: 'hover' },
  redirects: {
    '/privacy-policy': '/privacy-notice',
    '/terms/privacy-policy': '/privacy-notice',
    '/terms-of-use': '/terms-of-service',
  },
  devToolbar: { enabled: false },
});

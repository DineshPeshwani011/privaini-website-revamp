import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://www.privaini.com',
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

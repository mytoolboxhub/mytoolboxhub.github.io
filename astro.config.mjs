import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://mytoolboxhub.github.io',
  output: 'static',
  build: {
    format: 'directory',
  },
  vite: {
    plugins: [tailwindcss()],
    build: {
      cssMinify: 'lightningcss',
    },
  },
  integrations: [sitemap({
    filter: (page) => !page.includes('/404'),
  })],
  prefetch: {
    defaultStrategy: 'hover',
    prefetchAll: false,
  },
});
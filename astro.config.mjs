// @ts-check
import { defineConfig, passthroughImageService } from 'astro/config';
import node from '@astrojs/node';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://hgvhengelo.nl',
  output: 'static',
  adapter: node({ mode: 'standalone' }),
  server: { host: '0.0.0.0', port: 4321 },
  image: {
    service: passthroughImageService()
  },
  vite: {
    plugins: [tailwindcss()]
  }
});

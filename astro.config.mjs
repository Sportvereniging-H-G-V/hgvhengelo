// @ts-check
import { defineConfig, passthroughImageService } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://hgvhengelo.nl',
  output: 'static',
  adapter: cloudflare(),
  server: { host: '0.0.0.0', port: 4321 },
  image: {
    service: passthroughImageService()
  },
  vite: {
    plugins: [tailwindcss()]
  }
});

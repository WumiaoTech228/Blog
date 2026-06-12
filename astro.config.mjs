import { defineConfig } from 'astro/config';
import keystatic from '@keystatic/astro';
import sitemap from '@astrojs/sitemap';
import cloudflare from '@astrojs/cloudflare';

// https://astro.build/config
export default defineConfig({
  adapter: cloudflare(),
  // 启用 Keystatic 后台和网站地图生成
  integrations: [keystatic(), sitemap()],
  // 站点域名
  site: 'https://blog.110228.xyz',
  vite: {
    build: {
      // Keystatic admin is intentionally shipped as a large isolated client bundle.
      chunkSizeWarningLimit: 3000,
      rollupOptions: {
        onwarn(warning, warn) {
          if (
            warning.code === 'MODULE_LEVEL_DIRECTIVE' &&
            warning.message.includes('"use client"') &&
            warning.id?.includes('@keystar/ui')
          ) {
            return;
          }
          warn(warning);
        },
      },
    },
    optimizeDeps: {
      exclude: ['@keystatic/astro'],
    },
  },
});

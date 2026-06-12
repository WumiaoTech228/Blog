import { SITE } from '../config';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
  const site = context.site?.toString() || SITE.url;
  const sitemap = new URL('/sitemap-index.xml', site).toString();

  return new Response(`User-agent: *\nAllow: /\nDisallow: /keystatic\nSitemap: ${sitemap}\n`, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
}

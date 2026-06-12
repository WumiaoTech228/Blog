import { getCollection } from 'astro:content';
import { SITE } from '../config';
import { getPostSlug, getPublishedPosts } from '../utils/posts';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
  const site = context.site?.toString() || SITE.url;
  const posts = getPublishedPosts(await getCollection('blog'));

  const lines = [
    `# ${SITE.title}`,
    '',
    `> ${SITE.description}`,
    '',
    '## Core Pages',
    '',
    `- [Home](${new URL('/', site).toString()})`,
    `- [Projects](${new URL('/projects/', site).toString()})`,
    `- [Archive](${new URL('/archive/', site).toString()})`,
    `- [About](${new URL('/#about-section', site).toString()})`,
    `- [RSS](${new URL('/rss.xml', site).toString()})`,
    '',
    '## Published Posts',
    '',
    ...posts.map(post => {
      const slug = getPostSlug(post);
      return `- [${post.data.title}](${new URL(`/blog/${slug}/`, site).toString()}): ${post.data.description}`;
    }),
    '',
  ];

  return new Response(lines.join('\n'), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
}

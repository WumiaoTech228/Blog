import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { SITE } from '../config';
import { getPostSlug, getPublishedPosts } from '../utils/posts';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
  const blog = await getCollection('blog');
  const activePosts = getPublishedPosts(blog);

  const currentYear = new Date().getFullYear();

  return rss({
    title: SITE.title,
    description: SITE.description,
    // 如果 config 中配置了 site 则使用，否则回退
    site: context.site?.toString() || SITE.url,
    items: activePosts.map((post) => {
      const slug = getPostSlug(post);
      const siteUrl = context.site?.toString() || SITE.url;
      return {
        title: post.data.title,
        pubDate: post.data.date,
        description: post.data.description,
        link: new URL(`/blog/${slug}/`, siteUrl).toString(),
        author: `${SITE.email} (${SITE.author})`,
        categories: post.data.tags || [],
      };
    }),
    customData: `<language>zh-CN</language><copyright>Copyright (c) ${currentYear} ${SITE.author}</copyright>`,
  });
}

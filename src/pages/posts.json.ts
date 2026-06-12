import { getCollection } from 'astro:content';
import { getPublishedPosts, getPostSlug } from '../utils/posts';

export async function GET() {
  const allPosts = await getCollection('blog');
  const publishedPosts = getPublishedPosts(allPosts);

  const posts = publishedPosts.map(post => ({
    title: post.data.title,
    description: post.data.description,
    slug: getPostSlug(post),
    date: post.data.date.toISOString().split('T')[0],
    tags: post.data.tags || [],
  }));

  return new Response(JSON.stringify(posts), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}

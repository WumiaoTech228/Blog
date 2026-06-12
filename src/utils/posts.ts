import type { CollectionEntry } from 'astro:content';
import { getReadingTime } from './readingTime';

export type BlogPost = CollectionEntry<'blog'>;

export function getPostSlug(post: BlogPost): string {
  return post.id.replace(/\/index$/, '');
}

export function isPublishedPost(post: BlogPost): boolean {
  return !post.data.draft;
}

export function sortPostsByDate<T extends BlogPost>(posts: T[]): T[] {
  return [...posts].sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

export function getPublishedPosts(posts: BlogPost[]): BlogPost[] {
  return sortPostsByDate(posts.filter(isPublishedPost));
}

export function getPostReadingTime(post: BlogPost): number {
  return getReadingTime(post.body || '');
}

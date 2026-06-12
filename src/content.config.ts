import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  // 使用 Astro v6 的 glob 加载器读取内容
  loader: glob({ pattern: '**/index.md', base: './src/content/blog' }),
  schema: ({ image }) => z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    draft: z.boolean().default(false),
    coverImage: image().optional(),
    tags: z.array(z.string()).default([]),
  }),
});

export const collections = { blog };

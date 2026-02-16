import { defineCollection, z } from 'astro:content';

const sportenCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    category: z.enum(['gymnastisch', 'dans', 'balsport', 'breed-sporten']),
    image: z.string(),
    featured: z.boolean().default(false),
    order: z.number().optional(),
    ageGroups: z.array(z.string()).optional(),
    schedule: z.array(z.object({
      day: z.string(),
      time: z.string(),
      location: z.string(),
      ageGroup: z.string().optional(),
    })).optional(),
  }),
});

const pagesCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    image: z.string().optional(),
  }),
});

export const collections = {
  'sporten': sportenCollection,
  'pages': pagesCollection,
};

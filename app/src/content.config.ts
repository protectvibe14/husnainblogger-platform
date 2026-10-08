/**
 * content.config.ts — Astro content collections (v6 format).
 * Owner: Blog.
 *
 * `blog` collection: WordPress-migrated articles live in src/content/blog/*.md
 * Schema enforces the frontmatter every article needs.
 */
import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const blog = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/blog" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.string(), // ISO date: 2026-10-06
    category: z.string().optional(),
    tags: z.array(z.string()).optional(),
    draft: z.boolean().default(false),
    noindex: z.boolean().default(false),
    // WordPress migration: original URL for 301 redirect mapping
    wpUrl: z.string().optional(),
    // WordPress featured image (local /images/wp/* path)
    image: z.string().optional(),
  }),
});

export const collections = { blog };

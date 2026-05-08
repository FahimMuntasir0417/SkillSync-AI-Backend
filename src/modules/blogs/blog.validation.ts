import { z } from "zod";

const blogBodySchema = z.object({
  title: z.string().trim().min(3).max(200),
  excerpt: z.string().trim().min(10).max(500),
  content: z.string().trim().min(20),
  thumbnail: z.url().optional(),
  tags: z.array(z.string().trim().min(1)).default([]),
  published: z.boolean().optional(),
});

export const createBlogSchema = { body: blogBodySchema };
export const updateBlogSchema = {
  params: z.object({ id: z.uuid() }),
  body: blogBodySchema.partial().refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
  }),
};
export const getBlogBySlugSchema = { params: z.object({ slug: z.string().trim().min(1) }) };
export const deleteBlogSchema = { params: z.object({ id: z.uuid() }) };

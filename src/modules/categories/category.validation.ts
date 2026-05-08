import { z } from "zod";

const categoryBodySchema = z.object({
  name: z.string().trim().min(2).max(120),
  description: z.string().trim().max(1000).optional(),
  iconUrl: z.url().optional(),
});

export const categoryValidation = {
  create: {
    body: categoryBodySchema,
  },
  update: {
    params: z.object({
      id: z.uuid(),
    }),
    body: categoryBodySchema.partial().refine((data) => Object.keys(data).length > 0, {
      message: "At least one field is required",
    }),
  },
  getById: {
    params: z.object({
      id: z.uuid(),
    }),
  },
  delete: {
    params: z.object({
      id: z.uuid(),
    }),
  },
};

export const createCategorySchema = categoryValidation.create;
export const updateCategorySchema = categoryValidation.update;
export const getCategoryByIdSchema = categoryValidation.getById;
export const deleteCategorySchema = categoryValidation.delete;

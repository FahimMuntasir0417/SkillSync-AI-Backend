import { z } from "zod";

const createCourseModuleBodySchema = z.object({
  title: z.string().trim().min(2).max(200),
  description: z.string().trim().max(1000).optional(),
  order: z.number().int().positive(),
  courseId: z.uuid(),
});

export const courseModuleValidation = {
  create: {
    body: createCourseModuleBodySchema,
  },
  update: {
    params: z.object({
      id: z.uuid(),
    }),
    body: createCourseModuleBodySchema
      .partial()
      .refine((data) => Object.keys(data).length > 0, {
        message: "At least one field is required",
      }),
  },
  delete: {
    params: z.object({
      id: z.uuid(),
    }),
  },
};

export const createCourseModuleSchema = courseModuleValidation.create;
export const updateCourseModuleSchema = courseModuleValidation.update;
export const deleteCourseModuleSchema = courseModuleValidation.delete;

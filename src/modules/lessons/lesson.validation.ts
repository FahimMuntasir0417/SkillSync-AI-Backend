import { z } from "zod";

const createLessonBodySchema = z.object({
  title: z.string().trim().min(2).max(200),
  content: z.string().trim().min(10),
  videoUrl: z.url().optional(),
  resourceUrl: z.url().optional(),
  order: z.number().int().positive(),
  isPreview: z.boolean().optional(),
  moduleId: z.uuid(),
});

export const lessonValidation = {
  create: {
    body: createLessonBodySchema,
  },
  update: {
    params: z.object({
      id: z.uuid(),
    }),
    body: createLessonBodySchema
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
  complete: {
    params: z.object({
      id: z.uuid(),
    }),
  },
};

export const createLessonSchema = lessonValidation.create;
export const updateLessonSchema = lessonValidation.update;
export const deleteLessonSchema = lessonValidation.delete;
export const completeLessonSchema = lessonValidation.complete;

import { CourseLevel, CourseStatus } from "@prisma/client";
import { z } from "zod";

const createCourseBodySchema = z.object({
  title: z.string().trim().min(3).max(200),
  shortDescription: z.string().trim().min(10).max(300),
  description: z.string().trim().min(20),
  thumbnail: z.url(),
  previewVideoUrl: z.url().optional(),
  price: z.number().nonnegative().optional(),
  level: z.enum(CourseLevel),
  status: z.enum(CourseStatus).optional(),
  durationInHours: z.number().int().nonnegative().optional(),
  categoryId: z.uuid(),
  instructorId: z.uuid().optional(),
});

export const courseValidation = {
  create: {
    body: createCourseBodySchema,
  },
  update: {
    params: z.object({
      id: z.uuid(),
    }),
    body: createCourseBodySchema.partial().refine((data) => Object.keys(data).length > 0, {
      message: "At least one field is required",
    }),
  },
  getBySlug: {
    params: z.object({
      slug: z.string().trim().min(1),
    }),
  },
  related: {
    params: z.object({
      courseId: z.uuid(),
    }),
  },
  delete: {
    params: z.object({
      id: z.uuid(),
    }),
  },
};

export const createCourseSchema = courseValidation.create;
export const updateCourseSchema = courseValidation.update;
export const getCourseBySlugSchema = courseValidation.getBySlug;
export const getRelatedCoursesSchema = courseValidation.related;
export const deleteCourseSchema = courseValidation.delete;

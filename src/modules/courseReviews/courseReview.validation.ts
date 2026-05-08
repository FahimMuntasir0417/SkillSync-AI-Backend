import { z } from "zod";

const reviewBodySchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().trim().max(1000).optional(),
});

export const createCourseReviewSchema = {
  params: z.object({ courseId: z.uuid() }),
  body: reviewBodySchema,
};
export const getCourseReviewsSchema = {
  params: z.object({ courseId: z.uuid() }),
};
export const updateCourseReviewSchema = {
  params: z.object({ id: z.uuid() }),
  body: reviewBodySchema.partial().refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
  }),
};
export const deleteCourseReviewSchema = {
  params: z.object({ id: z.uuid() }),
};

import { z } from "zod";

export const enrollmentValidation = {
  enroll: {
    params: z.object({
      courseId: z.uuid(),
    }),
  },
  getById: {
    params: z.object({
      id: z.uuid(),
    }),
  },
  updateProgress: {
    params: z.object({
      id: z.uuid(),
    }),
    body: z.object({
      progress: z.number().int().min(0).max(100),
    }),
  },
};

export const enrollInCourseSchema = enrollmentValidation.enroll;
export const getEnrollmentByIdSchema = enrollmentValidation.getById;
export const updateEnrollmentProgressSchema =
  enrollmentValidation.updateProgress;

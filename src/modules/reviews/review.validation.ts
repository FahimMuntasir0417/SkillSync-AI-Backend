import { SubmissionStatus } from "@prisma/client";
import { z } from "zod";

const reviewBodySchema = z.object({
  feedback: z.string().trim().min(5),
  score: z.number().int().min(0).max(100).optional(),
  submissionStatus: z.enum(SubmissionStatus),
});

export const createReviewSchema = {
  params: z.object({ id: z.uuid() }),
  body: reviewBodySchema,
};

export const updateReviewSchema = {
  params: z.object({ id: z.uuid() }),
  body: reviewBodySchema.partial().refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
  }),
};

export const getReviewByIdSchema = {
  params: z.object({ id: z.uuid() }),
};

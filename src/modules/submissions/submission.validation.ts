import { SubmissionStatus } from "@prisma/client";
import { z } from "zod";

export const submissionValidation = {
  create: {
    body: z.object({
      assignmentId: z.uuid(),
      githubUrl: z.url().optional(),
      liveUrl: z.url().optional(),
      notes: z.string().trim().max(2000).optional(),
    }),
  },
  getById: {
    params: z.object({
      id: z.uuid(),
    }),
  },
  updateStatus: {
    params: z.object({
      id: z.uuid(),
    }),
    body: z.object({
      status: z.enum(SubmissionStatus),
    }),
  },
};

export const createSubmissionSchema = submissionValidation.create;
export const getSubmissionByIdSchema = submissionValidation.getById;
export const updateSubmissionStatusSchema = submissionValidation.updateStatus;

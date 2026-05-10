import { PromotionRequestStatus } from "@prisma/client";
import { z } from "zod";

export const createPromotionRequestSchema = {
  body: z.object({
    message: z.string().trim().min(10).max(1000).optional(),
  }),
};

export const getPromotionRequestByIdSchema = {
  params: z.object({ id: z.uuid() }),
};

export const reviewPromotionRequestSchema = {
  params: z.object({ id: z.uuid() }),
  body: z.object({
    status: z.enum([
      PromotionRequestStatus.APPROVED,
      PromotionRequestStatus.REJECTED,
    ]),
    adminFeedback: z.string().trim().min(2).max(1000).optional(),
  }),
};

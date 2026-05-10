import { NotificationType } from "@prisma/client";
import { z } from "zod";

export const getNotificationByIdSchema = {
  params: z.object({ id: z.uuid() }),
};

export const createNotificationSchema = {
  body: z.object({
    userId: z.uuid(),
    title: z.string().trim().min(2).max(150),
    message: z.string().trim().min(2).max(1000),
    type: z.enum(NotificationType),
  }),
};

export const updateNotificationReadSchema = {
  params: z.object({ id: z.uuid() }),
};

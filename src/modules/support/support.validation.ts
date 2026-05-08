import { TicketPriority, TicketStatus } from "@prisma/client";
import { z } from "zod";

export const createTicketSchema = {
  body: z.object({
    subject: z.string().trim().min(3).max(200),
    message: z.string().trim().min(10),
    priority: z.enum(TicketPriority).optional(),
  }),
};

export const getTicketByIdSchema = { params: z.object({ id: z.uuid() }) };

export const updateTicketStatusSchema = {
  params: z.object({ id: z.uuid() }),
  body: z.object({ status: z.enum(TicketStatus) }),
};

export const createReplySchema = {
  params: z.object({ id: z.uuid() }),
  body: z.object({ message: z.string().trim().min(2) }),
};

import type { TicketPriority, TicketStatus, UserRole } from "@prisma/client";

export type SupportUser = {
  userId: string;
  email: string;
  role: UserRole;
};

export type CreateTicketInput = {
  subject: string;
  message: string;
  priority?: TicketPriority;
};

export type UpdateTicketStatusInput = {
  status: TicketStatus;
};

export type CreateReplyInput = {
  message: string;
};

export type TicketListQuery = {
  status?: unknown;
  priority?: unknown;
  page?: unknown;
  limit?: unknown;
  sortBy?: unknown;
  sortOrder?: unknown;
};

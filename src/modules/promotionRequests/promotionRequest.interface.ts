import type { PromotionRequestStatus, UserRole } from "@prisma/client";

export type PromotionRequestUser = {
  userId: string;
  email: string;
  role: UserRole;
};

export type CreatePromotionRequestInput = {
  message?: string;
};

export type ReviewPromotionRequestInput = {
  status: Extract<PromotionRequestStatus, "APPROVED" | "REJECTED">;
  adminFeedback?: string;
};

export type PromotionRequestListQuery = {
  status?: unknown;
  page?: unknown;
  limit?: unknown;
  sortBy?: unknown;
  sortOrder?: unknown;
};

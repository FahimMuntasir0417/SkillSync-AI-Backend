import type { NotificationType, UserRole } from "@prisma/client";

export type NotificationUser = {
  userId: string;
  email: string;
  role: UserRole;
};

export type NotificationListQuery = {
  type?: unknown;
  isRead?: unknown;
  page?: unknown;
  limit?: unknown;
  sortBy?: unknown;
  sortOrder?: unknown;
};

export type CreateNotificationInput = {
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
};

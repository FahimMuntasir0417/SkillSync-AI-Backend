import type { AssignmentStatus, UserRole } from "@prisma/client";

export type AssignmentUser = {
  userId: string;
  email: string;
  role: UserRole;
};

export type CreateAssignmentInput = {
  title: string;
  description: string;
  courseId: string;
  dueDate?: Date;
  status?: AssignmentStatus;
};

export type UpdateAssignmentInput = Partial<CreateAssignmentInput>;

export type AssignmentListQuery = {
  courseId?: unknown;
  status?: unknown;
  page?: unknown;
  limit?: unknown;
  sortBy?: unknown;
  sortOrder?: unknown;
};

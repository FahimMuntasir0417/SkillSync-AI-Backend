import type { SubmissionStatus, UserRole } from "@prisma/client";

export type SubmissionUser = {
  userId: string;
  email: string;
  role: UserRole;
};

export type CreateSubmissionInput = {
  assignmentId: string;
  githubUrl?: string;
  liveUrl?: string;
  notes?: string;
};

export type UpdateSubmissionStatusInput = {
  status: SubmissionStatus;
};

export type PendingSubmissionQuery = {
  courseId?: unknown;
  status?: unknown;
  page?: unknown;
  limit?: unknown;
  sortBy?: unknown;
  sortOrder?: unknown;
};

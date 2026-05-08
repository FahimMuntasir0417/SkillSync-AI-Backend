import type { SubmissionStatus, UserRole } from "@prisma/client";

export type ReviewUser = {
  userId: string;
  email: string;
  role: UserRole;
};

export type CreateReviewInput = {
  feedback: string;
  score?: number;
  submissionStatus: SubmissionStatus;
};

export type UpdateReviewInput = Partial<CreateReviewInput>;

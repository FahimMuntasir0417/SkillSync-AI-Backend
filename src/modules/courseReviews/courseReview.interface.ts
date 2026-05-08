import type { UserRole } from "@prisma/client";

export type CourseReviewUser = {
  userId: string;
  email: string;
  role: UserRole;
};

export type CreateCourseReviewInput = {
  rating: number;
  comment?: string;
};

export type UpdateCourseReviewInput = Partial<CreateCourseReviewInput>;

import type { CourseLevel, CourseStatus, UserRole } from "@prisma/client";

export type CourseUser = {
  userId: string;
  email: string;
  role: UserRole;
};

export type CreateCourseInput = {
  title: string;
  shortDescription: string;
  description: string;
  thumbnail: string;
  previewVideoUrl?: string;
  price?: number;
  level: CourseLevel;
  status?: CourseStatus;
  durationInHours?: number;
  categoryId: string;
  instructorId?: string;
};

export type UpdateCourseInput = Partial<CreateCourseInput>;

export type CourseListQuery = {
  search?: unknown;
  categoryId?: unknown;
  level?: unknown;
  status?: unknown;
  minPrice?: unknown;
  maxPrice?: unknown;
  minRating?: unknown;
  instructorId?: unknown;
  page?: unknown;
  limit?: unknown;
  sortBy?: unknown;
  sortOrder?: unknown;
};

export type CourseLimitQuery = {
  limit?: unknown;
};

import type { UserRole } from "@prisma/client";

export type CourseModuleUser = {
  userId: string;
  email: string;
  role: UserRole;
};

export type CreateCourseModuleInput = {
  title: string;
  description?: string;
  order: number;
  courseId: string;
};

export type UpdateCourseModuleInput = Partial<CreateCourseModuleInput>;

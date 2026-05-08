import type { UserRole } from "@prisma/client";

export type LessonUser = {
  userId: string;
  email: string;
  role: UserRole;
};

export type CreateLessonInput = {
  title: string;
  content: string;
  videoUrl?: string;
  resourceUrl?: string;
  order: number;
  isPreview?: boolean;
  moduleId: string;
};

export type UpdateLessonInput = Partial<CreateLessonInput>;

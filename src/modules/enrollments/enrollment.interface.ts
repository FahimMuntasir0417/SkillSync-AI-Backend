import type { UserRole } from "@prisma/client";

export type EnrollmentUser = {
  userId: string;
  email: string;
  role: UserRole;
};

export type UpdateEnrollmentProgressInput = {
  progress: number;
};

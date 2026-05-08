import type { UserRole } from "@prisma/client";

export type UserListQuery = {
  search?: unknown;
  role?: unknown;
  isBlocked?: unknown;
  page?: unknown;
  limit?: unknown;
  sortBy?: unknown;
  sortOrder?: unknown;
};

export type UpdateUserProfileInput = {
  name?: string;
  avatarUrl?: string;
  bio?: string;
};

export type ChangeUserRoleInput = {
  role: UserRole;
};

export type BlockUserInput = {
  isBlocked: boolean;
};

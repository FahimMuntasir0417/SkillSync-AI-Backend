import type { UserRole, UserStatus } from "@prisma/client";

export type JwtPayload = {
  userId: string;
  email: string;
  role: UserRole;
};

export type RegisterInput = {
  name: string;
  email: string;
  password: string;
};

export type LoginInput = {
  email: string;
  password: string;
};

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  image: string | null;
  contactNumber: string | null;
  address: string | null;
  bio: string | null;
  role: UserRole;
  status: UserStatus;
  emailVerified: boolean;
  isBlocked: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type ChangePasswordInput = {
  currentPassword: string;
  newPassword: string;
};

export type VerifyEmailInput = {
  email: string;
  otp: string;
};

export type ForgetPasswordInput = {
  email: string;
};

export type ResetPasswordInput = {
  email: string;
  otp: string;
  newPassword: string;
};

export type UpdateMyProfileInput = {
  name?: string;
  contactNumber?: string;
  address?: string;
  bio?: string;
};

export type GetAllUsersQuery = {
  page?: unknown;
  limit?: unknown;
  searchTerm?: unknown;
  role?: unknown;
  status?: unknown;
};

export type LoginResponse = {
  accessToken: string;
  user: AuthUser;
};

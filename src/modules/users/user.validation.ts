import { UserRole } from "@prisma/client";
import { z } from "zod";

export const userValidation = {
  updateProfile: {
    body: z.object({
      name: z.string().trim().min(2).optional(),
      avatarUrl: z.url().optional(),
      bio: z.string().trim().optional(),
    }),
  },
  changeRole: {
    params: z.object({
      id: z.uuid(),
    }),
    body: z.object({
      role: z.enum(UserRole),
    }),
  },
  blockUser: {
    params: z.object({
      id: z.uuid(),
    }),
    body: z.object({
      isBlocked: z.boolean(),
    }),
  },
};

export const updateUserProfileSchema = userValidation.updateProfile;
export const changeUserRoleSchema = userValidation.changeRole;
export const blockUserSchema = userValidation.blockUser;

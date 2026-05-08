import { z } from "zod";

export const authValidation = {
  register: {
    body: z.object({
      name: z.string().trim().min(2, "Name must be at least 2 characters"),
      email: z.email("Email must be valid").toLowerCase(),
      password: z.string().min(8, "Password must be at least 8 characters"),
    }),
  },
  login: {
    body: z.object({
      email: z.email("Email must be valid").toLowerCase(),
      password: z.string().min(1, "Password is required"),
    }),
  },
  changePassword: {
    body: z.object({
      currentPassword: z.string().min(1, "Current password is required"),
      newPassword: z
        .string()
        .min(8, "New password must be at least 8 characters"),
    }),
  },
  verifyEmail: {
    body: z.object({
      email: z.email("Email must be valid").toLowerCase(),
      otp: z.string().min(6, "OTP must be 6 characters").max(6),
    }),
  },
  forgetPassword: {
    body: z.object({
      email: z.email("Email must be valid").toLowerCase(),
    }),
  },
  resetPassword: {
    body: z.object({
      email: z.email("Email must be valid").toLowerCase(),
      otp: z.string().min(6, "OTP must be 6 characters").max(6),
      newPassword: z.string().min(8, "Password must be at least 8 characters"),
    }),
  },
  updateMyProfile: {
    body: z.object({
      name: z.string().trim().min(2).optional(),
      contactNumber: z.string().trim().min(5).optional(),
      address: z.string().trim().min(2).optional(),
      bio: z.string().trim().optional(),
    }),
  },
};

export const registerSchema = authValidation.register;
export const loginSchema = authValidation.login;
export const changePasswordSchema = authValidation.changePassword;
export const verifyEmailSchema = authValidation.verifyEmail;
export const forgetPasswordSchema = authValidation.forgetPassword;
export const resetPasswordSchema = authValidation.resetPassword;
export const updateMyProfileSchema = authValidation.updateMyProfile;

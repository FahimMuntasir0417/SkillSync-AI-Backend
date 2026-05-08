import crypto from "node:crypto";
import { UserRole } from "@prisma/client";
import { UserStatus } from "@prisma/client";
import httpStatus from "http-status";

import { AppError } from "../../common/errors/AppError.js";
import { sendEmail } from "../../common/utils/email.js";
import { calculatePagination } from "../../common/utils/pagination.js";
import { prisma } from "../../config/prisma.js";
import { env } from "../../config/env.js";
import type {
  AuthUser,
  ChangePasswordInput,
  ForgetPasswordInput,
  GetAllUsersQuery,
  JwtPayload,
  LoginInput,
  LoginResponse,
  RegisterInput,
  ResetPasswordInput,
  UpdateMyProfileInput,
  VerifyEmailInput,
} from "./auth.interface.js";
import {
  comparePassword,
  createToken,
  hashPassword,
  verifyToken,
} from "./auth.utils.js";

const userSelect = {
  id: true,
  name: true,
  email: true,
  avatarUrl: true,
  image: true,
  contactNumber: true,
  address: true,
  bio: true,
  role: true,
  status: true,
  emailVerified: true,
  isBlocked: true,
  createdAt: true,
  updatedAt: true,
} satisfies Record<keyof AuthUser, true>;

type OtpPurpose = "email-verification" | "forget-password";

const createJwtPayload = (user: Pick<AuthUser, "id" | "email" | "role">) => ({
  userId: user.id,
  email: user.email,
  role: user.role,
});

const createAccessToken = (payload: JwtPayload): string =>
  createToken(payload, env.JWT_ACCESS_SECRET, env.JWT_ACCESS_EXPIRES_IN);

const createRefreshToken = (payload: JwtPayload): string =>
  createToken(payload, env.JWT_REFRESH_SECRET, env.JWT_REFRESH_EXPIRES_IN);

const generateOtp = (): string => crypto.randomInt(100000, 1000000).toString();

const getOtpIdentifier = (purpose: OtpPurpose, email: string): string =>
  `${purpose}:${email}`;

const createOtp = async (
  email: string,
  purpose: OtpPurpose,
  expiresInMinutes: number,
): Promise<string> => {
  const otp = generateOtp();
  const identifier = getOtpIdentifier(purpose, email);

  await prisma.verification.deleteMany({
    where: {
      identifier,
    },
  });

  await prisma.verification.create({
    data: {
      id: crypto.randomUUID(),
      identifier,
      value: await hashPassword(otp),
      expiresAt: new Date(Date.now() + expiresInMinutes * 60 * 1000),
    },
  });

  return otp;
};

const sendVerificationOtp = async (user: {
  name: string;
  email: string;
}): Promise<void> => {
  const otp = await createOtp(user.email, "email-verification", 2);

  await sendEmail({
    to: user.email,
    subject: "Verify your SkillSync AI email",
    templateName: "otp",
    templateData: {
      name: user.name,
      title: "Verify your SkillSync AI email",
      otp,
      expiresInMinutes: 2,
    },
  });
};

const verifyOtp = async (
  email: string,
  purpose: OtpPurpose,
  otp: string,
): Promise<void> => {
  const identifier = getOtpIdentifier(purpose, email);
  const verification = await prisma.verification.findFirst({
    where: {
      identifier,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (!verification || verification.expiresAt < new Date()) {
    throw new AppError(httpStatus.UNAUTHORIZED, "OTP is invalid or expired");
  }

  const otpMatched = await comparePassword(otp, verification.value);

  if (!otpMatched) {
    throw new AppError(httpStatus.UNAUTHORIZED, "OTP is invalid or expired");
  }

  await prisma.verification.delete({
    where: {
      id: verification.id,
    },
  });
};

const register = async (
  payload: RegisterInput,
): Promise<LoginResponse & { refreshToken: string }> => {
  const existingUser = await prisma.user.findUnique({
    where: {
      email: payload.email,
    },
    select: {
      id: true,
    },
  });

  if (existingUser) {
    throw new AppError(httpStatus.CONFLICT, "Email already exists");
  }

  const user = await prisma.user.create({
    data: {
      name: payload.name,
      email: payload.email,
      password: await hashPassword(payload.password),
      role: UserRole.STUDENT,
    },
    select: userSelect,
  });

  await sendVerificationOtp(user);

  const jwtPayload = createJwtPayload(user);

  return {
    accessToken: createAccessToken(jwtPayload),
    refreshToken: createRefreshToken(jwtPayload),
    user,
  };
};

const login = async (
  payload: LoginInput,
): Promise<LoginResponse & { refreshToken: string }> => {
  const user = await prisma.user.findUnique({
    where: {
      email: payload.email,
    },
  });

  if (!user || !user.password) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Invalid email or password");
  }

  if (user.isBlocked) {
    throw new AppError(httpStatus.FORBIDDEN, "User account is blocked");
  }

  if (!user.emailVerified) {
    await sendVerificationOtp(user);

    throw new AppError(
      httpStatus.FORBIDDEN,
      "Email is not verified. A new verification OTP has been sent. Please verify your email first, then login again.",
    );
  }

  const passwordMatched = await comparePassword(
    payload.password,
    user.password,
  );

  if (!passwordMatched) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Invalid email or password");
  }

  const jwtPayload = createJwtPayload(user);

  const { password: _password, ...safeUser } = user;

  return {
    accessToken: createAccessToken(jwtPayload),
    refreshToken: createRefreshToken(jwtPayload),
    user: safeUser,
  };
};

const refreshToken = async (token: string | undefined): Promise<string> => {
  if (!token) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Refresh token is required");
  }

  const payload = verifyToken(token, env.JWT_REFRESH_SECRET);

  const user = await prisma.user.findUnique({
    where: {
      id: payload.userId,
    },
    select: {
      id: true,
      email: true,
      role: true,
      isBlocked: true,
    },
  });

  if (!user) {
    throw new AppError(httpStatus.UNAUTHORIZED, "User no longer exists");
  }

  if (user.isBlocked) {
    throw new AppError(httpStatus.FORBIDDEN, "User account is blocked");
  }

  return createAccessToken(createJwtPayload(user));
};

const getMe = async (userId: string): Promise<AuthUser> => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: userSelect,
  });

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  if (user.isBlocked) {
    throw new AppError(httpStatus.FORBIDDEN, "User account is blocked");
  }

  return user;
};

const changePassword = async (
  userId: string,
  payload: ChangePasswordInput,
): Promise<null> => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      id: true,
      password: true,
      isBlocked: true,
    },
  });

  if (!user || !user.password) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  if (user.isBlocked) {
    throw new AppError(httpStatus.FORBIDDEN, "User account is blocked");
  }

  const passwordMatched = await comparePassword(
    payload.currentPassword,
    user.password,
  );

  if (!passwordMatched) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Old password is incorrect");
  }

  await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      password: await hashPassword(payload.newPassword),
    },
  });

  return null;
};

const verifyEmail = async (payload: VerifyEmailInput): Promise<AuthUser> => {
  await verifyOtp(payload.email, "email-verification", payload.otp);

  return prisma.user.update({
    where: {
      email: payload.email,
    },
    data: {
      emailVerified: true,
    },
    select: userSelect,
  });
};

const forgetPassword = async (
  payload: ForgetPasswordInput,
): Promise<{ otp: string | null }> => {
  const user = await prisma.user.findUnique({
    where: {
      email: payload.email,
    },
    select: {
      id: true,
      name: true,
      email: true,
      isBlocked: true,
    },
  });

  if (!user || user.isBlocked) {
    return {
      otp: null,
    };
  }

  const otp = await createOtp(user.email, "forget-password", 2);

  await sendEmail({
    to: user.email,
    subject: "Reset your SkillSync AI password",
    templateName: "otp",
    templateData: {
      name: user.name,
      title: "Reset your SkillSync AI password",
      otp,
      expiresInMinutes: 2,
    },
  });

  return {
    otp: env.NODE_ENV === "development" ? otp : null,
  };
};

const resetPassword = async (payload: ResetPasswordInput): Promise<null> => {
  await verifyOtp(payload.email, "forget-password", payload.otp);

  await prisma.user.update({
    where: {
      email: payload.email,
    },
    data: {
      password: await hashPassword(payload.newPassword),
    },
  });

  return null;
};

const updateMyProfile = async (
  userId: string,
  payload: UpdateMyProfileInput,
  imageUrl?: string,
): Promise<AuthUser> =>
  prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      ...payload,
      ...(imageUrl ? { image: imageUrl, avatarUrl: imageUrl } : {}),
    },
    select: userSelect,
  });

const normalizeRoleFilter = (role: unknown): UserRole | undefined => {
  if (role === "MEMBER") {
    return UserRole.STUDENT;
  }

  if (
    role === UserRole.STUDENT ||
    role === UserRole.INSTRUCTOR ||
    role === UserRole.ADMIN
  ) {
    return role;
  }

  return undefined;
};

const getAllUsers = async (query: GetAllUsersQuery) => {
  const { page, limit, skip } = calculatePagination(query);
  const searchTerm =
    typeof query.searchTerm === "string" ? query.searchTerm : undefined;
  const role = normalizeRoleFilter(query.role);
  const statusFilter =
    query.status === UserStatus.ACTIVE ||
    query.status === UserStatus.BLOCKED ||
    query.status === UserStatus.INACTIVE
      ? query.status
      : undefined;

  const where = {
    isDeleted: false,
    ...(role ? { role } : {}),
    ...(statusFilter ? { status: statusFilter } : {}),
    ...(searchTerm
      ? {
          OR: [
            { name: { contains: searchTerm, mode: "insensitive" as const } },
            { email: { contains: searchTerm, mode: "insensitive" as const } },
            {
              contactNumber: {
                contains: searchTerm,
                mode: "insensitive" as const,
              },
            },
          ],
        }
      : {}),
  };

  const [total, users] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      select: userSelect,
      skip,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
    }),
  ]);

  return {
    meta: {
      page,
      limit,
      total,
      totalPage: Math.ceil(total / limit),
    },
    data: users,
  };
};

export const authService = {
  register,
  login,
  refreshToken,
  getMe,
  changePassword,
  verifyEmail,
  forgetPassword,
  resetPassword,
  updateMyProfile,
  getAllUsers,
};

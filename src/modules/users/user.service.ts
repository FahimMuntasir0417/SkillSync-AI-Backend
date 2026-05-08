import { UserRole } from "@prisma/client";
import type { Prisma } from "@prisma/client";
import httpStatus from "http-status";

import { AppError } from "@/common/errors/AppError.js";
import { calculatePagination } from "@/common/utils/pagination.js";
import { prisma } from "@/config/prisma.js";
import {
  userSearchableFields,
  userSortableFields,
} from "@/modules/users/user.constant.js";
import type {
  BlockUserInput,
  ChangeUserRoleInput,
  UpdateUserProfileInput,
  UserListQuery,
} from "@/modules/users/user.interface.js";

const safeUserSelect = {
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
  needPasswordChange: true,
  isBlocked: true,
  isDeleted: true,
  deletedAt: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UserSelect;

const parseBoolean = (value: unknown): boolean | undefined => {
  if (value === true || value === "true") {
    return true;
  }

  if (value === false || value === "false") {
    return false;
  }

  return undefined;
};

const parseRole = (value: unknown): UserRole | undefined => {
  if (value === "MEMBER") {
    return UserRole.STUDENT;
  }

  if (
    value === UserRole.STUDENT ||
    value === UserRole.INSTRUCTOR ||
    value === UserRole.ADMIN
  ) {
    return value;
  }

  return undefined;
};

const getUsers = async (query: UserListQuery) => {
  const { page, limit, skip, sortBy, sortOrder } = calculatePagination(query);
  const search = typeof query.search === "string" ? query.search : undefined;
  const role = parseRole(query.role);
  const isBlocked = parseBoolean(query.isBlocked);
  const safeSortBy = userSortableFields.includes(
    sortBy as (typeof userSortableFields)[number],
  )
    ? sortBy
    : "createdAt";

  const where: Prisma.UserWhereInput = {
    isDeleted: false,
    ...(role ? { role } : {}),
    ...(isBlocked !== undefined ? { isBlocked } : {}),
    ...(search
      ? {
          OR: userSearchableFields.map((field) => ({
            [field]: {
              contains: search,
              mode: "insensitive",
            },
          })),
        }
      : {}),
  };

  const [total, users] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      select: safeUserSelect,
      skip,
      take: limit,
      orderBy: {
        [safeSortBy]: sortOrder,
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

const getMyProfile = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: safeUserSelect,
  });

  if (!user || user.isDeleted) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  return user;
};

const updateMyProfile = async (
  userId: string,
  payload: UpdateUserProfileInput,
) => {
  await getMyProfile(userId);

  return prisma.user.update({
    where: {
      id: userId,
    },
    data: payload,
    select: safeUserSelect,
  });
};

const changeUserRole = async (id: string, payload: ChangeUserRoleInput) => {
  await getMyProfile(id);

  return prisma.user.update({
    where: {
      id,
    },
    data: {
      role: payload.role,
    },
    select: safeUserSelect,
  });
};

const blockUser = async (id: string, payload: BlockUserInput) => {
  await getMyProfile(id);

  return prisma.user.update({
    where: {
      id,
    },
    data: {
      isBlocked: payload.isBlocked,
    },
    select: safeUserSelect,
  });
};

export const userService = {
  getUsers,
  getMyProfile,
  updateMyProfile,
  changeUserRole,
  blockUser,
};

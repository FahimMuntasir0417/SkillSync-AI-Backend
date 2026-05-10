import {
  NotificationType,
  Prisma,
  PromotionRequestStatus,
  UserRole,
} from "@prisma/client";
import httpStatus from "http-status";

import { AppError } from "../../common/errors/AppError.js";
import { calculatePagination } from "../../common/utils/pagination.js";
import { prisma } from "../../config/prisma.js";
import type {
  CreatePromotionRequestInput,
  PromotionRequestListQuery,
  PromotionRequestUser,
  ReviewPromotionRequestInput,
} from "./promotionRequest.interface.js";

const userSelect = {
  id: true,
  name: true,
  email: true,
  avatarUrl: true,
  image: true,
  role: true,
} satisfies Prisma.UserSelect;

const promotionRequestSelect = {
  id: true,
  userId: true,
  status: true,
  message: true,
  adminFeedback: true,
  reviewedById: true,
  reviewedAt: true,
  createdAt: true,
  updatedAt: true,
  user: { select: userSelect },
  reviewedBy: { select: userSelect },
} satisfies Prisma.PromotionRequestSelect;

const parseStatus = (value: unknown): PromotionRequestStatus | undefined => {
  if (typeof value !== "string") return undefined;
  return Object.values(PromotionRequestStatus).includes(
    value as PromotionRequestStatus,
  )
    ? (value as PromotionRequestStatus)
    : undefined;
};

const getPromotionRequestOrThrow = async (id: string) => {
  const request = await prisma.promotionRequest.findUnique({
    where: { id },
    select: promotionRequestSelect,
  });

  if (!request) {
    throw new AppError(httpStatus.NOT_FOUND, "Promotion request not found");
  }

  return request;
};

const assertOwnerOrAdmin = (
  request: { userId: string },
  user: PromotionRequestUser,
) => {
  if (user.role === UserRole.ADMIN || request.userId === user.userId) {
    return;
  }

  throw new AppError(httpStatus.FORBIDDEN, "You are not authorized");
};

const createPromotionRequest = async (
  payload: CreatePromotionRequestInput,
  user: PromotionRequestUser,
) => {
  if (user.role === UserRole.INSTRUCTOR) {
    throw new AppError(httpStatus.BAD_REQUEST, "You are already an instructor");
  }

  if (user.role === UserRole.ADMIN) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Admins do not need instructor promotion",
    );
  }

  const existingPendingRequest = await prisma.promotionRequest.findFirst({
    where: {
      userId: user.userId,
      status: PromotionRequestStatus.PENDING,
    },
    select: { id: true },
  });

  if (existingPendingRequest) {
    throw new AppError(
      httpStatus.CONFLICT,
      "You already have a pending promotion request",
    );
  }

  return prisma.$transaction(async (tx) => {
    const request = await tx.promotionRequest.create({
      data: {
        userId: user.userId,
        message: payload.message,
      },
      select: promotionRequestSelect,
    });

    const admins = await tx.user.findMany({
      where: { role: UserRole.ADMIN, isDeleted: false, isBlocked: false },
      select: { id: true },
    });

    if (admins.length > 0) {
      await tx.notification.createMany({
        data: admins.map((admin) => ({
          userId: admin.id,
          title: "Instructor promotion request",
          message: `${request.user.name} requested instructor access.`,
          type: NotificationType.SYSTEM,
        })),
      });
    }

    return request;
  });
};

const getPromotionRequests = async (
  query: PromotionRequestListQuery,
  user: PromotionRequestUser,
) => {
  const { page, limit, skip, sortBy, sortOrder } = calculatePagination(query);
  const status = parseStatus(query.status);
  const safeSortBy = sortBy === "updatedAt" ? sortBy : "createdAt";
  const where: Prisma.PromotionRequestWhereInput = {
    ...(user.role === UserRole.ADMIN ? {} : { userId: user.userId }),
    ...(status ? { status } : {}),
  };

  const [total, requests] = await Promise.all([
    prisma.promotionRequest.count({ where }),
    prisma.promotionRequest.findMany({
      where,
      select: promotionRequestSelect,
      skip,
      take: limit,
      orderBy: { [safeSortBy]: sortOrder },
    }),
  ]);

  return {
    meta: { page, limit, total, totalPage: Math.ceil(total / limit) },
    data: requests,
  };
};

const getPromotionRequestById = async (
  id: string,
  user: PromotionRequestUser,
) => {
  const request = await getPromotionRequestOrThrow(id);
  assertOwnerOrAdmin(request, user);

  return request;
};

const reviewPromotionRequest = async (
  id: string,
  payload: ReviewPromotionRequestInput,
  admin: PromotionRequestUser,
) => {
  const request = await getPromotionRequestOrThrow(id);

  if (request.status !== PromotionRequestStatus.PENDING) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Promotion request has already been reviewed",
    );
  }

  return prisma.$transaction(async (tx) => {
    if (payload.status === PromotionRequestStatus.APPROVED) {
      await tx.user.update({
        where: { id: request.userId },
        data: { role: UserRole.INSTRUCTOR },
      });
    }

    const updatedRequest = await tx.promotionRequest.update({
      where: { id },
      data: {
        status: payload.status,
        adminFeedback: payload.adminFeedback,
        reviewedById: admin.userId,
        reviewedAt: new Date(),
      },
      select: promotionRequestSelect,
    });

    await tx.notification.create({
      data: {
        userId: request.userId,
        title:
          payload.status === PromotionRequestStatus.APPROVED
            ? "Instructor request approved"
            : "Instructor request rejected",
        message:
          payload.status === PromotionRequestStatus.APPROVED
            ? "Your instructor promotion request was approved."
            : "Your instructor promotion request was rejected.",
        type: NotificationType.SYSTEM,
      },
    });

    return updatedRequest;
  });
};

export const promotionRequestService = {
  createPromotionRequest,
  getPromotionRequests,
  getPromotionRequestById,
  reviewPromotionRequest,
};

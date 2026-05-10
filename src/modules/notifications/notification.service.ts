import { NotificationType, Prisma, UserRole } from "@prisma/client";
import httpStatus from "http-status";

import { AppError } from "../../common/errors/AppError.js";
import { calculatePagination } from "../../common/utils/pagination.js";
import { prisma } from "../../config/prisma.js";
import type {
  CreateNotificationInput,
  NotificationListQuery,
  NotificationUser,
} from "./notification.interface.js";

const notificationSelect = {
  id: true,
  userId: true,
  title: true,
  message: true,
  type: true,
  isRead: true,
  createdAt: true,
} satisfies Prisma.NotificationSelect;

const parseBoolean = (value: unknown): boolean | undefined => {
  if (value === true || value === "true") return true;
  if (value === false || value === "false") return false;
  return undefined;
};

const parseType = (value: unknown): NotificationType | undefined => {
  if (typeof value !== "string") return undefined;
  return Object.values(NotificationType).includes(value as NotificationType)
    ? (value as NotificationType)
    : undefined;
};

const getNotificationOrThrow = async (id: string) => {
  const notification = await prisma.notification.findUnique({
    where: { id },
    select: notificationSelect,
  });

  if (!notification) {
    throw new AppError(httpStatus.NOT_FOUND, "Notification not found");
  }

  return notification;
};

const assertOwnerOrAdmin = (
  notification: { userId: string },
  user: NotificationUser,
) => {
  if (user.role === UserRole.ADMIN || notification.userId === user.userId) {
    return;
  }

  throw new AppError(httpStatus.FORBIDDEN, "You are not authorized");
};

const createNotification = async (payload: CreateNotificationInput) => {
  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: { id: true, isDeleted: true },
  });

  if (!user || user.isDeleted) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  return prisma.notification.create({
    data: payload,
    select: notificationSelect,
  });
};

const getMyNotifications = async (
  query: NotificationListQuery,
  user: NotificationUser,
) => {
  const { page, limit, skip, sortBy, sortOrder } = calculatePagination(query);
  const type = parseType(query.type);
  const isRead = parseBoolean(query.isRead);
  const safeSortBy = sortBy === "createdAt" ? sortBy : "createdAt";
  const where: Prisma.NotificationWhereInput = {
    userId: user.userId,
    ...(type ? { type } : {}),
    ...(isRead !== undefined ? { isRead } : {}),
  };

  const [total, notifications] = await Promise.all([
    prisma.notification.count({ where }),
    prisma.notification.findMany({
      where,
      select: notificationSelect,
      skip,
      take: limit,
      orderBy: { [safeSortBy]: sortOrder },
    }),
  ]);

  return {
    meta: { page, limit, total, totalPage: Math.ceil(total / limit) },
    data: notifications,
  };
};

const getNotificationById = async (id: string, user: NotificationUser) => {
  const notification = await getNotificationOrThrow(id);
  assertOwnerOrAdmin(notification, user);
  return notification;
};

const markAsRead = async (id: string, user: NotificationUser) => {
  const notification = await getNotificationOrThrow(id);
  assertOwnerOrAdmin(notification, user);

  return prisma.notification.update({
    where: { id },
    data: { isRead: true },
    select: notificationSelect,
  });
};

const markAllAsRead = async (user: NotificationUser) => {
  await prisma.notification.updateMany({
    where: { userId: user.userId, isRead: false },
    data: { isRead: true },
  });

  return prisma.notification.findMany({
    where: { userId: user.userId },
    select: notificationSelect,
    orderBy: { createdAt: "desc" },
  });
};

const deleteNotification = async (id: string, user: NotificationUser) => {
  const notification = await getNotificationOrThrow(id);
  assertOwnerOrAdmin(notification, user);

  await prisma.notification.delete({ where: { id } });
  return null;
};

const getUnreadCount = async (user: NotificationUser) => {
  const count = await prisma.notification.count({
    where: { userId: user.userId, isRead: false },
  });

  return { unreadCount: count };
};

export const notificationService = {
  createNotification,
  getMyNotifications,
  getNotificationById,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getUnreadCount,
};

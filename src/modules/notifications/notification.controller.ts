import httpStatus from "http-status";

import { AppError } from "../../common/errors/AppError.js";
import { catchAsync } from "../../common/utils/catchAsync.js";
import { sendResponse } from "../../common/utils/sendResponse.js";
import { notificationService } from "./notification.service.js";

const getId = (value: string | string[] | undefined, label: string) => {
  if (!value || Array.isArray(value)) {
    throw new AppError(httpStatus.BAD_REQUEST, `${label} is required`);
  }

  return value;
};

const createNotification = catchAsync(async (req, res) => {
  const notification = await notificationService.createNotification(req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    message: "Notification created successfully",
    data: notification,
  });
});

const getMyNotifications = catchAsync(async (req, res) => {
  const result = await notificationService.getMyNotifications(
    req.query,
    req.user,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: "Notifications retrieved successfully",
    meta: result.meta,
    data: result.data,
  });
});

const getNotificationById = catchAsync(async (req, res) => {
  const notification = await notificationService.getNotificationById(
    getId(req.params.id, "Notification id"),
    req.user,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: "Notification retrieved successfully",
    data: notification,
  });
});

const markAsRead = catchAsync(async (req, res) => {
  const notification = await notificationService.markAsRead(
    getId(req.params.id, "Notification id"),
    req.user,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: "Notification marked as read successfully",
    data: notification,
  });
});

const markAllAsRead = catchAsync(async (req, res) => {
  const notifications = await notificationService.markAllAsRead(req.user);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: "Notifications marked as read successfully",
    data: notifications,
  });
});

const deleteNotification = catchAsync(async (req, res) => {
  const result = await notificationService.deleteNotification(
    getId(req.params.id, "Notification id"),
    req.user,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: "Notification deleted successfully",
    data: result,
  });
});

const getUnreadCount = catchAsync(async (req, res) => {
  const result = await notificationService.getUnreadCount(req.user);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: "Unread notification count retrieved successfully",
    data: result,
  });
});

export const notificationController = {
  createNotification,
  getMyNotifications,
  getNotificationById,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getUnreadCount,
};

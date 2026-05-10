import { UserRole } from "@prisma/client";
import { Router } from "express";

import { checkAuth } from "../../common/middlewares/checkAuth.js";
import { roleGuard } from "../../common/middlewares/roleGuard.js";
import { validateRequest } from "../../common/middlewares/validateRequest.js";
import { notificationController } from "./notification.controller.js";
import {
  createNotificationSchema,
  getNotificationByIdSchema,
  updateNotificationReadSchema,
} from "./notification.validation.js";

export const notificationRoute = Router();

notificationRoute.post(
  "/",
  checkAuth(),
  roleGuard(UserRole.ADMIN),
  validateRequest(createNotificationSchema),
  notificationController.createNotification,
);

notificationRoute.get(
  "/",
  checkAuth(),
  notificationController.getMyNotifications,
);
notificationRoute.get(
  "/unread-count",
  checkAuth(),
  notificationController.getUnreadCount,
);
notificationRoute.patch(
  "/read-all",
  checkAuth(),
  notificationController.markAllAsRead,
);

notificationRoute.get(
  "/:id",
  checkAuth(),
  validateRequest(getNotificationByIdSchema),
  notificationController.getNotificationById,
);

notificationRoute.patch(
  "/:id/read",
  checkAuth(),
  validateRequest(updateNotificationReadSchema),
  notificationController.markAsRead,
);

notificationRoute.delete(
  "/:id",
  checkAuth(),
  validateRequest(getNotificationByIdSchema),
  notificationController.deleteNotification,
);

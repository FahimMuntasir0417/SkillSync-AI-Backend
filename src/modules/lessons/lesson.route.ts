import { UserRole } from "@prisma/client";
import { Router } from "express";

import { checkAuth } from "../../common/middlewares/checkAuth.js";
import { roleGuard } from "../../common/middlewares/roleGuard.js";
import { validateRequest } from "../../common/middlewares/validateRequest.js";
import { lessonController } from "./lesson.controller.js";
import {
  completeLessonSchema,
  createLessonSchema,
  deleteLessonSchema,
  updateLessonSchema,
} from "./lesson.validation.js";

export const lessonRoute = Router();

lessonRoute.post(
  "/",
  checkAuth(),
  roleGuard(UserRole.ADMIN, UserRole.INSTRUCTOR),
  validateRequest(createLessonSchema),
  lessonController.createLesson,
);

lessonRoute.patch(
  "/:id/complete",
  checkAuth(),
  roleGuard(UserRole.STUDENT),
  validateRequest(completeLessonSchema),
  lessonController.completeLesson,
);

lessonRoute.patch(
  "/:id",
  checkAuth(),
  roleGuard(UserRole.ADMIN, UserRole.INSTRUCTOR),
  validateRequest(updateLessonSchema),
  lessonController.updateLesson,
);

lessonRoute.delete(
  "/:id",
  checkAuth(),
  roleGuard(UserRole.ADMIN, UserRole.INSTRUCTOR),
  validateRequest(deleteLessonSchema),
  lessonController.deleteLesson,
);

import { UserRole } from "@prisma/client";
import { Router } from "express";

import { checkAuth } from "../../common/middlewares/checkAuth.js";
import { roleGuard } from "../../common/middlewares/roleGuard.js";
import { validateRequest } from "../../common/middlewares/validateRequest.js";
import { enrollmentController } from "./enrollment.controller.js";
import {
  enrollInCourseSchema,
  getEnrollmentByIdSchema,
  updateEnrollmentProgressSchema,
} from "./enrollment.validation.js";

export const enrollmentRoute = Router();

enrollmentRoute.post(
  "/:courseId",
  checkAuth(),
  roleGuard(UserRole.STUDENT),
  validateRequest(enrollInCourseSchema),
  enrollmentController.enrollInCourse,
);

enrollmentRoute.get(
  "/my-classes",
  checkAuth(),
  roleGuard(UserRole.STUDENT),
  enrollmentController.getMyClasses,
);

enrollmentRoute.get(
  "/:id",
  checkAuth(),
  validateRequest(getEnrollmentByIdSchema),
  enrollmentController.getEnrollmentById,
);

enrollmentRoute.patch(
  "/:id/progress",
  checkAuth(),
  roleGuard(UserRole.STUDENT),
  validateRequest(updateEnrollmentProgressSchema),
  enrollmentController.updateEnrollmentProgress,
);

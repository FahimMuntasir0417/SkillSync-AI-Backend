import { UserRole } from "@prisma/client";
import { Router } from "express";

import { checkAuth } from "../../common/middlewares/checkAuth.js";
import { roleGuard } from "../../common/middlewares/roleGuard.js";
import { validateRequest } from "../../common/middlewares/validateRequest.js";
import { courseModuleController } from "./courseModule.controller.js";
import {
  createCourseModuleSchema,
  deleteCourseModuleSchema,
  updateCourseModuleSchema,
} from "./courseModule.validation.js";

export const courseModuleRoute = Router();

courseModuleRoute.post(
  "/",
  checkAuth(),
  roleGuard(UserRole.ADMIN, UserRole.INSTRUCTOR),
  validateRequest(createCourseModuleSchema),
  courseModuleController.createCourseModule,
);

courseModuleRoute.patch(
  "/:id",
  checkAuth(),
  roleGuard(UserRole.ADMIN, UserRole.INSTRUCTOR),
  validateRequest(updateCourseModuleSchema),
  courseModuleController.updateCourseModule,
);

courseModuleRoute.delete(
  "/:id",
  checkAuth(),
  roleGuard(UserRole.ADMIN, UserRole.INSTRUCTOR),
  validateRequest(deleteCourseModuleSchema),
  courseModuleController.deleteCourseModule,
);

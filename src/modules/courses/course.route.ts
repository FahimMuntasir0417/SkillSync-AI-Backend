import { UserRole } from "@prisma/client";
import { Router } from "express";

import { checkAuth } from "../../common/middlewares/checkAuth.js";
import { roleGuard } from "../../common/middlewares/roleGuard.js";
import { validateRequest } from "../../common/middlewares/validateRequest.js";
import { courseController } from "./course.controller.js";
import {
  createCourseSchema,
  deleteCourseSchema,
  getCourseBySlugSchema,
  getRelatedCoursesSchema,
  updateCourseSchema,
} from "./course.validation.js";

export const courseRoute = Router();

courseRoute.post(
  "/",
  checkAuth(),
  roleGuard(UserRole.ADMIN, UserRole.INSTRUCTOR),
  validateRequest(createCourseSchema),
  courseController.createCourse,
);

courseRoute.get("/", courseController.getCourses);
courseRoute.get("/featured", courseController.getFeaturedCourses);
courseRoute.get(
  "/related/:courseId",
  validateRequest(getRelatedCoursesSchema),
  courseController.getRelatedCourses,
);
courseRoute.get(
  "/:slug",
  validateRequest(getCourseBySlugSchema),
  courseController.getCourseBySlug,
);

courseRoute.patch(
  "/:id",
  checkAuth(),
  roleGuard(UserRole.ADMIN, UserRole.INSTRUCTOR),
  validateRequest(updateCourseSchema),
  courseController.updateCourse,
);

courseRoute.delete(
  "/:id",
  checkAuth(),
  roleGuard(UserRole.ADMIN, UserRole.INSTRUCTOR),
  validateRequest(deleteCourseSchema),
  courseController.deleteCourse,
);

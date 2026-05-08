import { UserRole } from "@prisma/client";
import { Router } from "express";

import { checkAuth } from "../../common/middlewares/checkAuth.js";
import { roleGuard } from "../../common/middlewares/roleGuard.js";
import { validateRequest } from "../../common/middlewares/validateRequest.js";
import { courseReviewController } from "./courseReview.controller.js";
import { createCourseReviewSchema, deleteCourseReviewSchema, getCourseReviewsSchema, updateCourseReviewSchema } from "./courseReview.validation.js";

export const courseReviewRoute = Router();

courseReviewRoute.post(
  "/courses/:courseId/reviews",
  checkAuth(),
  roleGuard(UserRole.STUDENT),
  validateRequest(createCourseReviewSchema),
  courseReviewController.createCourseReview,
);
courseReviewRoute.get(
  "/courses/:courseId/reviews",
  validateRequest(getCourseReviewsSchema),
  courseReviewController.getCourseReviews,
);
courseReviewRoute.patch(
  "/course-reviews/:id",
  checkAuth(),
  validateRequest(updateCourseReviewSchema),
  courseReviewController.updateCourseReview,
);
courseReviewRoute.delete(
  "/course-reviews/:id",
  checkAuth(),
  validateRequest(deleteCourseReviewSchema),
  courseReviewController.deleteCourseReview,
);

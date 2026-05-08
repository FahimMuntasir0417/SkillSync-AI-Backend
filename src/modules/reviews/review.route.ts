import { UserRole } from "@prisma/client";
import { Router } from "express";

import { checkAuth } from "../../common/middlewares/checkAuth.js";
import { roleGuard } from "../../common/middlewares/roleGuard.js";
import { validateRequest } from "../../common/middlewares/validateRequest.js";
import { reviewController } from "./review.controller.js";
import { createReviewSchema, getReviewByIdSchema, updateReviewSchema } from "./review.validation.js";

export const reviewRoute = Router();

reviewRoute.post(
  "/submissions/:id/review",
  checkAuth(),
  roleGuard(UserRole.ADMIN, UserRole.INSTRUCTOR),
  validateRequest(createReviewSchema),
  reviewController.createReview,
);
reviewRoute.patch(
  "/reviews/:id",
  checkAuth(),
  roleGuard(UserRole.ADMIN, UserRole.INSTRUCTOR),
  validateRequest(updateReviewSchema),
  reviewController.updateReview,
);
reviewRoute.get(
  "/reviews/:id",
  checkAuth(),
  validateRequest(getReviewByIdSchema),
  reviewController.getReviewById,
);

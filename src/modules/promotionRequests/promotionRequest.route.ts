import { UserRole } from "@prisma/client";
import { Router } from "express";

import { checkAuth } from "../../common/middlewares/checkAuth.js";
import { roleGuard } from "../../common/middlewares/roleGuard.js";
import { validateRequest } from "../../common/middlewares/validateRequest.js";
import { promotionRequestController } from "./promotionRequest.controller.js";
import {
  createPromotionRequestSchema,
  getPromotionRequestByIdSchema,
  reviewPromotionRequestSchema,
} from "./promotionRequest.validation.js";

export const promotionRequestRoute = Router();

promotionRequestRoute.post(
  "/",
  checkAuth(),
  roleGuard(UserRole.STUDENT),
  validateRequest(createPromotionRequestSchema),
  promotionRequestController.createPromotionRequest,
);

promotionRequestRoute.get(
  "/",
  checkAuth(),
  promotionRequestController.getPromotionRequests,
);

promotionRequestRoute.get(
  "/:id",
  checkAuth(),
  validateRequest(getPromotionRequestByIdSchema),
  promotionRequestController.getPromotionRequestById,
);

promotionRequestRoute.patch(
  "/:id/review",
  checkAuth(),
  roleGuard(UserRole.ADMIN),
  validateRequest(reviewPromotionRequestSchema),
  promotionRequestController.reviewPromotionRequest,
);

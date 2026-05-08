import { UserRole } from "@prisma/client";
import { Router } from "express";

import { checkAuth } from "../../common/middlewares/checkAuth.js";
import { roleGuard } from "../../common/middlewares/roleGuard.js";
import { validateRequest } from "../../common/middlewares/validateRequest.js";
import { userController } from "./user.controller.js";
import {
  blockUserSchema,
  changeUserRoleSchema,
  updateUserProfileSchema,
} from "./user.validation.js";

export const userRoute = Router();

userRoute.get(
  "/",
  checkAuth(),
  roleGuard(UserRole.ADMIN),
  userController.getUsers,
);
userRoute.get("/me", checkAuth(), userController.getMyProfile);
userRoute.patch(
  "/me",
  checkAuth(),
  validateRequest(updateUserProfileSchema),
  userController.updateMyProfile,
);
userRoute.patch(
  "/:id/role",
  checkAuth(),
  roleGuard(UserRole.ADMIN),
  validateRequest(changeUserRoleSchema),
  userController.changeUserRole,
);
userRoute.patch(
  "/:id/block",
  checkAuth(),
  roleGuard(UserRole.ADMIN),
  validateRequest(blockUserSchema),
  userController.blockUser,
);

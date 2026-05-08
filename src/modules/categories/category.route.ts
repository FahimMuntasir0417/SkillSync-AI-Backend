import { UserRole } from "@prisma/client";
import { Router } from "express";

import { checkAuth } from "../../common/middlewares/checkAuth.js";
import { roleGuard } from "../../common/middlewares/roleGuard.js";
import { validateRequest } from "../../common/middlewares/validateRequest.js";
import { categoryController } from "./category.controller.js";
import {
  createCategorySchema,
  deleteCategorySchema,
  getCategoryByIdSchema,
  updateCategorySchema,
} from "./category.validation.js";

export const categoryRoute = Router();

categoryRoute.post(
  "/",
  checkAuth(),
  roleGuard(UserRole.ADMIN),
  validateRequest(createCategorySchema),
  categoryController.createCategory,
);

categoryRoute.get("/", categoryController.getCategories);

categoryRoute.get(
  "/:id",
  validateRequest(getCategoryByIdSchema),
  categoryController.getCategoryById,
);

categoryRoute.patch(
  "/:id",
  checkAuth(),
  roleGuard(UserRole.ADMIN),
  validateRequest(updateCategorySchema),
  categoryController.updateCategory,
);

categoryRoute.delete(
  "/:id",
  checkAuth(),
  roleGuard(UserRole.ADMIN),
  validateRequest(deleteCategorySchema),
  categoryController.deleteCategory,
);

import { UserRole } from "@prisma/client";
import { Router } from "express";

import { checkAuth } from "../../common/middlewares/checkAuth.js";
import { roleGuard } from "../../common/middlewares/roleGuard.js";
import { validateRequest } from "../../common/middlewares/validateRequest.js";
import { assignmentController } from "./assignment.controller.js";
import {
  createAssignmentSchema,
  deleteAssignmentSchema,
  getAssignmentByIdSchema,
  updateAssignmentSchema,
} from "./assignment.validation.js";

export const assignmentRoute = Router();

assignmentRoute.post(
  "/",
  checkAuth(),
  roleGuard(UserRole.ADMIN, UserRole.INSTRUCTOR),
  validateRequest(createAssignmentSchema),
  assignmentController.createAssignment,
);

assignmentRoute.get("/", checkAuth(), assignmentController.getAssignments);

assignmentRoute.get(
  "/:id",
  checkAuth(),
  validateRequest(getAssignmentByIdSchema),
  assignmentController.getAssignmentById,
);

assignmentRoute.patch(
  "/:id",
  checkAuth(),
  roleGuard(UserRole.ADMIN, UserRole.INSTRUCTOR),
  validateRequest(updateAssignmentSchema),
  assignmentController.updateAssignment,
);

assignmentRoute.delete(
  "/:id",
  checkAuth(),
  roleGuard(UserRole.ADMIN, UserRole.INSTRUCTOR),
  validateRequest(deleteAssignmentSchema),
  assignmentController.deleteAssignment,
);

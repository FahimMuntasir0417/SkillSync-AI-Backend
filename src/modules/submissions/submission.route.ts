import { UserRole } from "@prisma/client";
import { Router } from "express";

import { checkAuth } from "../../common/middlewares/checkAuth.js";
import { roleGuard } from "../../common/middlewares/roleGuard.js";
import { validateRequest } from "../../common/middlewares/validateRequest.js";
import { submissionController } from "./submission.controller.js";
import {
  createSubmissionSchema,
  getSubmissionByIdSchema,
  updateSubmissionStatusSchema,
} from "./submission.validation.js";

export const submissionRoute = Router();

submissionRoute.post(
  "/",
  checkAuth(),
  roleGuard(UserRole.STUDENT),
  validateRequest(createSubmissionSchema),
  submissionController.createSubmission,
);

submissionRoute.get(
  "/my-submissions",
  checkAuth(),
  roleGuard(UserRole.STUDENT),
  submissionController.getMySubmissions,
);

submissionRoute.get(
  "/pending",
  checkAuth(),
  roleGuard(UserRole.ADMIN, UserRole.INSTRUCTOR),
  submissionController.getPendingSubmissions,
);

submissionRoute.get(
  "/:id",
  checkAuth(),
  validateRequest(getSubmissionByIdSchema),
  submissionController.getSubmissionById,
);

submissionRoute.patch(
  "/:id/status",
  checkAuth(),
  roleGuard(UserRole.ADMIN, UserRole.INSTRUCTOR),
  validateRequest(updateSubmissionStatusSchema),
  submissionController.updateSubmissionStatus,
);

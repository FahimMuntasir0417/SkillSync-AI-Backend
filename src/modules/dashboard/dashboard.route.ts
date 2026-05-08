import { UserRole } from "@prisma/client";
import { Router } from "express";

import { checkAuth } from "../../common/middlewares/checkAuth.js";
import { roleGuard } from "../../common/middlewares/roleGuard.js";
import { dashboardController } from "./dashboard.controller.js";

export const dashboardRoute = Router();

dashboardRoute.get("/student", checkAuth(), roleGuard(UserRole.STUDENT), dashboardController.getStudentDashboard);
dashboardRoute.get("/instructor", checkAuth(), roleGuard(UserRole.INSTRUCTOR), dashboardController.getInstructorDashboard);
dashboardRoute.get("/admin", checkAuth(), roleGuard(UserRole.ADMIN), dashboardController.getAdminDashboard);

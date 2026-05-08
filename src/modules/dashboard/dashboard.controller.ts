import httpStatus from "http-status";

import { catchAsync } from "../../common/utils/catchAsync.js";
import { sendResponse } from "../../common/utils/sendResponse.js";
import { dashboardService } from "./dashboard.service.js";

const getStudentDashboard = catchAsync(async (req, res) => {
  const data = await dashboardService.getStudentDashboard(req.user.userId);
  sendResponse(res, { statusCode: httpStatus.OK, message: "Student dashboard retrieved successfully", data });
});

const getInstructorDashboard = catchAsync(async (req, res) => {
  const data = await dashboardService.getInstructorDashboard(req.user.userId);
  sendResponse(res, { statusCode: httpStatus.OK, message: "Instructor dashboard retrieved successfully", data });
});

const getAdminDashboard = catchAsync(async (_req, res) => {
  const data = await dashboardService.getAdminDashboard();
  sendResponse(res, { statusCode: httpStatus.OK, message: "Admin dashboard retrieved successfully", data });
});

export const dashboardController = { getStudentDashboard, getInstructorDashboard, getAdminDashboard };

import httpStatus from "http-status";

import { AppError } from "../../common/errors/AppError.js";
import { catchAsync } from "../../common/utils/catchAsync.js";
import { sendResponse } from "../../common/utils/sendResponse.js";
import { courseModuleService } from "./courseModule.service.js";

const getRequiredParam = (
  value: string | string[] | undefined,
  label: string,
) => {
  if (!value || Array.isArray(value)) {
    throw new AppError(httpStatus.BAD_REQUEST, `${label} is required`);
  }

  return value;
};

const createCourseModule = catchAsync(async (req, res) => {
  const courseModule = await courseModuleService.createCourseModule(
    req.body,
    req.user,
  );

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    message: "Course module created successfully",
    data: courseModule,
  });
});

const updateCourseModule = catchAsync(async (req, res) => {
  const courseModule = await courseModuleService.updateCourseModule(
    getRequiredParam(req.params.id, "Course module id"),
    req.body,
    req.user,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: "Course module updated successfully",
    data: courseModule,
  });
});

const deleteCourseModule = catchAsync(async (req, res) => {
  await courseModuleService.deleteCourseModule(
    getRequiredParam(req.params.id, "Course module id"),
    req.user,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: "Course module deleted successfully",
    data: null,
  });
});

export const courseModuleController = {
  createCourseModule,
  updateCourseModule,
  deleteCourseModule,
};

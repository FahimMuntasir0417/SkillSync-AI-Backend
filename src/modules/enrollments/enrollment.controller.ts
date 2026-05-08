import httpStatus from "http-status";

import { AppError } from "../../common/errors/AppError.js";
import { catchAsync } from "../../common/utils/catchAsync.js";
import { sendResponse } from "../../common/utils/sendResponse.js";
import { enrollmentService } from "./enrollment.service.js";

const getRequiredParam = (
  value: string | string[] | undefined,
  label: string,
) => {
  if (!value || Array.isArray(value)) {
    throw new AppError(httpStatus.BAD_REQUEST, `${label} is required`);
  }

  return value;
};

const enrollInCourse = catchAsync(async (req, res) => {
  const enrollment = await enrollmentService.enrollInCourse(
    getRequiredParam(req.params.courseId, "Course id"),
    req.user,
  );

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    message: "Enrolled in course successfully",
    data: enrollment,
  });
});

const getMyClasses = catchAsync(async (req, res) => {
  const enrollments = await enrollmentService.getMyClasses(req.user);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: "My classes retrieved successfully",
    data: enrollments,
  });
});

const getEnrollmentById = catchAsync(async (req, res) => {
  const enrollment = await enrollmentService.getEnrollmentById(
    getRequiredParam(req.params.id, "Enrollment id"),
    req.user,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: "Enrollment retrieved successfully",
    data: enrollment,
  });
});

const updateEnrollmentProgress = catchAsync(async (req, res) => {
  const enrollment = await enrollmentService.updateEnrollmentProgress(
    getRequiredParam(req.params.id, "Enrollment id"),
    req.body,
    req.user,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: "Enrollment progress updated successfully",
    data: enrollment,
  });
});

export const enrollmentController = {
  enrollInCourse,
  getMyClasses,
  getEnrollmentById,
  updateEnrollmentProgress,
};

import httpStatus from "http-status";

import { AppError } from "../../common/errors/AppError.js";
import { catchAsync } from "../../common/utils/catchAsync.js";
import { sendResponse } from "../../common/utils/sendResponse.js";
import { courseReviewService } from "./courseReview.service.js";

const getId = (value: string | string[] | undefined, label: string) => {
  if (!value || Array.isArray(value)) throw new AppError(httpStatus.BAD_REQUEST, `${label} is required`);
  return value;
};

const createCourseReview = catchAsync(async (req, res) => {
  const review = await courseReviewService.createCourseReview(getId(req.params.courseId, "Course id"), req.body, req.user);
  sendResponse(res, { statusCode: httpStatus.CREATED, message: "Course review created successfully", data: review });
});
const getCourseReviews = catchAsync(async (req, res) => {
  const reviews = await courseReviewService.getCourseReviews(getId(req.params.courseId, "Course id"));
  sendResponse(res, { statusCode: httpStatus.OK, message: "Course reviews retrieved successfully", data: reviews });
});
const updateCourseReview = catchAsync(async (req, res) => {
  const review = await courseReviewService.updateCourseReview(getId(req.params.id, "Course review id"), req.body, req.user);
  sendResponse(res, { statusCode: httpStatus.OK, message: "Course review updated successfully", data: review });
});
const deleteCourseReview = catchAsync(async (req, res) => {
  await courseReviewService.deleteCourseReview(getId(req.params.id, "Course review id"), req.user);
  sendResponse(res, { statusCode: httpStatus.OK, message: "Course review deleted successfully", data: null });
});

export const courseReviewController = { createCourseReview, getCourseReviews, updateCourseReview, deleteCourseReview };

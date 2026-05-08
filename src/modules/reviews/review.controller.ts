import httpStatus from "http-status";

import { AppError } from "../../common/errors/AppError.js";
import { catchAsync } from "../../common/utils/catchAsync.js";
import { sendResponse } from "../../common/utils/sendResponse.js";
import { reviewService } from "./review.service.js";

const getId = (value: string | string[] | undefined, label: string) => {
  if (!value || Array.isArray(value)) throw new AppError(httpStatus.BAD_REQUEST, `${label} is required`);
  return value;
};

const createReview = catchAsync(async (req, res) => {
  const review = await reviewService.createReview(getId(req.params.id, "Submission id"), req.body, req.user);
  sendResponse(res, { statusCode: httpStatus.CREATED, message: "Review created successfully", data: review });
});

const updateReview = catchAsync(async (req, res) => {
  const review = await reviewService.updateReview(getId(req.params.id, "Review id"), req.body, req.user);
  sendResponse(res, { statusCode: httpStatus.OK, message: "Review updated successfully", data: review });
});

const getReviewById = catchAsync(async (req, res) => {
  const review = await reviewService.getReviewById(getId(req.params.id, "Review id"), req.user);
  sendResponse(res, { statusCode: httpStatus.OK, message: "Review retrieved successfully", data: review });
});

export const reviewController = { createReview, updateReview, getReviewById };

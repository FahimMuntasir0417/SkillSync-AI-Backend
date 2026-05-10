import httpStatus from "http-status";

import { AppError } from "../../common/errors/AppError.js";
import { catchAsync } from "../../common/utils/catchAsync.js";
import { sendResponse } from "../../common/utils/sendResponse.js";
import { promotionRequestService } from "./promotionRequest.service.js";

const getId = (value: string | string[] | undefined, label: string) => {
  if (!value || Array.isArray(value)) {
    throw new AppError(httpStatus.BAD_REQUEST, `${label} is required`);
  }

  return value;
};

const createPromotionRequest = catchAsync(async (req, res) => {
  const request = await promotionRequestService.createPromotionRequest(
    req.body,
    req.user,
  );

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    message: "Instructor promotion request submitted successfully",
    data: request,
  });
});

const getPromotionRequests = catchAsync(async (req, res) => {
  const result = await promotionRequestService.getPromotionRequests(
    req.query,
    req.user,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: "Promotion requests retrieved successfully",
    meta: result.meta,
    data: result.data,
  });
});

const getPromotionRequestById = catchAsync(async (req, res) => {
  const request = await promotionRequestService.getPromotionRequestById(
    getId(req.params.id, "Promotion request id"),
    req.user,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: "Promotion request retrieved successfully",
    data: request,
  });
});

const reviewPromotionRequest = catchAsync(async (req, res) => {
  const request = await promotionRequestService.reviewPromotionRequest(
    getId(req.params.id, "Promotion request id"),
    req.body,
    req.user,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: "Promotion request reviewed successfully",
    data: request,
  });
});

export const promotionRequestController = {
  createPromotionRequest,
  getPromotionRequests,
  getPromotionRequestById,
  reviewPromotionRequest,
};

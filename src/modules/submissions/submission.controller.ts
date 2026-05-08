import httpStatus from "http-status";

import { AppError } from "../../common/errors/AppError.js";
import { catchAsync } from "../../common/utils/catchAsync.js";
import { sendResponse } from "../../common/utils/sendResponse.js";
import { submissionService } from "./submission.service.js";

const getRequiredParam = (
  value: string | string[] | undefined,
  label: string,
) => {
  if (!value || Array.isArray(value)) {
    throw new AppError(httpStatus.BAD_REQUEST, `${label} is required`);
  }

  return value;
};

const createSubmission = catchAsync(async (req, res) => {
  const submission = await submissionService.createSubmission(req.body, req.user);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    message: "Submission created successfully",
    data: submission,
  });
});

const getMySubmissions = catchAsync(async (req, res) => {
  const submissions = await submissionService.getMySubmissions(req.user);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: "My submissions retrieved successfully",
    data: submissions,
  });
});

const getPendingSubmissions = catchAsync(async (req, res) => {
  const result = await submissionService.getPendingSubmissions(
    req.query,
    req.user,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: "Pending submissions retrieved successfully",
    meta: result.meta,
    data: result.data,
  });
});

const getSubmissionById = catchAsync(async (req, res) => {
  const submission = await submissionService.getSubmissionById(
    getRequiredParam(req.params.id, "Submission id"),
    req.user,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: "Submission retrieved successfully",
    data: submission,
  });
});

const updateSubmissionStatus = catchAsync(async (req, res) => {
  const submission = await submissionService.updateSubmissionStatus(
    getRequiredParam(req.params.id, "Submission id"),
    req.body,
    req.user,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: "Submission status updated successfully",
    data: submission,
  });
});

export const submissionController = {
  createSubmission,
  getMySubmissions,
  getPendingSubmissions,
  getSubmissionById,
  updateSubmissionStatus,
};

import httpStatus from "http-status";

import { AppError } from "../../common/errors/AppError.js";
import { catchAsync } from "../../common/utils/catchAsync.js";
import { sendResponse } from "../../common/utils/sendResponse.js";
import { assignmentService } from "./assignment.service.js";

const getRequiredParam = (
  value: string | string[] | undefined,
  label: string,
) => {
  if (!value || Array.isArray(value)) {
    throw new AppError(httpStatus.BAD_REQUEST, `${label} is required`);
  }

  return value;
};

const createAssignment = catchAsync(async (req, res) => {
  const assignment = await assignmentService.createAssignment(req.body, req.user);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    message: "Assignment created successfully",
    data: assignment,
  });
});

const getAssignments = catchAsync(async (req, res) => {
  const result = await assignmentService.getAssignments(req.query, req.user);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: "Assignments retrieved successfully",
    meta: result.meta,
    data: result.data,
  });
});

const getAssignmentById = catchAsync(async (req, res) => {
  const assignment = await assignmentService.getAssignmentById(
    getRequiredParam(req.params.id, "Assignment id"),
    req.user,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: "Assignment retrieved successfully",
    data: assignment,
  });
});

const updateAssignment = catchAsync(async (req, res) => {
  const assignment = await assignmentService.updateAssignment(
    getRequiredParam(req.params.id, "Assignment id"),
    req.body,
    req.user,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: "Assignment updated successfully",
    data: assignment,
  });
});

const deleteAssignment = catchAsync(async (req, res) => {
  await assignmentService.deleteAssignment(
    getRequiredParam(req.params.id, "Assignment id"),
    req.user,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: "Assignment deleted successfully",
    data: null,
  });
});

export const assignmentController = {
  createAssignment,
  getAssignments,
  getAssignmentById,
  updateAssignment,
  deleteAssignment,
};

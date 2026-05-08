import httpStatus from "http-status";

import { AppError } from "../../common/errors/AppError.js";
import { catchAsync } from "../../common/utils/catchAsync.js";
import { sendResponse } from "../../common/utils/sendResponse.js";
import { lessonService } from "./lesson.service.js";

const getRequiredParam = (
  value: string | string[] | undefined,
  label: string,
) => {
  if (!value || Array.isArray(value)) {
    throw new AppError(httpStatus.BAD_REQUEST, `${label} is required`);
  }

  return value;
};

const createLesson = catchAsync(async (req, res) => {
  const lesson = await lessonService.createLesson(req.body, req.user);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    message: "Lesson created successfully",
    data: lesson,
  });
});

const updateLesson = catchAsync(async (req, res) => {
  const lesson = await lessonService.updateLesson(
    getRequiredParam(req.params.id, "Lesson id"),
    req.body,
    req.user,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: "Lesson updated successfully",
    data: lesson,
  });
});

const deleteLesson = catchAsync(async (req, res) => {
  await lessonService.deleteLesson(
    getRequiredParam(req.params.id, "Lesson id"),
    req.user,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: "Lesson deleted successfully",
    data: null,
  });
});

const completeLesson = catchAsync(async (req, res) => {
  const result = await lessonService.completeLesson(
    getRequiredParam(req.params.id, "Lesson id"),
    req.user,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: "Lesson marked as completed",
    data: result,
  });
});

export const lessonController = {
  createLesson,
  updateLesson,
  deleteLesson,
  completeLesson,
};

import httpStatus from "http-status";

import { AppError } from "../../common/errors/AppError.js";
import { catchAsync } from "../../common/utils/catchAsync.js";
import { sendResponse } from "../../common/utils/sendResponse.js";
import { courseService } from "./course.service.js";

const getRequiredParam = (
  value: string | string[] | undefined,
  label: string,
) => {
  if (!value || Array.isArray(value)) {
    throw new AppError(httpStatus.BAD_REQUEST, `${label} is required`);
  }

  return value;
};

const createCourse = catchAsync(async (req, res) => {
  const course = await courseService.createCourse(req.body, req.user);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    message: "Course created successfully",
    data: course,
  });
});

const getCourses = catchAsync(async (req, res) => {
  const result = await courseService.getCourses(req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: "Courses retrieved successfully",
    meta: result.meta,
    data: result.data,
  });
});

const getFeaturedCourses = catchAsync(async (req, res) => {
  const courses = await courseService.getFeaturedCourses(req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: "Featured courses retrieved successfully",
    data: courses,
  });
});

const getRelatedCourses = catchAsync(async (req, res) => {
  const courses = await courseService.getRelatedCourses(
    getRequiredParam(req.params.courseId, "Course id"),
    req.query,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: "Related courses retrieved successfully",
    data: courses,
  });
});

const getCourseBySlug = catchAsync(async (req, res) => {
  const course = await courseService.getCourseBySlug(
    getRequiredParam(req.params.slug, "Course slug"),
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: "Course retrieved successfully",
    data: course,
  });
});

const updateCourse = catchAsync(async (req, res) => {
  const course = await courseService.updateCourse(
    getRequiredParam(req.params.id, "Course id"),
    req.body,
    req.user,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: "Course updated successfully",
    data: course,
  });
});

const deleteCourse = catchAsync(async (req, res) => {
  await courseService.deleteCourse(
    getRequiredParam(req.params.id, "Course id"),
    req.user,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: "Course deleted successfully",
    data: null,
  });
});

export const courseController = {
  createCourse,
  getCourses,
  getFeaturedCourses,
  getRelatedCourses,
  getCourseBySlug,
  updateCourse,
  deleteCourse,
};

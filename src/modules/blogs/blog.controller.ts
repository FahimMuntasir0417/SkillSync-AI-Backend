import httpStatus from "http-status";

import { AppError } from "../../common/errors/AppError.js";
import { catchAsync } from "../../common/utils/catchAsync.js";
import { sendResponse } from "../../common/utils/sendResponse.js";
import { blogService } from "./blog.service.js";

const getId = (value: string | string[] | undefined, label: string) => {
  if (!value || Array.isArray(value)) throw new AppError(httpStatus.BAD_REQUEST, `${label} is required`);
  return value;
};

const createBlog = catchAsync(async (req, res) => {
  const blog = await blogService.createBlog(req.body, req.user);
  sendResponse(res, { statusCode: httpStatus.CREATED, message: "Blog created successfully", data: blog });
});
const getBlogs = catchAsync(async (req, res) => {
  const result = await blogService.getBlogs(req.query, req.user);
  sendResponse(res, { statusCode: httpStatus.OK, message: "Blogs retrieved successfully", meta: result.meta, data: result.data });
});
const getBlogBySlug = catchAsync(async (req, res) => {
  const blog = await blogService.getBlogBySlug(getId(req.params.slug, "Blog slug"));
  sendResponse(res, { statusCode: httpStatus.OK, message: "Blog retrieved successfully", data: blog });
});
const updateBlog = catchAsync(async (req, res) => {
  const blog = await blogService.updateBlog(getId(req.params.id, "Blog id"), req.body, req.user);
  sendResponse(res, { statusCode: httpStatus.OK, message: "Blog updated successfully", data: blog });
});
const deleteBlog = catchAsync(async (req, res) => {
  await blogService.deleteBlog(getId(req.params.id, "Blog id"), req.user);
  sendResponse(res, { statusCode: httpStatus.OK, message: "Blog deleted successfully", data: null });
});

export const blogController = { createBlog, getBlogs, getBlogBySlug, updateBlog, deleteBlog };

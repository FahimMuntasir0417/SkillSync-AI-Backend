import httpStatus from "http-status";

import { AppError } from "../../common/errors/AppError.js";
import { catchAsync } from "../../common/utils/catchAsync.js";
import { sendResponse } from "../../common/utils/sendResponse.js";
import { categoryService } from "./category.service.js";

const getIdParam = (id: string | string[] | undefined) => {
  if (!id || Array.isArray(id)) {
    throw new AppError(httpStatus.BAD_REQUEST, "Category id is required");
  }

  return id;
};

const createCategory = catchAsync(async (req, res) => {
  const category = await categoryService.createCategory(req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    message: "Category created successfully",
    data: category,
  });
});

const getCategories = catchAsync(async (_req, res) => {
  const categories = await categoryService.getCategories();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: "Categories retrieved successfully",
    data: categories,
  });
});

const getCategoryById = catchAsync(async (req, res) => {
  const category = await categoryService.getCategoryById(getIdParam(req.params.id));

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: "Category retrieved successfully",
    data: category,
  });
});

const updateCategory = catchAsync(async (req, res) => {
  const category = await categoryService.updateCategory(
    getIdParam(req.params.id),
    req.body,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: "Category updated successfully",
    data: category,
  });
});

const deleteCategory = catchAsync(async (req, res) => {
  await categoryService.deleteCategory(getIdParam(req.params.id));

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: "Category deleted successfully",
    data: null,
  });
});

export const categoryController = {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
};

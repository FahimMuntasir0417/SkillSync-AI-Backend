import httpStatus from "http-status";

import { AppError } from "@/common/errors/AppError.js";
import { catchAsync } from "@/common/utils/catchAsync.js";
import { sendResponse } from "@/common/utils/sendResponse.js";
import { userService } from "@/modules/users/user.service.js";

const getUsers = catchAsync(async (req, res) => {
  const result = await userService.getUsers(req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: "Users retrieved successfully",
    meta: result.meta,
    data: result.data,
  });
});

const getMyProfile = catchAsync(async (req, res) => {
  const user = await userService.getMyProfile(req.user.userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: "Profile retrieved successfully",
    data: user,
  });
});

const updateMyProfile = catchAsync(async (req, res) => {
  const user = await userService.updateMyProfile(req.user.userId, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: "Profile updated successfully",
    data: user,
  });
});

const changeUserRole = catchAsync(async (req, res) => {
  const { id } = req.params;

  if (!id || Array.isArray(id)) {
    throw new AppError(httpStatus.BAD_REQUEST, "User id is required");
  }

  const user = await userService.changeUserRole(id, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: "User role updated successfully",
    data: user,
  });
});

const blockUser = catchAsync(async (req, res) => {
  const { id } = req.params;

  if (!id || Array.isArray(id)) {
    throw new AppError(httpStatus.BAD_REQUEST, "User id is required");
  }

  const user = await userService.blockUser(id, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: "User block status updated successfully",
    data: user,
  });
});

export const userController = {
  getUsers,
  getMyProfile,
  updateMyProfile,
  changeUserRole,
  blockUser,
};

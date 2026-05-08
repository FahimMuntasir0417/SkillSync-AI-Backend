import type { UserRole } from "@prisma/client";
import type { RequestHandler } from "express";
import httpStatus from "http-status";

import { AppError } from "@/common/errors/AppError.js";
import { catchAsync } from "@/common/utils/catchAsync.js";
import { env } from "@/config/env.js";
import { verifyToken } from "@/modules/auth/auth.utils.js";

export const checkAuth = (...roles: UserRole[]): RequestHandler =>
  catchAsync(async (req, _res, next) => {
    const authorization = req.headers.authorization;

    if (!authorization?.startsWith("Bearer ")) {
      throw new AppError(httpStatus.UNAUTHORIZED, "Access token is required");
    }

    const token = authorization.split(" ")[1];

    if (!token) {
      throw new AppError(httpStatus.UNAUTHORIZED, "Access token is required");
    }

    const decodedUser = verifyToken(token, env.JWT_ACCESS_SECRET);

    if (roles.length > 0 && !roles.includes(decodedUser.role)) {
      throw new AppError(httpStatus.FORBIDDEN, "You are not authorized");
    }

    req.user = decodedUser;

    next();
  });

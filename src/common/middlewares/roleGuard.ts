import type { UserRole } from "@prisma/client";
import type { RequestHandler } from "express";
import httpStatus from "http-status";

import { AppError } from "../errors/AppError.js";

export const roleGuard =
  (...allowedRoles: UserRole[]): RequestHandler =>
  (req, _res, next) => {
    if (!req.user) {
      throw new AppError(httpStatus.UNAUTHORIZED, "Authentication required");
    }

    if (!allowedRoles.includes(req.user.role)) {
      throw new AppError(httpStatus.FORBIDDEN, "You are not authorized");
    }

    next();
  };

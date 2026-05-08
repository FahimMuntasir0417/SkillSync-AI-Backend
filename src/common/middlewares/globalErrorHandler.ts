import { Prisma } from "@prisma/client";
import type { ErrorRequestHandler } from "express";
import jwt from "jsonwebtoken";
import { ZodError } from "zod";

import { AppError } from "../errors/AppError.js";
import { logger } from "../../config/logger.js";

const { JsonWebTokenError, TokenExpiredError } = jwt;

type ErrorDetail = {
  path?: string;
  message: string;
};

const formatZodErrors = (error: ZodError): ErrorDetail[] =>
  error.issues.map((issue) => ({
    path: issue.path.join("."),
    message: issue.message,
  }));

const formatPrismaKnownError = (
  error: Prisma.PrismaClientKnownRequestError,
): { statusCode: number; message: string; errors: ErrorDetail[] } => {
  if (error.code === "P2002") {
    return {
      statusCode: 409,
      message: "Duplicate field value",
      errors: [
        {
          path: Array.isArray(error.meta?.target)
            ? error.meta.target.join(".")
            : undefined,
          message: "A record with this value already exists",
        },
      ],
    };
  }

  if (error.code === "P2025") {
    return {
      statusCode: 404,
      message: "Requested resource was not found",
      errors: [{ message: error.message }],
    };
  }

  return {
    statusCode: 400,
    message: "Database request failed",
    errors: [{ message: error.message }],
  };
};

export const globalErrorHandler: ErrorRequestHandler = (
  error,
  _req,
  res,
  _next,
) => {
  let statusCode = 500;
  let message = "Internal server error";
  let errors: ErrorDetail[] = [];

  if (error instanceof AppError) {
    statusCode = error.statusCode;
    message = error.message;
    errors = [{ message: error.message }];
  } else if (error instanceof ZodError) {
    statusCode = 400;
    message = "Validation failed";
    errors = formatZodErrors(error);
  } else if (error instanceof Prisma.PrismaClientKnownRequestError) {
    const formattedError = formatPrismaKnownError(error);
    statusCode = formattedError.statusCode;
    message = formattedError.message;
    errors = formattedError.errors;
  } else if (error instanceof Prisma.PrismaClientValidationError) {
    statusCode = 400;
    message = "Database validation failed";
    errors = [{ message: error.message }];
  } else if (error instanceof TokenExpiredError) {
    statusCode = 401;
    message = "JWT token has expired";
    errors = [{ message: error.message }];
  } else if (error instanceof JsonWebTokenError) {
    statusCode = 401;
    message = "Invalid JWT token";
    errors = [{ message: error.message }];
  } else if (error instanceof Error) {
    message = error.message;
    errors = [{ message: error.message }];
  }

  if (statusCode >= 500) {
    logger.error({ error }, message);
  }

  res.status(statusCode).json({
    success: false,
    message,
    errors,
  });
};

import type { Response } from "express";

type Meta = {
  page: number;
  limit: number;
  total: number;
  totalPage: number;
};

type SendResponseOptions<T> = {
  statusCode?: number;
  message: string;
  data: T;
  meta?: Meta;
};

export const sendResponse = <T>(
  res: Response,
  { statusCode = 200, message, data, meta }: SendResponseOptions<T>,
): void => {
  res.status(statusCode).json({
    success: true,
    message,
    ...(meta ? { meta } : {}),
    data,
  });
};

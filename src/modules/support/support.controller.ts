import httpStatus from "http-status";

import { AppError } from "../../common/errors/AppError.js";
import { catchAsync } from "../../common/utils/catchAsync.js";
import { sendResponse } from "../../common/utils/sendResponse.js";
import { supportService } from "./support.service.js";

const getId = (value: string | string[] | undefined, label: string) => {
  if (!value || Array.isArray(value)) throw new AppError(httpStatus.BAD_REQUEST, `${label} is required`);
  return value;
};

const createTicket = catchAsync(async (req, res) => {
  const ticket = await supportService.createTicket(req.body, req.user);
  sendResponse(res, { statusCode: httpStatus.CREATED, message: "Support ticket created successfully", data: ticket });
});
const getTickets = catchAsync(async (req, res) => {
  const result = await supportService.getTickets(req.query, req.user);
  sendResponse(res, { statusCode: httpStatus.OK, message: "Support tickets retrieved successfully", meta: result.meta, data: result.data });
});
const getTicketById = catchAsync(async (req, res) => {
  const ticket = await supportService.getTicketById(getId(req.params.id, "Ticket id"), req.user);
  sendResponse(res, { statusCode: httpStatus.OK, message: "Support ticket retrieved successfully", data: ticket });
});
const updateTicketStatus = catchAsync(async (req, res) => {
  const ticket = await supportService.updateTicketStatus(getId(req.params.id, "Ticket id"), req.body);
  sendResponse(res, { statusCode: httpStatus.OK, message: "Support ticket status updated successfully", data: ticket });
});
const createReply = catchAsync(async (req, res) => {
  const reply = await supportService.createReply(getId(req.params.id, "Ticket id"), req.body, req.user);
  sendResponse(res, { statusCode: httpStatus.CREATED, message: "Support reply created successfully", data: reply });
});

export const supportController = { createTicket, getTickets, getTicketById, updateTicketStatus, createReply };

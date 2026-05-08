import { NotificationType, Prisma, TicketPriority, TicketStatus, UserRole } from "@prisma/client";
import httpStatus from "http-status";

import { AppError } from "../../common/errors/AppError.js";
import { calculatePagination } from "../../common/utils/pagination.js";
import { prisma } from "../../config/prisma.js";
import type { CreateReplyInput, CreateTicketInput, SupportUser, TicketListQuery, UpdateTicketStatusInput } from "./support.interface.js";

const userSelect = {
  id: true,
  name: true,
  email: true,
  avatarUrl: true,
  image: true,
  role: true,
} satisfies Prisma.UserSelect;

const messageSelect = {
  id: true,
  ticketId: true,
  senderId: true,
  message: true,
  createdAt: true,
  sender: { select: userSelect },
} satisfies Prisma.SupportMessageSelect;

const ticketSelect = {
  id: true,
  userId: true,
  subject: true,
  message: true,
  status: true,
  priority: true,
  createdAt: true,
  updatedAt: true,
  user: { select: userSelect },
  messages: { select: messageSelect, orderBy: { createdAt: "asc" } },
} satisfies Prisma.SupportTicketSelect;

const parseEnum = <T extends Record<string, string>>(enumObject: T, value: unknown): T[keyof T] | undefined => {
  if (typeof value !== "string") return undefined;
  return Object.values(enumObject).includes(value) ? (value as T[keyof T]) : undefined;
};

const getTicketOrThrow = async (id: string) => {
  const ticket = await prisma.supportTicket.findUnique({ where: { id }, select: ticketSelect });
  if (!ticket) throw new AppError(httpStatus.NOT_FOUND, "Support ticket not found");
  return ticket;
};

const assertTicketOwnerOrAdmin = (ticket: { userId: string }, user: SupportUser) => {
  if (user.role === UserRole.ADMIN || ticket.userId === user.userId) return;
  throw new AppError(httpStatus.FORBIDDEN, "You are not authorized");
};

const createTicket = (payload: CreateTicketInput, user: SupportUser) =>
  prisma.supportTicket.create({
    data: {
      userId: user.userId,
      subject: payload.subject,
      message: payload.message,
      priority: payload.priority ?? TicketPriority.MEDIUM,
    },
    select: ticketSelect,
  });

const getTickets = async (query: TicketListQuery, user: SupportUser) => {
  const { page, limit, skip, sortBy, sortOrder } = calculatePagination(query);
  const status = parseEnum(TicketStatus, query.status);
  const priority = parseEnum(TicketPriority, query.priority);
  const safeSortBy = sortBy === "updatedAt" || sortBy === "priority" || sortBy === "status" ? sortBy : "createdAt";
  const where: Prisma.SupportTicketWhereInput = {
    ...(user.role === UserRole.ADMIN ? {} : { userId: user.userId }),
    ...(status ? { status } : {}),
    ...(priority ? { priority } : {}),
  };
  const [total, tickets] = await Promise.all([
    prisma.supportTicket.count({ where }),
    prisma.supportTicket.findMany({ where, select: ticketSelect, skip, take: limit, orderBy: { [safeSortBy]: sortOrder } }),
  ]);
  return { meta: { page, limit, total, totalPage: Math.ceil(total / limit) }, data: tickets };
};

const getTicketById = async (id: string, user: SupportUser) => {
  const ticket = await getTicketOrThrow(id);
  assertTicketOwnerOrAdmin(ticket, user);
  return ticket;
};

const updateTicketStatus = async (id: string, payload: UpdateTicketStatusInput) =>
  prisma.supportTicket.update({ where: { id }, data: { status: payload.status }, select: ticketSelect });

const createReply = async (id: string, payload: CreateReplyInput, user: SupportUser) => {
  const ticket = await getTicketOrThrow(id);
  assertTicketOwnerOrAdmin(ticket, user);
  return prisma.$transaction(async (tx) => {
    const reply = await tx.supportMessage.create({
      data: { ticketId: id, senderId: user.userId, message: payload.message },
      select: messageSelect,
    });
    if (user.role === UserRole.ADMIN && ticket.userId !== user.userId) {
      await tx.notification.create({
        data: {
          userId: ticket.userId,
          title: "Support ticket reply",
          message: `Admin replied to your ticket: ${ticket.subject}`,
          type: NotificationType.SUPPORT,
        },
      });
    }
    return reply;
  });
};

export const supportService = { createTicket, getTickets, getTicketById, updateTicketStatus, createReply };

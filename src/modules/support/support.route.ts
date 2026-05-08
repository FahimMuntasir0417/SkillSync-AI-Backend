import { UserRole } from "@prisma/client";
import { Router } from "express";

import { checkAuth } from "../../common/middlewares/checkAuth.js";
import { roleGuard } from "../../common/middlewares/roleGuard.js";
import { validateRequest } from "../../common/middlewares/validateRequest.js";
import { supportController } from "./support.controller.js";
import { createReplySchema, createTicketSchema, getTicketByIdSchema, updateTicketStatusSchema } from "./support.validation.js";

export const supportRoute = Router();

supportRoute.post("/tickets", checkAuth(), validateRequest(createTicketSchema), supportController.createTicket);
supportRoute.get("/tickets", checkAuth(), supportController.getTickets);
supportRoute.get("/tickets/:id", checkAuth(), validateRequest(getTicketByIdSchema), supportController.getTicketById);
supportRoute.patch(
  "/tickets/:id/status",
  checkAuth(),
  roleGuard(UserRole.ADMIN),
  validateRequest(updateTicketStatusSchema),
  supportController.updateTicketStatus,
);
supportRoute.post("/tickets/:id/replies", checkAuth(), validateRequest(createReplySchema), supportController.createReply);

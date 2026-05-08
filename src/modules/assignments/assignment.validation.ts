import { AssignmentStatus } from "@prisma/client";
import { z } from "zod";

const dueDateSchema = z
  .string()
  .refine((value) => !Number.isNaN(Date.parse(value)), {
    message: "Invalid dueDate",
  })
  .transform((value) => new Date(value));

const createAssignmentBodySchema = z.object({
  title: z.string().trim().min(3).max(200),
  description: z.string().trim().min(10),
  courseId: z.uuid(),
  dueDate: dueDateSchema.optional(),
  status: z.enum(AssignmentStatus).optional(),
});

export const assignmentValidation = {
  create: {
    body: createAssignmentBodySchema,
  },
  update: {
    params: z.object({
      id: z.uuid(),
    }),
    body: createAssignmentBodySchema
      .partial()
      .refine((data) => Object.keys(data).length > 0, {
        message: "At least one field is required",
      }),
  },
  getById: {
    params: z.object({
      id: z.uuid(),
    }),
  },
  delete: {
    params: z.object({
      id: z.uuid(),
    }),
  },
};

export const createAssignmentSchema = assignmentValidation.create;
export const updateAssignmentSchema = assignmentValidation.update;
export const getAssignmentByIdSchema = assignmentValidation.getById;
export const deleteAssignmentSchema = assignmentValidation.delete;

import {
  AssignmentStatus,
  Prisma,
  SubmissionStatus,
  UserRole,
} from "@prisma/client";
import httpStatus from "http-status";

import { AppError } from "../../common/errors/AppError.js";
import { calculatePagination } from "../../common/utils/pagination.js";
import { prisma } from "../../config/prisma.js";
import type {
  CreateSubmissionInput,
  PendingSubmissionQuery,
  SubmissionUser,
  UpdateSubmissionStatusInput,
} from "./submission.interface.js";

const submissionSortableFields = ["createdAt", "updatedAt", "status"] as const;

const studentSelect = {
  id: true,
  name: true,
  email: true,
  avatarUrl: true,
  image: true,
  bio: true,
  role: true,
} satisfies Prisma.UserSelect;

const assignmentSelect = {
  id: true,
  title: true,
  description: true,
  courseId: true,
  dueDate: true,
  status: true,
  course: {
    select: {
      id: true,
      title: true,
      slug: true,
      instructorId: true,
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      instructor: {
        select: studentSelect,
      },
    },
  },
} satisfies Prisma.AssignmentSelect;

const submissionSelect = {
  id: true,
  assignmentId: true,
  studentId: true,
  githubUrl: true,
  liveUrl: true,
  notes: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  assignment: {
    select: assignmentSelect,
  },
  student: {
    select: studentSelect,
  },
  review: {
    select: {
      id: true,
      reviewerId: true,
      feedback: true,
      score: true,
      createdAt: true,
      updatedAt: true,
    },
  },
} satisfies Prisma.SubmissionSelect;

const parseEnum = <T extends Record<string, string>>(
  enumObject: T,
  value: unknown,
): T[keyof T] | undefined => {
  if (typeof value !== "string") {
    return undefined;
  }

  return Object.values(enumObject).includes(value)
    ? (value as T[keyof T])
    : undefined;
};

const getAssignmentOrThrow = async (assignmentId: string) => {
  const assignment = await prisma.assignment.findUnique({
    where: {
      id: assignmentId,
    },
    select: assignmentSelect,
  });

  if (!assignment) {
    throw new AppError(httpStatus.NOT_FOUND, "Assignment not found");
  }

  return assignment;
};

const getSubmissionOrThrow = async (id: string) => {
  const submission = await prisma.submission.findUnique({
    where: {
      id,
    },
    select: submissionSelect,
  });

  if (!submission) {
    throw new AppError(httpStatus.NOT_FOUND, "Submission not found");
  }

  return submission;
};

const assertInstructorOwnsSubmission = (
  submission: Awaited<ReturnType<typeof getSubmissionOrThrow>>,
  user: SubmissionUser,
) => {
  if (user.role === UserRole.ADMIN) {
    return;
  }

  if (
    user.role === UserRole.INSTRUCTOR &&
    submission.assignment.course.instructorId === user.userId
  ) {
    return;
  }

  throw new AppError(httpStatus.FORBIDDEN, "You are not authorized");
};

const assertCanViewSubmission = (
  submission: Awaited<ReturnType<typeof getSubmissionOrThrow>>,
  user: SubmissionUser,
) => {
  if (user.role === UserRole.ADMIN || submission.studentId === user.userId) {
    return;
  }

  if (
    user.role === UserRole.INSTRUCTOR &&
    submission.assignment.course.instructorId === user.userId
  ) {
    return;
  }

  throw new AppError(httpStatus.FORBIDDEN, "You are not authorized");
};

const createSubmission = async (
  payload: CreateSubmissionInput,
  user: SubmissionUser,
) => {
  const assignment = await getAssignmentOrThrow(payload.assignmentId);

  if (assignment.status !== AssignmentStatus.ACTIVE) {
    throw new AppError(httpStatus.BAD_REQUEST, "Assignment is not active");
  }

  const enrollment = await prisma.enrollment.findUnique({
    where: {
      userId_courseId: {
        userId: user.userId,
        courseId: assignment.courseId,
      },
    },
    select: {
      id: true,
    },
  });

  if (!enrollment) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You must be enrolled in this course to submit assignments",
    );
  }

  const existingSubmission = await prisma.submission.findUnique({
    where: {
      assignmentId_studentId: {
        assignmentId: payload.assignmentId,
        studentId: user.userId,
      },
    },
    select: {
      id: true,
    },
  });

  if (existingSubmission) {
    throw new AppError(
      httpStatus.CONFLICT,
      "You already submitted this assignment",
    );
  }

  return prisma.submission.create({
    data: {
      assignmentId: payload.assignmentId,
      studentId: user.userId,
      githubUrl: payload.githubUrl,
      liveUrl: payload.liveUrl,
      notes: payload.notes,
      status: SubmissionStatus.PENDING,
    },
    select: submissionSelect,
  });
};

const getMySubmissions = async (user: SubmissionUser) =>
  prisma.submission.findMany({
    where: {
      studentId: user.userId,
    },
    select: submissionSelect,
    orderBy: {
      createdAt: "desc",
    },
  });

const getPendingSubmissions = async (
  query: PendingSubmissionQuery,
  user: SubmissionUser,
) => {
  const { page, limit, skip, sortBy, sortOrder } = calculatePagination(query);
  const status = parseEnum(SubmissionStatus, query.status);
  const safeSortBy = submissionSortableFields.includes(
    sortBy as (typeof submissionSortableFields)[number],
  )
    ? sortBy
    : "createdAt";

  const where: Prisma.SubmissionWhereInput = {
    status: status ?? SubmissionStatus.PENDING,
    ...(typeof query.courseId === "string"
      ? {
          assignment: {
            courseId: query.courseId,
          },
        }
      : {}),
    ...(user.role === UserRole.INSTRUCTOR
      ? {
          assignment: {
            course: {
              instructorId: user.userId,
            },
            ...(typeof query.courseId === "string"
              ? { courseId: query.courseId }
              : {}),
          },
        }
      : {}),
  };

  const [total, submissions] = await Promise.all([
    prisma.submission.count({ where }),
    prisma.submission.findMany({
      where,
      select: submissionSelect,
      skip,
      take: limit,
      orderBy: {
        [safeSortBy]: sortOrder,
      },
    }),
  ]);

  return {
    meta: {
      page,
      limit,
      total,
      totalPage: Math.ceil(total / limit),
    },
    data: submissions,
  };
};

const getSubmissionById = async (id: string, user: SubmissionUser) => {
  const submission = await getSubmissionOrThrow(id);
  assertCanViewSubmission(submission, user);

  return submission;
};

const updateSubmissionStatus = async (
  id: string,
  payload: UpdateSubmissionStatusInput,
  user: SubmissionUser,
) => {
  const submission = await getSubmissionOrThrow(id);
  assertInstructorOwnsSubmission(submission, user);

  return prisma.submission.update({
    where: {
      id,
    },
    data: {
      status: payload.status,
    },
    select: submissionSelect,
  });
};

export const submissionService = {
  createSubmission,
  getMySubmissions,
  getPendingSubmissions,
  getSubmissionById,
  updateSubmissionStatus,
};

import { AssignmentStatus, Prisma, UserRole } from "@prisma/client";
import httpStatus from "http-status";

import { AppError } from "../../common/errors/AppError.js";
import { calculatePagination } from "../../common/utils/pagination.js";
import { prisma } from "../../config/prisma.js";
import type {
  AssignmentListQuery,
  AssignmentUser,
  CreateAssignmentInput,
  UpdateAssignmentInput,
} from "./assignment.interface.js";

const assignmentSortableFields = [
  "createdAt",
  "dueDate",
  "status",
  "title",
] as const;

const courseSelect = {
  id: true,
  title: true,
  slug: true,
  status: true,
  instructorId: true,
  category: {
    select: {
      id: true,
      name: true,
      slug: true,
    },
  },
  instructor: {
    select: {
      id: true,
      name: true,
      email: true,
      avatarUrl: true,
      image: true,
      bio: true,
      role: true,
    },
  },
} satisfies Prisma.CourseSelect;

const assignmentSelect = {
  id: true,
  title: true,
  description: true,
  courseId: true,
  dueDate: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  course: {
    select: courseSelect,
  },
  _count: {
    select: {
      submissions: true,
    },
  },
} satisfies Prisma.AssignmentSelect;

const formatAssignment = <
  T extends {
    _count?: {
      submissions: number;
    };
  },
>(
  assignment: T,
) => {
  const { _count, ...rest } = assignment;

  return {
    ...rest,
    submissionCount: _count?.submissions ?? 0,
  };
};

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

const getCourseOrThrow = async (courseId: string) => {
  const course = await prisma.course.findUnique({
    where: {
      id: courseId,
    },
    select: {
      id: true,
      instructorId: true,
    },
  });

  if (!course) {
    throw new AppError(httpStatus.NOT_FOUND, "Course not found");
  }

  return course;
};

const getAssignmentOrThrow = async (id: string) => {
  const assignment = await prisma.assignment.findUnique({
    where: {
      id,
    },
    select: assignmentSelect,
  });

  if (!assignment) {
    throw new AppError(httpStatus.NOT_FOUND, "Assignment not found");
  }

  return assignment;
};

const assertCanManageCourse = (
  user: AssignmentUser,
  course: {
    instructorId: string;
  },
) => {
  if (user.role === UserRole.ADMIN) {
    return;
  }

  if (user.role === UserRole.INSTRUCTOR && course.instructorId === user.userId) {
    return;
  }

  throw new AppError(httpStatus.FORBIDDEN, "You are not authorized");
};

const assertCanViewAssignment = async (
  assignment: Awaited<ReturnType<typeof getAssignmentOrThrow>>,
  user: AssignmentUser,
) => {
  if (user.role === UserRole.ADMIN) {
    return;
  }

  if (
    user.role === UserRole.INSTRUCTOR &&
    assignment.course.instructorId === user.userId
  ) {
    return;
  }

  if (user.role === UserRole.STUDENT) {
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

    if (enrollment) {
      return;
    }
  }

  throw new AppError(httpStatus.FORBIDDEN, "You are not authorized");
};

const buildAssignmentWhere = async (
  query: AssignmentListQuery,
  user: AssignmentUser,
): Promise<Prisma.AssignmentWhereInput> => {
  const status = parseEnum(AssignmentStatus, query.status);
  const baseWhere: Prisma.AssignmentWhereInput = {
    ...(typeof query.courseId === "string" ? { courseId: query.courseId } : {}),
    ...(status ? { status } : {}),
  };

  if (user.role === UserRole.ADMIN) {
    return baseWhere;
  }

  if (user.role === UserRole.INSTRUCTOR) {
    return {
      ...baseWhere,
      course: {
        instructorId: user.userId,
      },
    };
  }

  return {
    ...baseWhere,
    course: {
      enrollments: {
        some: {
          userId: user.userId,
        },
      },
    },
  };
};

const createAssignment = async (
  payload: CreateAssignmentInput,
  user: AssignmentUser,
) => {
  const course = await getCourseOrThrow(payload.courseId);
  assertCanManageCourse(user, course);

  const assignment = await prisma.assignment.create({
    data: {
      title: payload.title,
      description: payload.description,
      courseId: payload.courseId,
      dueDate: payload.dueDate,
      status: payload.status ?? AssignmentStatus.ACTIVE,
    },
    select: assignmentSelect,
  });

  return formatAssignment(assignment);
};

const getAssignments = async (query: AssignmentListQuery, user: AssignmentUser) => {
  const { page, limit, skip, sortBy, sortOrder } = calculatePagination(query);
  const safeSortBy = assignmentSortableFields.includes(
    sortBy as (typeof assignmentSortableFields)[number],
  )
    ? sortBy
    : "createdAt";
  const where = await buildAssignmentWhere(query, user);

  const [total, assignments] = await Promise.all([
    prisma.assignment.count({ where }),
    prisma.assignment.findMany({
      where,
      select: assignmentSelect,
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
    data: assignments.map(formatAssignment),
  };
};

const getAssignmentById = async (id: string, user: AssignmentUser) => {
  const assignment = await getAssignmentOrThrow(id);
  await assertCanViewAssignment(assignment, user);

  return formatAssignment(assignment);
};

const updateAssignment = async (
  id: string,
  payload: UpdateAssignmentInput,
  user: AssignmentUser,
) => {
  const assignment = await getAssignmentOrThrow(id);
  assertCanManageCourse(user, assignment.course);

  if (payload.courseId && payload.courseId !== assignment.courseId) {
    const targetCourse = await getCourseOrThrow(payload.courseId);
    assertCanManageCourse(user, targetCourse);
  }

  const updatedAssignment = await prisma.assignment.update({
    where: {
      id,
    },
    data: {
      ...(payload.title ? { title: payload.title } : {}),
      ...(payload.description ? { description: payload.description } : {}),
      ...(payload.dueDate !== undefined ? { dueDate: payload.dueDate } : {}),
      ...(payload.status ? { status: payload.status } : {}),
      ...(payload.courseId
        ? {
            course: {
              connect: {
                id: payload.courseId,
              },
            },
          }
        : {}),
    },
    select: assignmentSelect,
  });

  return formatAssignment(updatedAssignment);
};

const deleteAssignment = async (id: string, user: AssignmentUser) => {
  const assignment = await getAssignmentOrThrow(id);
  assertCanManageCourse(user, assignment.course);

  await prisma.assignment.delete({
    where: {
      id,
    },
  });

  return null;
};

export const assignmentService = {
  createAssignment,
  getAssignments,
  getAssignmentById,
  updateAssignment,
  deleteAssignment,
};

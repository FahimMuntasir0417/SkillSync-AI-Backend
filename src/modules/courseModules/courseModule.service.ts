import { Prisma, UserRole } from "@prisma/client";
import httpStatus from "http-status";

import { AppError } from "../../common/errors/AppError.js";
import { prisma } from "../../config/prisma.js";
import type {
  CourseModuleUser,
  CreateCourseModuleInput,
  UpdateCourseModuleInput,
} from "./courseModule.interface.js";

const courseModuleSelect = {
  id: true,
  title: true,
  description: true,
  order: true,
  courseId: true,
  createdAt: true,
  updatedAt: true,
  course: {
    select: {
      id: true,
      title: true,
      slug: true,
      instructorId: true,
    },
  },
  _count: {
    select: {
      lessons: true,
    },
  },
} satisfies Prisma.CourseModuleSelect;

const formatCourseModule = <
  T extends {
    _count?: {
      lessons: number;
    };
  },
>(
  courseModule: T,
) => {
  const { _count, ...rest } = courseModule;

  return {
    ...rest,
    lessonCount: _count?.lessons ?? 0,
  };
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

const getCourseModuleOrThrow = async (id: string) => {
  const courseModule = await prisma.courseModule.findUnique({
    where: {
      id,
    },
    select: courseModuleSelect,
  });

  if (!courseModule) {
    throw new AppError(httpStatus.NOT_FOUND, "Course module not found");
  }

  return courseModule;
};

const assertCanManageCourse = (
  user: CourseModuleUser,
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

const assertOrderIsUnique = async (
  courseId: string,
  order: number,
  currentModuleId?: string,
) => {
  const existingModule = await prisma.courseModule.findUnique({
    where: {
      courseId_order: {
        courseId,
        order,
      },
    },
    select: {
      id: true,
    },
  });

  if (existingModule && existingModule.id !== currentModuleId) {
    throw new AppError(
      httpStatus.CONFLICT,
      "Module order already exists for this course",
    );
  }
};

const createCourseModule = async (
  payload: CreateCourseModuleInput,
  user: CourseModuleUser,
) => {
  const course = await getCourseOrThrow(payload.courseId);
  assertCanManageCourse(user, course);
  await assertOrderIsUnique(payload.courseId, payload.order);

  const courseModule = await prisma.courseModule.create({
    data: payload,
    select: courseModuleSelect,
  });

  return formatCourseModule(courseModule);
};

const updateCourseModule = async (
  id: string,
  payload: UpdateCourseModuleInput,
  user: CourseModuleUser,
) => {
  const existingModule = await getCourseModuleOrThrow(id);
  assertCanManageCourse(user, existingModule.course);

  const targetCourseId = payload.courseId ?? existingModule.courseId;
  const targetCourse =
    payload.courseId && payload.courseId !== existingModule.courseId
      ? await getCourseOrThrow(payload.courseId)
      : existingModule.course;

  assertCanManageCourse(user, targetCourse);

  if (payload.order !== undefined || payload.courseId !== undefined) {
    await assertOrderIsUnique(
      targetCourseId,
      payload.order ?? existingModule.order,
      id,
    );
  }

  const data: Prisma.CourseModuleUpdateInput = {
    ...(payload.title ? { title: payload.title } : {}),
    ...(payload.description !== undefined
      ? { description: payload.description }
      : {}),
    ...(payload.order !== undefined ? { order: payload.order } : {}),
    ...(payload.courseId
      ? {
          course: {
            connect: {
              id: payload.courseId,
            },
          },
        }
      : {}),
  };

  const courseModule = await prisma.courseModule.update({
    where: {
      id,
    },
    data,
    select: courseModuleSelect,
  });

  return formatCourseModule(courseModule);
};

const deleteCourseModule = async (id: string, user: CourseModuleUser) => {
  const courseModule = await getCourseModuleOrThrow(id);
  assertCanManageCourse(user, courseModule.course);

  await prisma.courseModule.delete({
    where: {
      id,
    },
  });

  return null;
};

export const courseModuleService = {
  createCourseModule,
  updateCourseModule,
  deleteCourseModule,
};

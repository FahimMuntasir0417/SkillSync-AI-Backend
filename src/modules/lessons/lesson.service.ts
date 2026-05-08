import { Prisma, UserRole } from "@prisma/client";
import httpStatus from "http-status";

import { AppError } from "../../common/errors/AppError.js";
import { prisma } from "../../config/prisma.js";
import type {
  CreateLessonInput,
  LessonUser,
  UpdateLessonInput,
} from "./lesson.interface.js";

const lessonSelect = {
  id: true,
  title: true,
  content: true,
  videoUrl: true,
  resourceUrl: true,
  order: true,
  isPreview: true,
  moduleId: true,
  createdAt: true,
  updatedAt: true,
  module: {
    select: {
      id: true,
      title: true,
      order: true,
      courseId: true,
      course: {
        select: {
          id: true,
          title: true,
          slug: true,
          instructorId: true,
        },
      },
    },
  },
} satisfies Prisma.LessonSelect;

const getModuleOrThrow = async (moduleId: string) => {
  const courseModule = await prisma.courseModule.findUnique({
    where: {
      id: moduleId,
    },
    select: {
      id: true,
      courseId: true,
      course: {
        select: {
          id: true,
          instructorId: true,
        },
      },
    },
  });

  if (!courseModule) {
    throw new AppError(httpStatus.NOT_FOUND, "Course module not found");
  }

  return courseModule;
};

const getLessonOrThrow = async (id: string) => {
  const lesson = await prisma.lesson.findUnique({
    where: {
      id,
    },
    select: lessonSelect,
  });

  if (!lesson) {
    throw new AppError(httpStatus.NOT_FOUND, "Lesson not found");
  }

  return lesson;
};

const assertCanManageCourse = (
  user: LessonUser,
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

const assertLessonOrderIsUnique = async (
  moduleId: string,
  order: number,
  currentLessonId?: string,
) => {
  const existingLesson = await prisma.lesson.findUnique({
    where: {
      moduleId_order: {
        moduleId,
        order,
      },
    },
    select: {
      id: true,
    },
  });

  if (existingLesson && existingLesson.id !== currentLessonId) {
    throw new AppError(
      httpStatus.CONFLICT,
      "Lesson order already exists for this module",
    );
  }
};

const syncCourseTotalLessons = async (courseId: string) => {
  const totalLessons = await prisma.lesson.count({
    where: {
      module: {
        courseId,
      },
    },
  });

  await prisma.course.update({
    where: {
      id: courseId,
    },
    data: {
      totalLessons,
    },
  });
};

const createLesson = async (payload: CreateLessonInput, user: LessonUser) => {
  const courseModule = await getModuleOrThrow(payload.moduleId);
  assertCanManageCourse(user, courseModule.course);
  await assertLessonOrderIsUnique(payload.moduleId, payload.order);

  const lesson = await prisma.$transaction(async (tx) => {
    const createdLesson = await tx.lesson.create({
      data: {
        title: payload.title,
        content: payload.content,
        videoUrl: payload.videoUrl,
        resourceUrl: payload.resourceUrl,
        order: payload.order,
        isPreview: payload.isPreview ?? false,
        moduleId: payload.moduleId,
      },
      select: lessonSelect,
    });

    const totalLessons = await tx.lesson.count({
      where: {
        module: {
          courseId: courseModule.courseId,
        },
      },
    });

    await tx.course.update({
      where: {
        id: courseModule.courseId,
      },
      data: {
        totalLessons,
      },
    });

    return createdLesson;
  });

  return lesson;
};

const updateLesson = async (
  id: string,
  payload: UpdateLessonInput,
  user: LessonUser,
) => {
  const existingLesson = await getLessonOrThrow(id);
  assertCanManageCourse(user, existingLesson.module.course);

  const targetModule =
    payload.moduleId && payload.moduleId !== existingLesson.moduleId
      ? await getModuleOrThrow(payload.moduleId)
      : existingLesson.module;

  assertCanManageCourse(user, targetModule.course);

  if (payload.order !== undefined || payload.moduleId !== undefined) {
    await assertLessonOrderIsUnique(
      payload.moduleId ?? existingLesson.moduleId,
      payload.order ?? existingLesson.order,
      id,
    );
  }

  const data: Prisma.LessonUpdateInput = {
    ...(payload.title ? { title: payload.title } : {}),
    ...(payload.content ? { content: payload.content } : {}),
    ...(payload.videoUrl !== undefined ? { videoUrl: payload.videoUrl } : {}),
    ...(payload.resourceUrl !== undefined
      ? { resourceUrl: payload.resourceUrl }
      : {}),
    ...(payload.order !== undefined ? { order: payload.order } : {}),
    ...(payload.isPreview !== undefined ? { isPreview: payload.isPreview } : {}),
    ...(payload.moduleId
      ? {
          module: {
            connect: {
              id: payload.moduleId,
            },
          },
        }
      : {}),
  };

  const lesson = await prisma.$transaction(async (tx) => {
    const updatedLesson = await tx.lesson.update({
      where: {
        id,
      },
      data,
      select: lessonSelect,
    });

    if (payload.moduleId && payload.moduleId !== existingLesson.moduleId) {
      const courseIds = new Set([
        existingLesson.module.courseId,
        updatedLesson.module.courseId,
      ]);

      await Promise.all(
        [...courseIds].map(async (courseId) => {
          const totalLessons = await tx.lesson.count({
            where: {
              module: {
                courseId,
              },
            },
          });

          await tx.course.update({
            where: {
              id: courseId,
            },
            data: {
              totalLessons,
            },
          });
        }),
      );
    }

    return updatedLesson;
  });

  return lesson;
};

const deleteLesson = async (id: string, user: LessonUser) => {
  const lesson = await getLessonOrThrow(id);
  assertCanManageCourse(user, lesson.module.course);

  await prisma.$transaction(async (tx) => {
    await tx.lesson.delete({
      where: {
        id,
      },
    });

    const totalLessons = await tx.lesson.count({
      where: {
        module: {
          courseId: lesson.module.courseId,
        },
      },
    });

    await tx.course.update({
      where: {
        id: lesson.module.courseId,
      },
      data: {
        totalLessons,
      },
    });
  });

  return null;
};

const completeLesson = async (id: string, user: LessonUser) => {
  const lesson = await getLessonOrThrow(id);
  const { courseId } = lesson.module;

  const enrollment = await prisma.enrollment.findUnique({
    where: {
      userId_courseId: {
        userId: user.userId,
        courseId,
      },
    },
    select: {
      id: true,
    },
  });

  if (!enrollment) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You must be enrolled in this course to complete lessons",
    );
  }

  const result = await prisma.$transaction(async (tx) => {
    await tx.lessonProgress.upsert({
      where: {
        userId_lessonId: {
          userId: user.userId,
          lessonId: id,
        },
      },
      update: {
        completed: true,
        completedAt: new Date(),
      },
      create: {
        userId: user.userId,
        lessonId: id,
        completed: true,
        completedAt: new Date(),
      },
    });

    const [totalLessons, completedLessons] = await Promise.all([
      tx.lesson.count({
        where: {
          module: {
            courseId,
          },
        },
      }),
      tx.lessonProgress.count({
        where: {
          userId: user.userId,
          completed: true,
          lesson: {
            module: {
              courseId,
            },
          },
        },
      }),
    ]);

    const courseProgress =
      totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

    await tx.enrollment.update({
      where: {
        userId_courseId: {
          userId: user.userId,
          courseId,
        },
      },
      data: {
        progress: courseProgress,
      },
    });

    return {
      completed: true,
      courseProgress,
    };
  });

  return result;
};

export const lessonService = {
  createLesson,
  updateLesson,
  deleteLesson,
  completeLesson,
  syncCourseTotalLessons,
};

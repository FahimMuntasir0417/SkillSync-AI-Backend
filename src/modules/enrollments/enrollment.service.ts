import {
  CourseStatus,
  NotificationType,
  Prisma,
  UserRole,
} from "@prisma/client";
import httpStatus from "http-status";

import { AppError } from "../../common/errors/AppError.js";
import { sendEmail } from "../../common/utils/email.js";
import { env } from "../../config/env.js";
import { logger } from "../../config/logger.js";
import { prisma } from "../../config/prisma.js";
import type {
  EnrollmentUser,
  UpdateEnrollmentProgressInput,
} from "./enrollment.interface.js";

const categorySelect = {
  id: true,
  name: true,
  slug: true,
  iconUrl: true,
} satisfies Prisma.CategorySelect;

const instructorSelect = {
  id: true,
  name: true,
  email: true,
  avatarUrl: true,
  image: true,
  bio: true,
  role: true,
} satisfies Prisma.UserSelect;

const courseSelect = {
  id: true,
  title: true,
  slug: true,
  shortDescription: true,
  thumbnail: true,
  price: true,
  level: true,
  status: true,
  durationInHours: true,
  totalLessons: true,
  averageRating: true,
  totalReviews: true,
  totalEnrollments: true,
  category: {
    select: categorySelect,
  },
  instructor: {
    select: instructorSelect,
  },
} satisfies Prisma.CourseSelect;

const enrollmentSelect = {
  id: true,
  userId: true,
  courseId: true,
  progress: true,
  createdAt: true,
  updatedAt: true,
  course: {
    select: courseSelect,
  },
} satisfies Prisma.EnrollmentSelect;

const enrollmentEmailCourseSelect = {
  ...courseSelect,
  categoryId: true,
  instructorId: true,
  description: true,
  previewVideoUrl: true,
  createdAt: true,
  updatedAt: true,
  modules: {
    orderBy: {
      order: "asc",
    },
    select: {
      id: true,
      title: true,
      description: true,
      order: true,
      lessons: {
        orderBy: {
          order: "asc",
        },
        select: {
          id: true,
          title: true,
          order: true,
          isPreview: true,
          videoUrl: true,
          resourceUrl: true,
        },
      },
    },
  },
} satisfies Prisma.CourseSelect;

const toNumber = (value: Prisma.Decimal | number): number => Number(value);

const formatEnrollment = <
  T extends {
    course: {
      price: Prisma.Decimal | number;
    };
  },
>(
  enrollment: T,
) => ({
  ...enrollment,
  course: {
    ...enrollment.course,
    price: toNumber(enrollment.course.price),
  },
});

const getEnrollmentOrThrow = async (id: string) => {
  const enrollment = await prisma.enrollment.findUnique({
    where: {
      id,
    },
    select: enrollmentSelect,
  });

  if (!enrollment) {
    throw new AppError(httpStatus.NOT_FOUND, "Enrollment not found");
  }

  return enrollment;
};

const assertEnrollmentOwnerOrAdmin = (
  enrollment: {
    userId: string;
  },
  user: EnrollmentUser,
) => {
  if (user.role === UserRole.ADMIN || enrollment.userId === user.userId) {
    return;
  }

  throw new AppError(httpStatus.FORBIDDEN, "You are not authorized");
};

const enrollInCourse = async (courseId: string, user: EnrollmentUser) => {
  const course = await prisma.course.findUnique({
    where: {
      id: courseId,
    },
    select: enrollmentEmailCourseSelect,
  });

  if (!course) {
    throw new AppError(httpStatus.NOT_FOUND, "Course not found");
  }

  if (course.status !== CourseStatus.PUBLISHED) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "You can enroll only in published courses",
    );
  }

  const existingEnrollment = await prisma.enrollment.findUnique({
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

  if (existingEnrollment) {
    throw new AppError(httpStatus.CONFLICT, "You are already enrolled");
  }

  const student = await prisma.user.findUnique({
    where: { id: user.userId },
    select: { id: true, name: true, email: true },
  });

  if (!student) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  const enrollment = await prisma.$transaction(async (tx) => {
    const createdEnrollment = await tx.enrollment.create({
      data: {
        userId: user.userId,
        courseId,
      },
      select: enrollmentSelect,
    });

    await tx.course.update({
      where: {
        id: courseId,
      },
      data: {
        totalEnrollments: {
          increment: 1,
        },
      },
    });

    await tx.notification.create({
      data: {
        userId: user.userId,
        title: "Enrollment confirmed",
        message: `You are enrolled in ${course.title}.`,
        type: NotificationType.ENROLLMENT,
      },
    });

    await tx.notification.create({
      data: {
        userId: course.instructorId,
        title: "New student enrollment",
        message: `${student.name} enrolled in ${course.title}.`,
        type: NotificationType.ENROLLMENT,
      },
    });

    return createdEnrollment;
  });

  await sendEmail({
    to: student.email,
    subject: "Your SkillSync AI enrollment is confirmed",
    templateName: "enrollment-confirmation",
    templateData: {
      name: student.name,
      courseTitle: course.title,
      course: {
        averageRating: course.averageRating,
        category: course.category.name,
        courseUrl: `${env.CLIENT_URL}/courses/${course.slug}`,
        description: course.description,
        durationInHours: course.durationInHours,
        instructor: {
          bio: course.instructor.bio,
          email: course.instructor.email,
          name: course.instructor.name,
        },
        level: course.level,
        modules: course.modules.map((moduleItem) => ({
          description: moduleItem.description,
          lessons: moduleItem.lessons.map((lesson) => ({
            isPreview: lesson.isPreview,
            order: lesson.order,
            resourceUrl: lesson.resourceUrl,
            title: lesson.title,
            videoUrl: lesson.videoUrl,
          })),
          order: moduleItem.order,
          title: moduleItem.title,
        })),
        price: toNumber(course.price),
        previewVideoUrl: course.previewVideoUrl,
        shortDescription: course.shortDescription,
        slug: course.slug,
        startLearningUrl: `${env.CLIENT_URL}/my-classes`,
        thumbnail: course.thumbnail,
        totalEnrollments: course.totalEnrollments,
        totalLessons: course.totalLessons,
        totalModules: course.modules.length,
        totalReviews: course.totalReviews,
      },
    },
  }).catch((error: unknown) => {
    logger.error(
      {
        error,
        courseId,
        enrollmentId: enrollment.id,
        userId: user.userId,
      },
      "Enrollment confirmation email failed after enrollment was created",
    );
  });

  return formatEnrollment(enrollment);
};

const getMyClasses = async (user: EnrollmentUser) => {
  const enrollments = await prisma.enrollment.findMany({
    where: {
      userId: user.userId,
    },
    select: enrollmentSelect,
    orderBy: {
      updatedAt: "desc",
    },
  });

  return enrollments.map(formatEnrollment);
};

const getEnrollmentById = async (id: string, user: EnrollmentUser) => {
  const enrollment = await getEnrollmentOrThrow(id);
  assertEnrollmentOwnerOrAdmin(enrollment, user);

  return formatEnrollment(enrollment);
};

const updateEnrollmentProgress = async (
  id: string,
  payload: UpdateEnrollmentProgressInput,
  user: EnrollmentUser,
) => {
  const enrollment = await getEnrollmentOrThrow(id);

  if (enrollment.userId !== user.userId) {
    throw new AppError(httpStatus.FORBIDDEN, "You are not authorized");
  }

  const updatedEnrollment = await prisma.enrollment.update({
    where: {
      id,
    },
    data: {
      progress: payload.progress,
    },
    select: enrollmentSelect,
  });

  return formatEnrollment(updatedEnrollment);
};

export const enrollmentService = {
  enrollInCourse,
  getMyClasses,
  getEnrollmentById,
  updateEnrollmentProgress,
};

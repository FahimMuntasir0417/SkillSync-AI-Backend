import { Prisma, UserRole } from "@prisma/client";
import httpStatus from "http-status";

import { AppError } from "../../common/errors/AppError.js";
import { prisma } from "../../config/prisma.js";
import type { CourseReviewUser, CreateCourseReviewInput, UpdateCourseReviewInput } from "./courseReview.interface.js";

const userSelect = {
  id: true,
  name: true,
  email: true,
  avatarUrl: true,
  image: true,
  role: true,
} satisfies Prisma.UserSelect;

const courseReviewSelect = {
  id: true,
  courseId: true,
  userId: true,
  rating: true,
  comment: true,
  createdAt: true,
  updatedAt: true,
  user: { select: userSelect },
} satisfies Prisma.CourseReviewSelect;

const recalculateCourseRating = async (courseId: string, tx: Prisma.TransactionClient) => {
  const aggregate = await tx.courseReview.aggregate({
    where: { courseId },
    _avg: { rating: true },
    _count: { rating: true },
  });

  await tx.course.update({
    where: { id: courseId },
    data: {
      averageRating: Number((aggregate._avg.rating ?? 0).toFixed(2)),
      totalReviews: aggregate._count.rating,
    },
  });
};

const assertEnrolled = async (courseId: string, userId: string) => {
  const enrollment = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId, courseId } },
    select: { id: true },
  });
  if (!enrollment) throw new AppError(httpStatus.FORBIDDEN, "You must be enrolled to review this course");
};

const getReviewOrThrow = async (id: string) => {
  const review = await prisma.courseReview.findUnique({
    where: { id },
    select: courseReviewSelect,
  });
  if (!review) throw new AppError(httpStatus.NOT_FOUND, "Course review not found");
  return review;
};

const createCourseReview = async (courseId: string, payload: CreateCourseReviewInput, user: CourseReviewUser) => {
  const course = await prisma.course.findUnique({ where: { id: courseId }, select: { id: true } });
  if (!course) throw new AppError(httpStatus.NOT_FOUND, "Course not found");
  await assertEnrolled(courseId, user.userId);

  const existing = await prisma.courseReview.findUnique({
    where: { courseId_userId: { courseId, userId: user.userId } },
    select: { id: true },
  });
  if (existing) throw new AppError(httpStatus.CONFLICT, "You already reviewed this course");

  return prisma.$transaction(async (tx) => {
    const review = await tx.courseReview.create({
      data: { courseId, userId: user.userId, rating: payload.rating, comment: payload.comment },
      select: courseReviewSelect,
    });
    await recalculateCourseRating(courseId, tx);
    return review;
  });
};

const getCourseReviews = (courseId: string) =>
  prisma.courseReview.findMany({
    where: { courseId },
    select: courseReviewSelect,
    orderBy: { createdAt: "desc" },
  });

const updateCourseReview = async (id: string, payload: UpdateCourseReviewInput, user: CourseReviewUser) => {
  const existing = await getReviewOrThrow(id);
  if (existing.userId !== user.userId) throw new AppError(httpStatus.FORBIDDEN, "You are not authorized");
  return prisma.$transaction(async (tx) => {
    const review = await tx.courseReview.update({
      where: { id },
      data: {
        ...(payload.rating !== undefined ? { rating: payload.rating } : {}),
        ...(payload.comment !== undefined ? { comment: payload.comment } : {}),
      },
      select: courseReviewSelect,
    });
    await recalculateCourseRating(existing.courseId, tx);
    return review;
  });
};

const deleteCourseReview = async (id: string, user: CourseReviewUser) => {
  const existing = await getReviewOrThrow(id);
  if (existing.userId !== user.userId && user.role !== UserRole.ADMIN) {
    throw new AppError(httpStatus.FORBIDDEN, "You are not authorized");
  }
  await prisma.$transaction(async (tx) => {
    await tx.courseReview.delete({ where: { id } });
    await recalculateCourseRating(existing.courseId, tx);
  });
  return null;
};

export const courseReviewService = {
  createCourseReview,
  getCourseReviews,
  updateCourseReview,
  deleteCourseReview,
};

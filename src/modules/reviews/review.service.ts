import { Prisma, UserRole } from "@prisma/client";
import httpStatus from "http-status";

import { AppError } from "../../common/errors/AppError.js";
import { prisma } from "../../config/prisma.js";
import type { CreateReviewInput, ReviewUser, UpdateReviewInput } from "./review.interface.js";

const userSelect = {
  id: true,
  name: true,
  email: true,
  avatarUrl: true,
  image: true,
  bio: true,
  role: true,
} satisfies Prisma.UserSelect;

const reviewSelect = {
  id: true,
  submissionId: true,
  reviewerId: true,
  feedback: true,
  score: true,
  createdAt: true,
  updatedAt: true,
  reviewer: { select: userSelect },
  submission: {
    select: {
      id: true,
      studentId: true,
      status: true,
      githubUrl: true,
      liveUrl: true,
      notes: true,
      student: { select: userSelect },
      assignment: {
        select: {
          id: true,
          title: true,
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
    },
  },
} satisfies Prisma.ReviewSelect;

const getSubmissionOrThrow = async (id: string) => {
  const submission = await prisma.submission.findUnique({
    where: { id },
    select: {
      id: true,
      studentId: true,
      review: { select: { id: true } },
      assignment: {
        select: {
          course: {
            select: {
              instructorId: true,
            },
          },
        },
      },
    },
  });

  if (!submission) {
    throw new AppError(httpStatus.NOT_FOUND, "Submission not found");
  }

  return submission;
};

const getReviewOrThrow = async (id: string) => {
  const review = await prisma.review.findUnique({
    where: { id },
    select: reviewSelect,
  });

  if (!review) {
    throw new AppError(httpStatus.NOT_FOUND, "Review not found");
  }

  return review;
};

const assertCanReview = (
  user: ReviewUser,
  course: {
    instructorId: string;
  },
) => {
  if (user.role === UserRole.ADMIN) return;
  if (user.role === UserRole.INSTRUCTOR && course.instructorId === user.userId) return;
  throw new AppError(httpStatus.FORBIDDEN, "You are not authorized");
};

const assertCanViewReview = (
  user: ReviewUser,
  review: Awaited<ReturnType<typeof getReviewOrThrow>>,
) => {
  if (user.role === UserRole.ADMIN) return;
  if (review.submission.studentId === user.userId) return;
  if (
    user.role === UserRole.INSTRUCTOR &&
    review.submission.assignment.course.instructorId === user.userId
  ) {
    return;
  }
  throw new AppError(httpStatus.FORBIDDEN, "You are not authorized");
};

const createReview = async (
  submissionId: string,
  payload: CreateReviewInput,
  user: ReviewUser,
) => {
  const submission = await getSubmissionOrThrow(submissionId);
  assertCanReview(user, submission.assignment.course);

  if (submission.review) {
    throw new AppError(httpStatus.CONFLICT, "Submission already has a review");
  }

  return prisma.$transaction(async (tx) => {
    const review = await tx.review.create({
      data: {
        submissionId,
        reviewerId: user.userId,
        feedback: payload.feedback,
        score: payload.score,
      },
      select: reviewSelect,
    });

    await tx.submission.update({
      where: { id: submissionId },
      data: { status: payload.submissionStatus },
    });

    return review;
  });
};

const updateReview = async (id: string, payload: UpdateReviewInput, user: ReviewUser) => {
  const review = await getReviewOrThrow(id);
  assertCanReview(user, review.submission.assignment.course);

  return prisma.$transaction(async (tx) => {
    const updatedReview = await tx.review.update({
      where: { id },
      data: {
        ...(payload.feedback ? { feedback: payload.feedback } : {}),
        ...(payload.score !== undefined ? { score: payload.score } : {}),
      },
      select: reviewSelect,
    });

    if (payload.submissionStatus) {
      await tx.submission.update({
        where: { id: review.submissionId },
        data: { status: payload.submissionStatus },
      });
    }

    return updatedReview;
  });
};

const getReviewById = async (id: string, user: ReviewUser) => {
  const review = await getReviewOrThrow(id);
  assertCanViewReview(user, review);
  return review;
};

export const reviewService = {
  createReview,
  updateReview,
  getReviewById,
};

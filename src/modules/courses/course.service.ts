import {
  CourseLevel,
  CourseStatus,
  Prisma,
  UserRole,
  UserStatus,
} from "@prisma/client";
import httpStatus from "http-status";

import { AppError } from "../../common/errors/AppError.js";
import { calculatePagination } from "../../common/utils/pagination.js";
import { slugify } from "../../common/utils/slugify.js";
import { prisma } from "../../config/prisma.js";
import { courseSearchableFields, courseSortableFields } from "./course.constant.js";
import type {
  CourseLimitQuery,
  CourseListQuery,
  CourseUser,
  CreateCourseInput,
  UpdateCourseInput,
} from "./course.interface.js";

const instructorSelect = {
  id: true,
  name: true,
  email: true,
  avatarUrl: true,
  image: true,
  bio: true,
  role: true,
} satisfies Prisma.UserSelect;

const categorySelect = {
  id: true,
  name: true,
  slug: true,
  iconUrl: true,
} satisfies Prisma.CategorySelect;

const courseListSelect = {
  id: true,
  title: true,
  slug: true,
  shortDescription: true,
  description: true,
  thumbnail: true,
  previewVideoUrl: true,
  price: true,
  level: true,
  status: true,
  durationInHours: true,
  totalLessons: true,
  averageRating: true,
  totalReviews: true,
  totalEnrollments: true,
  categoryId: true,
  instructorId: true,
  createdAt: true,
  updatedAt: true,
  category: {
    select: categorySelect,
  },
  instructor: {
    select: instructorSelect,
  },
  _count: {
    select: {
      enrollments: true,
    },
  },
} satisfies Prisma.CourseSelect;

const courseDetailSelect = {
  ...courseListSelect,
  modules: {
    orderBy: {
      order: "asc",
    },
    select: {
      id: true,
      title: true,
      description: true,
      order: true,
      createdAt: true,
      updatedAt: true,
      lessons: {
        orderBy: {
          order: "asc",
        },
        select: {
          id: true,
          title: true,
          content: true,
          videoUrl: true,
          resourceUrl: true,
          order: true,
          isPreview: true,
          createdAt: true,
          updatedAt: true,
        },
      },
    },
  },
  reviews: {
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      rating: true,
      comment: true,
      createdAt: true,
      updatedAt: true,
      user: {
        select: instructorSelect,
      },
    },
  },
} satisfies Prisma.CourseSelect;

const toNumber = (value: Prisma.Decimal | number): number => Number(value);

const formatCourse = <
  T extends {
    price: Prisma.Decimal | number;
    _count?: {
      enrollments: number;
    };
  },
>(
  course: T,
) => {
  const { _count, ...rest } = course;

  return {
    ...rest,
    price: toNumber(course.price),
    enrollmentCount: _count?.enrollments ?? 0,
  };
};

const parseNumber = (value: unknown): number | undefined => {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : undefined;
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

const parseLimit = (value: unknown, fallback: number): number => {
  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    return fallback;
  }

  return parsed;
};

const createUniqueSlug = async (
  title: string,
  currentCourseId?: string,
): Promise<string> => {
  const baseSlug = slugify(title);

  if (!baseSlug) {
    throw new AppError(httpStatus.BAD_REQUEST, "Course title is invalid");
  }

  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const existingCourse = await prisma.course.findUnique({
      where: {
        slug,
      },
      select: {
        id: true,
      },
    });

    if (!existingCourse || existingCourse.id === currentCourseId) {
      return slug;
    }

    counter += 1;
    slug = `${baseSlug}-${counter}`;
  }
};

const assertCategoryExists = async (categoryId: string) => {
  const category = await prisma.category.findUnique({
    where: {
      id: categoryId,
    },
    select: {
      id: true,
    },
  });

  if (!category) {
    throw new AppError(httpStatus.NOT_FOUND, "Category not found");
  }
};

const assertInstructorExists = async (instructorId: string) => {
  const instructor = await prisma.user.findFirst({
    where: {
      id: instructorId,
      role: {
        in: [UserRole.INSTRUCTOR, UserRole.ADMIN],
      },
      status: UserStatus.ACTIVE,
      isBlocked: false,
      isDeleted: false,
    },
    select: {
      id: true,
    },
  });

  if (!instructor) {
    throw new AppError(httpStatus.NOT_FOUND, "Instructor not found");
  }
};

const getCourseForWriteOrThrow = async (id: string) => {
  const course = await prisma.course.findUnique({
    where: {
      id,
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

const assertCanManageCourse = (
  user: CourseUser,
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

const createCourse = async (payload: CreateCourseInput, user: CourseUser) => {
  const instructorId =
    user.role === UserRole.ADMIN && payload.instructorId
      ? payload.instructorId
      : user.userId;

  await Promise.all([
    assertCategoryExists(payload.categoryId),
    assertInstructorExists(instructorId),
  ]);

  const slug = await createUniqueSlug(payload.title);

  const course = await prisma.course.create({
    data: {
      title: payload.title,
      slug,
      shortDescription: payload.shortDescription,
      description: payload.description,
      thumbnail: payload.thumbnail,
      previewVideoUrl: payload.previewVideoUrl,
      price: payload.price ?? 0,
      level: payload.level,
      status: payload.status ?? CourseStatus.DRAFT,
      durationInHours: payload.durationInHours ?? 0,
      categoryId: payload.categoryId,
      instructorId,
    },
    select: courseListSelect,
  });

  return formatCourse(course);
};

const getCourses = async (query: CourseListQuery) => {
  const { page, limit, skip, sortBy, sortOrder } = calculatePagination(query);
  const search = typeof query.search === "string" ? query.search : undefined;
  const level = parseEnum(CourseLevel, query.level);
  const status = parseEnum(CourseStatus, query.status);
  const minPrice = parseNumber(query.minPrice);
  const maxPrice = parseNumber(query.maxPrice);
  const minRating = parseNumber(query.minRating);
  const safeSortBy = courseSortableFields.includes(
    sortBy as (typeof courseSortableFields)[number],
  )
    ? sortBy
    : "createdAt";

  const where: Prisma.CourseWhereInput = {
    status: status ?? CourseStatus.PUBLISHED,
    ...(typeof query.categoryId === "string" ? { categoryId: query.categoryId } : {}),
    ...(level ? { level } : {}),
    ...(typeof query.instructorId === "string"
      ? { instructorId: query.instructorId }
      : {}),
    ...(minRating !== undefined ? { averageRating: { gte: minRating } } : {}),
    ...(minPrice !== undefined || maxPrice !== undefined
      ? {
          price: {
            ...(minPrice !== undefined ? { gte: minPrice } : {}),
            ...(maxPrice !== undefined ? { lte: maxPrice } : {}),
          },
        }
      : {}),
    ...(search
      ? {
          OR: courseSearchableFields.map((field) => ({
            [field]: {
              contains: search,
              mode: "insensitive",
            },
          })),
        }
      : {}),
  };

  const [total, courses] = await Promise.all([
    prisma.course.count({ where }),
    prisma.course.findMany({
      where,
      select: courseListSelect,
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
    data: courses.map(formatCourse),
  };
};

const getFeaturedCourses = async (query: CourseLimitQuery) => {
  const limit = parseLimit(query.limit, 8);
  const courses = await prisma.course.findMany({
    where: {
      status: CourseStatus.PUBLISHED,
    },
    select: courseListSelect,
    take: limit,
    orderBy: [
      {
        averageRating: "desc",
      },
      {
        totalEnrollments: "desc",
      },
      {
        createdAt: "desc",
      },
    ],
  });

  return courses.map(formatCourse);
};

const getRelatedCourses = async (courseId: string, query: CourseLimitQuery) => {
  const limit = parseLimit(query.limit, 4);
  const currentCourse = await prisma.course.findUnique({
    where: {
      id: courseId,
    },
    select: {
      id: true,
      categoryId: true,
    },
  });

  if (!currentCourse) {
    throw new AppError(httpStatus.NOT_FOUND, "Course not found");
  }

  const courses = await prisma.course.findMany({
    where: {
      id: {
        not: currentCourse.id,
      },
      categoryId: currentCourse.categoryId,
      status: CourseStatus.PUBLISHED,
    },
    select: courseListSelect,
    take: limit,
    orderBy: [
      {
        averageRating: "desc",
      },
      {
        totalEnrollments: "desc",
      },
      {
        createdAt: "desc",
      },
    ],
  });

  return courses.map(formatCourse);
};

const getCourseBySlug = async (slug: string) => {
  const course = await prisma.course.findFirst({
    where: {
      slug,
      status: CourseStatus.PUBLISHED,
    },
    select: courseDetailSelect,
  });

  if (!course) {
    throw new AppError(httpStatus.NOT_FOUND, "Course not found");
  }

  return formatCourse(course);
};

const updateCourse = async (
  id: string,
  payload: UpdateCourseInput,
  user: CourseUser,
) => {
  const existingCourse = await getCourseForWriteOrThrow(id);
  assertCanManageCourse(user, existingCourse);

  await Promise.all([
    payload.categoryId ? assertCategoryExists(payload.categoryId) : undefined,
    payload.instructorId ? assertInstructorExists(payload.instructorId) : undefined,
  ]);

  const data: Prisma.CourseUpdateInput = {
    ...(payload.title ? { title: payload.title } : {}),
    ...(payload.shortDescription
      ? { shortDescription: payload.shortDescription }
      : {}),
    ...(payload.description ? { description: payload.description } : {}),
    ...(payload.thumbnail ? { thumbnail: payload.thumbnail } : {}),
    ...(payload.previewVideoUrl !== undefined
      ? { previewVideoUrl: payload.previewVideoUrl }
      : {}),
    ...(payload.price !== undefined ? { price: payload.price } : {}),
    ...(payload.level ? { level: payload.level } : {}),
    ...(payload.status ? { status: payload.status } : {}),
    ...(payload.durationInHours !== undefined
      ? { durationInHours: payload.durationInHours }
      : {}),
    ...(payload.categoryId
      ? {
          category: {
            connect: {
              id: payload.categoryId,
            },
          },
        }
      : {}),
  };

  if (payload.title) {
    data.slug = await createUniqueSlug(payload.title, id);
  }

  if (payload.instructorId && user.role === UserRole.ADMIN) {
    data.instructor = {
      connect: {
        id: payload.instructorId,
      },
    };
  }

  const course = await prisma.course.update({
    where: {
      id,
    },
    data,
    select: courseListSelect,
  });

  return formatCourse(course);
};

const deleteCourse = async (id: string, user: CourseUser) => {
  const course = await getCourseForWriteOrThrow(id);
  assertCanManageCourse(user, course);

  await prisma.course.delete({
    where: {
      id,
    },
  });

  return null;
};

export const courseService = {
  createCourse,
  getCourses,
  getFeaturedCourses,
  getRelatedCourses,
  getCourseBySlug,
  updateCourse,
  deleteCourse,
};

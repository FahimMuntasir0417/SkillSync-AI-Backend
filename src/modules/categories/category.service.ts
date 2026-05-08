import type { Prisma } from "@prisma/client";
import httpStatus from "http-status";

import { AppError } from "../../common/errors/AppError.js";
import { slugify } from "../../common/utils/slugify.js";
import { prisma } from "../../config/prisma.js";
import type {
  CreateCategoryInput,
  UpdateCategoryInput,
} from "./category.interface.js";

const categorySelect = {
  id: true,
  name: true,
  slug: true,
  description: true,
  iconUrl: true,
  createdAt: true,
  updatedAt: true,
  _count: {
    select: {
      courses: true,
    },
  },
} satisfies Prisma.CategorySelect;

const formatCategory = <
  T extends {
    _count?: {
      courses: number;
    };
  },
>(
  category: T,
) => {
  const { _count, ...rest } = category;

  return {
    ...rest,
    courseCount: _count?.courses ?? 0,
  };
};

const createUniqueSlug = async (
  name: string,
  currentCategoryId?: string,
): Promise<string> => {
  const baseSlug = slugify(name);

  if (!baseSlug) {
    throw new AppError(httpStatus.BAD_REQUEST, "Category name is invalid");
  }

  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const existingCategory = await prisma.category.findUnique({
      where: {
        slug,
      },
      select: {
        id: true,
      },
    });

    if (!existingCategory || existingCategory.id === currentCategoryId) {
      return slug;
    }

    counter += 1;
    slug = `${baseSlug}-${counter}`;
  }
};

const assertNameIsUnique = async (name: string, currentCategoryId?: string) => {
  const existingCategory = await prisma.category.findUnique({
    where: {
      name,
    },
    select: {
      id: true,
    },
  });

  if (existingCategory && existingCategory.id !== currentCategoryId) {
    throw new AppError(httpStatus.CONFLICT, "Category name already exists");
  }
};

const getCategoryOrThrow = async (id: string) => {
  const category = await prisma.category.findUnique({
    where: {
      id,
    },
    select: categorySelect,
  });

  if (!category) {
    throw new AppError(httpStatus.NOT_FOUND, "Category not found");
  }

  return category;
};

const createCategory = async (payload: CreateCategoryInput) => {
  await assertNameIsUnique(payload.name);
  const slug = await createUniqueSlug(payload.name);

  const category = await prisma.category.create({
    data: {
      ...payload,
      slug,
    },
    select: categorySelect,
  });

  return formatCategory(category);
};

const getCategories = async () => {
  const categories = await prisma.category.findMany({
    select: categorySelect,
    orderBy: {
      createdAt: "desc",
    },
  });

  return categories.map(formatCategory);
};

const getCategoryById = async (id: string) => {
  const category = await getCategoryOrThrow(id);

  return formatCategory(category);
};

const updateCategory = async (id: string, payload: UpdateCategoryInput) => {
  await getCategoryOrThrow(id);

  const data: Prisma.CategoryUpdateInput = {
    ...payload,
  };

  if (payload.name) {
    await assertNameIsUnique(payload.name, id);
    data.slug = await createUniqueSlug(payload.name, id);
  }

  const category = await prisma.category.update({
    where: {
      id,
    },
    data,
    select: categorySelect,
  });

  return formatCategory(category);
};

const deleteCategory = async (id: string) => {
  const category = await getCategoryOrThrow(id);

  if (category._count.courses > 0) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Cannot delete category because it has courses",
    );
  }

  await prisma.category.delete({
    where: {
      id,
    },
  });

  return null;
};

export const categoryService = {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
};

import { Prisma, UserRole } from "@prisma/client";
import httpStatus from "http-status";

import { AppError } from "../../common/errors/AppError.js";
import { calculatePagination } from "../../common/utils/pagination.js";
import { slugify } from "../../common/utils/slugify.js";
import { prisma } from "../../config/prisma.js";
import type { BlogListQuery, BlogUser, CreateBlogInput, UpdateBlogInput } from "./blog.interface.js";

const blogSortableFields = ["createdAt", "title"] as const;

const authorSelect = {
  id: true,
  name: true,
  email: true,
  avatarUrl: true,
  image: true,
  bio: true,
  role: true,
} satisfies Prisma.UserSelect;

const blogSelect = {
  id: true,
  title: true,
  slug: true,
  excerpt: true,
  content: true,
  thumbnail: true,
  tags: true,
  published: true,
  authorId: true,
  createdAt: true,
  updatedAt: true,
  author: { select: authorSelect },
} satisfies Prisma.BlogSelect;

const parseBoolean = (value: unknown): boolean | undefined => {
  if (value === true || value === "true") return true;
  if (value === false || value === "false") return false;
  return undefined;
};

const createUniqueSlug = async (title: string, currentBlogId?: string) => {
  const baseSlug = slugify(title);
  if (!baseSlug) throw new AppError(httpStatus.BAD_REQUEST, "Blog title is invalid");
  let slug = baseSlug;
  let counter = 1;
  while (true) {
    const existing = await prisma.blog.findUnique({ where: { slug }, select: { id: true } });
    if (!existing || existing.id === currentBlogId) return slug;
    counter += 1;
    slug = `${baseSlug}-${counter}`;
  }
};

const getBlogOrThrow = async (id: string) => {
  const blog = await prisma.blog.findUnique({ where: { id }, select: blogSelect });
  if (!blog) throw new AppError(httpStatus.NOT_FOUND, "Blog not found");
  return blog;
};

const assertCanManageBlog = (blog: { authorId: string }, user: BlogUser) => {
  if (user.role === UserRole.ADMIN || blog.authorId === user.userId) return;
  throw new AppError(httpStatus.FORBIDDEN, "You are not authorized");
};

const createBlog = async (payload: CreateBlogInput, user: BlogUser) => {
  const slug = await createUniqueSlug(payload.title);
  return prisma.blog.create({
    data: {
      title: payload.title,
      slug,
      excerpt: payload.excerpt,
      content: payload.content,
      thumbnail: payload.thumbnail,
      tags: payload.tags,
      published: payload.published ?? false,
      authorId: user.userId,
    },
    select: blogSelect,
  });
};

const getBlogs = async (query: BlogListQuery, user?: BlogUser) => {
  const { page, limit, skip, sortBy, sortOrder } = calculatePagination(query);
  const search = typeof query.search === "string" ? query.search : undefined;
  const published = parseBoolean(query.published);
  const safeSortBy = blogSortableFields.includes(sortBy as (typeof blogSortableFields)[number]) ? sortBy : "createdAt";

  const where: Prisma.BlogWhereInput = {
    ...(user?.role === UserRole.ADMIN ? (published !== undefined ? { published } : {}) : { published: true }),
    ...(user?.role === UserRole.INSTRUCTOR && query.authorId === user.userId ? { authorId: user.userId } : {}),
    ...(user?.role === UserRole.ADMIN && typeof query.authorId === "string" ? { authorId: query.authorId } : {}),
    ...(typeof query.tag === "string" ? { tags: { has: query.tag } } : {}),
    ...(search
      ? {
          OR: [
            { title: { contains: search, mode: "insensitive" } },
            { excerpt: { contains: search, mode: "insensitive" } },
            { content: { contains: search, mode: "insensitive" } },
            { tags: { has: search } },
          ],
        }
      : {}),
  };

  const [total, blogs] = await Promise.all([
    prisma.blog.count({ where }),
    prisma.blog.findMany({ where, select: blogSelect, skip, take: limit, orderBy: { [safeSortBy]: sortOrder } }),
  ]);

  return { meta: { page, limit, total, totalPage: Math.ceil(total / limit) }, data: blogs };
};

const getBlogBySlug = async (slug: string) => {
  const blog = await prisma.blog.findFirst({ where: { slug, published: true }, select: blogSelect });
  if (!blog) throw new AppError(httpStatus.NOT_FOUND, "Blog not found");
  return blog;
};

const updateBlog = async (id: string, payload: UpdateBlogInput, user: BlogUser) => {
  const blog = await getBlogOrThrow(id);
  assertCanManageBlog(blog, user);
  return prisma.blog.update({
    where: { id },
    data: {
      ...(payload.title ? { title: payload.title, slug: await createUniqueSlug(payload.title, id) } : {}),
      ...(payload.excerpt ? { excerpt: payload.excerpt } : {}),
      ...(payload.content ? { content: payload.content } : {}),
      ...(payload.thumbnail !== undefined ? { thumbnail: payload.thumbnail } : {}),
      ...(payload.tags ? { tags: payload.tags } : {}),
      ...(payload.published !== undefined ? { published: payload.published } : {}),
    },
    select: blogSelect,
  });
};

const deleteBlog = async (id: string, user: BlogUser) => {
  const blog = await getBlogOrThrow(id);
  assertCanManageBlog(blog, user);
  await prisma.blog.delete({ where: { id } });
  return null;
};

export const blogService = { createBlog, getBlogs, getBlogBySlug, updateBlog, deleteBlog };

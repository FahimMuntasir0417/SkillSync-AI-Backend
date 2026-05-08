import type { UserRole } from "@prisma/client";

export type BlogUser = {
  userId: string;
  email: string;
  role: UserRole;
};

export type CreateBlogInput = {
  title: string;
  excerpt: string;
  content: string;
  thumbnail?: string;
  tags: string[];
  published?: boolean;
};

export type UpdateBlogInput = Partial<CreateBlogInput>;

export type BlogListQuery = {
  search?: unknown;
  tag?: unknown;
  published?: unknown;
  authorId?: unknown;
  page?: unknown;
  limit?: unknown;
  sortBy?: unknown;
  sortOrder?: unknown;
};

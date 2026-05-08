import { UserRole } from "@prisma/client";
import { Router } from "express";

import { checkAuth } from "../../common/middlewares/checkAuth.js";
import { roleGuard } from "../../common/middlewares/roleGuard.js";
import { validateRequest } from "../../common/middlewares/validateRequest.js";
import { blogController } from "./blog.controller.js";
import { createBlogSchema, deleteBlogSchema, getBlogBySlugSchema, updateBlogSchema } from "./blog.validation.js";

export const blogRoute = Router();

blogRoute.post("/", checkAuth(), roleGuard(UserRole.ADMIN, UserRole.INSTRUCTOR), validateRequest(createBlogSchema), blogController.createBlog);
blogRoute.get("/", blogController.getBlogs);
blogRoute.get("/:slug", validateRequest(getBlogBySlugSchema), blogController.getBlogBySlug);
blogRoute.patch("/:id", checkAuth(), roleGuard(UserRole.ADMIN, UserRole.INSTRUCTOR), validateRequest(updateBlogSchema), blogController.updateBlog);
blogRoute.delete("/:id", checkAuth(), roleGuard(UserRole.ADMIN, UserRole.INSTRUCTOR), validateRequest(deleteBlogSchema), blogController.deleteBlog);

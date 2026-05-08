import { Router } from "express";

import { authRoute } from "./modules/auth/auth.route.js";
import { categoryRoute } from "./modules/categories/category.route.js";
import { courseModuleRoute } from "./modules/courseModules/courseModule.route.js";
import { courseRoute } from "./modules/courses/course.route.js";
import { userRoute } from "./modules/users/user.route.js";

export const routes = Router();

routes.get("/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "SkillSync AI API is running",
  });
});

routes.use("/api/v1/auth", authRoute);
routes.use("/api/v1/users", userRoute);
routes.use("/api/v1/categories", categoryRoute);
routes.use("/api/v1/courses", courseRoute);
routes.use("/api/v1/course-modules", courseModuleRoute);

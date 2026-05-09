import { Router } from "express";

import { aiRoute } from "./modules/ai/ai.route.js";
import { assignmentRoute } from "./modules/assignments/assignment.route.js";
import { AuthController } from "./modules/auth/auth.controller.js";
import { authRoute } from "./modules/auth/auth.route.js";
import { blogRoute } from "./modules/blogs/blog.route.js";
import { categoryRoute } from "./modules/categories/category.route.js";
import { courseReviewRoute } from "./modules/courseReviews/courseReview.route.js";
import { courseModuleRoute } from "./modules/courseModules/courseModule.route.js";
import { courseRoute } from "./modules/courses/course.route.js";
import { dashboardRoute } from "./modules/dashboard/dashboard.route.js";
import { enrollmentRoute } from "./modules/enrollments/enrollment.route.js";
import { lessonRoute } from "./modules/lessons/lesson.route.js";
import { reviewRoute } from "./modules/reviews/review.route.js";
import { submissionRoute } from "./modules/submissions/submission.route.js";
import { supportRoute } from "./modules/support/support.route.js";
import { userRoute } from "./modules/users/user.route.js";

export const routes = Router();

routes.get("/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "SkillSync AI API is running",
  });
});

routes.get("/api/auth/callback/google", AuthController.googleOAuthCallback);
routes.use("/api/v1/auth", authRoute);
routes.use("/api/v1/users", userRoute);
routes.use("/api/v1/categories", categoryRoute);
routes.use("/api/v1/courses", courseRoute);
routes.use("/api/v1/course-modules", courseModuleRoute);
routes.use("/api/v1/lessons", lessonRoute);
routes.use("/api/v1/enrollments", enrollmentRoute);
routes.use("/api/v1/assignments", assignmentRoute);
routes.use("/api/v1/submissions", submissionRoute);
routes.use("/api/v1", reviewRoute);
routes.use("/api/v1", courseReviewRoute);
routes.use("/api/v1/blogs", blogRoute);
routes.use("/api/v1/support", supportRoute);
routes.use("/api/v1/dashboard", dashboardRoute);
routes.use("/api/v1/ai", aiRoute);

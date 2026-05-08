import { UserRole } from "@prisma/client";
import { Router } from "express";

import { checkAuth } from "../../common/middlewares/checkAuth.js";
import { aiRateLimiter } from "../../common/middlewares/rateLimiter.js";
import { roleGuard } from "../../common/middlewares/roleGuard.js";
import { validateRequest } from "../../common/middlewares/validateRequest.js";
import { aiController } from "./ai.controller.js";
import {
  aiLogQuerySchema,
  assignmentFeedbackSchema,
  blogGeneratorSchema,
  chatValidation,
  chatSchema,
  courseSummarySchema,
  generateRoadmapValidation,
  recommendProjectsValidation,
  recommendationsSchema,
  roadmapGeneratorSchema,
  projectRecommenderSchema,
  careerChatSchema,
  analyzeSkillGapValidation,
  skillGapAnalyzerSchema,
} from "./ai.validation.js";

export const aiRoute = Router();
const router = aiRoute;

router.post(
  "/roadmap",
  aiRateLimiter,
  checkAuth(),
  validateRequest(generateRoadmapValidation),
  aiController.generateRoadmapController,
);
router.post(
  "/skill-gap",
  aiRateLimiter,
  checkAuth(),
  validateRequest(analyzeSkillGapValidation),
  aiController.analyzeSkillGapController,
);
router.post(
  "/project-recommendations",
  aiRateLimiter,
  checkAuth(),
  validateRequest(recommendProjectsValidation),
  aiController.recommendProjectsController,
);
router.post(
  "/chat",
  aiRateLimiter,
  checkAuth(),
  validateRequest(chatValidation),
  aiController.chatController,
);

aiRoute.post("/course-summary", aiRateLimiter, checkAuth(), validateRequest(courseSummarySchema), aiController.courseSummary);
aiRoute.post("/study-chat", aiRateLimiter, checkAuth(), validateRequest(chatSchema), aiController.chat);
aiRoute.post("/recommendations", aiRateLimiter, checkAuth(), validateRequest(recommendationsSchema), aiController.recommendations);
aiRoute.post("/assignment-feedback", aiRateLimiter, checkAuth(), validateRequest(assignmentFeedbackSchema), aiController.assignmentFeedback);
aiRoute.post("/blog-generator", aiRateLimiter, checkAuth(), validateRequest(blogGeneratorSchema), aiController.blogGenerator);
aiRoute.post("/roadmap-generator", aiRateLimiter, checkAuth(), validateRequest(roadmapGeneratorSchema), aiController.roadmapGenerator);
aiRoute.post("/skill-gap-analyzer", aiRateLimiter, checkAuth(), validateRequest(skillGapAnalyzerSchema), aiController.skillGapAnalyzer);
aiRoute.post("/project-recommender", aiRateLimiter, checkAuth(), validateRequest(projectRecommenderSchema), aiController.projectRecommender);
aiRoute.post("/career-chat", aiRateLimiter, checkAuth(), validateRequest(careerChatSchema), aiController.careerChat);
aiRoute.get("/logs", checkAuth(), roleGuard(UserRole.ADMIN), validateRequest(aiLogQuerySchema), aiController.getAiLogs);

export const AiRoutes = router;

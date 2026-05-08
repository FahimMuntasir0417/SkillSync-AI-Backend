import { AiFeatureType, AiRequestStatus } from "@prisma/client";
import { z } from "zod";

const userLevelEnum = z.enum(["beginner", "intermediate", "advanced"]);

export const courseSummarySchema = { body: z.object({ courseId: z.uuid() }) };

export const chatSchema = {
  body: z.object({
    message: z.string().trim().min(2),
    courseId: z.uuid().optional(),
    lessonId: z.uuid().optional(),
  }),
};

export const recommendationsSchema = {
  body: z.object({ interest: z.string().trim().min(2).optional() }).optional(),
};

export const assignmentFeedbackSchema = {
  body: z
    .object({
      submissionId: z.uuid().optional(),
      githubUrl: z.url().optional(),
      liveUrl: z.url().optional(),
      notes: z.string().trim().min(5).optional(),
    })
    .refine((data) => Boolean(data.submissionId || data.githubUrl || data.liveUrl || data.notes), {
      message: "submissionId or submission details are required",
    }),
};

export const blogGeneratorSchema = {
  body: z.object({
    topic: z.string().trim().min(3),
    tone: z.string().trim().min(2).optional(),
    targetAudience: z.string().trim().min(2).optional(),
  }),
};

export const generateRoadmapValidation = {
  body: z.object({
    goal: z.string().trim().min(3, "Goal must be at least 3 characters"),
    level: userLevelEnum,
    weeklyHours: z.number().min(1).max(80),
  }),
};

export const analyzeSkillGapValidation = {
  body: z.object({
    targetRole: z.string().trim().min(2, "Target role is required"),
    currentSkills: z.array(z.string().trim().min(1)).min(1),
  }),
};

export const recommendProjectsValidation = {
  body: z.object({
    role: z.string().trim().min(2, "Role is required"),
    level: userLevelEnum,
    skills: z.array(z.string().trim().min(1)).min(1),
  }),
};

export const careerChatValidation = {
  body: z.object({
    message: z.string().trim().min(2, "Message is required"),
    context: z
      .object({
        goal: z.string().optional(),
        level: userLevelEnum.optional(),
        currentSkills: z.array(z.string()).optional(),
      })
      .optional(),
  }),
};

export const roadmapGeneratorSchema = generateRoadmapValidation;
export const skillGapAnalyzerSchema = analyzeSkillGapValidation;
export const projectRecommenderSchema = recommendProjectsValidation;
export const careerChatSchema = careerChatValidation;
export const chatValidation = careerChatValidation;

export const aiLogQuerySchema = {
  query: z.object({
    feature: z.enum(AiFeatureType).optional(),
    status: z.enum(AiRequestStatus).optional(),
    userId: z.uuid().optional(),
    page: z.string().optional(),
    limit: z.string().optional(),
    sortBy: z.string().optional(),
    sortOrder: z.enum(["asc", "desc"]).optional(),
  }),
};

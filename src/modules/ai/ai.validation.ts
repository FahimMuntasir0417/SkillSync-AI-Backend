import { AiFeatureType, AiRequestStatus } from "@prisma/client";
import { z } from "zod";

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

export const roadmapGeneratorSchema = {
  body: z.object({
    goal: z.string().trim().min(3),
    currentLevel: z.string().trim().min(2).optional(),
    timeframe: z.string().trim().min(2).optional(),
    hoursPerWeek: z.number().int().positive().optional(),
    preferredTopics: z.array(z.string().trim().min(1)).optional(),
  }),
};

export const skillGapAnalyzerSchema = {
  body: z.object({
    currentSkills: z.array(z.string().trim().min(1)).min(1),
    targetRole: z.string().trim().min(2),
    experienceLevel: z.string().trim().min(2).optional(),
  }),
};

export const projectRecommenderSchema = {
  body: z.object({
    level: z.string().trim().min(2),
    skills: z.array(z.string().trim().min(1)).optional(),
    interests: z.array(z.string().trim().min(1)).optional(),
    targetRole: z.string().trim().min(2).optional(),
  }),
};

export const careerChatSchema = {
  body: z.object({
    message: z.string().trim().min(2),
    currentSkills: z.array(z.string().trim().min(1)).optional(),
    targetRole: z.string().trim().min(2).optional(),
  }),
};

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

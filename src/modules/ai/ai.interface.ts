import type { AiFeatureType, AiRequestStatus } from "@prisma/client";

export type CourseSummaryInput = { courseId: string };
export type ChatInput = { message: string; courseId?: string; lessonId?: string };
export type RecommendationInput = { interest?: string };
export type AssignmentFeedbackInput = {
  submissionId?: string;
  githubUrl?: string;
  liveUrl?: string;
  notes?: string;
};
export type BlogGeneratorInput = {
  topic: string;
  tone?: string;
  targetAudience?: string;
};
export type RoadmapGeneratorInput = {
  goal: string;
  currentLevel?: string;
  timeframe?: string;
  hoursPerWeek?: number;
  preferredTopics?: string[];
};
export type SkillGapAnalyzerInput = {
  currentSkills: string[];
  targetRole: string;
  experienceLevel?: string;
};
export type ProjectRecommenderInput = {
  level: string;
  skills?: string[];
  interests?: string[];
  targetRole?: string;
};
export type CareerChatInput = {
  message: string;
  currentSkills?: string[];
  targetRole?: string;
};
export type AiLogQuery = {
  feature?: unknown;
  status?: unknown;
  userId?: unknown;
  page?: unknown;
  limit?: unknown;
  sortBy?: unknown;
  sortOrder?: unknown;
};

export type LogAiRequestInput = {
  userId?: string;
  feature: AiFeatureType;
  prompt: string;
  response?: unknown;
  status: AiRequestStatus;
  error?: string;
};

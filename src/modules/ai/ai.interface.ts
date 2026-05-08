import type { AiFeatureType, AiRequestStatus } from "@prisma/client";

export type UserLevel = "beginner" | "intermediate" | "advanced";

export interface RoadmapRequest {
  goal: string;
  level: UserLevel;
  weeklyHours: number;
}

export interface RoadmapPhase {
  phaseTitle: string;
  weekRange: string;
  topics: string[];
  tasks: string[];
  resources: string[];
  outcome: string;
}

export interface RoadmapResponse {
  title: string;
  durationWeeks: number;
  summary: string;
  phases: RoadmapPhase[];
}

export interface SkillGapRequest {
  targetRole: string;
  currentSkills: string[];
}

export interface PrioritySkill {
  skill: string;
  priority: "high" | "medium" | "low";
  reason: string;
}

export interface SkillGapResponse {
  targetRole: string;
  strengths: string[];
  missingSkills: string[];
  prioritySkills: PrioritySkill[];
  nextSteps: string[];
}

export interface ProjectRecommendationRequest {
  role: string;
  level: UserLevel;
  skills: string[];
}

export interface ProjectRecommendationItem {
  title: string;
  difficulty: "easy" | "medium" | "hard";
  description: string;
  features: string[];
  techStack: string[];
  aiFeatureIdea: string;
  portfolioValue: string;
}

export interface ProjectRecommendationResponse {
  recommendations: ProjectRecommendationItem[];
}

export interface ChatRequest {
  message: string;
  context?: {
    goal?: string;
    level?: UserLevel;
    currentSkills?: string[];
  };
}

export interface ChatResponse {
  answer: string;
  actionItems: string[];
  suggestedResources: string[];
  followUpQuestions: string[];
}

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
export type RoadmapGeneratorInput = RoadmapRequest;
export type SkillGapAnalyzerInput = SkillGapRequest;
export type ProjectRecommenderInput = ProjectRecommendationRequest;
export type CareerChatInput = ChatRequest;
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

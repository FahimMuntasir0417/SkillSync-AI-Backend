import OpenAI from "openai";
import httpStatus from "http-status";

import { AppError } from "../../common/errors/AppError.js";
import { env } from "../../config/env.js";
import { parseAiJsonResponse } from "../../utils/parseAiJsonResponse.js";
import type {
  ChatRequest,
  ChatResponse,
  ProjectRecommendationRequest,
  ProjectRecommendationResponse,
  RoadmapRequest,
  RoadmapResponse,
  SkillGapRequest,
  SkillGapResponse,
} from "./ai.interface.js";

const OPENAI_MODEL = "gpt-4.1-mini";

const getOpenAiClient = () => {
  if (!env.openAiApiKey) {
    throw new AppError(httpStatus.SERVICE_UNAVAILABLE, "OPENAI_API_KEY is missing in environment variables");
  }

  return new OpenAI({ apiKey: env.openAiApiKey });
};

const projectRecommendationSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    recommendations: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          title: { type: "string" },
          difficulty: { type: "string", enum: ["easy", "medium", "hard"] },
          description: { type: "string" },
          features: { type: "array", items: { type: "string" } },
          techStack: { type: "array", items: { type: "string" } },
          aiFeatureIdea: { type: "string" },
          portfolioValue: { type: "string" },
        },
        required: [
          "title",
          "difficulty",
          "description",
          "features",
          "techStack",
          "aiFeatureIdea",
          "portfolioValue",
        ],
      },
    },
  },
  required: ["recommendations"],
};

const roadmapSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    title: { type: "string" },
    durationWeeks: { type: "number" },
    summary: { type: "string" },
    phases: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          phaseTitle: { type: "string" },
          weekRange: { type: "string" },
          topics: { type: "array", items: { type: "string" } },
          tasks: { type: "array", items: { type: "string" } },
          resources: { type: "array", items: { type: "string" } },
          outcome: { type: "string" },
        },
        required: [
          "phaseTitle",
          "weekRange",
          "topics",
          "tasks",
          "resources",
          "outcome",
        ],
      },
    },
  },
  required: ["title", "durationWeeks", "summary", "phases"],
};

const skillGapSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    targetRole: { type: "string" },
    strengths: { type: "array", items: { type: "string" } },
    missingSkills: { type: "array", items: { type: "string" } },
    prioritySkills: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          skill: { type: "string" },
          priority: { type: "string", enum: ["high", "medium", "low"] },
          reason: { type: "string" },
        },
        required: ["skill", "priority", "reason"],
      },
    },
    nextSteps: { type: "array", items: { type: "string" } },
  },
  required: [
    "targetRole",
    "strengths",
    "missingSkills",
    "prioritySkills",
    "nextSteps",
  ],
};

const chatSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    answer: { type: "string" },
    actionItems: { type: "array", items: { type: "string" } },
    suggestedResources: { type: "array", items: { type: "string" } },
    followUpQuestions: { type: "array", items: { type: "string" } },
  },
  required: ["answer", "actionItems", "suggestedResources", "followUpQuestions"],
};

const generateJsonWithOpenAI = async <T>(
  prompt: string,
  schemaName: string,
  schema: Record<string, unknown>,
): Promise<T> => {
  try {
    const response = await getOpenAiClient().responses.create({
      model: OPENAI_MODEL,
      input: [
        {
          role: "system",
          content:
            "You are SkillSync AI Assistant. Help with roadmaps, skill planning, projects, interview prep, and learning strategy. Be practical and beginner-friendly. Return structured JSON only.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      text: {
        format: {
          type: "json_schema",
          name: schemaName,
          schema,
          strict: true,
        },
      },
    });

    return parseAiJsonResponse<T>(response.output_text);
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError(httpStatus.BAD_GATEWAY, "OpenAI AI request failed");
  }
};

export const generateRoadmapWithOpenAI = (
  payload: RoadmapRequest,
): Promise<RoadmapResponse> => {
  const prompt = [
    "Act as a senior software engineering mentor.",
    "Create a practical, beginner-friendly learning roadmap.",
    "Use clear weekly phases, concrete tasks, realistic resources, and measurable outcomes.",
    `Learner input: ${JSON.stringify(payload)}`,
  ].join("\n");

  return generateJsonWithOpenAI<RoadmapResponse>(
    prompt,
    "learning_roadmap",
    roadmapSchema,
  );
};

export const analyzeSkillGapWithOpenAI = (
  payload: SkillGapRequest,
): Promise<SkillGapResponse> => {
  const prompt = [
    "Act as a senior software engineering mentor.",
    "Compare the learner's current skills against the target role.",
    "Keep the analysis practical, prioritized, and beginner-friendly.",
    `Learner input: ${JSON.stringify(payload)}`,
  ].join("\n");

  return generateJsonWithOpenAI<SkillGapResponse>(
    prompt,
    "skill_gap_analysis",
    skillGapSchema,
  );
};

export const recommendProjectsWithOpenAI = (
  payload: ProjectRecommendationRequest,
): Promise<ProjectRecommendationResponse> => {
  const prompt = [
    "Recommend portfolio projects for this learner.",
    "Projects should match the role, level, and skills.",
    "Include useful AI feature ideas and explain portfolio value.",
    `Learner input: ${JSON.stringify(payload)}`,
  ].join("\n");

  return generateJsonWithOpenAI<ProjectRecommendationResponse>(
    prompt,
    "project_recommendations",
    projectRecommendationSchema,
  );
};

export const chatWithOpenAI = (payload: ChatRequest): Promise<ChatResponse> => {
  const prompt = [
    "Answer as the SkillSync AI learning and career assistant.",
    "Help with learning strategy, project planning, interview prep, and career direction.",
    `User input: ${JSON.stringify(payload)}`,
  ].join("\n");

  return generateJsonWithOpenAI<ChatResponse>(prompt, "career_chat_response", chatSchema);
};

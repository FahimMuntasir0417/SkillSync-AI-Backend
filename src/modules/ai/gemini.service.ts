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

export const GEMINI_MODEL = "gemini-2.5-flash";

const sanitizeGeminiError = (message: string) =>
  message.replace(/key=[^&\s]+/g, "key=***");

export const generateJsonWithGemini = async <T>(
  prompt: string,
  responseShape: string,
): Promise<T> => {
  if (!env.geminiApiKey) {
    throw new AppError(
      httpStatus.SERVICE_UNAVAILABLE,
      "GEMINI_API_KEY is missing in environment variables",
    );
  }

  const systemPrompt = [
    "You are SkillSync AI Assistant.",
    "Help with roadmaps, skill planning, projects, interview prep, and learning strategy.",
    "Be practical and beginner-friendly.",
    `Return only valid JSON matching this TypeScript shape: ${responseShape}. Do not include markdown.`,
  ].join(" ");

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${env.geminiApiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `${systemPrompt}\n\n${prompt}` }] }],
          generationConfig: {
            temperature: 0.3,
            responseMimeType: "application/json",
          },
        }),
      },
    );

    const data = (await response.json()) as {
      candidates?: { content?: { parts?: { text?: string }[] } }[];
      error?: { message?: string };
    };

    if (!response.ok) {
      throw new Error(data.error?.message ?? "Gemini request failed");
    }

    return parseAiJsonResponse<T>(
      data.candidates?.[0]?.content?.parts?.[0]?.text ?? "",
    );
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    const message =
      error instanceof Error
        ? sanitizeGeminiError(error.message)
        : "Gemini AI request failed";

    throw new AppError(httpStatus.BAD_GATEWAY, message);
  }
};

export const generateRoadmapWithGemini = (
  payload: RoadmapRequest,
): Promise<RoadmapResponse> => {
  const prompt = [
    "Act as a senior software engineering mentor.",
    "Create a practical, beginner-friendly learning roadmap.",
    "Use clear weekly phases, concrete tasks, realistic resources, and measurable outcomes.",
    `Learner input: ${JSON.stringify(payload)}`,
  ].join("\n");

  return generateJsonWithGemini<RoadmapResponse>(
    prompt,
    "{ title: string; durationWeeks: number; summary: string; phases: { phaseTitle: string; weekRange: string; topics: string[]; tasks: string[]; resources: string[]; outcome: string }[] }",
  );
};

export const analyzeSkillGapWithGemini = (
  payload: SkillGapRequest,
): Promise<SkillGapResponse> => {
  const prompt = [
    "Act as a senior software engineering mentor.",
    "Compare the learner's current skills against the target role.",
    "Keep the analysis practical, prioritized, and beginner-friendly.",
    `Learner input: ${JSON.stringify(payload)}`,
  ].join("\n");

  return generateJsonWithGemini<SkillGapResponse>(
    prompt,
    "{ targetRole: string; strengths: string[]; missingSkills: string[]; prioritySkills: { skill: string; priority: 'high' | 'medium' | 'low'; reason: string }[]; nextSteps: string[] }",
  );
};

export const recommendProjectsWithGemini = (
  payload: ProjectRecommendationRequest,
): Promise<ProjectRecommendationResponse> => {
  const prompt = [
    "Recommend portfolio projects for this learner.",
    "Projects should match the role, level, and skills.",
    "Include useful AI feature ideas and explain portfolio value.",
    `Learner input: ${JSON.stringify(payload)}`,
  ].join("\n");

  return generateJsonWithGemini<ProjectRecommendationResponse>(
    prompt,
    "{ recommendations: { title: string; difficulty: 'easy' | 'medium' | 'hard'; description: string; features: string[]; techStack: string[]; aiFeatureIdea: string; portfolioValue: string }[] }",
  );
};

export const chatWithGemini = (payload: ChatRequest): Promise<ChatResponse> => {
  const prompt = [
    "Answer as the SkillSync AI learning and career assistant.",
    "Help with learning strategy, project planning, interview prep, and career direction.",
    `User input: ${JSON.stringify(payload)}`,
  ].join("\n");

  return generateJsonWithGemini<ChatResponse>(
    prompt,
    "{ answer: string; actionItems: string[]; suggestedResources: string[]; followUpQuestions: string[] }",
  );
};

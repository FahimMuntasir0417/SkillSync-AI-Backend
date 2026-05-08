import { GoogleGenAI, Type } from "@google/genai";
import httpStatus from "http-status";

import { AppError } from "../../common/errors/AppError.js";
import { env } from "../../config/env.js";
import { parseAiJsonResponse } from "../../utils/parseAiJsonResponse.js";
import type {
  RoadmapRequest,
  RoadmapResponse,
  SkillGapRequest,
  SkillGapResponse,
} from "./ai.interface.js";

const getGeminiClient = () => {
  if (!env.geminiApiKey) {
    throw new AppError(httpStatus.SERVICE_UNAVAILABLE, "GEMINI_API_KEY is missing in environment variables");
  }

  return new GoogleGenAI({ apiKey: env.geminiApiKey });
};

const roadmapResponseSchema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    durationWeeks: { type: Type.NUMBER },
    summary: { type: Type.STRING },
    phases: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          phaseTitle: { type: Type.STRING },
          weekRange: { type: Type.STRING },
          topics: { type: Type.ARRAY, items: { type: Type.STRING } },
          tasks: { type: Type.ARRAY, items: { type: Type.STRING } },
          resources: { type: Type.ARRAY, items: { type: Type.STRING } },
          outcome: { type: Type.STRING },
        },
        required: ["phaseTitle", "weekRange", "topics", "tasks", "resources", "outcome"],
      },
    },
  },
  required: ["title", "durationWeeks", "summary", "phases"],
};

const skillGapResponseSchema = {
  type: Type.OBJECT,
  properties: {
    targetRole: { type: Type.STRING },
    strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
    missingSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
    prioritySkills: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          skill: { type: Type.STRING },
          priority: { type: Type.STRING, enum: ["high", "medium", "low"] },
          reason: { type: Type.STRING },
        },
        required: ["skill", "priority", "reason"],
      },
    },
    nextSteps: { type: Type.ARRAY, items: { type: Type.STRING } },
  },
  required: ["targetRole", "strengths", "missingSkills", "prioritySkills", "nextSteps"],
};

const generateJsonWithGemini = async <T>(
  prompt: string,
  responseSchema: Record<string, unknown>,
): Promise<T> => {
  try {
    const response = await getGeminiClient().models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema,
      },
    });

    return parseAiJsonResponse<T>(response.text ?? "");
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError(httpStatus.BAD_GATEWAY, "Gemini AI request failed");
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

  return generateJsonWithGemini<RoadmapResponse>(prompt, roadmapResponseSchema);
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

  return generateJsonWithGemini<SkillGapResponse>(prompt, skillGapResponseSchema);
};

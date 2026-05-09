import { AiFeatureType, AiRequestStatus, Prisma } from "@prisma/client";
import httpStatus from "http-status";

import { AppError } from "../../common/errors/AppError.js";
import { calculatePagination } from "../../common/utils/pagination.js";
import { env } from "../../config/env.js";
import { prisma } from "../../config/prisma.js";
import { aiLogSortableFields } from "./ai.constant.js";
import type {
  AiLogQuery,
  AssignmentFeedbackInput,
  BlogGeneratorInput,
  CareerChatInput,
  ChatResponse,
  ChatInput,
  CourseSummaryInput,
  LogAiRequestInput,
  ProjectRecommendationResponse,
  ProjectRecommenderInput,
  RecommendationInput,
  RoadmapResponse,
  RoadmapGeneratorInput,
  SkillGapResponse,
  SkillGapAnalyzerInput,
} from "./ai.interface.js";
import {
  analyzeSkillGapWithGemini,
  generateRoadmapWithGemini,
} from "./gemini.service.js";
import {
  chatWithOpenAI,
  recommendProjectsWithOpenAI,
} from "./openai.service.js";

const aiLogSelect = {
  id: true,
  userId: true,
  feature: true,
  prompt: true,
  response: true,
  status: true,
  error: true,
  createdAt: true,
  user: { select: { id: true, name: true, email: true, role: true } },
} satisfies Prisma.AiRequestLogSelect;

const logAiRequest = (payload: LogAiRequestInput) =>
  prisma.aiRequestLog.create({
    data: {
      userId: payload.userId,
      feature: payload.feature,
      prompt: payload.prompt,
      response:
        payload.response === undefined
          ? undefined
          : (payload.response as Prisma.InputJsonValue),
      status: payload.status,
      error: payload.error,
    },
  });

const extractJson = (text: string) => {
  const trimmed = text
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/i, "");
  return JSON.parse(trimmed) as unknown;
};

const assertAiProviderConfigured = () => {
  if (!env.OPENAI_API_KEY && !env.GEMINI_API_KEY) {
    throw new AppError(
      httpStatus.SERVICE_UNAVAILABLE,
      "AI provider is not configured",
    );
  }
};

const callAiProvider = async (prompt: string, responseShape: string) => {
  assertAiProviderConfigured();
  const systemPrompt = `Return only valid JSON matching this TypeScript shape: ${responseShape}. Do not include markdown.`;

  if (env.OPENAI_API_KEY) {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt },
        ],
        temperature: 0.3,
      }),
    });
    const data = (await response.json()) as {
      choices?: { message?: { content?: string } }[];
      error?: { message?: string };
    };
    if (!response.ok)
      throw new Error(data.error?.message ?? "OpenAI request failed");
    return extractJson(data.choices?.[0]?.message?.content ?? "");
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${env.GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `${systemPrompt}\n\n${prompt}` }] }],
        generationConfig: { temperature: 0.3 },
      }),
    },
  );
  const data = (await response.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
    error?: { message?: string };
  };
  if (!response.ok)
    throw new Error(data.error?.message ?? "Gemini request failed");
  return extractJson(data.candidates?.[0]?.content?.parts?.[0]?.text ?? "");
};

const runAiTask = async <T>(
  userId: string,
  feature: AiFeatureType,
  prompt: string,
  shape: string,
) => {
  try {
    const response = await callAiProvider(prompt, shape);
    await logAiRequest({
      userId,
      feature,
      prompt,
      response,
      status: AiRequestStatus.SUCCESS,
    });
    return response as T;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "AI request failed";
    await logAiRequest({
      userId,
      feature,
      prompt,
      status: AiRequestStatus.FAILED,
      error: message,
    });
    if (error instanceof AppError) throw error;
    throw new AppError(httpStatus.BAD_GATEWAY, message);
  }
};

const runProviderTask = async <T>(
  userId: string,
  feature: AiFeatureType,
  prompt: string,
  task: () => Promise<T>,
) => {
  try {
    const response = await task();
    await logAiRequest({
      userId,
      feature,
      prompt,
      response,
      status: AiRequestStatus.SUCCESS,
    });
    return response;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "AI request failed";
    await logAiRequest({
      userId,
      feature,
      prompt,
      status: AiRequestStatus.FAILED,
      error: message,
    });
    throw error;
  }
};

const generateCourseSummary = async (
  payload: CourseSummaryInput,
  userId: string,
) => {
  const course = await prisma.course.findUnique({
    where: { id: payload.courseId },
    select: {
      title: true,
      shortDescription: true,
      description: true,
      level: true,
      modules: {
        select: {
          title: true,
          lessons: { select: { title: true, content: true } },
        },
        orderBy: { order: "asc" },
      },
    },
  });
  if (!course) throw new AppError(httpStatus.NOT_FOUND, "Course not found");
  return runAiTask(
    userId,
    AiFeatureType.COURSE_SUMMARY,
    `Summarize this course context: ${JSON.stringify(course)}`,
    "{ summary: string; difficulty: string; outcomes: string[]; recommendedFor: string[] }",
  );
};

const chat = async (payload: ChatInput, userId: string) => {
  const [course, lesson] = await Promise.all([
    payload.courseId
      ? prisma.course.findUnique({
          where: { id: payload.courseId },
          select: { title: true, description: true },
        })
      : null,
    payload.lessonId
      ? prisma.lesson.findUnique({
          where: { id: payload.lessonId },
          select: { title: true, content: true },
        })
      : null,
  ]);
  return runAiTask(
    userId,
    AiFeatureType.STUDY_ASSISTANT,
    `Question: ${payload.message}\nCourse context: ${JSON.stringify(course)}\nLesson context: ${JSON.stringify(lesson)}`,
    "{ answer: string; suggestedQuestions: string[] }",
  );
};

const recommendations = async (
  payload: RecommendationInput,
  userId: string,
) => {
  const [enrollments, completedLessons, courses] = await Promise.all([
    prisma.enrollment.findMany({
      where: { userId },
      select: {
        course: {
          select: { title: true, category: { select: { name: true } } },
        },
      },
    }),
    prisma.lessonProgress.count({ where: { userId, completed: true } }),
    prisma.course.findMany({
      where: { status: "PUBLISHED" },
      select: {
        id: true,
        title: true,
        shortDescription: true,
        category: { select: { name: true } },
      },
      take: 20,
    }),
  ]);
  return runAiTask(
    userId,
    AiFeatureType.RECOMMENDATION,
    `Interest: ${payload.interest ?? ""}\nEnrollments: ${JSON.stringify(enrollments)}\nCompleted lessons: ${completedLessons}\nAvailable courses: ${JSON.stringify(courses)}`,
    "{ recommendations: { courseId: string; title: string; reason: string }[] }",
  );
};

const assignmentFeedback = async (
  payload: AssignmentFeedbackInput,
  userId: string,
) => {
  const submission = payload.submissionId
    ? await prisma.submission.findUnique({
        where: { id: payload.submissionId },
        select: {
          githubUrl: true,
          liveUrl: true,
          notes: true,
          assignment: { select: { title: true, description: true } },
        },
      })
    : null;
  if (payload.submissionId && !submission)
    throw new AppError(httpStatus.NOT_FOUND, "Submission not found");
  return runAiTask(
    userId,
    AiFeatureType.ASSIGNMENT_FEEDBACK,
    `Review assignment submission: ${JSON.stringify(submission ?? payload)}`,
    "{ scoreEstimate: number; strengths: string[]; improvements: string[]; finalComment: string }",
  );
};

const blogGenerator = async (payload: BlogGeneratorInput, userId: string) =>
  runAiTask(
    userId,
    AiFeatureType.BLOG_GENERATOR,
    `Generate a blog. Topic: ${payload.topic}. Tone: ${payload.tone ?? "professional"}. Audience: ${payload.targetAudience ?? "learners"}.`,
    "{ title: string; excerpt: string; content: string; tags: string[]; seoDescription: string }",
  );

const roadmapGenerator = async (
  payload: RoadmapGeneratorInput,
  userId: string,
) =>
  runProviderTask<RoadmapResponse>(
    userId,
    AiFeatureType.ROADMAP_GENERATOR,
    `Gemini roadmap generator: ${JSON.stringify(payload)}`,
    () => generateRoadmapWithGemini(payload),
  );

const skillGapAnalyzer = async (
  payload: SkillGapAnalyzerInput,
  userId: string,
) =>
  runProviderTask<SkillGapResponse>(
    userId,
    AiFeatureType.SKILL_GAP_ANALYZER,
    `Gemini skill gap analyzer: ${JSON.stringify(payload)}`,
    () => analyzeSkillGapWithGemini(payload),
  );

const projectRecommender = async (
  payload: ProjectRecommenderInput,
  userId: string,
) =>
  runProviderTask<ProjectRecommendationResponse>(
    userId,
    AiFeatureType.PROJECT_RECOMMENDER,
    `OpenAI project recommender: ${JSON.stringify(payload)}`,
    () => recommendProjectsWithOpenAI(payload),
  );

const careerChat = async (payload: CareerChatInput, userId: string) =>
  runProviderTask<ChatResponse>(
    userId,
    AiFeatureType.CAREER_CHAT_ASSISTANT,
    `OpenAI career chat assistant: ${JSON.stringify(payload)}`,
    () => chatWithOpenAI(payload),
  );

const getAiLogs = async (query: AiLogQuery) => {
  const { page, limit, skip, sortBy, sortOrder } = calculatePagination(query);
  const safeSortBy = aiLogSortableFields.includes(
    sortBy as (typeof aiLogSortableFields)[number],
  )
    ? sortBy
    : "createdAt";
  const where: Prisma.AiRequestLogWhereInput = {
    ...(typeof query.feature === "string"
      ? { feature: query.feature as AiFeatureType }
      : {}),
    ...(typeof query.status === "string"
      ? { status: query.status as AiRequestStatus }
      : {}),
    ...(typeof query.userId === "string" ? { userId: query.userId } : {}),
  };
  const [total, logs] = await Promise.all([
    prisma.aiRequestLog.count({ where }),
    prisma.aiRequestLog.findMany({
      where,
      select: aiLogSelect,
      skip,
      take: limit,
      orderBy: { [safeSortBy]: sortOrder },
    }),
  ]);
  return {
    meta: { page, limit, total, totalPage: Math.ceil(total / limit) },
    data: logs,
  };
};

export const aiService = {
  generateCourseSummary,
  chat,
  recommendations,
  assignmentFeedback,
  blogGenerator,
  roadmapGenerator,
  skillGapAnalyzer,
  projectRecommender,
  careerChat,
  getAiLogs,
};

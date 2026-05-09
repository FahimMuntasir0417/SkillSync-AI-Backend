import httpStatus from "http-status";

import { catchAsync } from "../../common/utils/catchAsync.js";
import { sendResponse } from "../../common/utils/sendResponse.js";
import { aiService } from "./ai.service.js";
import {
  analyzeSkillGapWithOpenAI,
  chatWithOpenAI,
  generateRoadmapWithOpenAI,
  recommendProjectsWithOpenAI,
} from "./openai.service.js";

const courseSummary = catchAsync(async (req, res) => {
  const data = await aiService.generateCourseSummary(req.body, req.user.userId);
  sendResponse(res, { statusCode: httpStatus.OK, message: "Course summary generated successfully", data });
});
const chat = catchAsync(async (req, res) => {
  const data = await aiService.chat(req.body, req.user.userId);
  sendResponse(res, { statusCode: httpStatus.OK, message: "AI answer generated successfully", data });
});
const recommendations = catchAsync(async (req, res) => {
  const data = await aiService.recommendations(req.body ?? {}, req.user.userId);
  sendResponse(res, { statusCode: httpStatus.OK, message: "AI recommendations generated successfully", data });
});
const assignmentFeedback = catchAsync(async (req, res) => {
  const data = await aiService.assignmentFeedback(req.body, req.user.userId);
  sendResponse(res, { statusCode: httpStatus.OK, message: "AI assignment feedback generated successfully", data });
});
const blogGenerator = catchAsync(async (req, res) => {
  const data = await aiService.blogGenerator(req.body, req.user.userId);
  sendResponse(res, { statusCode: httpStatus.OK, message: "AI blog generated successfully", data });
});
const roadmapGenerator = catchAsync(async (req, res) => {
  const data = await aiService.roadmapGenerator(req.body, req.user.userId);
  sendResponse(res, { statusCode: httpStatus.OK, message: "AI roadmap generated successfully", data });
});
const skillGapAnalyzer = catchAsync(async (req, res) => {
  const data = await aiService.skillGapAnalyzer(req.body, req.user.userId);
  sendResponse(res, { statusCode: httpStatus.OK, message: "AI skill gap analysis generated successfully", data });
});
const projectRecommender = catchAsync(async (req, res) => {
  const data = await aiService.projectRecommender(req.body, req.user.userId);
  sendResponse(res, { statusCode: httpStatus.OK, message: "AI project recommendations generated successfully", data });
});
const careerChat = catchAsync(async (req, res) => {
  const data = await aiService.careerChat(req.body, req.user.userId);
  sendResponse(res, { statusCode: httpStatus.OK, message: "AI career answer generated successfully", data });
});
const getAiLogs = catchAsync(async (req, res) => {
  const result = await aiService.getAiLogs(req.query);
  sendResponse(res, { statusCode: httpStatus.OK, message: "AI logs retrieved successfully", meta: result.meta, data: result.data });
});

const generateRoadmapController = catchAsync(async (req, res) => {
  const result = await generateRoadmapWithOpenAI(req.body);

  res.status(httpStatus.OK).json({
    success: true,
    message: "AI roadmap generated successfully",
    provider: "openai",
    model: "gpt-4.1-mini",
    feature: "AI Roadmap Generator",
    data: result,
  });
});

const analyzeSkillGapController = catchAsync(async (req, res) => {
  const result = await analyzeSkillGapWithOpenAI(req.body);

  res.status(httpStatus.OK).json({
    success: true,
    message: "Skill gap analyzed successfully",
    provider: "openai",
    model: "gpt-4.1-mini",
    feature: "AI Skill Gap Analyzer",
    data: result,
  });
});

const recommendProjectsController = catchAsync(async (req, res) => {
  const result = await recommendProjectsWithOpenAI(req.body);

  res.status(httpStatus.OK).json({
    success: true,
    message: "Project recommendations generated successfully",
    provider: "openai",
    model: "gpt-4.1-mini",
    feature: "AI Project Recommender",
    data: result,
  });
});

const chatController = catchAsync(async (req, res) => {
  const result = await chatWithOpenAI(req.body);

  res.status(httpStatus.OK).json({
    success: true,
    message: "AI chat response generated successfully",
    provider: "openai",
    model: "gpt-4.1-mini",
    feature: "AI Chat Assistant",
    data: result,
  });
});

export const aiController = {
  courseSummary,
  chat,
  recommendations,
  assignmentFeedback,
  blogGenerator,
  roadmapGenerator,
  skillGapAnalyzer,
  projectRecommender,
  careerChat,
  getAiLogs,
  generateRoadmapController,
  analyzeSkillGapController,
  recommendProjectsController,
  chatController,
};

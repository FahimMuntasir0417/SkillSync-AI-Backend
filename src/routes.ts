import { Router } from "express";

export const routes = Router();

routes.get("/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "SkillSync AI API is running",
  });
});

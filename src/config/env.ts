import "dotenv/config";

type NodeEnv = "development" | "production" | "test";

const getRequiredEnv = (key: string): string => {
  const value = process.env[key];

  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value;
};

const parsePort = (value: string): number => {
  const port = Number(value);

  if (!Number.isInteger(port) || port <= 0) {
    throw new Error("PORT must be a positive integer");
  }

  return port;
};

const parseNodeEnv = (value: string | undefined): NodeEnv => {
  if (value === "production" || value === "test" || value === "development") {
    return value;
  }

  return "development";
};

export const env = {
  NODE_ENV: parseNodeEnv(process.env.NODE_ENV),
  PORT: parsePort(process.env.PORT ?? "5000"),
  DATABASE_URL: getRequiredEnv("DATABASE_URL"),
  CLIENT_URL: process.env.CLIENT_URL ?? "http://localhost:3000",
  JWT_ACCESS_SECRET: getRequiredEnv("JWT_ACCESS_SECRET"),
  JWT_REFRESH_SECRET: getRequiredEnv("JWT_REFRESH_SECRET"),
  JWT_ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN ?? "15m",
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN ?? "7d",
  BETTER_AUTH_SECRET: getRequiredEnv("BETTER_AUTH_SECRET"),
  BETTER_AUTH_URL: process.env.BETTER_AUTH_URL ?? "http://localhost:5000",
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ?? "",
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ?? "",
  SMTP_HOST: process.env.SMTP_HOST ?? "",
  SMTP_PORT: process.env.SMTP_PORT ?? "587",
  SMTP_USER: process.env.SMTP_USER ?? "",
  SMTP_PASS: process.env.SMTP_PASS ?? "",
  SMTP_FROM: process.env.SMTP_FROM ?? "SkillSync AI <no-reply@skillsync.ai>",
  OPENAI_API_KEY: process.env.OPENAI_API_KEY ?? "",
  GEMINI_API_KEY: process.env.GEMINI_API_KEY ?? "",
  openAiApiKey: process.env.OPENAI_API_KEY ?? "",
  geminiApiKey: process.env.GEMINI_API_KEY ?? "",
} as const;

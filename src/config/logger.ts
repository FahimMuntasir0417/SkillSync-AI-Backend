import pino from "pino";

import { env } from "./env.js";

const shouldUsePrettyLogger =
  env.NODE_ENV === "development" && process.env.VERCEL !== "1";

export const logger = pino({
  level: env.NODE_ENV === "production" ? "info" : "debug",
  redact: {
    paths: [
      "req.headers.authorization",
      "req.headers.cookie",
      "req.headers['set-cookie']",
      "res.headers['set-cookie']",
    ],
    censor: "[REDACTED]",
  },
  transport:
    shouldUsePrettyLogger
      ? {
          target: "pino-pretty",
          options: {
            colorize: true,
            translateTime: "SYS:standard",
          },
        }
      : undefined,
});

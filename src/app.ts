import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import { toNodeHandler } from "better-auth/node";
import { pinoHttp } from "pino-http";

import { globalErrorHandler } from "./common/middlewares/globalErrorHandler.js";
import { notFound } from "./common/middlewares/notFound.js";
import { generalRateLimiter } from "./common/middlewares/rateLimiter.js";
import { auth } from "./config/better-auth.js";
import { env } from "./config/env.js";
import { logger } from "./config/logger.js";
import { routes } from "./routes.js";

export const app = express();

app.use(
  pinoHttp({
    logger,
  }),
);

app.use(helmet());
app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true,
  }),
);
app.all("/api/auth/*", toNodeHandler(auth));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use("/uploads", express.static("uploads"));
app.use(generalRateLimiter);

app.use(routes);
app.use(notFound);
app.use(globalErrorHandler);

import { env } from "@/config/env.js";

export const betterAuthConfig = {
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,
} as const;

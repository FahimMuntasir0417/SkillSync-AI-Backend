import { UserRole, UserStatus } from "@prisma/client";

import { env } from "./env.js";

/**
 * Better Auth-ready architecture.
 *
 * Current production strategy:
 * - JWT is the primary and active API authentication system.
 * - Existing API guards read `Authorization: Bearer <accessToken>`.
 * - Refresh token handling remains owned by the custom JWT auth module.
 *
 * Future OAuth/social-login strategy:
 * - Better Auth can be enabled here when the Prisma User model and Better Auth
 *   adapter mapping are fully verified for this schema.
 * - Do not create a second User table or parallel user identity system.
 * - Social accounts should link to the existing `users` table.
 * - Better Auth routes are intentionally not mounted in `app.ts` yet.
 */

export const betterAuthReadyConfig = {
  /**
   * Future Better Auth secret.
   *
   * .env:
   * BETTER_AUTH_SECRET="replace-with-better-auth-secret"
   */
  secret: env.BETTER_AUTH_SECRET,

  /**
   * Future Better Auth base URL.
   *
   * Local:
   * BETTER_AUTH_URL="http://localhost:5000"
   *
   * Production:
   * BETTER_AUTH_URL="https://your-backend-domain.com"
   */
  baseURL: env.BETTER_AUTH_URL,

  /**
   * Safe placeholder for Prisma adapter.
   *
   * Enable later only after confirming Better Auth's expected User, Account,
   * Session, and Verification fields map cleanly to `prisma/schema.prisma`.
   *
   * Example future setup:
   *
   * import { betterAuth } from "better-auth";
   * import { prismaAdapter } from "better-auth/adapters/prisma";
   * import { bearer } from "better-auth/plugins";
   * import { prisma } from "./prisma.js";
   *
   * export const auth = betterAuth({
   *   secret: env.BETTER_AUTH_SECRET,
   *   baseURL: env.BETTER_AUTH_URL,
   *   database: prismaAdapter(prisma, { provider: "postgresql" }),
   *   plugins: [bearer()],
   * });
   */
  prismaAdapter: {
    enabled: false,
    provider: "postgresql",
  },

  /**
   * Safe placeholder for Google OAuth.
   *
   * Do not mount `/api/auth/*` until this provider is tested end-to-end with
   * the existing User model and callback URL.
   */
  googleProvider: {
    enabled: false,
    clientId: env.GOOGLE_CLIENT_ID,
    clientSecret: env.GOOGLE_CLIENT_SECRET,
    callbackURL: `${env.BETTER_AUTH_URL}/api/auth/callback/google`,
    defaultUserFields: {
      role: UserRole.STUDENT,
      status: UserStatus.ACTIVE,
      emailVerified: true,
      isBlocked: false,
      isDeleted: false,
    },
  },
} as const;

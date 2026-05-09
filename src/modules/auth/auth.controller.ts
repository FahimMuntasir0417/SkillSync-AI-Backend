import crypto from "node:crypto";
import type { CookieOptions, Request, Response } from "express";
import httpStatus from "http-status";

import { catchAsync } from "../../common/utils/catchAsync.js";
import { sendResponse } from "../../common/utils/sendResponse.js";
import { env } from "../../config/env.js";
import { authService } from "./auth.service.js";

const refreshTokenCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
};

const accessTokenCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
};

const googleStateCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: "lax",
  maxAge: 10 * 60 * 1000,
  path: "/",
};

const setAuthCookies = (
  res: Response,
  tokens: { accessToken: string; refreshToken: string },
) => {
  res.cookie("accessToken", tokens.accessToken, accessTokenCookieOptions);
  res.cookie("refreshToken", tokens.refreshToken, refreshTokenCookieOptions);
};
const register = catchAsync(async (req, res) => {
  const { refreshToken, ...registerData } = await authService.register(
    req.body,
  );

  setAuthCookies(res, {
    accessToken: registerData.accessToken,
    refreshToken,
  });

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    message: "User registered successfully",
    data: registerData,
  });
});

const login = catchAsync(async (req, res) => {
  const { refreshToken, ...loginData } = await authService.login(req.body);

  setAuthCookies(res, {
    accessToken: loginData.accessToken,
    refreshToken,
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: "User logged in successfully",
    data: loginData,
  });
});

const refreshToken = catchAsync(async (req, res) => {
  const accessToken = await authService.refreshToken(req.cookies.refreshToken);

  res.cookie("accessToken", accessToken, accessTokenCookieOptions);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: "Access token generated successfully",
    data: {
      accessToken,
    },
  });
});

const logout = catchAsync(async (_req, res) => {
  res.clearCookie("accessToken", accessTokenCookieOptions);
  res.clearCookie("refreshToken", refreshTokenCookieOptions);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: "User logged out successfully",
    data: null,
  });
});

const me = catchAsync(async (req, res) => {
  const user = await authService.getMe(req.user.userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: "Current user retrieved successfully",
    data: user,
  });
});

const updateMyProfile = catchAsync(async (req, res) => {
  const imageUrl = req.file ? `/uploads/${req.file.filename}` : undefined;
  const user = await authService.updateMyProfile(
    req.user.userId,
    req.body,
    imageUrl,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: "Profile updated successfully",
    data: user,
  });
});

const getAllUsers = catchAsync(async (req, res) => {
  const result = await authService.getAllUsers(req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: "Users retrieved successfully",
    meta: result.meta,
    data: result.data,
  });
});

const changePassword = catchAsync(async (req, res) => {
  await authService.changePassword(req.user.userId, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: "Password changed successfully",
    data: null,
  });
});

const verifyEmail = catchAsync(async (req, res) => {
  const user = await authService.verifyEmail(req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: "Email verified successfully",
    data: user,
  });
});

const forgetPassword = catchAsync(async (req, res) => {
  const data = await authService.forgetPassword(req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: "Password reset instructions generated successfully",
    data,
  });
});

const resetPassword = catchAsync(async (req, res) => {
  await authService.resetPassword(req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: "Password reset successfully",
    data: null,
  });
});

const redirectToOAuthError = (res: Response, message: string) => {
  const redirectUrl = new URL("/login", env.CLIENT_URL);
  redirectUrl.searchParams.set("error", message);
  res.redirect(redirectUrl.toString());
};

const getRequestOrigin = (req: Request) => {
  const forwardedProto = req.get("x-forwarded-proto")?.split(",")[0]?.trim();
  const forwardedHost = req.get("x-forwarded-host")?.split(",")[0]?.trim();
  const protocol = forwardedProto || req.protocol;
  const host = forwardedHost || req.get("host");

  return host ? `${protocol}://${host}` : env.BETTER_AUTH_URL.replace(/\/+$/, "");
};

const getGoogleRedirectUri = (req: Request) =>
  `${getRequestOrigin(req)}/api/auth/callback/google`;

const googleLogin = catchAsync(async (req, res) => {
  if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) {
    redirectToOAuthError(res, "Google OAuth is not configured");
    return;
  }

  const state = crypto.randomUUID();
  const callbackURL =
    typeof req.query.callbackURL === "string"
      ? req.query.callbackURL
      : `${env.CLIENT_URL}/auth/google/success`;
  const googleUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");

  googleUrl.searchParams.set("client_id", env.GOOGLE_CLIENT_ID);
  googleUrl.searchParams.set("redirect_uri", getGoogleRedirectUri(req));
  googleUrl.searchParams.set("response_type", "code");
  googleUrl.searchParams.set("scope", "openid email profile");
  googleUrl.searchParams.set("state", state);
  googleUrl.searchParams.set("access_type", "offline");
  googleUrl.searchParams.set("prompt", "select_account");

  res.cookie("google_oauth_state", state, googleStateCookieOptions);
  res.cookie("google_oauth_callback", callbackURL, googleStateCookieOptions);
  res.redirect(googleUrl.toString());
});

const googleOAuthCallback = catchAsync(async (req, res) => {
  const code = typeof req.query.code === "string" ? req.query.code : null;
  const state = typeof req.query.state === "string" ? req.query.state : null;
  const callbackURL =
    typeof req.cookies.google_oauth_callback === "string"
      ? req.cookies.google_oauth_callback
      : `${env.CLIENT_URL}/auth/google/success`;

  res.clearCookie("google_oauth_state", googleStateCookieOptions);
  res.clearCookie("google_oauth_callback", googleStateCookieOptions);

  if (!code || !state || state !== req.cookies.google_oauth_state) {
    redirectToOAuthError(res, "Invalid Google OAuth callback");
    return;
  }

  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: env.GOOGLE_CLIENT_ID,
      client_secret: env.GOOGLE_CLIENT_SECRET,
      code,
      grant_type: "authorization_code",
      redirect_uri: getGoogleRedirectUri(req),
    }),
  });

  const tokenResult = (await tokenResponse.json()) as {
    access_token?: string;
    error_description?: string;
  };

  if (!tokenResponse.ok || !tokenResult.access_token) {
    redirectToOAuthError(
      res,
      tokenResult.error_description ?? "Unable to complete Google OAuth",
    );
    return;
  }

  const profileResponse = await fetch(
    "https://www.googleapis.com/oauth2/v3/userinfo",
    {
      headers: {
        Authorization: `Bearer ${tokenResult.access_token}`,
      },
    },
  );

  const profile = (await profileResponse.json()) as {
    sub?: string;
    email?: string;
    email_verified?: boolean;
    name?: string;
    picture?: string;
  };

  if (!profileResponse.ok || !profile.sub || !profile.email) {
    redirectToOAuthError(res, "Unable to read Google profile");
    return;
  }

  const { refreshToken, ...loginData } = await authService.loginWithGoogle({
    sub: profile.sub,
    email: profile.email,
    email_verified: profile.email_verified,
    name: profile.name,
    picture: profile.picture,
  });

  setAuthCookies(res, {
    accessToken: loginData.accessToken,
    refreshToken,
  });

  const redirectUrl = new URL(callbackURL);
  redirectUrl.searchParams.set("accessToken", loginData.accessToken);
  redirectUrl.searchParams.set("refreshToken", refreshToken);
  redirectUrl.searchParams.set("role", loginData.user.role);

  res.redirect(redirectUrl.toString());
});

const googleLoginSuccess = catchAsync(async (_req, res) => {
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: "Google login completed successfully",
    data: null,
  });
});

const handleOAuthError = catchAsync(async (req, res) => {
  const error =
    typeof req.query.error === "string"
      ? req.query.error
      : "oauth_login_failed";

  res.status(httpStatus.BAD_REQUEST).json({
    success: false,
    message: "OAuth login failed",
    errors: [{ message: error }],
  });
});

export const authController = {
  register,
  login,
  refreshToken,
  logout,
  me,
  updateMyProfile,
  getAllUsers,
  changePassword,
  verifyEmail,
  forgetPassword,
  resetPassword,
  googleLogin,
  googleOAuthCallback,
  googleLoginSuccess,
  handleOAuthError,
};

export const AuthController = {
  register,
  registerMember: register,
  login,
  loginUser: login,
  refreshToken,
  getNewToken: refreshToken,
  logout,
  logoutUser: logout,
  me,
  getMyProfile: me,
  updateMyProfile,
  getAllUsers,
  changePassword,
  verifyEmail,
  forgetPassword,
  resetPassword,
  googleLogin,
  googleOAuthCallback,
  googleLoginSuccess,
  handleOAuthError,
};

import type { CookieOptions, Response } from "express";
import httpStatus from "http-status";

import { AppError } from "@/common/errors/AppError.js";
import { catchAsync } from "@/common/utils/catchAsync.js";
import { sendResponse } from "@/common/utils/sendResponse.js";
import { env } from "@/config/env.js";
import { authService } from "@/modules/auth/auth.service.js";

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

const googleLogin = catchAsync(async (req, res) => {
  if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) {
    throw new AppError(
      httpStatus.SERVICE_UNAVAILABLE,
      "Google OAuth is not configured",
    );
  }

  const callbackURL =
    typeof req.query.callbackURL === "string"
      ? req.query.callbackURL
      : `${env.CLIENT_URL}/auth/google/success`;

  const response = await fetch(
    `${env.BETTER_AUTH_URL}/api/auth/sign-in/social`,
    {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        provider: "google",
        callbackURL,
        errorCallbackURL: `${env.BETTER_AUTH_URL}/api/v1/auth/oauth/error`,
      }),
    },
  );

  const result = (await response.json()) as {
    url?: string;
    message?: string;
  };

  if (!response.ok || !result.url) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      result.message ?? "Unable to start Google OAuth",
    );
  }

  res.redirect(result.url);
});

const googleOAuthCallback = catchAsync(async (req, res) => {
  const query = new URLSearchParams(
    Object.entries(req.query).reduce<Record<string, string>>(
      (params, [key, value]) => {
        if (typeof value === "string") {
          params[key] = value;
        }

        return params;
      },
      {},
    ),
  );

  const redirectUrl = `${env.BETTER_AUTH_URL}/api/auth/callback/google${
    query.size > 0 ? `?${query.toString()}` : ""
  }`;

  res.redirect(redirectUrl);
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

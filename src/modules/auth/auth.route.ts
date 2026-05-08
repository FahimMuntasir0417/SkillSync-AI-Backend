import { UserRole } from "@prisma/client";
import express from "express";

import { checkAuth } from "@/common/middlewares/checkAuth.js";
import { authRateLimiter } from "@/common/middlewares/rateLimiter.js";
import { validateRequest } from "@/common/middlewares/validateRequest.js";
import { multerUpload } from "@/config/multer.config.js";
import { AuthController } from "@/modules/auth/auth.controller.js";
import {
  changePasswordSchema,
  forgetPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  updateMyProfileSchema,
  verifyEmailSchema,
} from "@/modules/auth/auth.validation.js";

const router = express.Router();

const parseMultipartDataField: express.RequestHandler = (req, _res, next) => {
  if (typeof req.body.data === "string") {
    try {
      req.body = {
        ...req.body,
        ...JSON.parse(req.body.data),
      };
      delete req.body.data;
    } catch {
      // Let Zod report invalid or missing fields from the remaining body.
    }
  }

  next();
};

router.post(
  "/register",
  authRateLimiter,
  validateRequest(registerSchema),
  AuthController.registerMember,
);

router.post(
  "/login",
  authRateLimiter,
  validateRequest(loginSchema),
  AuthController.loginUser,
);

router.post("/refresh-token", AuthController.getNewToken);
router.post("/logout", AuthController.logoutUser);
router.get("/users", checkAuth(UserRole.ADMIN), AuthController.getAllUsers);
router.post(
  "/change-password",
  checkAuth(),
  validateRequest(changePasswordSchema),
  AuthController.changePassword,
);
router.post(
  "/verify-email",
  validateRequest(verifyEmailSchema),
  AuthController.verifyEmail,
);
router.post(
  "/forget-password",
  validateRequest(forgetPasswordSchema),
  AuthController.forgetPassword,
);
router.post(
  "/reset-password",
  validateRequest(resetPasswordSchema),
  AuthController.resetPassword,
);
router.get("/me", checkAuth(), AuthController.getMyProfile);
router.get("/users/me", checkAuth(), AuthController.getMyProfile);
router.patch(
  "/users/me",
  checkAuth(),
  multerUpload.single("image"),
  parseMultipartDataField,
  validateRequest(updateMyProfileSchema),
  AuthController.updateMyProfile,
);

router.get("/google", AuthController.googleLogin);
router.get("/login/google", AuthController.googleLogin);
router.get("/google/callback", AuthController.googleOAuthCallback);
router.get("/google/success", AuthController.googleLoginSuccess);
router.get("/oauth/error", AuthController.handleOAuthError);

export const AuthRoutes = router;
export const authRoute = router;

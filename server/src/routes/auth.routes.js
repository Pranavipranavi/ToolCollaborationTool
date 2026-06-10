import express from "express";
import rateLimit from "express-rate-limit";
import passport from "passport";
import { env } from "../config/env.js";
import {
  getSecurityQuestion,
  login,
  loginRules,
  logout,
  me,
  oauthSuccess,
  passwordRules,
  profileRules,
  register,
  registerRules,
  resetPassword,
  resetPasswordRules,
  securityAnswerRules,
  securityQuestionRules,
  updatePassword,
  updateProfile,
  verifySecurityAnswer,
} from "../controllers/auth.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/error.middleware.js";
import { acceptWorkspaceInvitation } from "../services/invitation.service.js";
import { ApiError } from "../utils/ApiError.js";

export const authRouter = express.Router();

const passwordResetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 8,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many password reset attempts. Try again later." },
});

const securityAnswerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many security answer attempts. Try again later." },
});

authRouter.post("/register", registerRules, validate, register);
authRouter.post("/login", loginRules, validate, login);
authRouter.post("/logout", logout);
authRouter.post("/password-reset/question", passwordResetLimiter, securityQuestionRules, validate, getSecurityQuestion);
authRouter.post("/password-reset/verify", securityAnswerLimiter, securityAnswerRules, validate, verifySecurityAnswer);
authRouter.post("/password-reset/complete", passwordResetLimiter, resetPasswordRules, validate, resetPassword);
authRouter.get("/me", protect, me);
authRouter.patch("/me", protect, profileRules, validate, updateProfile);
authRouter.patch("/password", protect, passwordRules, validate, updatePassword);

function requireOAuthProvider(provider) {
  return (_req, _res, next) => {
    if (!passport._strategy(provider)) {
      return next(new ApiError(501, `${provider} OAuth is not configured`));
    }
    return next();
  };
}

authRouter.get("/google", requireOAuthProvider("google"), (req, res, next) => {
  passport.authenticate("google", {
    scope: ["profile", "email"],
    state: typeof req.query.invite === "string" ? req.query.invite : undefined,
  })(req, res, next);
});
authRouter.get("/google/callback", requireOAuthProvider("google"), (req, res, next) => {
  passport.authenticate("google", { session: false }, async (error, user) => {
    if (error || !user) return res.redirect(`${env.clientUrl}/login?oauth=failed`);
    req.user = user;
    if (typeof req.query.state === "string" && req.query.state) {
      try {
        await acceptWorkspaceInvitation({ token: req.query.state, user });
        req.oauthRedirectPath = "/workspace?invite=accepted";
      } catch (_inviteError) {
        req.oauthRedirectPath = "/workspace?invite=failed";
      }
    }
    return oauthSuccess(req, res, next);
  })(req, res, next);
});

authRouter.use((req, _res, next) => {
  next(new ApiError(404, `Route not found: /api/auth${req.path}`));
});

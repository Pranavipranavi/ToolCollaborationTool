import crypto from "crypto";
import { body } from "express-validator";
import { env } from "../config/env.js";
import { SECURITY_QUESTIONS } from "../constants/securityQuestions.js";
import { Workspace } from "../models/Workspace.js";
import { User } from "../models/User.js";
import { setAuthCookie, signToken } from "../utils/tokens.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const MAX_SECURITY_ATTEMPTS = 5;
const SECURITY_LOCK_MS = 15 * 60 * 1000;
const RESET_TOKEN_MS = 30 * 60 * 1000;

export const registerRules = [
  body("name").trim().notEmpty(),
  body("email").isEmail().normalizeEmail(),
  body("password").isLength({ min: 8 }),
  body("securityQuestion").isIn(SECURITY_QUESTIONS),
  body("securityAnswer").trim().isLength({ min: 2, max: 120 }),
];
export const loginRules = [body("email").isEmail().normalizeEmail(), body("password").notEmpty()];
export const securityQuestionRules = [body("email").isEmail().normalizeEmail()];
export const securityAnswerRules = [body("email").isEmail().normalizeEmail(), body("securityAnswer").trim().isLength({ min: 2, max: 120 })];
export const resetPasswordRules = [body("resetToken").notEmpty(), body("password").isLength({ min: 8 })];
export const profileRules = [body("name").optional().trim().notEmpty(), body("avatar").optional().isURL()];
export const passwordRules = [body("currentPassword").notEmpty(), body("newPassword").isLength({ min: 8 })];

function publicUser(user) {
  return { id: user._id, name: user.name, email: user.email, avatar: user.avatar, joinedAt: user.createdAt };
}

function hashResetToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function makeUsername(email) {
  const base = String(email).split("@")[0].toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 32) || "user";
  return `${base}-${crypto.randomBytes(4).toString("hex")}`;
}

export const register = asyncHandler(async (req, res) => {
  const existing = await User.findOne({ email: req.body.email });
  if (existing) throw new ApiError(409, "Email is already registered");

  const user = new User({
    name: req.body.name,
    username: makeUsername(req.body.email),
    email: req.body.email,
    password: req.body.password,
    securityQuestion: req.body.securityQuestion,
  });
  await user.setSecurityAnswer(req.body.securityAnswer);
  await user.save();

  await Workspace.create({
    name: `${user.name}'s Workspace`,
    description: "Your TaskFlow workspace",
    owner: user._id,
    inviteCode: crypto.randomBytes(8).toString("hex"),
    members: [{ user: user._id, role: "Owner" }],
  });

  const token = signToken(user);
  setAuthCookie(res, token);
  res.status(201).json({ user: publicUser(user), token });
});

export const login = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email }).select("+password");
  if (!user || !(await user.comparePassword(req.body.password))) throw new ApiError(401, "Invalid email or password");

  const token = signToken(user);
  setAuthCookie(res, token);
  res.json({ user: publicUser(user), token });
});

export const me = asyncHandler(async (req, res) => {
  res.json({ user: publicUser(req.user) });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const allowed = {};
  if (req.body.name) allowed.name = req.body.name;
  if (req.body.avatar) allowed.avatar = req.body.avatar;

  const user = await User.findByIdAndUpdate(req.user._id, allowed, { new: true });
  res.json({ user: publicUser(user) });
});

export const updatePassword = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("+password");
  if (!user || !(await user.comparePassword(req.body.currentPassword))) throw new ApiError(401, "Current password is incorrect");

  user.password = req.body.newPassword;
  await user.save();
  const token = signToken(user);
  setAuthCookie(res, token);
  res.json({ user: publicUser(user), token });
});

export const getSecurityQuestion = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email }).select("email securityQuestion");
  if (!user) throw new ApiError(404, "No account was found for that email address");
  if (!user.securityQuestion) throw new ApiError(400, "This account does not have a security question configured. Use Google login or contact support.");

  res.json({ email: user.email, securityQuestion: user.securityQuestion });
});

export const verifySecurityAnswer = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email }).select("+securityAnswerHash +securityAnswerAttempts +securityAnswerLockedUntil +resetPasswordToken +resetPasswordExpires email securityQuestion");
  if (!user) throw new ApiError(404, "No account was found for that email address");
  if (!user.securityQuestion || !user.securityAnswerHash) throw new ApiError(400, "This account does not have a security question configured. Use Google login or contact support.");

  if (user.securityAnswerLockedUntil && user.securityAnswerLockedUntil > new Date()) {
    throw new ApiError(429, "Too many incorrect answers. Try again later.");
  }

  const correct = await user.compareSecurityAnswer(req.body.securityAnswer);
  if (!correct) {
    user.securityAnswerAttempts = (user.securityAnswerAttempts || 0) + 1;
    if (user.securityAnswerAttempts >= MAX_SECURITY_ATTEMPTS) {
      user.securityAnswerLockedUntil = new Date(Date.now() + SECURITY_LOCK_MS);
    }
    await user.save({ validateBeforeSave: false });
    throw new ApiError(user.securityAnswerAttempts >= MAX_SECURITY_ATTEMPTS ? 429 : 401, user.securityAnswerAttempts >= MAX_SECURITY_ATTEMPTS ? "Too many incorrect answers. Try again in 15 minutes." : "Security answer is incorrect.");
  }

  const resetToken = crypto.randomBytes(32).toString("hex");
  user.securityAnswerAttempts = 0;
  user.securityAnswerLockedUntil = undefined;
  user.resetPasswordToken = hashResetToken(resetToken);
  user.resetPasswordExpires = new Date(Date.now() + RESET_TOKEN_MS);
  await user.save({ validateBeforeSave: false });

  res.json({ resetToken, expiresInMinutes: RESET_TOKEN_MS / 60000 });
});

export const resetPassword = asyncHandler(async (req, res) => {
  const user = await User.findOne({
    resetPasswordToken: hashResetToken(req.body.resetToken),
    resetPasswordExpires: { $gt: new Date() },
  }).select("+password +resetPasswordToken +resetPasswordExpires +securityAnswerAttempts +securityAnswerLockedUntil");

  if (!user) throw new ApiError(400, "Password reset session is invalid or expired");

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  user.securityAnswerAttempts = 0;
  user.securityAnswerLockedUntil = undefined;
  await user.save();

  const token = signToken(user);
  setAuthCookie(res, token);
  res.json({ user: publicUser(user), token });
});

export const logout = asyncHandler(async (_req, res) => {
  res.clearCookie("taskflow_token", {
    httpOnly: true,
    sameSite: env.nodeEnv === "production" ? "none" : "lax",
    secure: env.nodeEnv === "production",
  });
  res.json({ message: "Logged out" });
});

export const oauthSuccess = asyncHandler(async (req, res) => {
  const token = signToken(req.user);
  setAuthCookie(res, token);
  res.redirect(`${env.clientUrl}/`);
});

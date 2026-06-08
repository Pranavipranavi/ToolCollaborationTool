import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { SECURITY_QUESTIONS } from "../constants/securityQuestions.js";

function normalizeSecurityAnswer(answer) {
  return String(answer || "").trim().toLowerCase().replace(/\s+/g, " ");
}

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    username: { type: String, unique: true, sparse: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, select: false },
    avatar: String,
    providers: {
      google: String,
    },
    securityQuestion: { type: String, enum: SECURITY_QUESTIONS },
    securityAnswerHash: { type: String, select: false },
    securityAnswerAttempts: { type: Number, default: 0, select: false },
    securityAnswerLockedUntil: { type: Date, select: false },
    resetPasswordToken: { type: String, select: false },
    resetPasswordExpires: { type: Date, select: false },
  },
  { timestamps: true }
);

userSchema.pre("save", async function hashPassword(next) {
  if (!this.isModified("password") || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = function comparePassword(candidate) {
  if (!this.password) return false;
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.setSecurityAnswer = async function setSecurityAnswer(answer) {
  this.securityAnswerHash = await bcrypt.hash(normalizeSecurityAnswer(answer), 12);
};

userSchema.methods.compareSecurityAnswer = function compareSecurityAnswer(candidate) {
  if (!this.securityAnswerHash) return false;
  return bcrypt.compare(normalizeSecurityAnswer(candidate), this.securityAnswerHash);
};

export const User = mongoose.model("User", userSchema);

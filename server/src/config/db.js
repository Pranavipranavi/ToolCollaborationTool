import mongoose from "mongoose";
import { env } from "./env.js";
import { ApiError } from "../utils/ApiError.js";

export async function connectDb() {
  if (!env.mongoUri) {
    console.warn("MONGODB_URI is not set. API will start, but database routes require MongoDB Atlas.");
    return;
  }

  mongoose.set("strictQuery", true);
  await mongoose.connect(env.mongoUri);
  console.log("MongoDB connected");
}

export function isDbConnected() {
  return mongoose.connection.readyState === 1;
}

export function requireDb(_req, _res, next) {
  if (!env.mongoUri) {
    return next(new ApiError(503, "MongoDB is not configured. Set MONGODB_URI to enable API persistence."));
  }

  if (!isDbConnected()) {
    return next(new ApiError(503, "MongoDB is not connected yet. Retry after the API finishes connecting."));
  }

  return next();
}

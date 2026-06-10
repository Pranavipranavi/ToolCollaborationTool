import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import morgan from "morgan";
import { isDbConnected, requireDb } from "./config/db.js";
import { env } from "./config/env.js";
import { passport } from "./config/passport.js";
import { analyticsRouter } from "./routes/analytics.routes.js";
import { activityRouter } from "./routes/activity.routes.js";
import { authRouter } from "./routes/auth.routes.js";
import { commentRouter } from "./routes/comment.routes.js";
import { notificationRouter } from "./routes/notification.routes.js";
import { projectRouter } from "./routes/project.routes.js";
import { searchRouter } from "./routes/search.routes.js";
import { taskRouter } from "./routes/task.routes.js";
import { workspaceRouter } from "./routes/workspace.routes.js";
import { errorHandler, notFound } from "./middleware/error.middleware.js";
import { requireTrustedOrigin } from "./middleware/security.middleware.js";

export const app = express();

const allowedOrigins = new Set(env.allowedOrigins);

app.set("trust proxy", 1);
app.use(helmet());
app.use(cors({ origin: Array.from(allowedOrigins), credentials: true }));
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());
app.use(passport.initialize());
app.use(morgan(env.nodeEnv === "production" ? "combined" : "dev"));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 600 }));
app.use("/api", requireTrustedOrigin(allowedOrigins));

app.get("/health", (_req, res) => res.json({ status: "ok", service: "taskflow-api", database: isDbConnected() ? "connected" : "not_connected" }));
app.use("/api", requireDb);
app.use("/api/auth", authRouter);
app.use("/api/workspaces", workspaceRouter);
app.use("/api", projectRouter);
app.use("/api", taskRouter);
app.use("/api", commentRouter);
app.use("/api", activityRouter);
app.use("/api", searchRouter);
app.use("/api/notifications", notificationRouter);
app.use("/api/analytics", analyticsRouter);
app.use(notFound);
app.use(errorHandler);

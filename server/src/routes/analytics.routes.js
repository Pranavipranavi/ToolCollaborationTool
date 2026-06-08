import express from "express";
import { dashboard } from "../controllers/analytics.controller.js";
import { protect } from "../middleware/auth.middleware.js";

export const analyticsRouter = express.Router();

analyticsRouter.use(protect);
analyticsRouter.get("/dashboard", dashboard);

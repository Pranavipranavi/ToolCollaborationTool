import { Router } from "express";
import { globalSearch } from "../controllers/search.controller.js";
import { protect } from "../middleware/auth.middleware.js";

export const searchRouter = Router();

searchRouter.get("/search", protect, globalSearch);

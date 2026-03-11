import { Hono } from "hono";
import { getDashboardStats } from "../controllers/stats.controller";
import { authMiddleware } from "../middleware/auth";

const statsRoutes = new Hono();

// All routes require authentication
statsRoutes.use("*", authMiddleware);

// Dashboard statistics
statsRoutes.get("/dashboard", getDashboardStats);

export default statsRoutes;

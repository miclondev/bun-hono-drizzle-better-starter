import { Hono } from "hono";
import {
  getDashboardStats,
  getAnalyticsMetrics,
  getTopVideos,
  getTopicPerformance,
  getTimeSeriesData,
  getAutomationPerformance,
  getGrowthMetrics,
  getEngagementRate,
  getSuccessRate,
} from "../controllers/stats.controller";
import { authMiddleware } from "../middleware/auth";

const statsRoutes = new Hono();

// All routes require authentication
statsRoutes.use("*", authMiddleware);

// Dashboard statistics
statsRoutes.get("/dashboard", getDashboardStats);

// Detailed analytics
statsRoutes.get("/analytics/metrics", getAnalyticsMetrics);
statsRoutes.get("/analytics/top-videos", getTopVideos);
statsRoutes.get("/analytics/topic-performance", getTopicPerformance);
statsRoutes.get("/analytics/time-series", getTimeSeriesData);
statsRoutes.get("/analytics/automation-performance", getAutomationPerformance);
statsRoutes.get("/analytics/growth", getGrowthMetrics);
statsRoutes.get("/analytics/engagement-rate", getEngagementRate);
statsRoutes.get("/analytics/success-rate", getSuccessRate);

export default statsRoutes;

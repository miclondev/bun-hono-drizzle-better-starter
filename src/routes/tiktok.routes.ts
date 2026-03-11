import { Hono } from "hono";
import {
  getTikTokStatus,
  getOAuthUrl,
  handleOAuthCallback,
  refreshToken,
  disconnectTikTok,
  postVideoToTikTok,
} from "../controllers/tiktok.controller";
import { authMiddleware } from "../middleware/auth";

const tiktokRoutes = new Hono();

// OAuth callback doesn't require auth (it's the entry point)
tiktokRoutes.get("/oauth/callback", handleOAuthCallback);

// All other routes require authentication
tiktokRoutes.use("*", authMiddleware);

// TikTok connection management
tiktokRoutes.get("/status", getTikTokStatus);
tiktokRoutes.get("/oauth/url", getOAuthUrl);
tiktokRoutes.post("/refresh-token", refreshToken);
tiktokRoutes.delete("/disconnect", disconnectTikTok);

// Post video to TikTok
tiktokRoutes.post("/:videoId/post", postVideoToTikTok);

export default tiktokRoutes;

import { Hono } from "hono";
import {
  getVideos,
  getVideo,
  createVideo,
  updateVideo,
  deleteVideo,
  regenerateVideo,
  postToTikTok,
  generateScript,
  generateTitle,
  improveScript,
} from "../controllers/video.controller";
import { authMiddleware } from "../middleware/auth";

const videoRoutes = new Hono();

// All routes require authentication
videoRoutes.use("*", authMiddleware);

// Video CRUD operations
videoRoutes.get("/", getVideos);
videoRoutes.get("/:id", getVideo);
videoRoutes.post("/", createVideo);
videoRoutes.patch("/:id", updateVideo);
videoRoutes.delete("/:id", deleteVideo);

// Video actions
videoRoutes.post("/:id/regenerate", regenerateVideo);
videoRoutes.post("/:id/post-to-tiktok", postToTikTok);

// AI script generation
videoRoutes.post("/ai/generate-script", generateScript);
videoRoutes.post("/ai/generate-title", generateTitle);
videoRoutes.post("/ai/improve-script", improveScript);

export default videoRoutes;

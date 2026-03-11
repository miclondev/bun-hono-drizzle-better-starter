import { Hono } from "hono";
import {
  getRssFeeds,
  createRssFeed,
  deleteRssFeed,
  fetchRssFeedItems,
  generateVideoFromRss,
  validateRssFeedUrl,
} from "../controllers/rss-feed.controller";
import { authMiddleware } from "../middleware/auth";

const rssFeedRoutes = new Hono();

// All routes require authentication
rssFeedRoutes.use("*", authMiddleware);

// RSS feed CRUD operations
rssFeedRoutes.get("/", getRssFeeds);
rssFeedRoutes.post("/", createRssFeed);
rssFeedRoutes.delete("/:id", deleteRssFeed);

// RSS feed parsing and video generation
rssFeedRoutes.get("/:id/items", fetchRssFeedItems);
rssFeedRoutes.post("/generate-video", generateVideoFromRss);
rssFeedRoutes.post("/validate", validateRssFeedUrl);

export default rssFeedRoutes;

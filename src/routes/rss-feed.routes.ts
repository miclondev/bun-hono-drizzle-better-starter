import { Hono } from "hono";
import {
  getRssFeeds,
  createRssFeed,
  deleteRssFeed,
} from "../controllers/rss-feed.controller";
import { authMiddleware } from "../middleware/auth";

const rssFeedRoutes = new Hono();

// All routes require authentication
rssFeedRoutes.use("*", authMiddleware);

// RSS feed CRUD operations
rssFeedRoutes.get("/", getRssFeeds);
rssFeedRoutes.post("/", createRssFeed);
rssFeedRoutes.delete("/:id", deleteRssFeed);

export default rssFeedRoutes;

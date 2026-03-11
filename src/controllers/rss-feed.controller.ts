import type { Context } from "hono";
import { rssFeedRepository } from "../db/repositories";
import { createRssFeedSchema } from "../validation/rss-feed.validation";

/**
 * Get all RSS feeds for the authenticated user
 */
export async function getRssFeeds(c: Context) {
  try {
    const userId = c.get("userId");
    const feeds = await rssFeedRepository.findByUserId(userId);
    return c.json({ feeds }, 200);
  } catch (error) {
    console.error("Error fetching RSS feeds:", error);
    return c.json({ error: "Failed to fetch RSS feeds" }, 500);
  }
}

/**
 * Create a new RSS feed
 */
export async function createRssFeed(c: Context) {
  try {
    const userId = c.get("userId");
    const body = await c.req.json();

    // Validate request body
    const { error, value } = createRssFeedSchema.validate(body);
    if (error) {
      return c.json({ error: error.details[0].message }, 400);
    }

    // Check if feed URL already exists
    const exists = await rssFeedRepository.existsByUrl(value.url, userId);
    if (exists) {
      return c.json({ error: "RSS feed already exists" }, 400);
    }

    const feed = await rssFeedRepository.create({
      ...value,
      userId,
    });

    return c.json({ feed }, 201);
  } catch (error) {
    console.error("Error creating RSS feed:", error);
    return c.json({ error: "Failed to create RSS feed" }, 500);
  }
}

/**
 * Delete an RSS feed
 */
export async function deleteRssFeed(c: Context) {
  try {
    const userId = c.get("userId");
    const { id } = c.req.param();

    const deleted = await rssFeedRepository.delete(id, userId);
    if (!deleted) {
      return c.json({ error: "RSS feed not found" }, 404);
    }

    return c.json({ message: "RSS feed deleted successfully" }, 200);
  } catch (error) {
    console.error("Error deleting RSS feed:", error);
    return c.json({ error: "Failed to delete RSS feed" }, 500);
  }
}

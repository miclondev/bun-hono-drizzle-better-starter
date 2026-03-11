import type { Context } from "hono";
import { rssFeedRepository, videoRepository } from "../db/repositories";
import { createRssFeedSchema } from "../validation/rss-feed.validation";
import { rssService } from "../services/rss.service";
import { aiService } from "../services/ai.service";

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

/**
 * Fetch items from an RSS feed
 */
export async function fetchRssFeedItems(c: Context) {
  try {
    const userId = c.get("userId");
    const { id } = c.req.param();
    const { limit } = c.req.query();

    // Verify feed belongs to user
    const feed = await rssFeedRepository.findById(id, userId);
    if (!feed) {
      return c.json({ error: "RSS feed not found" }, 404);
    }

    // Parse feed and get items
    const itemLimit = limit ? parseInt(limit) : 10;
    const items = await rssService.getLatestItems(feed.url, itemLimit);

    return c.json({ items }, 200);
  } catch (error) {
    console.error("Error fetching RSS feed items:", error);
    return c.json(
      { error: error instanceof Error ? error.message : "Failed to fetch RSS feed items" },
      500
    );
  }
}

/**
 * Generate video from RSS feed item
 */
export async function generateVideoFromRss(c: Context) {
  try {
    const userId = c.get("userId");
    const body = await c.req.json();

    const { feedId, itemIndex, voiceId, bgStyle, textStyle } = body;

    if (!feedId || itemIndex === undefined) {
      return c.json({ error: "feedId and itemIndex are required" }, 400);
    }

    // Verify feed belongs to user
    const feed = await rssFeedRepository.findById(feedId, userId);
    if (!feed) {
      return c.json({ error: "RSS feed not found" }, 404);
    }

    // Get RSS items
    const items = await rssService.getLatestItems(feed.url, itemIndex + 1);
    if (!items[itemIndex]) {
      return c.json({ error: "RSS item not found" }, 404);
    }

    const item = items[itemIndex];

    // Extract topic
    const topic = rssService.extractTopic(item);

    // Generate script from RSS content
    const scriptPrompt = rssService.generateScriptPrompt(item);
    const script = await aiService.generateScript(topic, 60);

    // Generate title
    const title = await aiService.generateTitle(item.title);

    // Create video
    const video = await videoRepository.create({
      userId,
      title,
      topic,
      script,
      voiceId: voiceId || "voice-1",
      bgStyle: bgStyle || "gradient-1",
      textStyle: textStyle || "modern",
      status: "generating",
    });

    return c.json(
      {
        video,
        message: "Video generation started from RSS feed item",
      },
      201
    );
  } catch (error) {
    console.error("Error generating video from RSS:", error);
    return c.json(
      { error: error instanceof Error ? error.message : "Failed to generate video from RSS" },
      500
    );
  }
}

/**
 * Validate RSS feed URL
 */
export async function validateRssFeedUrl(c: Context) {
  try {
    const { url } = await c.req.json();

    if (!url || typeof url !== "string") {
      return c.json({ error: "URL is required" }, 400);
    }

    const isValid = await rssService.validateFeedUrl(url);

    if (!isValid) {
      return c.json({ valid: false, error: "Invalid RSS feed URL" }, 200);
    }

    // Get feed metadata
    const metadata = await rssService.getFeedMetadata(url);

    return c.json(
      {
        valid: true,
        metadata,
      },
      200
    );
  } catch (error) {
    console.error("Error validating RSS feed URL:", error);
    return c.json({ valid: false, error: "Failed to validate RSS feed URL" }, 200);
  }
}

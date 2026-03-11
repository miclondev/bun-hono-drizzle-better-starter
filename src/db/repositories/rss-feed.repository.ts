import { eq, and, desc } from "drizzle-orm";
import { db } from "../config";
import {
  rssFeeds,
  type RssFeed,
  type InsertRssFeed,
} from "../schema/rss-feed.schema";

/**
 * RSS Feed Repository
 * Handles all database operations for RSS feeds
 */
export class RssFeedRepository {
  /**
   * Get all RSS feeds for a user
   */
  async findByUserId(userId: string): Promise<RssFeed[]> {
    return await db
      .select()
      .from(rssFeeds)
      .where(eq(rssFeeds.userId, userId))
      .orderBy(desc(rssFeeds.createdAt));
  }

  /**
   * Get a single RSS feed by ID
   */
  async findById(id: string, userId: string): Promise<RssFeed | null> {
    const result = await db
      .select()
      .from(rssFeeds)
      .where(and(eq(rssFeeds.id, id), eq(rssFeeds.userId, userId)))
      .limit(1);

    return result[0] || null;
  }

  /**
   * Create a new RSS feed
   */
  async create(data: InsertRssFeed): Promise<RssFeed> {
    const result = await db.insert(rssFeeds).values(data).returning();
    return result[0];
  }

  /**
   * Delete an RSS feed
   */
  async delete(id: string, userId: string): Promise<boolean> {
    const result = await db
      .delete(rssFeeds)
      .where(and(eq(rssFeeds.id, id), eq(rssFeeds.userId, userId)))
      .returning();

    return result.length > 0;
  }

  /**
   * Check if feed URL already exists for user
   */
  async existsByUrl(url: string, userId: string): Promise<boolean> {
    const result = await db
      .select()
      .from(rssFeeds)
      .where(and(eq(rssFeeds.url, url), eq(rssFeeds.userId, userId)))
      .limit(1);

    return result.length > 0;
  }
}

export const rssFeedRepository = new RssFeedRepository();

import { eq, and, desc, ilike, or } from "drizzle-orm";
import { db } from "../config";
import { videos, type Video, type InsertVideo, type UpdateVideo } from "../schema/video.schema";

/**
 * Video Repository
 * Handles all database operations for videos
 */
export class VideoRepository {
  /**
   * Get all videos for a user with optional filters
   */
  async findByUserId(
    userId: string,
    filters?: {
      status?: string;
      search?: string;
    }
  ): Promise<Video[]> {
    const conditions = [eq(videos.userId, userId)];

    if (filters?.status) {
      conditions.push(eq(videos.status, filters.status));
    }

    if (filters?.search) {
      conditions.push(
        or(
          ilike(videos.title, `%${filters.search}%`),
          ilike(videos.topic, `%${filters.search}%`)
        )!
      );
    }

    return await db
      .select()
      .from(videos)
      .where(and(...conditions))
      .orderBy(desc(videos.createdAt));
  }

  /**
   * Get a single video by ID
   */
  async findById(id: string, userId: string): Promise<Video | null> {
    const result = await db
      .select()
      .from(videos)
      .where(and(eq(videos.id, id), eq(videos.userId, userId)))
      .limit(1);

    return result[0] || null;
  }

  /**
   * Create a new video
   */
  async create(data: InsertVideo): Promise<Video> {
    const result = await db.insert(videos).values(data).returning();
    return result[0];
  }

  /**
   * Update a video
   */
  async update(id: string, userId: string, data: UpdateVideo): Promise<Video | null> {
    const result = await db
      .update(videos)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(videos.id, id), eq(videos.userId, userId)))
      .returning();

    return result[0] || null;
  }

  /**
   * Delete a video
   */
  async delete(id: string, userId: string): Promise<boolean> {
    const result = await db
      .delete(videos)
      .where(and(eq(videos.id, id), eq(videos.userId, userId)))
      .returning();

    return result.length > 0;
  }

  /**
   * Get video statistics for a user
   */
  async getStats(userId: string) {
    const allVideos = await db
      .select()
      .from(videos)
      .where(eq(videos.userId, userId));

    return {
      total: allVideos.length,
      generating: allVideos.filter((v) => v.status === "generating").length,
      ready: allVideos.filter((v) => v.status === "ready").length,
      posted: allVideos.filter((v) => v.status === "posted").length,
      failed: allVideos.filter((v) => v.status === "failed").length,
      totalViews: allVideos.reduce((sum, v) => sum + (v.views || 0), 0),
    };
  }

  /**
   * Get recent videos for dashboard
   */
  async getRecent(userId: string, limit = 5): Promise<Video[]> {
    return await db
      .select()
      .from(videos)
      .where(eq(videos.userId, userId))
      .orderBy(desc(videos.createdAt))
      .limit(limit);
  }

  /**
   * Update video status
   */
  async updateStatus(
    id: string,
    userId: string,
    status: string,
    errorMessage?: string
  ): Promise<Video | null> {
    return await this.update(id, userId, {
      status,
      errorMessage,
      updatedAt: new Date(),
    });
  }
}

export const videoRepository = new VideoRepository();

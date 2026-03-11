import { eq, and, desc } from "drizzle-orm";
import { db } from "../config";
import {
  videoTemplates,
  type VideoTemplate,
  type InsertVideoTemplate,
} from "../schema/template.schema";

/**
 * Video Template Repository
 * Handles all database operations for video templates
 */
export class TemplateRepository {
  /**
   * Get all templates for a user
   */
  async findByUserId(userId: string): Promise<VideoTemplate[]> {
    return await db
      .select()
      .from(videoTemplates)
      .where(eq(videoTemplates.userId, userId))
      .orderBy(desc(videoTemplates.createdAt));
  }

  /**
   * Get a single template by ID
   */
  async findById(id: string, userId: string): Promise<VideoTemplate | null> {
    const result = await db
      .select()
      .from(videoTemplates)
      .where(and(eq(videoTemplates.id, id), eq(videoTemplates.userId, userId)))
      .limit(1);

    return result[0] || null;
  }

  /**
   * Create a new template
   */
  async create(data: InsertVideoTemplate): Promise<VideoTemplate> {
    const result = await db.insert(videoTemplates).values(data).returning();
    return result[0];
  }

  /**
   * Delete a template
   */
  async delete(id: string, userId: string): Promise<boolean> {
    const result = await db
      .delete(videoTemplates)
      .where(and(eq(videoTemplates.id, id), eq(videoTemplates.userId, userId)))
      .returning();

    return result.length > 0;
  }

  /**
   * Check if template exists
   */
  async exists(id: string, userId: string): Promise<boolean> {
    const template = await this.findById(id, userId);
    return template !== null;
  }
}

export const templateRepository = new TemplateRepository();

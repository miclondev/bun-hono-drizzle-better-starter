import { eq, and, desc } from "drizzle-orm";
import { db } from "../config";
import {
  automations,
  type Automation,
  type InsertAutomation,
  type UpdateAutomation,
} from "../schema/automation.schema";

/**
 * Automation Repository
 * Handles all database operations for automations
 */
export class AutomationRepository {
  /**
   * Get all automations for a user
   */
  async findByUserId(userId: string): Promise<Automation[]> {
    return await db
      .select()
      .from(automations)
      .where(eq(automations.userId, userId))
      .orderBy(desc(automations.createdAt));
  }

  /**
   * Get a single automation by ID
   */
  async findById(id: string, userId: string): Promise<Automation | null> {
    const result = await db
      .select()
      .from(automations)
      .where(and(eq(automations.id, id), eq(automations.userId, userId)))
      .limit(1);

    return result[0] || null;
  }

  /**
   * Create a new automation
   */
  async create(data: InsertAutomation): Promise<Automation> {
    const result = await db.insert(automations).values(data).returning();
    return result[0];
  }

  /**
   * Update an automation
   */
  async update(
    id: string,
    userId: string,
    data: UpdateAutomation
  ): Promise<Automation | null> {
    const result = await db
      .update(automations)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(automations.id, id), eq(automations.userId, userId)))
      .returning();

    return result[0] || null;
  }

  /**
   * Delete an automation
   */
  async delete(id: string, userId: string): Promise<boolean> {
    const result = await db
      .delete(automations)
      .where(and(eq(automations.id, id), eq(automations.userId, userId)))
      .returning();

    return result.length > 0;
  }

  /**
   * Toggle automation active status
   */
  async toggleActive(id: string, userId: string): Promise<Automation | null> {
    const automation = await this.findById(id, userId);
    if (!automation) return null;

    return await this.update(id, userId, {
      active: !automation.active,
    });
  }

  /**
   * Get active automations for a user
   */
  async findActive(userId: string): Promise<Automation[]> {
    return await db
      .select()
      .from(automations)
      .where(and(eq(automations.userId, userId), eq(automations.active, true)))
      .orderBy(desc(automations.createdAt));
  }

  /**
   * Update automation run statistics
   */
  async updateRunStats(id: string, userId: string): Promise<Automation | null> {
    const automation = await this.findById(id, userId);
    if (!automation) return null;

    return await this.update(id, userId, {
      videosGenerated: (automation.videosGenerated || 0) + 1,
      lastRunAt: new Date(),
    });
  }

  /**
   * Get automation statistics
   */
  async getStats(userId: string) {
    const allAutomations = await this.findByUserId(userId);

    return {
      total: allAutomations.length,
      active: allAutomations.filter((a) => a.active).length,
      totalVideosGenerated: allAutomations.reduce(
        (sum, a) => sum + (a.videosGenerated || 0),
        0
      ),
    };
  }
}

export const automationRepository = new AutomationRepository();

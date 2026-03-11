import { eq } from "drizzle-orm";
import { db } from "../config";
import {
  tiktokAccounts,
  type TikTokAccount,
  type InsertTikTokAccount,
  type UpdateTikTokAccount,
} from "../schema/tiktok.schema";

/**
 * TikTok Account Repository
 * Handles all database operations for TikTok OAuth accounts
 */
export class TikTokRepository {
  /**
   * Get TikTok account for a user
   */
  async findByUserId(userId: string): Promise<TikTokAccount | null> {
    const result = await db
      .select()
      .from(tiktokAccounts)
      .where(eq(tiktokAccounts.userId, userId))
      .limit(1);

    return result[0] || null;
  }

  /**
   * Create or update TikTok account
   */
  async upsert(data: InsertTikTokAccount): Promise<TikTokAccount> {
    const existing = await this.findByUserId(data.userId);

    if (existing) {
      const result = await db
        .update(tiktokAccounts)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(tiktokAccounts.userId, data.userId))
        .returning();
      return result[0];
    }

    const result = await db.insert(tiktokAccounts).values(data).returning();
    return result[0];
  }

  /**
   * Update TikTok account
   */
  async update(
    userId: string,
    data: UpdateTikTokAccount
  ): Promise<TikTokAccount | null> {
    const result = await db
      .update(tiktokAccounts)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(tiktokAccounts.userId, userId))
      .returning();

    return result[0] || null;
  }

  /**
   * Delete TikTok account (disconnect)
   */
  async delete(userId: string): Promise<boolean> {
    const result = await db
      .delete(tiktokAccounts)
      .where(eq(tiktokAccounts.userId, userId))
      .returning();

    return result.length > 0;
  }

  /**
   * Check if user has connected TikTok account
   */
  async isConnected(userId: string): Promise<boolean> {
    const account = await this.findByUserId(userId);
    return account !== null;
  }

  /**
   * Update access token (for token refresh)
   */
  async updateTokens(
    userId: string,
    accessToken: string,
    refreshToken: string,
    expiresAt: Date
  ): Promise<TikTokAccount | null> {
    return await this.update(userId, {
      accessToken,
      refreshToken,
      tokenExpiresAt: expiresAt,
    });
  }

  /**
   * Check if token is expired
   */
  async isTokenExpired(userId: string): Promise<boolean> {
    const account = await this.findByUserId(userId);
    if (!account) return true;

    return new Date() >= new Date(account.tokenExpiresAt);
  }
}

export const tiktokRepository = new TikTokRepository();

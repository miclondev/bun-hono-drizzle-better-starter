import { db } from "@/db/config";
import { sql } from "drizzle-orm";
import { creditTransactionRepository } from "@/db/repositories";

export interface AddCreditsParams {
  userId: string;
  amount: number;
  type: "purchase" | "subscription_grant" | "refund" | "trial" | "bonus";
  creditType: "subscription" | "purchased" | "trial";
  description: string;
  stripePaymentIntentId?: string;
  expiresAt?: Date;
}

export interface DeductCreditsParams {
  userId: string;
  amount: number;
  type: "video_generation" | "ai_script" | "ai_title";
  description: string;
  relatedEntityId?: string;
  relatedEntityType?: string;
}

export const creditService = {
  /**
   * Get user's current credit balance
   */
  async getUserBalance(userId: string): Promise<number> {
    const result = await db.execute<{ credits: number }>(
      sql`SELECT credits FROM "user" WHERE id = ${userId}`
    );
    
    return result[0]?.credits || 0;
  },

  /**
   * Add credits to user account with transaction record
   */
  async addCredits(params: AddCreditsParams): Promise<number> {
    const { userId, amount, type, creditType, description, stripePaymentIntentId, expiresAt } = params;

    // Get current balance
    const currentBalance = await this.getUserBalance(userId);
    const newBalance = currentBalance + amount;

    // Update user balance using raw SQL
    await db.execute(
      sql`UPDATE "user" SET credits = ${newBalance} WHERE id = ${userId}`
    );

    // Create transaction record
    await creditTransactionRepository.create({
      userId,
      amount,
      type,
      creditType,
      description,
      stripePaymentIntentId,
      balanceAfter: newBalance,
      expiresAt,
    });

    return newBalance;
  },

  /**
   * Deduct credits from user account with validation
   */
  async deductCredits(params: DeductCreditsParams): Promise<number> {
    const { userId, amount, type, description, relatedEntityId, relatedEntityType } = params;

    // Get current balance
    const currentBalance = await this.getUserBalance(userId);

    // Check if user has enough credits
    if (currentBalance < amount) {
      throw new Error(`Insufficient credits. Required: ${amount}, Available: ${currentBalance}`);
    }

    const newBalance = currentBalance - amount;

    // Update user balance using raw SQL
    await db.execute(
      sql`UPDATE "user" SET credits = ${newBalance} WHERE id = ${userId}`
    );

    // Create transaction record (negative amount for deduction)
    await creditTransactionRepository.create({
      userId,
      amount: -amount,
      type,
      creditType: "purchased", // Deductions don't have a specific type
      description,
      relatedEntityId,
      relatedEntityType,
      balanceAfter: newBalance,
    });

    return newBalance;
  },

  /**
   * Check if user has enough credits
   */
  async hasEnoughCredits(userId: string, amount: number): Promise<boolean> {
    const balance = await this.getUserBalance(userId);
    return balance >= amount;
  },

  /**
   * Get user's transaction history
   */
  async getTransactionHistory(userId: string, limit = 50, offset = 0) {
    return creditTransactionRepository.findByUserId(userId, limit, offset);
  },

  /**
   * Grant monthly subscription credits
   */
  async grantSubscriptionCredits(userId: string, plan: string, periodEnd: Date): Promise<number> {
    const creditAllocations: Record<string, number> = {
      starter: 30,
      creator: 100,
      agency: 500,
    };

    const credits = creditAllocations[plan];
    if (!credits) {
      throw new Error(`Invalid plan: ${plan}`);
    }

    return this.addCredits({
      userId,
      amount: credits,
      type: "subscription_grant",
      creditType: "subscription",
      description: `Monthly credits for ${plan} plan`,
      expiresAt: periodEnd, // Credits expire at end of billing period
    });
  },

  /**
   * Expire subscription credits at end of billing period
   */
  async expireSubscriptionCredits(userId: string): Promise<void> {
    const now = new Date();
    
    // Get all expired subscription credits
    const transactions = await creditTransactionRepository.getActiveSubscriptionCredits(userId);
    
    let totalExpired = 0;
    for (const transaction of transactions) {
      if (transaction.expiresAt && transaction.expiresAt <= now && transaction.amount > 0) {
        totalExpired += transaction.amount;
      }
    }

    if (totalExpired > 0) {
      // Deduct expired credits
      const currentBalance = await this.getUserBalance(userId);
      const newBalance = Math.max(0, currentBalance - totalExpired);

      await db.execute(
        sql`UPDATE "user" SET credits = ${newBalance} WHERE id = ${userId}`
      );

      // Record expiration transaction
      await creditTransactionRepository.create({
        userId,
        amount: -totalExpired,
        type: "expiration",
        creditType: "subscription",
        description: `Expired subscription credits`,
        balanceAfter: newBalance,
      });
    }
  },

  /**
   * Calculate prorated credits for plan upgrade
   */
  calculateProratedCredits(
    oldPlan: string,
    newPlan: string,
    daysRemaining: number,
    daysInPeriod: number
  ): number {
    const creditAllocations: Record<string, number> = {
      starter: 30,
      creator: 100,
      agency: 500,
    };

    const oldCredits = creditAllocations[oldPlan] || 0;
    const newCredits = creditAllocations[newPlan] || 0;
    
    // Calculate prorated difference
    const creditDifference = newCredits - oldCredits;
    const proratedCredits = Math.round((creditDifference * daysRemaining) / daysInPeriod);
    
    return Math.max(0, proratedCredits);
  },
};

import { db } from "@/db/config";
import { creditTransaction } from "@/db/schema";
import { eq, desc, sum, and, gte } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

export interface CreateCreditTransactionData {
  userId: string;
  amount: number;
  type: string;
  creditType: string;
  description: string;
  stripePaymentIntentId?: string;
  relatedEntityId?: string;
  relatedEntityType?: string;
  balanceAfter: number;
  expiresAt?: Date;
}

export const creditTransactionRepository = {
  async create(data: CreateCreditTransactionData) {
    const [result] = await db
      .insert(creditTransaction)
      .values({
        id: uuidv4(),
        ...data,
      })
      .returning();
    return result;
  },

  async findByUserId(userId: string, limit = 50, offset = 0) {
    const results = await db
      .select()
      .from(creditTransaction)
      .where(eq(creditTransaction.userId, userId))
      .orderBy(desc(creditTransaction.createdAt))
      .limit(limit)
      .offset(offset);
    return results;
  },

  async getTotalCreditsAdded(userId: string) {
    const result = await db
      .select({ total: sum(creditTransaction.amount) })
      .from(creditTransaction)
      .where(
        and(
          eq(creditTransaction.userId, userId),
          gte(creditTransaction.amount, 0)
        )
      );
    return Number(result[0]?.total || 0);
  },

  async getTotalCreditsUsed(userId: string) {
    const result = await db
      .select({ total: sum(creditTransaction.amount) })
      .from(creditTransaction)
      .where(
        and(
          eq(creditTransaction.userId, userId),
          gte(creditTransaction.amount, 0)
        )
      );
    return Math.abs(Number(result[0]?.total || 0));
  },

  async getActiveSubscriptionCredits(userId: string) {
    const now = new Date();
    const results = await db
      .select()
      .from(creditTransaction)
      .where(
        and(
          eq(creditTransaction.userId, userId),
          eq(creditTransaction.creditType, "subscription"),
          gte(creditTransaction.expiresAt, now)
        )
      )
      .orderBy(creditTransaction.expiresAt);
    return results;
  },
};

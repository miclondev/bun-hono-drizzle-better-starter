import { db } from "@/db/config";
import { payment } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

export interface CreatePaymentData {
  userId: string;
  stripePaymentIntentId?: string;
  stripeCheckoutSessionId?: string;
  amount: number;
  currency?: string;
  status: string;
  type: string;
  creditsGranted?: number;
  metadata?: Record<string, unknown>;
}

export interface UpdatePaymentData {
  status?: string;
  creditsGranted?: number;
  metadata?: Record<string, unknown>;
}

export const paymentRepository = {
  async create(data: CreatePaymentData) {
    const [result] = await db
      .insert(payment)
      .values({
        id: uuidv4(),
        currency: "usd",
        ...data,
        updatedAt: new Date(),
      })
      .returning();
    return result;
  },

  async findByStripePaymentIntentId(intentId: string) {
    const [result] = await db
      .select()
      .from(payment)
      .where(eq(payment.stripePaymentIntentId, intentId));
    return result;
  },

  async findByStripeCheckoutSessionId(sessionId: string) {
    const [result] = await db
      .select()
      .from(payment)
      .where(eq(payment.stripeCheckoutSessionId, sessionId));
    return result;
  },

  async findByUserId(userId: string, limit = 50, offset = 0) {
    const results = await db
      .select()
      .from(payment)
      .where(eq(payment.userId, userId))
      .orderBy(desc(payment.createdAt))
      .limit(limit)
      .offset(offset);
    return results;
  },

  async update(id: string, data: UpdatePaymentData) {
    const [result] = await db
      .update(payment)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(payment.id, id))
      .returning();
    return result;
  },
};

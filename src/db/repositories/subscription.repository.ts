import { db } from "@/db/config";
import { subscription } from "@/db/schema";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

export interface CreateSubscriptionData {
  userId: string;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  stripePriceId?: string;
  plan: string;
  status: string;
  currentPeriodStart?: Date;
  currentPeriodEnd?: Date;
  trialEndsAt?: Date;
}

export interface UpdateSubscriptionData {
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  stripePriceId?: string;
  plan?: string;
  status?: string;
  currentPeriodStart?: Date;
  currentPeriodEnd?: Date;
  cancelAtPeriodEnd?: boolean;
  trialEndsAt?: Date;
}

export const subscriptionRepository = {
  async create(data: CreateSubscriptionData) {
    const [result] = await db
      .insert(subscription)
      .values({
        id: uuidv4(),
        ...data,
        updatedAt: new Date(),
      })
      .returning();
    return result;
  },

  async findByUserId(userId: string) {
    const [result] = await db
      .select()
      .from(subscription)
      .where(eq(subscription.userId, userId));
    return result;
  },

  async findByStripeCustomerId(customerId: string) {
    const [result] = await db
      .select()
      .from(subscription)
      .where(eq(subscription.stripeCustomerId, customerId));
    return result;
  },

  async findByStripeSubscriptionId(subscriptionId: string) {
    const [result] = await db
      .select()
      .from(subscription)
      .where(eq(subscription.stripeSubscriptionId, subscriptionId));
    return result;
  },

  async update(id: string, data: UpdateSubscriptionData) {
    const [result] = await db
      .update(subscription)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(subscription.id, id))
      .returning();
    return result;
  },

  async delete(id: string) {
    await db.delete(subscription).where(eq(subscription.id, id));
  },
};

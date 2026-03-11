import { boolean, integer, pgTable, text, timestamp, jsonb } from "drizzle-orm/pg-core";
import { user } from "./auth-schema";

export const subscription = pgTable("subscription", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  stripeCustomerId: text("stripe_customer_id").unique(),
  stripeSubscriptionId: text("stripe_subscription_id").unique(),
  stripePriceId: text("stripe_price_id"),
  plan: text("plan").notNull().default("none"), // 'none' | 'starter' | 'creator' | 'agency'
  status: text("status").notNull().default("inactive"), // 'active' | 'canceled' | 'past_due' | 'trialing' | 'incomplete' | 'inactive'
  currentPeriodStart: timestamp("current_period_start"),
  currentPeriodEnd: timestamp("current_period_end"),
  cancelAtPeriodEnd: boolean("cancel_at_period_end").notNull().default(false),
  trialEndsAt: timestamp("trial_ends_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const creditTransaction = pgTable("credit_transaction", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  amount: integer("amount").notNull(), // positive for additions, negative for deductions
  type: text("type").notNull(), // 'purchase' | 'subscription_grant' | 'video_generation' | 'ai_script' | 'ai_title' | 'refund' | 'trial' | 'expiration'
  creditType: text("credit_type").notNull().default("purchased"), // 'subscription' | 'purchased' | 'trial'
  description: text("description").notNull(),
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  relatedEntityId: text("related_entity_id"), // e.g., video ID for deductions
  relatedEntityType: text("related_entity_type"), // e.g., 'video', 'automation'
  balanceAfter: integer("balance_after").notNull(), // snapshot of balance after transaction
  expiresAt: timestamp("expires_at"), // for subscription credits
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const payment = pgTable("payment", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  stripePaymentIntentId: text("stripe_payment_intent_id").unique(),
  stripeCheckoutSessionId: text("stripe_checkout_session_id").unique(),
  amount: integer("amount").notNull(), // in cents
  currency: text("currency").notNull().default("usd"),
  status: text("status").notNull(), // 'succeeded' | 'pending' | 'failed' | 'refunded'
  type: text("type").notNull(), // 'subscription' | 'credit_purchase'
  creditsGranted: integer("credits_granted"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

import Stripe from "stripe";
import { subscriptionRepository, paymentRepository } from "@/db/repositories";
import { creditService } from "./credit.service";
import { logger } from "@/utils/logger";
import { sql } from "drizzle-orm";
import { db } from "@/db/config";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2026-02-25.clover",
});

export const stripeService = {
  /**
   * Create or get Stripe customer for user
   */
  async getOrCreateCustomer(userId: string, email: string, name?: string): Promise<string> {
    // Check if user already has a subscription with customer ID
    const existingSubscription = await subscriptionRepository.findByUserId(userId);
    
    if (existingSubscription?.stripeCustomerId) {
      return existingSubscription.stripeCustomerId;
    }

    // Create new Stripe customer
    const customer = await stripe.customers.create({
      email,
      name: name || undefined,
      metadata: { userId },
    });

    // Create subscription record with customer ID
    if (!existingSubscription) {
      await subscriptionRepository.create({
        userId,
        stripeCustomerId: customer.id,
        plan: "none",
        status: "inactive",
      });
    } else {
      await subscriptionRepository.update(existingSubscription.id, {
        stripeCustomerId: customer.id,
      });
    }

    return customer.id;
  },

  /**
   * Create Stripe checkout session for subscription or credit purchase
   */
  async createCheckoutSession(params: {
    userId: string;
    email: string;
    name?: string;
    priceId: string;
    mode: "subscription" | "payment";
    successUrl: string;
    cancelUrl: string;
    metadata?: Record<string, string>;
  }): Promise<string> {
    const { userId, email, name, priceId, mode, successUrl, cancelUrl, metadata } = params;

    const customerId = await this.getOrCreateCustomer(userId, email, name);

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        userId,
        ...metadata,
      },
      allow_promotion_codes: true,
      billing_address_collection: "auto",
    });

    return session.url!;
  },

  /**
   * Create customer portal session for managing subscriptions
   */
  async createPortalSession(userId: string, returnUrl: string): Promise<string> {
    const subscription = await subscriptionRepository.findByUserId(userId);
    
    if (!subscription?.stripeCustomerId) {
      throw new Error("No Stripe customer found for user");
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: subscription.stripeCustomerId,
      return_url: returnUrl,
    });

    return session.url;
  },

  /**
   * Cancel subscription
   */
  async cancelSubscription(userId: string, immediate = false): Promise<void> {
    const subscription = await subscriptionRepository.findByUserId(userId);
    
    if (!subscription?.stripeSubscriptionId) {
      throw new Error("No active subscription found");
    }

    if (immediate) {
      await stripe.subscriptions.cancel(subscription.stripeSubscriptionId);
    } else {
      await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
        cancel_at_period_end: true,
      });
    }
  },

  /**
   * Update subscription (upgrade/downgrade)
   */
  async updateSubscription(userId: string, newPriceId: string): Promise<void> {
    const subscription = await subscriptionRepository.findByUserId(userId);
    
    if (!subscription?.stripeSubscriptionId) {
      throw new Error("No active subscription found");
    }

    const stripeSubscription = await stripe.subscriptions.retrieve(subscription.stripeSubscriptionId);
    
    await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
      items: [
        {
          id: stripeSubscription.items.data[0].id,
          price: newPriceId,
        },
      ],
      proration_behavior: "create_prorations",
    });
  },

  /**
   * Construct webhook event from request
   */
  constructWebhookEvent(body: string, signature: string): Stripe.Event {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    
    if (!webhookSecret) {
      throw new Error("STRIPE_WEBHOOK_SECRET not configured");
    }

    return stripe.webhooks.constructEvent(body, signature, webhookSecret);
  },

  /**
   * Handle webhook events
   */
  async handleWebhookEvent(event: Stripe.Event): Promise<void> {
    logger.info(`Processing Stripe webhook: ${event.type}`);

    try {
      switch (event.type) {
        case "checkout.session.completed":
          await this.handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
          break;

        case "customer.subscription.created":
        case "customer.subscription.updated":
          await this.handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
          break;

        case "customer.subscription.deleted":
          await this.handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
          break;

        case "invoice.payment_succeeded":
          await this.handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice);
          break;

        case "invoice.payment_failed":
          await this.handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
          break;

        case "payment_intent.succeeded":
          await this.handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
          break;

        default:
          logger.info(`Unhandled webhook event type: ${event.type}`);
      }
    } catch (error) {
      logger.error(`Error processing webhook ${event.type}:`, error);
      throw error;
    }
  },

  /**
   * Handle checkout session completed
   */
  async handleCheckoutCompleted(session: Stripe.Checkout.Session): Promise<void> {
    const userId = session.metadata?.userId;
    if (!userId) {
      logger.error("No userId in checkout session metadata");
      return;
    }

    // Check if it's a subscription or one-time payment
    if (session.mode === "subscription") {
      // Subscription will be handled by subscription.created event
      logger.info(`Subscription checkout completed for user ${userId}`);
    } else if (session.mode === "payment") {
      // One-time credit purchase
      const paymentIntentId = session.payment_intent as string;
      logger.info(`Credit purchase checkout completed for user ${userId}, payment intent: ${paymentIntentId}`);
    }
  },

  /**
   * Handle subscription created/updated
   */
  async handleSubscriptionUpdated(stripeSubscription: Stripe.Subscription): Promise<void> {
    const customerId = stripeSubscription.customer as string;
    const subscription = await subscriptionRepository.findByStripeCustomerId(customerId);

    if (!subscription) {
      logger.error(`No subscription found for customer ${customerId}`);
      return;
    }

    // Determine plan from price ID
    const priceId = stripeSubscription.items.data[0]?.price.id;
    const plan = this.getPlanFromPriceId(priceId);

    // Update subscription record
    await subscriptionRepository.update(subscription.id, {
      stripeSubscriptionId: stripeSubscription.id,
      stripePriceId: priceId,
      plan,
      status: stripeSubscription.status,
      currentPeriodStart: new Date((stripeSubscription as any).current_period_start * 1000),
      currentPeriodEnd: new Date((stripeSubscription as any).current_period_end * 1000),
      cancelAtPeriodEnd: (stripeSubscription as any).cancel_at_period_end,
      trialEndsAt: (stripeSubscription as any).trial_end ? new Date((stripeSubscription as any).trial_end * 1000) : undefined,
    });

    // Update user's plan field
    await db.execute(
      sql`UPDATE "user" SET plan = ${plan} WHERE id = ${subscription.userId}`
    );

    logger.info(`Subscription updated for user ${subscription.userId}: ${plan} (${stripeSubscription.status})`);
  },

  /**
   * Handle subscription deleted
   */
  async handleSubscriptionDeleted(stripeSubscription: Stripe.Subscription): Promise<void> {
    const subscription = await subscriptionRepository.findByStripeSubscriptionId(stripeSubscription.id);

    if (!subscription) {
      logger.error(`No subscription found for Stripe subscription ${stripeSubscription.id}`);
      return;
    }

    // Update subscription status
    await subscriptionRepository.update(subscription.id, {
      status: "canceled",
      plan: "none",
    });

    // Update user's plan field
    await db.execute(
      sql`UPDATE "user" SET plan = ${"none"} WHERE id = ${subscription.userId}`
    );

    // Expire any remaining subscription credits
    await creditService.expireSubscriptionCredits(subscription.userId);

    logger.info(`Subscription canceled for user ${subscription.userId}`);
  },

  /**
   * Handle invoice payment succeeded (monthly billing)
   */
  async handleInvoicePaymentSucceeded(invoice: Stripe.Invoice): Promise<void> {
    const subscriptionId = (invoice as any).subscription as string;
    if (!subscriptionId) return;

    const subscription = await subscriptionRepository.findByStripeSubscriptionId(subscriptionId);
    if (!subscription) {
      logger.error(`No subscription found for Stripe subscription ${subscriptionId}`);
      return;
    }

    // Grant monthly credits
    const periodEnd = new Date(((invoice as any).period_end || invoice.created) * 1000);
    await creditService.grantSubscriptionCredits(subscription.userId, subscription.plan, periodEnd);

    logger.info(`Monthly credits granted for user ${subscription.userId}, plan: ${subscription.plan}`);
  },

  /**
   * Handle invoice payment failed
   */
  async handleInvoicePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
    const subscriptionId = (invoice as any).subscription as string;
    if (!subscriptionId) return;

    const subscription = await subscriptionRepository.findByStripeSubscriptionId(subscriptionId);
    if (!subscription) return;

    // Update subscription status to past_due
    await subscriptionRepository.update(subscription.id, {
      status: "past_due",
    });

    logger.warn(`Payment failed for user ${subscription.userId}, subscription ${subscriptionId}`);
  },

  /**
   * Handle payment intent succeeded (one-time credit purchase)
   */
  async handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    const userId = paymentIntent.metadata?.userId;
    const creditsStr = paymentIntent.metadata?.credits;

    if (!userId || !creditsStr) {
      logger.error("Missing userId or credits in payment intent metadata");
      return;
    }

    const credits = parseInt(creditsStr, 10);

    // Check if payment already processed
    const existingPayment = await paymentRepository.findByStripePaymentIntentId(paymentIntent.id);
    if (existingPayment) {
      logger.info(`Payment intent ${paymentIntent.id} already processed`);
      return;
    }

    // Create payment record
    await paymentRepository.create({
      userId,
      stripePaymentIntentId: paymentIntent.id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      status: "succeeded",
      type: "credit_purchase",
      creditsGranted: credits,
    });

    // Add credits to user account
    await creditService.addCredits({
      userId,
      amount: credits,
      type: "purchase",
      creditType: "purchased",
      description: `Purchased ${credits} credits`,
      stripePaymentIntentId: paymentIntent.id,
    });

    logger.info(`Credits granted for user ${userId}: ${credits} credits`);
  },

  /**
   * Get plan name from Stripe price ID
   */
  getPlanFromPriceId(priceId: string): string {
    const priceToPlan: Record<string, string> = {
      [process.env.STRIPE_PRICE_STARTER_MONTHLY || ""]: "starter",
      [process.env.STRIPE_PRICE_STARTER_YEARLY || ""]: "starter",
      [process.env.STRIPE_PRICE_CREATOR_MONTHLY || ""]: "creator",
      [process.env.STRIPE_PRICE_CREATOR_YEARLY || ""]: "creator",
      [process.env.STRIPE_PRICE_AGENCY_MONTHLY || ""]: "agency",
      [process.env.STRIPE_PRICE_AGENCY_YEARLY || ""]: "agency",
    };

    return priceToPlan[priceId] || "none";
  },
};

import { Context } from "hono";
import { stripeService } from "@/services/stripe.service";
import { subscriptionRepository } from "@/db/repositories";
import { logger } from "@/utils/logger";

export const subscriptionController = {
  /**
   * Get current user's subscription
   */
  async getSubscription(c: Context) {
    try {
      const userId = c.get("user")?.id;
      if (!userId) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const subscription = await subscriptionRepository.findByUserId(userId);
      
      if (!subscription) {
        return c.json({
          plan: "none",
          status: "inactive",
          hasActiveSubscription: false,
        });
      }

      return c.json({
        ...subscription,
        hasActiveSubscription: subscription.status === "active" || subscription.status === "trialing",
      });
    } catch (error) {
      logger.error("Error getting subscription:", error);
      return c.json({ error: "Failed to get subscription" }, 500);
    }
  },

  /**
   * Create checkout session for subscription
   */
  async createCheckout(c: Context) {
    try {
      const userId = c.get("user")?.id;
      const userEmail = c.get("user")?.email;
      const userName = c.get("user")?.name;

      if (!userId || !userEmail) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const body = await c.req.json();
      const { priceId, successUrl, cancelUrl } = body;

      if (!priceId || !successUrl || !cancelUrl) {
        return c.json({ error: "Missing required fields" }, 400);
      }

      const checkoutUrl = await stripeService.createCheckoutSession({
        userId,
        email: userEmail,
        name: userName,
        priceId,
        mode: "subscription",
        successUrl,
        cancelUrl,
      });

      return c.json({ url: checkoutUrl });
    } catch (error) {
      logger.error("Error creating checkout session:", error);
      return c.json({ error: "Failed to create checkout session" }, 500);
    }
  },

  /**
   * Create customer portal session
   */
  async createPortal(c: Context) {
    try {
      const userId = c.get("user")?.id;
      if (!userId) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const body = await c.req.json();
      const { returnUrl } = body;

      if (!returnUrl) {
        return c.json({ error: "Missing returnUrl" }, 400);
      }

      const portalUrl = await stripeService.createPortalSession(userId, returnUrl);

      return c.json({ url: portalUrl });
    } catch (error) {
      logger.error("Error creating portal session:", error);
      return c.json({ error: error instanceof Error ? error.message : "Failed to create portal session" }, 500);
    }
  },

  /**
   * Cancel subscription
   */
  async cancelSubscription(c: Context) {
    try {
      const userId = c.get("user")?.id;
      if (!userId) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const body = await c.req.json();
      const { immediate = false } = body;

      await stripeService.cancelSubscription(userId, immediate);

      return c.json({ 
        success: true,
        message: immediate ? "Subscription canceled immediately" : "Subscription will cancel at period end"
      });
    } catch (error) {
      logger.error("Error canceling subscription:", error);
      return c.json({ error: error instanceof Error ? error.message : "Failed to cancel subscription" }, 500);
    }
  },

  /**
   * Upgrade/change subscription plan
   */
  async upgradeSubscription(c: Context) {
    try {
      const userId = c.get("user")?.id;
      if (!userId) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const body = await c.req.json();
      const { newPriceId } = body;

      if (!newPriceId) {
        return c.json({ error: "Missing newPriceId" }, 400);
      }

      await stripeService.updateSubscription(userId, newPriceId);

      return c.json({ 
        success: true,
        message: "Subscription updated successfully"
      });
    } catch (error) {
      logger.error("Error upgrading subscription:", error);
      return c.json({ error: error instanceof Error ? error.message : "Failed to upgrade subscription" }, 500);
    }
  },
};

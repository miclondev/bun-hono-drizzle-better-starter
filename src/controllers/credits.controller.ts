import { Context } from "hono";
import { creditService } from "@/services/credit.service";
import { stripeService } from "@/services/stripe.service";
import { logger } from "@/utils/logger";

export const creditsController = {
  /**
   * Get user's credit balance
   */
  async getBalance(c: Context) {
    try {
      const userId = c.get("user")?.id;
      if (!userId) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const balance = await creditService.getUserBalance(userId);

      return c.json({ credits: balance });
    } catch (error) {
      logger.error("Error getting credit balance:", error);
      return c.json({ error: "Failed to get credit balance" }, 500);
    }
  },

  /**
   * Get user's credit transaction history
   */
  async getTransactions(c: Context) {
    try {
      const userId = c.get("user")?.id;
      if (!userId) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const limit = parseInt(c.req.query("limit") || "50", 10);
      const offset = parseInt(c.req.query("offset") || "0", 10);

      const transactions = await creditService.getTransactionHistory(userId, limit, offset);

      return c.json({ transactions });
    } catch (error) {
      logger.error("Error getting transaction history:", error);
      return c.json({ error: "Failed to get transaction history" }, 500);
    }
  },

  /**
   * Create checkout session for credit purchase
   */
  async purchaseCredits(c: Context) {
    try {
      const userId = c.get("user")?.id;
      const userEmail = c.get("user")?.email;
      const userName = c.get("user")?.name;

      if (!userId || !userEmail) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const body = await c.req.json();
      const { priceId, credits, successUrl, cancelUrl } = body;

      if (!priceId || !credits || !successUrl || !cancelUrl) {
        return c.json({ error: "Missing required fields" }, 400);
      }

      const checkoutUrl = await stripeService.createCheckoutSession({
        userId,
        email: userEmail,
        name: userName,
        priceId,
        mode: "payment",
        successUrl,
        cancelUrl,
        metadata: {
          credits: credits.toString(),
        },
      });

      return c.json({ url: checkoutUrl });
    } catch (error) {
      logger.error("Error creating credit purchase checkout:", error);
      return c.json({ error: "Failed to create checkout session" }, 500);
    }
  },
};

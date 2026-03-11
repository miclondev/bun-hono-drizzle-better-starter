import { Context } from "hono";
import { stripeService } from "@/services/stripe.service";
import { logger } from "@/utils/logger";

export const webhookController = {
  /**
   * Handle Stripe webhook events
   * This endpoint is PUBLIC and does not require authentication
   */
  async handleStripeWebhook(c: Context) {
    try {
      // Get raw body and signature
      const body = await c.req.text();
      const signature = c.req.header("stripe-signature");

      if (!signature) {
        logger.error("Missing stripe-signature header");
        return c.json({ error: "Missing signature" }, 400);
      }

      // Construct and verify webhook event
      const event = stripeService.constructWebhookEvent(body, signature);

      // Process webhook event asynchronously
      // Return 200 immediately to acknowledge receipt
      setImmediate(async () => {
        try {
          await stripeService.handleWebhookEvent(event);
        } catch (error) {
          logger.error("Error processing webhook event:", error);
        }
      });

      return c.json({ received: true });
    } catch (error) {
      logger.error("Webhook signature verification failed:", error);
      return c.json({ error: "Webhook signature verification failed" }, 400);
    }
  },
};

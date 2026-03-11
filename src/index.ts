import { initDatabase } from "@db/config";
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { secureHeaders } from "hono/secure-headers";
import { server } from "@/config";
import { allowedOrigins } from "@/config/cors";
import { standardLimiter } from "@/middleware/rate-limit";
import { requestLogger } from "@/middleware/request-logger";
import routes from "@/routes";
import { auth } from "@/utils/auth";
import { errorHandler, notFoundHandler } from "@/utils/error-handler";
import { logger } from "@/utils/logger";
import { webhookController } from "@/controllers/webhook.controller";

const app = new Hono();

// Security middleware
app.use("*", secureHeaders());
app.use(
  "*",
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

// Stripe webhook endpoint - MUST be before rate limiting and body parsing
// This endpoint is PUBLIC and does not require authentication
app.post("/api/webhooks/stripe", webhookController.handleStripeWebhook);

// Rate limiting
app.use("*", standardLimiter);

// Request logging
app.use("*", requestLogger);

// Better-auth routes - using official Hono integration pattern
app.on(["POST", "GET"], "/api/auth/*", (c) => {
  return auth.handler(c.req.raw);
});

// API routes
app.route("/api/v1", routes);

// Health check
app.get("/health", (c) => {
  return c.json({ status: "ok" });
});

// 404 handler
app.notFound(notFoundHandler);

// Error handler
app.onError(errorHandler);

// Start server
const startServer = async () => {
  try {
    await initDatabase();

    const port = server.port;

    serve({
      fetch: app.fetch,
      port,
    });

    logger.info(`Server running on port ${port}`);
  } catch (error) {
    logger.error("Failed to start server:", error);
    process.exit(1);
  }
};

// Handle unhandled rejections
process.on("unhandledRejection", (reason, promise) => {
  logger.error("Unhandled Rejection at:", { promise, reason });
});

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  logger.error("Uncaught Exception:", error);
  process.exit(1);
});

startServer();

export default app;

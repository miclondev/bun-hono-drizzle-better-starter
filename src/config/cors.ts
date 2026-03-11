/**
 * CORS Configuration
 * Centralized allowed origins for CORS and authentication
 */

/**
 * Allowed origins for CORS and better-auth
 * Add your production frontend URL to process.env.FRONTEND_URL
 */
export const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:8080", // Frontend dev server
  process.env.FRONTEND_URL || "",
].filter(Boolean);

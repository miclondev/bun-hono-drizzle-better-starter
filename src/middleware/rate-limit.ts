import type { Context, Next } from "hono";

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

export interface RateLimitOptions {
  windowMs?: number;
  max?: number;
}

export const rateLimiter = (options: RateLimitOptions = {}) => {
  const windowMs = options.windowMs || 60000; // 1 minute default
  const max = options.max || 100; // 100 requests per window default

  return async (c: Context, next: Next) => {
    const ip = c.req.header("x-forwarded-for") || c.req.header("x-real-ip") || "unknown";
    const key = `${ip}`;
    const now = Date.now();

    // Clean up old entries periodically
    if (Math.random() < 0.01) {
      Object.keys(store).forEach((k) => {
        if (store[k].resetTime < now) {
          delete store[k];
        }
      });
    }

    if (!store[key] || store[key].resetTime < now) {
      store[key] = {
        count: 1,
        resetTime: now + windowMs,
      };
    } else {
      store[key].count++;
    }

    const remaining = Math.max(0, max - store[key].count);
    const resetTime = Math.ceil((store[key].resetTime - now) / 1000);

    c.header("X-RateLimit-Limit", max.toString());
    c.header("X-RateLimit-Remaining", remaining.toString());
    c.header("X-RateLimit-Reset", resetTime.toString());

    if (store[key].count > max) {
      return c.json(
        {
          message: "Too many requests, please try again later.",
        },
        429
      );
    }

    await next();
  };
};

export const standardLimiter = rateLimiter({
  windowMs: 60000, // 1 minute
  max: 100,
});

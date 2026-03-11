import type { Context, Next } from "hono";
import { logger } from "@/utils/logger";

export const requestLogger = async (c: Context, next: Next) => {
  const start = Date.now();
  const method = c.req.method;
  const path = c.req.path;

  await next();

  const duration = Date.now() - start;
  const status = c.res.status;

  logger.info(`${method} ${path}`, {
    method,
    path,
    status,
    duration: `${duration}ms`,
  });
};

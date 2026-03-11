import type { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import { logger } from "@/utils/logger";

export const errorHandler = (err: Error, c: Context) => {
  logger.error("Error occurred:", {
    error: err.message,
    stack: err.stack,
    path: c.req.path,
    method: c.req.method,
  });

  if (err instanceof HTTPException) {
    return c.json(
      {
        message: err.message,
      },
      err.status
    );
  }

  return c.json(
    {
      message: "Internal server error",
    },
    500
  );
};

export const notFoundHandler = (c: Context) => {
  return c.json(
    {
      message: "Route not found",
    },
    404
  );
};

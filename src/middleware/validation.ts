import type { Context, Next } from "hono";
import type Joi from "joi";

export const validate = (schema: Joi.ObjectSchema) => {
  return async (c: Context, next: Next) => {
    const body = await c.req.json();
    const { error, value } = schema.validate(body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errorMessage = error.details.map((detail) => detail.message).join(", ");
      return c.json({ message: errorMessage }, 400);
    }

    // Store validated and stripped body in context
    c.set("validatedBody", value);
    await next();
  };
};

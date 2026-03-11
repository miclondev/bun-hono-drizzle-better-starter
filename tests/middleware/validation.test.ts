import { describe, expect, test } from "bun:test";
import { validate } from "@middleware/validation";
import { Hono } from "hono";
import Joi from "joi";

// Define Variables type for Hono context
type Variables = {
  validatedBody: any;
};

describe("Validation Middleware", () => {
  const testSchema = Joi.object({
    title: Joi.string().required().min(3).max(100),
    description: Joi.string().required().min(1),
    completed: Joi.boolean().optional(),
  });

  test("should pass validation with valid data", async () => {
    const app = new Hono<{ Variables: Variables }>();

    app.post("/test", validate(testSchema), (c) => {
      const body = c.get("validatedBody");
      return c.json({ success: true, body });
    });

    const validData = {
      title: "Valid Title",
      description: "Valid description",
    };

    const res = await app.request("/test", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(validData),
    });

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.body.title).toBe(validData.title);
  });

  test("should fail validation with missing required field", async () => {
    const app = new Hono<{ Variables: Variables }>();

    app.post("/test", validate(testSchema), (c) => {
      return c.json({ success: true });
    });

    const invalidData = {
      description: "Missing title",
    };

    const res = await app.request("/test", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(invalidData),
    });

    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.message).toContain("title");
    expect(json.message).toContain("required");
  });

  test("should fail validation with invalid data type", async () => {
    const app = new Hono<{ Variables: Variables }>();

    app.post("/test", validate(testSchema), (c) => {
      return c.json({ success: true });
    });

    const invalidData = {
      title: "Valid Title",
      description: "Valid description",
      completed: "not-a-boolean", // Should be boolean
    };

    const res = await app.request("/test", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(invalidData),
    });

    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.message).toContain("completed");
  });

  test("should fail validation with string too short", async () => {
    const app = new Hono<{ Variables: Variables }>();

    app.post("/test", validate(testSchema), (c) => {
      return c.json({ success: true });
    });

    const invalidData = {
      title: "AB", // Too short (min 3)
      description: "Valid description",
    };

    const res = await app.request("/test", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(invalidData),
    });

    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.message).toContain("title");
    expect(json.message).toContain("3");
  });

  test("should strip unknown fields", async () => {
    const app = new Hono<{ Variables: Variables }>();

    app.post("/test", validate(testSchema), (c) => {
      const body = c.get("validatedBody");
      return c.json({ body });
    });

    const dataWithExtra = {
      title: "Valid Title",
      description: "Valid description",
      extraField: "Should be stripped",
    };

    const res = await app.request("/test", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dataWithExtra),
    });

    expect(res.status).toBe(200);
    const json = await res.json();
    // Joi's stripUnknown removes extra fields from validated data
    expect(json.body.title).toBe("Valid Title");
    expect(json.body.description).toBe("Valid description");
    // The extra field should not be present in validated body
    expect(json.body).not.toHaveProperty("extraField");
  });

  test("should store validated body in context", async () => {
    const app = new Hono<{ Variables: Variables }>();

    app.post("/test", validate(testSchema), (c) => {
      const validatedBody = c.get("validatedBody");
      expect(validatedBody).toBeDefined();
      expect(validatedBody.title).toBe("Test Title");
      return c.json({ success: true });
    });

    const res = await app.request("/test", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: "Test Title",
        description: "Test description",
      }),
    });

    expect(res.status).toBe(200);
  });

  test("should return all validation errors", async () => {
    const app = new Hono<{ Variables: Variables }>();

    app.post("/test", validate(testSchema), (c) => {
      return c.json({ success: true });
    });

    const invalidData = {
      title: "AB", // Too short
      // Missing description
    };

    const res = await app.request("/test", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(invalidData),
    });

    expect(res.status).toBe(400);
    const json = await res.json();
    // Should contain errors for both title and description
    expect(json.message).toContain("title");
    expect(json.message).toContain("description");
  });
});

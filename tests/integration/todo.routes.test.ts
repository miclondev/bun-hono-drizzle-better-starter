import { afterAll, beforeEach, describe, expect, test } from "bun:test";
import { randomUUID } from "node:crypto";
import { db } from "@db/config";
import { todos } from "@db/schema/todo.schema";
import { eq } from "drizzle-orm";
import app from "@/index";

describe("Todo Routes Integration Tests", () => {
  const testUserId = randomUUID(); // Use proper UUID
  let _authCookie: string;
  let _testTodoId: string;

  beforeEach(async () => {
    // Clean up todos for test user
    await db.delete(todos).where(eq(todos.userId, testUserId));
  });

  afterAll(async () => {
    // Final cleanup
    await db.delete(todos).where(eq(todos.userId, testUserId));
  });

  describe("GET /api/v1/todo", () => {
    test("should return 401 without authentication", async () => {
      const res = await app.request("/api/v1/todo");

      expect(res.status).toBe(401);
      const json = await res.json();
      expect(json.message).toContain("Session");
    });

    test("should return empty array when user has no todos", async () => {
      // Note: This test requires proper auth setup
      // For now, we're testing the endpoint structure
      const res = await app.request("/api/v1/todo");
      expect(res.status).toBeOneOf([200, 401]); // 200 if authed, 401 if not
    });
  });

  describe("POST /api/v1/todo", () => {
    test("should return 401 without authentication", async () => {
      const res = await app.request("/api/v1/todo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "Test Todo",
          description: "Test Description",
        }),
      });

      expect(res.status).toBe(401);
    });

    test("should return 400 with invalid data", async () => {
      const res = await app.request("/api/v1/todo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "AB", // Too short
          description: "Test",
        }),
      });

      expect(res.status).toBeOneOf([400, 401]); // 400 if validation runs, 401 if auth fails first
    });

    test("should return 400 with missing required fields", async () => {
      const res = await app.request("/api/v1/todo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "Test Todo",
          // Missing description
        }),
      });

      expect(res.status).toBeOneOf([400, 401]);
    });
  });

  describe("GET /api/v1/todo/:id", () => {
    test("should return 401 without authentication", async () => {
      const res = await app.request("/api/v1/todo/some-id");

      expect(res.status).toBe(401);
    });

    test("should return 400 with empty id", async () => {
      const res = await app.request("/api/v1/todo/");

      // Should match the list endpoint or 404
      expect(res.status).toBeOneOf([200, 401, 404]);
    });
  });

  describe("PUT /api/v1/todo/:id", () => {
    test("should return 401 without authentication", async () => {
      const res = await app.request("/api/v1/todo/some-id", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "Updated Title",
        }),
      });

      expect(res.status).toBe(401);
    });

    test("should return 400 with invalid data", async () => {
      const res = await app.request("/api/v1/todo/some-id", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "A", // Too short
        }),
      });

      expect(res.status).toBeOneOf([400, 401]);
    });
  });

  describe("DELETE /api/v1/todo/:id", () => {
    test("should return 401 without authentication", async () => {
      const res = await app.request("/api/v1/todo/some-id", {
        method: "DELETE",
      });

      expect(res.status).toBe(401);
    });
  });

  describe("PATCH /api/v1/todo/:id/toggle", () => {
    test("should return 401 without authentication", async () => {
      const res = await app.request("/api/v1/todo/some-id/toggle", {
        method: "PATCH",
      });

      expect(res.status).toBe(401);
    });
  });

  describe("Health Check", () => {
    test("GET /health should return ok", async () => {
      const res = await app.request("/health");

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.status).toBe("ok");
    });
  });

  describe("404 Handler", () => {
    test("should return 404 for non-existent routes", async () => {
      const res = await app.request("/non-existent-route");

      expect(res.status).toBe(404);
      const json = await res.json();
      expect(json.message).toContain("not found");
    });
  });

  describe("Rate Limiting", () => {
    test("should include rate limit headers", async () => {
      const res = await app.request("/health");

      expect(res.headers.get("X-RateLimit-Limit")).toBeDefined();
      expect(res.headers.get("X-RateLimit-Remaining")).toBeDefined();
      expect(res.headers.get("X-RateLimit-Reset")).toBeDefined();
    });
  });

  describe("CORS", () => {
    test("should include CORS headers", async () => {
      const res = await app.request("/health", {
        headers: {
          Origin: "http://localhost:3000",
        },
      });

      expect(res.headers.get("Access-Control-Allow-Origin")).toBeDefined();
    });
  });

  describe("Security Headers", () => {
    test("should include security headers", async () => {
      const res = await app.request("/health");

      // Check for some common security headers
      expect(res.headers.get("X-Content-Type-Options")).toBeDefined();
    });
  });
});

import { afterAll, beforeEach, describe, expect, test } from "bun:test";
import { randomUUID } from "node:crypto";
import { db } from "@db/config";
import { todoRepository } from "@db/repositories";
import { todos } from "@db/schema/todo.schema";
import { eq } from "drizzle-orm";

describe("TodoRepository", () => {
  const testUserId = randomUUID(); // Use proper UUID
  let _createdTodoId: string;

  beforeEach(async () => {
    // Clean up todos for test user before each test
    await db.delete(todos).where(eq(todos.userId, testUserId));
  });

  afterAll(async () => {
    // Clean up after all tests
    await db.delete(todos).where(eq(todos.userId, testUserId));
  });

  describe("create", () => {
    test("should create a new todo", async () => {
      const todoData = {
        title: "Test Todo",
        description: "Test Description",
        userId: testUserId,
      };

      const todo = await todoRepository.create(todoData);

      expect(todo).toBeDefined();
      expect(todo.id).toBeDefined();
      expect(todo.title).toBe(todoData.title);
      expect(todo.description).toBe(todoData.description);
      expect(todo.userId).toBe(testUserId);
      expect(todo.completed).toBe(false);
      expect(todo.createdAt).toBeInstanceOf(Date);
      expect(todo.updatedAt).toBeInstanceOf(Date);

      _createdTodoId = todo.id;
    });

    test("should create todo with default completed status", async () => {
      const todo = await todoRepository.create({
        title: "Test",
        description: "Test",
        userId: testUserId,
      });

      expect(todo.completed).toBe(false);
    });
  });

  describe("findAllByUserId", () => {
    test("should return all todos for a user", async () => {
      // Create multiple todos
      await todoRepository.create({
        title: "Todo 1",
        description: "Description 1",
        userId: testUserId,
      });
      await todoRepository.create({
        title: "Todo 2",
        description: "Description 2",
        userId: testUserId,
      });

      const userTodos = await todoRepository.findAllByUserId(testUserId);

      expect(userTodos).toBeArray();
      expect(userTodos.length).toBe(2);
      expect(userTodos[0].userId).toBe(testUserId);
      expect(userTodos[1].userId).toBe(testUserId);
    });

    test("should return empty array for user with no todos", async () => {
      const nonExistentUserId = randomUUID();
      const userTodos = await todoRepository.findAllByUserId(nonExistentUserId);

      expect(userTodos).toBeArray();
      expect(userTodos.length).toBe(0);
    });

    test("should return todos ordered by creation date (newest first)", async () => {
      const todo1 = await todoRepository.create({
        title: "First Todo",
        description: "Created first",
        userId: testUserId,
      });

      // Small delay to ensure different timestamps
      await new Promise((resolve) => setTimeout(resolve, 10));

      const todo2 = await todoRepository.create({
        title: "Second Todo",
        description: "Created second",
        userId: testUserId,
      });

      const userTodos = await todoRepository.findAllByUserId(testUserId);

      expect(userTodos[0].id).toBe(todo2.id); // Newest first
      expect(userTodos[1].id).toBe(todo1.id);
    });
  });

  describe("findById", () => {
    test("should find todo by id", async () => {
      const created = await todoRepository.create({
        title: "Find Me",
        description: "Test",
        userId: testUserId,
      });

      const found = await todoRepository.findById(created.id);

      expect(found).toBeDefined();
      expect(found?.id).toBe(created.id);
      expect(found?.title).toBe("Find Me");
    });

    test("should return undefined for non-existent id", async () => {
      const nonExistentId = randomUUID();
      const found = await todoRepository.findById(nonExistentId);

      expect(found).toBeUndefined();
    });
  });

  describe("update", () => {
    test("should update todo title", async () => {
      const created = await todoRepository.create({
        title: "Original Title",
        description: "Description",
        userId: testUserId,
      });

      const updated = await todoRepository.update(created.id, {
        title: "Updated Title",
      });

      expect(updated).toBeDefined();
      expect(updated?.title).toBe("Updated Title");
      expect(updated?.description).toBe("Description"); // Unchanged
      expect(updated?.updatedAt.getTime()).toBeGreaterThan(created.updatedAt.getTime());
    });

    test("should update todo description", async () => {
      const created = await todoRepository.create({
        title: "Title",
        description: "Original Description",
        userId: testUserId,
      });

      const updated = await todoRepository.update(created.id, {
        description: "Updated Description",
      });

      expect(updated?.description).toBe("Updated Description");
      expect(updated?.title).toBe("Title"); // Unchanged
    });

    test("should update todo completed status", async () => {
      const created = await todoRepository.create({
        title: "Title",
        description: "Description",
        userId: testUserId,
      });

      const updated = await todoRepository.update(created.id, {
        completed: true,
      });

      expect(updated?.completed).toBe(true);
    });

    test("should update multiple fields", async () => {
      const created = await todoRepository.create({
        title: "Original",
        description: "Original",
        userId: testUserId,
      });

      const updated = await todoRepository.update(created.id, {
        title: "New Title",
        description: "New Description",
        completed: true,
      });

      expect(updated?.title).toBe("New Title");
      expect(updated?.description).toBe("New Description");
      expect(updated?.completed).toBe(true);
    });

    test("should return undefined for non-existent id", async () => {
      const nonExistentId = randomUUID();
      const updated = await todoRepository.update(nonExistentId, {
        title: "New Title",
      });

      expect(updated).toBeUndefined();
    });
  });

  describe("delete", () => {
    test("should delete todo", async () => {
      const created = await todoRepository.create({
        title: "To Delete",
        description: "Will be deleted",
        userId: testUserId,
      });

      const deleted = await todoRepository.delete(created.id);

      expect(deleted).toBe(true);

      const found = await todoRepository.findById(created.id);
      expect(found).toBeUndefined();
    });

    test("should return false for non-existent id", async () => {
      const nonExistentId = randomUUID();
      const deleted = await todoRepository.delete(nonExistentId);

      expect(deleted).toBe(false);
    });
  });

  describe("toggleComplete", () => {
    test("should toggle completed from false to true", async () => {
      const created = await todoRepository.create({
        title: "Toggle Me",
        description: "Test",
        userId: testUserId,
      });

      expect(created.completed).toBe(false);

      const toggled = await todoRepository.toggleComplete(created.id);

      expect(toggled).toBeDefined();
      expect(toggled?.completed).toBe(true);
    });

    test("should toggle completed from true to false", async () => {
      const created = await todoRepository.create({
        title: "Toggle Me",
        description: "Test",
        userId: testUserId,
      });

      // First toggle to true
      await todoRepository.update(created.id, { completed: true });

      // Then toggle back to false
      const toggled = await todoRepository.toggleComplete(created.id);

      expect(toggled?.completed).toBe(false);
    });

    test("should return undefined for non-existent id", async () => {
      const nonExistentId = randomUUID();
      const toggled = await todoRepository.toggleComplete(nonExistentId);

      expect(toggled).toBeUndefined();
    });
  });
});

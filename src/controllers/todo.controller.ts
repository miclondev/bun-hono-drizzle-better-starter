import { todoRepository } from "@db/repositories";
import type { InsertTodo, UpdateTodo } from "@db/schema/todo.schema";
import type { Context } from "hono";
import type { AuthUser } from "@/middleware/auth";

export const TodoController = {
  /**
   * Get all todos for the authenticated user
   */
  async getAllTodos(c: Context) {
    try {
      const user = c.get("user") as AuthUser | undefined;
      if (!user) {
        return c.json({ message: "Unauthorized" }, 401);
      }

      const todos = await todoRepository.findAllByUserId(user.id);
      return c.json(todos, 200);
    } catch (error) {
      console.error("Error fetching todos:", error);
      return c.json({ message: "Internal server error" }, 500);
    }
  },

  /**
   * Get a todo by ID
   */
  async getTodoById(c: Context) {
    try {
      const id = c.req.param("id");
      if (!id) {
        return c.json({ message: "Todo ID is required" }, 400);
      }

      const user = c.get("user") as AuthUser | undefined;

      if (!user) {
        return c.json({ message: "Unauthorized" }, 401);
      }

      const todo = await todoRepository.findById(id);

      if (!todo) {
        return c.json({ message: "Todo not found" }, 404);
      }

      if (todo.userId !== user.id) {
        return c.json({ message: "Forbidden" }, 403);
      }

      return c.json(todo, 200);
    } catch (error) {
      console.error("Error fetching todo:", error);
      return c.json({ message: "Internal server error" }, 500);
    }
  },

  /**
   * Create a new todo
   */
  async createTodo(c: Context) {
    try {
      const user = c.get("user") as AuthUser | undefined;
      if (!user) {
        return c.json({ message: "Unauthorized" }, 401);
      }

      // Get validated body from validation middleware
      const body = c.get("validatedBody") || (await c.req.json());
      const { title, description } = body;

      const todoData: InsertTodo = {
        title,
        description,
        userId: user.id,
      };

      const newTodo = await todoRepository.create(todoData);
      return c.json(newTodo, 201);
    } catch (error) {
      console.error("Error creating todo:", error);
      return c.json({ message: "Internal server error" }, 500);
    }
  },

  /**
   * Update a todo
   */
  async updateTodo(c: Context) {
    try {
      const id = c.req.param("id");
      if (!id) {
        return c.json({ message: "Todo ID is required" }, 400);
      }

      const user = c.get("user") as AuthUser | undefined;

      if (!user) {
        return c.json({ message: "Unauthorized" }, 401);
      }

      const todo = await todoRepository.findById(id);

      if (!todo) {
        return c.json({ message: "Todo not found" }, 404);
      }

      if (todo.userId !== user.id) {
        return c.json({ message: "Forbidden" }, 403);
      }

      // Get validated body from validation middleware
      const body = c.get("validatedBody") || (await c.req.json());
      const { title, description, completed } = body;
      const updateData: UpdateTodo = {};

      if (title !== undefined) updateData.title = title;
      if (description !== undefined) updateData.description = description;
      if (completed !== undefined) updateData.completed = completed;

      const updatedTodo = await todoRepository.update(id, updateData);
      return c.json(updatedTodo, 200);
    } catch (error) {
      console.error("Error updating todo:", error);
      return c.json({ message: "Internal server error" }, 500);
    }
  },

  /**
   * Delete a todo
   */
  async deleteTodo(c: Context) {
    try {
      const id = c.req.param("id");
      if (!id) {
        return c.json({ message: "Todo ID is required" }, 400);
      }

      const user = c.get("user") as AuthUser | undefined;

      if (!user) {
        return c.json({ message: "Unauthorized" }, 401);
      }

      const todo = await todoRepository.findById(id);

      if (!todo) {
        return c.json({ message: "Todo not found" }, 404);
      }

      if (todo.userId !== user.id) {
        return c.json({ message: "Forbidden" }, 403);
      }

      await todoRepository.delete(id);
      return c.body(null, 204);
    } catch (error) {
      console.error("Error deleting todo:", error);
      return c.json({ message: "Internal server error" }, 500);
    }
  },

  /**
   * Toggle todo completion status
   */
  async toggleTodoComplete(c: Context) {
    try {
      const id = c.req.param("id");
      if (!id) {
        return c.json({ message: "Todo ID is required" }, 400);
      }

      const user = c.get("user") as AuthUser | undefined;

      if (!user) {
        return c.json({ message: "Unauthorized" }, 401);
      }

      const todo = await todoRepository.findById(id);

      if (!todo) {
        return c.json({ message: "Todo not found" }, 404);
      }

      if (todo.userId !== user.id) {
        return c.json({ message: "Forbidden" }, 403);
      }

      const updatedTodo = await todoRepository.toggleComplete(id);
      return c.json(updatedTodo, 200);
    } catch (error) {
      console.error("Error toggling todo completion:", error);
      return c.json({ message: "Internal server error" }, 500);
    }
  },
};

import { TodoController } from "@controllers/todo.controller";
import { verifyToken } from "@middleware/auth";
import { validate } from "@middleware/validation";
import { createTodoSchema, updateTodoSchema } from "@validation/todo.schema";
import { Hono } from "hono";

const todoRoutes = new Hono();

// Apply authentication middleware to all todo routes
todoRoutes.use("/*", verifyToken);

// Get all todos for the authenticated user
todoRoutes.get("/", TodoController.getAllTodos);

// Get a specific todo by ID
todoRoutes.get("/:id", TodoController.getTodoById);

// Create a new todo - with validation
todoRoutes.post("/", validate(createTodoSchema), TodoController.createTodo);

// Update a todo - with validation
todoRoutes.put("/:id", validate(updateTodoSchema), TodoController.updateTodo);

// Delete a todo
todoRoutes.delete("/:id", TodoController.deleteTodo);

// Toggle todo completion status
todoRoutes.patch("/:id/toggle", TodoController.toggleTodoComplete);

export default todoRoutes;

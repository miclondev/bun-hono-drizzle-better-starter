import { desc, eq } from "drizzle-orm";
import { db } from "../config";
import { type InsertTodo, type Todo, todos, type UpdateTodo } from "../schema/todo.schema";

export class TodoRepository {
  /**
   * Create a new todo
   */
  async create(todo: InsertTodo): Promise<Todo> {
    const [createdTodo] = await db.insert(todos).values(todo).returning();
    return createdTodo;
  }

  /**
   * Get all todos for a specific user
   */
  async findAllByUserId(userId: string): Promise<Todo[]> {
    return db.select().from(todos).where(eq(todos.userId, userId)).orderBy(desc(todos.createdAt));
  }

  /**
   * Get a todo by id
   */
  async findById(id: string): Promise<Todo | undefined> {
    const [todo] = await db.select().from(todos).where(eq(todos.id, id));
    return todo;
  }

  /**
   * Update a todo
   */
  async update(id: string, data: UpdateTodo): Promise<Todo | undefined> {
    const [updatedTodo] = await db
      .update(todos)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(todos.id, id))
      .returning();
    return updatedTodo;
  }

  /**
   * Delete a todo
   */
  async delete(id: string): Promise<boolean> {
    const [deletedTodo] = await db.delete(todos).where(eq(todos.id, id)).returning();
    return !!deletedTodo;
  }

  /**
   * Toggle todo completion status
   */
  async toggleComplete(id: string): Promise<Todo | undefined> {
    const todo = await this.findById(id);
    if (!todo) return undefined;

    return this.update(id, { completed: !todo.completed });
  }
}

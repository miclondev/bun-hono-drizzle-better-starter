# Database Guide

## Overview

This application uses **PostgreSQL** as the database with **Drizzle ORM** for type-safe database operations.

## Database Schema

### Tables

#### 1. user
Stores user account information (managed by better-auth).

```sql
CREATE TABLE "user" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL UNIQUE,
  "emailVerified" BOOLEAN NOT NULL DEFAULT false,
  "image" TEXT,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "role" TEXT,
  "banned" BOOLEAN,
  "banReason" TEXT,
  "banExpires" TIMESTAMP
);
```

**Indexes:**
- Primary key on `id`
- Unique index on `email`

---

#### 2. session
Stores user sessions (managed by better-auth).

```sql
CREATE TABLE "session" (
  "id" TEXT PRIMARY KEY,
  "expiresAt" TIMESTAMP NOT NULL,
  "token" TEXT NOT NULL UNIQUE,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "ipAddress" TEXT,
  "userAgent" TEXT,
  "userId" TEXT NOT NULL REFERENCES "user"("id") ON DELETE CASCADE
);
```

**Indexes:**
- Primary key on `id`
- Unique index on `token`
- Foreign key on `userId` → `user.id`

---

#### 3. account
Stores OAuth provider accounts (managed by better-auth).

```sql
CREATE TABLE "account" (
  "id" TEXT PRIMARY KEY,
  "accountId" TEXT NOT NULL,
  "providerId" TEXT NOT NULL,
  "userId" TEXT NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "accessToken" TEXT,
  "refreshToken" TEXT,
  "idToken" TEXT,
  "accessTokenExpiresAt" TIMESTAMP,
  "refreshTokenExpiresAt" TIMESTAMP,
  "scope" TEXT,
  "password" TEXT,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);
```

**Indexes:**
- Primary key on `id`
- Foreign key on `userId` → `user.id`

---

#### 4. verification
Stores email verification tokens (managed by better-auth).

```sql
CREATE TABLE "verification" (
  "id" TEXT PRIMARY KEY,
  "identifier" TEXT NOT NULL,
  "value" TEXT NOT NULL,
  "expiresAt" TIMESTAMP NOT NULL,
  "createdAt" TIMESTAMP,
  "updatedAt" TIMESTAMP
);
```

**Indexes:**
- Primary key on `id`

---

#### 5. todos
Stores user todos (application-specific).

```sql
CREATE TABLE "todos" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "title" VARCHAR(255) NOT NULL,
  "description" TEXT NOT NULL,
  "completed" BOOLEAN DEFAULT false,
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "user_id" UUID NOT NULL
);
```

**Indexes:**
- Primary key on `id`
- Index on `user_id` (for efficient user queries)

**Note:** No foreign key constraint to `user.id` because better-auth uses TEXT for user IDs while todos uses UUID. In production, you might want to align these types.

---

## Schema Definitions

### Location
`src/db/schema/`

### Auth Schema (`auth-schema.ts`)

```typescript
import { boolean, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("emailVerified").notNull().default(false),
  image: text("image"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
  role: text("role"),
  banned: boolean("banned"),
  banReason: text("banReason"),
  banExpires: timestamp("banExpires"),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expiresAt").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
  ipAddress: text("ipAddress"),
  userAgent: text("userAgent"),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

// ... account and verification tables
```

### Todo Schema (`todo.schema.ts`)

```typescript
import { boolean, pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { uuid } from "./utils";

export const todos = pgTable("todos", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  completed: boolean("completed").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  userId: uuid("user_id").notNull(),
});

// Type inference
export type Todo = typeof todos.$inferSelect;
export type InsertTodo = typeof todos.$inferInsert;
export type UpdateTodo = Partial<InsertTodo>;
```

---

## Database Connection

### Configuration (`src/db/config.ts`)

```typescript
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";

// Connection string
const connectionString = `postgres://${database.user}:${database.password}@${database.host}:${database.port}/${database.name}`;

// Query client with connection pooling
export const queryClient = postgres(connectionString, {
  max: 10,                    // Max connections
  idle_timeout: 30,           // Idle timeout (seconds)
  connect_timeout: 10,        // Connect timeout (seconds)
});

// Drizzle instance
export const db = drizzle(queryClient);
```

### Connection Pool

**Default Settings:**
- Max connections: 10
- Idle timeout: 30 seconds
- Connect timeout: 10 seconds

**Production Recommendations:**
- Increase max connections based on load
- Monitor connection usage
- Consider read replicas for scaling

---

## Repository Pattern

### TodoRepository (`src/db/repositories/todo.repository.ts`)

```typescript
import { db } from "../config";
import { todos, Todo, InsertTodo, UpdateTodo } from "../schema/todo.schema";
import { eq, desc } from "drizzle-orm";

export class TodoRepository {
  async create(todo: InsertTodo): Promise<Todo> {
    const [createdTodo] = await db
      .insert(todos)
      .values(todo)
      .returning();
    return createdTodo;
  }

  async findAllByUserId(userId: string): Promise<Todo[]> {
    return db
      .select()
      .from(todos)
      .where(eq(todos.userId, userId))
      .orderBy(desc(todos.createdAt));
  }

  async findById(id: string): Promise<Todo | undefined> {
    const [todo] = await db
      .select()
      .from(todos)
      .where(eq(todos.id, id));
    return todo;
  }

  async update(id: string, data: UpdateTodo): Promise<Todo | undefined> {
    const [updatedTodo] = await db
      .update(todos)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(todos.id, id))
      .returning();
    return updatedTodo;
  }

  async delete(id: string): Promise<boolean> {
    const [deletedTodo] = await db
      .delete(todos)
      .where(eq(todos.id, id))
      .returning();
    return !!deletedTodo;
  }

  async toggleComplete(id: string): Promise<Todo | undefined> {
    const todo = await this.findById(id);
    if (!todo) return undefined;
    return this.update(id, { completed: !todo.completed });
  }
}

export const todoRepository = new TodoRepository();
```

---

## Drizzle ORM Operations

### Select Queries

```typescript
// Select all
const todos = await db.select().from(todos);

// Select with where
const userTodos = await db
  .select()
  .from(todos)
  .where(eq(todos.userId, userId));

// Select specific columns
const titles = await db
  .select({ title: todos.title })
  .from(todos);

// Select with joins
const todosWithUsers = await db
  .select()
  .from(todos)
  .leftJoin(user, eq(todos.userId, user.id));
```

### Insert Queries

```typescript
// Insert single
const [newTodo] = await db
  .insert(todos)
  .values({ title: "New", description: "Todo", userId: "123" })
  .returning();

// Insert multiple
const newTodos = await db
  .insert(todos)
  .values([
    { title: "Todo 1", description: "First", userId: "123" },
    { title: "Todo 2", description: "Second", userId: "123" },
  ])
  .returning();
```

### Update Queries

```typescript
// Update with where
const [updated] = await db
  .update(todos)
  .set({ completed: true, updatedAt: new Date() })
  .where(eq(todos.id, todoId))
  .returning();

// Update multiple
await db
  .update(todos)
  .set({ completed: false })
  .where(eq(todos.userId, userId));
```

### Delete Queries

```typescript
// Delete with where
const [deleted] = await db
  .delete(todos)
  .where(eq(todos.id, todoId))
  .returning();

// Delete all for user
await db
  .delete(todos)
  .where(eq(todos.userId, userId));
```

### Operators

```typescript
import { eq, ne, gt, gte, lt, lte, like, and, or, desc, asc } from "drizzle-orm";

// Comparison
where(eq(todos.id, id))
where(ne(todos.completed, true))
where(gt(todos.createdAt, date))

// Logical
where(and(
  eq(todos.userId, userId),
  eq(todos.completed, false)
))

where(or(
  eq(todos.completed, true),
  like(todos.title, "%urgent%")
))

// Ordering
orderBy(desc(todos.createdAt))
orderBy(asc(todos.title))
```

---

## Migrations

### Generate Migration

```bash
bun run db:generate
```

This creates migration files in `src/db/migrations/` based on schema changes.

### Run Migrations

```bash
bun run db:migrate
```

Applies pending migrations to the database.

### Push Schema (Development)

```bash
bun run db:push
```

Directly pushes schema changes without creating migration files. **Use in development only.**

---

## Drizzle Studio

Visual database browser.

```bash
bun run db:studio
```

Opens at `https://local.drizzle.studio`

**Features:**
- Browse tables
- View data
- Edit records
- Run queries
- View relationships

---

## Database Management

### Create Database

```bash
# Using script
bun run setup:db

# Or manually
psql -U postgres -c "CREATE DATABASE todos;"
```

### Drop Database

```bash
psql -U postgres -c "DROP DATABASE todos;"
```

### Reset Database

```bash
# Drop and recreate
psql -U postgres -c "DROP DATABASE todos;"
psql -U postgres -c "CREATE DATABASE todos;"
bun run db:push
```

### Backup Database

```bash
pg_dump -U postgres todos > backup.sql
```

### Restore Database

```bash
psql -U postgres todos < backup.sql
```

---

## Performance Optimization

### Indexes

Add indexes for frequently queried columns:

```typescript
export const todos = pgTable("todos", {
  // ... columns
}, (table) => ({
  userIdIdx: index("user_id_idx").on(table.userId),
  completedIdx: index("completed_idx").on(table.completed),
}));
```

### Query Optimization

```typescript
// Bad: N+1 query problem
for (const todo of todos) {
  const user = await db.select().from(user).where(eq(user.id, todo.userId));
}

// Good: Join query
const todosWithUsers = await db
  .select()
  .from(todos)
  .leftJoin(user, eq(todos.userId, user.id));
```

### Connection Pooling

Already configured in `src/db/config.ts`:
- Reuses connections
- Prevents connection exhaustion
- Automatic cleanup of idle connections

---

## Transactions

```typescript
await db.transaction(async (tx) => {
  const [todo] = await tx
    .insert(todos)
    .values({ title: "New", description: "Todo", userId: "123" })
    .returning();
    
  await tx
    .insert(activityLog)
    .values({ action: "created_todo", todoId: todo.id });
});
```

**Benefits:**
- Atomic operations
- Rollback on error
- Data consistency

---

## Type Safety

### Inferred Types

```typescript
// From schema
type Todo = typeof todos.$inferSelect;
type InsertTodo = typeof todos.$inferInsert;

// Usage
const createTodo = async (data: InsertTodo): Promise<Todo> => {
  const [todo] = await db.insert(todos).values(data).returning();
  return todo;
};
```

### Custom Types

```typescript
type UpdateTodo = Partial<InsertTodo>;
type TodoWithUser = Todo & { user: User };
```

---

## Best Practices

### 1. Use Repositories
Encapsulate database logic in repository classes.

### 2. Type Safety
Always use inferred types from schemas.

### 3. Transactions
Use transactions for multi-step operations.

### 4. Indexes
Add indexes for frequently queried columns.

### 5. Connection Pooling
Let postgres.js manage the connection pool.

### 6. Migrations
Use migrations in production, push in development.

### 7. Validation
Validate data before database operations.

### 8. Error Handling
Handle database errors gracefully.

---

## Common Queries

### Get User's Incomplete Todos

```typescript
const incompleteTodos = await db
  .select()
  .from(todos)
  .where(and(
    eq(todos.userId, userId),
    eq(todos.completed, false)
  ))
  .orderBy(desc(todos.createdAt));
```

### Search Todos by Title

```typescript
const searchResults = await db
  .select()
  .from(todos)
  .where(and(
    eq(todos.userId, userId),
    like(todos.title, `%${searchTerm}%`)
  ));
```

### Count User's Todos

```typescript
import { count } from "drizzle-orm";

const [result] = await db
  .select({ count: count() })
  .from(todos)
  .where(eq(todos.userId, userId));
```

### Get Recent Todos

```typescript
const recentTodos = await db
  .select()
  .from(todos)
  .where(eq(todos.userId, userId))
  .orderBy(desc(todos.createdAt))
  .limit(10);
```

---

## Troubleshooting

### Connection Issues

**Error:** `database "todos" does not exist`
```bash
bun run setup:db
```

**Error:** `password authentication failed`
- Check `.env` credentials
- Verify PostgreSQL user exists

### Schema Issues

**Error:** `relation "todos" does not exist`
```bash
bun run db:push
```

**Error:** `column "new_column" does not exist`
- Update schema
- Run `bun run db:push` or `bun run db:migrate`

### Performance Issues

- Add indexes on frequently queried columns
- Use `EXPLAIN ANALYZE` to analyze queries
- Monitor connection pool usage
- Consider read replicas for heavy read loads

---

## Environment Variables

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=todos
DB_USER=postgres
DB_PASSWORD=postgres

# Optional: Full connection string
DATABASE_URL=postgres://user:password@host:port/database

# Connection Pool
DB_POOL_MIN=2
DB_POOL_MAX=10
DB_IDLE_TIMEOUT=30
DB_CONNECT_TIMEOUT=10
```

---

## Next Steps

- Add more tables for your features
- Create repositories for new entities
- Add indexes for performance
- Set up database backups
- Monitor query performance

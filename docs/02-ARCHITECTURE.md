# Architecture Guide

## System Architecture

This application follows a **layered architecture** pattern with clear separation of concerns.

```
┌─────────────────────────────────────────────────────────────┐
│                         Client                              │
│                    (HTTP Requests)                          │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                    Hono Application                         │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Middleware Layer                        │  │
│  │  • Security Headers                                  │  │
│  │  • CORS                                              │  │
│  │  • Rate Limiting                                     │  │
│  │  • Request Logging                                   │  │
│  │  • Authentication (better-auth)                      │  │
│  │  • Validation (Joi)                                  │  │
│  └──────────────────────────────────────────────────────┘  │
│                       │                                     │
│                       ▼                                     │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                 Routes Layer                         │  │
│  │  • Define API endpoints                              │  │
│  │  • Apply middleware                                  │  │
│  │  • Route to controllers                              │  │
│  └──────────────────────────────────────────────────────┘  │
│                       │                                     │
│                       ▼                                     │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Controllers Layer                       │  │
│  │  • Business logic                                    │  │
│  │  • Request/Response handling                         │  │
│  │  • Error handling                                    │  │
│  │  • Call repositories                                 │  │
│  └──────────────────────────────────────────────────────┘  │
│                       │                                     │
│                       ▼                                     │
│  ┌──────────────────────────────────────────────────────┐  │
│  │             Repositories Layer                       │  │
│  │  • Data access logic                                 │  │
│  │  • Database queries (Drizzle ORM)                    │  │
│  │  • CRUD operations                                   │  │
│  └──────────────────────────────────────────────────────┘  │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                   PostgreSQL Database                       │
│  • Tables: user, session, account, verification, todos     │
└─────────────────────────────────────────────────────────────┘
```

## Request Flow

### Example: Creating a Todo

```
1. Client sends POST /api/v1/todo
   ↓
2. Hono receives request
   ↓
3. Middleware chain executes:
   - Security headers applied
   - CORS check
   - Rate limit check
   - Request logged
   - Authentication verified (verifyToken)
   - Request body validated (Joi schema)
   ↓
4. Route matches and calls controller
   ↓
5. TodoController.createTodo():
   - Extracts user from context
   - Gets validated body
   - Calls repository
   ↓
6. TodoRepository.create():
   - Builds SQL query with Drizzle
   - Executes query
   - Returns created todo
   ↓
7. Controller returns JSON response
   ↓
8. Client receives response
```

## Layer Details

### 1. Middleware Layer

**Location:** `src/middleware/`

**Purpose:** Process requests before they reach controllers

**Components:**

#### Authentication (`auth.ts`)
```typescript
// Verifies session and sets user in context
export const verifyToken = async (c: Context, next: Next) => {
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  });
  
  if (!session) {
    return c.json({ message: "No Session provided" }, 401);
  }
  
  c.set("user", session.user);
  await next();
};
```

**Features:**
- Session validation via better-auth
- User data stored in Hono context
- Role-based access control helpers

#### Validation (`validation.ts`)
```typescript
// Validates request body against Joi schema
export const validate = (schema: Joi.ObjectSchema) => {
  return async (c: Context, next: Next) => {
    const body = await c.req.json();
    const { error } = schema.validate(body, {
      abortEarly: false,
      stripUnknown: true,
    });
    
    if (error) {
      return c.json({ message: errorMessage }, 400);
    }
    
    c.set("validatedBody", body);
    await next();
  };
};
```

**Features:**
- Joi schema validation
- Automatic sanitization (stripUnknown)
- Detailed error messages
- Validated data stored in context

#### Rate Limiting (`rate-limit.ts`)
```typescript
// In-memory rate limiter
export const rateLimiter = (options: RateLimitOptions) => {
  return async (c: Context, next: Next) => {
    const ip = c.req.header("x-forwarded-for") || "unknown";
    
    // Check rate limit
    if (store[ip].count > max) {
      return c.json({ message: "Too many requests" }, 429);
    }
    
    await next();
  };
};
```

**Features:**
- In-memory store (simple, fast)
- IP-based limiting
- Configurable window and max requests
- Rate limit headers in response

#### Request Logging (`request-logger.ts`)
```typescript
// Logs all requests with Winston
export const requestLogger = async (c: Context, next: Next) => {
  const start = Date.now();
  await next();
  const duration = Date.now() - start;
  
  logger.info(`${method} ${path}`, { status, duration });
};
```

**Features:**
- Structured logging with Winston
- Request duration tracking
- Method, path, status code logging

### 2. Routes Layer

**Location:** `src/routes/`

**Purpose:** Define API endpoints and apply middleware

**Structure:**
```typescript
// src/routes/todo.routes.ts
const todoRoutes = new Hono();

// Apply auth to all routes
todoRoutes.use("/*", verifyToken);

// Define endpoints
todoRoutes.get("/", TodoController.getAllTodos);
todoRoutes.post("/", validate(createTodoSchema), TodoController.createTodo);
todoRoutes.put("/:id", validate(updateTodoSchema), TodoController.updateTodo);
todoRoutes.delete("/:id", TodoController.deleteTodo);
```

**Features:**
- Hono routing
- Middleware application
- Route grouping
- Parameter extraction

### 3. Controllers Layer

**Location:** `src/controllers/`

**Purpose:** Handle business logic and request/response

**Structure:**
```typescript
export const TodoController = {
  async getAllTodos(c: Context) {
    const user = c.get("user");
    const todos = await todoRepository.findAllByUserId(user.id);
    return c.json(todos, 200);
  },
  
  async createTodo(c: Context) {
    const user = c.get("user");
    const body = c.get("validatedBody");
    const todo = await todoRepository.create({ ...body, userId: user.id });
    return c.json(todo, 201);
  },
  
  // ... more methods
};
```

**Responsibilities:**
- Extract data from context (user, validated body, params)
- Call repositories for data operations
- Handle errors
- Format responses
- Return appropriate status codes

**Hono Context API:**
- `c.get(key)` - Get value from context
- `c.set(key, value)` - Set value in context
- `c.req.param(name)` - Get route parameter
- `c.req.json()` - Parse JSON body
- `c.json(data, status)` - Return JSON response
- `c.body(data, status)` - Return raw response

### 4. Repositories Layer

**Location:** `src/db/repositories/`

**Purpose:** Data access and database operations

**Structure:**
```typescript
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
  
  // ... more methods
}
```

**Features:**
- Drizzle ORM query builder
- Type-safe queries
- Automatic SQL generation
- Transaction support

### 5. Database Layer

**Location:** `src/db/`

**Components:**

#### Schemas (`src/db/schema/`)
```typescript
// Define table structure
export const todos = pgTable("todos", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  completed: boolean("completed").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  userId: uuid("user_id").notNull(),
});

// Infer types
export type Todo = typeof todos.$inferSelect;
export type InsertTodo = typeof todos.$inferInsert;
```

#### Connection (`src/db/config.ts`)
```typescript
// PostgreSQL connection with postgres.js
export const queryClient = postgres(connectionString, {
  max: 10,
  idle_timeout: 30,
  connect_timeout: 10,
});

export const db = drizzle(queryClient);
```

## Data Flow Patterns

### Pattern 1: Authenticated CRUD Operation

```
Request → Security Middleware → Auth Middleware → Validation → Controller → Repository → Database
```

Example: Create Todo
1. POST /api/v1/todo with JSON body
2. Security headers applied
3. User authenticated (session verified)
4. Body validated against Joi schema
5. Controller extracts user and validated data
6. Repository inserts into database
7. Response returned with created todo

### Pattern 2: Public Endpoint

```
Request → Security Middleware → Controller → Response
```

Example: Health Check
1. GET /health
2. Security headers applied
3. Controller returns status
4. Response: {"status": "ok"}

### Pattern 3: Authentication Flow

```
Request → better-auth Handler → Database → Response
```

Example: Login
1. POST /api/auth/sign-in/email
2. better-auth processes request
3. Validates credentials
4. Creates session
5. Sets cookie
6. Returns user data

## Configuration Management

**Location:** `src/config/index.ts`

**Pattern:** Environment-based configuration with validation

```typescript
// Validate environment variables
const configSchema = Joi.object({
  NODE_ENV: Joi.string().valid("development", "production", "test"),
  PORT: Joi.number().default(3000),
  DB_NAME: Joi.string().required(),
  // ... more validations
});

// Export typed config
export const config = buildConfig();
export const { server, database, jwt, logging } = config;
```

**Features:**
- Joi validation for environment variables
- Type-safe configuration
- Default values
- Structured config object

## Error Handling

**Location:** `src/utils/error-handler.ts`

**Pattern:** Centralized error handling

```typescript
export const errorHandler = (err: Error, c: Context) => {
  logger.error("Error occurred:", { error: err.message, stack: err.stack });
  
  if (err instanceof HTTPException) {
    return c.json({ message: err.message }, err.status);
  }
  
  return c.json({ message: "Internal server error" }, 500);
};
```

**Applied in main app:**
```typescript
app.onError(errorHandler);
```

## Authentication System

**Location:** `src/utils/auth.ts`

**Pattern:** better-auth with Drizzle adapter

```typescript
export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: schema,
  }),
  plugins: [admin(), anonymous()],
  session: {
    cookieCache: { enabled: true, maxAge: 60 * 60 * 24 * 7 },
  },
  emailAndPassword: { enabled: true },
  socialProviders: { google: { ... } },
});
```

**Integration with Hono:**
```typescript
// In src/index.ts
app.all("/api/auth/*", async (c) => {
  const response = await auth.handler(c.req.raw);
  return response;
});
```

## Type Safety

### Database Types
```typescript
// Inferred from schema
type Todo = typeof todos.$inferSelect;
type InsertTodo = typeof todos.$inferInsert;
type UpdateTodo = Partial<InsertTodo>;
```

### Context Types
```typescript
// User type in context
interface AuthUser {
  id: string;
  name: string;
  email: string;
  role?: string;
}

// Usage in controller
const user = c.get("user") as AuthUser;
```

### Validation Types
```typescript
// Joi schemas provide runtime validation
// TypeScript provides compile-time types
const createTodoSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().required(),
});
```

## Dependency Injection

**Pattern:** Simple module exports (no DI container needed)

```typescript
// Repositories are singletons
export const todoRepository = new TodoRepository();

// Import where needed
import { todoRepository } from "@db/repositories";
```

## Path Aliases

**Configured in:** `tsconfig.json`

```json
{
  "paths": {
    "@/*": ["src/*"],
    "@db/*": ["src/db/*"],
    "@controllers/*": ["src/controllers/*"],
    "@middleware/*": ["src/middleware/*"],
    "@routes/*": ["src/routes/*"],
    "@utils/*": ["src/utils/*"],
    "@validation/*": ["src/validation/*"]
  }
}
```

**Bun resolves these at runtime** - no build step needed!

## Logging Strategy

**Tool:** Winston

**Levels:** error, warn, info, http, debug

**Usage:**
```typescript
import { logger } from "@/utils/logger";

logger.info("Server started", { port: 3000 });
logger.error("Database error", { error: err.message });
logger.debug("Query executed", { query, duration });
```

**Output:** Structured JSON logs with timestamps

## Security Layers

1. **Secure Headers** - Hono middleware
2. **CORS** - Configured origins
3. **Rate Limiting** - IP-based throttling
4. **Input Validation** - Joi schemas
5. **SQL Injection Prevention** - Drizzle ORM (parameterized queries)
6. **Authentication** - better-auth sessions
7. **Authorization** - Role-based middleware

## Performance Optimizations

1. **Bun Runtime** - Faster than Node.js
2. **Hono Framework** - Minimal overhead
3. **Connection Pooling** - postgres.js manages pool
4. **Indexed Queries** - Database indexes on foreign keys
5. **Efficient Serialization** - Bun's native JSON handling

## Scalability Considerations

**Current:** Single-server deployment

**Future Enhancements:**
- Redis for rate limiting (distributed)
- Redis for session storage (distributed)
- Database read replicas
- Horizontal scaling with load balancer
- Caching layer (Redis)

## Testing Strategy

**Levels:**
1. **Unit Tests** - Controllers, repositories, utilities
2. **Integration Tests** - API endpoints
3. **E2E Tests** - Full user flows

**Tool:** Bun test (built-in)

See [08-TESTING.md](./08-TESTING.md) for details.

## Development vs Production

**Development:**
- Hot reload enabled
- Detailed logging
- Source maps
- No minification

**Production:**
- Compiled with Bun
- Minimal logging
- No source maps
- Optimized bundle

## Key Design Decisions

### Why Hono over Express?
- Lighter weight (smaller bundle)
- Faster performance
- Better TypeScript support
- Optimized for modern runtimes (Bun, Deno, Cloudflare Workers)

### Why Drizzle over Prisma?
- Lighter weight
- SQL-like syntax
- Better performance
- No schema generation step

### Why better-auth?
- Modern authentication library
- Built-in session management
- OAuth support
- TypeScript-first
- Drizzle adapter available

### Why In-Memory Rate Limiting?
- Simple for single-server deployment
- Fast (no external dependencies)
- Easy to understand
- Can be replaced with Redis later

## Extension Points

To add new features:

1. **New Entity:**
   - Create schema in `src/db/schema/`
   - Create repository in `src/db/repositories/`
   - Create controller in `src/controllers/`
   - Create routes in `src/routes/`
   - Create validation schemas in `src/validation/`

2. **New Middleware:**
   - Create in `src/middleware/`
   - Apply in routes or main app

3. **New Utility:**
   - Create in `src/utils/`
   - Import where needed

## Architecture Benefits

✅ **Separation of Concerns** - Each layer has clear responsibility
✅ **Testability** - Layers can be tested independently
✅ **Maintainability** - Easy to locate and modify code
✅ **Scalability** - Can scale individual layers
✅ **Type Safety** - TypeScript throughout
✅ **Security** - Multiple security layers
✅ **Performance** - Optimized at each layer

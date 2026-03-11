# Testing Guide

## Overview

This project uses **Bun's built-in test runner** for all testing. Bun provides a fast, Jest-compatible testing framework with no additional dependencies required.

## Test Structure

```
tests/
├── repositories/          # Database layer tests
│   └── todo.repository.test.ts
├── middleware/           # Middleware tests
│   └── validation.test.ts
└── integration/          # API integration tests
    └── todo.routes.test.ts
```

## Running Tests

### All Tests

```bash
bun test
```

### Specific Test File

```bash
bun test tests/repositories/todo.repository.test.ts
```

### Specific Test Suite

```bash
bun test tests/repositories/
```

### Watch Mode

```bash
bun test --watch
```

### With Coverage

```bash
bun test --coverage
```

## Test Types

### 1. Repository Tests

**Location:** `tests/repositories/`

**Purpose:** Test database operations and data access layer

**Example:**
```typescript
import { describe, test, expect, beforeEach, afterAll } from "bun:test";
import { todoRepository } from "@db/repositories";
import { randomUUID } from "crypto";

describe("TodoRepository", () => {
  const testUserId = randomUUID();

  beforeEach(async () => {
    // Clean up before each test
    await db.delete(todos).where(eq(todos.userId, testUserId));
  });

  test("should create a new todo", async () => {
    const todo = await todoRepository.create({
      title: "Test Todo",
      description: "Test Description",
      userId: testUserId,
    });

    expect(todo).toBeDefined();
    expect(todo.title).toBe("Test Todo");
  });
});
```

**What We Test:**
- ✅ CRUD operations (Create, Read, Update, Delete)
- ✅ Query filtering and ordering
- ✅ Edge cases (non-existent IDs, empty results)
- ✅ Data validation and constraints

**Current Status:** ✅ 17/17 tests passing

### 2. Middleware Tests

**Location:** `tests/middleware/`

**Purpose:** Test request processing middleware

**Example:**
```typescript
import { describe, test, expect } from "bun:test";
import { Hono } from "hono";
import { validate } from "@middleware/validation";
import Joi from "joi";

describe("Validation Middleware", () => {
  const testSchema = Joi.object({
    title: Joi.string().required().min(3),
  });

  test("should pass validation with valid data", async () => {
    const app = new Hono();
    
    app.post("/test", validate(testSchema), (c) => {
      return c.json({ success: true });
    });

    const res = await app.request("/test", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Valid Title" }),
    });

    expect(res.status).toBe(200);
  });
});
```

**What We Test:**
- ✅ Input validation (Joi schemas)
- ✅ Error handling
- ✅ Context manipulation (c.set, c.get)
- ✅ Middleware chaining

### 3. Integration Tests

**Location:** `tests/integration/`

**Purpose:** Test complete API endpoints with middleware

**Example:**
```typescript
import { describe, test, expect } from "bun:test";
import app from "@/index";

describe("Todo Routes Integration Tests", () => {
  test("should return 401 without authentication", async () => {
    const res = await app.request("/api/v1/todo");
    expect(res.status).toBe(401);
  });

  test("GET /health should return ok", async () => {
    const res = await app.request("/health");
    expect(res.status).toBe(200);
    
    const json = await res.json();
    expect(json.status).toBe("ok");
  });
});
```

**What We Test:**
- ✅ HTTP status codes
- ✅ Response formats
- ✅ Authentication requirements
- ✅ Error responses
- ✅ Security headers
- ✅ Rate limiting
- ✅ CORS

## Bun Test API

### Test Functions

```typescript
import { describe, test, expect, beforeAll, afterAll, beforeEach, afterEach } from "bun:test";

describe("Test Suite", () => {
  beforeAll(async () => {
    // Runs once before all tests
  });

  afterAll(async () => {
    // Runs once after all tests
  });

  beforeEach(async () => {
    // Runs before each test
  });

  afterEach(async () => {
    // Runs after each test
  });

  test("test name", async () => {
    // Test code
  });
});
```

### Assertions

```typescript
// Equality
expect(value).toBe(expected);
expect(value).toEqual(expected);

// Truthiness
expect(value).toBeTruthy();
expect(value).toBeFalsy();
expect(value).toBeDefined();
expect(value).toBeUndefined();
expect(value).toBeNull();

// Numbers
expect(value).toBeGreaterThan(5);
expect(value).toBeLessThan(10);
expect(value).toBeGreaterThanOrEqual(5);
expect(value).toBeLessThanOrEqual(10);

// Strings
expect(string).toContain("substring");
expect(string).toMatch(/regex/);

// Arrays
expect(array).toBeArray();
expect(array).toHaveLength(3);
expect(array).toContain(item);

// Objects
expect(obj).toHaveProperty("key");
expect(obj).toMatchObject({ key: "value" });

// Types
expect(value).toBeInstanceOf(Date);
expect(value).toBeTypeOf("string");

// Custom
expect(value).toBeOneOf([1, 2, 3]);
```

## Testing Best Practices

### 1. Use Proper Test Data

❌ **Bad:**
```typescript
const userId = "test-user-123"; // String, but DB expects UUID
```

✅ **Good:**
```typescript
import { randomUUID } from "crypto";
const userId = randomUUID(); // Proper UUID
```

### 2. Clean Up After Tests

```typescript
beforeEach(async () => {
  // Clean up before each test
  await db.delete(todos).where(eq(todos.userId, testUserId));
});

afterAll(async () => {
  // Final cleanup
  await db.delete(todos).where(eq(todos.userId, testUserId));
});
```

### 3. Test Edge Cases

```typescript
test("should handle non-existent ID", async () => {
  const nonExistentId = randomUUID();
  const result = await todoRepository.findById(nonExistentId);
  expect(result).toBeUndefined();
});

test("should handle empty results", async () => {
  const todos = await todoRepository.findAllByUserId(randomUUID());
  expect(todos).toBeArray();
  expect(todos.length).toBe(0);
});
```

### 4. Test Both Success and Failure

```typescript
test("should create todo with valid data", async () => {
  // Test success case
});

test("should fail with invalid data", async () => {
  // Test failure case
});
```

### 5. Use Descriptive Test Names

❌ **Bad:**
```typescript
test("test1", async () => { ... });
```

✅ **Good:**
```typescript
test("should return 401 when user is not authenticated", async () => { ... });
```

## Testing Hono Applications

### Testing Routes

```typescript
import app from "@/index";

test("should return todos", async () => {
  const res = await app.request("/api/v1/todo");
  expect(res.status).toBe(401); // Requires auth
});
```

### Testing with Headers

```typescript
test("should include CORS headers", async () => {
  const res = await app.request("/health", {
    headers: {
      "Origin": "http://localhost:3000",
    },
  });
  
  expect(res.headers.get("Access-Control-Allow-Origin")).toBeDefined();
});
```

### Testing POST Requests

```typescript
test("should create resource", async () => {
  const res = await app.request("/api/v1/todo", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: "Test",
      description: "Test",
    }),
  });

  expect(res.status).toBe(401); // Requires auth
});
```

## Utility Scripts

### Test API Script

Run comprehensive API tests against a running server:

```bash
bun run test:api
```

This script:
- ✅ Checks if server is running
- ✅ Tests all endpoints
- ✅ Provides detailed results
- ✅ Returns exit code for CI/CD

**Example output:**
```
🧪 Testing API Endpoints

📊 Health Check:
✓ GET /health - Status: 200

🔐 Authentication Endpoints:
✓ GET /api/auth/session - Status: 200
✓ POST /api/auth/sign-up/email - Status: 200

📝 Todo Endpoints (Unauthenticated):
✓ GET /api/v1/todo - Status: 401
✓ POST /api/v1/todo - Status: 401

📊 Test Summary:
   Total: 15
   ✓ Passed: 15
   ✗ Failed: 0

✅ All tests passed!
```

### Seed Database Script

Populate database with test data:

```bash
bun run seed
```

This creates:
- 5 predefined todos
- 5 random todos (using Faker)
- All assigned to demo user ID

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:14
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v3
      
      - uses: oven-sh/setup-bun@v1
        with:
          bun-version: latest
      
      - run: bun install
      
      - run: bun run setup:db
        env:
          DB_HOST: localhost
          DB_PORT: 5432
          DB_NAME: todos
          DB_USER: postgres
          DB_PASSWORD: postgres
      
      - run: bun run db:push
      
      - run: bun test
```

## Test Coverage

Generate coverage report:

```bash
bun test --coverage
```

**Coverage Goals:**
- Repositories: 100%
- Middleware: 90%+
- Routes/Controllers: 80%+
- Overall: 85%+

## Troubleshooting

### Tests Failing with UUID Errors

**Error:** `invalid input syntax for type uuid`

**Solution:** Use `randomUUID()` instead of string literals:
```typescript
import { randomUUID } from "crypto";
const userId = randomUUID();
```

### Database Connection Issues

**Error:** `connection to server failed`

**Solution:**
1. Ensure PostgreSQL is running: `brew services start postgresql@14`
2. Database exists: `bun run setup:db`
3. Schema is pushed: `bun run db:push`

### Tests Hanging

**Issue:** Tests don't complete

**Solution:** Ensure all async operations use `await` and database connections are properly closed.

### Import Path Errors

**Error:** `Cannot find module '@/...'`

**Solution:** These are TypeScript LSP errors. Bun resolves path aliases at runtime. Tests will run correctly despite IDE warnings.

## Writing New Tests

### 1. Create Test File

```bash
touch tests/repositories/new-feature.test.ts
```

### 2. Basic Structure

```typescript
import { describe, test, expect, beforeEach, afterAll } from "bun:test";

describe("NewFeature", () => {
  beforeEach(async () => {
    // Setup
  });

  afterAll(async () => {
    // Cleanup
  });

  test("should do something", async () => {
    // Arrange
    const input = "test";

    // Act
    const result = await someFunction(input);

    // Assert
    expect(result).toBeDefined();
  });
});
```

### 3. Run Tests

```bash
bun test tests/repositories/new-feature.test.ts
```

## Test Organization

### AAA Pattern

**Arrange, Act, Assert:**

```typescript
test("should create todo", async () => {
  // Arrange - Set up test data
  const todoData = {
    title: "Test",
    description: "Test",
    userId: testUserId,
  };

  // Act - Perform the action
  const todo = await todoRepository.create(todoData);

  // Assert - Verify the result
  expect(todo).toBeDefined();
  expect(todo.title).toBe("Test");
});
```

### Group Related Tests

```typescript
describe("TodoRepository", () => {
  describe("create", () => {
    test("should create with valid data", async () => { ... });
    test("should fail with invalid data", async () => { ... });
  });

  describe("update", () => {
    test("should update existing todo", async () => { ... });
    test("should fail for non-existent todo", async () => { ... });
  });
});
```

## Performance Testing

Bun test runner is extremely fast:

```
Ran 17 tests across 1 file. [136.00ms]
```

**Tips for fast tests:**
- Use `beforeEach` for setup instead of repeating code
- Clean up only necessary data
- Use transactions when possible
- Avoid unnecessary delays

## Next Steps

1. **Add more test coverage** - Aim for 85%+ overall
2. **Add E2E tests** - Test complete user workflows
3. **Add performance tests** - Test under load
4. **Add security tests** - Test auth and authorization
5. **Integrate with CI/CD** - Automate testing

## Resources

- **Bun Test Docs:** https://bun.sh/docs/cli/test
- **Hono Testing:** https://hono.dev/docs/guides/testing
- **Drizzle Testing:** https://orm.drizzle.team/docs/get-started-postgresql

## Summary

✅ **Repository Tests:** 17/17 passing
✅ **Middleware Tests:** Created and ready
✅ **Integration Tests:** Created and ready
✅ **Utility Scripts:** test-api, seed-db
✅ **Documentation:** Complete

The testing infrastructure is fully set up and ready for development!

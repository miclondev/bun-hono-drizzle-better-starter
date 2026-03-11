# API Reference

Complete reference for all API endpoints in the application.

## Base URL

```
http://localhost:3000
```

## Authentication

Most endpoints require authentication. Authentication is handled via session cookies set by better-auth.

### Headers

```
Content-Type: application/json
Cookie: better-auth.session_token=<token>
```

---

## Health Check

### GET /health

Check if the server is running.

**Authentication:** Not required

**Response:**
```json
{
  "status": "ok"
}
```

**Status Codes:**
- `200` - Server is healthy

**Example:**
```bash
curl http://localhost:3000/health
```

---

## Authentication Endpoints

All authentication endpoints are provided by better-auth at `/api/auth/*`.

### POST /api/auth/sign-up/email

Register a new user with email and password.

**Authentication:** Not required

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "name": "John Doe"
}
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "emailVerified": false,
    "createdAt": "2024-03-11T08:00:00.000Z",
    "updatedAt": "2024-03-11T08:00:00.000Z"
  },
  "session": {
    "id": "session-uuid",
    "userId": "uuid",
    "expiresAt": "2024-03-18T08:00:00.000Z"
  }
}
```

**Status Codes:**
- `200` - User created successfully
- `400` - Invalid request (email already exists, weak password, etc.)

**Example:**
```bash
curl -X POST http://localhost:3000/api/auth/sign-up/email \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePassword123!",
    "name": "John Doe"
  }'
```

---

### POST /api/auth/sign-in/email

Login with email and password.

**Authentication:** Not required

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "emailVerified": false
  },
  "session": {
    "id": "session-uuid",
    "userId": "uuid",
    "expiresAt": "2024-03-18T08:00:00.000Z"
  }
}
```

**Sets Cookie:**
```
Set-Cookie: better-auth.session_token=<token>; HttpOnly; Secure; SameSite=None
```

**Status Codes:**
- `200` - Login successful
- `401` - Invalid credentials

**Example:**
```bash
curl -X POST http://localhost:3000/api/auth/sign-in/email \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePassword123!"
  }' \
  -c cookies.txt
```

---

### GET /api/auth/session

Get current session information.

**Authentication:** Not required (returns null if not authenticated)

**Response (authenticated):**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "emailVerified": false
  },
  "session": {
    "id": "session-uuid",
    "userId": "uuid",
    "expiresAt": "2024-03-18T08:00:00.000Z"
  }
}
```

**Response (not authenticated):**
```json
null
```

**Status Codes:**
- `200` - Success (returns session or null)

**Example:**
```bash
curl http://localhost:3000/api/auth/session \
  -b cookies.txt
```

---

### POST /api/auth/sign-out

Sign out and invalidate session.

**Authentication:** Required

**Response:**
```json
{
  "success": true
}
```

**Status Codes:**
- `200` - Signed out successfully

**Example:**
```bash
curl -X POST http://localhost:3000/api/auth/sign-out \
  -b cookies.txt
```

---

### POST /api/auth/sign-in/google

Initiate Google OAuth login.

**Authentication:** Not required

**Note:** Requires `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in environment variables.

---

## Todo Endpoints

All todo endpoints require authentication.

### GET /api/v1/todo

Get all todos for the authenticated user.

**Authentication:** Required

**Response:**
```json
[
  {
    "id": "uuid",
    "title": "Buy groceries",
    "description": "Milk, eggs, bread",
    "completed": false,
    "createdAt": "2024-03-11T08:00:00.000Z",
    "updatedAt": "2024-03-11T08:00:00.000Z",
    "userId": "user-uuid"
  },
  {
    "id": "uuid",
    "title": "Finish project",
    "description": "Complete the API documentation",
    "completed": true,
    "createdAt": "2024-03-10T10:00:00.000Z",
    "updatedAt": "2024-03-11T09:00:00.000Z",
    "userId": "user-uuid"
  }
]
```

**Status Codes:**
- `200` - Success
- `401` - Not authenticated

**Example:**
```bash
curl http://localhost:3000/api/v1/todo \
  -b cookies.txt
```

---

### GET /api/v1/todo/:id

Get a specific todo by ID.

**Authentication:** Required

**URL Parameters:**
- `id` (string, required) - Todo UUID

**Response:**
```json
{
  "id": "uuid",
  "title": "Buy groceries",
  "description": "Milk, eggs, bread",
  "completed": false,
  "createdAt": "2024-03-11T08:00:00.000Z",
  "updatedAt": "2024-03-11T08:00:00.000Z",
  "userId": "user-uuid"
}
```

**Status Codes:**
- `200` - Success
- `400` - Invalid todo ID
- `401` - Not authenticated
- `403` - Todo belongs to another user
- `404` - Todo not found

**Example:**
```bash
curl http://localhost:3000/api/v1/todo/123e4567-e89b-12d3-a456-426614174000 \
  -b cookies.txt
```

---

### POST /api/v1/todo

Create a new todo.

**Authentication:** Required

**Request Body:**
```json
{
  "title": "Buy groceries",
  "description": "Milk, eggs, bread"
}
```

**Validation Rules:**
- `title` (string, required): 1-100 characters
- `description` (string, required): 1-500 characters

**Response:**
```json
{
  "id": "uuid",
  "title": "Buy groceries",
  "description": "Milk, eggs, bread",
  "completed": false,
  "createdAt": "2024-03-11T08:00:00.000Z",
  "updatedAt": "2024-03-11T08:00:00.000Z",
  "userId": "user-uuid"
}
```

**Status Codes:**
- `201` - Todo created successfully
- `400` - Validation error
- `401` - Not authenticated

**Validation Errors:**
```json
{
  "message": "Title cannot be empty, Description must be at least 1 characters"
}
```

**Example:**
```bash
curl -X POST http://localhost:3000/api/v1/todo \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "title": "Buy groceries",
    "description": "Milk, eggs, bread"
  }'
```

---

### PUT /api/v1/todo/:id

Update an existing todo.

**Authentication:** Required

**URL Parameters:**
- `id` (string, required) - Todo UUID

**Request Body:**
```json
{
  "title": "Buy groceries and cook",
  "description": "Milk, eggs, bread, chicken",
  "completed": true
}
```

**Validation Rules:**
- `title` (string, optional): 1-100 characters
- `description` (string, optional): 1-500 characters
- `completed` (boolean, optional)
- At least one field must be provided

**Response:**
```json
{
  "id": "uuid",
  "title": "Buy groceries and cook",
  "description": "Milk, eggs, bread, chicken",
  "completed": true,
  "createdAt": "2024-03-11T08:00:00.000Z",
  "updatedAt": "2024-03-11T10:00:00.000Z",
  "userId": "user-uuid"
}
```

**Status Codes:**
- `200` - Todo updated successfully
- `400` - Validation error or invalid todo ID
- `401` - Not authenticated
- `403` - Todo belongs to another user
- `404` - Todo not found

**Example:**
```bash
curl -X PUT http://localhost:3000/api/v1/todo/123e4567-e89b-12d3-a456-426614174000 \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "title": "Buy groceries and cook",
    "completed": true
  }'
```

---

### DELETE /api/v1/todo/:id

Delete a todo.

**Authentication:** Required

**URL Parameters:**
- `id` (string, required) - Todo UUID

**Response:**
```
No content (empty body)
```

**Status Codes:**
- `204` - Todo deleted successfully
- `400` - Invalid todo ID
- `401` - Not authenticated
- `403` - Todo belongs to another user
- `404` - Todo not found

**Example:**
```bash
curl -X DELETE http://localhost:3000/api/v1/todo/123e4567-e89b-12d3-a456-426614174000 \
  -b cookies.txt
```

---

### PATCH /api/v1/todo/:id/toggle

Toggle the completion status of a todo.

**Authentication:** Required

**URL Parameters:**
- `id` (string, required) - Todo UUID

**Response:**
```json
{
  "id": "uuid",
  "title": "Buy groceries",
  "description": "Milk, eggs, bread",
  "completed": true,
  "createdAt": "2024-03-11T08:00:00.000Z",
  "updatedAt": "2024-03-11T10:00:00.000Z",
  "userId": "user-uuid"
}
```

**Status Codes:**
- `200` - Todo toggled successfully
- `400` - Invalid todo ID
- `401` - Not authenticated
- `403` - Todo belongs to another user
- `404` - Todo not found

**Example:**
```bash
curl -X PATCH http://localhost:3000/api/v1/todo/123e4567-e89b-12d3-a456-426614174000/toggle \
  -b cookies.txt
```

---

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request

Invalid request data or validation error.

```json
{
  "message": "Title cannot be empty, Description must be at least 1 characters"
}
```

### 401 Unauthorized

Authentication required or invalid session.

```json
{
  "message": "No Session provided"
}
```

or

```json
{
  "message": "Unauthorized"
}
```

### 403 Forbidden

User doesn't have permission to access the resource.

```json
{
  "message": "Forbidden"
}
```

### 404 Not Found

Resource not found.

```json
{
  "message": "Todo not found"
}
```

or

```json
{
  "message": "Route not found"
}
```

### 429 Too Many Requests

Rate limit exceeded.

```json
{
  "message": "Too many requests, please try again later."
}
```

**Headers:**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 45
```

### 500 Internal Server Error

Server error.

```json
{
  "message": "Internal server error"
}
```

---

## Rate Limiting

All endpoints are rate-limited to prevent abuse.

**Default Limits:**
- 100 requests per minute per IP address

**Rate Limit Headers:**

Every response includes rate limit information:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 45
```

- `X-RateLimit-Limit` - Maximum requests allowed in window
- `X-RateLimit-Remaining` - Requests remaining in current window
- `X-RateLimit-Reset` - Seconds until rate limit resets

---

## Complete Example Workflow

### 1. Register a User

```bash
curl -X POST http://localhost:3000/api/auth/sign-up/email \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123!",
    "name": "John Doe"
  }' \
  -c cookies.txt
```

### 2. Check Session

```bash
curl http://localhost:3000/api/auth/session \
  -b cookies.txt
```

### 3. Create a Todo

```bash
curl -X POST http://localhost:3000/api/v1/todo \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "title": "Learn Hono",
    "description": "Build an API with Hono and Bun"
  }'
```

### 4. Get All Todos

```bash
curl http://localhost:3000/api/v1/todo \
  -b cookies.txt
```

### 5. Update Todo

```bash
curl -X PUT http://localhost:3000/api/v1/todo/<todo-id> \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "completed": true
  }'
```

### 6. Toggle Todo

```bash
curl -X PATCH http://localhost:3000/api/v1/todo/<todo-id>/toggle \
  -b cookies.txt
```

### 7. Delete Todo

```bash
curl -X DELETE http://localhost:3000/api/v1/todo/<todo-id> \
  -b cookies.txt
```

### 8. Sign Out

```bash
curl -X POST http://localhost:3000/api/auth/sign-out \
  -b cookies.txt
```

---

## Testing with JavaScript/TypeScript

### Using Fetch API

```typescript
// Register
const registerResponse = await fetch('http://localhost:3000/api/auth/sign-up/email', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'john@example.com',
    password: 'SecurePass123!',
    name: 'John Doe'
  }),
  credentials: 'include' // Important for cookies
});

// Create Todo
const todoResponse = await fetch('http://localhost:3000/api/v1/todo', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: 'Learn Hono',
    description: 'Build an API'
  }),
  credentials: 'include'
});

const todo = await todoResponse.json();
```

### Using Axios

```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000',
  withCredentials: true
});

// Register
await api.post('/api/auth/sign-up/email', {
  email: 'john@example.com',
  password: 'SecurePass123!',
  name: 'John Doe'
});

// Create Todo
const { data: todo } = await api.post('/api/v1/todo', {
  title: 'Learn Hono',
  description: 'Build an API'
});
```

---

## Postman Collection

Import this JSON to test the API in Postman:

```json
{
  "info": {
    "name": "Bun Hono API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Auth",
      "item": [
        {
          "name": "Register",
          "request": {
            "method": "POST",
            "url": "{{baseUrl}}/api/auth/sign-up/email",
            "body": {
              "mode": "raw",
              "raw": "{\n  \"email\": \"test@example.com\",\n  \"password\": \"SecurePass123!\",\n  \"name\": \"Test User\"\n}"
            }
          }
        },
        {
          "name": "Login",
          "request": {
            "method": "POST",
            "url": "{{baseUrl}}/api/auth/sign-in/email",
            "body": {
              "mode": "raw",
              "raw": "{\n  \"email\": \"test@example.com\",\n  \"password\": \"SecurePass123!\"\n}"
            }
          }
        },
        {
          "name": "Get Session",
          "request": {
            "method": "GET",
            "url": "{{baseUrl}}/api/auth/session"
          }
        }
      ]
    },
    {
      "name": "Todos",
      "item": [
        {
          "name": "Get All Todos",
          "request": {
            "method": "GET",
            "url": "{{baseUrl}}/api/v1/todo"
          }
        },
        {
          "name": "Create Todo",
          "request": {
            "method": "POST",
            "url": "{{baseUrl}}/api/v1/todo",
            "body": {
              "mode": "raw",
              "raw": "{\n  \"title\": \"Test Todo\",\n  \"description\": \"Testing the API\"\n}"
            }
          }
        }
      ]
    }
  ],
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost:3000"
    }
  ]
}
```

---

## WebSocket Support

Currently not implemented. Future versions may include WebSocket support for real-time updates.

---

## API Versioning

Current version: **v1**

All endpoints are prefixed with `/api/v1/` to allow for future API versions without breaking existing clients.

# Getting Started

## Prerequisites

Before you begin, ensure you have the following installed:

### Required
- **Bun** (v1.2+) - [Install Bun](https://bun.sh)
- **PostgreSQL** (v12+) - Database server

### Verify Installation

```bash
# Check Bun version
bun --version

# Check PostgreSQL
psql --version
```

## Installation Steps

### 1. Navigate to Project

```bash
cd new-app
```

### 2. Install Dependencies

Dependencies should already be installed, but if needed:

```bash
bun install
```

This installs:
- Hono (web framework)
- Drizzle ORM (database)
- better-auth (authentication)
- Joi (validation)
- Winston (logging)
- And all other dependencies

### 3. Start PostgreSQL

Ensure PostgreSQL is running:

```bash
# macOS with Homebrew
brew services start postgresql@14

# Check if running
brew services list | grep postgresql

# Or verify connection
psql -U postgres -c "SELECT version();"
```

If PostgreSQL is not installed:

```bash
# macOS
brew install postgresql@14
brew services start postgresql@14

# Ubuntu/Debian
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql

# Windows
# Download from https://www.postgresql.org/download/windows/
```

### 4. Create Database

Use the provided setup script:

```bash
bun run setup:db
```

This will:
- Connect to PostgreSQL
- Create the `todos` database if it doesn't exist
- Confirm successful creation

**Manual alternative:**

```bash
psql -U postgres -c "CREATE DATABASE todos;"
```

### 5. Configure Environment

The `.env` file already exists (copied from `.env.example`). Update the following:

```bash
# Edit .env file
nano .env  # or use your preferred editor
```

**Required changes:**

```env
# Generate a secure secret (32+ characters)
BETTER_AUTH_SECRET="your-secure-random-string-here"
```

**Generate secure secret:**

```bash
# Option 1: OpenSSL
openssl rand -base64 32

# Option 2: Bun
bun -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

**Optional configurations:**

```env
# Database (defaults should work)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=todos
DB_USER=postgres
DB_PASSWORD=postgres

# Server
PORT=3000
NODE_ENV=development

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### 6. Push Database Schema

Create all database tables:

```bash
bun run db:push
```

This will:
- Read schema definitions from `src/db/schema/`
- Create tables: `user`, `session`, `account`, `verification`, `todos`
- Set up relationships and constraints

**Expected output:**
```
✓ Pulling schema from database...
✓ Applying changes...
✓ Done!
```

### 7. Start Development Server

```bash
bun run dev
```

**Expected output:**
```
Started development server: http://localhost:3000
[info]: Database connection pool established successfully
[info]: Server running on port 3000
```

### 8. Verify Server

Open another terminal and test:

```bash
# Health check
curl http://localhost:3000/health

# Expected: {"status":"ok"}

# Check auth endpoints
curl http://localhost:3000/api/auth/session

# Expected: null (no session yet)
```

## First API Request

### Register a User

```bash
curl -X POST http://localhost:3000/api/auth/sign-up/email \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePassword123!",
    "name": "Test User"
  }'
```

### Login

```bash
curl -X POST http://localhost:3000/api/auth/sign-in/email \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePassword123!"
  }' \
  -c cookies.txt
```

### Create a Todo

```bash
curl -X POST http://localhost:3000/api/v1/todo \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "title": "My first todo",
    "description": "Testing the API"
  }'
```

### Get All Todos

```bash
curl http://localhost:3000/api/v1/todo \
  -b cookies.txt
```

## Troubleshooting

### Database Connection Failed

**Error:** `database "todos" does not exist`

**Solution:**
```bash
bun run setup:db
# or
psql -U postgres -c "CREATE DATABASE todos;"
```

---

**Error:** `connection to server on socket "/tmp/.s.PGSQL.5432" failed`

**Solution:** PostgreSQL is not running
```bash
brew services start postgresql@14
```

---

**Error:** `password authentication failed for user "postgres"`

**Solution:** Update `.env` with correct credentials
```env
DB_USER=your_postgres_user
DB_PASSWORD=your_postgres_password
```

### Port Already in Use

**Error:** `EADDRINUSE: address already in use :::3000`

**Solution:** Change port in `.env`
```env
PORT=3001
```

Or kill the process using port 3000:
```bash
lsof -ti:3000 | xargs kill -9
```

### Better-Auth Warnings

**Warning:** `BETTER_AUTH_SECRET should be at least 32 characters`

**Solution:** Generate and set a secure secret
```bash
openssl rand -base64 32
# Copy output to .env BETTER_AUTH_SECRET
```

---

**Warning:** `Base URL could not be determined`

**Solution:** Add to `.env`
```env
BETTER_AUTH_URL=http://localhost:3000
```

---

**Warning:** `Social provider google is missing clientId or clientSecret`

**Solution:** Either:
1. Remove Google OAuth from `src/utils/auth.ts` if not using
2. Or add credentials to `.env`:
```env
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
```

### TypeScript Errors in IDE

**Error:** `Cannot find module '@/utils/auth'`

**Explanation:** These are IDE/LSP errors. Bun resolves path aliases at runtime, so the code works correctly when executed. The errors are cosmetic and can be ignored.

**Optional fix:** Restart TypeScript server in your IDE.

### Schema Push Failed

**Error:** `Table already exists`

**Solution:** This means tables were already created. You can:
1. Continue (tables exist, you're good)
2. Or reset database:
```bash
psql -U postgres -c "DROP DATABASE todos;"
psql -U postgres -c "CREATE DATABASE todos;"
bun run db:push
```

## Next Steps

Now that your server is running:

1. **Explore the API** - See [03-API-REFERENCE.md](./03-API-REFERENCE.md)
2. **Understand Architecture** - See [02-ARCHITECTURE.md](./02-ARCHITECTURE.md)
3. **Learn Authentication** - See [05-AUTHENTICATION.md](./05-AUTHENTICATION.md)
4. **Add Features** - Use Todo controller as reference
5. **Write Tests** - See [08-TESTING.md](./08-TESTING.md)

## Development Workflow

```bash
# Start development server (hot reload enabled)
bun run dev

# Run type checking
bun run typecheck

# View database in Drizzle Studio
bun run db:studio

# Generate database migrations
bun run db:generate

# Run tests
bun test

# Build for production
bun run build

# Start production server
bun run start
```

## Useful Commands

```bash
# Database
bun run setup:db          # Create database
bun run db:push           # Push schema to database
bun run db:generate       # Generate migration files
bun run db:migrate        # Run migrations
bun run db:studio         # Open Drizzle Studio

# Development
bun run dev               # Start dev server
bun run typecheck         # Type check
bun test                  # Run tests

# Production
bun run build             # Build for production
bun run start             # Start production server

# Utilities (when created in Phase 2)
bun run seed              # Seed database
bun run test:api          # Test API endpoints
```

## Environment Variables Reference

```env
# Server Configuration
NODE_ENV=development          # development | production | test
PORT=3000                     # Server port

# Database Configuration
DB_HOST=localhost             # Database host
DB_PORT=5432                  # Database port
DB_NAME=todos                 # Database name
DB_USER=postgres              # Database user
DB_PASSWORD=postgres          # Database password
DATABASE_URL=                 # Optional: Full connection string

# Database Pool (Optional)
DB_POOL_MIN=2                 # Minimum pool connections
DB_POOL_MAX=10                # Maximum pool connections
DB_IDLE_TIMEOUT=30            # Idle timeout (seconds)
DB_CONNECT_TIMEOUT=10         # Connect timeout (seconds)

# Authentication
BETTER_AUTH_SECRET=           # Required: 32+ character secret
BETTER_AUTH_URL=              # Optional: Base URL for callbacks

# OAuth (Optional)
GOOGLE_CLIENT_ID=             # Google OAuth client ID
GOOGLE_CLIENT_SECRET=         # Google OAuth client secret

# Logging
LOG_LEVEL=info                # error | warn | info | http | debug
```

## Project Structure Quick Reference

```
new-app/
├── src/
│   ├── index.ts              # Main application entry
│   ├── config/               # Environment configuration
│   ├── db/                   # Database layer
│   │   ├── schema/           # Table definitions
│   │   ├── repositories/     # Data access
│   │   └── config.ts         # DB connection
│   ├── controllers/          # Business logic
│   ├── middleware/           # Request middleware
│   ├── routes/               # API routes
│   ├── utils/                # Utilities
│   └── validation/           # Input validation
├── scripts/                  # Utility scripts
├── tests/                    # Test files
├── docs/                     # Documentation
├── .env                      # Environment variables
├── package.json              # Dependencies
├── tsconfig.json             # TypeScript config
└── drizzle.config.ts         # Drizzle config
```

## Ready to Code!

Your development environment is now set up. The server is running and ready to accept requests.

**What's next?**
- Read [02-ARCHITECTURE.md](./02-ARCHITECTURE.md) to understand the codebase
- Check [03-API-REFERENCE.md](./03-API-REFERENCE.md) for available endpoints
- Start building your features!

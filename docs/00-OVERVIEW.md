# Project Overview

## What Is This Project?

This is a **modern backend API starter** built with:
- **Bun** - Fast JavaScript runtime (replacement for Node.js)
- **Hono** - Lightweight, ultrafast web framework (replacement for Express.js)
- **Drizzle ORM** - Type-safe database operations
- **better-auth** - Complete authentication solution
- **PostgreSQL** - Relational database
- **TypeScript** - Full type safety

## Migration Context

This project was created as a **fresh rebuild** of an existing Express.js/Node.js application. The original app is located in the parent directory (`../`), and this new version (`new-app/`) was built from scratch using modern tools while maintaining the same functionality.

### Why the Migration?

1. **Performance** - Bun is significantly faster than Node.js
2. **Modern Framework** - Hono is lightweight and optimized for edge/modern runtimes
3. **Better DX** - Improved developer experience with Bun's built-in features
4. **Simplified Stack** - Less dependencies, cleaner code

### Migration Approach

**Strategy:** Fresh start in separate folder
- Original Express app remains untouched in parent directory
- New Bun + Hono app built in `new-app/` folder
- Stable code (schemas, repositories, config) copied over
- Framework-specific code (middleware, controllers, routes) rewritten for Hono
- Once verified working, new app will replace old app

## Project Purpose

This is a **starter template** for building backend APIs with:
- User authentication (email/password, OAuth)
- Database operations with type safety
- RESTful API endpoints
- Input validation
- Security best practices
- Logging and monitoring

### Example Feature: Todo API

The project includes a complete Todo feature as a reference implementation:
- Create, read, update, delete todos
- User-specific todos (authentication required)
- Input validation
- Full CRUD operations

## Key Features

### Authentication (better-auth)
- Email/password registration and login
- Social OAuth (Google configured)
- Anonymous authentication
- Session management with cookies
- Role-based access control

### Security
- Secure headers (Hono middleware)
- CORS configuration
- Rate limiting (custom implementation)
- Input validation (Joi)
- SQL injection prevention (Drizzle ORM)

### Developer Experience
- Hot reload in development
- TypeScript with full type safety
- Path aliases (@/, @db/, etc.)
- Structured logging (Winston)
- Database migrations (Drizzle Kit)
- Comprehensive error handling

## Architecture

The application follows a **layered architecture**:

```
Request → Middleware → Routes → Controllers → Repositories → Database
                                      ↓
                                 Validation
```

### Layers Explained

1. **Middleware** - Authentication, validation, logging, rate limiting
2. **Routes** - Define API endpoints and apply middleware
3. **Controllers** - Business logic and request handling
4. **Repositories** - Data access layer (database operations)
5. **Database** - PostgreSQL with Drizzle ORM

## Technology Stack

### Runtime & Framework
- **Bun 1.2+** - JavaScript runtime
- **Hono 4.12+** - Web framework
- **TypeScript 5.3+** - Type safety

### Database
- **PostgreSQL** - Relational database
- **Drizzle ORM 0.41+** - Type-safe ORM
- **postgres.js 3.4+** - PostgreSQL client

### Authentication & Security
- **better-auth 1.2+** - Authentication library
- **Joi 17.13+** - Input validation
- **Hono secure-headers** - Security headers
- **Hono CORS** - CORS middleware

### Utilities
- **Winston 3.17+** - Logging
- **dotenv 16.5+** - Environment variables
- **uuid 11.1+** - UUID generation

### Development
- **Drizzle Kit 0.30+** - Database migrations
- **@faker-js/faker 9.6+** - Test data generation
- **Bun test** - Testing framework

## Project Status

### ✅ Completed (Phase 1)
- [x] Project setup with Bun + Hono
- [x] Dependencies installed
- [x] Database layer (schemas, repositories)
- [x] Configuration and utilities
- [x] Hono middleware (auth, validation, rate limiting, logging)
- [x] Hono controllers (Todo CRUD)
- [x] Hono routes
- [x] Main application with better-auth integration
- [x] Documentation

### 🔄 Pending (Phase 2)
- [ ] PostgreSQL setup
- [ ] Database creation and schema push
- [ ] Server startup verification
- [ ] Utility scripts (seed, test, health check)
- [ ] Tests with Bun test runner

### 🔄 Pending (Phase 3)
- [ ] Swap old and new apps
- [ ] Final verification
- [ ] Cleanup

## Quick Start

See [01-GETTING-STARTED.md](./01-GETTING-STARTED.md) for detailed setup instructions.

```bash
# Quick setup
cd new-app
bun run setup:db      # Create database
bun run db:push       # Create tables
bun run dev           # Start server
```

## Documentation Index

1. **[00-OVERVIEW.md](./00-OVERVIEW.md)** - This file (project overview)
2. **[01-GETTING-STARTED.md](./01-GETTING-STARTED.md)** - Setup and installation
3. **[02-ARCHITECTURE.md](./02-ARCHITECTURE.md)** - Detailed architecture
4. **[03-API-REFERENCE.md](./03-API-REFERENCE.md)** - API endpoints
5. **[04-DATABASE.md](./04-DATABASE.md)** - Database schema and operations
6. **[05-AUTHENTICATION.md](./05-AUTHENTICATION.md)** - Authentication system
7. **[06-MIGRATION-GUIDE.md](./06-MIGRATION-GUIDE.md)** - Express to Hono migration details
8. **[07-DEVELOPMENT.md](./07-DEVELOPMENT.md)** - Development workflow
9. **[08-TESTING.md](./08-TESTING.md)** - Testing guide
10. **[09-DEPLOYMENT.md](./09-DEPLOYMENT.md)** - Deployment instructions

## Support & Resources

- **Bun Documentation:** https://bun.sh/docs
- **Hono Documentation:** https://hono.dev
- **Drizzle ORM:** https://orm.drizzle.team
- **better-auth:** https://www.better-auth.com

## License

ISC

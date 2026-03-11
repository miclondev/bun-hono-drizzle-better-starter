# Documentation Index

Welcome to the Bun + Hono + Drizzle + Better-Auth Starter documentation!

## Quick Links

- **[00-OVERVIEW.md](./00-OVERVIEW.md)** - Start here! Project overview and context
- **[01-GETTING-STARTED.md](./01-GETTING-STARTED.md)** - Setup instructions and first steps
- **[02-ARCHITECTURE.md](./02-ARCHITECTURE.md)** - System architecture and design patterns
- **[03-API-REFERENCE.md](./03-API-REFERENCE.md)** - Complete API endpoint documentation
- **[04-DATABASE.md](./04-DATABASE.md)** - Database schema and operations
- **[06-MIGRATION-GUIDE.md](./06-MIGRATION-GUIDE.md)** - Express to Hono migration details

## Documentation Structure

### For New Developers

If you're new to this project, read in this order:

1. **[00-OVERVIEW.md](./00-OVERVIEW.md)** - Understand what this project is
2. **[01-GETTING-STARTED.md](./01-GETTING-STARTED.md)** - Get the server running
3. **[02-ARCHITECTURE.md](./02-ARCHITECTURE.md)** - Learn the codebase structure
4. **[03-API-REFERENCE.md](./03-API-REFERENCE.md)** - Explore available endpoints

### For Existing Developers

If you're familiar with the old Express app:

1. **[06-MIGRATION-GUIDE.md](./06-MIGRATION-GUIDE.md)** - See what changed
2. **[02-ARCHITECTURE.md](./02-ARCHITECTURE.md)** - Understand new patterns
3. **[03-API-REFERENCE.md](./03-API-REFERENCE.md)** - API remains the same

### For AI/LLM Assistants

If you're an AI helping with this codebase:

1. **[00-OVERVIEW.md](./00-OVERVIEW.md)** - Project context and purpose
2. **[02-ARCHITECTURE.md](./02-ARCHITECTURE.md)** - Code organization and patterns
3. **[06-MIGRATION-GUIDE.md](./06-MIGRATION-GUIDE.md)** - Framework-specific patterns
4. **[04-DATABASE.md](./04-DATABASE.md)** - Database operations

## Document Summaries

### 00-OVERVIEW.md
- What this project is and why it exists
- Migration context (Express → Bun + Hono)
- Key features and technology stack
- Project status and roadmap
- Quick start commands

### 01-GETTING-STARTED.md
- Prerequisites (Bun, PostgreSQL)
- Step-by-step setup instructions
- Database creation and schema push
- First API requests
- Troubleshooting common issues
- Environment variables reference

### 02-ARCHITECTURE.md
- System architecture diagram
- Request flow explanation
- Layer-by-layer breakdown (middleware, routes, controllers, repositories)
- Code patterns and conventions
- Type safety approach
- Security layers
- Performance optimizations

### 03-API-REFERENCE.md
- Complete endpoint documentation
- Request/response examples
- Authentication flow
- Error responses
- Rate limiting details
- Example workflows
- Postman collection

### 04-DATABASE.md
- Database schema (all tables)
- Schema definitions in code
- Connection configuration
- Repository pattern
- Drizzle ORM operations
- Migrations and Drizzle Studio
- Performance optimization
- Common queries

### 06-MIGRATION-GUIDE.md
- Express vs Hono comparison
- Code transformation examples
- What changed and what stayed the same
- Dependencies removed/added
- Performance improvements
- Migration checklist
- Common pitfalls

## Additional Resources

### In Parent Directory
- **[../MIGRATION_STATUS.md](../MIGRATION_STATUS.md)** - Current migration status
- **[../README.md](../README.md)** - Quick setup guide

### External Resources
- **Bun:** https://bun.sh/docs
- **Hono:** https://hono.dev
- **Drizzle ORM:** https://orm.drizzle.team
- **better-auth:** https://www.better-auth.com

## Project Files Reference

### Configuration Files
- `package.json` - Dependencies and scripts
- `tsconfig.json` - TypeScript configuration
- `drizzle.config.ts` - Drizzle ORM configuration
- `.env` - Environment variables (not in git)
- `.env.example` - Environment template

### Source Code
- `src/index.ts` - Main application entry
- `src/config/` - Configuration management
- `src/db/` - Database layer
- `src/controllers/` - Business logic
- `src/middleware/` - Request middleware
- `src/routes/` - API routes
- `src/utils/` - Utilities
- `src/validation/` - Input validation

### Scripts
- `scripts/setup-db.ts` - Database setup helper

### Documentation
- `docs/` - This directory
- `MIGRATION_STATUS.md` - Migration progress
- `README.md` - Quick reference

## Common Tasks

### Development
```bash
bun run dev              # Start development server
bun run typecheck        # Check TypeScript types
bun run db:studio        # Open database browser
```

### Database
```bash
bun run setup:db         # Create database
bun run db:push          # Push schema changes
bun run db:generate      # Generate migrations
bun run db:migrate       # Run migrations
```

### Testing
```bash
bun test                 # Run tests
bun run test:api         # Test API endpoints
```

## Getting Help

### Documentation Issues
If you find errors or gaps in documentation:
1. Check other docs for related information
2. Review the source code
3. Test the functionality
4. Update the docs with correct information

### Code Issues
If you encounter bugs or unexpected behavior:
1. Check [01-GETTING-STARTED.md](./01-GETTING-STARTED.md) troubleshooting section
2. Review [02-ARCHITECTURE.md](./02-ARCHITECTURE.md) for patterns
3. Check database schema in [04-DATABASE.md](./04-DATABASE.md)
4. Compare with Express version if needed

### Migration Questions
If you're migrating from Express:
1. Read [06-MIGRATION-GUIDE.md](./06-MIGRATION-GUIDE.md) thoroughly
2. Compare code patterns side-by-side
3. Test both versions in parallel
4. Refer to Hono documentation for framework-specific questions

## Documentation Maintenance

### When to Update Docs

Update documentation when:
- Adding new features or endpoints
- Changing architecture or patterns
- Fixing bugs that affect documented behavior
- Adding new dependencies
- Changing environment variables
- Updating deployment process

### Documentation Standards

- Use clear, concise language
- Include code examples
- Provide both explanation and examples
- Link to related documentation
- Keep examples up-to-date with code
- Use consistent formatting

## Version History

### v1.0.0 (Current)
- Initial Bun + Hono implementation
- Complete migration from Express
- Full documentation suite
- Todo feature implementation
- better-auth integration

## Next Steps

After reading the documentation:

1. **Get Started** - Follow [01-GETTING-STARTED.md](./01-GETTING-STARTED.md)
2. **Explore Code** - Use [02-ARCHITECTURE.md](./02-ARCHITECTURE.md) as guide
3. **Test APIs** - Try examples from [03-API-REFERENCE.md](./03-API-REFERENCE.md)
4. **Build Features** - Use Todo as reference implementation
5. **Contribute** - Improve docs and code

## Questions?

For questions about:
- **Setup** → [01-GETTING-STARTED.md](./01-GETTING-STARTED.md)
- **Architecture** → [02-ARCHITECTURE.md](./02-ARCHITECTURE.md)
- **APIs** → [03-API-REFERENCE.md](./03-API-REFERENCE.md)
- **Database** → [04-DATABASE.md](./04-DATABASE.md)
- **Migration** → [06-MIGRATION-GUIDE.md](./06-MIGRATION-GUIDE.md)

Happy coding! 🚀

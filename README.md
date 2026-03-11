# ViralSak - AI-Powered Short-Form Video Generator

A full-stack application for generating viral short-form videos using AI. Create engaging TikTok-style videos with automated script generation, customizable templates, and scheduled posting.

## 🚀 Features

### Core Features
- **AI Script Generation** - Generate engaging video scripts using Anthropic Claude
- **Video Templates** - Save and reuse video configurations (voice, background, text style)
- **Automation Studio** - Schedule automated video generation with custom frequencies
- **TikTok Integration** - OAuth authentication and direct posting to TikTok
- **RSS Feed Integration** - Generate videos from trending topics
- **Dashboard Analytics** - Track video performance and engagement

### Technical Features
- **Full-Stack TypeScript** - Type-safe frontend and backend
- **Real-time Updates** - React Query for optimistic updates
- **Modern UI** - Beautiful interface with Framer Motion animations
- **Authentication** - Secure auth with better-auth
- **Database** - PostgreSQL with Drizzle ORM
- **API** - RESTful API with 26 endpoints

## 📁 Project Structure

```
viralsak/
├── viralsak-backend/          # Backend API (Bun + Hono)
│   ├── src/
│   │   ├── controllers/       # API controllers
│   │   ├── db/               # Database schemas & repositories
│   │   ├── middleware/       # Auth & validation middleware
│   │   ├── routes/           # API routes
│   │   ├── services/         # Business logic (AI service)
│   │   └── validation/       # Joi validation schemas
│   └── drizzle/              # Database migrations
│
└── viralsak-frontend/         # Frontend (React + Vite)
    ├── src/
    │   ├── components/       # Reusable UI components
    │   ├── contexts/         # React contexts (Auth)
    │   ├── hooks/            # React Query hooks
    │   ├── pages/            # Page components
    │   ├── types/            # TypeScript type definitions
    │   └── constants/        # API endpoints & constants
    └── public/               # Static assets
```

## 🛠️ Tech Stack

### Backend
- **Runtime**: Bun
- **Framework**: Hono
- **Database**: PostgreSQL
- **ORM**: Drizzle
- **Authentication**: better-auth
- **AI**: Anthropic Claude 3.5 Sonnet
- **Validation**: Joi

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: TailwindCSS + shadcn/ui
- **State Management**: React Query (TanStack Query)
- **Animations**: Framer Motion
- **Routing**: React Router
- **i18n**: react-i18next
- **Code Quality**: Biome

## 📦 Installation

### Prerequisites
- Node.js 18+ or Bun
- PostgreSQL 14+
- pnpm (for frontend)
- Anthropic API key
- TikTok Developer account (optional)

### Backend Setup

```bash
cd viralsak-backend

# Install dependencies
bun install

# Copy environment file
cp .env.example .env

# Edit .env and add your credentials:
# - ANTHROPIC_API_KEY
# - Database credentials
# - TikTok OAuth credentials (optional)

# Run database migrations
bun run db:push

# Start development server
bun run dev
```

Backend will run on `http://localhost:3005`

### Frontend Setup

```bash
cd viralsak-frontend

# Install dependencies (must use pnpm)
pnpm install

# Copy environment file
cp .env.example .env

# Start development server
pnpm dev
```

Frontend will run on `http://localhost:5173`

## 🔑 Environment Variables

### Backend (.env)

```bash
# Server
NODE_ENV=development
PORT=3005

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=viralsak
DB_USER=postgres
DB_PASSWORD=your_password

# Authentication
BETTER_AUTH_SECRET=your_secret_key
BETTER_AUTH_URL=http://localhost:3005

# Google OAuth (Optional)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# TikTok OAuth
TIKTOK_CLIENT_KEY=your_client_key
TIKTOK_CLIENT_SECRET=your_client_secret
TIKTOK_REDIRECT_URI=http://localhost:3005/api/v1/tiktok/oauth/callback
FRONTEND_URL=http://localhost:8080

# AI
ANTHROPIC_API_KEY=sk-ant-api03-...
```

### Frontend (.env)

```bash
VITE_API_URL=http://localhost:3005
```

## 📚 Documentation

- [API Documentation](./docs/API.md) - Complete API reference with all endpoints
- [Authentication Guide](./docs/AUTHENTICATION.md) - better-auth setup and configuration
- [Database Schema](./docs/DATABASE.md) - Database structure and relationships
- [Deployment Guide](./docs/DEPLOYMENT.md) - Production deployment instructions

## 🎯 Quick Start Guide

1. **Generate Your First Video**
   - Navigate to `/generator`
   - Enter a topic (e.g., "Why coffee boosts productivity")
   - Click "Generate" to create an AI script
   - Select voice, background, and text style
   - Click "Generate Video"

2. **Create a Template**
   - Go to Video Generator
   - Configure your preferred settings
   - Save as a template for reuse

3. **Set Up Automation**
   - Navigate to `/automations`
   - Click "New Automation"
   - Set topic, frequency, and template
   - Enable automation

4. **Connect TikTok**
   - Go to `/settings`
   - Click "Connect Account" under TikTok
   - Authorize the application
   - Enable auto-posting

## � Admin Users

Admin users have unlimited free access to all features without credit limits. This is useful for testing, demonstrations, and platform administration.

### Setting Up Admin Users

**Method 1: Using better-auth Admin API**

```typescript
// Use the admin plugin to set a user's role
import { auth } from "./utils/auth";

// Set user role to admin
await auth.api.setRole({
  userId: "user_id_here",
  role: "admin"
});
```

**Method 2: Direct Database Update**

```sql
-- Update user role directly in database
UPDATE "user" SET role = 'admin' WHERE email = 'admin@example.com';
```

**Method 3: Using Drizzle Studio**

```bash
bun run db:studio
# Navigate to the user table
# Find your user and set role = 'admin'
```

### Admin Benefits

- ✅ **Unlimited Credits** - Display balance shows 999,999 credits
- ✅ **No Credit Deduction** - Video generation, AI scripts, and AI titles are free
- ✅ **No Subscription Required** - Full access without payment
- ✅ **Bypass All Limits** - No restrictions on usage

### Admin Check Logic

The credit service automatically detects admin users:

```typescript
// Admin users bypass all credit checks
if (await creditService.isAdmin(userId)) {
  return 999999; // Unlimited credits
}
```

Admin status is determined by the `role` field in the user table matching `"admin"`.

## �🔌 API Endpoints

### Authentication
- `POST /api/auth/sign-up/email` - Register
- `POST /api/auth/sign-in/email` - Login
- `POST /api/auth/sign-out` - Logout
- `GET /api/auth/get-session` - Get session

### Videos
- `GET /api/v1/videos` - List videos
- `POST /api/v1/videos` - Create video
- `GET /api/v1/videos/:id` - Get video
- `PATCH /api/v1/videos/:id` - Update video
- `DELETE /api/v1/videos/:id` - Delete video
- `POST /api/v1/videos/:id/regenerate` - Regenerate video
- `POST /api/v1/videos/:id/post-to-tiktok` - Post to TikTok

### AI Features
- `POST /api/v1/videos/ai/generate-script` - Generate script
- `POST /api/v1/videos/ai/generate-title` - Generate title
- `POST /api/v1/videos/ai/improve-script` - Improve script

### Templates
- `GET /api/v1/templates` - List templates
- `POST /api/v1/templates` - Create template
- `DELETE /api/v1/templates/:id` - Delete template

### Automations
- `GET /api/v1/automations` - List automations
- `POST /api/v1/automations` - Create automation
- `PATCH /api/v1/automations/:id` - Update automation
- `DELETE /api/v1/automations/:id` - Delete automation
- `POST /api/v1/automations/:id/toggle` - Toggle active status

### TikTok
- `GET /api/v1/tiktok/oauth-url` - Get OAuth URL
- `GET /api/v1/tiktok/oauth/callback` - OAuth callback
- `GET /api/v1/tiktok/status` - Connection status
- `DELETE /api/v1/tiktok/disconnect` - Disconnect account

### RSS Feeds
- `GET /api/v1/rss-feeds` - List feeds
- `POST /api/v1/rss-feeds` - Create feed
- `DELETE /api/v1/rss-feeds/:id` - Delete feed

### Stats
- `GET /api/v1/stats/dashboard` - Dashboard statistics

## 🧪 Testing

### Frontend
```bash
cd viralsak-frontend

# Run tests
pnpm test

# Type check
pnpm exec tsc --noEmit

# Lint
pnpm lint

# Format
pnpm format
```

### Backend
```bash
cd viralsak-backend

# Run tests
bun test

# Type check
bun run type-check
```

## 🚢 Deployment

### Backend Deployment

1. Set up PostgreSQL database
2. Configure environment variables
3. Run migrations: `bun run db:push`
4. Build: `bun run build`
5. Start: `bun run start`

### Frontend Deployment

1. Update `VITE_API_URL` in `.env`
2. Build: `pnpm build`
3. Deploy `dist/` folder to hosting service

Recommended platforms:
- Backend: Railway, Render, Fly.io
- Frontend: Vercel, Netlify, Cloudflare Pages
- Database: Neon, Supabase, Railway

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For issues and questions:
- GitHub Issues: [Create an issue](https://github.com/yourusername/viralsak/issues)
- Documentation: [Read the docs](./docs/)

## 🎉 Acknowledgments

- [Anthropic](https://anthropic.com) - AI script generation
- [TikTok Developers](https://developers.tiktok.com) - TikTok API
- [shadcn/ui](https://ui.shadcn.com) - UI components
- [Hono](https://hono.dev) - Web framework
- [Drizzle](https://orm.drizzle.team) - ORM

---

Built with ❤️ using modern web technologies

# Deployment Guide

Complete guide for deploying ViralSak to production.

## Overview

This guide covers deploying both the backend and frontend to production environments.

**Recommended Stack:**
- **Backend**: Railway, Render, or Fly.io
- **Frontend**: Vercel, Netlify, or Cloudflare Pages
- **Database**: Neon, Supabase, or Railway PostgreSQL

---

## Prerequisites

- [ ] Domain name (optional but recommended)
- [ ] Anthropic API key
- [ ] TikTok Developer account (optional)
- [ ] PostgreSQL database
- [ ] Git repository

---

## Backend Deployment

### Option 1: Railway (Recommended)

**1. Create Railway Account**
- Visit [railway.app](https://railway.app)
- Sign up with GitHub

**2. Create New Project**
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize project
cd viralsak-backend
railway init
```

**3. Add PostgreSQL**
- In Railway dashboard, click "New"
- Select "Database" → "PostgreSQL"
- Copy connection string

**4. Configure Environment Variables**

In Railway dashboard, add:
```bash
NODE_ENV=production
PORT=3005

# Database (from Railway PostgreSQL)
DATABASE_URL=postgresql://...

# Auth
BETTER_AUTH_SECRET=<generate-secure-secret>
BETTER_AUTH_URL=https://your-backend.railway.app

# TikTok
TIKTOK_CLIENT_KEY=your_key
TIKTOK_CLIENT_SECRET=your_secret
TIKTOK_REDIRECT_URI=https://your-backend.railway.app/api/v1/tiktok/oauth/callback
FRONTEND_URL=https://your-frontend.vercel.app

# AI
ANTHROPIC_API_KEY=sk-ant-api03-...
```

**5. Deploy**
```bash
# Deploy from CLI
railway up

# Or connect GitHub repo in dashboard
# Railway will auto-deploy on push
```

**6. Run Migrations**
```bash
railway run bun run db:push
```

---

### Option 2: Render

**1. Create Render Account**
- Visit [render.com](https://render.com)
- Sign up with GitHub

**2. Create PostgreSQL Database**
- New → PostgreSQL
- Choose plan (free tier available)
- Copy internal connection string

**3. Create Web Service**
- New → Web Service
- Connect GitHub repository
- Select `viralsak-backend` directory

**4. Configure Service**
```yaml
Name: viralsak-backend
Environment: Node
Build Command: bun install
Start Command: bun run start
```

**5. Add Environment Variables**
Same as Railway configuration above.

**6. Deploy**
- Click "Create Web Service"
- Render will build and deploy automatically

---

### Option 3: Fly.io

**1. Install Fly CLI**
```bash
curl -L https://fly.io/install.sh | sh
```

**2. Login and Initialize**
```bash
fly auth login
cd viralsak-backend
fly launch
```

**3. Create PostgreSQL**
```bash
fly postgres create
fly postgres attach <postgres-app-name>
```

**4. Configure**
Edit `fly.toml`:
```toml
app = "viralsak-backend"

[env]
  PORT = "3005"
  NODE_ENV = "production"

[build]
  builder = "paketobuildpacks/builder:base"

[[services]]
  internal_port = 3005
  protocol = "tcp"

  [[services.ports]]
    port = 80
    handlers = ["http"]

  [[services.ports]]
    port = 443
    handlers = ["tls", "http"]
```

**5. Set Secrets**
```bash
fly secrets set ANTHROPIC_API_KEY=sk-ant-...
fly secrets set BETTER_AUTH_SECRET=...
# ... other secrets
```

**6. Deploy**
```bash
fly deploy
```

---

## Frontend Deployment

### Option 1: Vercel (Recommended)

**1. Install Vercel CLI**
```bash
npm install -g vercel
```

**2. Login**
```bash
vercel login
```

**3. Deploy**
```bash
cd viralsak-frontend
vercel
```

**4. Configure Environment Variables**

In Vercel dashboard:
```bash
VITE_API_URL=https://your-backend.railway.app
```

**5. Set Up Domain (Optional)**
- Go to project settings
- Add custom domain
- Update DNS records

**6. Enable Auto-Deploy**
- Connect GitHub repository
- Enable automatic deployments
- Configure production branch

---

### Option 2: Netlify

**1. Install Netlify CLI**
```bash
npm install -g netlify-cli
```

**2. Login and Deploy**
```bash
cd viralsak-frontend
netlify login
netlify init
```

**3. Configure Build**
```toml
# netlify.toml
[build]
  command = "pnpm build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

**4. Set Environment Variables**
```bash
netlify env:set VITE_API_URL https://your-backend.railway.app
```

**5. Deploy**
```bash
netlify deploy --prod
```

---

### Option 3: Cloudflare Pages

**1. Connect Repository**
- Go to Cloudflare Pages
- Connect GitHub repository
- Select `viralsak-frontend`

**2. Configure Build**
```
Build command: pnpm build
Build output directory: dist
Root directory: viralsak-frontend
```

**3. Environment Variables**
```bash
VITE_API_URL=https://your-backend.railway.app
```

**4. Deploy**
- Click "Save and Deploy"
- Cloudflare will build and deploy

---

## Database Setup

### Option 1: Neon (Recommended)

**1. Create Account**
- Visit [neon.tech](https://neon.tech)
- Sign up (free tier available)

**2. Create Database**
- New Project → "viralsak"
- Select region
- Copy connection string

**3. Configure Backend**
```bash
DATABASE_URL=postgresql://user:pass@ep-xxx.neon.tech/viralsak?sslmode=require
```

**4. Run Migrations**
```bash
bun run db:push
```

---

### Option 2: Supabase

**1. Create Project**
- Visit [supabase.com](https://supabase.com)
- New Project → "viralsak"

**2. Get Connection String**
- Settings → Database
- Copy connection string
- Use "Connection pooling" for production

**3. Configure**
```bash
DATABASE_URL=postgresql://postgres:pass@db.xxx.supabase.co:5432/postgres
```

---

## Domain Configuration

### Backend Domain

**1. Add Custom Domain**
- In hosting provider dashboard
- Add custom domain (e.g., `api.yourdomain.com`)

**2. Update DNS**
```
Type: CNAME
Name: api
Value: your-backend.railway.app
```

**3. Update Environment Variables**
```bash
BETTER_AUTH_URL=https://api.yourdomain.com
TIKTOK_REDIRECT_URI=https://api.yourdomain.com/api/v1/tiktok/oauth/callback
```

### Frontend Domain

**1. Add Custom Domain**
- In hosting provider dashboard
- Add domain (e.g., `app.yourdomain.com`)

**2. Update DNS**
```
Type: CNAME
Name: app
Value: your-frontend.vercel.app
```

**3. Update Backend**
```bash
FRONTEND_URL=https://app.yourdomain.com
```

---

## SSL/HTTPS

All recommended hosting providers automatically provide SSL certificates.

**Verify HTTPS:**
- Backend: `https://api.yourdomain.com/health`
- Frontend: `https://app.yourdomain.com`

---

## Environment Variables Checklist

### Backend (.env)

```bash
# Required
✓ NODE_ENV=production
✓ PORT=3005
✓ DATABASE_URL=postgresql://...
✓ BETTER_AUTH_SECRET=<secure-random-string>
✓ BETTER_AUTH_URL=https://api.yourdomain.com
✓ ANTHROPIC_API_KEY=sk-ant-api03-...
✓ FRONTEND_URL=https://app.yourdomain.com

# Optional (for TikTok)
□ TIKTOK_CLIENT_KEY=...
□ TIKTOK_CLIENT_SECRET=...
□ TIKTOK_REDIRECT_URI=https://api.yourdomain.com/api/v1/tiktok/oauth/callback
```

### Frontend (.env)

```bash
✓ VITE_API_URL=https://api.yourdomain.com
```

---

## Post-Deployment

### 1. Verify Backend

```bash
# Health check
curl https://api.yourdomain.com/health

# Should return: {"status":"ok"}
```

### 2. Verify Frontend

- Visit `https://app.yourdomain.com`
- Check console for errors
- Test login/register
- Test API connectivity

### 3. Test Features

- [ ] User registration
- [ ] User login
- [ ] AI script generation
- [ ] Video creation
- [ ] Template management
- [ ] Automation creation
- [ ] TikTok OAuth (if configured)
- [ ] RSS feed management

### 4. Monitor Logs

**Backend:**
```bash
# Railway
railway logs

# Render
# View in dashboard

# Fly.io
fly logs
```

**Frontend:**
```bash
# Vercel
vercel logs

# Netlify
netlify logs

# Cloudflare
# View in dashboard
```

---

## Monitoring & Analytics

### Backend Monitoring

**1. Add Health Check Endpoint**
```typescript
app.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});
```

**2. Set Up Uptime Monitoring**
- [UptimeRobot](https://uptimerobot.com) (free)
- [Pingdom](https://www.pingdom.com)
- [Better Uptime](https://betteruptime.com)

**3. Error Tracking**
- [Sentry](https://sentry.io)
- [LogRocket](https://logrocket.com)
- [Rollbar](https://rollbar.com)

### Frontend Analytics

**1. Add Analytics**
```typescript
// Google Analytics
import ReactGA from 'react-ga4';
ReactGA.initialize('G-XXXXXXXXXX');

// Plausible (privacy-friendly)
<script defer data-domain="yourdomain.com" src="https://plausible.io/js/script.js"></script>
```

**2. Performance Monitoring**
- [Vercel Analytics](https://vercel.com/analytics)
- [Web Vitals](https://web.dev/vitals/)

---

## Scaling

### Database Scaling

**1. Connection Pooling**
```typescript
const client = postgres(DATABASE_URL, {
  max: 20, // Increase for production
  idle_timeout: 20,
  connect_timeout: 10,
});
```

**2. Read Replicas**
- Set up read replicas for heavy read workloads
- Route read queries to replicas

**3. Caching**
```typescript
import Redis from 'ioredis';

const redis = new Redis(REDIS_URL);

// Cache frequently accessed data
await redis.set('stats:user:123', JSON.stringify(stats), 'EX', 300);
```

### Backend Scaling

**1. Horizontal Scaling**
- Increase number of instances
- Use load balancer
- Enable auto-scaling

**2. Vertical Scaling**
- Upgrade instance size
- Increase memory/CPU

### Frontend Scaling

**1. CDN**
- All recommended hosts use CDN by default
- Assets cached globally

**2. Code Splitting**
```typescript
// Lazy load routes
const VideoLibrary = lazy(() => import('./pages/VideoLibrary'));
```

**3. Image Optimization**
- Use WebP format
- Lazy load images
- Implement responsive images

---

## Security Checklist

- [ ] HTTPS enabled (SSL certificate)
- [ ] Environment variables secured
- [ ] Database credentials encrypted
- [ ] CORS configured correctly
- [ ] Rate limiting implemented
- [ ] SQL injection prevention (parameterized queries)
- [ ] XSS prevention (sanitize inputs)
- [ ] CSRF protection
- [ ] Secure session cookies
- [ ] API authentication required
- [ ] Regular security updates
- [ ] Backup strategy in place

---

## Backup Strategy

### Database Backups

**1. Automated Backups**
```bash
# Daily backup script
#!/bin/bash
DATE=$(date +%Y%m%d)
pg_dump $DATABASE_URL > backups/viralsak_$DATE.sql
```

**2. Backup to S3**
```bash
# Upload to S3
aws s3 cp backups/viralsak_$DATE.sql s3://your-bucket/backups/
```

**3. Retention Policy**
- Daily backups: Keep 7 days
- Weekly backups: Keep 4 weeks
- Monthly backups: Keep 12 months

### Code Backups

- Git repository (GitHub/GitLab)
- Multiple remotes recommended
- Tag releases

---

## CI/CD Pipeline

### GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: oven-sh/setup-bun@v1
      - run: cd viralsak-backend && bun install
      - run: cd viralsak-backend && bun test
      - run: railway up
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}

  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - run: cd viralsak-frontend && pnpm install
      - run: cd viralsak-frontend && pnpm build
      - run: vercel deploy --prod
        env:
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
```

---

## Troubleshooting

### Common Issues

**1. Database Connection Failed**
```bash
# Check connection string
echo $DATABASE_URL

# Test connection
psql $DATABASE_URL -c "SELECT 1"

# Check firewall rules
# Ensure hosting provider IP is whitelisted
```

**2. CORS Errors**
```typescript
// Backend: Configure CORS
import { cors } from 'hono/cors';

app.use('*', cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
}));
```

**3. Environment Variables Not Loading**
```bash
# Verify variables are set
railway variables

# Restart service
railway restart
```

**4. Build Failures**
```bash
# Check build logs
# Verify all dependencies installed
# Check Node/Bun version compatibility
```

**5. SSL Certificate Issues**
```bash
# Force HTTPS redirect
# Check DNS propagation
# Wait 24-48 hours for DNS
```

---

## Performance Optimization

### Backend

1. **Enable compression**
```typescript
import { compress } from 'hono/compress';
app.use('*', compress());
```

2. **Implement caching**
```typescript
// Cache headers
c.header('Cache-Control', 'public, max-age=300');
```

3. **Database query optimization**
- Add indexes
- Use connection pooling
- Implement query caching

### Frontend

1. **Bundle optimization**
```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
        },
      },
    },
  },
});
```

2. **Asset optimization**
- Compress images
- Use WebP format
- Lazy load components

3. **Code splitting**
- Route-based splitting
- Component lazy loading

---

## Cost Estimation

### Monthly Costs (Estimated)

**Hosting:**
- Backend (Railway): $5-20/month
- Frontend (Vercel): Free - $20/month
- Database (Neon): Free - $19/month

**APIs:**
- Anthropic Claude: $5-50/month (usage-based)
- TikTok API: Free

**Total: $10-90/month** depending on usage

**Free Tier Options:**
- Railway: $5 credit/month
- Vercel: Free for personal projects
- Neon: 0.5 GB free
- Netlify: 100 GB bandwidth free

---

## Maintenance

### Regular Tasks

**Daily:**
- [ ] Monitor error logs
- [ ] Check uptime status
- [ ] Review API usage

**Weekly:**
- [ ] Review performance metrics
- [ ] Check database size
- [ ] Update dependencies

**Monthly:**
- [ ] Review costs
- [ ] Analyze user feedback
- [ ] Plan feature updates
- [ ] Security audit

---

## Rollback Procedure

### Backend Rollback

```bash
# Railway
railway rollback

# Render
# Use dashboard to rollback

# Fly.io
fly releases
fly deploy --image <previous-image>
```

### Frontend Rollback

```bash
# Vercel
vercel rollback

# Netlify
netlify rollback

# Cloudflare
# Use dashboard to rollback
```

---

## Support Resources

- [Railway Documentation](https://docs.railway.app)
- [Vercel Documentation](https://vercel.com/docs)
- [Render Documentation](https://render.com/docs)
- [Neon Documentation](https://neon.tech/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

---

## Checklist

### Pre-Deployment
- [ ] All tests passing
- [ ] Environment variables configured
- [ ] Database migrations ready
- [ ] SSL certificates configured
- [ ] Domain DNS configured
- [ ] Backup strategy in place

### Post-Deployment
- [ ] Health checks passing
- [ ] All features tested
- [ ] Monitoring configured
- [ ] Error tracking enabled
- [ ] Analytics configured
- [ ] Documentation updated

### Production Ready
- [ ] Performance optimized
- [ ] Security hardened
- [ ] Scaling configured
- [ ] Backup verified
- [ ] Team trained
- [ ] Support process defined

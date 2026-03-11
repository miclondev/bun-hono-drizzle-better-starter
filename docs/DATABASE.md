# Database Documentation

Complete database schema and relationship documentation for ViralSak.

## Database Technology

- **Database**: PostgreSQL 14+
- **ORM**: Drizzle ORM
- **Migrations**: Drizzle Kit
- **Connection**: PostgreSQL native driver

## Schema Overview

```
users (better-auth)
  ├── videos (1:many)
  ├── templates (1:many)
  ├── automations (1:many)
  ├── tiktok_connections (1:1)
  └── rss_feeds (1:many)

automations
  └── templates (many:1, optional)
```

## Tables

### 1. users

Managed by better-auth. Core user authentication and profile.

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  email_verified BOOLEAN DEFAULT false,
  image TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Indexes:**
- `PRIMARY KEY (id)`
- `UNIQUE INDEX (email)`

---

### 2. videos

Stores all generated videos and their metadata.

```sql
CREATE TABLE videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  topic VARCHAR(100) NOT NULL,
  script TEXT NOT NULL,
  voice_id VARCHAR(50) NOT NULL,
  bg_style VARCHAR(50) NOT NULL,
  text_style VARCHAR(50) NOT NULL,
  duration INTEGER,
  status VARCHAR(20) NOT NULL DEFAULT 'generating',
  video_url TEXT,
  thumbnail_url TEXT,
  views INTEGER DEFAULT 0,
  tiktok_video_id VARCHAR(100),
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Fields:**
- `id`: Unique video identifier
- `user_id`: Owner of the video
- `title`: Video title (1-200 chars)
- `topic`: Video topic/category (1-100 chars)
- `script`: Full video script (10-5000 chars)
- `voice_id`: Selected voice identifier
- `bg_style`: Background style identifier
- `text_style`: Text overlay style identifier
- `duration`: Video duration in seconds
- `status`: `generating`, `ready`, `posted`, `failed`
- `video_url`: URL to generated video file
- `thumbnail_url`: URL to video thumbnail
- `views`: View count (from TikTok)
- `tiktok_video_id`: TikTok video ID if posted
- `error_message`: Error details if failed
- `created_at`: Creation timestamp
- `updated_at`: Last update timestamp

**Indexes:**
- `PRIMARY KEY (id)`
- `INDEX (user_id)`
- `INDEX (status)`
- `INDEX (created_at)`

**Constraints:**
- `CHECK (status IN ('generating', 'ready', 'posted', 'failed'))`
- `CHECK (duration > 0)`
- `CHECK (views >= 0)`

---

### 3. templates

Reusable video configuration templates.

```sql
CREATE TABLE templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  voice_id VARCHAR(50) NOT NULL,
  bg_style VARCHAR(50) NOT NULL,
  text_style VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Fields:**
- `id`: Unique template identifier
- `user_id`: Template owner
- `name`: Template name (1-100 chars)
- `voice_id`: Default voice
- `bg_style`: Default background
- `text_style`: Default text style
- `created_at`: Creation timestamp

**Indexes:**
- `PRIMARY KEY (id)`
- `INDEX (user_id)`

---

### 4. automations

Scheduled video generation automations.

```sql
CREATE TABLE automations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  topic VARCHAR(100) NOT NULL,
  frequency INTEGER NOT NULL,
  template_id UUID REFERENCES templates(id) ON DELETE SET NULL,
  active BOOLEAN DEFAULT true,
  videos_generated INTEGER DEFAULT 0,
  last_run_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Fields:**
- `id`: Unique automation identifier
- `user_id`: Automation owner
- `name`: Automation name (1-100 chars)
- `topic`: Video topic for generation (1-100 chars)
- `frequency`: Times per day to run (1-10)
- `template_id`: Optional template to use
- `active`: Whether automation is enabled
- `videos_generated`: Count of videos created
- `last_run_at`: Last execution timestamp
- `created_at`: Creation timestamp
- `updated_at`: Last update timestamp

**Indexes:**
- `PRIMARY KEY (id)`
- `INDEX (user_id)`
- `INDEX (active)`
- `INDEX (last_run_at)`

**Constraints:**
- `CHECK (frequency >= 1 AND frequency <= 10)`
- `CHECK (videos_generated >= 0)`

---

### 5. tiktok_connections

TikTok OAuth connection data (one per user).

```sql
CREATE TABLE tiktok_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  token_expires_at TIMESTAMP NOT NULL,
  tiktok_user_id VARCHAR(100) NOT NULL,
  username VARCHAR(100) NOT NULL,
  auto_post BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Fields:**
- `id`: Connection identifier
- `user_id`: User who connected (unique)
- `access_token`: TikTok OAuth access token (encrypted)
- `refresh_token`: TikTok OAuth refresh token (encrypted)
- `token_expires_at`: Token expiration time
- `tiktok_user_id`: TikTok user ID
- `username`: TikTok username
- `auto_post`: Auto-post new videos
- `created_at`: Connection timestamp
- `updated_at`: Last update timestamp

**Indexes:**
- `PRIMARY KEY (id)`
- `UNIQUE INDEX (user_id)`

**Security:**
- Tokens should be encrypted at rest
- Implement token refresh logic
- Clear tokens on disconnect

---

### 6. rss_feeds

RSS feed sources for content generation.

```sql
CREATE TABLE rss_feeds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  label VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Fields:**
- `id`: Feed identifier
- `user_id`: Feed owner
- `url`: RSS feed URL
- `label`: User-friendly name (1-100 chars)
- `created_at`: Creation timestamp

**Indexes:**
- `PRIMARY KEY (id)`
- `INDEX (user_id)`

**Constraints:**
- `CHECK (url LIKE 'http%')`

---

## Relationships

### User → Videos (1:many)
```sql
users.id → videos.user_id
ON DELETE CASCADE
```
When user is deleted, all their videos are deleted.

### User → Templates (1:many)
```sql
users.id → templates.user_id
ON DELETE CASCADE
```
When user is deleted, all their templates are deleted.

### User → Automations (1:many)
```sql
users.id → automations.user_id
ON DELETE CASCADE
```
When user is deleted, all their automations are deleted.

### User → TikTok Connection (1:1)
```sql
users.id → tiktok_connections.user_id (UNIQUE)
ON DELETE CASCADE
```
Each user can have one TikTok connection.

### User → RSS Feeds (1:many)
```sql
users.id → rss_feeds.user_id
ON DELETE CASCADE
```
When user is deleted, all their RSS feeds are deleted.

### Automation → Template (many:1, optional)
```sql
automations.template_id → templates.id
ON DELETE SET NULL
```
When template is deleted, automation's template_id is set to NULL.

---

## Drizzle Schema

### Video Schema

```typescript
import { pgTable, uuid, varchar, text, integer, timestamp, boolean } from 'drizzle-orm/pg-core';
import { users } from './user.schema';

export const videos = pgTable('videos', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 200 }).notNull(),
  topic: varchar('topic', { length: 100 }).notNull(),
  script: text('script').notNull(),
  voiceId: varchar('voice_id', { length: 50 }).notNull(),
  bgStyle: varchar('bg_style', { length: 50 }).notNull(),
  textStyle: varchar('text_style', { length: 50 }).notNull(),
  duration: integer('duration'),
  status: varchar('status', { length: 20 }).notNull().default('generating'),
  videoUrl: text('video_url'),
  thumbnailUrl: text('thumbnail_url'),
  views: integer('views').default(0),
  tiktokVideoId: varchar('tiktok_video_id', { length: 100 }),
  errorMessage: text('error_message'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
```

---

## Queries

### Common Queries

**Get user's videos:**
```typescript
const videos = await db
  .select()
  .from(videos)
  .where(eq(videos.userId, userId))
  .orderBy(desc(videos.createdAt));
```

**Get videos by status:**
```typescript
const readyVideos = await db
  .select()
  .from(videos)
  .where(
    and(
      eq(videos.userId, userId),
      eq(videos.status, 'ready')
    )
  );
```

**Get automation with template:**
```typescript
const automation = await db
  .select()
  .from(automations)
  .leftJoin(templates, eq(automations.templateId, templates.id))
  .where(eq(automations.id, automationId));
```

**Get dashboard stats:**
```typescript
const stats = await db
  .select({
    total: count(),
    posted: count(videos.tiktokVideoId),
    totalViews: sum(videos.views),
  })
  .from(videos)
  .where(eq(videos.userId, userId));
```

---

## Migrations

### Running Migrations

```bash
# Generate migration
bun run db:generate

# Push to database
bun run db:push

# Drop database (development only)
bun run db:drop
```

### Migration Files

Located in `drizzle/` directory:
```
drizzle/
├── 0000_initial_schema.sql
├── 0001_add_tiktok.sql
├── 0002_add_automations.sql
└── meta/
    └── _journal.json
```

---

## Indexes Strategy

### Performance Indexes

1. **User lookups** - All foreign keys indexed
2. **Status filtering** - `videos.status` indexed
3. **Time-based queries** - `created_at`, `last_run_at` indexed
4. **Unique constraints** - Email, TikTok connection

### Query Optimization

```sql
-- Explain query plan
EXPLAIN ANALYZE
SELECT * FROM videos 
WHERE user_id = 'uuid' 
AND status = 'ready'
ORDER BY created_at DESC;

-- Should use indexes:
-- Index Scan on videos_user_id_idx
-- Index Scan on videos_status_idx
```

---

## Data Integrity

### Constraints

1. **Foreign Keys** - Enforce relationships
2. **Check Constraints** - Validate data ranges
3. **Not Null** - Required fields
4. **Unique** - Prevent duplicates
5. **Cascade Deletes** - Clean up related data

### Validation

**Application Layer (Joi):**
```typescript
const createVideoSchema = Joi.object({
  title: Joi.string().min(1).max(200).required(),
  topic: Joi.string().min(1).max(100).required(),
  script: Joi.string().min(10).max(5000).required(),
  // ...
});
```

**Database Layer:**
```sql
ALTER TABLE videos
ADD CONSTRAINT check_status 
CHECK (status IN ('generating', 'ready', 'posted', 'failed'));
```

---

## Backup & Recovery

### Backup Strategy

```bash
# Full backup
pg_dump -U postgres viralsak > backup.sql

# Schema only
pg_dump -U postgres --schema-only viralsak > schema.sql

# Data only
pg_dump -U postgres --data-only viralsak > data.sql
```

### Restore

```bash
# Restore from backup
psql -U postgres viralsak < backup.sql
```

### Automated Backups

```bash
# Daily backup cron job
0 2 * * * pg_dump -U postgres viralsak > /backups/viralsak_$(date +\%Y\%m\%d).sql
```

---

## Performance Tuning

### Connection Pooling

```typescript
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

const client = postgres(DATABASE_URL, {
  max: 10, // Max connections
  idle_timeout: 20,
  connect_timeout: 10,
});

export const db = drizzle(client);
```

### Query Optimization

1. **Use indexes** - Index frequently queried columns
2. **Limit results** - Use pagination
3. **Select specific columns** - Avoid `SELECT *`
4. **Use joins wisely** - Avoid N+1 queries
5. **Cache results** - Use Redis for hot data

### Monitoring

```sql
-- Active connections
SELECT count(*) FROM pg_stat_activity;

-- Slow queries
SELECT query, mean_exec_time 
FROM pg_stat_statements 
ORDER BY mean_exec_time DESC 
LIMIT 10;

-- Table sizes
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

---

## Security

### Best Practices

1. **Encrypt sensitive data** - TikTok tokens, API keys
2. **Use parameterized queries** - Prevent SQL injection
3. **Row-level security** - Users can only access their data
4. **Regular backups** - Disaster recovery
5. **Monitor access** - Log database queries
6. **Least privilege** - Minimal database permissions

### Encryption

```typescript
import crypto from 'crypto';

// Encrypt tokens before storage
function encrypt(text: string): string {
  const cipher = crypto.createCipher('aes-256-cbc', SECRET_KEY);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
}

// Decrypt when needed
function decrypt(encrypted: string): string {
  const decipher = crypto.createDecipher('aes-256-cbc', SECRET_KEY);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}
```

---

## Future Enhancements

### Planned Tables

1. **video_analytics** - Detailed performance metrics
2. **automation_logs** - Execution history
3. **user_preferences** - User settings
4. **notifications** - In-app notifications
5. **api_keys** - User API keys for external access

### Planned Features

1. **Full-text search** - PostgreSQL FTS on scripts/titles
2. **Materialized views** - Pre-computed stats
3. **Partitioning** - Partition videos by date
4. **Replication** - Read replicas for scaling
5. **Audit logs** - Track all data changes

---

## Troubleshooting

### Common Issues

**Connection refused:**
```bash
# Check PostgreSQL is running
pg_isready -h localhost -p 5432

# Check credentials
psql -U postgres -d viralsak
```

**Migration errors:**
```bash
# Reset database (development only)
bun run db:drop
bun run db:push
```

**Slow queries:**
```sql
-- Enable query logging
ALTER DATABASE viralsak SET log_min_duration_statement = 1000;

-- Check for missing indexes
SELECT schemaname, tablename, attname, n_distinct, correlation
FROM pg_stats
WHERE schemaname = 'public'
ORDER BY abs(correlation) DESC;
```

---

## Resources

- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Drizzle ORM Documentation](https://orm.drizzle.team/docs/overview)
- [Database Design Best Practices](https://www.postgresql.org/docs/current/ddl.html)

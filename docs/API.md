# API Documentation

Complete API reference for ViralSak backend.

## Base URL

```
Development: http://localhost:3005
Production: https://your-domain.com
```

## Authentication

All endpoints except OAuth callbacks require authentication via session cookies.

### Headers

```
Content-Type: application/json
Cookie: better_auth.session_token=<token>
```

---

## Authentication Endpoints

### Register User

```http
POST /api/auth/sign-up/email
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "name": "John Doe"
}
```

**Response:** `200 OK`
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "emailVerified": false,
    "createdAt": "2024-03-11T10:00:00Z"
  },
  "session": {
    "token": "session_token",
    "expiresAt": "2024-04-11T10:00:00Z"
  }
}
```

### Login

```http
POST /api/auth/sign-in/email
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response:** `200 OK`
```json
{
  "user": { ... },
  "session": { ... }
}
```

### Logout

```http
POST /api/auth/sign-out
```

**Response:** `200 OK`

### Get Session

```http
GET /api/auth/get-session
```

**Response:** `200 OK`
```json
{
  "user": { ... },
  "session": { ... }
}
```

---

## Video Endpoints

### List Videos

```http
GET /api/v1/videos?status=ready&search=topic
```

**Query Parameters:**
- `status` (optional): Filter by status (`generating`, `ready`, `posted`, `failed`)
- `search` (optional): Search by title or topic

**Response:** `200 OK`
```json
{
  "videos": [
    {
      "id": "uuid",
      "userId": "uuid",
      "title": "Amazing Video Title",
      "topic": "Technology",
      "script": "Video script content...",
      "voiceId": "voice-1",
      "bgStyle": "gradient-1",
      "textStyle": "modern",
      "duration": 60,
      "status": "ready",
      "videoUrl": "https://...",
      "thumbnailUrl": "https://...",
      "views": 1250,
      "tiktokVideoId": null,
      "errorMessage": null,
      "createdAt": "2024-03-11T10:00:00Z",
      "updatedAt": "2024-03-11T10:05:00Z"
    }
  ]
}
```

### Get Video

```http
GET /api/v1/videos/:id
```

**Response:** `200 OK`
```json
{
  "video": { ... }
}
```

**Errors:**
- `404` - Video not found

### Create Video

```http
POST /api/v1/videos
```

**Request Body:**
```json
{
  "title": "Amazing Video Title",
  "topic": "Technology",
  "script": "Video script content...",
  "voiceId": "voice-1",
  "bgStyle": "gradient-1",
  "textStyle": "modern"
}
```

**Response:** `201 Created`
```json
{
  "video": { ... }
}
```

**Validation:**
- `title`: Required, 1-200 characters
- `topic`: Required, 1-100 characters
- `script`: Required, 10-5000 characters
- `voiceId`: Required
- `bgStyle`: Required
- `textStyle`: Required

### Update Video

```http
PATCH /api/v1/videos/:id
```

**Request Body:**
```json
{
  "title": "Updated Title",
  "status": "ready"
}
```

**Response:** `200 OK`
```json
{
  "video": { ... }
}
```

### Delete Video

```http
DELETE /api/v1/videos/:id
```

**Response:** `200 OK`
```json
{
  "message": "Video deleted successfully"
}
```

### Regenerate Video

```http
POST /api/v1/videos/:id/regenerate
```

**Response:** `200 OK`
```json
{
  "video": { ... },
  "message": "Video regeneration started"
}
```

### Post to TikTok

```http
POST /api/v1/videos/:id/post-to-tiktok
```

**Response:** `200 OK`
```json
{
  "video": { ... },
  "message": "Video posted to TikTok successfully"
}
```

**Errors:**
- `400` - TikTok not connected or video not ready
- `404` - Video not found

---

## AI Endpoints

### Generate Script

```http
POST /api/v1/videos/ai/generate-script
```

**Request Body:**
```json
{
  "topic": "The science of sleep",
  "duration": 60
}
```

**Response:** `200 OK`
```json
{
  "script": "Did you know that your brain is more active during sleep than when you're awake? Let me explain why...\n\n[Generated script content]"
}
```

**Validation:**
- `topic`: Required, non-empty string
- `duration`: Optional, number (default: 60)

**Features:**
- Uses Claude 3.5 Sonnet
- Optimized for viral short-form content
- ~2.5 words per second pacing
- Hook in first 3 seconds
- No hashtags or emojis

### Generate Title

```http
POST /api/v1/videos/ai/generate-title
```

**Request Body:**
```json
{
  "topic": "The science of sleep"
}
```

**Response:** `200 OK`
```json
{
  "title": "The Dark Truth About Sleep Nobody Tells You"
}
```

**Features:**
- Maximum 60 characters
- Attention-grabbing
- Click-worthy but not clickbait

### Improve Script

```http
POST /api/v1/videos/ai/improve-script
```

**Request Body:**
```json
{
  "script": "Original script content..."
}
```

**Response:** `200 OK`
```json
{
  "script": "Improved script with better hook and pacing..."
}
```

**Features:**
- Stronger hook
- Better pacing
- More emotional impact
- Maintains original message

---

## Template Endpoints

### List Templates

```http
GET /api/v1/templates
```

**Response:** `200 OK`
```json
{
  "templates": [
    {
      "id": "uuid",
      "userId": "uuid",
      "name": "Tech News Template",
      "voiceId": "voice-1",
      "bgStyle": "gradient-1",
      "textStyle": "modern",
      "createdAt": "2024-03-11T10:00:00Z"
    }
  ]
}
```

### Create Template

```http
POST /api/v1/templates
```

**Request Body:**
```json
{
  "name": "Tech News Template",
  "voiceId": "voice-1",
  "bgStyle": "gradient-1",
  "textStyle": "modern"
}
```

**Response:** `201 Created`
```json
{
  "template": { ... }
}
```

### Delete Template

```http
DELETE /api/v1/templates/:id
```

**Response:** `200 OK`
```json
{
  "message": "Template deleted successfully"
}
```

---

## Automation Endpoints

### List Automations

```http
GET /api/v1/automations
```

**Response:** `200 OK`
```json
{
  "automations": [
    {
      "id": "uuid",
      "userId": "uuid",
      "name": "Daily Tech News",
      "topic": "Technology",
      "frequency": 2,
      "templateId": "uuid",
      "active": true,
      "videosGenerated": 48,
      "lastRunAt": "2024-03-11T08:00:00Z",
      "createdAt": "2024-03-01T10:00:00Z",
      "updatedAt": "2024-03-11T08:00:00Z"
    }
  ]
}
```

### Create Automation

```http
POST /api/v1/automations
```

**Request Body:**
```json
{
  "name": "Daily Tech News",
  "topic": "Technology",
  "frequency": 2,
  "templateId": "uuid",
  "active": true
}
```

**Response:** `201 Created`
```json
{
  "automation": { ... }
}
```

**Validation:**
- `name`: Required, 1-100 characters
- `topic`: Required, 1-100 characters
- `frequency`: Required, 1-10 (times per day)
- `templateId`: Optional
- `active`: Optional, boolean (default: true)

### Update Automation

```http
PATCH /api/v1/automations/:id
```

**Request Body:**
```json
{
  "name": "Updated Name",
  "frequency": 3,
  "active": false
}
```

**Response:** `200 OK`
```json
{
  "automation": { ... }
}
```

### Delete Automation

```http
DELETE /api/v1/automations/:id
```

**Response:** `200 OK`
```json
{
  "message": "Automation deleted successfully"
}
```

### Toggle Automation

```http
POST /api/v1/automations/:id/toggle
```

**Response:** `200 OK`
```json
{
  "automation": { ... },
  "message": "Automation toggled successfully"
}
```

---

## TikTok Endpoints

### Get OAuth URL

```http
GET /api/v1/tiktok/oauth-url
```

**Response:** `200 OK`
```json
{
  "authUrl": "https://www.tiktok.com/v2/auth/authorize?client_key=..."
}
```

### OAuth Callback

```http
GET /api/v1/tiktok/oauth/callback?code=xxx&state=xxx
```

**Response:** `302 Redirect`
Redirects to frontend with success/error status

### Get Connection Status

```http
GET /api/v1/tiktok/status
```

**Response:** `200 OK`
```json
{
  "connected": true,
  "username": "myusername",
  "connectedAt": "2024-03-11T10:00:00Z",
  "autoPost": true
}
```

### Disconnect Account

```http
DELETE /api/v1/tiktok/disconnect
```

**Response:** `200 OK`
```json
{
  "message": "TikTok account disconnected successfully"
}
```

---

## RSS Feed Endpoints

### List RSS Feeds

```http
GET /api/v1/rss-feeds
```

**Response:** `200 OK`
```json
{
  "feeds": [
    {
      "id": "uuid",
      "userId": "uuid",
      "url": "https://example.com/feed.rss",
      "label": "Tech News",
      "createdAt": "2024-03-11T10:00:00Z"
    }
  ]
}
```

### Create RSS Feed

```http
POST /api/v1/rss-feeds
```

**Request Body:**
```json
{
  "url": "https://example.com/feed.rss",
  "label": "Tech News"
}
```

**Response:** `201 Created`
```json
{
  "feed": { ... }
}
```

**Validation:**
- `url`: Required, valid URL
- `label`: Required, 1-100 characters

### Delete RSS Feed

```http
DELETE /api/v1/rss-feeds/:id
```

**Response:** `200 OK`
```json
{
  "message": "RSS feed deleted successfully"
}
```

---

## Stats Endpoints

### Get Dashboard Stats

```http
GET /api/v1/stats/dashboard
```

**Response:** `200 OK`
```json
{
  "stats": {
    "videosGenerated": 156,
    "posted": 89,
    "scheduled": 12,
    "totalViews": 45230,
    "activeAutomations": 5,
    "totalAutomations": 8,
    "templates": 12
  },
  "recentVideos": [
    {
      "id": "uuid",
      "title": "Video Title",
      "status": "posted",
      "views": 1250,
      "topic": "Technology",
      "createdAt": "2024-03-11T10:00:00Z"
    }
  ],
  "topTopics": [
    {
      "topic": "Technology",
      "count": 45
    }
  ],
  "performanceData": [
    {
      "date": "2024-03-11",
      "views": 1250
    }
  ]
}
```

---

## Error Responses

### Standard Error Format

```json
{
  "error": "Error message description"
}
```

### HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (not authenticated)
- `403` - Forbidden (not authorized)
- `404` - Not Found
- `500` - Internal Server Error

### Common Errors

**Validation Error (400):**
```json
{
  "error": "\"topic\" is required"
}
```

**Authentication Error (401):**
```json
{
  "error": "Unauthorized"
}
```

**Not Found (404):**
```json
{
  "error": "Video not found"
}
```

**Server Error (500):**
```json
{
  "error": "Internal server error"
}
```

---

## Rate Limiting

Currently no rate limiting is implemented. Consider implementing rate limiting for production:

- Authentication endpoints: 5 requests per minute
- AI endpoints: 10 requests per minute
- Other endpoints: 100 requests per minute

---

## Webhooks (Future)

Planned webhook support for:
- Video generation completed
- Video posted to TikTok
- Automation triggered
- Error notifications

---

## API Versioning

Current version: `v1`

All endpoints are prefixed with `/api/v1/`

Future versions will be available at `/api/v2/`, etc.

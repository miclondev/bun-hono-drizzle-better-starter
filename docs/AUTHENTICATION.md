# Authentication Documentation

Complete guide to authentication in ViralSak using better-auth.

## Overview

ViralSak uses **better-auth** for authentication, providing:
- Email/Password authentication
- Google OAuth (optional)
- Session management
- Password reset
- Protected routes

## Backend Configuration

### better-auth Setup

Located in `viralsak-backend/src/utils/auth.ts`:

```typescript
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: schema,
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    sendResetPassword: async ({ user, url }) => {
      // Email sending logic here
    },
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    },
  },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 60 * 60 * 24 * 7, // 7 days
    },
  },
});
```

### Environment Variables

Add to `viralsak-backend/.env`:

```bash
# Required for authentication
BETTER_AUTH_SECRET=<generate-secure-random-string>
BETTER_AUTH_URL=http://localhost:3005
FRONTEND_URL=http://localhost:5173

# Optional: Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Optional: Email service (for password reset)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

### Auth Routes

better-auth automatically handles these routes:

```
POST   /api/auth/sign-up/email       - Register with email
POST   /api/auth/sign-in/email       - Login with email
POST   /api/auth/sign-out            - Logout
GET    /api/auth/get-session         - Get current session
POST   /api/auth/forget-password     - Request password reset
POST   /api/auth/reset-password      - Reset password with token
GET    /api/auth/sign-in/google      - Google OAuth login
GET    /api/auth/callback/google     - Google OAuth callback
```

### CORS Configuration

Ensure CORS allows the frontend URL:

```typescript
cors({
  origin: [
    "http://localhost:5173", // Vite dev server
    process.env.FRONTEND_URL,
  ],
  credentials: true,
})
```

---

## Frontend Implementation

### AuthContext

Located in `viralsak-frontend/src/contexts/AuthContext.tsx`:

```typescript
const { user, isLoading, login, register, logout, resetPassword } = useAuth();
```

**Available Methods:**

1. **`login(email, password)`** - Sign in with email/password
2. **`register(email, password, name)`** - Create new account
3. **`logout()`** - Sign out user
4. **`loginWithGoogle()`** - Sign in with Google
5. **`resetPassword(email)`** - Request password reset email

**User Object:**
```typescript
{
  id: string;
  email: string;
  name: string;
  avatar?: string;
}
```

### Authentication Pages

#### 1. Login Page (`/login`)

Features:
- Email/password login
- Google OAuth button
- "Forgot password?" link
- Link to register page
- Form validation
- Loading states

#### 2. Register Page (`/register`)

Features:
- Email/password registration
- Name field
- Google OAuth button
- Link to login page
- Form validation
- Password strength indicator

#### 3. Forgot Password Page (`/forgot-password`)

Features:
- Email input
- Send reset link
- Success confirmation
- Back to login link

#### 4. Reset Password Page (`/reset-password`)

Features:
- New password input
- Password confirmation
- Token validation
- Success/error handling

---

## Usage Examples

### Protected Routes

```typescript
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

function ProtectedRoute({ children }) {
  const { user, isLoading } = useAuth();
  
  if (isLoading) return <LoadingSpinner />;
  if (!user) return <Navigate to="/login" />;
  
  return children;
}
```

### Login Form

```typescript
import { useAuth } from '@/contexts/AuthContext';

function LoginForm() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (error) {
      toast({ title: 'Login failed', variant: 'destructive' });
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <button type="submit">Sign In</button>
    </form>
  );
}
```

### Register Form

```typescript
const { register } = useAuth();

const handleRegister = async (e) => {
  e.preventDefault();
  try {
    await register(email, password, name);
    navigate('/dashboard');
  } catch (error) {
    toast({ title: 'Registration failed', variant: 'destructive' });
  }
};
```

### Logout

```typescript
const { logout } = useAuth();

const handleLogout = async () => {
  await logout();
  navigate('/login');
};
```

### Password Reset

```typescript
const { resetPassword } = useAuth();

const handleResetPassword = async (e) => {
  e.preventDefault();
  try {
    await resetPassword(email);
    toast({ title: 'Reset link sent to your email' });
  } catch (error) {
    toast({ title: 'Failed to send reset link', variant: 'destructive' });
  }
};
```

---

## Session Management

### Session Duration

- **Default**: 7 days
- **Cookie-based**: Secure, httpOnly cookies
- **Auto-refresh**: Session automatically refreshed on activity

### Session Checking

The AuthContext automatically checks for an existing session on mount:

```typescript
useEffect(() => {
  const checkSession = async () => {
    const response = await fetch('/api/auth/get-session', {
      credentials: 'include',
    });
    if (response.ok) {
      const data = await response.json();
      setUser(data.user);
    }
  };
  checkSession();
}, []);
```

---

## Google OAuth Setup

### 1. Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable Google+ API
4. Go to Credentials → Create Credentials → OAuth 2.0 Client ID
5. Add authorized redirect URIs:
   - `http://localhost:3005/api/auth/callback/google` (development)
   - `https://your-domain.com/api/auth/callback/google` (production)

### 2. Configure Environment Variables

```bash
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
```

### 3. Frontend Integration

```typescript
const { loginWithGoogle } = useAuth();

<button onClick={loginWithGoogle}>
  Sign in with Google
</button>
```

---

## Password Reset Flow

### 1. User Requests Reset

```typescript
// User enters email on /forgot-password
await resetPassword(email);
```

### 2. Backend Sends Email

```typescript
emailAndPassword: {
  sendResetPassword: async ({ user, url }) => {
    await sendEmail({
      to: user.email,
      subject: 'Reset your password',
      html: `Click here to reset: ${url}`,
    });
  },
}
```

### 3. User Clicks Link

Email contains link like:
```
http://localhost:5173/reset-password?token=abc123
```

### 4. User Sets New Password

```typescript
// On /reset-password page
const token = new URLSearchParams(location.search).get('token');

await fetch('/api/auth/reset-password', {
  method: 'POST',
  body: JSON.stringify({ token, password: newPassword }),
});
```

---

## Email Service Configuration

### Using Gmail

```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

**Note**: Use App Password, not regular password. Generate at:
https://myaccount.google.com/apppasswords

### Using SendGrid

```bash
SENDGRID_API_KEY=your_api_key
```

### Using Resend

```bash
RESEND_API_KEY=your_api_key
```

### Implementation Example

```typescript
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

emailAndPassword: {
  sendResetPassword: async ({ user, url }) => {
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: user.email,
      subject: 'Reset your password - ViralSak',
      html: `
        <h1>Reset your password</h1>
        <p>Click the link below to reset your password:</p>
        <a href="${url}">Reset Password</a>
        <p>This link expires in 1 hour.</p>
      `,
    });
  },
}
```

---

## Security Best Practices

### 1. Environment Variables

- ✅ Never commit `.env` files
- ✅ Use strong random strings for secrets
- ✅ Rotate secrets regularly
- ✅ Use different secrets for dev/prod

### 2. Password Requirements

```typescript
// Enforce in validation
const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain uppercase letter')
  .regex(/[a-z]/, 'Password must contain lowercase letter')
  .regex(/[0-9]/, 'Password must contain number');
```

### 3. Rate Limiting

better-auth includes built-in rate limiting:

```typescript
rateLimit: {
  window: 10, // seconds
  max: 100,   // requests per window
}
```

### 4. HTTPS in Production

```typescript
advanced: {
  defaultCookieAttributes: {
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  },
}
```

### 5. CORS Configuration

Only allow trusted origins:

```typescript
trustedOrigins: [
  process.env.FRONTEND_URL,
  // Add other trusted domains
]
```

---

## Troubleshooting

### "Session not found" Error

**Cause**: Cookies not being sent
**Solution**: Ensure `credentials: 'include'` in fetch requests

```typescript
fetch('/api/auth/get-session', {
  credentials: 'include',
});
```

### CORS Errors

**Cause**: Frontend URL not in trusted origins
**Solution**: Add to backend config:

```typescript
trustedOrigins: ['http://localhost:5173']
```

### Google OAuth Not Working

**Causes**:
1. Missing environment variables
2. Incorrect redirect URI
3. Google+ API not enabled

**Solution**: Verify all Google OAuth setup steps

### Password Reset Email Not Sending

**Cause**: Email service not configured
**Solution**: 
1. Configure SMTP settings
2. Implement `sendResetPassword` function
3. Check email service logs

### Session Expires Too Quickly

**Solution**: Increase session duration:

```typescript
session: {
  cookieCache: {
    maxAge: 60 * 60 * 24 * 30, // 30 days
  },
}
```

---

## Testing Authentication

### Manual Testing

1. **Register**: Create new account at `/register`
2. **Login**: Sign in at `/login`
3. **Protected Routes**: Try accessing `/dashboard` without login
4. **Logout**: Sign out and verify redirect
5. **Password Reset**: Request reset at `/forgot-password`

### E2E Tests

See `tests/auth.spec.ts` for Playwright tests:

```bash
pnpm test:e2e auth.spec.ts
```

---

## Migration from Other Auth Systems

### From NextAuth

better-auth is similar to NextAuth but simpler:

**NextAuth:**
```typescript
import NextAuth from 'next-auth';
```

**better-auth:**
```typescript
import { betterAuth } from 'better-auth';
```

### From Clerk

better-auth gives you more control:

**Clerk:**
```typescript
<ClerkProvider>
```

**better-auth:**
```typescript
<AuthProvider>
```

---

## API Reference

### Backend

```typescript
// Get auth instance
import { auth } from '@/utils/auth';

// Check session in middleware
const session = await auth.api.getSession({ headers: request.headers });

// Create session
await auth.api.signInEmail({ email, password });

// Delete session
await auth.api.signOut({ headers: request.headers });
```

### Frontend

```typescript
// Get auth context
const { user, isLoading, login, register, logout, resetPassword } = useAuth();

// Check if authenticated
if (user) {
  // User is logged in
}

// Get user info
console.log(user.email, user.name);
```

---

## Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Configure production `FRONTEND_URL`
- [ ] Set strong `BETTER_AUTH_SECRET`
- [ ] Enable HTTPS
- [ ] Configure email service
- [ ] Set up Google OAuth (optional)
- [ ] Test all auth flows
- [ ] Enable email verification (optional)
- [ ] Set up monitoring
- [ ] Configure backup/recovery

---

## Resources

- [better-auth Documentation](https://better-auth.com)
- [better-auth GitHub](https://github.com/better-auth/better-auth)
- [Drizzle Adapter](https://better-auth.com/docs/adapters/drizzle)
- [Google OAuth Setup](https://developers.google.com/identity/protocols/oauth2)

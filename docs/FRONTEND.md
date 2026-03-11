# Frontend Documentation

Complete guide to the ViralSak frontend architecture, components, and patterns.

## Tech Stack

- **Framework**: React 18
- **Build Tool**: Vite
- **Language**: TypeScript
- **Styling**: TailwindCSS + shadcn/ui
- **State Management**: React Query (TanStack Query)
- **Routing**: React Router v6
- **Animations**: Framer Motion
- **Forms**: React Hook Form (planned)
- **i18n**: react-i18next
- **Code Quality**: Biome

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui components
│   ├── dashboard/      # Dashboard-specific components
│   ├── generator/      # Video generator components
│   ├── automations/    # Automation components
│   └── landing/        # Landing page components
│
├── contexts/           # React contexts
│   └── AuthContext.tsx # Authentication context
│
├── hooks/              # Custom React hooks
│   ├── useApiClient.ts      # API client hook
│   ├── use-videos.ts        # Video operations
│   ├── use-templates.ts     # Template operations
│   ├── use-automations.ts   # Automation operations
│   ├── use-tiktok.ts        # TikTok integration
│   ├── use-rss-feeds.ts     # RSS feed operations
│   ├── use-stats.ts         # Dashboard stats
│   └── use-toast.ts         # Toast notifications
│
├── pages/              # Page components
│   ├── DashboardHome.tsx
│   ├── VideoLibrary.tsx
│   ├── VideoGenerator.tsx
│   ├── AutomationStudio.tsx
│   ├── SettingsPage.tsx
│   ├── LoginPage.tsx
│   └── RegisterPage.tsx
│
├── types/              # TypeScript type definitions
│   ├── api.ts          # Shared API types
│   ├── video.ts        # Video types
│   ├── template.ts     # Template types
│   ├── automation.ts   # Automation types
│   ├── tiktok.ts       # TikTok types
│   ├── rss-feed.ts     # RSS feed types
│   └── stats.ts        # Stats types
│
├── constants/          # Constants and configuration
│   └── endpoints.ts    # API endpoint definitions
│
├── lib/                # Utility functions
│   ├── utils.ts        # General utilities
│   └── templates.ts    # Template utilities
│
├── i18n/               # Internationalization
│   └── index.ts        # i18n configuration
│
└── App.tsx             # Root component
```

## Core Concepts

### 1. API Client Pattern

All API calls use a centralized `useApiClient` hook:

```typescript
const { get, post, patch, delete: del } = useApiClient();

// Automatically handles:
// - Authentication headers
// - Base URL configuration
// - Error handling
// - Response parsing
```

### 2. React Query Hooks

Each feature has dedicated React Query hooks:

```typescript
// Videos
const { data: videos, isLoading } = useVideos({ status: 'ready' });
const createVideo = useCreateVideo();
const deleteVideo = useDeleteVideo();

// Automations
const { data: automations } = useAutomations();
const createAutomation = useCreateAutomation();
const toggleAutomation = useToggleAutomation();
```

**Benefits:**
- Automatic caching
- Background refetching
- Optimistic updates
- Loading/error states
- Request deduplication

### 3. Type Safety

Shared type system ensures frontend-backend consistency:

```typescript
// src/types/api.ts - Single source of truth
export interface Video {
  id: string;
  title: string;
  status: VideoStatus;
  // ... matches backend exactly
}

// Re-exported in feature files
export type { Video } from './api';
```

### 4. Component Patterns

**Container/Presentation Pattern:**
```typescript
// Page component (container)
export default function VideoLibrary() {
  const { data: videos } = useVideos();
  return <VideoGrid videos={videos} />;
}

// Presentational component
function VideoGrid({ videos }: { videos: Video[] }) {
  return <div>{videos.map(v => <VideoCard video={v} />)}</div>;
}
```

## Key Components

### Authentication

**AuthContext** - Manages authentication state

```typescript
const { user, login, logout, isAuthenticated } = useAuth();

// Features:
// - Session management
// - Auto-refresh
// - Protected routes
// - Login/logout handlers
```

### Dashboard Components

**DashboardHome** - Main dashboard
- Real-time stats
- Recent videos
- Performance charts
- Top topics

**StatCard** - Animated stat display
- Counter animations
- Icon support
- Color variants

**RecentVideoRow** - Video list item
- Status badges
- View counts
- Action buttons

### Video Generator

**Multi-step wizard pattern:**

1. **ScriptStep** - Topic input & AI generation
2. **VoiceStep** - Voice selection
3. **BackgroundStep** - Background style
4. **TextStyleStep** - Text overlay style
5. **GenerateStep** - Final review & generation

**Features:**
- Step validation
- Progress indicator
- Back/Next navigation
- Loading states
- Error handling

### Video Library

**VideoLibrary** - Video management
- Grid/list view
- Status filtering
- Search functionality
- Bulk actions
- Post to TikTok
- Delete/regenerate

### Automation Studio

**AutomationStudio** - Automation management
- Create/edit automations
- Toggle active status
- Template selection
- Frequency configuration
- Stats display

### Settings

**SettingsPage** - User settings
- TikTok OAuth integration
- RSS feed management
- API key configuration
- Account settings

## Hooks Reference

### useVideos

```typescript
const { data: videos, isLoading, error } = useVideos(filters);

// Filters (optional)
{
  status?: 'generating' | 'ready' | 'posted' | 'failed';
  search?: string;
}
```

### useCreateVideo

```typescript
const createVideo = useCreateVideo();

await createVideo.mutateAsync({
  title: "Video Title",
  topic: "Topic",
  script: "Script content",
  voiceId: "voice-1",
  bgStyle: "gradient-1",
  textStyle: "modern"
});
```

### useGenerateScript (AI)

```typescript
const generateScript = useGenerateScript();

const script = await generateScript.mutateAsync({
  topic: "The science of sleep",
  duration: 60
});
```

### useAutomations

```typescript
const { data: automations } = useAutomations();

// Returns array of automations with:
// - name, topic, frequency
// - active status
// - videosGenerated count
// - lastRunAt timestamp
```

### useTikTokStatus

```typescript
const { data: status } = useTikTokStatus();

// Returns:
{
  connected: boolean;
  username?: string;
  connectedAt?: string;
  autoPost?: boolean;
}
```

## Styling Guide

### TailwindCSS Classes

**Common patterns:**
```css
/* Glass morphism cards */
.glass-card {
  @apply bg-card/50 backdrop-blur-sm border border-border/40 rounded-2xl;
}

/* Neon button */
.neon-btn {
  @apply bg-gradient-to-r from-primary to-primary/80 hover:shadow-lg;
}

/* Neon text */
.neon-text-green {
  @apply text-neon-green;
}
```

### Animation Patterns

**Framer Motion variants:**
```typescript
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};
```

**Usage:**
```tsx
<motion.div variants={container} initial="hidden" animate="show">
  {items.map(item => (
    <motion.div key={item.id} variants={item}>
      {item.content}
    </motion.div>
  ))}
</motion.div>
```

## State Management

### React Query Configuration

```typescript
// Query client setup
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});
```

### Cache Invalidation

```typescript
// After mutation, invalidate related queries
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: videoKeys.all });
}
```

### Optimistic Updates

```typescript
const deleteVideo = useDeleteVideo();

// Optimistically remove from UI
queryClient.setQueryData(videoKeys.list(), (old) => 
  old.filter(v => v.id !== deletedId)
);
```

## Routing

### Route Structure

```typescript
<Routes>
  <Route path="/" element={<LandingPage />} />
  <Route path="/login" element={<LoginPage />} />
  <Route path="/register" element={<RegisterPage />} />
  
  {/* Protected routes */}
  <Route element={<ProtectedRoute />}>
    <Route path="/dashboard" element={<DashboardHome />} />
    <Route path="/library" element={<VideoLibrary />} />
    <Route path="/generator" element={<VideoGenerator />} />
    <Route path="/automations" element={<AutomationStudio />} />
    <Route path="/settings" element={<SettingsPage />} />
  </Route>
</Routes>
```

### Protected Routes

```typescript
function ProtectedRoute() {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return <Outlet />;
}
```

## Internationalization

### Usage

```typescript
const { t } = useTranslation();

<h1>{t('dashboard.title')}</h1>
<p>{t('dashboard.subtitle')}</p>
```

### Adding Translations

```typescript
// src/i18n/locales/en.json
{
  "dashboard": {
    "title": "Dashboard",
    "subtitle": "Welcome back!"
  }
}
```

## Error Handling

### API Errors

```typescript
try {
  await createVideo.mutateAsync(data);
  toast({
    title: "Success",
    description: "Video created successfully"
  });
} catch (error) {
  toast({
    title: "Error",
    description: error instanceof Error ? error.message : "Failed",
    variant: "destructive"
  });
}
```

### Error Boundaries

```typescript
<ErrorBoundary fallback={<ErrorPage />}>
  <App />
</ErrorBoundary>
```

## Performance Optimization

### Code Splitting

```typescript
// Lazy load pages
const VideoLibrary = lazy(() => import('./pages/VideoLibrary'));

<Suspense fallback={<LoadingSpinner />}>
  <VideoLibrary />
</Suspense>
```

### Memoization

```typescript
// Expensive computations
const sortedVideos = useMemo(() => 
  videos.sort((a, b) => b.views - a.views),
  [videos]
);

// Callback stability
const handleClick = useCallback(() => {
  // handler logic
}, [dependencies]);
```

### Virtual Lists

For large lists, consider using `react-virtual`:

```typescript
import { useVirtualizer } from '@tanstack/react-virtual';

const virtualizer = useVirtualizer({
  count: videos.length,
  getScrollElement: () => parentRef.current,
  estimateSize: () => 100,
});
```

## Testing

### Component Tests

```typescript
import { render, screen } from '@testing-library/react';
import { VideoCard } from './VideoCard';

test('renders video card', () => {
  render(<VideoCard video={mockVideo} />);
  expect(screen.getByText('Video Title')).toBeInTheDocument();
});
```

### Hook Tests

```typescript
import { renderHook, waitFor } from '@testing-library/react';
import { useVideos } from './use-videos';

test('fetches videos', async () => {
  const { result } = renderHook(() => useVideos());
  
  await waitFor(() => {
    expect(result.current.data).toBeDefined();
  });
});
```

## Build & Deployment

### Development

```bash
pnpm dev          # Start dev server
pnpm build        # Production build
pnpm preview      # Preview production build
pnpm lint         # Run Biome linter
pnpm format       # Format code
```

### Environment Variables

```bash
# .env
VITE_API_URL=http://localhost:3005

# .env.production
VITE_API_URL=https://api.yourdomain.com
```

### Build Optimization

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['framer-motion', '@radix-ui/react-dialog'],
          'query-vendor': ['@tanstack/react-query'],
        },
      },
    },
  },
});
```

## Best Practices

### 1. Component Organization

- One component per file
- Co-locate related components
- Use index files for exports
- Keep components small and focused

### 2. Type Safety

- Always define prop interfaces
- Use strict TypeScript settings
- Avoid `any` types
- Leverage type inference

### 3. Performance

- Lazy load routes
- Memoize expensive computations
- Use React Query for caching
- Optimize images and assets

### 4. Accessibility

- Use semantic HTML
- Add ARIA labels
- Keyboard navigation
- Screen reader support

### 5. Code Quality

- Run Biome before commits
- Write meaningful commit messages
- Keep functions pure when possible
- Document complex logic

## Common Patterns

### Loading States

```typescript
if (isLoading) return <LoadingSpinner />;
if (error) return <ErrorMessage error={error} />;
if (!data) return <EmptyState />;

return <DataDisplay data={data} />;
```

### Form Handling

```typescript
const [formData, setFormData] = useState(initialState);

const handleSubmit = async (e: FormEvent) => {
  e.preventDefault();
  await mutation.mutateAsync(formData);
};
```

### Modal Dialogs

```typescript
const [open, setOpen] = useState(false);

<Dialog open={open} onOpenChange={setOpen}>
  <DialogTrigger>Open</DialogTrigger>
  <DialogContent>
    {/* Content */}
  </DialogContent>
</Dialog>
```

## Troubleshooting

### TypeScript Errors

```bash
# Restart TS server in VSCode
Cmd+Shift+P → "TypeScript: Restart TS Server"

# Check for errors
pnpm exec tsc --noEmit
```

### Build Errors

```bash
# Clear cache
rm -rf node_modules/.vite
pnpm install

# Rebuild
pnpm build
```

### Hot Reload Issues

```bash
# Restart dev server
# Check for circular dependencies
# Verify import paths
```

## Resources

- [React Documentation](https://react.dev)
- [TanStack Query](https://tanstack.com/query)
- [shadcn/ui](https://ui.shadcn.com)
- [Framer Motion](https://www.framer.com/motion)
- [TailwindCSS](https://tailwindcss.com)

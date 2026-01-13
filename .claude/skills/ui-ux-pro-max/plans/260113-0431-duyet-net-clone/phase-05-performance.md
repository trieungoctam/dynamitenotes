---
title: "Phase 5: Performance Optimization"
description: "Optimize Core Web Vitals, implement lazy loading, image optimization"
status: pending
priority: P2
effort: 3h
---

## Context

**Source:** [Blog Best Practices](../../reports/researcher-260113-0419-modern-blog-best-practices.md)

**Target:** LCP < 2.5s, INP < 200ms, CLS < 0.1

## Requirements

From best practices research, must implement:

### Core Web Vitals
- LCP: Preload critical resources, optimize images
- INP: Reduce JavaScript execution, debounce inputs
- CLS: Reserve space for dynamic content, font loading

### Code Splitting
- Route-based code splitting with React.lazy
- Lazy load below-fold images
- Optimize bundle size

### Image Optimization
- WebP format with JPEG fallback
- Responsive images with srcset
- Supabase image transforms

## Implementation Steps

### Step 1: Preload Critical Resources (30 min)

Update `index.html`:

```html
<!-- Preload LCP image (if hero image exists) -->
<link rel="preload" as="image" href="/hero.webp" fetchpriority="high">

<!-- Preload critical fonts -->
<link rel="preload" as="font" href="/fonts/inter-400.woff2" type="font/woff2" crossorigin>
<link rel="preload" as="font" href="/fonts/libre-baskerville-700.woff2" type="font/woff2" crossorigin>
```

Update font loading strategy:

```css
/* src/index.css */
@font-face {
  font-family: 'Inter';
  src: url('/fonts/inter-400.woff2') format('woff2');
  font-weight: 400;
  font-display: swap; /* Prevent layout shift */
}
```

**Success:** Critical resources preloaded, fonts use `font-display: swap`

### Step 2: Route-Based Code Splitting (30 min)

Update `App.tsx`:

```typescript
import { lazy, Suspense } from 'react';
import { LoadingSkeleton } from './components/ui/LoadingSkeleton';

// Lazy load routes
const Index = lazy(() => import('./pages/Index'));
const Posts = lazy(() => import('./pages/Posts'));
const PostDetail = lazy(() => import('./pages/PostDetail'));
const Series = lazy(() => import('./pages/Series'));
const About = lazy(() => import('./pages/About'));
const Login = lazy(() => import('./pages/Login'));

// Admin routes already lazy loaded
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));

function App() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/posts" element={<Posts />} />
        <Route path="/posts/:slug" element={<PostDetail />} />
        <Route path="/series" element={<Series />} />
        <Route path="/about" element={<About />} />
        <Route path="/login" element={<Login />} />

        {/* Admin routes */}
        <Route path="/admin/*" element={<AdminDashboard />} />
      </Routes>
    </Suspense>
  );
}
```

Create loading skeleton:

```typescript
// src/components/ui/LoadingSkeleton.tsx
export function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-cream">
      <div className="container max-w-4xl mx-auto px-4 py-10">
        <div className="animate-pulse space-y-8">
          {/* Header skeleton */}
          <div className="h-8 bg-neutral-200 rounded w-1/4"></div>

          {/* Title skeleton */}
          <div className="h-16 bg-neutral-200 rounded w-3/4"></div>

          {/* Card skeletons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-48 bg-neutral-200 rounded-2xl"></div>
            <div className="h-48 bg-neutral-200 rounded-2xl"></div>
          </div>

          {/* Post list skeletons */}
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center gap-4">
                <div className="h-6 bg-neutral-200 rounded flex-1"></div>
                <div className="h-px bg-neutral-300 flex-1"></div>
                <div className="h-6 bg-neutral-200 rounded w-16"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
```

**Success:** All routes code-split, loading skeleton displayed

### Step 3: Optimize Images with Supabase (30 min)

Create image component with transforms:

```typescript
// src/components/ui/OptimizedImage.tsx
interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  loading?: 'lazy' | 'eager';
  priority?: boolean;
}

export function OptimizedImage({
  src,
  alt,
  width = 800,
  height = 600,
  className = '',
  loading = 'lazy',
  priority = false
}: OptimizedImageProps) {
  // Use Supabase image transforms
  const { supabase } = useSupabase();
  const { data: { publicUrl } } = supabase.storage
    .from('images')
    .getPublicUrl(src, {
      transform: {
        width,
        height,
        resize: 'cover',
        quality: 80,
        format: 'webp' // Auto WebP conversion
      }
    });

  return (
    <img
      src={publicUrl}
      alt={alt}
      width={width}
      height={height}
      className={className}
      loading={loading}
      fetchPriority={priority ? 'high' : 'auto'}
      style={{ aspectRatio: `${width}/${height}` }} // Prevent CLS
    />
  );
}
```

Update post cover images:

```typescript
// In PostDetail.tsx
<OptimizedImage
  src={post.cover_image}
  alt={post.title}
  width={1200}
  height={630}
  className="w-full rounded-2xl mb-8"
  priority={true} // LCP image
/>
```

**Success:** All images use Supabase transforms, WebP format, responsive

### Step 4: Add React.memo to Expensive Components (30 min)

```typescript
// src/components/cards/ContentCard.tsx
import { memo } from 'react';

export const ContentCard = memo(function ContentCard({
  title,
  href,
  category,
  description,
  tags = [],
  color,
  illustration
}: ContentCardProps) {
  // ... component logic
});
```

```typescript
// src/components/PostCard.tsx
export const PostCard = memo(function PostCard({ post }: PostCardProps) {
  // ... component logic
});
```

**Success:** List items wrapped in React.memo

### Step 5: Debounce Input Handlers (30 min)

Create debounce hook:

```typescript
// src/hooks/useDebounce.ts
import { useState, useEffect } from 'react';

export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
```

Apply to search input:

```typescript
// src/components/SearchBar.tsx
export function SearchBar() {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    if (debouncedQuery) {
      // Perform search
      searchPosts(debouncedQuery);
    }
  }, [debouncedQuery]);

  return (
    <input
      type="search"
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      placeholder="Search posts..."
      className="w-full px-4 py-2 rounded-lg border border-neutral-300"
    />
  );
}
```

**Success:** Search input debounced, reduces INP

### Step 6: Analyze Bundle Size (30 min)

Install bundle analyzer:

```bash
bun add -D rollup-plugin-visualizer
```

Update `vite.config.ts`:

```typescript
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    react(),
    visualizer({
      filename: './dist/stats.html',
      open: true,
      gzipSize: true,
      brotliSize: true
    })
  ]
});
```

Build and analyze:

```bash
bun run build
open dist/stats.html
```

Optimization opportunities:
1. Replace large libraries with smaller alternatives
2. Use tree-shaking for better dead code elimination
3. Code split by route (already done in Step 2)

**Success:** Bundle size analyzed, optimization opportunities identified

## Success Criteria

- [ ] LCP < 2.5s (measured with Lighthouse)
- [ ] INP < 200ms (measured with Lighthouse)
- [ ] CLS < 0.1 (measured with Lighthouse)
- [ ] All routes code-split with lazy loading
- [ ] Images optimized with Supabase transforms (WebP, responsive)
- [ ] Critical resources preloaded
- [ ] Bundle size < 200KB (gzipped)

## Risk Assessment

**Low Risk:** Performance optimizations typically don't break functionality

**Mitigation:**
1. Benchmark before/after with Lighthouse
2. Test on slow 3G connection
3. Verify image quality after optimization
4. Monitor Core Web Vitals in production

## Next Steps

After performance optimization complete, proceed to [Phase 6: Polish](./phase-06-polish.md)

# Phase 2: Content Pages

## Context Links
- [Main Plan](./plan.md)
- [Markdown & i18n Research](./reports/researcher-260113-0220-markdown-i18n.md)
- Dependencies: Phase 1 (Foundation)

## Overview

| Field | Value |
|-------|-------|
| Date | 2026-01-13 |
| Priority | P1 |
| Effort | 12h |
| Status | completed |
| Review | pending |

**Goal:** Build public reading experience with Start, Posts, Insights, Series pages.

## Key Insights (from research)

- Use react-markdown + remark-gfm for rendering
- react-syntax-highlighter for code blocks
- Field naming: `{field}_vi` / `{field}_en`
- URL pattern: `/:lang/posts/:slug` for SEO

## Requirements

1. Start page refactored from Index.tsx
2. Posts page with filtering (goal, outcome, level)
3. PostDetail page with MarkdownRenderer
4. Insights page with infinite scroll
5. Series page and SeriesDetail
6. Reusable content components (PostCard, InsightCard, SeriesCard)
7. TanStack Query hooks for data fetching

## Architecture

### New Files

```
src/
├── components/
│   └── content/
│       ├── PostCard.tsx          # Post preview card
│       ├── InsightCard.tsx       # Insight preview card
│       ├── SeriesCard.tsx        # Series preview card
│       ├── MarkdownRenderer.tsx  # Markdown to React
│       ├── GoalPicker.tsx        # 6 goal filter buttons
│       └── ContentFilters.tsx    # Goal/Outcome/Level filters
├── pages/
│   ├── Start.tsx                 # Refactored Index
│   ├── Posts.tsx                 # Posts listing
│   ├── PostDetail.tsx            # Single post view
│   ├── Insights.tsx              # Insights stream
│   ├── Series.tsx                # Series listing
│   └── SeriesDetail.tsx          # Series view with posts
└── hooks/
    ├── use-posts.ts              # Posts CRUD + queries
    ├── use-insights.ts           # Insights queries
    └── use-series.ts             # Series queries
```

### Files to Modify

- `src/App.tsx` - Add new routes
- `src/components/layout/CommandPalette.tsx` - Update command items

## Implementation Steps

### 1. Install Markdown Dependencies (15min)

```bash
bun add react-markdown remark-gfm react-syntax-highlighter
bun add -D @types/react-syntax-highlighter
```

### 2. Create MarkdownRenderer (1h)

**File:** `src/components/content/MarkdownRenderer.tsx`

```typescript
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface Props {
  content: string;
  className?: string;
}

export function MarkdownRenderer({ content, className }: Props) {
  return (
    <Markdown
      className={cn("prose prose-invert max-w-none", className)}
      remarkPlugins={[remarkGfm]}
      components={{
        code({ className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || '');
          const code = String(children).replace(/\n$/, '');
          return match ? (
            <SyntaxHighlighter
              language={match[1]}
              style={oneDark}
              PreTag="div"
            >
              {code}
            </SyntaxHighlighter>
          ) : (
            <code className={className} {...props}>{children}</code>
          );
        },
        a: ({ href, children }) => (
          <a href={href} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
            {children}
          </a>
        ),
      }}
    >
      {content}
    </Markdown>
  );
}
```

### 3. Create use-posts Hook (1h)

**File:** `src/hooks/use-posts.ts`

```typescript
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useLanguage } from '@/contexts/LanguageContext';

export function usePosts(filters?: { goal?: string; outcome?: string; level?: string }) {
  const { lang } = useLanguage();

  return useQuery({
    queryKey: ['posts', filters],
    queryFn: async () => {
      let query = supabase
        .from('posts')
        .select('*, taxonomy!goal_id(*), taxonomy!outcome_id(*)')
        .eq('published', true)
        .order('published_at', { ascending: false });

      if (filters?.goal) query = query.eq('goal_id', filters.goal);
      if (filters?.outcome) query = query.eq('outcome_id', filters.outcome);
      if (filters?.level) query = query.eq('level', filters.level);

      const { data, error } = await query;
      if (error) throw error;
      return data;
    }
  });
}

export function usePost(slug: string) {
  return useQuery({
    queryKey: ['post', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('posts')
        .select('*, taxonomy!goal_id(*), taxonomy!outcome_id(*)')
        .eq('slug', slug)
        .eq('published', true)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!slug
  });
}

export function useFeaturedPosts() {
  return useQuery({
    queryKey: ['posts', 'featured'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('published', true)
        .eq('featured', true)
        .order('published_at', { ascending: false })
        .limit(3);
      if (error) throw error;
      return data;
    }
  });
}
```

### 4. Create PostCard Component (45min)

**File:** `src/components/content/PostCard.tsx`

- Display title, excerpt, read_time, level badge
- Goal/Outcome tags
- Link to `/posts/:slug`
- Use lang from context for title/excerpt

### 5. Create GoalPicker Component (30min)

**File:** `src/components/content/GoalPicker.tsx`

- 6 buttons: Decide, Spec, Build, Ship, Measure, Operate
- Each with icon and color
- onClick filters posts by goal
- Active state styling

### 6. Refactor Start Page (1.5h)

**File:** `src/pages/Start.tsx` (rename from Index.tsx)

Sections:
1. Hero: "Dynamite - Build. Ship. Learn. Repeat."
2. GoalPicker: 6 goal buttons
3. Featured Posts: Top 3 featured posts
4. Latest Insights: 3 recent insights
5. Resume teaser: Link to /resume

Keep existing glassmorphism design.

### 7. Create Posts Page (1.5h)

**File:** `src/pages/Posts.tsx`

- Header with title
- ContentFilters: goal, outcome, level dropdowns
- Grid of PostCard components
- Pagination or infinite scroll
- Empty state if no posts

### 8. Create PostDetail Page (1.5h)

**File:** `src/pages/PostDetail.tsx`

Layout:
1. Breadcrumb: Posts > [Title]
2. Header: title, date, read_time, tags
3. MarkdownRenderer for content
4. Related posts (same goal/outcome)
5. Next/Prev navigation if in series

### 9. Create use-insights Hook (30min)

**File:** `src/hooks/use-insights.ts`

- useInsights() - paginated list
- usePinnedInsights() - pinned only
- Infinite scroll support with useInfiniteQuery

### 10. Create InsightCard Component (30min)

**File:** `src/components/content/InsightCard.tsx`

- Compact markdown preview
- Tags as badges
- Related post link if exists
- Pinned indicator

### 11. Create Insights Page (1h)

**File:** `src/pages/Insights.tsx`

- Pinned insights at top
- Infinite scroll list
- Tag filtering (optional)

### 12. Create use-series Hook (30min)

**File:** `src/hooks/use-series.ts`

- useSeries() - all published series
- useSeriesDetail(slug) - single with posts

### 13. Create SeriesCard Component (30min)

**File:** `src/components/content/SeriesCard.tsx`

- Cover image
- Title, description
- Post count, total time
- Outcome badges

### 14. Create Series Pages (1h)

**Files:** `src/pages/Series.tsx`, `src/pages/SeriesDetail.tsx`

Series.tsx:
- Grid of SeriesCard

SeriesDetail.tsx:
- Cover image header
- Description
- Ordered list of posts with checkmarks
- Progress indicator

### 15. Update Routes (30min)

**File:** `src/App.tsx`

Add routes:
```typescript
<Route path="/" element={<Start />} />
<Route path="/posts" element={<Posts />} />
<Route path="/posts/:slug" element={<PostDetail />} />
<Route path="/insights" element={<Insights />} />
<Route path="/series" element={<Series />} />
<Route path="/series/:slug" element={<SeriesDetail />} />
```

Optional language prefix:
```typescript
<Route path="/:lang/posts/:slug" element={<PostDetail />} />
```

## Todo List

- [ ] Install markdown dependencies
- [ ] Create MarkdownRenderer component
- [ ] Create use-posts hook
- [ ] Create PostCard component
- [ ] Create GoalPicker component
- [ ] Refactor Index.tsx to Start.tsx
- [ ] Create Posts page
- [ ] Create PostDetail page
- [ ] Create use-insights hook
- [ ] Create InsightCard component
- [ ] Create Insights page
- [ ] Create use-series hook
- [ ] Create SeriesCard component
- [ ] Create Series page
- [ ] Create SeriesDetail page
- [ ] Update App.tsx routes
- [ ] Update CommandPalette commands
- [ ] Test all pages with mock data

## Success Criteria

- [ ] Start page shows featured content from DB
- [ ] Posts page lists all published posts
- [ ] PostDetail renders markdown correctly
- [ ] Code blocks have syntax highlighting
- [ ] Insights page infinite scrolls
- [ ] Series shows ordered post list
- [ ] Language toggle affects displayed content
- [ ] No console errors

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Markdown XSS | Low | High | react-markdown sanitizes by default |
| Large content slow render | Medium | Medium | Virtualize long lists |
| Missing translations | High | Low | Fallback to VI if EN missing |

## Security Considerations

- MarkdownRenderer sanitizes HTML by default
- External links get rel="noopener noreferrer"
- No user-generated content (admin-only)

## Next Steps

After completing Phase 2:
1. Seed sample posts/insights for testing
2. Proceed to Phase 3: Admin Panel

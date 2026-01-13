# Phase 1: Foundation

## Context Links
- [Main Plan](./plan.md)
- [Supabase Patterns Research](./research/researcher-supabase-patterns.md)
- Dependencies: None (first phase)

## Overview

| Field | Value |
|-------|-------|
| Date | 2026-01-13 |
| Priority | P1 |
| Effort | 8h |
| Status | completed |
| Review | pending |

**Goal:** Set up Supabase backend, TypeScript types, auth context, and base API infrastructure.

## Key Insights (from research)

- Use `createClient<Database>` for typed queries
- Auto-refresh tokens enabled by default
- Generate types via `bunx supabase gen types --linked`
- RLS: public read published, admin write all

## Requirements

1. Supabase project created with database schema
2. Storage buckets configured (post-images, photos)
3. RLS policies for public read / admin write
4. TypeScript types generated from schema
5. Supabase client initialized
6. AuthContext for admin session
7. LanguageContext for i18n
8. Base API hooks with TanStack Query

## Architecture

### New Files

```
src/
├── lib/
│   ├── supabase.ts           # Supabase client init
│   └── api.ts                # API helper functions
├── types/
│   └── database.ts           # Generated from Supabase
├── contexts/
│   ├── AuthContext.tsx       # Admin auth state
│   └── LanguageContext.tsx   # i18n state
├── hooks/
│   ├── use-auth.ts           # Auth hook
│   └── use-posts.ts          # Posts CRUD hook (base)
└── components/
    └── ProtectedRoute.tsx    # Admin route guard
```

### Files to Modify

- `src/App.tsx` - Add AuthProvider, LanguageProvider, new routes
- `src/components/layout/TopNav.tsx` - New 7 tabs

### Environment Variables

```bash
# .env.local
VITE_SUPABASE_URL=https://<project>.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## Implementation Steps

### 1. Install Dependencies (15min)

```bash
bun add @supabase/supabase-js
bun add i18next react-i18next i18next-browser-languagedetector
bun add -D supabase
```

### 2. Create Supabase Project (30min)

1. Go to supabase.com, create new project
2. Get project URL and anon key
3. Create `.env.local` with credentials
4. Link project: `bunx supabase init && bunx supabase link`

### 3. Database Schema (1h)

Execute in Supabase SQL Editor:

```sql
-- Taxonomy (Goals + Outcomes)
CREATE TABLE taxonomy (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('goal', 'outcome')),
  slug TEXT NOT NULL UNIQUE,
  name_vi TEXT NOT NULL,
  name_en TEXT NOT NULL,
  description_vi TEXT,
  description_en TEXT,
  icon TEXT,
  color TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Posts
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title_vi TEXT NOT NULL,
  title_en TEXT,
  content_vi TEXT NOT NULL,
  content_en TEXT,
  excerpt_vi TEXT,
  excerpt_en TEXT,
  goal_id UUID REFERENCES taxonomy(id),
  outcome_id UUID REFERENCES taxonomy(id),
  level TEXT CHECK (level IN ('starter', 'builder', 'advanced')),
  read_time INT,
  featured BOOLEAN DEFAULT false,
  published BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Insights
CREATE TABLE insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_vi TEXT NOT NULL,
  content_en TEXT,
  tags TEXT[] DEFAULT '{}',
  related_post_id UUID REFERENCES posts(id),
  pinned BOOLEAN DEFAULT false,
  published BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Series
CREATE TABLE series (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title_vi TEXT NOT NULL,
  title_en TEXT,
  description_vi TEXT,
  description_en TEXT,
  post_ids UUID[] DEFAULT '{}',
  cover_image TEXT,
  featured BOOLEAN DEFAULT false,
  published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Photos
CREATE TABLE photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  caption_vi TEXT,
  caption_en TEXT,
  album TEXT,
  sort_order INT DEFAULT 0,
  published BOOLEAN DEFAULT false,
  taken_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Resume sections
CREATE TABLE resume_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('highlight', 'experience', 'project', 'writing', 'speaking')),
  title_vi TEXT NOT NULL,
  title_en TEXT,
  content JSONB NOT NULL,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- About (single row)
CREATE TABLE about (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bio_vi TEXT NOT NULL,
  bio_en TEXT,
  principles_vi TEXT,
  principles_en TEXT,
  social_links JSONB DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Admins table
CREATE TABLE admins (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Full-text search indexes
CREATE INDEX posts_title_vi_idx ON posts USING GIN (to_tsvector('simple', coalesce(title_vi, '')));
CREATE INDEX posts_content_vi_idx ON posts USING GIN (to_tsvector('simple', coalesce(content_vi, '')));
CREATE INDEX posts_published_idx ON posts(published, published_at DESC);
```

### 4. RLS Policies (30min)

```sql
-- Enable RLS
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE series ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE resume_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE about ENABLE ROW LEVEL SECURITY;
ALTER TABLE taxonomy ENABLE ROW LEVEL SECURITY;

-- Public read for published content
CREATE POLICY "Public read published" ON posts FOR SELECT USING (published = true);
CREATE POLICY "Public read published" ON insights FOR SELECT USING (published = true);
CREATE POLICY "Public read published" ON series FOR SELECT USING (published = true);
CREATE POLICY "Public read published" ON photos FOR SELECT USING (published = true);
CREATE POLICY "Public read" ON resume_sections FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public read" ON about FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public read" ON taxonomy FOR SELECT TO anon, authenticated USING (true);

-- Admin full access
CREATE POLICY "Admin full access" ON posts FOR ALL TO authenticated
  USING (auth.uid() IN (SELECT user_id FROM admins));
CREATE POLICY "Admin full access" ON insights FOR ALL TO authenticated
  USING (auth.uid() IN (SELECT user_id FROM admins));
CREATE POLICY "Admin full access" ON series FOR ALL TO authenticated
  USING (auth.uid() IN (SELECT user_id FROM admins));
CREATE POLICY "Admin full access" ON photos FOR ALL TO authenticated
  USING (auth.uid() IN (SELECT user_id FROM admins));
CREATE POLICY "Admin full access" ON resume_sections FOR ALL TO authenticated
  USING (auth.uid() IN (SELECT user_id FROM admins));
CREATE POLICY "Admin full access" ON about FOR ALL TO authenticated
  USING (auth.uid() IN (SELECT user_id FROM admins));
CREATE POLICY "Admin full access" ON taxonomy FOR ALL TO authenticated
  USING (auth.uid() IN (SELECT user_id FROM admins));
```

### 5. Storage Buckets (15min)

In Supabase Dashboard > Storage:
1. Create bucket `post-images` (public)
2. Create bucket `photos` (public)

Storage policies:
```sql
-- Public read
CREATE POLICY "Public read" ON storage.objects FOR SELECT TO public
  USING (bucket_id IN ('post-images', 'photos'));

-- Admin upload
CREATE POLICY "Admin upload" ON storage.objects FOR INSERT TO authenticated
  USING (auth.uid() IN (SELECT user_id FROM admins));
```

### 6. Generate TypeScript Types (15min)

```bash
bunx supabase gen types --linked > src/types/database.ts
```

### 7. Create Supabase Client (30min)

**File:** `src/lib/supabase.ts`

```typescript
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})
```

### 8. Create AuthContext (45min)

**File:** `src/contexts/AuthContext.tsx`

- Wrap app in AuthProvider
- useAuth hook returns { user, loading, signIn, signOut, isAdmin }
- Check admin status via admins table lookup
- Persist session in localStorage

### 9. Create LanguageContext (30min)

**File:** `src/contexts/LanguageContext.tsx`

- Initialize i18next with vi/en
- Browser language detection
- useLanguage hook returns { lang, setLang, t }
- Store preference in localStorage

### 10. Create ProtectedRoute (15min)

**File:** `src/components/ProtectedRoute.tsx`

- Check useAuth().isAdmin
- Redirect to /login if not admin
- Show loading while checking

### 11. Update TopNav (30min)

**File:** `src/components/layout/TopNav.tsx`

Change navItems to:
```typescript
const navItems = [
  { label: "Start", path: "/" },
  { label: "Posts", path: "/posts" },
  { label: "Insights", path: "/insights" },
  { label: "Series", path: "/series" },
  { label: "Photos", path: "/photos" },
  { label: "Resume", path: "/resume" },
  { label: "About", path: "/about" },
];
```

### 12. Update App.tsx (45min)

- Wrap with AuthProvider, LanguageProvider
- Add new public routes: /posts, /insights, /series, /photos, /resume, /about
- Add admin routes: /admin/*, /login
- Keep existing providers (Query, Tooltip)

## Todo List

- [ ] Install Supabase dependencies
- [ ] Create Supabase project and get credentials
- [ ] Create `.env.local` with credentials
- [ ] Execute database schema SQL
- [ ] Execute RLS policies SQL
- [ ] Create storage buckets
- [ ] Generate TypeScript types
- [ ] Create `src/lib/supabase.ts`
- [ ] Create `src/contexts/AuthContext.tsx`
- [ ] Create `src/contexts/LanguageContext.tsx`
- [ ] Create `src/components/ProtectedRoute.tsx`
- [ ] Update TopNav with new tabs
- [ ] Update App.tsx with providers and routes
- [ ] Test Supabase connection
- [ ] Create admin user and add to admins table

## Success Criteria

- [ ] `supabase.from('posts').select()` returns empty array (no error)
- [ ] AuthContext correctly identifies admin vs anon
- [ ] LanguageContext toggles between vi/en
- [ ] ProtectedRoute redirects non-admin to login
- [ ] TopNav shows all 7 tabs
- [ ] No TypeScript errors

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Wrong RLS policies | Medium | High | Test each policy in Supabase Dashboard |
| Type generation fails | Low | Medium | Manual type definitions as fallback |
| Auth token issues | Low | Medium | Check browser DevTools for errors |

## Security Considerations

- Never expose service role key in frontend
- Verify RLS blocks non-admin writes
- Admin check uses DB lookup, not just auth.uid()
- Storage policies match table policies

## Next Steps

After completing Phase 1:
1. Seed taxonomy data (goals + outcomes)
2. Proceed to Phase 2: Content Pages

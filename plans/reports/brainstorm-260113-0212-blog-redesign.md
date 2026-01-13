# Brainstorm Report: Dynamite Notes Blog Redesign

**Date:** 2026-01-13
**Status:** Consensus reached
**Participants:** User, Brainstorming Agent

---

## 1. Problem Statement

Redesign Dynamite Notes from a learning platform (Packages/Docs/Playground) to an AI-first personal blog for Dev × PM audience with:
- 7 tabs: Start, Posts, Insights, Series, Photos, Resume, About
- Goal-based navigation (Decide/Spec/Build/Ship/Measure/Operate)
- Outcome-based content tagging (PRD/Tech Spec/Prompt/Eval/etc.)
- Admin-only content management
- Keyword search (no AI chat)
- Bilingual content (Vietnamese + English)

---

## 2. Requirements Summary

| Aspect | Decision |
|--------|----------|
| Codebase | Refactor existing React + Vite + shadcn-ui |
| Backend | Supabase (new project) |
| Database | Semi-normalized schema |
| Content Storage | Supabase DB (Markdown format) |
| Photo Storage | Supabase Storage |
| Auth | Admin only (Supabase Auth) |
| Search | PostgreSQL full-text search |
| Writing UX | Markdown + Live Preview |
| Newsletter | External service (ConvertKit/Buttondown) |
| Language | Bilingual (VI + EN) |
| Timeline | 1 month+ (quality over speed) |
| Priority | Content pages first → Portfolio → Search |

---

## 3. Technical Architecture

### 3.1 Tech Stack (Final)

```
Frontend:
├── React 18 + TypeScript
├── Vite 5 (build tool)
├── React Router v6 (routing)
├── TanStack Query (data fetching) ← currently unused, will activate
├── shadcn-ui (UI components)
├── Tailwind CSS (styling)
├── react-markdown + remark-gfm (rendering)
└── @uiw/react-md-editor (admin writing)

Backend:
├── Supabase (PostgreSQL + Auth + Storage + Edge Functions)
├── Row Level Security (RLS) for protected routes
└── Full-text search with unaccent extension

External:
├── ConvertKit/Buttondown (newsletter)
└── Vercel/Cloudflare (hosting)
```

### 3.2 Database Schema

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
  icon TEXT, -- lucide icon name
  color TEXT, -- tailwind color class
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Posts (main content)
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title_vi TEXT NOT NULL,
  title_en TEXT,
  content_vi TEXT NOT NULL, -- Markdown
  content_en TEXT, -- Markdown (optional)
  excerpt_vi TEXT,
  excerpt_en TEXT,
  goal_id UUID REFERENCES taxonomy(id),
  outcome_id UUID REFERENCES taxonomy(id),
  level TEXT CHECK (level IN ('starter', 'builder', 'advanced')),
  read_time INT, -- minutes
  featured BOOLEAN DEFAULT false,
  published BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  -- Full-text search
  fts_vi tsvector GENERATED ALWAYS AS (
    to_tsvector('simple', coalesce(title_vi, '') || ' ' || coalesce(content_vi, ''))
  ) STORED,
  fts_en tsvector GENERATED ALWAYS AS (
    to_tsvector('english', coalesce(title_en, '') || ' ' || coalesce(content_en, ''))
  ) STORED
);

-- Insights (short notes)
CREATE TABLE insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_vi TEXT NOT NULL, -- Markdown (2-8 lines)
  content_en TEXT,
  tags TEXT[] DEFAULT '{}',
  related_post_id UUID REFERENCES posts(id),
  pinned BOOLEAN DEFAULT false,
  published BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Series (playlist of posts)
CREATE TABLE series (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title_vi TEXT NOT NULL,
  title_en TEXT,
  description_vi TEXT,
  description_en TEXT,
  post_ids UUID[] DEFAULT '{}', -- Ordered array of post IDs
  total_time INT, -- computed from posts
  outcomes TEXT[], -- list of outcome slugs
  cover_image TEXT, -- Supabase Storage URL
  featured BOOLEAN DEFAULT false,
  published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Photos (with albums)
CREATE TABLE photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url TEXT NOT NULL, -- Supabase Storage URL
  thumbnail_url TEXT, -- resized version
  caption_vi TEXT,
  caption_en TEXT,
  album TEXT, -- album name (nullable)
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
  content JSONB NOT NULL, -- flexible structure per type
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- About page (single row)
CREATE TABLE about (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bio_vi TEXT NOT NULL, -- Markdown
  bio_en TEXT,
  principles_vi TEXT, -- Markdown
  principles_en TEXT,
  social_links JSONB DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Site settings
CREATE TABLE settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX posts_fts_vi_idx ON posts USING GIN (fts_vi);
CREATE INDEX posts_fts_en_idx ON posts USING GIN (fts_en);
CREATE INDEX posts_goal_idx ON posts(goal_id);
CREATE INDEX posts_outcome_idx ON posts(outcome_id);
CREATE INDEX posts_published_idx ON posts(published, published_at DESC);
CREATE INDEX insights_published_idx ON insights(published, published_at DESC);
CREATE INDEX photos_album_idx ON photos(album);
```

### 3.3 Row Level Security (RLS)

```sql
-- Public read access for published content
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read published posts" ON posts
  FOR SELECT USING (published = true);

-- Admin full access (check auth.uid() against admin list)
CREATE POLICY "Admin full access" ON posts
  FOR ALL USING (auth.uid() IN (SELECT user_id FROM admins));

-- Similar for other tables...
```

### 3.4 Routing Structure

```
Public Routes:
├── /                    → Start (homepage)
├── /posts               → Posts list (with filters)
├── /posts/:slug         → Single post
├── /insights            → Insights stream
├── /series              → Series list
├── /series/:slug        → Series detail
├── /photos              → Photo gallery
├── /photos/:album       → Album view
├── /resume              → Resume/Portfolio
├── /about               → About page
├── /search              → Search results
└── /rss.xml             → RSS feed

Admin Routes (protected):
├── /admin               → Dashboard
├── /admin/posts         → Posts CRUD
├── /admin/posts/new     → New post (Markdown editor)
├── /admin/posts/:id     → Edit post
├── /admin/insights      → Insights CRUD
├── /admin/series        → Series CRUD
├── /admin/photos        → Photos upload/manage
├── /admin/resume        → Resume sections
├── /admin/about         → About page editor
└── /admin/settings      → Site settings
```

### 3.5 Component Architecture

```
src/
├── components/
│   ├── layout/
│   │   ├── TopNav.tsx          (refactor: new tabs)
│   │   ├── Footer.tsx          (new)
│   │   ├── AdminLayout.tsx     (new)
│   │   └── LanguageToggle.tsx  (new)
│   ├── content/
│   │   ├── PostCard.tsx        (new)
│   │   ├── InsightCard.tsx     (new)
│   │   ├── SeriesCard.tsx      (new)
│   │   ├── PhotoGrid.tsx       (new)
│   │   ├── MarkdownRenderer.tsx (new)
│   │   └── GoalPicker.tsx      (new: 6 goal buttons)
│   ├── admin/
│   │   ├── MarkdownEditor.tsx  (new)
│   │   ├── ImageUploader.tsx   (new)
│   │   ├── TaxonomySelect.tsx  (new)
│   │   └── DataTable.tsx       (new)
│   ├── search/
│   │   ├── SearchInput.tsx     (new)
│   │   └── SearchResults.tsx   (new)
│   └── ui/                      (keep shadcn-ui)
├── pages/
│   ├── Start.tsx               (refactor from Index)
│   ├── Posts.tsx               (new, replaces Packages)
│   ├── PostDetail.tsx          (new)
│   ├── Insights.tsx            (new)
│   ├── Series.tsx              (new, replaces Docs)
│   ├── SeriesDetail.tsx        (new)
│   ├── Photos.tsx              (new)
│   ├── Resume.tsx              (new)
│   ├── About.tsx               (new)
│   ├── Search.tsx              (new)
│   └── admin/
│       ├── Dashboard.tsx       (new)
│       ├── PostsAdmin.tsx      (new)
│       ├── PostEditor.tsx      (new)
│       └── ...                 (other admin pages)
├── hooks/
│   ├── use-posts.ts            (new: TanStack Query)
│   ├── use-insights.ts         (new)
│   ├── use-series.ts           (new)
│   ├── use-photos.ts           (new)
│   ├── use-search.ts           (new)
│   └── use-auth.ts             (new: admin auth)
├── lib/
│   ├── supabase.ts             (new: client init)
│   ├── api.ts                  (new: API helpers)
│   └── utils.ts                (keep)
├── types/
│   ├── database.ts             (new: Supabase generated types)
│   └── content.ts              (new: content types)
└── contexts/
    ├── AuthContext.tsx         (new)
    └── LanguageContext.tsx     (new)
```

---

## 4. Implementation Phases

### Phase 1: Foundation (Week 1-2)
**Goal:** Backend setup + Core infrastructure

- [ ] Create Supabase project
- [ ] Set up database schema + RLS
- [ ] Configure Supabase Auth (email/password for admin)
- [ ] Set up Supabase Storage buckets (photos)
- [ ] Create TypeScript types from schema
- [ ] Set up TanStack Query client
- [ ] Create base API hooks (CRUD for each table)
- [ ] Refactor TopNav for new tabs
- [ ] Create AuthContext + protected routes

### Phase 2: Content Pages (Week 2-3)
**Goal:** Public reading experience

- [ ] Start page (refactor Index)
  - [ ] GoalPicker component (6 buttons)
  - [ ] Featured posts section
  - [ ] Latest insights preview
  - [ ] Resume teaser
- [ ] Posts page
  - [ ] PostCard component
  - [ ] Goal/Outcome/Level filters
  - [ ] Pagination
- [ ] PostDetail page
  - [ ] MarkdownRenderer
  - [ ] Related posts
  - [ ] Series navigation (if in series)
- [ ] Insights page
  - [ ] InsightCard component
  - [ ] Infinite scroll
  - [ ] Pinned insights
- [ ] Series page + SeriesDetail

### Phase 3: Admin Panel (Week 3-4)
**Goal:** Content management

- [ ] Admin layout + dashboard
- [ ] Posts admin
  - [ ] DataTable with filters
  - [ ] PostEditor with Markdown + Preview
  - [ ] Image upload integration
  - [ ] Taxonomy selectors
  - [ ] Publish/Draft toggle
- [ ] Insights admin (simpler form)
- [ ] Series admin (post ordering UI)
- [ ] Photos admin
  - [ ] Bulk upload
  - [ ] Album management
  - [ ] Caption editor

### Phase 4: Portfolio Pages (Week 4-5)
**Goal:** Personal branding

- [ ] Photos page
  - [ ] PhotoGrid masonry layout
  - [ ] Lightbox view
  - [ ] Album filtering
- [ ] Resume page
  - [ ] Highlights section
  - [ ] Experience timeline
  - [ ] Projects with proof links
  - [ ] Writing/Speaking sections
- [ ] About page
  - [ ] Bio section
  - [ ] Principles
  - [ ] Social links
  - [ ] Subscribe CTA

### Phase 5: Search & Polish (Week 5-6)
**Goal:** Discoverability + UX

- [ ] Search implementation
  - [ ] SearchInput (⌘K trigger)
  - [ ] Full-text search API
  - [ ] SearchResults page
  - [ ] Highlight matches
- [ ] Language toggle (VI/EN)
- [ ] RSS feed generation
- [ ] Newsletter integration
- [ ] SEO optimization
  - [ ] Meta tags
  - [ ] Open Graph
  - [ ] JSON-LD
- [ ] Performance audit
- [ ] Mobile responsiveness check

### Phase 6: Migration & Launch (Week 6)
**Goal:** Go live

- [ ] Migrate existing content (if any)
- [ ] Set up redirects (old routes → new)
- [ ] Final testing
- [ ] Deploy to production
- [ ] Monitor + fix issues

---

## 5. Risks & Mitigations

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Supabase Storage limits | Low | Medium | Compress images before upload, use thumbnails |
| Search performance (Vietnamese) | Medium | Medium | Use `unaccent` extension, consider pg_trgm fallback |
| Admin UX complexity | Medium | Low | Start simple, iterate based on usage |
| Bilingual content maintenance | High | Medium | Default to Vietnamese, English optional per post |
| RLS misconfiguration | Low | High | Thorough testing, use Supabase Dashboard to verify |

---

## 6. Open Decisions

1. **Markdown Editor Choice:**
   - `@uiw/react-md-editor` (recommended)
   - `react-simplemde-editor`
   - Custom with CodeMirror

2. **Image Optimization:**
   - Supabase Transform (paid)
   - Client-side resize before upload
   - External CDN (Cloudinary free tier)

3. **Newsletter Service:**
   - ConvertKit (more features)
   - Buttondown (simpler, developer-friendly)
   - Substack (if want own platform)

4. **Hosting:**
   - Vercel (easy, good DX)
   - Cloudflare Pages (faster, cheaper at scale)

---

## 7. Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Page load time | < 2s | Lighthouse |
| Content published | 5+ posts/month | Admin dashboard |
| Search usage | > 10% visitors | Analytics |
| Newsletter signups | 100 in first month | Email service |
| Mobile traffic | > 40% | Analytics |

---

## 8. Next Steps

1. **Create detailed implementation plan** via `/plan:hard`
2. Set up Supabase project
3. Begin Phase 1 implementation

---

## Appendix A: Taxonomy Data (Goals + Outcomes)

### Goals
| Slug | Name (VI) | Name (EN) | Icon | Color |
|------|-----------|-----------|------|-------|
| decide | Chọn hướng | Decide | `compass` | blue |
| spec | Định nghĩa | Spec | `file-text` | purple |
| build | Xây dựng | Build | `hammer` | orange |
| ship | Vận chuyển | Ship | `rocket` | green |
| measure | Đo lường | Measure | `chart-bar` | cyan |
| operate | Vận hành | Operate | `settings` | gray |

### Outcomes
| Slug | Name (VI) | Name (EN) |
|------|-----------|-----------|
| prd | PRD | PRD |
| tech-spec | Tech Spec | Tech Spec |
| prompt | Prompt | Prompt |
| eval | Evaluation | Evaluation |
| experiment | Thí nghiệm | Experiment |
| checklist | Checklist | Checklist |
| dashboard | Dashboard | Dashboard |

---

## Appendix B: Microcopy Reference

### Navigation
- **Start** → "Bắt đầu ở đây"
- **Posts** → "Bài dài, có outcome"
- **Insights** → "Note ngắn, quick wins"
- **Series** → "Đi theo tuyến"
- **Photos** → "Behind the scenes"
- **Resume** → "Work & Proof"
- **About** → "Tôi là ai"

### Start Page
- **H1:** "Dynamite — Build. Ship. Learn. Repeat."
- **Subheadline:** "Playbooks trong bài viết, note ngắn mỗi tuần, và portfolio có proof."
- **CTA:** "Follow the releases" → Subscribe button

---

**Document Version:** 1.0
**Created:** 2026-01-13
**Author:** Brainstorming Agent

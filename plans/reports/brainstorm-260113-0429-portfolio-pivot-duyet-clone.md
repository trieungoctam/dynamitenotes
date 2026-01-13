# Brainstorm: Portfolio Pivot - Clone duyet.net

**Date:** 2026-01-13
**Status:** Agreed
**Approach:** Incremental migration

---

## Problem Statement

Transform Dynamite Notes from PM knowledge base → personal portfolio/blog, cloning duyet.net's design and features while keeping Vite + React stack.

## Requirements

| Requirement | Decision |
|-------------|----------|
| Framework | Keep Vite + React (no migration) |
| Content storage | Supabase (not MDX) |
| Approach | Incremental migration |
| Existing content | Delete everything |

## Target Features (Priority Order)

1. **Homepage hub** - Card-based layout with hover animations
2. **Blog section** - Technical blog with markdown rendering
3. **Resume page** - Timeline-based professional experience
4. **Photos gallery** - Masonry grid with lightbox
5. ~~Chat bot~~ - Skipped

---

## Evaluated Approaches

### Option 1: Migrate to Next.js ❌
**Pros:** SSR/SSG, better SEO, native MDX support, matches duyet.net stack
**Cons:** Full rewrite, learning curve, loses existing work
**Verdict:** Rejected - user wants incremental approach

### Option 2: MDX in Vite SPA ❌
**Pros:** True static content, version-controlled posts
**Cons:** Poor SEO (client-side rendering), complex setup, no SSG benefits
**Verdict:** Rejected - SEO limitations unacceptable for blog

### Option 3: Supabase + Vite SPA ✅ (Selected)
**Pros:** Already configured, admin UI possible, works well with SPA, dynamic content
**Cons:** Requires DB management, no git-based content workflow
**Verdict:** Selected - pragmatic choice for current stack

---

## Recommended Solution

### Architecture

```
Current Stack (Keep)          New Features (Add)
─────────────────────         ─────────────────────
Vite + React                  Homepage hub redesign
Tailwind + shadcn/ui    →     Blog (Supabase posts table)
react-markdown                Resume page (static)
react-masonry-css             Photos gallery (Supabase storage)
Supabase                      Admin panel (optional)
```

### Design Changes

| Element | Current | Target (duyet.net style) |
|---------|---------|--------------------------|
| Typography | Geist Mono | Libre Baskerville (headings) + Inter (body) |
| Color scheme | Dark-first glassmorphism | Light-first neutral palette (cream, sage, lavender) |
| Layout | Learning packages grid | Card-based hub with sections |
| Navigation | TopNav + CommandPalette | Minimal nav + card navigation |

### Database Schema (Supabase)

```sql
-- Blog posts
posts (id, title, slug, content, excerpt, published_at, tags[], featured_image)

-- Resume sections
resume_sections (id, type, title, company, period, description, order)

-- Photos
photos (id, url, caption, category, taken_at, order)

-- Optional: Analytics
page_views (id, path, timestamp, referrer)
```

### Implementation Phases

**Phase 1: Homepage Hub**
- Delete existing landing page components
- Create card-based hub layout
- Implement hover animations (translate-y, shadow transitions)
- Add section cards: Blog, Resume, Photos, About
- Update typography (add Libre Baskerville + Inter fonts)
- Switch to light-first color scheme

**Phase 2: Blog Section**
- Create `posts` table in Supabase
- Build blog list page with pagination
- Build post detail page with markdown rendering
- Add tags/categories filtering
- Reuse existing `react-markdown` + `react-syntax-highlighter`

**Phase 3: Resume Page**
- Create `resume_sections` table or static JSON
- Build timeline-based layout
- Sections: Experience, Education, Skills, Projects

**Phase 4: Photos Gallery**
- Create `photos` table + Supabase storage bucket
- Build masonry grid (already have `react-masonry-css`)
- Add lightbox (already have `yet-another-react-lightbox`)
- Category filtering

**Phase 5: Cleanup**
- Remove old routes: /packages, /docs, /playground, /changelog
- Remove unused components
- Update CommandPalette with new navigation
- Update meta tags and SEO

---

## Files to Delete

```
src/pages/
├── Packages.tsx      # Delete
├── Docs.tsx          # Delete
├── Playground.tsx    # Delete
├── Changelog.tsx     # Delete

src/components/
├── home/             # Delete entire folder (rebuild)
├── packages/         # Delete if exists
├── docs/             # Delete if exists
```

## Files to Keep/Modify

```
src/components/
├── ui/               # Keep all shadcn components
├── layout/
│   ├── TopNav.tsx    # Modify (simplify navigation)
│   └── CommandPalette.tsx  # Modify (new routes)

src/lib/
├── supabase.ts       # Keep
├── utils.ts          # Keep
```

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| SEO limitations (SPA) | Medium | Add meta tags, sitemap, consider prerendering later |
| Data migration | Low | Fresh start, no existing content to migrate |
| Design consistency | Medium | Create design tokens/theme file first |

## Success Metrics

- [ ] Homepage loads with card-based hub layout
- [ ] Blog posts render with syntax highlighting
- [ ] Resume displays professional timeline
- [ ] Photos gallery with working lightbox
- [ ] All old routes removed, no 404s on new routes
- [ ] Dark/light mode toggle works

---

## Next Steps

1. Create implementation plan with detailed tasks
2. Set up Supabase tables and storage
3. Begin Phase 1: Homepage hub redesign

---

## Unresolved Questions

None - all decisions made.

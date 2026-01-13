---
title: "Dynamite Notes Blog Redesign"
description: "Transform PM learning platform to personal blog with 7 tabs, Supabase backend, bilingual content"
status: pending
priority: P1
effort: 48h
branch: main
tags: [redesign, supabase, blog, i18n, admin]
created: 2026-01-13
---

# Blog Redesign Plan

Transform from learning platform to personal blog with 7 tabs, Supabase backend, bilingual VI/EN.

## Prerequisites
- Supabase project + credentials (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)
- Admin user in Supabase Auth + admins table

## Phases

| # | Phase | Effort | Status | Details |
|---|-------|--------|--------|---------|
| 1 | Foundation | 8h | completed | [phase-01-foundation.md](./phase-01-foundation.md) |
| 2 | Content Pages | 12h | completed | [phase-02-content-pages.md](./phase-02-content-pages.md) |
| 3 | Admin Panel | 10h | completed | [phase-03-admin-panel.md](./phase-03-admin-panel.md) |
| 4 | Portfolio Pages | 6h | completed | [phase-04-portfolio-pages.md](./phase-04-portfolio-pages.md) |
| 5 | Search & Polish | 8h | completed | [phase-05-search-polish.md](./phase-05-search-polish.md) |
| 6 | Migration & Launch | 4h | completed | [phase-06-migration-launch.md](./phase-06-migration-launch.md) |

## Dependencies
```bash
bun add @supabase/supabase-js @uiw/react-md-editor react-markdown remark-gfm \
  react-syntax-highlighter i18next react-i18next i18next-browser-languagedetector \
  browser-image-compression yet-another-react-lightbox
bun add -D @types/react-syntax-highlighter supabase
```

## New Structure
```
src/
├── contexts/         # AuthContext, LanguageContext
├── types/database.ts # Generated from Supabase
├── components/content/ # PostCard, InsightCard, MarkdownRenderer
├── components/admin/   # MarkdownEditor, DataTable
├── pages/admin/        # Dashboard, PostEditor
└── hooks/              # use-posts, use-auth, use-search
```

## Success Criteria
- [ ] 7 public pages functional
- [ ] Admin CRUD for all content
- [ ] Search returns results
- [ ] VI/EN toggle works
- [ ] Lighthouse > 90

## Key Decisions
- Markdown: @uiw/react-md-editor (edit) + react-markdown (render)
- i18n: react-i18next with `{field}_vi`/`{field}_en` pattern
- URL: `/:lang/posts/:slug` for SEO
- Auth: Supabase Auth, admin check via admins table
- Storage: Supabase Storage, compress before upload

## Risks
| Risk | Mitigation |
|------|------------|
| RLS misconfiguration | Test in Supabase Dashboard |
| Vietnamese search | Use unaccent + pg_trgm |
| Large images | Compress client-side |

## Related
- [Brainstorm](../reports/brainstorm-260113-0212-blog-redesign.md)
- [Supabase Research](./research/researcher-supabase-patterns.md)
- [Markdown Research](./reports/researcher-260113-0220-markdown-i18n.md)

## Validation Summary

**Validated:** 2026-01-13
**Questions asked:** 7

### Confirmed Decisions
- **Missing translations:** Fallback to Vietnamese when English unavailable
- **Slug generation:** Auto-generate from Vietnamese title using slugify
- **Draft auto-save:** Save to Supabase every 30s
- **Admin identification:** Separate admins table (user_id lookup)
- **URL pattern:** `/:lang/posts/:slug` for SEO-friendly language URLs
- **Image compression:** Compress to 800KB max before upload
- **Search scope:** Include both Posts and Insights in search results

### Action Items
- [ ] Add slugify dependency for Vietnamese → slug conversion
- [ ] Implement 30s auto-save interval in PostEditor
- [ ] Ensure search query covers both posts and insights tables

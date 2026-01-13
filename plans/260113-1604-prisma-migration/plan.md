---
title: "Migrate from @supabase/supabase-js to Prisma ORM"
description: "Replace Supabase client with Prisma ORM for type-safe database queries and auto-generated TypeScript types."
status: pending
priority: P1
effort: 12h
branch: main
tags: [prisma, database, migration, typescript, orm]
created: 2026-01-13
---

## Executive Summary

**Objective**: Replace `@supabase/supabase-js` direct client usage with Prisma ORM for improved type safety, auto-generated types, and better developer experience.

**Scope**:
- Replace all Supabase client queries with Prisma Client
- Set up Prisma schema and migrations
- Configure connection pooling with PgBouncer
- Update all 15+ data fetching hooks
- Remove manual TypeScript type definitions

**Impact**:
- **Breaking change**: All database query code must be rewritten
- **Bundle size**: +150KB (Prisma Client)
- **Type safety**: Eliminates manual type definitions
- **Developer experience**: Better autocomplete, inline documentation

**Timeline**: 12 hours across 4 phases

---

## Prerequisites

### Environment Setup
- [ ] Node.js 18+ and Bun installed
- [ ] Supabase project with PostgreSQL database
- [ ] Supabase service role key (for bypassing RLS)
- [ ] Direct database connection string (from Supabase dashboard)
- [ ] PgBouncer connection string (from Supabase dashboard)

### Knowledge Requirements
- [ ] Understanding of Prisma ORM basics
- [ ] Familiarity with TanStack Query patterns
- [ ] Knowledge of current Supabase schema

### Access Requirements
- [ ] Supabase project dashboard access
- [ ] Database migration permissions
- [ ] Service role key access

---

## Phase 1: Foundation Setup (2h)

### 1.1 Install Prisma Dependencies

```bash
bun add prisma @prisma/client
bun add -D tsx
```

**Tasks**:
- [ ] Install `prisma` and `@prisma/client` packages
- [ ] Install `tsx` for running Prisma scripts
- [ ] Update `package.json` scripts

### 1.2 Initialize Prisma

```bash
bunx prisma init
```

**Tasks**:
- [ ] Create `prisma/` directory
- [ ] Generate `.env` file template
- [ ] Update `.env.production.example` with Prisma vars

**Environment Variables**:
```bash
# .env.local
DATABASE_URL="postgresql://postgres:[password]@db.[project].supabase.co:5432/postgres"
DIRECT_URL="postgresql://postgres.[project]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres"
```

### 1.3 Define Prisma Schema

**File**: `prisma/schema.prisma`

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

generator client {
  provider = "prisma-client-js"
}

// Define all 8 tables:
// - taxonomy
// - posts
// - insights
// - photos
// - series
// - about
// - resume_sections
// - admins
```

**Tasks**:
- [ ] Map all 8 tables from `scripts/schema.sql` to Prisma schema
- [ ] Define relationships (FKs: posts.goal_id, posts.outcome_id, insights.related_post_id)
- [ ] Map JSONB columns (about.social_links, resume_sections.content)
- [ ] Map array columns (insights.tags, series.post_ids)
- [ ] Add `@default(uuid())` for TEXT primary keys
- [ ] Add `@db.Timestamptz` for timestamp columns
- [ ] Define enums for type constraints (taxonomy.type, posts.level, etc.)

### 1.4 Configure Connection Pooling

**Update**: `prisma/schema.prisma`

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")  // For migrations
}
```

**Tasks**:
- [ ] Use `DATABASE_URL` (transaction mode) for app queries
- [ ] Use `DIRECT_URL` for migrations and seed scripts
- [ ] Configure connection limits in Supabase dashboard
- [ ] Test connection pooling with 10+ concurrent queries

### 1.5 Create Prisma Client Singleton

**File**: `src/lib/prisma.ts`

```typescript
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

**Tasks**:
- [ ] Create singleton pattern to prevent multiple instances
- [ ] Export typed Prisma client
- [ ] Test connection with simple query

---

## Phase 2: Data Access Layer Migration (4h)

### 2.1 Migrate `use-posts.ts` Hook

**Current**: Supabase query builder
**Target**: Prisma Client with `include` for relations

**Key Changes**:
```typescript
// Before
const { data } = await supabase
  .from("posts")
  .select("*, goal:taxonomy!posts_goal_id_fkey(*)")
  .eq("published", true);

// After
const posts = await prisma.post.findMany({
  where: { published: true },
  include: { goal: true, outcome: true },
  orderBy: { publishedAt: 'desc' },
});
```

**Tasks**:
- [ ] Rewrite `usePosts()` with `findMany()` + filters
- [ ] Rewrite `usePost(slug)` with `findFirst()` + where
- [ ] Rewrite `useFeaturedPosts()` with `findMany()` + where
- [ ] Rewrite `useRelatedPosts()` with `findMany()` + exclusion
- [ ] Remove manual type casting (Prisma auto-types)
- [ ] Test all queries with real data

### 2.2 Migrate `use-insights.ts` Hook

**Challenges**:
- Pagination with `useInfiniteQuery`
- Cursor-based or offset-based pagination?

**Tasks**:
- [ ] Rewrite `useInsights()` with `findMany()` + skip/take
- [ ] Rewrite `usePinnedInsights()` with `findMany()` + where
- [ ] Rewrite `useLatestInsights()` with `findMany()` + orderBy
- [ ] Test pagination behavior
- [ ] Verify total count accuracy

### 2.3 Migrate `use-photos.ts` Hook

**Tasks**:
- [ ] Rewrite `usePhotos(album)` with dynamic where
- [ ] Rewrite `useAlbumList()` with grouping in memory or use raw query
- [ ] Test album filtering

### 2.4 Migrate `use-series.ts` Hook

**Tasks**:
- [ ] Rewrite series queries
- [ ] Handle `post_ids` array column correctly
- [ ] Test series-post relationships

### 2.5 Migrate `use-taxonomy.ts` Hook

**Tasks**:
- [ ] Rewrite `useGoals()` with `findMany()` + where type='goal'
- [ ] Rewrite `useOutcomes()` with `findMany()` + where type='outcome'
- [ ] Test taxonomy filtering

### 2.6 Migrate `use-about.ts` Hook

**Tasks**:
- [ ] Rewrite with `findFirst()` (only 1 row)
- [ ] Handle JSONB column for social_links
- [ ] Test JSONB serialization

### 2.7 Migrate `use-resume.ts` Hook

**Tasks**:
- [ ] Rewrite with `findMany()` + orderBy sort_order
- [ ] Handle JSONB column for content
- [ ] Test resume section rendering

### 2.8 Migrate `use-search.ts` Hook

**Tasks**:
- [ ] Implement full-text search with Prisma
- [ ] Use `findMany()` with OR conditions
- [ ] Optimize search queries (add indexes if needed)

---

## Phase 3: Admin & Upload Hooks (3h)

### 3.1 Migrate Admin Post Hooks

**File**: `src/hooks/use-admin-posts.ts`

**Key Operations**:
- Create, update, delete posts
- Upload images to Supabase Storage (keep as-is)
- Update post fields

**Tasks**:
- [ ] Rewrite `createPost()` with `prisma.post.create()`
- [ ] Rewrite `updatePost()` with `prisma.post.update()`
- [ ] Rewrite `deletePost()` with `prisma.post.delete()`
- [ ] Keep Supabase Storage calls for images (no change)
- [ ] Test CRUD operations

### 3.2 Migrate Admin Insights Hooks

**File**: `src/hooks/use-admin-insights.ts`

**Tasks**:
- [ ] Rewrite `createInsight()` with `prisma.insight.create()`
- [ ] Rewrite `updateInsight()` with `prisma.insight.update()`
- [ ] Rewrite `deleteInsight()` with `prisma.insight.delete()`
- [ ] Test CRUD operations

### 3.3 Migrate Admin Photos Hooks

**File**: `src/hooks/use-admin-photos.ts`

**Tasks**:
- [ ] Rewrite `createPhoto()` with `prisma.photo.create()`
- [ ] Rewrite `updatePhoto()` with `prisma.photo.update()`
- [ ] Rewrite `deletePhoto()` with `prisma.photo.delete()`
- [ ] Test CRUD operations
- [ ] Verify image URLs are preserved

### 3.4 Migrate Admin Series Hooks

**File**: `src/hooks/use-admin-series.ts`

**Tasks**:
- [ ] Rewrite `createSeries()` with `prisma.series.create()`
- [ ] Rewrite `updateSeries()` with `prisma.series.update()`
- [ ] Rewrite `deleteSeries()` with `prisma.series.delete()`
- [ ] Test array column updates for post_ids

### 3.5 Migrate `use-upload.ts` Hook

**Note**: This hook uses Supabase Storage API, not database. **No changes needed.**

**Tasks**:
- [ ] Verify upload functionality still works
- [ ] Test image upload and URL generation

---

## Phase 4: Cleanup & Testing (3h)

### 4.1 Remove Supabase Dependencies

**Tasks**:
- [ ] Uninstall `@supabase/supabase-js` package
- [ ] Delete `src/lib/supabase.ts` file
- [ ] Delete `src/types/database.ts` file (types auto-generated)
- [ ] Remove Supabase env vars from `.env.production.example`
- [ ] Update imports in all files (supabase → prisma)

### 4.2 Update Environment Variables

**File**: `.env.production.example`

**Before**:
```bash
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

**After**:
```bash
DATABASE_URL=postgresql://postgres:[password]@db.[project].supabase.co:5432/postgres
DIRECT_URL=postgresql://postgres.[project]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
```

**Tasks**:
- [ ] Update `.env.production.example`
- [ ] Update `.env.local` for development
- [ ] Set production env vars in Vercel dashboard

### 4.3 Generate Prisma Client Types

**Command**:
```bash
bunx prisma generate
```

**Tasks**:
- [ ] Generate Prisma Client with TypeScript types
- [ ] Verify types are generated in `node_modules/.prisma/client/`
- [ ] Test type autocomplete in IDE

### 4.4 Database Migration

**Option A**: Start fresh (recommended for development)
```bash
bunx prisma db push
```

**Option B**: Create migration file (for production)
```bash
bunx prisma migrate dev --name init
```

**Tasks**:
- [ ] Run `prisma db push` to sync schema
- [ ] Verify all tables created correctly
- [ ] Test with seed data
- [ ] Run `bunx prisma studio` to inspect data

### 4.5 Integration Testing

**Test Plan**:

**Public Pages**:
- [ ] Home page loads with featured posts
- [ ] Posts page filters by goal/outcome/level
- [ ] Post detail page loads with relations
- [ ] Insights page pagination works
- [ ] Photos page album filter works
- [ ] Series page loads with post lists
- [ ] About page loads correctly
- [ ] Resume page loads sections

**Admin Pages**:
- [ ] Login works (uses Supabase Auth, keep as-is)
- [ ] Create post works
- [ ] Update post works
- [ ] Delete post works
- [ ] Create insight works
- [ ] Upload photo works
- [ ] Update series works

**Search**:
- [ ] Global search returns results
- [ ] Search highlights matches

**Edge Cases**:
- [ ] Empty states (no posts, no insights)
- [ ] Error handling (network failures)
- [ ] Loading states (spinners, skeletons)

### 4.6 Performance Testing

**Tasks**:
- [ ] Measure bundle size increase (target: +150KB)
- [ ] Test query performance (compare to Supabase)
- [ ] Verify connection pooling works (check Supabase dashboard)
- [ ] Test with 10+ concurrent queries
- [ ] Verify no N+1 queries (use `include` properly)

### 4.7 Bundle Size Verification

**Commands**:
```bash
bun run build
# Check dist/assets/*.js sizes
```

**Tasks**:
- [ ] Build production bundle
- [ ] Measure JS bundle size
- [ ] Compare to baseline (~150KB)
- [ ] Optimize if needed (code splitting, lazy loading)

---

## Rollback Strategy

### If Migration Fails

**Immediate Rollback** (< 1 hour):
1. Revert all code changes via Git
2. Reinstall `@supabase/supabase-js` package
3. Restore Supabase env vars
4. Redeploy previous version

**Rollback Commands**:
```bash
git revert <commit-hash>
bun install
bun run build
```

### If Issues Arise After Migration

**Common Issues & Fixes**:

1. **Connection Pooling Errors**
   - Symptom: "Too many connections" error
   - Fix: Adjust Supabase connection limits, use `DIRECT_URL` for migrations

2. **Type Errors**
   - Symptom: TypeScript errors after migration
   - Fix: Run `bunx prisma generate`, restart IDE

3. **Query Performance**
   - Symptom: Slow queries compared to Supabase
   - Fix: Add indexes to Prisma schema, use `select` to limit fields

4. **Bundle Size Too Large**
   - Symptom: JS bundle > 300KB
   - Fix: Enable code splitting, lazy load Prisma client

---

## Testing Checklist

### Unit Tests (Future)
- [ ] Mock Prisma Client for hook tests
- [ ] Test query builders
- [ ] Test error handling

### Integration Tests (Manual)
- [ ] All public pages load correctly
- [ ] All admin operations work
- [ ] Search functionality works
- [ ] Filtering works (posts by goal/outcome/level)
- [ ] Pagination works (insights infinite scroll)
- [ ] Image uploads work (admin)

### E2E Tests (Future)
- [ ] Playwright/Cypress tests for critical flows
- [ ] Test admin CRUD operations
- [ ] Test public user journeys

---

## Post-Migration Tasks

### Documentation
- [ ] Update `docs/system-architecture.md` with Prisma details
- [ ] Update `docs/codebase-summary.md` with new data layer
- [ ] Create `prisma/README.md` with migration commands
- [ ] Update deployment guide with env var setup

### Maintenance
- [ ] Set up `prisma migrate deploy` for production
- [ ] Add Prisma Studio to development tools
- [ ] Document common Prisma queries for team
- [ ] Create migration workflow for schema changes

### Monitoring
- [ ] Monitor query performance in Supabase dashboard
- [ ] Set up alerts for connection pool exhaustion
- [ ] Track bundle size over time
- [ ] Monitor error rates with Prisma queries

---

## Unresolved Questions

1. **RLS Bypass**: Using service role key bypasses RLS. Is this acceptable for a public-read-only app?
   - **Recommendation**: Yes, since all data is public. Admin auth handled separately.

2. **Connection Pooling**: Should we use Supabase's PgBouncer or direct connection?
   - **Recommendation**: Use PgBouncer for app, direct for migrations (configured above).

3. **Prisma Accelerate**: Should we use Prisma Accelerate for connection caching?
   - **Recommendation**: Not needed for current scale. Add later if performance issues arise.

4. **Migration Strategy**: `prisma db push` (development) or `prisma migrate dev` (production)?
   - **Recommendation**: Use `db push` for development speed, `migrate dev` for production.

5. **Search Implementation**: Full-text search with Prisma or external service?
   - **Recommendation**: Start with Prisma `findMany()` + OR conditions. Migrate to Algolia/Meilisearch if slow.

6. **Real-time Features**: Prisma doesn't support real-time subscriptions. Do we need them?
   - **Recommendation**: Not needed currently. Add Supabase Realtime later if required.

7. **Type Generation**: Should we commit `node_modules/.prisma/client`?
   - **Recommendation**: No. Generate via `prisma generate` in build script if needed for CI.

---

## Appendix

### File Changes Summary

**New Files**:
- `prisma/schema.prisma` - Prisma schema definition
- `src/lib/prisma.ts` - Prisma client singleton

**Modified Files** (15 hooks):
- `src/hooks/use-posts.ts`
- `src/hooks/use-insights.ts`
- `src/hooks/use-photos.ts`
- `src/hooks/use-series.ts`
- `src/hooks/use-taxonomy.ts`
- `src/hooks/use-about.ts`
- `src/hooks/use-resume.ts`
- `src/hooks/use-search.ts`
- `src/hooks/use-admin-posts.ts`
- `src/hooks/use-admin-insights.ts`
- `src/hooks/use-admin-photos.ts`
- `src/hooks/use-admin-series.ts`

**Deleted Files**:
- `src/lib/supabase.ts`
- `src/types/database.ts`

### Package Changes

**Added**:
- `prisma` - Prisma CLI
- `@prisma/client` - Prisma Client runtime

**Removed**:
- `@supabase/supabase-js` - Supabase client

### Environment Variables

**Added**:
- `DATABASE_URL` - Prisma database connection (transaction mode)
- `DIRECT_URL` - Prisma direct connection (migration mode)

**Removed**:
- `VITE_SUPABASE_URL` - Supabase API URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anon key

### Migration Command Reference

```bash
# Initialize Prisma
bunx prisma init

# Generate client from schema
bunx prisma generate

# Push schema to database (dev)
bunx prisma db push

# Create migration (prod)
bunx prisma migrate dev --name init

# Apply migrations in production
bunx prisma migrate deploy

# Open Prisma Studio
bunx prisma studio

# Reset database (dev only)
bunx prisma migrate reset

# Format schema file
bunx prisma format
```

---

**Plan Owner**: Engineering Team
**Review Date**: 2026-01-20
**Status**: Ready for Implementation

---
title: "Prisma Migration Implementation Plan"
description: "Comprehensive plan for migrating from @supabase/supabase-js to Prisma ORM"
date: 2026-01-13
author: "Planner Agent"
status: "completed"
tags: [prisma, migration, database, orm]
---

# Prisma Migration Implementation Plan

## Summary

Created detailed implementation plan for migrating Dynamite Notes from `@supabase/supabase-js` to Prisma ORM. Plan includes 4 phases spanning 12 hours of work with comprehensive testing, rollback strategy, and post-maintenance tasks.

## Current State Analysis

### Existing Architecture
- **Database**: PostgreSQL via Supabase
- **Client**: `@supabase/supabase-js` v2.90.1
- **Types**: Manual definitions in `src/types/database.ts` (334 lines)
- **Schema**: 8 tables (taxonomy, posts, insights, photos, series, about, resume_sections, admins)
- **Query Layer**: TanStack Query v5.83.0
- **Deployment**: Vercel (static hosting)

### Current Query Patterns
- **Simple fetches**: `supabase.from('posts').select('*').eq('published', true)`
- **Relations**: Supabase FK syntax (`goal:taxonomy!posts_goal_id_fkey(*)`)
- **Pagination**: Range-based with `from/to` parameters
- **Filters**: Chained `.eq()`, `.neq()`, `.order()` methods

## Migration Rationale

### Benefits
1. **Type Safety**: Auto-generated types from schema (eliminate 334-line manual file)
2. **Developer Experience**: Better autocomplete, inline documentation
3. **Maintainability**: Single source of truth for schema + types
4. **Ecosystem**: Better tooling (Prisma Studio, migrate CLI)
5. **Performance**: Connection pooling via PgBouncer out-of-the-box

### Trade-offs
1. **Bundle Size**: +150KB (Prisma Client)
2. **Learning Curve**: Team must learn Prisma query syntax
3. **Breaking Change**: All 15 hooks require rewriting
4. **RLS Bypass**: Service role key required (bypasses Row Level Security)

## Implementation Phases

### Phase 1: Foundation Setup (2h)
- Install Prisma packages
- Initialize Prisma with `prisma init`
- Define schema for all 8 tables
- Configure connection pooling (PgBouncer + direct URL)
- Create singleton client pattern

### Phase 2: Data Access Layer (4h)
Migrate all public-facing hooks (8 files):
- `use-posts.ts` - 4 query functions
- `use-insights.ts` - 3 query functions with infinite scroll
- `use-photos.ts` - 2 query functions
- `use-series.ts` - Series queries
- `use-taxonomy.ts` - Goals/outcomes filtering
- `use-about.ts` - Single row fetch
- `use-resume.ts` - Ordered sections
- `use-search.ts` - Full-text search

### Phase 3: Admin & Upload (3h)
Migrate admin hooks (5 files):
- `use-admin-posts.ts` - CRUD operations
- `use-admin-insights.ts` - CRUD operations
- `use-admin-photos.ts` - CRUD operations
- `use-admin-series.ts` - CRUD operations
- `use-upload.ts` - Keep Supabase Storage (no change)

### Phase 4: Cleanup & Testing (3h)
- Remove Supabase dependencies
- Update environment variables
- Generate Prisma types
- Run migration (`db push` or `migrate dev`)
- Integration testing (all pages)
- Performance testing
- Bundle size verification

## Key Technical Decisions

### 1. Connection Pooling Strategy
**Decision**: Use dual connection strings
- `DATABASE_URL` - PgBouncer in transaction mode (app queries)
- `DIRECT_URL` - Direct connection (migrations/seeds)

**Rationale**: PgBouncer limits connection count while direct connection needed for DDL operations.

### 2. RLS Handling
**Decision**: Bypass RLS using service role key

**Rationale**: All data is public-read-only. Admin operations use separate auth (Supabase Auth kept).

### 3. Type Management
**Decision**: Delete manual types, use Prisma generated types

**Rationale**: Single source of truth, auto-synced with schema changes.

### 4. Migration Approach
**Decision**: `prisma db push` for dev, `prisma migrate dev` for prod

**Rationale**: Faster development iteration while maintaining migration history for production.

## Risk Assessment

### High Risk Areas
1. **Query Rewriting**: All 15 hooks must be rewritten perfectly
   - **Mitigation**: Comprehensive integration testing per hook

2. **Connection Pooling**: Misconfiguration causes connection exhaustion
   - **Mitigation**: Use Supabase-provided PgBouncer connection strings

3. **Bundle Size**: +150KB may affect load times
   - **Mitigation**: Code splitting already in place, measure impact

### Medium Risk Areas
1. **Array Columns**: `post_ids`, `tags` arrays must map correctly
   - **Mitigation**: Test array operations in Prisma schema

2. **JSONB Columns**: `social_links`, `content` JSONB must serialize correctly
   - **Mitigation**: Use Prisma's Json type, test serialization

3. **Pagination**: Offset-based vs cursor-based differences
   - **Mitigation**: Keep offset-based for consistency, test infinite scroll

### Low Risk Areas
1. **Environment Variables**: Straightforward replacement
2. **Supabase Storage**: No changes (keep as-is)
3. **Auth System**: Keep Supabase Auth (no changes)

## Testing Strategy

### Unit Testing (Future)
- Mock Prisma Client for hook tests
- Test query builders and error handling

### Integration Testing (Manual)
Cover all user flows:
- **Public**: Browse posts, filter by taxonomy, view insights (paginated), view photos (albums)
- **Admin**: Login, create/edit/delete posts, insights, photos, series
- **Search**: Global search across all content types

### Performance Testing
- Measure query latency (compare to Supabase baseline)
- Test concurrent queries (10+ simultaneous)
- Verify connection pooling works
- Check for N+1 queries

## Rollback Strategy

### Immediate Rollback (< 1 hour)
1. Revert code via Git
2. Reinstall `@supabase/supabase-js`
3. Restore Supabase env vars
4. Redeploy previous version

### Partial Rollback (Specific Hooks)
If specific hooks fail, can roll back individually:
- Keep Prisma for working hooks
- Revert broken hooks to Supabase
- Fix issues incrementally

## Post-Migration Tasks

### Documentation
- Update system architecture docs
- Create Prisma migration guide
- Document common query patterns

### Maintenance
- Set up `prisma migrate deploy` for production
- Add Prisma Studio to dev tools
- Create schema change workflow

### Monitoring
- Track query performance in Supabase dashboard
- Monitor connection pool usage
- Measure bundle size over time

## Unresolved Questions

1. **Full-Text Search**: Prisma `findMany()` + OR conditions vs external service (Algolia/Meilisearch)?
   - **Recommendation**: Start with Prisma, migrate if performance issues.

2. **Real-Time Features**: Prisma doesn't support subscriptions. Needed?
   - **Recommendation**: Not needed currently. Add Supabase Realtime later if required.

3. **Prisma Accelerate**: Connection caching service needed?
   - **Recommendation**: Not needed for current scale.

## Timeline Estimate

- **Phase 1**: 2 hours (setup, schema, client)
- **Phase 2**: 4 hours (8 public hooks)
- **Phase 3**: 3 hours (5 admin hooks)
- **Phase 4**: 3 hours (cleanup, testing)
- **Total**: 12 hours

## Next Steps

1. **Review Plan**: Stakeholder approval
2. **Start Phase 1**: Install dependencies, initialize Prisma
3. **Create Schema**: Map all 8 tables to Prisma schema
4. **Migrate Incrementally**: Start with `use-posts.ts`, test, commit
5. **Full Migration**: Complete all phases
6. **Deploy**: Update production env vars, deploy to Vercel

## Files Modified/Created

**Created**:
- `plans/260113-1604-prisma-migration/plan.md` - Full implementation plan
- `plans/reports/planner-260113-1604-prisma-migration.md` - This report

**To Be Created** (During Implementation):
- `prisma/schema.prisma` - Prisma schema definition
- `src/lib/prisma.ts` - Prisma client singleton

**To Be Modified** (During Implementation):
- 15 hook files (complete rewrite)
- `.env.production.example` - Update env vars
- `package.json` - Update dependencies

**To Be Deleted** (During Implementation):
- `src/lib/supabase.ts`
- `src/types/database.ts`

## Conclusion

Plan is comprehensive and actionable. All technical decisions documented with rationale. Risk mitigation strategies in place. Ready for implementation pending stakeholder review.

---

**Plan Path**: `/Users/dynamite/workspaces/com.dynamite/dynamitenotes/plans/260113-1604-prisma-migration/plan.md`
**Report Date**: 2026-01-13
**Status**: Complete

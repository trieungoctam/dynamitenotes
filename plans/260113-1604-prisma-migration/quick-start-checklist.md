# Prisma Migration Quick-Start Checklist

Use this checklist for fast-tracking the migration process.

## Pre-Migration Checks

- [ ] Backup current database (Supabase dashboard → Database → Backups)
- [ ] Create new Git branch: `git checkout -b feature/prisma-migration`
- [ ] Document current bundle size: `bun run build && du -sh dist/`
- [ ] Note current query performance (check Supabase dashboard)

## Phase 1: Setup (30 min)

- [ ] Install Prisma:
  ```bash
  bun add prisma @prisma/client
  bun add -D tsx
  ```
- [ ] Initialize Prisma:
  ```bash
  bunx prisma init
  ```
- [ ] Copy schema from `schema-mapping-reference.md` to `prisma/schema.prisma`
- [ ] Update `.env` with database URLs:
  ```bash
  DATABASE_URL="postgresql://postgres:[password]@db.[project].supabase.co:5432/postgres"
  DIRECT_URL="postgresql://postgres.[project]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres"
  ```
- [ ] Create `src/lib/prisma.ts` singleton (see reference)
- [ ] Generate Prisma Client: `bunx prisma generate`
- [ ] Test connection with simple query in dev console

## Phase 2: Schema Migration (30 min)

- [ ] **Option A (Dev)**: Push schema directly
  ```bash
  bunx prisma db push
  ```
- [ ] **Option B (Prod)**: Create migration
  ```bash
  bunx prisma migrate dev --name init
  ```
- [ ] Verify tables in Supabase dashboard
- [ ] Open Prisma Studio: `bunx prisma studio`
- [ ] Check data integrity (compare row counts)

## Phase 3: Migrate Hooks (4-6 hours)

**Order**: Migrate one at a time, test, commit.

### Batch 1: Core Hooks (2h)
- [ ] `use-posts.ts` → Test posts page, detail page
- [ ] `use-taxonomy.ts` → Test filtering by goal/outcome
- [ ] `use-series.ts` → Test series page
- [ ] Commit: "feat: migrate posts/taxonomy/series hooks to Prisma"

### Batch 2: Content Hooks (1.5h)
- [ ] `use-insights.ts` → Test insights page + pagination
- [ ] `use-photos.ts` → Test photos page + albums
- [ ] `use-search.ts` → Test global search
- [ ] Commit: "feat: migrate insights/photos/search hooks to Prisma"

### Batch 3: Static Hooks (30 min)
- [ ] `use-about.ts` → Test about page
- [ ] `use-resume.ts` → Test resume page
- [ ] Commit: "feat: migrate about/resume hooks to Prisma"

### Batch 4: Admin Hooks (2h)
- [ ] `use-admin-posts.ts` → Test admin CRUD
- [ ] `use-admin-insights.ts` → Test admin CRUD
- [ ] `use-admin-photos.ts` → Test admin CRUD
- [ ] `use-admin-series.ts` → Test admin CRUD
- [ ] Commit: "feat: migrate admin hooks to Prisma"

**Note**: `use-upload.ts` uses Supabase Storage → **No changes needed**

## Phase 4: Cleanup (1 hour)

- [ ] Remove `@supabase/supabase-js`:
  ```bash
  bun remove @supabase/supabase-js
  ```
- [ ] Delete `src/lib/supabase.ts`
- [ ] Delete `src/types/database.ts`
- [ ] Update imports (search for `from "@/lib/supabase"` or `from "@/types/database"`)
- [ ] Update `.env.production.example`:
  ```bash
  # Remove VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY
  # Add DATABASE_URL, DIRECT_URL
  ```
- [ ] Commit: "chore: remove Supabase dependencies"

## Phase 5: Testing (2 hours)

### Smoke Tests
- [ ] Home page loads
- [ ] Posts page loads + filters work
- [ ] Post detail page loads
- [ ] Insights page loads + pagination works
- [ ] Photos page loads + album filter works
- [ ] Series page loads
- [ ] About page loads
- [ ] Resume page loads
- [ ] Search works

### Admin Tests
- [ ] Login works (Supabase Auth still active)
- [ ] Create post works
- [ ] Update post works
- [ ] Delete post works
- [ ] Upload photo works (Supabase Storage still active)

### Performance Tests
- [ ] Build production bundle: `bun run build`
- [ ] Check bundle size: `du -sh dist/assets/*.js`
- [ ] Compare to baseline (should be +150KB)
- [ ] Test query performance (check Supabase dashboard)
- [ ] Load test: Run 10 concurrent queries

## Phase 6: Deployment (30 min)

- [ ] Update Vercel env vars:
  - Remove: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
  - Add: `DATABASE_URL`, `DIRECT_URL`
- [ ] Merge branch: `git checkout main && git merge feature/prisma-migration`
- [ ] Push to GitHub: `git push origin main`
- [ ] Monitor Vercel deployment logs
- [ ] Test production site:
  - [ ] Home page loads
  - [ ] Posts page loads
  - [ ] Admin login works
  - [ ] Create new post (test write access)

## Rollback Procedure (If Needed)

```bash
# 1. Revert commit
git revert HEAD

# 2. Reinstall Supabase
bun add @supabase/supabase-js

# 3. Restore env vars in Vercel
#    - Add back VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY
#    - Remove DATABASE_URL, DIRECT_URL

# 4. Redeploy
git push origin main
```

## Post-Migration Tasks

- [ ] Update `docs/system-architecture.md` with Prisma details
- [ ] Update `docs/codebase-summary.md`
- [ ] Add `prisma/README.md` with migration commands
- [ ] Document schema change workflow for team
- [ ] Create Prisma migration script for CI/CD:
  ```bash
  # Add to package.json scripts
  "migrate:prod": "prisma migrate deploy"
  ```

## Common Issues & Fixes

### Issue: "Too many connections"
**Fix**: Verify `DATABASE_URL` uses PgBouncer port (6543), not direct (5432)

### Issue: TypeScript errors
**Fix**: Run `bunx prisma generate`, restart IDE

### Issue: "Column not found" errors
**Fix**: Check Prisma schema field names match DB (use `@map` for snake_case)

### Issue: Array column returns null
**Fix**: Ensure array type in schema: `tags String[] @default([])`

### Issue: JSONB column errors
**Fix**: Use `Json` type, not `JsonObject`: `socialLinks Json`

## Timeline Estimate

| Phase | Time |
|-------|------|
| Setup | 30 min |
| Schema Migration | 30 min |
| Hook Migration | 4-6 hours |
| Cleanup | 1 hour |
| Testing | 2 hours |
| Deployment | 30 min |
| **Total** | **8-10 hours** |

## Success Criteria

- [ ] All pages load without errors
- [ ] Admin CRUD operations work
- [ ] Bundle size increase < 200KB
- [ ] Query performance within 2x of baseline
- [ ] Zero TypeScript errors
- [ ] Production deployment successful

---

**Start Date**: ___________
**End Date**: ___________
**Completed By**: ___________

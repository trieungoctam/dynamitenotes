# Phase 6: Migration & Launch

## Context Links
- [Main Plan](./plan.md)
- Dependencies: Phases 1-5

## Overview

| Field | Value |
|-------|-------|
| Date | 2026-01-13 |
| Priority | P1 |
| Effort | 4h |
| Status | completed |
| Review | completed |

**Goal:** Migrate content, set up redirects, final testing, and production deployment.

## Key Insights

- Old routes need redirects to prevent broken links
- Content migration can be scripted
- Deployment via Vercel/Cloudflare for static hosting
- Monitor errors post-launch

## Requirements

1. Migrate existing content (if any)
2. Set up redirects from old routes
3. Final testing on staging
4. Production deployment
5. Post-launch monitoring

## Architecture

### Files to Create

```
scripts/
├── migrate-content.ts    # Content migration script
└── seed-taxonomy.ts      # Seed goals/outcomes

public/
└── _redirects            # Redirect rules (Netlify format)
                          # or vercel.json for Vercel
```

### Files to Modify

- `vercel.json` or `netlify.toml` - Redirect rules
- `.env.production` - Production env vars

## Implementation Steps

### 1. Seed Taxonomy Data (30min)

**File:** `scripts/seed-taxonomy.ts`

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

const goals = [
  { type: 'goal', slug: 'decide', name_vi: 'Chọn hướng', name_en: 'Decide', icon: 'compass', color: 'blue' },
  { type: 'goal', slug: 'spec', name_vi: 'Định nghĩa', name_en: 'Spec', icon: 'file-text', color: 'purple' },
  { type: 'goal', slug: 'build', name_vi: 'Xây dựng', name_en: 'Build', icon: 'hammer', color: 'orange' },
  { type: 'goal', slug: 'ship', name_vi: 'Vận chuyển', name_en: 'Ship', icon: 'rocket', color: 'green' },
  { type: 'goal', slug: 'measure', name_vi: 'Đo lường', name_en: 'Measure', icon: 'chart-bar', color: 'cyan' },
  { type: 'goal', slug: 'operate', name_vi: 'Vận hành', name_en: 'Operate', icon: 'settings', color: 'gray' }
];

const outcomes = [
  { type: 'outcome', slug: 'prd', name_vi: 'PRD', name_en: 'PRD' },
  { type: 'outcome', slug: 'tech-spec', name_vi: 'Tech Spec', name_en: 'Tech Spec' },
  { type: 'outcome', slug: 'prompt', name_vi: 'Prompt', name_en: 'Prompt' },
  { type: 'outcome', slug: 'eval', name_vi: 'Đánh giá', name_en: 'Evaluation' },
  { type: 'outcome', slug: 'experiment', name_vi: 'Thí nghiệm', name_en: 'Experiment' },
  { type: 'outcome', slug: 'checklist', name_vi: 'Checklist', name_en: 'Checklist' },
  { type: 'outcome', slug: 'dashboard', name_vi: 'Dashboard', name_en: 'Dashboard' }
];

async function seed() {
  console.log('Seeding taxonomy...');

  const { error: goalsError } = await supabase
    .from('taxonomy')
    .upsert(goals.map((g, i) => ({ ...g, sort_order: i })));

  if (goalsError) console.error('Goals error:', goalsError);

  const { error: outcomesError } = await supabase
    .from('taxonomy')
    .upsert(outcomes.map((o, i) => ({ ...o, sort_order: i })));

  if (outcomesError) console.error('Outcomes error:', outcomesError);

  console.log('Taxonomy seeded!');
}

seed();
```

Run: `SUPABASE_URL=... SUPABASE_SERVICE_KEY=... bun run scripts/seed-taxonomy.ts`

### 2. Content Migration (1h)

**File:** `scripts/migrate-content.ts`

If migrating from existing static content:

```typescript
import { createClient } from '@supabase/supabase-js';
import { existingPackages } from '../src/data/packages'; // if exists

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

async function migrate() {
  // Example: Convert existing packages to posts
  for (const pkg of existingPackages) {
    for (const item of pkg.items) {
      const post = {
        slug: `${pkg.id}-${item.id}`,
        title_vi: item.title,
        title_en: item.title,
        content_vi: item.content || '',
        content_en: '',
        excerpt_vi: item.description || '',
        level: pkg.difficulty,
        read_time: parseInt(item.readTime) || 5,
        published: true,
        published_at: new Date().toISOString()
      };

      const { error } = await supabase.from('posts').upsert(post);
      if (error) console.error(`Error migrating ${item.id}:`, error);
    }
  }

  console.log('Migration complete!');
}

migrate();
```

### 3. Set Up Redirects (30min)

**For Vercel - vercel.json:**

```json
{
  "redirects": [
    { "source": "/packages", "destination": "/posts", "permanent": true },
    { "source": "/packages/:path*", "destination": "/posts", "permanent": true },
    { "source": "/docs", "destination": "/posts", "permanent": true },
    { "source": "/docs/:path*", "destination": "/posts", "permanent": true },
    { "source": "/playground", "destination": "/", "permanent": true },
    { "source": "/changelog", "destination": "/", "permanent": true }
  ],
  "rewrites": [
    { "source": "/((?!api/).*)", "destination": "/index.html" }
  ]
}
```

**For Netlify - public/_redirects:**

```
/packages       /posts          301
/packages/*     /posts          301
/docs           /posts          301
/docs/*         /posts          301
/playground     /               301
/changelog      /               301
/*              /index.html     200
```

**For Cloudflare Pages - _redirects:**

Same as Netlify format.

### 4. Production Environment Setup (30min)

**File:** `.env.production`

```bash
VITE_SUPABASE_URL=https://prod-project.supabase.co
VITE_SUPABASE_ANON_KEY=prod-anon-key
VITE_BUTTONDOWN_API_KEY=prod-buttondown-key
VITE_SITE_URL=https://dynamitenotes.com
```

Configure in hosting platform:
1. Go to project settings
2. Add environment variables
3. Set for production environment

### 5. Pre-Launch Testing Checklist (1h)

**Functional Testing:**
- [ ] All 7 public pages load
- [ ] Search returns results
- [ ] Language toggle works
- [ ] Admin login works
- [ ] Admin can create/edit/publish post
- [ ] Admin can upload images
- [ ] Newsletter signup works
- [ ] RSS feed accessible

**Cross-Browser Testing:**
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

**Performance Testing:**
- [ ] Lighthouse Performance > 90
- [ ] Lighthouse Accessibility > 90
- [ ] Lighthouse Best Practices > 90
- [ ] Lighthouse SEO > 90
- [ ] Page load < 3s on 3G

**Security Testing:**
- [ ] Non-admin cannot access /admin
- [ ] RLS blocks non-admin writes
- [ ] No secrets in frontend bundle
- [ ] HTTPS enforced

### 6. Deploy to Production (30min)

**Vercel:**
```bash
# Install Vercel CLI
bun add -g vercel

# Deploy
vercel --prod
```

**Cloudflare Pages:**
```bash
# Via Git integration
# 1. Connect GitHub repo in Cloudflare dashboard
# 2. Set build command: bun run build
# 3. Set output directory: dist
# 4. Add environment variables
# 5. Deploy
```

**Manual Deploy:**
```bash
# Build
bun run build

# Upload dist/ to hosting
```

### 7. Post-Launch Monitoring (30min)

**Set up monitoring:**

1. **Error tracking (Sentry):**
   ```bash
   bun add @sentry/react
   ```

   ```typescript
   // src/main.tsx
   import * as Sentry from '@sentry/react';

   Sentry.init({
     dsn: import.meta.env.VITE_SENTRY_DSN,
     environment: import.meta.env.MODE
   });
   ```

2. **Analytics (Vercel Analytics or Plausible):**
   ```typescript
   // For Vercel Analytics
   import { Analytics } from '@vercel/analytics/react';

   // Add to App.tsx
   <Analytics />
   ```

3. **Uptime monitoring:**
   - Set up in Supabase Dashboard > Observability
   - Or use external service (Better Uptime, Pingdom)

### 8. Launch Announcement (Optional)

- Update README.md
- Social media posts
- Newsletter announcement

## Todo List

- [ ] Seed taxonomy data
- [ ] Migrate existing content (if any)
- [ ] Create redirect rules
- [ ] Set up production environment variables
- [ ] Run pre-launch testing checklist
- [ ] Fix any issues found
- [ ] Deploy to production
- [ ] Verify production site works
- [ ] Set up error tracking
- [ ] Set up analytics
- [ ] Set up uptime monitoring
- [ ] Announce launch

## Success Criteria

- [ ] Site accessible at production URL
- [ ] All old routes redirect correctly
- [ ] No 404 errors for old links
- [ ] Admin can log in and manage content
- [ ] Error tracking captures errors
- [ ] Analytics collecting data

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Redirect loops | Low | High | Test all old routes manually |
| Production env var missing | Medium | High | Checklist before deploy |
| DNS propagation delay | Low | Low | Wait 24-48h for full propagation |
| Supabase rate limits | Low | Medium | Upgrade plan if needed |

## Security Considerations

- Verify production API keys are different from dev
- Check that service role key is not exposed
- Ensure HTTPS is enforced
- Review Supabase RLS policies one more time

## Rollback Plan

If critical issues found:

1. **Quick fix:** Push hotfix to main branch
2. **Rollback:** Revert to previous deployment
   - Vercel: `vercel rollback`
   - Cloudflare: Rollback in dashboard
3. **Data issues:** Restore from Supabase point-in-time recovery

## Post-Launch Tasks

After successful launch:
- [ ] Monitor error rates for 24-48h
- [ ] Gather user feedback
- [ ] Create first real content
- [ ] Set up regular backup schedule
- [ ] Document any issues for future reference

## Completion

When all items checked:
1. Update plan.md status to `completed`
2. Update all phase files status to `completed`
3. Archive plan folder if desired
4. Celebrate! 🎉

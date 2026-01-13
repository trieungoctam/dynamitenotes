---
title: "Phase 1: Security Fixes"
description: "Fix 12 critical security issues before implementing design changes"
status: pending
priority: P0
effort: 4h
---

## Context

**Source:** [Security Audit](../../reports/debugger-260113-0431-security-audit.md)

**Issues:** 12 total (3 P0, 4 P1, 5 P2)

## Requirements

From security audit, must fix:

### Critical (P0) - Complete Blockers
1. Supabase credentials exposed in `.env.local`
2. No RLS policy verification enabled
3. Service role key protection

### High (P1) - Security Risks
4. Client-side admin authorization bypass
5. XSS via react-markdown (no sanitization)
6. SQL injection via user input (slug validation)
7. Vulnerable dependencies (7 vulnerabilities)

## Implementation Steps

### Step 1: Rotate Credentials (30 min)

```bash
# 1. In Supabase dashboard, rotate anon key
# 2. Update .env.local with new key
# 3. Remove .env.local from git history
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env.local" \
  --prune-empty --tag-name-filter cat -- --all

# 4. Add to .gitignore
echo ".env.local" >> .gitignore
```

**Success:** `.env.local` not in git, new anon key active

### Step 2: Enable RLS Policies (1 hour)

```sql
-- Enable RLS on all tables
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE series ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;

-- Public read for published content
CREATE POLICY "Public posts are viewable"
ON posts FOR SELECT USING (published = true);

-- Author-only updates
CREATE POLICY "Authors can update own posts"
ON posts FOR UPDATE USING (auth.uid() = author_id);

-- Admin full access
CREATE POLICY "Admins have full access"
ON posts FOR ALL USING (
  EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid())
);
```

**Success:** All tables have RLS enabled with appropriate policies

### Step 3: Server-Side Admin Verification (1 hour)

Create Supabase Edge Function:

```typescript
// supabase/functions/is_admin/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

serve(async (req) => {
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return new Response('Unauthorized', { status: 401 })
  }

  const { data: isAdmin } = await supabase
    .from('admins')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!isAdmin) {
    return new Response('Forbidden', { status: 403 })
  }

  return new Response(JSON.stringify({ isAdmin: true }), {
    headers: { 'Content-Type': 'application/json' }
  })
})
```

Update `ProtectedRoute.tsx` to call this function.

**Success:** Admin checks verified server-side, cannot bypass with DevTools

### Step 4: XSS Prevention (30 min)

Install DOMPurify:

```bash
bun add dompurify
bun add -D @types/dompurify
```

Update `MarkdownRenderer.tsx`:

```typescript
import DOMPurify from 'dompurify';

const sanitized = DOMPurify.sanitize(markdownHtml, {
  ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'a', 'img', 'h1', 'h2', 'h3', 'ul', 'ol', 'li', 'blockquote', 'code', 'pre'],
  ALLOWED_ATTR: ['href', 'src', 'alt', 'class'],
});

// Also validate image URLs
const img = ({ src }: any) =>
  src?.startsWith('http') ? <img src={src} /> : null;
```

**Success:** All markdown sanitized, no XSS via user content

### Step 5: Input Validation (30 min)

```bash
bun add zod
```

Create validation schemas:

```typescript
// src/lib/validations/post.ts
import { z } from 'zod';

export const postSchema = z.object({
  title: z.string().min(1).max(200).trim(),
  slug: z.string().regex(/^[a-z0-9-]+$/).min(1).max(100),
  content: z.string().min(1),
  excerpt: z.string().max(500).optional(),
  coverImageUrl: z.string().url().optional(),
});
```

Apply in `PostEditor.tsx` before submit.

**Success:** All user input validated before database operations

### Step 6: Update Dependencies (30 min)

```bash
bun update
bun audit fix
```

Verify no remaining vulnerabilities:

```bash
bun audit
```

**Success:** 0 high/critical vulnerabilities

## Success Criteria

- [ ] `.env.local` removed from git history
- [ ] All tables have RLS enabled with verified policies
- [ ] Admin checks verified server-side via Edge Function
- [ ] DOMPurify sanitizing all markdown content
- [ ] Zod schemas validating all user input
- [ ] `bun audit` shows 0 high/critical vulnerabilities

## Risk Assessment

**High Risk:** RLS changes may break existing admin access

**Mitigation:**
1. Test RLS policies in staging environment first
2. Keep database backup before applying RLS
3. Have SQL rollback script ready

## Next Steps

After security fixes complete, proceed to [Phase 2: Code Quality](./phase-02-code-quality.md)

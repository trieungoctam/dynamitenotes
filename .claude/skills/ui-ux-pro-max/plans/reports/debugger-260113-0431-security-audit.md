# Security Audit: Dynamite Notes
**Date**: 2026-01-13

## Executive Summary

**12 issues**: 3 Critical (P0), 4 High (P1), 5 Medium (P2)

**Top Risks**: Supabase credentials exposed, no RLS verification, client-side auth, XSS, vulnerable deps

---

## Critical Issues (P0)

### 1. Supabase Credentials Exposed
**File**: `.env.local`
Project URL + anon key committed to git

**Fix**: Rotate anon key, remove from git history
```bash
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env.local" \
  --prune-empty --tag-name-filter cat -- --all
```

### 2. No RLS Policy Verification
**Files**: All `src/hooks/use-*.ts`, `AuthContext.tsx:36`
Queries `admins` table without confirming RLS enabled

**Fix**: Enable RLS on all tables
```sql
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own admin status"
ON admins FOR SELECT USING (auth.uid() = user_id);
```

### 3. Service Role Key Protection
Ensure service role key never used client-side. Use Supabase Edge Functions or RPC with `SECURITY DEFINER`.

---

## High Priority Issues (P1)

### 4. Client-Side Admin Authorization
**Files**: `ProtectedRoute.tsx:32`, `AuthContext.tsx:34`
Admin checks only in React, bypassable via DevTools

**Fix**: Add server-side verification via RPC
```sql
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
  SELECT EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid())
$$ SECURITY DEFINER;
```

### 5. XSS via react-markdown
**File**: `MarkdownRenderer.tsx:90`
User-generated markdown rendered without sanitization

**Fix**: Install DOMPurify, validate URLs
```typescript
import DOMPurify from 'dompurify';
const sanitized = DOMPurify.sanitize(content, {
  ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'a', 'img'],
  ALLOWED_ATTR: ['href', 'src', 'alt'],
});
img: ({ src }) => src?.startsWith('http') ? <img src={src} /> : null
```

### 6. SQL Injection via User Input
**Files**: `use-admin-posts.ts:59`, `PostEditor.tsx:116`
Slug from user input not validated

**Fix**: Add Zod validation
```typescript
const slugSchema = z.string().regex(/^[a-z0-9-]+$/).min(1).max(100);
```

### 7. Vulnerable Dependencies
**File**: `package.json`
7 vulnerabilities (4 high) - @remix-run/router XSS, glob command injection

**Fix**: `npm update && npm audit fix`

---

## Medium Priority Issues (P2)

### 8. No CSRF Protection
Add origin checks for mutations

### 9. No Rate Limiting
Enable Supabase rate limiting in dashboard

### 10. Sensitive Data in Bundle
**File**: `supabase.ts:14`
Remove error messages from production builds

### 11. Insufficient Input Validation
**File**: `PostEditor.tsx:272`
Add Zod schemas for all form fields

### 12. No Content Security Policy
Add CSP meta tag to `index.html`

---

## Positive Practices
✅ Supabase anon key (not service role) for client
✅ React Router protected routes
✅ TypeScript type safety
✅ No `dangerouslySetInnerHTML` in markdown
✅ Image compression before upload

---

## Action Plan

**Immediate (24h)**:
1. Rotate Supabase anon key (#1)
2. Remove .env.local from git (#1)
3. Enable RLS policies (#2)
4. Update dependencies (#7)

**Short-term (1 week)**:
5. Add DOMPurify (#5)
6. Add Zod validation (#6, #11)
7. Add rate limiting (#9)
8. Add CSP headers (#12)

**Medium-term (1 month)**:
9. Server-side admin checks (#4)
10. Audit logging (#4)

**Ongoing**: Monthly dependency updates, quarterly security reviews

---

## Unresolved Questions

1. Are RLS policies actually enabled in Supabase dashboard?
2. Is service role key used server-side?
3. What are Supabase Storage bucket policies?
4. What are session timeout settings?

---

**Report End** | *Files: 50+ reviewed | Issues: 12 (3 P0, 4 P1, 5 P2)*

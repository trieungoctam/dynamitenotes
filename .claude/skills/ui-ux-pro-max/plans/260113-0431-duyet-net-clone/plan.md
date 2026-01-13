---
title: "Clone duyet.net Design for Dynamite Notes"
description: "Complete redesign implementing duyet.net's minimalist aesthetic with warm colors, elegant typography, and subtle animations"
status: pending
priority: P1
effort: 28h
branch: main
tags: [design, redesign, duyet-net, security, performance]
created: 2026-01-13
---

## Overview

Comprehensive 6-phase plan to clone duyet.net design for Dynamite Notes blog, addressing critical security issues, improving code quality, and implementing production-ready design system.

**Context Links:**
- [duyet.net Design Spec](../reports/researcher-260113-0427-duyet-net-design-spec.md)
- [Security Audit](../reports/debugger-260113-0431-security-audit.md)
- [Code Review](../reports/code-reviewer-260113-0431-dynamite-notes.md)
- [Blog Best Practices](../reports/researcher-260113-0419-modern-blog-best-practices.md)
- [Supabase Best Practices](../reports/researcher-260113-0419-supabase-best-practices-2026.md)

## Phases

| Phase | Status | Priority | Effort | Link |
|-------|--------|----------|--------|------|
| 1. Security Fixes | pending | P0 | 4h | [phase-01-security-fixes.md](./phase-01-security-fixes.md) |
| 2. Code Quality | pending | P1 | 6h | [phase-02-code-quality.md](./phase-02-code-quality.md) |
| 3. Design System | pending | P1 | 5h | [phase-03-design-system.md](./phase-03-design-system.md) |
| 4. UI Redesign | pending | P1 | 8h | [phase-04-ui-redesign.md](./phase-04-ui-redesign.md) |
| 5. Performance | pending | P2 | 3h | [phase-05-performance.md](./phase-05-performance.md) |
| 6. Polish | pending | P2 | 2h | [phase-06-polish.md](./phase-06-polish.md) |

**Total Effort:** 28 hours (~3.5 days)

## Success Criteria

- [ ] All 12 security issues resolved (3 P0, 4 P1, 5 P2)
- [ ] 8 large files modularized (target: <200 lines each)
- [ ] TypeScript strict mode enabled
- [ ] duyet.net design fully implemented across all pages
- [ ] Core Web Vitals: LCP < 2.5s, INP < 200ms, CLS < 0.1
- [ ] Test coverage > 70%
- [ ] WCAG 2.2 Level AA compliant

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Breaking existing auth during security fixes | HIGH | Test admin access thoroughly after RLS changes |
| TypeScript strict mode introduces many errors | MEDIUM | Enable incrementally, fix in small batches |
| Design migration breaks existing functionality | MEDIUM | Keep existing admin UI, migrate public pages first |
| Performance optimizations cause regressions | LOW | Benchmark before/after, use CWV monitoring |

## Unresolved Questions

1. Should we migrate to Vite SSR/SSG for SEO or stay with SPA?
2. What's the target deployment platform (Vercel, Netlify, Cloudflare)?
3. Are there existing brand colors to preserve vs duyet.net palette?
4. Should we implement AI-powered features like AiFeaturedCard?

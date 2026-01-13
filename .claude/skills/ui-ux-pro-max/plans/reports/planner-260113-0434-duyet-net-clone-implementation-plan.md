# Implementation Plan: Clone duyet.net Design for Dynamite Notes

**Report ID:** planner-260113-0434-duyet-net-clone-implementation-plan
**Date:** 2026-01-13
**Status:** Complete

---

## Executive Summary

Comprehensive 6-phase implementation plan to clone duyet.net design for Dynamite Notes blog. Based on 5 research reports covering design specifications, security audit, code review, modern blog best practices, and Supabase patterns.

**Total Effort:** 28 hours (~3.5 days)
**Priority:** P1 (High)
**Risk:** Medium (mitigated with incremental approach)

---

## Plan Structure

```
plans/260113-0431-duyet-net-clone/
├── plan.md                      (Overview, 80 lines)
├── phase-01-security-fixes.md   (4 hours, P0)
├── phase-02-code-quality.md     (6 hours, P1)
├── phase-03-design-system.md    (5 hours, P1)
├── phase-04-ui-redesign.md      (8 hours, P1)
├── phase-05-performance.md      (3 hours, P2)
└── phase-06-polish.md           (2 hours, P2)
```

---

## Phase Overview

| Phase | Focus | Effort | Priority | Deliverables |
|-------|-------|--------|----------|-------------|
| 1 | Security Fixes | 4h | P0 | RLS policies, DOMPurify, Zod validation, credential rotation |
| 2 | Code Quality | 6h | P1 | Modularize 8 files, TypeScript strict, testing framework |
| 3 | Design System | 5h | P1 | Color palette, typography, components (Card, Badge, Container) |
| 4 | UI Redesign | 8h | P1 | Homepage, Posts, PostDetail, Series, About, Resume layouts |
| 5 | Performance | 3h | P2 | Code splitting, lazy loading, image optimization, CWV targets |
| 6 | Polish | 2h | P2 | Animations, accessibility, E2E tests, deployment checklist |

---

## Key Design Decisions

### 1. Security-First Approach (Phase 1)
**Rationale:** Must fix 12 security issues (3 P0) before any design work
**Impact:** Blocks feature work but critical for production readiness
**Mitigation:** Test admin access thoroughly after RLS changes

### 2. Incremental TypeScript Migration (Phase 2)
**Rationale:** Enabling strict mode will introduce 100+ errors
**Approach:** Enable `strict` first, fix errors in batches, then add additional checks
**Alternative:** Keep relaxed config (rejected - technical debt)

### 3. duyet.net Color Palette Adaptation (Phase 3)
**Decision:** Use exact 8 warm colors from duyet.net (ivory, oat, cream, cactus, sage, lavender, terracotta, coral)
**Rationale:** Proven aesthetic, high contrast ratios, WCAG AA compliant
**Variation:** Keep existing brand colors if preferred (documented as open question)

### 4. Public-First Redesign (Phase 4)
**Scope:** Redesign all public-facing pages, keep admin dashboard unchanged
**Rationale:** Redesign benefits blog visitors, admin UI doesn't affect UX
**Risk:** Reduces refactoring effort by ~50%

### 5. Performance Budget (Phase 5)
**Targets:** LCP < 2.5s, INP < 200ms, CLS < 0.1, Bundle < 200KB gzipped
**Approach:** Code splitting by route, Supabase image transforms, critical resource preloading
**Measurement:** Lighthouse scores before/after each optimization

---

## Critical Success Factors

### Must Have (Blocking)
- [ ] All 12 security issues resolved (RLS enabled, DOMPurify, Zod)
- [ ] All 8 large files modularized (<200 lines)
- [ ] TypeScript strict mode enabled with 0 errors
- [ ] duyet.net design implemented across all public pages

### Should Have (Quality Gates)
- [ ] Test coverage > 70%
- [ ] Core Web Vitals in "Good" range
- [ ] WCAG 2.2 Level AA compliant
- [ ] Zero accessibility violations (axe-core)

### Nice to Have (Polish)
- [ ] AI-powered features (AiFeaturedCard from duyet.net)
- [ ] Advanced animations (Framer Motion page transitions)
- [ ] E2E test suite (Playwright)

---

## Risk Register

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| RLS changes break admin access | HIGH | Medium | Test in staging, keep rollback script |
| TypeScript strict introduces too many errors | MEDIUM | High | Enable incrementally, fix in batches |
| Design migration breaks existing functionality | MEDIUM | Low | Keep admin UI unchanged, test navigation |
| Performance optimizations cause regressions | LOW | Low | Benchmark before/after, monitor CWV |
| Bundle size exceeds budget | LOW | Medium | Analyze with rollup-plugin-visualizer |

---

## Dependencies & Prerequisites

### External Dependencies
```bash
# Security
bun add dompurify zod

# Design
bun add tailwindcss@latest framer-motion next-themes
bun add lucide-react @radix-ui/react-icons
bun add @fontsource/inter @fontsource/libre-baskerville

# Testing
bun add -D vitest @testing-library/react @testing-library/jest-dom @playwright/test @axe-core/react

# Build
bun add -D rollup-plugin-visualizer
```

### Supabase Requirements
- Enable RLS on all tables
- Rotate anon key (remove from git history)
- Create Edge Function for admin verification
- Configure image transformation CDN

### Environment Variables
```env
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
# No service role key in client code!
```

---

## Implementation Timeline

**Week 1:** Security + Code Quality (Phase 1-2, 10 hours)
**Week 2:** Design System + UI Redesign (Phase 3-4, 13 hours)
**Week 3:** Performance + Polish (Phase 5-6, 5 hours)

**Milestone 1 (Day 2):** Security fixes complete, production-safe
**Milestone 2 (Day 4):** Code quality improvements, strict TypeScript enabled
**Milestone 3 (Day 7):** Design system complete, ready for UI implementation
**Milestone 4 (Day 10):** All pages redesigned, matching duyet.net aesthetic
**Milestone 5 (Day 12):** Performance optimized, CWV targets met
**Milestone 6 (Day 14):** Production-ready, deployed, monitoring active

---

## Unresolved Questions

1. **SSG vs SPA:** Should we migrate to Vite SSR/SSG for SEO or stay with SPA? (Documented in plan.md as open question)
2. **Deployment Target:** What platform (Vercel, Netlify, Cloudflare Pages)? (Affects CSP headers, optimization strategies)
3. **Brand Colors:** Should we preserve existing brand colors or adopt duyet.net palette? (Design decision needed)
4. **AI Features:** Should we implement AI-powered features like AiFeaturedCard? (Optional, documented in duyet.net spec)
5. **Analytics:** What analytics platform? Privacy compliance requirements? (Not in current scope)

---

## Next Steps

1. **Review Plan:** Share with stakeholders for approval
2. **Address Questions:** Resolve unresolved questions before starting
3. **Create Branch:** `git checkout -b feat/duyet-net-redesign`
4. **Start Phase 1:** Begin security fixes (highest priority)
5. **Track Progress:** Update phase status as work completes

---

## Context Links

**Research Reports:**
- [duyet.net Design Spec](../../reports/researcher-260113-0427-duyet-net-design-spec.md)
- [Security Audit](../../reports/debugger-260113-0431-security-audit.md)
- [Code Review](../../reports/code-reviewer-260113-0431-dynamite-notes.md)
- [Blog Best Practices](../../reports/researcher-260113-0419-modern-blog-best-practices.md)
- [Supabase Best Practices](../../reports/researcher-260113-0419-supabase-best-practices-2026.md)

**Plan Files:**
- [Main Plan](../../plans/260113-0431-duyet-net-clone/plan.md)
- [Phase 1: Security Fixes](../../plans/260113-0431-duyet-net-clone/phase-01-security-fixes.md)
- [Phase 2: Code Quality](../../plans/260113-0431-duyet-net-clone/phase-02-code-quality.md)
- [Phase 3: Design System](../../plans/260113-0431-duyet-net-clone/phase-03-design-system.md)
- [Phase 4: UI Redesign](../../plans/260113-0431-duyet-net-clone/phase-04-ui-redesign.md)
- [Phase 5: Performance](../../plans/260113-0431-duyet-net-clone/phase-05-performance.md)
- [Phase 6: Polish](../../plans/260113-0431-duyet-net-clone/phase-06-polish.md)

---

**Report End** | *Status: Complete | Ready for Implementation*

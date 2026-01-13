# Plan Validation Report: 3D Animated Blog Title

**Date**: 2026-01-13 15:02
**Type**: Validation Interview
**Plan**: 3D Animated Blog Title with Three.js & Custom Shaders
**Status**: ✅ Approved for Implementation

---

## Validation Decisions

### 1. Technology Choice
**Question**: Project uses CSS-only for all existing 3D effects. Proceed with Three.js despite pattern?

**Decision**: ✅ **Proceed with Three.js**
- Accepts ~50KB bundle impact
- First WebGL dependency in project
- Justification: True 3D geometry + shader effects require WebGL

**Risks Mitigated**:
- Lazy loading will isolate bundle impact
- CSS fallback maintains performance for reduced motion
- Bundle size within acceptable range

---

### 2. Font Strategy
**Question**: Which font approach for SDF text rendering?

**Decision**: ✅ **Troika Default Font**
- No licensing issues
- Works immediately without conversion
- Generic sans-serif appearance

**Alternatives Considered**:
- Clash Display conversion: Rejected (licensing unclear)
- Google Fonts fetch: Rejected (network delay, complexity)

**Trade-off**: Brand consistency vs. simplicity → Chose simplicity

---

### 3. Integration Point
**Question**: Where should the 3D blog title appear?

**Decision**: ✅ **Replace Index.tsx Hero Heading**
- Maximum visibility for branding impact
- Replaces existing "Dynamite" heading in hero section
- Primary landing page experience

**Implications**:
- Homepage load time impacted (mitigated by lazy loading)
- Hero section needs restructure
- Most prominent placement for 3D effect

**Alternatives Considered**:
- Dedicated showcase page: Lower risk, lower visibility
- Posts.tsx page: Contextual but cluttered

---

### 4. Fallback Strategy
**Question**: When to show CSS fallback for prefers-reduced-motion?

**Decision**: ✅ **CSS Fallback Always**
- Immediate detection via `prefers-reduced-motion`
- Matches existing HeroScene.tsx pattern
- No device capability probing

**Implementation**:
```typescript
if (useReducedMotion()) {
  return <BlogTitleFallback />; // Immediate CSS
}
```

**Rationale**: Respects user preferences proactively, consistent with existing patterns

---

## Summary

### Approved Approach
- **Tech Stack**: Three.js + Troika-Three-Text + React Three Fiber
- **Font**: Troika default (no conversion needed)
- **Placement**: Index.tsx hero section
- **Fallback**: CSS-only for `prefers-reduced-motion`
- **Performance**: Lazy loading, mobile-optimized shaders

### Updated Constraints
- Bundle impact accepted (~50KB for Three.js stack)
- Homepage integration requires hero section restructuring
- CSS fallback must match existing HeroScene animation patterns
- Mobile performance critical (30fps+ target or fallback)

### Implementation Order
1. Phase 01: Dependencies verification (Troika default font)
2. Phase 02: Base component (Canvas + scene)
3. Phase 03: Custom shaders (wave + gradient + pulse)
4. Phase 04: Performance (lazy loading + CSS fallback)
5. Phase 05: Integration (Index.tsx hero replacement)

### Success Criteria
- [ ] 3D "Dynamite" renders in Index.tsx hero
- [ ] Wave distortion + gradient + pulse effects active
- [ ] 60fps desktop / 30fps+ mobile (or CSS fallback)
- [ ] CSS fallback shows immediately for reduced motion
- [ ] Lazy loads without blocking initial render
- [ ] No memory leaks (proper disposal)
- [ ] Bundle increase < 50KB gzipped

---

## Next Steps

Plan is **validated and approved** for implementation.

Begin with [Phase 01: Dependencies & Font Setup](../260113-1438-3d-blog-title-implementation/phase-01-dependencies-setup.md).

**Estimate**: 6 hours total effort across 5 phases.

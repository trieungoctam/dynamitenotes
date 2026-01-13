---
title: "3D Animated Blog Title with Three.js & Custom Shaders"
description: "Implement 'Dynamite' 3D text component with Troika-Three-Text, custom GLSL shaders (wave distortion, gradient, glow), performance optimization, and accessibility fallback"
status: validated
priority: P2
effort: 6h
branch: main
tags: [three.js, webgl, shaders, performance, accessibility, animation]
created: 2026-01-13
---

## Overview

Implement high-performance 3D animated title component displaying "Dynamite" using Three.js with Troika-Three-Text for SDF text rendering and custom GLSL shaders for visual effects.

### Technical Approach
- **Rendering**: Troika-Three-Text (SDF-based, ~50KB bundle)
- **Effects**: Custom GLSL shaders (vertex wave distortion, fragment gradient + pulse)
- **Performance**: Lazy loading, device detection, reduced motion support, 60fps desktop / 30fps+ mobile target
- **Colors**: Brand gradient #f97316 (orange) → #a855f7 (purple)
- **Fallback**: CSS-only component for low-end devices/reduced motion

### Dependencies (Already Installed)
- `three@0.182.0` ✓
- `troika-three-text@0.52.4` ✓
- `@react-three/fiber@8.0.0` ✓
- `@react-three/drei@10.7.7` ✓

### Implementation Phases

| Phase | Status | File | Effort |
|-------|--------|------|--------|
| 01. Dependencies & Font Setup | Pending | [phase-01-dependencies-setup.md](./phase-01-dependencies-setup.md) | 30m |
| 02. Base Component Structure | Pending | [phase-02-base-component.md](./phase-02-base-component.md) | 1.5h |
| 03. Custom Shader Effects | Pending | [phase-03-shader-effects.md](./phase-03-shader-effects.md) | 2h |
| 04. Performance & Accessibility | Pending | [phase-04-performance-optimization.md](./phase-04-performance-optimization.md) | 1h |
| 05. Integration & Testing | Pending | [phase-05-integration-testing.md](./phase-05-integration-testing.md) | 1h |

### Key Constraints
- **Bundle size**: Keep Troika-related chunk under 50KB
- **Mobile performance**: Critical constraint, may need CSS fallback
- **Font licensing**: SDF generation from existing woff2 fonts requires verification
- **Accessibility**: Must respect `prefers-reduced-motion`
- **Existing patterns**: Follow CSS-first approach (Card3D, HeroScene use CSS animations)

### Success Criteria
- [ ] 3D "Dynamite" text renders with wave distortion effect
- [ ] Orange-purple gradient with pulse animation
- [ ] 60fps on desktop, 30fps+ on mobile (or graceful degradation)
- [ ] Respects `prefers-reduced-motion` with CSS fallback
- [ ] Lazy-loaded with proper code splitting
- [ ] Zero memory leaks (proper disposal)
- [ ] Bundle size impact < 50KB gzipped

### Risk Assessment
- **High**: Mobile performance may not meet 30fps target → CSS fallback required
- **Medium**: Font licensing for SDF generation → Use web-safe fonts or licensed fonts
- **Low**: Troika bundle size impact → Already acceptable at ~50KB

### Validation Results (2026-01-13 15:02)

**Confirmed Decisions**:
1. ✅ **Proceed with Three.js** - Breaking from CSS-only pattern (Card3D, HeroScene, FloatingShapes), accepting ~50KB bundle impact
2. ✅ **Font: Troika Default** - No licensing issues, works immediately
3. ✅ **Integration: Replace Index.tsx heading** - Maximum visibility, replaces existing "Dynamite" hero text
4. ✅ **CSS Fallback: Always** - Show immediately for `prefers-reduced-motion`, following existing HeroScene pattern

**Updated Implementation Notes**:
- Index.tsx hero section will use BlogTitleWrapper component
- CSS fallback matches existing HeroScene.tsx animation patterns
- No custom font conversion needed (Troika default sans-serif)

### Next Steps
Ready to begin implementation with [Phase 01: Dependencies & Font Setup](./phase-01-dependencies-setup.md)

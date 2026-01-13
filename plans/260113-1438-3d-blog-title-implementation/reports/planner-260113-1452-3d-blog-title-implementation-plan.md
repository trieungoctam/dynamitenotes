---
title: "Planner Report: 3D Blog Title Implementation Plan"
description: "Comprehensive implementation plan for Three.js animated blog title with custom shaders"
date: 2026-01-13
plan: plans/260113-1438-3d-blog-title-implementation
agent: planner (ae0f2a4)
---

# Executive Summary

Created comprehensive 6-hour implementation plan for 3D animated "Dynamite" blog title component using Three.js, Troika-Three-Text, and custom GLSL shaders.

**Status**: Ready for implementation
**Total Effort**: 6 hours across 5 phases
**Bundle Impact**: ~50KB gzipped (acceptable)
**Performance Target**: 60fps desktop, 30fps+ mobile

---

# Plan Structure

## Main Plan Document
**File**: `/Users/dynamite/workspaces/com.dynamite/dynamitenotes/plans/260113-1438-3d-blog-title-implementation/plan.md`

### Overview
- YAML frontmatter with metadata (status: pending, priority: P2, effort: 6h)
- Technical approach summary
- 5 implementation phases with status tracking
- Key constraints, success criteria, risk assessment

## Phase Files

### Phase 01: Dependencies & Font Setup (30m)
**File**: `phase-01-dependencies-setup.md`
- Verify Three.js dependencies (already installed: three@0.182.0, troika-three-text@0.52.4)
- Font selection strategy (Troika default vs custom SDF)
- TypeScript configuration
- Basic test component creation

**Key Decision**: Start with Troika default font to avoid licensing issues

### Phase 02: Base Component Structure (1.5h)
**File**: `phase-02-base-component.md`
- Create `BlogTitle3D/` component directory
- React Three Fiber Canvas setup
- Camera positioning and lighting
- Troika Text integration
- Proper cleanup/disposal patterns
- useReducedMotion hook implementation

**Files to Create**:
- `src/components/three/BlogTitle3D/BlogTitle3D.tsx`
- `src/components/three/BlogTitle3D/BlogTitleText.tsx`
- `src/hooks/use-reduced-motion.ts`

### Phase 03: Custom Shader Effects (2h)
**File**: `phase-03-shader-effects.md`
- Vertex shader: Gentle wave distortion (sin/cos based on position + time)
- Fragment shader: Orange-purple gradient + pulse animation
- Uniform management hook (useShaderUniforms)
- React Three Fiber useFrame for uniform updates

**Shader Code Provided**:
```glsl
// Vertex: Wave distortion on Y-axis
float wave = sin(position.x * 2.0 + uTime * 0.5) * uIntensity * 0.1;

// Fragment: Gradient + pulse
float mixFactor = smoothstep(-1.0, 1.0, vPosition.x);
vec3 baseColor = mix(uColor1, uColor2, mixFactor);
float pulse = 0.9 + 0.1 * sin(uTime * 0.8);
```

**Brand Colors**:
- Color 1: #f97316 (orange)
- Color 2: #a855f7 (purple)

### Phase 04: Performance & Accessibility (1h)
**File**: `phase-04-performance-optimization.md`
- Lazy loading with React.lazy + Suspense
- CSS fallback component (BlogTitleFallback.tsx)
- Device-based quality adjustment (isMobile hook)
- prefers-reduced-motion support
- Hardware concurrency detection for low-end devices
- Bundle size monitoring

**CSS Fallback Features**:
- Linear gradient text (orange → purple)
- Pulse animation (3s ease-in-out infinite)
- Glow effect (radial gradient)
- Respects prefers-reduced-motion

**Performance Optimizations**:
- DPR limit on mobile (1 vs [1,2])
- Reduced shader intensity on mobile (0.3 vs 1.0)
- Manual chunk splitting in Vite config
- Proper disposal in useEffect cleanup

### Phase 05: Integration & Testing (1h)
**File**: `phase-05-integration-testing.md`
- Integration into Index.tsx hero section
- Cross-browser testing matrix (Chrome, Safari, Firefox, Edge, mobile)
- Performance validation (fps, memory, bundle size)
- Accessibility audit (keyboard, screen readers)
- Documentation (README.md)

**Test Coverage**:
- First load with CSS fallback → Three.js transition
- Reduced motion preference
- Mobile performance
- Window resize handling
- Low-end device detection
- Slow network conditions
- Error boundary fallback

---

# Key Technical Decisions

## 1. Font Strategy
**Decision**: Use Troika default font initially
**Rationale**:
- Avoids licensing issues with existing woff2 fonts
- Faster implementation
- Can evaluate custom SDF generation later if needed

## 2. Shader Approach
**Decision**: Custom GLSL shaders via shaderMaterial
**Rationale**:
- More control over visual effects
- Better performance than CPU-based animation
- Follows React Three Fiber patterns

**Fallback**: Use built-in Troika materials if shaders prove too complex

## 3. Performance Strategy
**Decision**: Progressive enhancement with CSS fallback
**Rationale**:
- Existing codebase uses CSS for 3D effects (Card3D, HeroScene)
- Ensures accessibility (prefers-reduced-motion)
- Graceful degradation for low-end devices
- Lazy loading minimizes initial bundle impact

## 4. Mobile Optimization
**Decision**: Reduce quality on mobile, not disable entirely
**Rationale**:
- Target 30fps+ on capable devices
- Use hardware concurrency as heuristic
- CSS fallback for very low-end devices

---

# Architecture Overview

```
src/components/three/BlogTitle3D/
├── BlogTitle3D.tsx          # Canvas + scene setup (lazy loaded)
├── BlogTitleText.tsx        # Text mesh + custom shader
├── BlogTitleFallback.tsx    # CSS-only fallback
├── BlogTitleWrapper.tsx     # Lazy loading + conditional render
├── shaders.ts               # GLSL shader constants
├── use-shader-uniforms.ts   # Uniform management hook
├── blog-title-fallback.css  # Fallback styles
└── index.ts                 # Public exports

src/hooks/
└── use-reduced-motion.ts    # Accessibility detection
```

---

# Success Criteria

## Functional
- [ ] 3D "Dynamite" text renders with wave distortion
- [ ] Orange-to-purple gradient with pulse animation
- [ ] Lazy loading works (separate chunk)
- [ ] CSS fallback for reduced motion
- [ ] Mobile quality reduction

## Performance
- [ ] 60fps on desktop
- [ ] 30fps+ on mobile (or CSS fallback)
- [ ] Bundle size < 50KB gzipped
- [ ] Initial load < 100ms (CSS fallback)
- [ ] Three.js load < 500ms desktop, < 1s mobile

## Quality
- [ ] Zero memory leaks (proper disposal)
- [ ] No console errors/warnings
- [ ] Cross-browser compatibility
- [ ] Keyboard accessible
- [ ] Screen reader friendly

---

# Risk Assessment

| Risk | Level | Mitigation |
|------|-------|------------|
| Mobile performance < 30fps | Medium | CSS fallback always available |
| Font licensing issues | Low | Use Troika default initially |
| Shader complexity too high | Medium | Have built-in material fallback |
| Bundle size exceeds budget | Low | Manual chunk splitting, lazy loading |
| Safari WebGL compatibility | Medium | Extensive cross-browser testing |
| Memory leaks | Low | Strict disposal protocol, Profiler testing |

---

# Dependencies Status

**Already Installed** ✓:
- `three@0.182.0`
- `troika-three-text@0.52.4`
- `@react-three/fiber@8.0.0`
- `@react-three/drei@10.7.7`

**No additional installations required**

---

# Next Steps

1. **Start Phase 01**: Verify dependencies and create basic test component
2. **Build incrementally**: Complete each phase before moving to next
3. **Test continuously**: Validate performance after each phase
4. **Document decisions**: Update plan files as implementation progresses

**Command to start implementation**:
```bash
# Navigate to project
cd /Users/dynamite/workspaces/com.dynamite/dynamitenotes

# Create component directory
mkdir -p src/components/three/BlogTitle3D

# Begin Phase 01
# (See phase-01-dependencies-setup.md for detailed steps)
```

---

# File Locations

All plan files created in:
```
/Users/dynamite/workspaces/com.dynamite/dynamitenotes/plans/260113-1438-3d-blog-title-implementation/
├── plan.md                              # Main overview
├── phase-01-dependencies-setup.md       # Dependencies & font setup
├── phase-02-base-component.md           # Component structure
├── phase-03-shader-effects.md           # GLSL shaders
├── phase-04-performance-optimization.md # Lazy loading & accessibility
└── phase-05-integration-testing.md      # Testing & documentation
```

---

# Unresolved Questions

1. **Font**: Should we pursue custom SDF font generation after testing default?
2. **Integration**: Which page(s) should feature the 3D title? (Index.tsx recommended)
3. **User Control**: Add user preference toggle to force Three.js version?
4. **Canvas Height**: Fixed 400px vs configurable prop?
5. **Battery**: Use `frameloop="demand"` for better battery life?
6. **Fallback Threshold**: Is hardwareConcurrency < 4 the right cutoff?

These questions can be addressed during implementation based on testing results.

---

# Conclusion

Plan is comprehensive, actionable, and follows existing codebase patterns. All dependencies are installed, and the implementation can proceed immediately. The plan balances visual impact with performance constraints, ensuring accessibility while delivering an engaging 3D experience.

**Ready to implement** ✅

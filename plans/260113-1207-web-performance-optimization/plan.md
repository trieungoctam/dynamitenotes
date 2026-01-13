# Web Performance Optimization Plan

**Created:** 2026-01-13
**Status:** Ready for Implementation
**Estimated Impact:** -57% bundle size, -60% LCP improvement

## Executive Summary

The portfolio/blog has significant performance bottlenecks:
- **Total JS bundle:** ~1.2 MB gzipped (target: 400 KB)
- **Three.js alone:** 217 KB gzipped (for decorative effects only)
- **Render-blocking fonts** from external CDN
- **No lazy loading** for public pages
- **Unused dependencies** bloating bundle

## Current Performance Issues

| Issue | Impact | Priority |
|-------|--------|----------|
| Three.js bundle (804 KB) | Critical | HIGH |
| No page lazy loading | Critical | HIGH |
| External font blocking | High | HIGH |
| Unused dependencies | Medium | MEDIUM |
| Inline CSS animations | Low | LOW |

## Implementation Phases

### Phase 1: Critical Bundle Reduction

#### 1.1 Replace Three.js with CSS Animations
**Files:** `src/components/three/HeroScene.tsx`, `src/pages/Index.tsx`

Three.js adds 217 KB gzipped for purely decorative particle effects. Replace with performant CSS animations.

```tsx
// New CSS-only HeroScene
export function HeroScene() {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden">
      <div className="hero-gradient" />
      <div className="hero-particles" />
      <div className="hero-overlay" />
    </div>
  );
}
```

**CSS animations to add:**
- Animated gradient background
- CSS particle dots using pseudo-elements
- Subtle floating animation

#### 1.2 Lazy Load All Public Pages
**File:** `src/App.tsx`

```tsx
// Change from static imports to lazy
const Index = lazy(() => import("./pages/Index"));
const Posts = lazy(() => import("./pages/Posts"));
const PostDetail = lazy(() => import("./pages/PostDetail"));
const Insights = lazy(() => import("./pages/Insights"));
const Photos = lazy(() => import("./pages/Photos"));
const Resume = lazy(() => import("./pages/Resume"));
const About = lazy(() => import("./pages/About"));
const Search = lazy(() => import("./pages/Search"));
```

#### 1.3 Configure Vite Manual Chunks
**File:** `vite.config.ts`

```typescript
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        'react-vendor': ['react', 'react-dom', 'react-router-dom'],
        'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-tooltip'],
        'query-vendor': ['@tanstack/react-query'],
      }
    }
  }
}
```

### Phase 2: Font Optimization

#### 2.1 Self-Host Critical Fonts
**Files:** `src/index.css`, `index.html`

1. Download fonts to `/public/fonts/`:
   - clash-display-700.woff2
   - satoshi-400.woff2
   - satoshi-500.woff2
   - geist-mono-400.woff2

2. Replace external import with local @font-face:
```css
@font-face {
  font-family: 'Clash Display';
  src: url('/fonts/clash-display-700.woff2') format('woff2');
  font-weight: 700;
  font-display: swap;
}
```

3. Add preload hints to index.html:
```html
<link rel="preload" as="font" type="font/woff2" href="/fonts/clash-display-700.woff2" crossorigin>
```

### Phase 3: Dependency Cleanup

#### 3.1 Remove Unused Packages
```bash
bun remove three @react-three/fiber @react-three/drei
bun remove i18next i18next-browser-languagedetector react-i18next
bun remove @uiw/react-md-editor
```

#### 3.2 Audit Radix UI Usage
Check which Radix packages are actually imported and remove unused ones.

### Phase 4: Additional Optimizations

#### 4.1 Move Inline Animations to CSS
**File:** `src/components/three/FloatingShapes.tsx`

Move inline `<style>` keyframes to `src/index.css` and use Tailwind animation utilities.

#### 4.2 Add Route Prefetching
**File:** `src/lib/prefetch.ts`

```typescript
export function prefetchRoute(path: string) {
  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = path;
  document.head.appendChild(link);
}
```

## Expected Results

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Main Bundle (gzip) | 408 KB | 150 KB | -63% |
| Three.js Chunk | 217 KB | 0 KB | -100% |
| Total JS (gzip) | 1.2 MB | 400 KB | -67% |
| LCP | ~3-4s | ~1.5s | -60% |

## Implementation Order

1. **Phase 1.1** - Replace Three.js with CSS (biggest impact)
2. **Phase 1.2** - Lazy load pages
3. **Phase 1.3** - Configure Vite chunks
4. **Phase 2** - Font optimization
5. **Phase 3** - Dependency cleanup
6. **Phase 4** - Additional optimizations

## Files to Modify

- `src/components/three/HeroScene.tsx` - Replace with CSS
- `src/components/three/FloatingShapes.tsx` - Move animations
- `src/pages/Index.tsx` - Update imports
- `src/App.tsx` - Add lazy loading
- `src/index.css` - Add animations, fonts
- `vite.config.ts` - Configure chunks
- `index.html` - Add preload hints
- `package.json` - Remove unused deps

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Visual regression from CSS replacement | Test on multiple browsers, keep similar aesthetic |
| Font flash (FOUT) | Use font-display: swap, preload critical fonts |
| Lazy loading delays | Add skeleton loaders, prefetch on hover |

## Success Criteria

- [ ] Lighthouse Performance score > 90
- [ ] LCP < 2.5s
- [ ] Total bundle < 500 KB gzipped
- [ ] No visual regressions
- [ ] All pages load correctly

## Unresolved Questions

1. Keep Card3D tilt effect? (Uses CSS transforms, minimal overhead)
2. Keep FloatingShapes? (CSS-based, low overhead)
3. Target deployment platform for image optimization?

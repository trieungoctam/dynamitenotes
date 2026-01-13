---
title: "Phase 05: Integration & Testing"
description: "Integrate BlogTitle3D into pages, cross-browser testing, performance validation, and documentation"
status: pending
priority: P2
effort: 1h
created: 2026-01-13
---

## Context
- **Parent Plan**: [plan.md](./plan.md)
- **Prerequisite**: [Phase 04: Performance & Accessibility](./phase-04-performance-optimization.md) must complete
- **Target Pages**: Homepage (Index.tsx), Blog page (Posts.tsx), or dedicated landing page

## Overview
Integrate the BlogTitle3D component into the application, perform cross-browser testing, validate performance metrics, and create documentation for maintenance.

## Key Insights
- Blog title could replace existing "Dynamite" heading on Index.tsx
- Or create dedicated 3D showcase page
- Need to test on Chrome, Firefox, Safari (mobile + desktop)
- Performance validation critical (60fps desktop, 30fps+ mobile)

## Requirements
- Integration into target page(s)
- Cross-browser compatibility testing
- Performance benchmarking
- Documentation for future maintenance
- Accessibility validation

## Architecture
```
src/pages/
├── Index.tsx              # Add 3D title here (or)
├── BlogShowcase.tsx        # Create dedicated showcase page

docs/
└── 3d-blog-title-guide.md   # Maintenance documentation
```

## Related Code Files
- `src/pages/Index.tsx` (existing homepage with "Dynamite" heading)
- `src/pages/Posts.tsx` (blog listing page)
- `src/components/layout/TopNav.tsx` (navigation)

## Implementation Steps

### 1. Integration Options

**Option A: Replace Index.tsx Heading**
- Replace existing "Dynamite" heading with BlogTitleWrapper
- Pros: Immediate visibility, brand impact
- Cons: Affects homepage load time

**Option B: Create Dedicated Showcase Page**
- New route `/3d-showcase` or `/about`
- Pros: Isolates performance impact, optional viewing
- Cons: Less visibility, requires navigation

**Option C: Add to Blog Page Header**
- Add to Posts.tsx page header
- Pros: Contextually relevant (blog title)
- Cons: May clutter blog listing

**Recommendation**: Start with Option B (dedicated page), evaluate Option A if performance acceptable

### 2. Implement Integration

```typescript
// src/pages/BlogShowcase.tsx (Option B)
import { BlogTitleWrapper } from '@/components/three/BlogTitle3D';
import { TopNav } from '@/components/layout/TopNav';
import { resetMetaTags } from '@/lib/seo';

export default function BlogShowcase() {
  useEffect(() => {
    resetMetaTags({
      title: '3D Blog Title - Dynamite Notes',
      description: 'Interactive 3D animated blog title powered by Three.js'
    });
  }, []);

  return (
    <main className="min-h-screen bg-background">
      <TopNav />
      
      <section className="min-h-screen flex items-center justify-center">
        <BlogTitleWrapper text="Dynamite" className="w-full max-w-4xl" />
      </section>

      <section className="py-20 px-6">
        <div className="container mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-bold mb-4">About This Title</h2>
          <p className="text-muted-foreground">
            This 3D title is rendered using Three.js with custom GLSL shaders.
            It features wave distortion animation, gradient coloring, and pulse effects.
          </p>
          <p className="text-sm text-muted-foreground mt-4">
            Prefer reduced motion? The title gracefully degrades to a CSS animation.
          </p>
        </div>
      </section>
    </main>
  );
}
```

### 3. Add Route to App.tsx

```typescript
// In App.tsx routes
<Route path="/showcase" element={<BlogShowcase />} />
```

### 4. Update Navigation (Optional)

Add to TopNav or CommandPalette:

```typescript
// In CommandPalette.tsx items
{
  label: '3D Showcase',
  icon: Sparkles,
  onSelect: () => navigate('/showcase')
}
```

### 5. Testing Checklist

**Functional Testing**
- [ ] Text renders "Dynamite" correctly
- [ ] Wave distortion animation plays smoothly
- [ ] Orange-purple gradient visible
- [ ] Pulse animation active
- [ ] Lazy loading triggers correctly
- [ ] CSS fallback shows for prefers-reduced-motion
- [ ] Mobile version loads with reduced intensity

**Cross-Browser Testing**
- [ ] Chrome 120+ (desktop)
- [ ] Firefox 120+ (desktop)
- [ ] Safari 17+ (desktop)
- [ ] Chrome mobile (Android)
- [ ] Safari mobile (iOS)
- [ ] Firefox mobile (Android)

**Performance Testing**
- [ ] Lighthouse Performance score > 90
- [ ] 60fps on desktop (Chrome DevTools Performance)
- [ ] 30fps+ on mobile
- [ ] Bundle size increase < 50KB
- [ ] No memory leaks (React DevTools Profiler)
- [ ] Lazy load chunk loads in < 2s on 3G

**Accessibility Testing**
- [ ] prefers-reduced-motion respected
- [ ] Screen reader announces text (CSS fallback)
- [ ] Keyboard navigation not affected
- [ ] Color contrast meets WCAG AA
- [ ] No seizure-inducing flashes

### 6. Performance Benchmarking

```typescript
// Add performance monitoring (development only)
import { useEffect } from 'react';

export function usePerformanceMonitor() {
  useEffect(() => {
    if (import.meta.env.DEV) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'measure') {
            console.log(`${entry.name}: ${entry.duration.toFixed(2)}ms`);
          }
        }
      });
      
      observer.observe({ entryTypes: ['measure'] });
      
      return () => observer.disconnect();
    }
  }, []);
}

// In component:
usePerformanceMonitor();
performance.mark('blog-title-start');
// ... component renders ...
performance.mark('blog-title-end');
performance.measure('blog-title-render', 'blog-title-start', 'blog-title-end');
```

### 7. Create Documentation

```markdown
<!-- docs/3d-blog-title-guide.md -->
# 3D Blog Title Component

## Overview
Interactive 3D blog title powered by Three.js and custom GLSL shaders.

## Technical Stack
- Three.js r182
- React Three Fiber v8
- Troika-Three-Text v0.52
- Custom GLSL shaders

## Usage
```tsx
import { BlogTitleWrapper } from '@/components/three/BlogTitle3D';

<BlogTitleWrapper text="Dynamite" />
```

## Features
- SDF-based text rendering (high quality, performant)
- Wave distortion animation (vertex shader)
- Orange-purple gradient (fragment shader)
- Pulse animation effect
- Lazy loading with code splitting
- CSS fallback for prefers-reduced-motion
- Mobile-optimized (reduced shader intensity)

## Performance
- Desktop: 60fps target
- Mobile: 30fps+ target
- Bundle: ~50KB additional
- Lazy loads on first render

## Maintenance
- Shader code in `src/components/three/BlogTitle3D/shaders.ts`
- Adjust colors via uniform props (uColor1, uColor2)
- Animation speed controlled by uTime uniform
- Mobile intensity controlled by isMobile prop
```

## Todo List
- [ ] Choose integration option (A, B, or C)
- [ ] Implement integration
- [ ] Add route to App.tsx
- [ ] Update navigation (optional)
- [ ] Test on Chrome desktop
- [ ] Test on Firefox desktop
- [ ] Test on Safari desktop
- [ ] Test on Chrome mobile
- [ ] Test on Safari mobile
- [ ] Run Lighthouse audit
- [ ] Measure fps with DevTools
- [ ] Validate bundle size
- [ ] Test prefers-reduced-motion
- [ ] Check for memory leaks
- [ ] Create documentation

## Success Criteria
- [ ] Component integrated into target page
- [ ] All browsers render correctly
- [ ] Performance targets met (60fps/30fps+)
- [ ] Lighthouse score > 90
- [ ] Accessibility validated
- [ ] Documentation complete
- [ ] No console errors
- [ ] Memory stable over time

## Risk Assessment
- **Low**: Browser compatibility (Three.js has wide support)
- **Medium**: Mobile performance may not meet 30fps target
- **Mitigation**: CSS fallback always available, can reduce complexity

## Security Considerations
- No user input directly rendered (text prop validated)
- Shaders use static code (no injection risk)
- Lazy loading from same origin (no XSS)

## Next Steps
After testing complete and documentation created, the feature is ready for production deployment.

## Open Questions
- Which integration option to choose?
- Should we add analytics to track 3D title engagement?
- Should we add configuration UI for customization?

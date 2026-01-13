---
title: "Phase 04: Performance & Accessibility"
description: "Implement lazy loading, device detection, prefers-reduced-motion support, and CSS fallback component"
status: pending
priority: P2
effort: 1h
created: 2026-01-13
---

## Context
- **Parent Plan**: [plan.md](./plan.md)
- **Prerequisite**: [Phase 03: Custom Shader Effects](./phase-03-shader-effects.md) must complete
- **Existing Patterns**: Card3D, HeroScene, FloatingShapes all respect prefers-reduced-motion

## Overview
Add performance optimizations (lazy loading, device-based quality adjustment) and accessibility features (prefers-reduced-motion support, CSS fallback) to ensure the 3D blog title works across all devices and user preferences.

## Key Insights
- `useReducedMotion()` hook already exists in codebase pattern
- `useIsMobile()` hook available for device detection
- All existing 3D components use CSS for performance (should we follow this?)
- Lazy loading with React.lazy for code splitting
- CSS fallback matches existing HeroScene.tsx patterns

## Requirements
- Lazy load BlogTitle3D component (React.lazy + Suspense)
- Detect `prefers-reduced-motion` and show CSS fallback
- Reduce shader intensity on mobile devices
- Create CSS fallback component matching brand style
- Proper loading states

## Architecture
```
src/components/three/BlogTitle3D/
├── BlogTitle3D.tsx          # Main component (lazy loaded)
├── BlogTitleFallback.tsx    # CSS-only fallback
├── index.ts                 # Lazy export
└── hooks/
    └── use-reduced-motion.ts # Accessibility detection

src/pages/
└── BlogPage.tsx             # Usage example with lazy loading
```

## Related Code Files
- `src/components/three/HeroScene.tsx` (CSS animation patterns)
- `src/components/three/Card3D.tsx` (useReducedMotion pattern)
- `src/hooks/use-mobile.tsx`

## Implementation Steps

### 1. Create useReducedMotion hook (if not exists)

```typescript
// src/hooks/use-reduced-motion.ts
import { useState, useEffect } from 'react';

export function useReducedMotion(): boolean {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return reducedMotion;
}
```

### 2. Create CSS fallback component

```typescript
// src/components/three/BlogTitle3D/BlogTitleFallback.tsx
import './blog-title-fallback.css';

interface BlogTitleFallbackProps {
  text?: string;
  className?: string;
}

export function BlogTitleFallback({
  text = 'Dynamite',
  className = ''
}: BlogTitleFallbackProps) {
  return (
    <div className={`blog-title-fallback ${className}`}>
      <div className="blog-title-text">{text}</div>
      <div className="blog-title-glow" />
    </div>
  );
}
```

### 3. Create CSS for fallback

```css
/* src/components/three/BlogTitle3D/blog-title-fallback.css */
.blog-title-fallback {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  overflow: hidden;
}

.blog-title-text {
  font-size: clamp(3rem, 8vw, 6rem);
  font-weight: 700;
  background: linear-gradient(135deg, #f97316 0%, #a855f7 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: title-pulse 3s ease-in-out infinite;
  z-index: 1;
}

.blog-title-glow {
  position: absolute;
  inset: 0;
  background: radial-gradient(
    ellipse at center,
    rgba(249, 115, 22, 0.1) 0%,
    transparent 70%
  );
  animation: glow-pulse 3s ease-in-out infinite;
}

@keyframes title-pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.9; transform: scale(1.02); }
}

@keyframes glow-pulse {
  0%, 100% { opacity: 0.5; transform: scale(1); }
  50% { opacity: 0.8; transform: scale(1.1); }
}

/* Respect prefers-reduced-motion */
@media (prefers-reduced-motion: reduce) {
  .blog-title-text,
  .blog-title-glow {
    animation: none;
  }
}
```

### 4. Create wrapper component with conditional rendering

```typescript
// src/components/three/BlogTitle3D/index.tsx
import { lazy, Suspense } from 'react';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { BlogTitleFallback } from './BlogTitleFallback';

const BlogTitle3D = lazy(() =>
  import('./BlogTitle3D').then(m => ({
    default: m.BlogTitle3D
  }))
);

interface BlogTitleWrapperProps {
  text?: string;
  className?: string;
}

export function BlogTitleWrapper({
  text = 'Dynamite',
  className = ''
}: BlogTitleWrapperProps) {
  const reducedMotion = useReducedMotion();

  // Show CSS fallback for reduced motion preference
  if (reducedMotion) {
    return <BlogTitleFallback text={text} className={className} />;
  }

  return (
    <Suspense fallback={<BlogTitleFallback text={text} className={className} />}>
      <BlogTitle3D text={text} className={className} />
    </Suspense>
  );
}

export { BlogTitleFallback };
```

### 5. Update BlogTitle3D with mobile optimizations

```typescript
// src/components/three/BlogTitle3D/BlogTitle3D.tsx
import { Canvas } from '@react-three/fiber';
import { PerspectiveCamera } from '@react-three/drei';
import { BlogTitleText } from './BlogTitleText';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { useIsMobile } from '@/hooks/use-mobile';

interface BlogTitle3DProps {
  text?: string;
  className?: string;
}

export function BlogTitle3D({
  text = 'Dynamite',
  className = ''
}: BlogTitle3DProps) {
  const reducedMotion = useReducedMotion();
  const isMobile = useIsMobile();

  if (reducedMotion) {
    return null; // Handled by wrapper
  }

  return (
    <div className={`w-full h-[400px] ${className}`}>
      <Canvas
        dpr={[1, isMobile ? 1 : 2]} // Limit DPR on mobile
        performance={{ min: isMobile ? 0.5 : 0.7 }}
        frameloop="always"
      >
        <PerspectiveCamera
          makeDefault
          position={[0, 0, 5]}
          fov={50}
        />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <BlogTitleText text={text} isMobile={isMobile} />
      </Canvas>
    </div>
  );
}
```

### 6. Update BlogTitleText with mobile-aware shader intensity

```typescript
// In BlogTitleText.tsx, adjust uniforms based on isMobile
const materialProps = useMemo(() => ({
  uTime: { value: 0 },
  uIntensity: { value: isMobile ? 0.3 : 1.0 }, // Reduce on mobile
  uColor1: { value: new THREE.Color('#f97316') },
  uColor2: { value: new THREE.Color('#a855f7') },
}), [isMobile]);
```

## Todo List
- [ ] Create use-reduced-motion.ts hook
- [ ] Create BlogTitleFallback.tsx component
- [ ] Create blog-title-fallback.css
- [ ] Create BlogTitleWrapper with lazy loading
- [ ] Update BlogTitle3D with mobile optimizations
- [ ] Update BlogTitleText with reduced mobile intensity
- [ ] Test lazy loading (check network tab for chunk)
- [ ] Test prefers-reduced-motion fallback
- [ ] Test on mobile device for performance
- [ ] Measure bundle size impact

## Success Criteria
- [ ] 3D component lazy loads (separate chunk)
- [ ] CSS fallback shows for prefers-reduced-motion
- [ ] Loading state shows during lazy load
- [ ] Mobile shader intensity reduced
- [ ] Performance: 60fps desktop, 30fps+ mobile
- [ ] Bundle size increase < 50KB gzipped
- [ ] No layout shift during lazy load

## Risk Assessment
- **Low**: Lazy loading implementation (standard React pattern)
- **Medium**: Mobile performance still may not meet target
- **Mitigation**: CSS fallback is always available, progressively enhance

## Security Considerations
- Validate text prop in both 3D and fallback components
- Ensure CSP allows inline styles (CSS modules preferred)
- No additional network requests beyond initial bundle

## Next Steps
After performance optimizations complete, proceed to [Phase 05: Integration & Testing](./phase-05-integration-testing.md)

## Unresolved Questions
- Should we lazy load on desktop too (currently only for reduced motion)?
- Canvas height fixed at 400px - should be configurable prop?
- Should we add Intersection Observer to lazy load only when in viewport?

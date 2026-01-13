---
title: "Phase 02: Base Component Structure"
description: "Create BlogTitle3D component with Three.js scene setup, camera, renderer, and Troika Text integration with proper cleanup"
status: pending
priority: P2
effort: 1.5h
created: 2026-01-13
---

## Context
- **Parent Plan**: [plan.md](./plan.md)
- **Prerequisite**: [Phase 01: Dependencies](./phase-01-dependencies-setup.md) must complete
- **Existing Code**: `src/components/three/Title3D.tsx` (stub component)

## Overview
Build foundation component with React Three Fiber Canvas, scene setup, lighting, camera configuration, and Troika Text integration following existing codebase patterns.

## Key Insights
- Existing `Title3D.tsx` has basic Canvas setup - extend this pattern
- `Card3D.tsx` shows `useReducedMotion` pattern - must follow
- `useIsMobile()` hook available for device detection
- All existing "3D" components use CSS for performance - Three.js is new territory

## Requirements
- React Three Fiber Canvas with proper camera positioning
- Troika Text mesh displaying "Dynamite"
- Proper cleanup (dispose geometries, materials, renderers)
- Responsive sizing
- TypeScript strict mode compliance

## Architecture
```
src/components/three/BlogTitle3D/
├── BlogTitle3D.tsx          # Main component (Canvas + scene)
├── BlogTitleText.tsx        # Text mesh wrapper
├── use-blog-title-setup.ts  # Scene setup hook
├── shaders.ts               # GLSL constants (for Phase 03)
└── index.ts                 # Exports
```

## Related Code Files
- `/Users/dynamite/workspaces/com.dynamite/dynamitenotes/src/components/three/Title3D.tsx` (reference)
- `/Users/dynamite/workspaces/com.dynamite/dynamitenotes/src/components/three/Card3D.tsx` (useReducedMotion pattern)
- `/Users/dynamite/workspaces/com.dynamite/dynamitenotes/src/hooks/use-mobile.tsx`

## Implementation Steps

### 1. Create Component Structure
```bash
mkdir -p src/components/three/BlogTitle3D
```

### 2. Implement BlogTitle3D.tsx
```typescript
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
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

  // Early return for reduced motion
  if (reducedMotion) {
    return null; // Fallback handled in Phase 04
  }

  return (
    <div className={`w-full h-[400px] ${className}`}>
      <Canvas
        dpr={[1, 2]} // Limit pixel ratio for performance
        performance={{ min: 0.5 }} // Regulate quality
      >
        <PerspectiveCamera
          makeDefault
          position={[0, 0, 5]}
          fov={50}
        />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <BlogTitleText text={text} isMobile={isMobile} />
        {/* Optional: OrbitControls for debugging */}
      </Canvas>
    </div>
  );
}
```

### 3. Implement BlogTitleText.tsx
```typescript
import { useRef, useEffect } from 'react';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

interface BlogTitleTextProps {
  text: string;
  isMobile: boolean;
}

export function BlogTitleText({ text, isMobile }: BlogTitleTextProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (meshRef.current) {
        // Material disposal handled by Troika
      }
    };
  }, []);

  return (
    <Text
      ref={meshRef}
      fontSize={isMobile ? 0.8 : 1.2}
      color="#f97316"
      anchorX="center"
      anchorY="middle"
      position={[0, 0, 0]}
      outlineWidth={isMobile ? 0.02 : 0.05}
      outlineColor="#a855f7"
    >
      {text}
    </Text>
  );
}
```

### 4. Create useReducedMotion Hook
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

### 5. Update Exports
```typescript
// src/components/three/BlogTitle3D/index.ts
export { BlogTitle3D } from './BlogTitle3D';
export type { BlogTitle3DProps } from './BlogTitle3D';
```

## Todo List
- [ ] Create `src/components/three/BlogTitle3D/` directory
- [ ] Implement `BlogTitle3D.tsx` with Canvas setup
- [ ] Implement `BlogTitleText.tsx` with Troika Text
- [ ] Create `use-reduced-motion.ts` hook
- [ ] Add proper disposal in cleanup useEffect
- [ ] Export component from index.ts
- [ ] Test basic rendering in dev environment

## Success Criteria
- [ ] "Dynamite" text renders in 3D scene
- [ ] Proper cleanup on unmount (no memory leaks)
- [ ] Responsive sizing (mobile vs desktop)
- [ ] TypeScript compilation passes
- [ ] No console errors/warnings

## Risk Assessment
- **Low**: Component structure complexity (follows existing patterns)
- **Medium**: Memory leaks if disposal incomplete
- **Mitigation**: Strict cleanup protocol, test with React DevTools Profiler

## Security Considerations
- Validate text prop to prevent XSS (even though Three.js escapes)
- Limit text length to prevent performance issues
- Sanitize any user-provided font URLs

## Next Steps
After base component renders successfully, proceed to [Phase 03: Custom Shader Effects](./phase-03-shader-effects.md) to add visual effects

## Unresolved Questions
- Should we expose font size as a prop?
- Do we need OrbitControls in production (debug only)?
- Canvas height fixed at 400px - should be configurable?

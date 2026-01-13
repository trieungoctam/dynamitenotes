---
title: "Phase 03: Custom Shader Effects"
description: "Implement GLSL vertex/fragment shaders for wave distortion, orange-purple gradient, and pulse animation on 3D text"
status: pending
priority: P2
effort: 2h
created: 2026-01-13
---

## Context
- **Parent Plan**: [plan.md](./plan.md)
- **Prerequisite**: [Phase 02: Base Component](./phase-02-base-component.md) must complete
- **Research**: GLSL shader patterns for ambient animation, gradient coloring, pulse effects

## Overview
Add custom GLSL shaders to the BlogTitle3D component for visual effects: vertex shader (gentle wave distortion), fragment shader (orange-purple gradient with pulse animation).

## Key Insights
- Brand colors: #f97316 (orange) → #a855f7 (purple)
- Passive ambient animation (no user interaction required)
- Must work on mobile GPUs (keep shader complexity low)
- Use shaderMaterial from @react-three/drei for React integration
- Update uniforms via useFrame hook for smooth animation

## Requirements
- Vertex shader: Gentle sine-wave distortion on Y-axis
- Fragment shader: Orange-to-purple gradient based on X position
- Pulse effect: Subtle brightness oscillation over time
- Performance: Minimal GPU overhead for mobile compatibility

## Architecture
```typescript
src/components/three/BlogTitle3D/
├── BlogTitleText.tsx       # Update with custom shader
├── shaders.ts               # GLSL shader code constants
│   ├── vertexShader.glsl   # Wave distortion logic
│   └── fragmentShader.glsl # Gradient + pulse logic
└── index.ts
```

## Related Code Files
- `src/components/three/BlogTitle3D/BlogTitleText.tsx` (from Phase 02)
- `@react-three/drei` shaderMaterial helper

## Implementation Steps

### 1. Create shaders.ts with GLSL code

```typescript
// src/components/three/BlogTitle3D/shaders.ts

export const vertexShader = `
uniform float uTime;
uniform float uIntensity;

varying vec2 vUv;
varying vec3 vPosition;
varying float vWave;

void main() {
  vUv = uv;
  vPosition = position;

  // Gentle wave distortion on Y-axis based on X position
  float wave = sin(position.x * 2.0 + uTime * 0.5) * uIntensity * 0.1;
  vWave = wave;

  vec3 newPos = position;
  newPos.y += wave;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(newPos, 1.0);
}
`;

export const fragmentShader = `
uniform float uTime;
uniform vec3 uColor1;  // Orange #f97316
uniform vec3 uColor2;  // Purple #a855f7

varying vec2 vUv;
varying vec3 vPosition;
varying float vWave;

void main() {
  // Create gradient based on X position (-1 to 1 range)
  float mixFactor = smoothstep(-1.0, 1.0, vPosition.x);

  // Blend between orange and purple
  vec3 baseColor = mix(uColor1, uColor2, mixFactor);

  // Add subtle pulse effect
  float pulse = 0.9 + 0.1 * sin(uTime * 0.8);

  // Add wave-based highlight
  float highlight = smoothstep(-0.5, 0.5, vWave) * 0.2;

  vec3 finalColor = baseColor * pulse + vec3(highlight);

  gl_FragColor = vec4(finalColor, 1.0);
}
`;
```

### 2. Update BlogTitleText.tsx with custom shader

```typescript
import { useRef, useMemo } from 'react';
import { Text } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { vertexShader, fragmentShader } from './shaders';

interface BlogTitleTextProps {
  text: string;
  isMobile: boolean;
}

export function BlogTitleText({ text, isMobile }: BlogTitleTextProps) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  useFrame(({ clock }) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = clock.getElapsedTime();
    }
  });

  const materialProps = useMemo(() => ({
    uTime: { value: 0 },
    uIntensity: { value: isMobile ? 0.5 : 1.0 },
    uColor1: { value: new THREE.Color('#f97316') },
    uColor2: { value: new THREE.Color('#a855f7') },
  }), [isMobile]);

  return (
    <Text
      fontSize={isMobile ? 0.8 : 1.2}
      anchorX="center"
      anchorY="middle"
      position={[0, 0, 0]}
    >
      {text}
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={materialProps}
        attach="material"
      />
    </Text>
  );
}
```

## Todo List
- [ ] Create shaders.ts with vertex/fragment GLSL code
- [ ] Update BlogTitleText.tsx to use custom shader
- [ ] Add useFrame hook for uniform updates
- [ ] Test wave distortion effect
- [ ] Test gradient coloring
- [ ] Test pulse animation
- [ ] Adjust shader parameters for optimal appearance
- [ ] Test on mobile device for performance

## Success Criteria
- [ ] Wave distortion visible on text vertices
- [ ] Orange-to-purple gradient renders correctly
- [ ] Pulse animation smooth (60fps desktop, 30fps+ mobile)
- [ ] No shader compilation errors
- [ ] Uniforms update correctly via useFrame
- [ ] Mobile performance acceptable

## Risk Assessment
- **Medium**: Shaders may not work with Troika Text (material compatibility)
- **Low**: GPU performance issues on low-end devices
- **Mitigation**: Have fallback to basic Text component, reduce intensity on mobile

## Next Steps
After shader effects implemented, proceed to [Phase 04: Performance & Accessibility](./phase-04-performance-optimization.md)

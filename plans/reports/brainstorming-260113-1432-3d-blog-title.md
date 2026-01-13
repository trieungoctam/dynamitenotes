# 3D Animated Blog Title - Brainstorming Report

**Date**: 2026-01-13
**Type**: Brainstorming
**Status**: Complete

---

## Problem Statement

Create a 3D animated blog title for "Dynamite" using Three.js with:
- 3D text geometry
- Shader effects
- Passive ambient animation
- Performance-first optimization
- Visual impact for branding

---

## Evaluated Approaches

### 1. Troika-Three-Text (SDF) with Custom Shaders
**Description**: Use `troika-three-text` library for SDF-based text rendering + custom GLSL shaders for effects.

**Pros**:
- Best performance (SDF rendering)
- Crisp text at any scale
- Web Worker font generation (non-blocking)
- Built-in GPU instancing
- Supports advanced shader effects (outlines, glows, distortion)

**Cons**:
- External dependency (~50KB)
- More complex shader setup
- Learning curve for SDF concepts

**Performance**: ⭐⭐⭐⭐⭐ (Excellent)

---

### 2. Three.js TextGeometry + ShaderMaterial
**Description**: Native Three.js TextGeometry with custom ShaderMaterial for effects.

**Pros**:
- No external dependencies (already using Three.js)
- Direct control over vertices
- Full shader customization
- True 3D depth/lighting

**Cons**:
- High polygon count (performance concern)
- Font file conversion needed (TTF → JSON)
- Each letter = separate draw call
- Memory intensive

**Performance**: ⭐⭐ (Poor for mobile)

---

### 3. Hybrid: Canvas Texture + Shader Effects
**Description**: Render text to canvas, use as texture on plane/geometry, apply shader effects.

**Pros**:
- Lightweight (2D canvas)
- Easy text rendering
- Shader effects still possible
- Fast load times
- Works with existing fonts

**Cons**:
- Not true 3D geometry
- Limited depth effects
- Lower visual impact

**Performance**: ⭐⭐⭐⭐ (Very Good)

---

### 4. CSS-Only 3D Transforms (Current Implementation)
**Description**: Current `HeroScene.tsx` uses CSS animations, no Three.js.

**Pros**:
- Zero JS overhead
- Native GPU acceleration
- Respects `prefers-reduced-motion`
- Excellent performance

**Cons**:
- Not actual 3D
- Limited shader effects
- Less unique branding

**Performance**: ⭐⭐⭐⭐⭐ (Perfect)

---

## Recommended Solution: **Troika-Three-Text with Optimized Shaders**

### Why This Approach?

**Performance Requirements Met**:
- SDF rendering = minimal GPU load
- Web Worker font gen = non-blocking main thread
- Instanced rendering = 1 draw call
- Lazy loading support
- Fallback to CSS if WebGL unavailable

**Visual Impact Achieved**:
- True 3D text with depth
- Custom shader effects (glow, distortion, particles)
- Smooth ambient animation
- High-quality anti-aliasing

**Complexity Justified**:
- 5-8 hours implementation acceptable
- Reusable component for other 3D text needs
- Professional-grade result

---

## Implementation Architecture

### Component Structure
```
src/components/three/
├── BlogTitle3D.tsx          # Main component, lazy-loaded
├── shaders/
│   ├── title-vertex.glsl    # Vertex shader for distortion
│   └── title-fragment.glsl  # Fragment shader for glow/effect
└── fonts/
    └── geist-mono-sdf.json  # Pre-generated SDF font atlas
```

### Key Features

**1. Performance Optimizations**:
- Lazy load component (React.lazy + Suspense)
- Detect device capability (reduce quality on mobile)
- `prefers-reduced-motion` check
- Dispose geometries/materials on unmount
- Share font instance across app

**2. Shader Effects** (GLSL):
- Ambient floating motion (sine wave vertices)
- Subtle glow/pulse effect
- Gradient coloring based on position
- Noise-based distortion

**3. Fallback Strategy**:
- Check WebGL support
- Show CSS version if Three.js fails
- Progressive enhancement

---

## Shader Specification

### Vertex Shader
```glsl
// Ambient float animation
uniform float uTime;
varying vec2 vUv;
varying vec3 vPosition;

void main() {
  vUv = uv;
  vPosition = position;

  vec3 pos = position;
  // Gentle wave motion
  pos.z += sin(pos.x * 2.0 + uTime * 0.5) * 0.1;
  pos.y += cos(pos.x * 1.5 + uTime * 0.3) * 0.05;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
```

### Fragment Shader
```glsl
// Gradient + subtle glow
uniform float uTime;
varying vec2 vUv;
varying vec3 vPosition;

void main() {
  // Orange to purple gradient
  vec3 color1 = vec3(0.976, 0.451, 0.086); // Orange
  vec3 color2 = vec3(0.659, 0.333, 0.969); // Purple

  float mixFactor = smoothstep(-1.0, 1.0, vPosition.x);
  vec3 finalColor = mix(color1, color2, mixFactor);

  // Subtle pulse
  float pulse = 0.9 + 0.1 * sin(uTime * 0.8);

  gl_FragColor = vec4(finalColor * pulse, 1.0);
}
```

---

## Dependencies

```bash
bun add troika-three-text three
```

**Bundle Impact**:
- `troika-three-text`: ~50KB gzipped
- `three`: Already in dependencies
- Total: ~50KB additional

---

## Performance Budget

| Metric | Target | Notes |
|--------|--------|-------|
| Load time | <500ms | Lazy load, pre-generate font |
| FPS | 60fps | SDF optimization |
| Draw calls | 1-2 | Instanced rendering |
| Memory | <10MB | Dispose on unmount |
| Battery | Minimal | Passive animation only |

---

## Risk Mitigation

**Technical Risks**:
1. **Font generation failure** → Pre-generate SDF atlas, bundle with app
2. **Mobile performance** → Reduce shader complexity, lower particle count
3. **WebGL support** → CSS fallback
4. **Bundle size** → Lazy load, code splitting

**Development Risks**:
1. **Shader debugging difficulty** → Use ShaderMaterial helper, test incrementally
2. **Font file size** → Use subset (only needed characters)
3. **Cross-browser issues** → Test on Chrome, Firefox, Safari

---

## Success Criteria

1. ✅ "Dynamite" title renders in 3D with ambient motion
2. ✅ Shader effects (gradient, pulse, wave distortion)
3. ✅ 60fps on desktop, 30fps+ on mobile
4. ✅ Lazy loads, doesn't block initial render
5. ✅ Respects `prefers-reduced-motion`
6. ✅ Graceful fallback to CSS
7. ✅ Accessible (screen reader support)

---

## Implementation Steps

### Phase 1: Setup (1-2 hours)
1. Install dependencies (`troika-three-text`)
2. Generate SDF font atlas from Geist Mono
3. Create base component with React.lazy
4. Set up Three.js scene/camera/renderer

### Phase 2: Text Rendering (1-2 hours)
1. Implement `TroikaText` component
2. Configure SDF material
3. Position camera for optimal view
4. Add responsive resize handler

### Phase 3: Shader Effects (2-3 hours)
1. Write vertex shader (wave animation)
2. Write fragment shader (gradient, glow)
3. Tune animation timing/Intensity
4. Test on multiple devices

### Phase 4: Optimization (1 hour)
1. Add device capability detection
2. Implement lazy loading
3. Add `prefers-reduced-motion` check
4. Create CSS fallback
5. Test performance (Lighthouse)

---

## Alternatives Considered & Rejected

### TextGeometry (Native Three.js)
**Rejected**: Too heavy for performance-first requirement. High polygon count, multiple draw calls.

### Canvas Texture Approach
**Rejected**: Doesn't meet "3D text geometry" requirement. Not impressive enough for branding.

### Pure CSS Enhancement
**Rejected**: Already exists as `HeroScene.tsx`. User specifically wants Three.js solution.

---

## Open Questions

1. **Font licensing**: Can we bundle Geist Mono SDF atlas commercially?
2. **Placement**: Should this replace `HeroScene` or be a new page component?
3. **Responsive behavior**: Scale down on mobile vs. hide entirely?

---

## Next Steps

Ready to proceed with implementation planning via `/plan:fast` or `/plan:hard`?

The recommended approach balances:
- **Performance**: SDF rendering, lazy loading, optimization
- **Visual Impact**: True 3D, custom shaders, ambient animation
- **Complexity**: 5-8 hours justified by result quality
- **Maintainability**: Reusable component, documented shaders

**Sources**:
- [Troika-Three-Text GitHub](https://github.com/protectwise/troika/tree/main/packages/troika-three-text)
- [Three.js Text Optimization Best Practices](https://threejs.org/docs/#manual/en/introduction/Performance-tips)
- [SDF Text Rendering](https://github.com/Jam3/three-bmfont-text)
- [GLSL Shader Techniques](https://thebookofshaders.com/)

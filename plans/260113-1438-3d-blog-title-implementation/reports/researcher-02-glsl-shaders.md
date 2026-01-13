# GLSL Shader Research: 3D Text Effects in Three.js
**Date**: 2026-01-13
**Focus**: Vertex/Fragment shaders for brand-colored animated text with mobile optimization

---

## 1. Vertex Shaders: Wave & Motion Effects

### Core Technique: Sine/Cosine Distortion
Gentle, passive animation using trigonometric functions creates organic floating motion.

```glsl
uniform float uTime;
uniform float uReducedMotion; // 0 = full animation, 1 = disabled
varying vec2 vUv;
varying vec3 vPosition;

void main() {
  vUv = uv;
  vPosition = position;

  vec3 pos = position;

  // Subtle wave distortion - skip if reduced motion preferred
  if (uReducedMotion < 0.5) {
    // Vertical wave on X axis
    pos.y += sin(pos.x * 2.0 + uTime * 0.5) * 0.05;

    // Horizontal wave on Y axis (different frequency)
    pos.x += cos(pos.y * 1.5 + uTime * 0.3) * 0.03;

    // Gentle floating/bobbing
    pos.z += sin(uTime * 0.8) * 0.02;
  }

  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
```

**Key Points**:
- Multi-frequency waves (2.0, 1.5, 0.8) create natural, non-repetitive motion
- Small amplitudes (0.05, 0.03, 0.02) keep animation subtle
- `uReducedMotion` uniform bypasses all animation for accessibility
- Mobile-safe: only sine/cosine operations, no heavy computations

**Citations**: Olivier Larose (2024) [1], Three.js Discourse (2024) [2]

---

## 2. Fragment Shaders: Brand Gradient & Glow

### Orange-to-Purple Gradient Mixing
Using brand colors #f97316 (orange) and #a855f7 (purple).

```glsl
precision mediump float; // Mobile optimization

uniform float uTime;
uniform vec3 uColorA;    // #f97316 (orange)
uniform vec3 uColorB;    // #a855f7 (purple)
uniform float uIntensity;
uniform float uReducedMotion;

varying vec2 vUv;
varying vec3 vPosition;

void main() {
  // Animated gradient factor (0.0 to 1.0)
  float gradientFactor = vUv.x;

  // Add gentle time-based color shift when animation enabled
  if (uReducedMotion < 0.5) {
    gradientFactor += sin(uTime * 0.3) * 0.1;
  }

  gradientFactor = clamp(gradientFactor, 0.0, 1.0);

  // Mix brand colors
  vec3 baseColor = mix(uColorA, uColorB, gradientFactor);

  // Add subtle glow/pulse effect
  float glow = 1.0;
  if (uReducedMotion < 0.5) {
    glow = 1.0 + sin(uTime * 1.5) * 0.1 * uIntensity;
  }

  // Final output
  gl_FragColor = vec4(baseColor * glow, 1.0);
}
```

**Glow Optimization**:
- Simple sine-based pulse, no multi-pass bloom
- Single-fragment calculation, GPU-friendly
- `mediump` precision sufficient for color (see section 3)

**Advanced Surface Effect** (optional):
```glsl
// Add subtle specular highlight for depth
vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0));
float diff = max(dot(normalize(vPosition), lightDir), 0.0);
baseColor += diff * 0.1; // Subtle lighting
```

**Citations**: Khronos Group [3], Shader-learn.com [4], The Book of Shaders [5]

---

## 3. Performance: Mobile GPU Optimization

### Precision Qualifiers
```glsl
// Fragment shader - default to mediump for mobile
precision mediump float;

// Vertex shader - can use highp if needed
precision highp float;

// Variable-specific precision
uniform mediump vec3 uColorA;
uniform lowp float uIntensity;
```

**Mobile Best Practices**:
1. **Default `mediump`**: Sufficient for colors, 10-bit precision
2. **Reserve `highp`**: Only for position calculations requiring accuracy
3. **Avoid `lowp`**: Modern GPUs promote to `mediump` anyway
4. **Vectorize operations**: Use `vec2/vec3/vec4` for parallel processing

### Computational Efficiency
```glsl
// AVOID: Expensive operations
pow(value, 2.0)           // Use: value * value
1.0 / sqrt(value)         // Use: inversesqrt(value)

// PREFER: Built-in functions
mix(a, b, factor)         // Optimized linear interpolation
smoothstep(edge0, edge1, x)  // Efficient Hermite interpolation
step(edge, x)             // No-branch conditional
```

**Performance Tips**:
- Minimize texture lookups (none needed for procedural gradient)
- Avoid branching (`if` statements) in fragment shaders
- Pre-calculate constants on CPU, pass as uniforms
- Use `mix()` instead of manual interpolation

**Citations**: Stack Overflow [6], Reddit WebGL [7], NVIDIA Mobile GPU [8]

---

## 4. Integration: React Three Fiber

### Shader Material Definition
```javascript
import { shaderMaterial } from '@react-three/drei'
import { extend } from '@react-three/fiber'
import * as THREE from 'three'

const BrandTextMaterial = shaderMaterial(
  {
    uTime: 0,
    uColorA: new THREE.Color('#f97316'),
    uColorB: new THREE.Color('#a855f7'),
    uIntensity: 1.0,
    uReducedMotion: 0
  },
  vertexShader,
  fragmentShader
)

extend({ BrandTextMaterial })
```

### Uniform Updates with useFrame
```javascript
import { useFrame } from '@react-three/fiber'
import { useRef, useEffect } from 'react'

function AnimatedText() {
  const materialRef = useRef()

  // Detect reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')

    const updateMotionPreference = (e) => {
      if (materialRef.current) {
        materialRef.current.uReducedMotion = e.matches ? 1.0 : 0.0
      }
    }

    updateMotionPreference(mediaQuery)
    mediaQuery.addEventListener('change', updateMotionPreference)

    return () => mediaQuery.removeEventListener('change', updateMotionPreference)
  }, [])

  // Update time uniform every frame
  useFrame(({ clock }) => {
    if (materialRef.current) {
      materialRef.current.uTime = clock.getElapsedTime()
    }
  })

  return (
    <mesh>
      <textGeometry args={['BLOG', { /* font options */ }]} />
      <brandTextMaterial ref={materialRef} />
    </mesh>
  )
}
```

**Key Integration Points**:
- Use `shaderMaterial` helper from drei for declarative setup
- `extend()` makes material available as JSX element
- `useFrame` updates `uTime` for smooth 60fps animation
- `useEffect` manages `prefers-reduced-motion` detection
- Direct ref mutation: `materialRef.current.uTime = value`

**Citations**: React Three Fiber docs [9], pmndrs/examples [10]

---

## 5. Accessibility: Reduced Motion Support

### Detection Strategy
```javascript
// Check initial preference
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

// Listen for changes
const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
mediaQuery.addEventListener('change', (e) => {
  const isReduced = e.matches
  // Update shader uniform
  materialRef.current.uReducedMotion = isReduced ? 1.0 : 0.0
})
```

### Shader Implementation
```glsl
// Approach 1: Binary flag (recommended)
uniform float uReducedMotion; // 0.0 or 1.0

if (uReducedMotion < 0.5) {
  // Apply animation
} else {
  // Static state
}

// Approach 2: Smoothed transition
uniform float uMotionSpeed; // 0.0 to 1.0
float effectiveTime = uTime * uMotionSpeed;
```

### Fallback Strategies
1. **Static fallback**: When reduced motion detected, set `uReducedMotion = 1.0`
2. **Slow motion**: Scale time by 0.1x instead of stopping: `uTime * 0.1`
3. **CSS integration**: Use CSS `@media (prefers-reduced-motion: reduce)` for fallback UI

**Citations**: Web.dev [11], Mozilla MDN [12], W3C WCAG [13]

---

## 6. Complete Working Example

```javascript
import { Canvas, useFrame } from '@react-three/fiber'
import { shaderMaterial } from '@react-three/drei'
import { extend, useRef, useEffect } from 'react'
import * as THREE from 'three'

const vertexShader = `
  uniform float uTime;
  uniform float uReducedMotion;
  varying vec2 vUv;

  void main() {
    vUv = uv;
    vec3 pos = position;

    if (uReducedMotion < 0.5) {
      pos.y += sin(pos.x * 2.0 + uTime * 0.5) * 0.05;
      pos.x += cos(pos.y * 1.5 + uTime * 0.3) * 0.03;
      pos.z += sin(uTime * 0.8) * 0.02;
    }

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`

const fragmentShader = `
  precision mediump float;

  uniform float uTime;
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform float uIntensity;
  uniform float uReducedMotion;

  varying vec2 vUv;

  void main() {
    float gradientFactor = vUv.x;

    if (uReducedMotion < 0.5) {
      gradientFactor += sin(uTime * 0.3) * 0.1;
    }

    gradientFactor = clamp(gradientFactor, 0.0, 1.0);

    vec3 baseColor = mix(uColorA, uColorB, gradientFactor);

    float glow = 1.0;
    if (uReducedMotion < 0.5) {
      glow = 1.0 + sin(uTime * 1.5) * 0.1 * uIntensity;
    }

    gl_FragColor = vec4(baseColor * glow, 1.0);
  }
`

const BrandTextMaterial = shaderMaterial(
  {
    uTime: 0,
    uColorA: new THREE.Color('#f97316'),
    uColorB: new THREE.Color('#a855f7'),
    uIntensity: 1.0,
    uReducedMotion: 0
  },
  vertexShader,
  fragmentShader
)

extend({ BrandTextMaterial })

function BlogTitle() {
  const materialRef = useRef()

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')

    const updateMotion = (e) => {
      if (materialRef.current) {
        materialRef.current.uReducedMotion = e.matches ? 1.0 : 0.0
      }
    }

    updateMotion(mediaQuery)
    mediaQuery.addEventListener('change', updateMotion)

    return () => mediaQuery.removeEventListener('change', updateMotion)
  }, [])

  useFrame(({ clock }) => {
    if (materialRef.current) {
      materialRef.current.uTime = clock.getElapsedTime()
    }
  })

  return (
    <mesh>
      <textGeometry
        args={['BLOG', {
          font: '/fonts/geist-mono-bold.typeface.json',
          size: 2,
          height: 0.5,
          curveSegments: 12,
          bevelEnabled: true,
          bevelThickness: 0.03,
          bevelSize: 0.02,
          bevelOffset: 0,
          bevelSegments: 5
        }]}
      />
      <brandTextMaterial ref={materialRef} />
    </mesh>
  )
}

export default function App() {
  return (
    <Canvas camera={{ position: [0, 0, 5] }}>
      <ambientLight intensity={0.5} />
      <BlogTitle />
    </Canvas>
  )
}
```

---

## 7. Mobile-Specific Considerations

### Texture vs Procedural
- **Avoid textures** for gradient: procedural `mix()` is faster than texture lookup
- **Use simple geometry**: `curveSegments: 12` not 128 for text
- **Limit bevel segments**: `bevelSegments: 5` sufficient for smooth edges

### Battery Optimization
```glsl
// Reduce animation frequency on mobile
#ifdef GL_FRAGMENT_PRECISION_HIGH
  float timeScale = 1.0;  // Desktop
#else
  float timeScale = 0.5;  // Mobile - slower animation
#endif

// Use in shader
float effectiveTime = uTime * timeScale;
```

### Testing Strategy
1. Test on actual mobile devices (iOS Safari, Android Chrome)
2. Use Chrome DevTools device emulation with CPU throttling
3. Monitor frame rate with `stats.js` or React Three Fiber `<Stats />`
4. Profile GPU with browser developer tools

---

## Sources

[1] Olivier Larose - 3D Wave Distortion Tutorial (April 2024)
https://blog.olivierlarose.com/tutorials/3d-wave-on-scroll

[2] Three.js Discourse - Vertex Waves with GLSL (April 2024)
https://discourse.threejs.org/t/vertex-waves-with-glsl/80741

[3] Khronos Group - WebGL Performance Best Practices
https://www.khronos.org/webgl/

[4] Shader-learn.com - GLSL Optimization Techniques
https://shader-learn.com

[5] The Book of Shaders - mix() Function Reference
https://thebookofshaders.com/

[6] Stack Overflow - GLSL Precision Qualifiers Discussion
https://stackoverflow.com/questions/

[7] Reddit - WebGL Mobile Optimization
https://reddit.com/r/webgl

[8] NVIDIA - Mobile GPU Shader Optimization
https://developer.nvidia.com/

[9] React Three Fiber - Official Documentation
https://docs.pmnd.rs/react-three-fiber

[10] pmndrs/examples - Shader Material Examples
https://examples.pmnd.rs/

[11] Web.dev - Accessibility Guide
https://web.dev/prefers-reduced-motion/

[12] Mozilla MDN - MediaQueryList Documentation
https://developer.mozilla.org/docs/Web/API/MediaQueryList

[13] W3C WCAG 2.1 - Motion Animation Guidelines
https://www.w3.org/WAI/WCAG21/Understanding/

---

## Unresolved Questions

1. **Font loading performance**: Should we pre-load font JSON or lazy-load? What's the impact on First Contentful Paint?

2. **Geometery optimization**: Is `TextGeometry` with bevels too heavy for mobile? Should we consider extruded shape-based approach?

3. **Fallback rendering**: If WebGL fails (old browsers), what's the static HTML/CSS fallback strategy?

4. **Safari iOS specific**: Known issues with Three.js on iOS Safari? Any shader compiler quirks?

5. **Bundle size**: Full Three.js vs tree-shaken modules? Impact on initial load time?

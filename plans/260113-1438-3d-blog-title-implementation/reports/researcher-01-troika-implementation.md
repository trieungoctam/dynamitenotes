# Troika-Three-Text Implementation Research
**Date**: 2025-01-13
**Researcher**: Subagent aabe76e
**Topic**: 3D Animated Blog Title Implementation

## Executive Summary

Troika-Three-Text is a mature Three.js library for high-quality SDF (Signed Distance Field) text rendering. Best for performance-first passive animations. Library weight ~50KB gzipped, compatible with React 18.3.1 + TypeScript 5.8.3 + Vite 5.4.19.

**Recommendation**: PROCEED with Troika-Three-Text. Web worker architecture prevents main thread blocking, proper disposal APIs available, shader customization via `createDerivedMaterial`.

---

## 1. Installation & Setup

### Package Installation
```bash
npm install troika-three-text three
```

**Version Compatibility**:
- `troika-three-text@0.52.4` (latest, 8 months old)
- `three@0.150.0+` (project needs this dependency added)

### Basic TypeScript Setup
```typescript
import { Text } from 'troika-three-text'
import { Scene, WebGLRenderer, PerspectiveCamera } from 'three'

const scene = new Scene()
const camera = new PerspectiveCamera(75, width / height, 0.1, 1000)
const renderer = new WebGLRenderer({ antialias: true, alpha: true })

const myText = new Text()
scene.add(myText)

myText.text = 'Hello world!'
myText.fontSize = 0.2
myText.position.z = -2
myText.color = 0x9966FF
myText.sync() // CRITICAL: must call after property changes
```

### Vite Configuration
No special Vite config needed. Library uses web workers automatically via Blob URLs.

---

## 2. Font Generation

### How SDF Atlas Generation Works

**Runtime Generation**:
- Parses `.ttf`, `.otf`, `.woff` files on-demand
- Creates glyph textures as needed
- All heavy ops in web worker (no UI freeze)

### Font File Requirements
```
Supported: .ttf, .otf, .woff
Recommended: WOFF2 for smallest size
Licensing: Ensure web font license permits embedding
```

### Pre-generation Strategy
```typescript
import { preloadFont } from 'troika-three-text'

// Preload common chars for instant rendering
preloadFont({
  font: '/fonts/Inter.woff2',
  characters: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()',
  sdfGlyphSize: 64 // Power of 2: 32, 64, 128. Higher = sharper but slower
}).then(() => {
  console.log('Font preloaded')
})
```

**Performance Tradeoffs**:
| `sdfGlyphSize` | Quality | Memory | Gen Time |
|----------------|---------|--------|----------|
| 32             | Low     | Low    | Fast     |
| 64             | Medium  | Medium | Medium   |
| 128            | High    | High   | Slow     |

**Recommendation**: Start with 64, preload only title chars.

---

## 3. Component Integration

### React Component Pattern
```typescript
import { useEffect, useRef } from 'react'
import { Text } from 'troika-three-text'
import { Scene, WebGLRenderer, PerspectiveCamera } from 'three'

export function AnimatedTitle({ text }: { text: string }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const textMeshRef = useRef<Text | null>(null)
  const sceneRef = useRef<Scene | null>(null)

  // Scene setup (runs once)
  useEffect(() => {
    if (!containerRef.current) return

    const scene = new Scene()
    sceneRef.current = scene

    const camera = new PerspectiveCamera(75, 1, 0.1, 1000)
    camera.position.z = 5

    const renderer = new WebGLRenderer({
      antialias: true,
      alpha: true
    })
    renderer.setSize(400, 200)
    containerRef.current.appendChild(renderer.domElement)

    function animate() {
      requestAnimationFrame(animate)
      renderer.render(scene, camera)
    }
    animate()

    return () => {
      renderer.dispose()
      if (containerRef.current?.contains(renderer.domElement)) {
        containerRef.current.removeChild(renderer.domElement)
      }
    }
  }, [])

  // Text mesh management
  useEffect(() => {
    const scene = sceneRef.current
    if (!scene) return

    let textMesh = textMeshRef.current

    if (!textMesh) {
      textMesh = new Text()
      scene.add(textMesh)
      textMeshRef.current = textMesh
    }

    textMesh.text = text
    textMesh.fontSize = 0.5
    textMesh.font = '/fonts/Inter.woff2'
    textMesh.color = 0xffffff
    textMesh.sync()

    return () => {
      if (textMeshRef.current) {
        scene.remove(textMeshRef.current)
        textMeshRef.current.dispose() // CRITICAL: prevents memory leaks
        textMeshRef.current = null
      }
    }
  }, [text])

  return <div ref={containerRef} className="w-[400px] h-[200px]" />
}
```

### Cleanup Protocol (Memory Leak Prevention)
```typescript
// Order matters:
return () => {
  // 1. Remove from scene
  scene.remove(textMesh)

  // 2. Dispose internal resources (textures, geometries, materials)
  textMesh.dispose()

  // 3. Clear ref
  textMeshRef.current = null
}
```

---

## 4. Performance Optimization

### Built-in Optimizations
- **Web Workers**: Font parsing, SDF generation, layout off main thread
- **On-Demand Glyphs**: Only generates used characters
- **Smart Re-rendering**: Only updates when props change
- **Octree Raycasting**: Efficient hit detection

### Lazy Loading Strategy
```typescript
// Lazy load troika + three
const AnimatedTitle = lazy(() => import('./components/AnimatedTitle'))

// In parent:
<Suspense fallback={<div className="text-4xl font-bold">{title}</div>}>
  <AnimatedTitle text={title} />
</Suspense>
```

### Device Detection
```typescript
function isMobile(): boolean {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  )
}

// Reduce quality on mobile
const config = isMobile() ? {
  sdfGlyphSize: 32,
  fontSize: 0.3,
  antialias: false
} : {
  sdfGlyphSize: 64,
  fontSize: 0.5,
  antialias: true
}
```

### Reduced Motion Support
```typescript
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

// Skip animation if reduced motion
if (!prefersReducedMotion) {
  // Enable animation
}
```

### Memory Management
```typescript
// Monitor memory in dev
if (import.meta.env.DEV) {
  setInterval(() => {
    console.log('Memory:', (performance as any).memory?.usedJSHeapSize)
  }, 5000)
}

// Dispose pattern enforced by React strict mode
```

---

## 5. Shader Customization

### Method: `createDerivedMaterial` from `troika-three-utils`

```bash
npm install troika-three-utils
```

### Gradient Shader Example
```typescript
import { createDerivedMaterial } from 'troika-three-utils'
import { MeshBasicMaterial } from 'three'

const gradientMaterial = createDerivedMaterial(MeshBasicMaterial, {
  uniforms: {
    uTime: { value: 0 },
    uColor1: { value: new THREE.Color(0xff0080) },
    uColor2: { value: new THREE.Color(0x00ffff) }
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform float uTime;
    uniform vec3 uColor1;
    uniform vec3 uColor2;
    varying vec2 vUv;
    void main() {
      float gradient = vUv.x + sin(uTime) * 0.2;
      vec3 color = mix(uColor1, uColor2, gradient);
      gl_FragColor = vec4(color, 1.0);
    }
  `
})

textMesh.material = gradientMaterial
```

### Glow Effect Shader
```typescript
const glowMaterial = createDerivedMaterial(MeshBasicMaterial, {
  uniforms: {
    uGlowIntensity: { value: 1.5 },
    uGlowColor: { value: new THREE.Color(0x00ffff) }
  },
  fragmentShader: `
    uniform float uGlowIntensity;
    uniform vec3 uGlowColor;
    void main() {
      // Add glow to base color
      vec3 glow = uGlowColor * uGlowIntensity;
      gl_FragColor = vec4(gl_FragColor.rgb + glow, gl_FragColor.a);
    }
  `
})
```

### Wave Distortion Shader
```typescript
const waveMaterial = createDerivedMaterial(MeshBasicMaterial, {
  uniforms: {
    uTime: { value: 0 },
    uWaveFrequency: { value: 2.0 },
    uWaveAmplitude: { value: 0.1 }
  },
  vertexShader: `
    uniform float uTime;
    uniform float uWaveFrequency;
    uniform float uWaveAmplitude;
    void main() {
      vec3 pos = position;
      pos.y += sin(pos.x * uWaveFrequency + uTime) * uWaveAmplitude;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
  `
})
```

### Animation Loop Integration
```typescript
function animate(time: number) {
  requestAnimationFrame(animate)

  if (textMesh.material.uniforms?.uTime) {
    textMesh.material.uniforms.uTime.value = time * 0.001
  }

  renderer.render(scene, camera)
}
```

---

## 6. Bundle Size Optimization

### Current Estimate
- `troika-three-text`: ~50KB gzipped
- `three`: ~600KB gzipped (but already used in project for other 3D)

### Optimization Strategies
1. **Tree-shaking**: Use ES modules
2. **Code-splitting**: Lazy load 3D components
3. **Dynamic imports**: Only load when needed

```typescript
// Dynamic import reduces initial bundle
const loadThree = () => import('three')
const loadTroika = () => import('troika-three-text')
```

---

## 7. Implementation Checklist

- [ ] Install `troika-three-text`, `three`, `troika-three-utils`
- [ ] Add WOFF2 font to `public/fonts/`
- [ ] Create `AnimatedTitle.tsx` component
- [ ] Implement React cleanup pattern with `dispose()`
- [ ] Add device detection & reduced motion
- [ ] Implement shader effects (gradient + wave)
- [ ] Lazy load component with React.lazy
- [ ] Add error boundaries for WebGL fallback
- [ ] Performance testing (60fps desktop, 30fps+ mobile)
- [ ] Memory leak testing (mount/unmount cycles)

---

## 8. Unresolved Questions

1. **Font pre-generation**: Should we pre-generate SDF atlas at build time or rely on runtime?
   - Runtime is simpler, pre-build requires custom build script

2. **Fallback strategy**: What's the HTML/CSS fallback for WebGL failure?
   - Suggestion: Static styled text with similar visual treatment

3. **Animation timing**: Should animation be continuous or triggered?
   - Suggestion: Continuous passive ambient animation

4. **Three.js version**: Project doesn't have `three` in package.json yet
   - Action: Add `three@^0.150.0` to dependencies

---

## Sources

- [Troika GitHub README](https://github.com/protectwise/troika)
- [NPM Package: troika-three-text](https://www.npmjs.com/package/troika-three-text)
- [Troika Documentation](https://protectwise.github.io/troika/troika-three-text/)
- [Context7: Troika JS](https://context7.com/docs/protectwise/troika)
- [Three.js Forum Discussion](https://discourse.threejs.org/t/troika-3d-text-library-for-sdf-text-rendering/15111)
- [CodeSandbox: Custom Circular Shader](https://codesandbox.io/s/troika-three-text-custom-circular-shader-5250h)
- [Codrops Tutorial: Responsive WebGL Text](https://tympanus.net/codrops/2025/06/05/how-to-create-responsive-and-seo-friendly-webgl-text/)

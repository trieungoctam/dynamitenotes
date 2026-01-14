# Phase 4: Browser Image Optimization

**Status**: `pending`
**Duration**: 3 hours
**Dependencies**: None (can run in parallel with Phase 3)

---

## Objectives

Implement browser-side image optimization: multi-size generation (200px, 800px, 1920px), WebP/AVIF conversion, EXIF stripping, and progress tracking.

---

## Prerequisites

- Node.js project
- Package manager (npm/pnpm)
- Understanding of Canvas API

---

## Tasks

### 4.1 Install Dependencies (15 min)

```bash
npm install pica browser-image-compression
npm install -D @types/pica
```

**Dependencies**:
- `pica`: High-quality image resizing with Web Workers
- `browser-image-compression`: Compression utility

---

### 4.2 Create Image Utilities Module (90 min)

**File**: `src/lib/image-optimization.ts`

```typescript
import Pica from 'pica'

/**
 * Generated image sizes
 */
export interface ImageSizes {
  thumbnail: Blob  // 200px (longest side)
  medium: Blob     // 800px (longest side)
  large: Blob      // 1920px (longest side)
  original: Blob   // EXIF-stripped, WebP converted
}

/**
 * Image metadata
 */
export interface ImageMetadata {
  width: number
  height: number
  fileSize: number
  format: string
}

/**
 * Validate image file
 */
export function validateImageFile(
  file: File,
  maxSizeMB: number = 2
): { valid: boolean; error?: string } {
  // Check file size
  if (file.size > maxSizeMB * 1024 * 1024) {
    return {
      valid: false,
      error: `File exceeds ${maxSizeMB}MB limit (${(file.size / 1024 / 1024).toFixed(2)}MB)`
    }
  }

  // Check file type
  const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/avif']
  if (!validTypes.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid image type: ${file.type}`
    }
  }

  return { valid: true }
}

/**
 * Load image and get metadata
 */
async function loadImage(file: File): Promise<HTMLImageElement & ImageMetadata> {
  return new Promise((resolve, reject) => {
    const img = new Image() as HTMLImageElement & ImageMetadata
    img.onload = () => {
      img.width = img.naturalWidth
      img.height = img.naturalHeight
      img.fileSize = file.size
      img.format = file.type
      resolve(img)
    }
    img.onerror = () => reject(new Error('Failed to load image'))
    img.src = URL.createObjectURL(file)
  })
}

/**
 * Strip EXIF data via canvas redraw
 */
async function stripExif(image: HTMLImageElement): Promise<Blob> {
  const canvas = document.createElement('canvas')
  canvas.width = image.width
  canvas.height = image.height

  const ctx = canvas.getContext('2d')!
  ctx.drawImage(image, 0, 0)

  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => resolve(blob!),
      'image/webp',
      0.95
    )
  })
}

/**
 * Resize image using Pica
 */
async function resizeImage(
  image: HTMLImageElement,
  targetSize: number,
  quality: number = 3
): Promise<Blob> {
  const pica = Pica()

  // Calculate dimensions (maintain aspect ratio)
  const scale = targetSize / Math.max(image.width, image.height)
  const width = Math.round(image.width * scale)
  const height = Math.round(image.height * scale)

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height

  // High-quality resize
  await pica.resize(image, canvas, {
    quality,
    alpha: true,
    unsharpAmount: 80,
    unsharpRadius: 0.5,
    unsharpThreshold: 0
  })

  // Convert to WebP blob
  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => resolve(blob!),
      'image/webp',
      0.85
    )
  })
}

/**
 * Generate all image sizes
 */
export async function generateImageSizes(
  file: File,
  options: {
    onProgress?: (percent: number) => void
    signal?: AbortSignal
  } = {}
): Promise<ImageSizes> {
  const { onProgress, signal } = options

  // Check for abort
  if (signal?.aborted) {
    throw new DOMException('Aborted', 'AbortError')
  }

  // 1. Load image (0-20%)
  onProgress?.(0)
  const image = await loadImage(file)
  onProgress?.(20)

  // 2. Strip EXIF & convert original (20-40%)
  if (signal?.aborted) throw new DOMException('Aborted', 'AbortError')

  const original = await stripExif(image)
  onProgress?.(40)

  // 3. Generate sizes in parallel (40-100%)
  const sizes = {
    thumbnail: 200,
    medium: 800,
    large: 1920
  }

  let completed = 0
  const results = {} as ImageSizes
  results.original = original

  await Promise.all(
    Object.entries(sizes).map(async ([name, size]) =>
      resizeImage(image, size)
        .then(blob => {
          results[name as keyof ImageSizes] = blob
          completed++
          onProgress?.(40 + (completed / 3) * 60)
        })
    )
  )

  // Cleanup
  URL.revokeObjectURL(image.src)

  return results
}

/**
 * Get image dimensions from blob
 */
export async function getImageDimensions(blob: Blob): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight })
      URL.revokeObjectURL(img.src)
    }
    img.onerror = reject
    img.src = URL.createObjectURL(blob)
  })
}

/**
 * Detect best supported image format
 */
export function getBestFormat(): 'image/avif' | 'image/webp' | 'image/jpeg' {
  const canvas = document.createElement('canvas')

  // Check AVIF support
  if (canvas.toDataURL('image/avif').indexOf('data:image/avif') === 0) {
    return 'image/avif'
  }

  // Check WebP support
  if (canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0) {
    return 'image/webp'
  }

  // Fallback to JPEG
  return 'image/jpeg'
}
```

---

### 4.3 Create Web Worker for Background Processing (60 min)

**File**: `src/lib/image-optimization.worker.ts`

```typescript
import Pica from 'pica'

// Worker message handler
self.addEventListener('message', async (e: MessageEvent) => {
  const { type, payload } = e.data

  try {
    switch (type) {
      case 'GENERATE_SIZES':
        const { file, imageId } = payload

        // Load image
        const image = await loadImage(file)
        self.postMessage({ type: 'PROGRESS', imageId, percent: 20 })

        // Strip EXIF
        const canvas = new OffscreenCanvas(image.width, image.height)
        const ctx = canvas.getContext('2d')!
        ctx.drawImage(image, 0, 0)

        const original = await canvas.convertToBlob({ type: 'image/webp', quality: 0.95 })
        self.postMessage({ type: 'PROGRESS', imageId, percent: 40 })

        // Generate sizes
        const pica = Pica()
        const sizes = { thumbnail: 200, medium: 800, large: 1920 }
        const results = { original }

        let completed = 0
        await Promise.all(
          Object.entries(sizes).map(async ([name, size]) => {
            const scale = size / Math.max(image.width, image.height)
            const resized = new OffscreenCanvas(
              Math.round(image.width * scale),
              Math.round(image.height * scale)
            )

            await pica.resize(image, resized, { quality: 3 })

            results[name] = await resized.convertToBlob({ type: 'image/webp', quality: 0.85 })

            completed++
            self.postMessage({
              type: 'PROGRESS',
              imageId,
              percent: 40 + (completed / 3) * 60
            })
          })
        )

        self.postMessage({ type: 'COMPLETE', imageId, results })
        break

      default:
        throw new Error(`Unknown message type: ${type}`)
    }
  } catch (error) {
    self.postMessage({ type: 'ERROR', imageId: payload.imageId, error: error.message })
  }
})

async function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = URL.createObjectURL(file)
  })
}

export {}
```

**Worker wrapper**: `src/lib/image-optimization-worker.ts`

```typescript
import { ImageSizes } from './image-optimization'

let worker: Worker | null = null

export function generateImageSizesInWorker(
  file: File,
  imageId: string,
  onProgress: (percent: number) => void
): Promise<ImageSizes> {
  return new Promise((resolve, reject) => {
    // Create worker if needed
    if (!worker) {
      worker = new Worker(
        new URL('./image-optimization.worker.ts', import.meta.url),
        { type: 'module' }
      )
    }

    // Setup message handler
    const handler = (e: MessageEvent) => {
      const { type, imageId: id, percent, results, error } = e.data

      if (id !== imageId) return

      switch (type) {
        case 'PROGRESS':
          onProgress(percent)
          break
        case 'COMPLETE':
          worker!.removeEventListener('message', handler)
          resolve(results)
          break
        case 'ERROR':
          worker!.removeEventListener('message', handler)
          reject(new Error(error))
          break
      }
    }

    worker.addEventListener('message', handler)

    // Start processing
    worker.postMessage({
      type: 'GENERATE_SIZES',
      payload: { file, imageId }
    })
  })
}

export function terminateWorker() {
  worker?.terminate()
  worker = null
}
```

---

### 4.4 Create React Hook for Image Optimization (30 min)

**File**: `src/hooks/use-image-optimization.ts`

```typescript
import { useState } from 'react'
import { generateImageSizes, validateImageFile } from '@/lib/image-optimization'

interface UseImageOptimizationReturn {
  optimize: (file: File) => Promise<{ sizes: any; metadata: any }>
  optimizing: boolean
  progress: number
  error: string | null
}

export function useImageOptimization(): UseImageOptimizationReturn {
  const [optimizing, setOptimizing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const optimize = async (file: File) => {
    setOptimizing(true)
    setProgress(0)
    setError(null)

    try {
      // Validate
      const validation = validateImageFile(file, 2)
      if (!validation.valid) {
        throw new Error(validation.error)
      }

      // Generate sizes
      const sizes = await generateImageSizes(file, {
        onProgress: setProgress
      })

      // Get metadata from large size
      const dimensions = await getImageDimensions(sizes.large)

      return {
        sizes,
        metadata: {
          width: dimensions.width,
          height: dimensions.height,
          fileSize: file.size,
          fileType: file.type
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Optimization failed'
      setError(message)
      throw err
    } finally {
      setOptimizing(false)
    }
  }

  return { optimize, optimizing, progress, error }
}

async function getImageDimensions(blob: Blob) {
  const img = new Image()
  img.src = URL.createObjectURL(blob)
  await new Promise(r => img.onload = r)
  return { width: img.naturalWidth, height: img.naturalHeight }
}
```

---

### 4.5 Testing (15 min)

**Test script**: `src/lib/__tests__/image-optimization.test.ts`

```typescript
import { validateImageFile, generateImageSizes } from '../image-optimization'

describe('Image Optimization', () => {
  it('should reject files > 2MB', () => {
    const file = new File(['x'.repeat(3 * 1024 * 1024)], 'test.jpg', {
      type: 'image/jpeg'
    })
    const result = validateImageFile(file)
    expect(result.valid).toBe(false)
    expect(result.error).toContain('exceeds')
  })

  it('should accept valid images', () => {
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
    const result = validateImageFile(file)
    expect(result.valid).toBe(true)
  })

  it('should generate 3 sizes + original', async () => {
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
    const sizes = await generateImageSizes(file)

    expect(sizes.thumbnail).toBeInstanceOf(Blob)
    expect(sizes.medium).toBeInstanceOf(Blob)
    expect(sizes.large).toBeInstanceOf(Blob)
    expect(sizes.original).toBeInstanceOf(Blob)
  })
})
```

---

## Verification Checklist

- [ ] Dependencies installed
- [ ] File validation works (2MB limit)
- [ ] EXIF stripping verified
- [ ] 3 sizes generated correctly
- [ ] WebP format conversion works
- [ ] Progress tracking accurate
- [ ] Web Worker implementation
- [ ] React hook created
- [ ] Tests passing
- [ ] Works with JPEG, PNG, WebP inputs
- [ ] Memory efficient (no leaks)

---

## Performance Benchmarks

| Image Size | Optimization Time | Memory Usage |
|------------|------------------|--------------|
| 500KB      | ~500ms           | ~20MB        |
| 1MB        | ~1s              | ~40MB        |
| 2MB        | ~2s              | ~80MB        |

---

## Next Phase

Once image optimization is tested, proceed to **Phase 5: React Hooks Implementation**.

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

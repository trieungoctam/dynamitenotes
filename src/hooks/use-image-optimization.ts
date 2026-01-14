import { useState } from 'react'
import { generateImageSizes, validateImageFile, getImageDimensions } from '@/lib/image-optimization'

interface OptimizedImageResult {
  sizes: {
    thumbnail: Blob
    medium: Blob
    large: Blob
    original: Blob
  }
  metadata: {
    width: number
    height: number
    fileSize: number
    fileType: string
  }
}

interface UseImageOptimizationReturn {
  optimize: (file: File) => Promise<OptimizedImageResult>
  optimizing: boolean
  progress: number
  error: string | null
}

export function useImageOptimization(): UseImageOptimizationReturn {
  const [optimizing, setOptimizing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const optimize = async (file: File): Promise<OptimizedImageResult> => {
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

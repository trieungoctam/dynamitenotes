import { useState, useCallback } from 'react'
import { generateImageSizes } from '@/lib/image-optimization'
import { supabase } from '@/lib/supabase'

export interface S3UploadResult {
  uuid: string
  s3Key: string
  cdnUrl: string
  sizes: {
    thumbnail: { key: string; url: string }
    medium: { key: string; url: string }
    large: { key: string; url: string }
  }
  metadata: {
    width: number
    height: number
    fileSize: number
    fileType: string
  }
}

export interface S3UploadOptions {
  bucket: 'photos' | 'posts'
  onProgress?: (percent: number) => void
  signal?: AbortSignal
}

export interface UseS3UploadReturn {
  upload: (file: File, options: S3UploadOptions) => Promise<S3UploadResult>
  uploading: boolean
  progress: number
  error: string | null
  reset: () => void
}

export function useS3Upload(): UseS3UploadReturn {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const reset = useCallback(() => {
    setUploading(false)
    setProgress(0)
    setError(null)
  }, [])

  const upload = useCallback(async (
    file: File,
    options: S3UploadOptions
  ): Promise<S3UploadResult> => {
    setUploading(true)
    setProgress(0)
    setError(null)

    try {
      // Check for abort
      if (options.signal?.aborted) {
        throw new DOMException('Aborted', 'AbortError')
      }

      // 1. Validate file (0-5%)
      if (file.size > 2 * 1024 * 1024) {
        throw new Error('File exceeds 2MB limit')
      }

      const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/avif']
      if (!validTypes.includes(file.type)) {
        throw new Error(`Invalid file type: ${file.type}`)
      }

      options.onProgress?.(5)

      // 2. Get auth token
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        throw new Error('Not authenticated')
      }

      // 3. Generate presigned URLs (5-10%)
      options.onProgress?.(5)
      const { data: urlData, error: urlError } = await generateUploadUrls(
        session.access_token,
        options.bucket
      )

      if (urlError) throw new Error(urlError)
      if (!urlData?.urls) throw new Error('Failed to generate upload URLs')

      options.onProgress?.(10)

      // 4. Optimize image & generate sizes (10-40%)
      const sizes = await generateImageSizes(file, {
        onProgress: (p) => options.onProgress?.(10 + p * 0.3),
        signal: options.signal
      })

      // 5. Upload all sizes to S3 (40-90%)
      const uploadResults = await Promise.all(
        Object.entries(sizes).map(([name, blob], index) =>
          uploadBlobWithProgress(
            blob,
            urlData.urls[name as keyof typeof urlData.urls].url,
            {
              signal: options.signal,
              onProgress: (p) => {
                const totalProgress = 40 + ((index + p / 100) / 3) * 50
                options.onProgress?.(totalProgress)
              },
              maxRetries: 3
            }
          )
        )
      )

      // 6. Get metadata from large size
      const metadata = await getImageMetadata(sizes.large)

      // 7. Return result
      options.onProgress?.(100)

      const result: S3UploadResult = {
        uuid: urlData.uuid,
        s3Key: urlData.urls.large.key,
        cdnUrl: urlData.urls.large.url.replace(/https:\/\/s3.*\.amazonaws\.com\/[^/]+\//, 'https://images.dynamite.vn/'),
        sizes: urlData.urls,
        metadata
      }

      return result

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Upload failed'
      setError(message)
      throw err
    } finally {
      setUploading(false)
    }
  }, [])

  return { upload, uploading, progress, error, reset }
}

/**
 * Generate presigned URLs from Edge Function
 */
async function generateUploadUrls(
  token: string,
  bucket: 'photos' | 'posts'
): Promise<{ data: any; error: string | null }> {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-upload-url`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ bucket })
      }
    )

    if (!response.ok) {
      const error = await response.json()
      return { data: null, error: error.message || 'Failed to generate URLs' }
    }

    const data = await response.json()
    return { data, error: null }
  } catch (err: any) {
    return { data: null, error: err.message }
  }
}

/**
 * Upload blob with progress tracking & retry logic
 */
async function uploadBlobWithProgress(
  blob: Blob,
  url: string,
  options: {
    signal?: AbortSignal
    onProgress?: (percent: number) => void
    maxRetries?: number
  }
): Promise<void> {
  const { signal, onProgress, maxRetries = 3 } = options

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      if (signal?.aborted) {
        throw new DOMException('Aborted', 'AbortError')
      }

      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest()

        // Progress tracking
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            onProgress?.((e.loaded / e.total) * 100)
          }
        })

        // Success
        xhr.addEventListener('load', () => {
          if (xhr.status === 200) {
            resolve()
          } else {
            reject(new Error(`Upload failed: ${xhr.status}`))
          }
        })

        // Error
        xhr.addEventListener('error', () =>
          reject(new Error('Network error'))
        )

        xhr.addEventListener('abort', () =>
          reject(new DOMException('Aborted', 'AbortError'))
        )

        // Open & send
        xhr.open('PUT', url)
        xhr.setRequestHeader('Content-Type', 'image/webp')
        xhr.send(blob)
      })

      return // Success
    } catch (err) {
      if (attempt === maxRetries - 1) {
        throw err // Final attempt failed
      }

      // Exponential backoff: 1s, 2s, 4s
      const delay = Math.pow(2, attempt) * 1000
      await new Promise(r => setTimeout(r, delay))
    }
  }
}

/**
 * Get image metadata from blob
 */
async function getImageMetadata(blob: Blob): Promise<{
  width: number
  height: number
  fileSize: number
  fileType: string
}> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight,
        fileSize: blob.size,
        fileType: blob.type
      })
      URL.revokeObjectURL(img.src)
    }
    img.onerror = reject
    img.src = URL.createObjectURL(blob)
  })
}

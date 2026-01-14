# Phase 5: React Hooks Implementation

**Status**: `pending`
**Duration**: 3 hours
**Dependencies**: Phase 3 (Edge Functions), Phase 4 (Image Optimization)

---

## Objectives

Create React hooks for S3 upload with presigned URLs, progress tracking, resumable uploads, error handling, and retry logic.

---

## Prerequisites

- Edge Functions deployed
- Image optimization utilities working
- Supabase auth configured

---

## Tasks

### 5.1 Create Core S3 Upload Hook (120 min)

**File**: `src/hooks/use-s3-upload.ts`

```typescript
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
      const { data: { urls, uuid }, error: urlError } = await generateUploadUrls(
        session.access_token,
        options.bucket
      )

      if (urlError) throw new Error(urlError)
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
            urls[name as keyof typeof urls].url,
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
        uuid,
        s3Key: urls.large.key,
        cdnUrl: `https://images.dynamite.vn/${urls.large.key}`,
        sizes: urls,
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
  } catch (err) {
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
```

---

### 5.2 Create Resumable Upload Hook (Optional - 30 min)

**File**: `src/hooks/use-resumable-upload.ts`

```typescript
import { useState, useCallback } from 'react'

interface UploadState {
  uploadId: string
  file: File
  bucket: 'photos' | 'posts'
  uploadedParts: number[]
  totalParts: number
}

export function useResumableUpload() {
  const [state, setState] = useState<UploadState | null>(null)

  // Save to IndexedDB
  const saveState = useCallback((uploadState: UploadState) => {
    const key = `upload-${uploadState.uploadId}`
    localStorage.setItem(key, JSON.stringify(uploadState))
    setState(uploadState)
  }, [])

  // Load from IndexedDB
  const loadState = useCallback((uploadId: string): UploadState | null => {
    const key = `upload-${uploadId}`
    const data = localStorage.getItem(key)
    if (!data) return null

    const uploadState = JSON.parse(data) as UploadState
    setState(uploadState)
    return uploadState
  }, [])

  // Clear state
  const clearState = useCallback((uploadId: string) => {
    const key = `upload-${uploadId}`
    localStorage.removeItem(key)
    setState(null)
  }, [])

  return { state, saveState, loadState, clearState }
}
```

---

### 5.3 Update Existing use-upload Hook (30 min)

**File**: `src/hooks/use-upload.ts`

**Update to use S3 while maintaining compatibility**:

```typescript
import { useState } from "react"
import { useS3Upload } from "./use-s3-upload"
import imageCompression from "browser-image-compression"
import { supabase } from "@/lib/supabase"

type Bucket = "post-images" | "photos"

interface UploadOptions {
  maxSizeMB?: number
  maxWidthOrHeight?: number
  path?: string
}

interface UseUploadReturn {
  upload: (file: File, options?: UploadOptions) => Promise<string>
  uploading: boolean
  progress: number
  error: string | null
}

// Feature flag for S3 migration
const USE_S3 = import.meta.env.VITE_USE_S3 === 'true'

export function useUpload(bucket: Bucket): UseUploadReturn {
  // Use S3 hook if enabled
  const s3Upload = useS3Upload()
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const upload = async (file: File, options?: UploadOptions): Promise<string> => {
    setUploading(true)
    setProgress(0)
    setError(null)

    try {
      if (USE_S3) {
        // S3 upload path
        const result = await s3Upload.upload(file, {
          bucket: bucket as 'photos' | 'posts',
          onProgress: setProgress
        })

        return result.cdnUrl
      } else {
        // Legacy Supabase Storage path
        const compressed = await imageCompression(file, {
          maxSizeMB: options?.maxSizeMB ?? 0.8,
          maxWidthOrHeight: options?.maxWidthOrHeight ?? 1920,
          useWebWorker: true,
          onProgress: (p) => setProgress(10 + p * 0.4),
        })

        const ext = file.name.split(".").pop() || "jpg"
        const filename = options?.path || `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

        const { error: uploadError } = await supabase.storage
          .from(bucket)
          .upload(filename, compressed, {
            cacheControl: "3600",
            upsert: false,
          })

        if (uploadError) throw uploadError

        const { data: urlData } = supabase.storage
          .from(bucket)
          .getPublicUrl(filename)

        setProgress(100)
        return urlData.publicUrl
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Upload failed"
      setError(message)
      throw err
    } finally {
      setUploading(false)
    }
  }

  return { upload, uploading, progress, error }
}

export function useDeleteFile(bucket: Bucket) {
  const [deleting, setDeleting] = useState(false)

  const deleteFile = async (path: string): Promise<void> => {
    setDeleting(true)
    try {
      if (USE_S3) {
        // Delete from S3 via Edge Function
        const { data: { session } } = await supabase.auth.getSession()
        await fetch('/.netlify/functions/delete-s3-object', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
          },
          body: JSON.stringify({ s3Key: path })
        })
      } else {
        // Legacy Supabase Storage delete
        const { error } = await supabase.storage.from(bucket).remove([path])
        if (error) throw error
      }
    } finally {
      setDeleting(false)
    }
  }

  return { deleteFile, deleting }
}
```

---

### 5.4 Add Environment Variable (5 min)

**Update** `.env`:
```bash
# Feature flag for S3 migration
VITE_USE_S3=false  # Set to true after migration complete
```

---

## Verification Checklist

- [ ] S3 upload hook created
- [ ] File validation works (2MB limit)
- [ ] Presigned URLs fetched successfully
- [ ] Image optimization completes
- [ ] All 3 sizes upload to S3
- [ ] Progress tracking accurate (0-100%)
- [ ] Retry logic works (3 attempts)
- [ ] Exponential backoff works
- [ ] Abort controller works
- [ ] Legacy hook updated
- [ ] Feature flag works
- [ ] Error handling comprehensive
- [ ] TypeScript types correct

---

## Testing

**Manual test**:
```typescript
const { upload, uploading, progress } = useS3Upload()

const handleUpload = async (file: File) => {
  try {
    const result = await upload(file, {
      bucket: 'photos',
      onProgress: (p) => console.log(`Progress: ${p}%`)
    })

    console.log('Upload complete:', result.cdnUrl)
    console.log('S3 key:', result.s3Key)
    console.log('Sizes:', result.sizes)
    console.log('Metadata:', result.metadata)
  } catch (error) {
    console.error('Upload failed:', error)
  }
}
```

---

## Next Phase

Once hooks are implemented and tested, proceed to **Phase 6: Component Integration**.

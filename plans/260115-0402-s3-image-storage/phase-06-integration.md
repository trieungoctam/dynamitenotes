# Phase 6: Component Integration

**Status**: `pending`
**Duration**: 2 hours
**Dependencies**: Phase 5 (React Hooks)

---

## Objectives

Update existing components to use the new S3 upload hook, update database save logic to include S3 metadata, and update delete logic.

---

## Prerequisites

- `use-s3-upload` hook working
- Database migration applied
- Edge Functions deployed

---

## Tasks

### 6.1 Update PhotosAdmin Component (30 min)

**File**: `src/pages/admin/PhotosAdmin.tsx`

**Changes**:
1. Import new hook
2. Update save logic to include S3 metadata
3. Update progress display

```typescript
// Add import
import { useS3Upload } from '@/hooks/use-s3-upload'

// In component
const { upload, uploading, progress } = useS3Upload()

// Update upload handler
const handlePhotoUpload = async (files: FileList) => {
  const fileArray = Array.from(files)

  for (const file of fileArray) {
    try {
      // Upload to S3
      const result = await upload(file, {
        bucket: 'photos',
        onProgress: (p) => setUploadProgress(p)
      })

      // Save to database with S3 metadata
      await createPhoto.mutateAsync({
        album: uploadAlbum,
        url: result.cdnUrl,
        s3Key: result.s3Key,
        s3Bucket: 'dynamite-notes-images',
        cdnUrl: result.cdnUrl,
        fileSize: result.metadata.fileSize,
        fileType: result.metadata.fileType,
        width: result.metadata.width,
        height: result.metadata.height,
        captionVi: "",
        captionEn: "",
      })

      // Refresh list
      await refetch()
    } catch (error) {
      console.error('Upload failed:', error)
      // Show error toast
    }
  }
}
```

---

### 6.2 Update PostEditor Component (30 min)

**File**: `src/pages/admin/PostEditor.tsx`

**Changes**:
1. Update cover image upload
2. Update inline image upload (markdown editor)

```typescript
// Add import
import { useS3Upload } from '@/hooks/use-s3-upload'

// In component
const { upload: uploadImage } = useS3Upload()

// Cover image upload handler
const handleCoverImageUpload = async (file: File) => {
  try {
    const result = await uploadImage(file, {
      bucket: 'posts',
      onProgress: (p) => setCoverUploadProgress(p)
    })

    // Update form data
    updateField('cover_image', result.cdnUrl)
    updateField('cover_image_s3_key', result.s3Key)
    updateField('cover_image_cdn_url', result.cdnUrl)
    updateField('cover_image_file_size', result.metadata.fileSize)
    updateField('cover_image_width', result.metadata.width)
    updateField('cover_image_height', result.metadata.height)
  } catch (error) {
    console.error('Cover image upload failed:', error)
  }
}

// Inline image upload (for markdown editor)
const handleInlineImageUpload = async (file: File): Promise<string> => {
  const result = await uploadImage(file, { bucket: 'posts' })
  return result.cdnUrl
}
```

---

### 6.3 Update PhotoUploadModal Component (20 min)

**File**: `src/components/admin/PhotoUploadModal.tsx`

**Changes**:
1. Replace direct Supabase upload with S3 hook
2. Update status tracking

```typescript
// Before (direct Supabase)
const { error: uploadError } = await supabase.storage
  .from("photos")
  .upload(filePath, fileData.file)

// After (S3 hook)
import { useS3Upload } from '@/hooks/use-s3-upload'

const { upload } = useS3Upload()

const result = await upload(fileData.file, {
  bucket: 'photos',
  onProgress: (p) => {
    setFileStatus(fileData.id, {
      status: 'uploading',
      progress: p
    })
  }
})

// Use CDN URL for database save
const publicUrl = result.cdnUrl
```

---

### 6.4 Update use-admin-photos Hook (20 min)

**File**: `src/hooks/use-admin-photos.ts`

**Changes**:
1. Update delete logic to remove from S3
2. Call Edge Function for deletion

```typescript
// Update deletePhoto function
const deletePhoto = async (id: string) => {
  // 1. Get photo record
  const photo = photos.find(p => p.id === id)
  if (!photo) return

  // 2. Delete from database
  const { error } = await supabase.from("photos").delete().eq("id", id)
  if (error) throw error

  // 3. Delete from S3 (if has s3Key)
  if (photo.s3Key) {
    const { data: { session } } = await supabase.auth.getSession()

    await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/delete-s3-object`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ s3Key: photo.s3Key })
      }
    )
  } else {
    // Legacy: Delete from Supabase Storage
    const url = new URL(photo.url)
    const pathMatch = url.pathname.match(/\/storage\/v1\/object\/public\/photos\/(.+)/)
    if (pathMatch) {
      await supabase.storage.from("photos").remove([pathMatch[1]])
    }
  }

  await refetch()
}
```

---

### 6.5 Update MediaUpload Component (20 min)

**File**: `src/components/admin/MediaUpload.tsx`

**Changes**:
1. Switch to use `use-s3-upload`
2. Update props interface if needed

```typescript
// Replace use-media-upload with use-s3-upload
import { useS3Upload } from '@/hooks/use-s3-upload'

// In component
const { upload, uploading, progress } = useS3Upload()

const handleDrop = async (acceptedFiles: File[]) => {
  const file = acceptedFiles[0]

  try {
    const result = await upload(file, {
      bucket: 'posts',
      onProgress: (p) => setProgress(p)
    })

    onUpload(result.cdnUrl, result.s3Key)
  } catch (error) {
    console.error('Upload failed:', error)
  }
}
```

---

### 6.6 Update TypeScript Types (10 min)

**File**: `src/types/database.types.ts` (auto-generated by Prisma)

**Or manually extend types**:

```typescript
// Add S3 fields to Photo type
interface Photo {
  id: string
  url: string
  s3Key: string | null
  s3Bucket: string | null
  cdnUrl: string | null
  fileSize: bigint | null
  fileType: string | null
  width: number | null
  height: number | null
  // ... rest of fields
}

// Add S3 fields to Post type
interface Post {
  // ...
  coverImageS3Key: string | null
  coverImageCdnUrl: string | null
  coverImageFileSize: bigint | null
  coverImageWidth: number | null
  coverImageHeight: number | null
  // ... rest of fields
}
```

---

## Verification Checklist

- [ ] PhotosAdmin uploads to S3
- [ ] PhotosAdmin saves S3 metadata to database
- [ ] PostEditor uploads cover images to S3
- [ ] PostEditor inline images work
- [ ] PhotoUploadModal uses S3 hook
- [ ] MediaUpload uses S3 hook
- [ ] Delete removes S3 objects
- [ ] Legacy Supabase images still work
- [ ] Progress tracking displays correctly
- [ ] Error handling works
- [ ] All components TypeScript compile

---

## Testing

**Test each component**:

1. **PhotosAdmin**:
   - Upload single photo
   - Upload multiple photos
   - Verify all 3 sizes created
   - Check database for S3 fields
   - Delete photo (check S3)

2. **PostEditor**:
   - Upload cover image
   - Insert inline image
   - Save post with images
   - Verify CDN URLs

3. **MediaUpload**:
   - Drag & drop upload
   - Progress display
   - Remove & re-upload

---

## Rollback Strategy

**If issues occur**:
1. Set `VITE_USE_S3=false` in `.env`
2. Deploy rollback
3. System reverts to Supabase Storage
4. Investigate and fix issues
5. Re-enable S3 when ready

---

## Next Phase

Once components are integrated, proceed to **Phase 7: Testing & QA**.

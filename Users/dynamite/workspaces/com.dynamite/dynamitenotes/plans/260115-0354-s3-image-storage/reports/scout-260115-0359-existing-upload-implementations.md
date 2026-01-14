# Scout Report: Existing Upload Implementations

**Date**: 2026-01-15
**Agent**: Scout
**Target**: Codebase upload infrastructure analysis for S3 migration

---

## Executive Summary

Found **7 upload-related files** using Supabase Storage. Current implementation uses browser compression + Supabase Storage with public URLs. Architecture is straightforward but requires replacement for S3 migration.

**Key Findings**:
- 2 upload hooks with overlapping functionality
- 3 admin pages consuming upload functionality
- Clean separation of concerns (hooks → components → pages)
- Direct Supabase Storage usage (no abstraction layer)
- Image compression already implemented

---

## Current Upload Architecture

### Storage Provider
**Supabase Storage** - Current implementation
- Buckets: `post-images`, `photos`, `post-media`
- Access: Public URLs via `getPublicUrl()`
- Auth: Supabase Auth integration

### Upload Flow
```
User selects file
  ↓
Browser compresses (browser-image-compression)
  ↓
Direct upload to Supabase Storage
  ↓
Get public URL
  ↓
Save URL to database
```

---

## File Inventory

### 1. Upload Hooks

#### `/src/hooks/use-upload.ts` ⭐ PRIMARY
**Purpose**: Core upload hook for photos & post images
**Bucket Support**: `"post-images" | "photos"`
**Features**:
- Image compression (max 800KB, 1920px)
- Progress tracking (0-100%)
- Unique filename generation
- Public URL generation
- Error handling

**Signature**:
```typescript
export function useUpload(bucket: Bucket): UseUploadReturn

interface UploadOptions {
  maxSizeMB?: number;
  maxWidthOrHeight?: number;
  path?: string;
}
```

**Used By**:
- `PhotosAdmin.tsx` (line 53)
- `PostEditor.tsx` (line 87, 152)

**Dependencies**:
- `browser-image-compression` - Client-side compression
- `@supabase/supabase-js` - Storage client

---

#### `/src/hooks/use-media-upload.ts` ⭐ DUPLICATE
**Purpose**: Alternative upload hook with drag-drop support
**Bucket Support**: `"post-media"` (configurable)
**Features**:
- Compression (1MB max, 1920px default)
- Signed URL generation (1 year expiry)
- File size validation (5MB default)
- Progress tracking
- Remove functionality

**Key Difference**: Uses **signed URLs** instead of public URLs

**Used By**:
- `MediaUpload.tsx` component

**Note**: Overlaps significantly with `use-upload.ts`. Consider consolidation.

---

### 2. UI Components

#### `/src/components/admin/MediaUpload.tsx`
**Purpose**: Drag-drop upload component
**Features**:
- react-dropzone integration
- Image preview
- File type validation (PNG, JPG, GIF, WebP, PDF)
- Size limit display
- Upload progress
- Remove functionality

**Supported Formats**: `image/*, application/pdf`
**Max Size**: 5MB default (configurable)

**Props**:
```typescript
interface MediaUploadProps {
  onUpload: (url: string, path: string) => void;
  onRemove: () => void;
  currentUrl?: string;
  currentPath?: string;
  accept?: string;
  maxSize?: number;
  bucket?: string;
}
```

---

#### `/src/components/admin/PhotoUploadModal.tsx`
**Purpose**: Multi-photo upload modal
**Features**:
- Drag & drop support
- Multiple file selection
- Individual file status tracking
- Batch upload with progress
- Auto-close on success

**Status Types**: `"pending" | "uploading" | "success" | "error"`

**Direct Supabase Usage**:
```typescript
// Line 90-92: Direct storage upload
const { error: uploadError } = await supabase.storage
  .from("photos")
  .upload(filePath, fileData.file);

// Line 97-99: Get public URL
const { data: { publicUrl } } = supabase.storage
  .from("photos")
  .getPublicUrl(filePath);
```

---

### 3. Admin Pages

#### `/src/pages/admin/PhotosAdmin.tsx` ⭐ PRIMARY CONSUMER
**Purpose**: Photo gallery management
**Upload Flow** (lines 78-104):
1. Multi-file selection via dialog
2. Sequential upload loop (lines 81-98)
3. Create Photo record after upload (line 88)
4. Progress tracking per file

**Key Code**:
```typescript
const { upload, uploading, progress } = useUpload("photos");

// Upload with custom path
const url = await upload(file, {
  path: `${uploadAlbum}/${Date.now()}-${file.name}`
});

// Create database record
await createPhoto.mutateAsync({
  album: uploadAlbum,
  url,
  caption_vi: "",
  caption_en: "",
});
```

**Features**:
- Album organization
- Caption editing (VI/EN)
- Publish/unpublish
- Delete with storage cleanup

---

#### `/src/pages/admin/PostEditor.tsx` ⭐ PRIMARY CONSUMER
**Purpose**: Blog post editor with cover image & inline images
**Upload Usage** (line 87, 152):
```typescript
const { upload, uploading } = useUpload("post-images");

// Cover image URL input (line 472-479)
<Input
  id="cover_image"
  value={formData.cover_image}
  onChange={(e) => updateField("cover_image", e.target.value)}
  placeholder="https://..."
/>

// Inline image upload for markdown (line 151-154)
const handleImageUpload = async (file: File): Promise<string> => {
  const url = await upload(file);
  return url;
};
```

**Note**: Cover image currently uses **URL input**, not upload component. Opportunity for UX improvement.

---

#### `/src/pages/admin/SeriesEditor.tsx`
**Status**: Uses `use-media-upload.ts` (based on grep results)
**Investigation Needed**: Specific usage pattern not reviewed

---

### 4. Database Hooks

#### `/src/hooks/use-admin-photos.ts`
**Purpose**: CRUD operations for Photo table
**Storage Cleanup** (lines 91-110):
```typescript
// Delete from database
const { error } = await supabase.from("photos").delete().eq("id", id);

// Extract path from URL and delete from storage
if (photo?.url) {
  const url = new URL(photo.url);
  const pathMatch = url.pathname.match(/\/storage\/v1\/object\/public\/photos\/(.+)/);
  if (pathMatch) {
    await supabase.storage.from("photos").remove([pathMatch[1]]);
  }
}
```

**Pattern**: URL parsing → path extraction → storage removal

---

## Database Schema

### Current Schema (Prisma)

#### `Photo` Model
```prisma
model Photo {
  id            String      @id @default(uuid())
  url           String                    // Current: Supabase public URL
  thumbnailUrl  String?     @map("thumbnail_url")
  captionVi     String?     @map("caption_vi")
  captionEn     String?     @map("caption_en")
  album         String?
  sortOrder     Int         @default(0) @map("sort_order")
  published     Boolean     @default(false)
  takenAt       DateTime?   @map("taken_at")
  createdAt     DateTime    @default(now()) @map("created_at")

  @@map("photos")
}
```

#### `Post` Model
```prisma
model Post {
  // ...
  coverImage  String?  @map("cover_image")  // Current: URL string
  // ...
}
```

### Planned S3 Additions (from plan.md)
```sql
-- Photo table additions
ALTER TABLE photos
  ADD COLUMN s3_key VARCHAR(255),
  ADD COLUMN s3_bucket VARCHAR(100),
  ADD COLUMN s3_region VARCHAR(50) DEFAULT 'ap-southeast-1',
  ADD COLUMN cdn_url VARCHAR(500),
  ADD COLUMN file_size BIGINT,
  ADD COLUMN file_type VARCHAR(50),
  ADD COLUMN width INTEGER,
  ADD COLUMN height INTEGER;

-- Post table additions
ALTER TABLE posts
  ADD COLUMN cover_image_s3_key VARCHAR(255),
  ADD COLUMN cover_image_cdn_url VARCHAR(500),
  ADD COLUMN cover_image_file_size BIGINT,
  ADD COLUMN cover_image_width INTEGER,
  ADD COLUMN cover_image_height INTEGER;
```

---

## Environment Configuration

### Current Variables
**`.env.production.example`**:
```bash
# Supabase (Auth + Storage)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

**No AWS/S3 variables configured yet.**

### Supabase Client
**`/src/lib/supabase.ts`**:
```typescript
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient<Database>(
  supabaseUrl || "https://placeholder.supabase.co",
  supabaseAnonKey || "placeholder-key",
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  }
);
```

**Usage Pattern**: Direct import in hooks/components
```typescript
import { supabase } from "@/lib/supabase";

await supabase.storage.from("photos").upload(path, file);
```

---

## Image Compression Settings

### Current Configuration
**`use-upload.ts`** (line 38-43):
```typescript
const compressed = await imageCompression(file, {
  maxSizeMB: options?.maxSizeMB ?? 0.8,      // 800KB
  maxWidthOrHeight: options?.maxWidthOrHeight ?? 1920,
  useWebWorker: true,
  onProgress: (p) => setProgress(10 + p * 0.4),
});
```

**`use-media-upload.ts`** (line 45-50):
```typescript
fileToUpload = await imageCompression(file, {
  maxSizeMB: 1,                               // 1MB
  maxWidthOrHeight: options.maxWidth || 1920,
  useWebWorker: true,
  quality: options.quality || 0.8,
});
```

**Note**: Inconsistent limits (800KB vs 1MB). Should standardize.

---

## Supabase Storage Usage Patterns

### Pattern 1: Direct Upload + Public URL
```typescript
// Upload
const { error } = await supabase.storage
  .from(bucket)
  .upload(filename, file);

// Get public URL
const { data: { publicUrl } } = supabase.storage
  .from(bucket)
  .getPublicUrl(filename);
```

**Used In**: `use-upload.ts`, `PhotoUploadModal.tsx`

---

### Pattern 2: Signed URL (Private Bucket)
```typescript
// Upload
const { data } = await supabase.storage
  .from(bucket)
  .upload(path, file);

// Generate signed URL
const { data: signedData } = await supabase.storage
  .from(bucket)
  .createSignedUrl(path, 60 * 60 * 24 * 365); // 1 year
```

**Used In**: `use-media-upload.ts`

---

### Pattern 3: Storage Cleanup on Delete
```typescript
// Extract path from URL
const url = new URL(photo.url);
const pathMatch = url.pathname.match(
  /\/storage\/v1\/object\/public\/photos\/(.+)/
);

// Remove from storage
if (pathMatch) {
  await supabase.storage.from("photos").remove([pathMatch[1]]);
}
```

**Used In**: `use-admin-photos.ts`

---

## Dependencies Analysis

### Current Upload Stack
```json
{
  "@supabase/supabase-js": "^2.90.1",        // Storage client
  "browser-image-compression": "^2.0.2",     // Client compression
  "react-dropzone": "^14.3.8"                // Drag-drop UI
}
```

### Required for S3 Migration
```json
{
  "@aws-sdk/client-s3": "^3.450.0",          // S3 client (Edge Function)
  "@aws-sdk/s3-request-presigner": "^3.450.0" // Presigned URLs (Edge Function)
}
```

**Note**: AWS SDK only needed in **Edge Functions**, not browser.

---

## Reusable Patterns

### ✅ Keep for S3 Migration

1. **Image Compression**
   - Already optimized for web (800KB-1MB, 1920px)
   - Browser-side reduces bandwidth
   - WebWorker prevents UI blocking

2. **Progress Tracking**
   - Upload state management
   - User feedback patterns
   - Error handling

3. **File Validation**
   - Type checking (`image/*`)
   - Size limits
   - Multi-file support

4. **Database-Storage Separation**
   - Upload → Get URL → Save to DB
   - Delete cascade (DB → Storage)
   - Transactional safety

### ❌ Replace for S3 Migration

1. **Supabase Storage Calls**
   ```typescript
   // OLD
   await supabase.storage.from("photos").upload(path, file);
   
   // NEW (via Edge Function)
   const { uploadUrl } = await fetchPresignedUrl();
   await fetch(uploadUrl, { method: "PUT", body: file });
   ```

2. **Public URL Generation**
   ```typescript
   // OLD
   const { data: { publicUrl } } = supabase.storage
     .from("photos").getPublicUrl(filename);
   
   // NEW
   const cdnUrl = `https://${cloudFrontDomain}/${s3Key}`;
   ```

3. **Storage Cleanup Pattern**
   ```typescript
   // OLD (URL parsing)
   const path = url.pathname.match(/\/storage\/v1\/object\/public\/photos\/(.+)/);
   await supabase.storage.from("photos").remove([path]);
   
   // NEW (database field)
   await fetch(deleteS3ObjectUrl, { 
     method: "POST", 
     body: JSON.stringify({ s3Key: photo.s3Key }) 
   });
   ```

---

## Migration Strategy

### Phase 1: Dual-Write Pattern (Recommended)
1. Add S3 fields to database (non-breaking)
2. **Write to both** Supabase Storage + S3 during transition
3. **Read from S3** if available, fallback to Supabase
4. Migrate existing URLs to S3 via script
5. Switch to S3-only after validation

### Phase 2: Hook Replacement
**Target Files**:
- `/src/hooks/use-upload.ts` → Replace with S3 presigned URL logic
- `/src/hooks/use-media-upload.ts` → Consolidate into `use-upload.ts`
- `/src/hooks/use-admin-photos.ts` → Update delete logic

**New Hook Signature** (keep compatible):
```typescript
export function useUpload(
  bucket: 'photos' | 'posts' | 'profile'
): UseUploadReturn {
  // Fetch presigned URL from Edge Function
  // Upload directly to S3
  // Return CDN URL + metadata
  // Save to database
}
```

### Phase 3: Component Updates
**Minimal Changes Needed**:
- `PhotosAdmin.tsx` - No UI changes, just new hook behavior
- `PostEditor.tsx` - No UI changes
- `MediaUpload.tsx` - No changes
- `PhotoUploadModal.tsx` - Update to use new hook

---

## Unresolved Questions

1. **`SeriesEditor.tsx` upload usage** - Needs investigation
2. **`About` page profile photo** - Not found in search, planned for S3?
3. **Signed URL vs Public URL** - Why 2 approaches? Which for S3?
4. **Compression standardization** - 800KB or 1MB?
5. **Edge Function auth** - Supabase Auth or custom?
6. **CORS configuration** - S3 bucket CORS needed for browser uploads?
7. **Migration timeline** - Big bang or phased?
8. **Fallback strategy** - What if S3 upload fails?

---

## Recommendations

1. **Consolidate Upload Hooks**
   - Merge `use-upload.ts` + `use-media-upload.ts`
   - Single source of truth for upload logic
   - Easier to maintain and test

2. **Add Abstraction Layer**
   - Create `src/lib/storage.ts` with interface
   - Swap implementations (Supabase ↔ S3) without UI changes
   - Better testing

3. **Standardize Compression**
   - Pick one limit (800KB recommended)
   - Document decision in code comments
   - Add config object for easy adjustment

4. **Preserve User Experience**
   - Keep progress tracking
   - Keep error messages
   - Keep multi-file upload
   - Keep drag-drop UI

5. **Database First**
   - Run migration before code changes
   - Add S3 fields as nullable
   - Populate with default values if needed

---

## Next Steps

For **Implementer** agent:

1. Create database migration for S3 fields
2. Set up S3 bucket + CloudFront
3. Create Supabase Edge Functions (`generate-presigned-url`, `delete-s3-object`)
4. Implement new `use-upload.ts` with S3 logic
5. Update `use-admin-photos.ts` delete logic
6. Test in dev environment
7. Deploy to production

For **Debugger** agent:

1. Investigate `SeriesEditor.tsx` upload usage
2. Verify `About` page profile photo implementation
3. Research signed URL vs public URL use case
4. Plan migration strategy (dual-write vs direct)

---

**Report End**

**Generated**: 2026-01-15 03:59 UTC
**Files Analyzed**: 7 upload-related files
**Lines of Code**: ~1,200 (upload logic only)
**Estimated Migration Effort**: 12-16h (matches plan estimate)

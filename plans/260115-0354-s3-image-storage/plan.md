---
title: "AWS S3 Image Storage System"
description: "Implement direct browser uploads to S3 with presigned URLs for photos, post covers, and profile images"
status: pending
priority: P1
effort: 12h
branch: main
tags: [s3, storage, upload, images, aws]
created: 2026-01-15
---

# AWS S3 Image Storage System - Implementation Plan

## Overview
Replace Supabase Storage with AWS S3 for image storage. Use presigned URLs for direct browser uploads, store S3 URLs in database, and support multiple image types (photos, post covers, profile photo).

## Current State Analysis

### Existing Infrastructure
- **Storage**: Supabase Storage (`post-images`, `photos` buckets)
- **Upload Hook**: `useUpload` in `/src/hooks/use-upload.ts`
- **Image Handling**: Browser compression via `browser-image-compression`
- **Admin Pages**:
  - `PhotosAdmin.tsx` - Photo gallery uploads
  - `PostsAdmin.tsx` - Post management (cover images)
  - `AboutAdmin.tsx` - Profile photo (via `AboutEditForm`)
- **Database Schema**:
  - `Photo` table: `url`, `thumbnail_url` fields
  - `Post` table: `cover_image` field
  - `About` table: Needs profile photo field

### Technical Stack
- React 18 + TypeScript
- Supabase (PostgreSQL + Auth)
- TanStack Query for data fetching
- Vite build system

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Browser Upload Flow                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. User selects file                                        │
│  2. Client compresses image (browser-image-compression)      │
│  3. Client requests presigned URL from Edge Function         │
│  4. Edge Function validates & generates presigned URL        │
│  5. Client uploads directly to S3 using presigned URL        │
│  6. Client saves S3 URL to database via Supabase             │
│                                                              │
└─────────────────────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────┐
│                    Supabase Edge Function                    │
├─────────────────────────────────────────────────────────────┤
│  - Validates user authentication (Supabase Auth)            │
│  - Generates S3 presigned URL (AWS SDK v3)                   │
│  - Enforces upload limits (file size, type)                  │
│  - Returns presigned URL + upload ID                         │
└─────────────────────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────┐
│                         AWS S3                               │
├─────────────────────────────────────────────────────────────┤
│  - Private bucket (no public access)                         │
│  - CloudFront CDN for public reads                           │
│  - Lifecycle rules for cost optimization                     │
│  - CORS configuration for browser uploads                    │
└─────────────────────────────────────────────────────────────┘
```

## Implementation Phases

### Phase 1: AWS S3 Setup (2h)

#### 1.1 S3 Bucket Configuration
```bash
# Bucket naming
dynamitenotes-{env}-images  # e.g., dynamitenotes-prod-images

# Bucket settings
- Block public access: ENABLED (access via CloudFront only)
- Versioning: ENABLED
- Default encryption: SSE-S3 or SSE-KMS
- Object lock: DISABLED
```

#### 1.2 Bucket Policy (for CloudFront access)
```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Sid": "AllowCloudFrontServicePrincipal",
    "Effect": "Allow",
    "Principal": {
      "Service": "cloudfront.amazonaws.com"
    },
    "Action": "s3:GetObject",
    "Resource": "arn:aws:s3:::dynamitenotes-prod-images/*",
    "Condition": {
      "StringEquals": {
        "AWS:SourceArn": "CLOUDFRONT_DISTRIBUTION_ARN"
      }
    }
  }]
}
```

#### 1.3 CORS Configuration
```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["PUT", "POST"],
    "AllowedOrigins": ["https://yourdomain.com"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3000
  }
]
```

#### 1.4 CloudFront Distribution
```yaml
Origin: S3 bucket (OAI or OAC)
Behaviors:
  - Allowed HTTP Methods: GET, HEAD, OPTIONS
  - Cache policy: CachingOptimized
  - Origin request policy: CORS-S3Origin
  - Compress: Yes
Alternate domain names: images.yourdomain.com
Custom SSL/TLS certificate
```

#### 1.5 Lifecycle Rules
```yaml
# Abort incomplete multipart uploads after 1 day
# Transition non-current versions to IA after 30 days
# Delete non-current versions after 90 days
```

**Deliverables**:
- S3 bucket created
- CloudFront distribution deployed
- CORS configuration applied
- Bucket policy in place
- Security checklist completed

---

### Phase 2: Database Schema Updates (1h)

#### 2.1 Add S3 Metadata Fields

**Migration: `prisma/migrations/xxx_add_s3_metadata.sql`**
```sql
-- Add S3-specific fields to Photo table
ALTER TABLE photos
  ADD COLUMN s3_key VARCHAR(255),
  ADD COLUMN s3_bucket VARCHAR(100),
  ADD COLUMN s3_region VARCHAR(50) DEFAULT 'ap-southeast-1',
  ADD COLUMN cdn_url VARCHAR(500),
  ADD COLUMN file_size BIGINT,
  ADD COLUMN file_type VARCHAR(50),
  ADD COLUMN width INTEGER,
  ADD COLUMN height INTEGER;

-- Add S3 fields to Post table for cover images
ALTER TABLE posts
  ADD COLUMN cover_image_s3_key VARCHAR(255),
  ADD COLUMN cover_image_cdn_url VARCHAR(500),
  ADD COLUMN cover_image_file_size BIGINT,
  ADD COLUMN cover_image_width INTEGER,
  ADD COLUMN cover_image_height INTEGER;

-- Add profile photo to About table
ALTER TABLE about
  ADD COLUMN profile_photo_url VARCHAR(500),
  ADD COLUMN profile_photo_s3_key VARCHAR(255),
  ADD COLUMN profile_photo_cdn_url VARCHAR(500);

-- Create index for faster queries
CREATE INDEX idx_photos_s3_key ON photos(s3_key);
CREATE INDEX idx_posts_cover_s3_key ON posts(cover_image_s3_key);
```

#### 2.2 Update Prisma Schema
```prisma
model Photo {
  id            String      @id @default(uuid())
  url           String
  cdnUrl        String?     @map("cdn_url")
  s3Key         String?     @map("s3_key")
  s3Bucket      String?     @map("s3_bucket")
  s3Region      String?     @map("s3_region")
  fileSize      Int?        @map("file_size")
  fileType      String?     @map("file_type")
  width         Int?
  height        Int?
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

model Post {
  // ... existing fields ...
  coverImage           String?   @map("cover_image")
  coverImageCdnUrl     String?   @map("cover_image_cdn_url")
  coverImageS3Key      String?   @map("cover_image_s3_key")
  coverImageFileSize   Int?      @map("cover_image_file_size")
  coverImageWidth      Int?      @map("cover_image_width")
  coverImageHeight     Int?      @map("cover_image_height")
  // ... rest of fields ...
}

model About {
  // ... existing fields ...
  profilePhotoUrl      String?   @map("profile_photo_url")
  profilePhotoS3Key    String?   @map("profile_photo_s3_key")
  profilePhotoCdnUrl   String?   @map("profile_photo_cdn_url")
  // ... rest of fields ...
}
```

**Deliverables**:
- Database migration created and applied
- Prisma schema updated
- Migration tested in dev environment

---

### Phase 3: Environment Configuration (0.5h)

#### 3.1 Environment Variables

**`.env.local`** (local development)
```bash
# AWS S3 Configuration
VITE_AWS_S3_BUCKET=dynamitenotes-dev-images
VITE_AWS_S3_REGION=ap-southeast-1
VITE_AWS_CLOUDFRONT_DOMAIN=dxxxxxxxx.cloudfront.net

# Supabase (existing)
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

**`.env.production`** (production)
```bash
# AWS S3 Configuration
VITE_AWS_S3_BUCKET=dynamitenotes-prod-images
VITE_AWS_S3_REGION=ap-southeast-1
VITE_AWS_CLOUDFRONT_DOMAIN=images.yourdomain.com
```

**Supabase Edge Function Secrets** (set via CLI)
```bash
supabase secrets set AWS_S3_BUCKET_NAME=dynamitenotes-prod-images
supabase secrets set AWS_S3_REGION=ap-southeast-1
supabase secrets set AWS_ACCESS_KEY_ID=your_access_key
supabase secrets set AWS_SECRET_ACCESS_KEY=your_secret_key
```

#### 3.2 TypeScript Types

**`src/types/s3.ts`**
```typescript
export interface S3Config {
  bucket: string;
  region: string;
  cloudFrontDomain: string;
}

export interface S3UploadOptions {
  maxSizeMB?: number;
  maxWidthOrHeight?: number;
  folder?: 'photos' | 'posts' | 'profile';
}

export interface S3UploadResult {
  url: string;
  cdnUrl: string;
  s3Key: string;
  fileSize: number;
  width: number;
  height: number;
  fileType: string;
}

export interface PresignedUrlResponse {
  uploadUrl: string;
  s3Key: string;
  cdnUrl: string;
}

export const S3_CONFIG: S3Config = {
  bucket: import.meta.env.VITE_AWS_S3_BUCKET,
  region: import.meta.env.VITE_AWS_S3_REGION,
  cloudFrontDomain: import.meta.env.VITE_AWS_CLOUDFRONT_DOMAIN,
};
```

**Deliverables**:
- Environment variables configured
- TypeScript types defined
- Secret management documented

---

### Phase 4: Supabase Edge Function (2h)

#### 4.1 Create Edge Function

**`supabase/functions/generate-presigned-url/index.ts`**
```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { S3Client, PutObjectCommand } from 'https://esm.sh/@aws-sdk/client-s3@3.450.0'
import { getSignedUrl } from 'https://esm.sh/@aws-sdk/s3-request-presigner@3.450.0'

const s3Client = new S3Client({
  region: Deno.env.get('AWS_S3_REGION')!,
  credentials: {
    accessKeyId: Deno.env.get('AWS_ACCESS_KEY_ID')!,
    secretAccessKey: Deno.env.get('AWS_SECRET_ACCESS_KEY')!,
  },
})

interface GenerateUrlRequest {
  filename: string;
  contentType: string;
  folder: 'photos' | 'posts' | 'profile';
}

serve(async (req) => {
  try {
    // Verify user is authenticated
    const authHeader = req.headers.get('Authorization')!
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (authError || !user) {
      return new Response('Unauthorized', { status: 401 })
    }

    // Check if user is admin
    const { data: admin } = await supabase
      .from('admins')
      .select('profile_id')
      .eq('profile_id', user.id)
      .single()

    if (!admin) {
      return new Response('Forbidden', { status: 403 })
    }

    const { filename, contentType, folder }: GenerateUrlRequest = await req.json()

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(contentType)) {
      return new Response('Invalid file type', { status: 400 })
    }

    // Generate unique S3 key
    const ext = filename.split('.').pop()
    const s3Key = `${folder}/${Date.now()}-${crypto.randomUUID()}.${ext}`

    // Generate presigned URL (valid for 5 minutes)
    const command = new PutObjectCommand({
      Bucket: Deno.env.get('AWS_S3_BUCKET_NAME')!,
      Key: s3Key,
      ContentType: contentType,
      CacheControl: 'public, max-age=31536000', // 1 year
    })

    const uploadUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 300, // 5 minutes
    })

    // Generate CDN URL
    const cdnUrl = `https://${Deno.env.get('AWS_CLOUDFRONT_DOMAIN')}/${s3Key}`

    return new Response(
      JSON.stringify({ uploadUrl, s3Key, cdnUrl }),
      {
        headers: { 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    console.error('Error generating presigned URL:', error)
    return new Response('Internal Server Error', { status: 500 })
  }
})
```

#### 4.2 Deploy Edge Function
```bash
supabase functions deploy generate-presigned-url
```

**Deliverables**:
- Edge function created and deployed
- Authentication & authorization working
- Presigned URL generation tested
- Error handling validated

---

### Phase 5: React Hooks for S3 Uploads (2.5h)

#### 5.1 Replace `useUpload` Hook

**`src/hooks/use-s3-upload.ts`**
```typescript
import { useState } from 'react';
import imageCompression from 'browser-image-compression';
import { S3UploadResult, S3UploadOptions, S3_CONFIG } from '@/types/s3';
import { supabase } from '@/lib/supabase';

export function useS3Upload() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const upload = async (
    file: File,
    options?: S3UploadOptions
  ): Promise<S3UploadResult> => {
    setUploading(true);
    setProgress(0);
    setError(null);

    try {
      // Step 1: Compress image (10-50%)
      setProgress(10);
      const compressed = await imageCompression(file, {
        maxSizeMB: options?.maxSizeMB ?? 0.8,
        maxWidthOrHeight: options?.maxWidthOrHeight ?? 1920,
        useWebWorker: true,
        onProgress: (p) => setProgress(10 + p * 0.4),
      });

      // Get image dimensions
      setProgress(50);
      const dimensions = await getImageDimensions(compressed);
      const fileType = compressed.type || file.type;

      // Step 2: Request presigned URL (50-70%)
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-presigned-url`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            filename: file.name,
            contentType: fileType,
            folder: options?.folder || 'photos',
          }),
        }
      );

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to get presigned URL: ${error}`);
      }

      const { uploadUrl, s3Key, cdnUrl } = await response.json();

      // Step 3: Upload to S3 (70-95%)
      setProgress(70);
      await fetch(uploadUrl, {
        method: 'PUT',
        body: compressed,
        headers: {
          'Content-Type': fileType,
        },
      });

      setProgress(95);

      const result: S3UploadResult = {
        url: cdnUrl,
        cdnUrl,
        s3Key,
        fileSize: compressed.size,
        width: dimensions.width,
        height: dimensions.height,
        fileType,
      };

      setProgress(100);
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Upload failed';
      setError(message);
      throw err;
    } finally {
      setUploading(false);
    }
  };

  return { upload, uploading, progress, error };
}

// Helper: Get image dimensions
async function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.width, height: img.height });
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };

    img.src = url;
  });
}
```

#### 5.2 Update Hooks for Image Deletion

**`src/hooks/use-s3-delete.ts`**
```typescript
import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export function useS3Delete() {
  const [deleting, setDeleting] = useState(false);

  const deleteFile = async (s3Key: string): Promise<void> => {
    setDeleting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/delete-s3-object`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ s3Key }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to delete from S3');
      }
    } finally {
      setDeleting(false);
    }
  };

  return { deleteFile, deleting };
}
```

#### 5.3 Create Delete Edge Function

**`supabase/functions/delete-s3-object/index.ts`**
```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { S3Client, DeleteObjectCommand } from 'https://esm.sh/@aws-sdk/client-s3@3.450.0'

const s3Client = new S3Client({
  region: Deno.env.get('AWS_S3_REGION')!,
  credentials: {
    accessKeyId: Deno.env.get('AWS_ACCESS_KEY_ID')!,
    secretAccessKey: Deno.env.get('AWS_SECRET_ACCESS_KEY')!,
  },
})

serve(async (req) => {
  if (req.method !== 'DELETE') {
    return new Response('Method not allowed', { status: 405 })
  }

  try {
    // Auth check (same as generate-presigned-url)
    // ... (auth validation code)

    const { s3Key } = await req.json()

    const command = new DeleteObjectCommand({
      Bucket: Deno.env.get('AWS_S3_BUCKET_NAME')!,
      Key: s3Key,
    })

    await s3Client.send(command)

    return new Response(null, { status: 204 })
  } catch (error) {
    console.error('Error deleting S3 object:', error)
    return new Response('Internal Server Error', { status: 500 })
  }
})
```

**Deliverables**:
- `useS3Upload` hook created
- `useS3Delete` hook created
- Image dimension extraction working
- Error handling comprehensive
- Progress tracking accurate

---

### Phase 6: Update Admin Pages (2.5h)

#### 6.1 Update `PhotosAdmin.tsx`

**Changes**:
1. Replace `useUpload` with `useS3Upload`
2. Store S3 metadata in database
3. Update delete to use `useS3Delete`

```typescript
// In PhotosAdmin.tsx
import { useS3Upload } from '@/hooks/use-s3-upload';
import { useS3Delete } from '@/hooks/use-s3-delete';

const { upload, uploading, progress } = useS3Upload();
const { deleteFile } = useS3Delete();

// In handleUpload:
const s3Result = await upload(file, {
  folder: 'photos',
  maxSizeMB: 1.0,
  maxWidthOrHeight: 1920,
});

await createPhoto.mutateAsync({
  album: uploadAlbum,
  url: s3Result.cdnUrl,
  cdnUrl: s3Result.cdnUrl,
  s3Key: s3Result.s3Key,
  s3Bucket: S3_CONFIG.bucket,
  fileSize: s3Result.fileSize,
  fileType: s3Result.fileType,
  width: s3Result.width,
  height: s3Result.height,
  captionVi: '',
  captionEn: '',
});

// In handleDelete:
await deleteFile(photo.s3Key!);
await deletePhoto.mutateAsync(photo.id);
```

#### 6.2 Update `PostEditor.tsx` (Cover Images)

**Changes**:
1. Add S3 upload for cover images
2. Store S3 metadata
3. Update form to handle S3 uploads

```typescript
// In PostEditor.tsx
import { useS3Upload } from '@/hooks/use-s3-upload';

const { upload: uploadCover, uploading: uploadingCover, progress: coverProgress } = useS3Upload();

const handleCoverUpload = async (file: File) => {
  const s3Result = await uploadCover(file, {
    folder: 'posts',
    maxSizeMB: 0.5,
    maxWidthOrHeight: 1920,
  });

  setFormData(prev => ({
    ...prev,
    coverImage: s3Result.cdnUrl,
    coverImageCdnUrl: s3Result.cdnUrl,
    coverImageS3Key: s3Result.s3Key,
    coverImageFileSize: s3Result.fileSize,
    coverImageWidth: s3Result.width,
    coverImageHeight: s3Result.height,
  }));
};
```

#### 6.3 Update `AboutAdmin.tsx` (Profile Photo)

**Changes**:
1. Add profile photo upload
2. Store S3 metadata

```typescript
// In AboutEditForm.tsx
import { useS3Upload } from '@/hooks/use-s3-upload';

const { upload: uploadProfile, uploading: uploadingProfile } = useS3Upload();

const handleProfilePhotoUpload = async (file: File) => {
  const s3Result = await uploadProfile(file, {
    folder: 'profile',
    maxSizeMB: 0.5,
    maxWidthOrHeight: 500,
  });

  onChange({
    ...data,
    profilePhotoUrl: s3Result.cdnUrl,
    profilePhotoS3Key: s3Result.s3Key,
    profilePhotoCdnUrl: s3Result.cdnUrl,
  });
};
```

**Deliverables**:
- All admin pages updated
- S3 uploads working for all image types
- Database stores S3 metadata
- Delete functionality working
- UI feedback for uploads

---

### Phase 7: Update Public Pages (1h)

#### 7.1 Update Photo Display

**`src/pages/Photos.tsx`**
```typescript
// Use cdnUrl if available, fallback to url
<img src={photo.cdnUrl || photo.url} alt={photo.caption} />
```

#### 7.2 Update Post Display

**`src/pages/PostDetail.tsx`**
```typescript
// Use cdnUrl if available
{post.coverImageCdnUrl || post.coverImage && (
  <img src={post.coverImageCdnUrl || post.coverImage} alt={post.title} />
)}
```

#### 7.3 Update About Page

**`src/pages/About.tsx`**
```typescript
{about.profilePhotoCdnUrl || about.profilePhotoUrl && (
  <img src={about.profilePhotoCdnUrl || about.profilePhotoUrl} alt="Profile" />
)}
```

**Deliverables**:
- Public pages display CDN URLs
- Fallback logic for old URLs
- Images loading from CloudFront

---

### Phase 8: Testing & Validation (1h)

#### 8.1 Testing Checklist

**Functionality Tests**:
- [ ] Upload photo via PhotosAdmin
- [ ] Upload post cover via PostEditor
- [ ] Upload profile photo via AboutAdmin
- [ ] Verify S3 object exists
- [ ] Verify CDN URL works
- [ ] Delete photo from admin
- [ ] Verify S3 object deleted
- [ ] Check database metadata

**Edge Cases**:
- [ ] Large file (>5MB) rejected
- [ ] Invalid file type rejected
- [ ] Network failure during upload
- [ ] Presigned URL expiration
- [ ] Concurrent uploads
- [ ] Non-admin user blocked

**Performance Tests**:
- [ ] Upload 10 photos sequentially
- [ ] Upload 50 photos in batch
- [ ] Measure upload speeds
- [ ] Check CDN cache hit rate

**Security Tests**:
- [ ] Unauthenticated user cannot upload
- [ ] Non-admin cannot upload
- [ ] Presigned URL cannot be reused
- [ ] Bucket blocks public access
- [ ] CORS enforcement

**Deliverables**:
- All tests passing
- Performance benchmarks documented
- Security validation complete

---

### Phase 9: Migration & Cleanup (0.5h)

#### 9.1 Migrate Existing Images

**Script: `scripts/migrate-to-s3.ts`**
```typescript
import { supabase } from '@/lib/supabase';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

// Fetch all existing images from Supabase Storage
// Upload to S3
// Update database with new URLs
// Delete from Supabase Storage
```

#### 9.2 Cleanup

- Remove Supabase Storage buckets
- Remove old `useUpload` hook
- Update documentation
- Remove unused code

**Deliverables**:
- Migration script executed
- Old storage cleaned up
- Codebase updated

---

## Implementation Order

1. **Phase 1**: AWS S3 + CloudFront setup (can be done in parallel)
2. **Phase 2**: Database schema updates
3. **Phase 3**: Environment configuration
4. **Phase 4**: Edge function deployment
5. **Phase 5**: React hooks creation
6. **Phase 6**: Admin pages update (one by one, testing each)
7. **Phase 7**: Public pages update
8. **Phase 8**: Comprehensive testing
9. **Phase 9**: Migration & cleanup

## Dependencies

### External Services
- AWS account with S3 + CloudFront
- AWS IAM user with programmatic access
- Supabase project with Edge Functions enabled

### npm Packages
```json
{
  "@aws-sdk/client-s3": "^3.450.0",
  "@aws-sdk/s3-request-presigner": "^3.450.0"
}
```

### Supabase CLI
```bash
npm install -g supabase
```

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Presigned URL leaked | Medium | Short expiration (5 min), IP restriction |
| S3 cost overruns | Medium | Lifecycle rules, size limits |
| Upload failures | Low | Retry logic, error reporting |
| Migration data loss | High | Backup before migration, test on copy |
| Edge Function cold starts | Low | Keep warm with periodic requests |

## Estimated Costs (Monthly)

- **S3 Storage**: $0.023/GB (us-east-1)
  - 1,000 photos @ 500KB each = 500MB = ~$0.12/month
- **S3 PUT requests**: $0.005/1,000 requests
  - 100 uploads = $0.0005
- **CloudFront**: $0.085/GB (US)
  - 10GB transfer = $0.85
- **Total**: ~$1-2/month for small blog

## Success Criteria

- [ ] All admin pages can upload images to S3
- [ ] Images served via CloudFront CDN
- [ ] Database stores S3 metadata
- [ ] Delete operations remove from S3
- [ ] Old images migrated to S3
- [ ] No errors in production for 1 week
- [ ] Upload performance <5s per image
- [ ] Page load times improved

## Rollback Plan

If critical issues arise:
1. Switch back to Supabase Storage URLs in database
2. Redirect CloudFront to Supabase Storage
3. Revert admin pages to old upload hooks
4. Keep S3 as backup

## Unresolved Questions

1. Should we implement image optimization (WebP, AVIF) at upload time?
2. Do we need thumbnail generation for gallery views?
3. Should we implement CDN cache invalidation on updates?
4. What's the maximum file size limit we should enforce?
5. Should we implement upload resumption for large files?
6. Do we need watermarking for photos?
7. Should we store backup copies in multiple regions?

## Next Steps

1. Review and approve plan
2. Set up AWS S3 + CloudFront (Phase 1)
3. Create database migration (Phase 2)
4. Begin Edge Function development (Phase 4)

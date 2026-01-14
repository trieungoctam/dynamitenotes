---
title: "AWS S3 + CloudFront Image Storage System"
description: "Migrate from Supabase Storage to AWS S3 with CloudFront CDN, presigned URLs, multi-size image generation, and resumable uploads"
status: pending
priority: P1
effort: 20h
branch: main
tags: [s3, cloudfront, image-storage, migration, aws]
created: 2026-01-15
---

## Overview

Replace Supabase Storage with AWS S3 + CloudFront CDN for image hosting. Implement browser-side image optimization (WebP/AVIF conversion, 3 thumbnail sizes), presigned URL security model, and resumable multipart uploads.

**Current State**: Supabase Storage + browser compression (800KB max)
**Target State**: AWS S3 + CloudFront + multi-size generation + resumable uploads

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         Browser (Client)                        │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  1. User selects image (max 2MB original)                  │ │
│  │  2. Validate file (type, size)                             │ │
│  │  3. Strip EXIF via canvas redraw                           │ │
│  │  4. Generate 3 sizes (200px, 800px, 1920px) with Pica     │ │
│  │  5. Convert to WebP/AVIF via canvas.toBlob()              │ │
│  │  6. Request presigned URLs from Edge Function (x3 sizes)   │ │
│  └────────────────────────────────────────────────────────────┘ │
│                              ↓                                  │
└─────────────────────────────────────────────────────────────────┘
                                   │
                                   │ fetch POST /generate-upload-url
                                   │
┌─────────────────────────────────────────────────────────────────┐
│                    Supabase Edge Function (Deno)                │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  - Validate request (Supabase Auth)                        │ │
│  │  - Generate unique S3 keys (UUID-based)                    │ │
│  │  - Create presigned URLs (PUT, 15min expiry)               │ │
│  │  - Return: { urls: {thumbnail, medium, large}, keys }      │ │
│  └────────────────────────────────────────────────────────────┘ │
│                              ↓                                  │
└─────────────────────────────────────────────────────────────────┘
                                   │
                                   │ return presigned URLs
                                   │
┌─────────────────────────────────────────────────────────────────┐
│                         Browser (Client)                        │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  7. Upload each size to S3 via PUT (parallel)              │ │
│  │  8. Track progress (XMLHttpRequest for % updates)          │ │
│  │  9. On complete: send metadata to Edge Function            │ │
│  └────────────────────────────────────────────────────────────┘ │
│                              ↓                                  │
└─────────────────────────────────────────────────────────────────┘
                                   │
                                   │ PUT requests with presigned URLs
                                   │
┌─────────────────────────────────────────────────────────────────┐
│                    AWS S3 (ap-southeast-1)                      │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Bucket: dynamite-notes-images (private, OAC-only)         │ │
│  │  Structure:                                                │ │
│  │    /photos/{uuid}/thumbnail.webp                           │ │
│  │    /photos/{uuid}/medium.webp                              │ │
│  │    /photos/{uuid}/large.webp                               │ │
│  │    /posts/{uuid}/thumbnail.webp                            │ │
│  │    /posts/{uuid}/medium.webp                               │ │
│  │    /posts/{uuid}/large.webp                                │ │
│  └────────────────────────────────────────────────────────────┘ │
│                              ↓                                  │
└─────────────────────────────────────────────────────────────────┘
                                   │
                                   │ CloudFront OAC (sigv4)
                                   │
┌─────────────────────────────────────────────────────────────────┐
│                    CloudFront Distribution                      │
│  - Domain: d1abc123.cloudfront.net → images.dynamite.vn        │
│  - OAC: S3-only access (block public)                          │
│  - Cache: 1 year TTL (immutable filenames)                     │
│  - HTTP/2+3, HTTPS-only, TLS 1.3                               │
│  - PriceClass: Asia-Pacific (primary audience)                 │
└─────────────────────────────────────────────────────────────────┘
                                   │
                                   │ GET /photos/{uuid}/large.webp
                                   │
┌─────────────────────────────────────────────────────────────────┐
│                         Browser (Client)                        │
│  - Display cached image from CloudFront edge location           │
└─────────────────────────────────────────────────────────────────┘
```

---

## Phase Breakdown

### Phase 1: AWS Infrastructure Setup (3h)
**Status**: `pending`

**Objectives**:
- Create S3 bucket with OAC configuration
- Set up CloudFront distribution
- Configure IAM roles and bucket policies
- Set up ACM certificate for custom domain

**Deliverables**:
- CloudFormation/Terraform stack for infrastructure
- S3 bucket `dynamite-notes-images`
- CloudFront distribution with OAC
- Route 53 hosted zone records (if custom domain)

**Tasks**:
1. Create S3 bucket (private, OAC-only)
2. Create CloudFront OAC
3. Create CloudFront distribution
4. Configure bucket policy (OAC-only access)
5. Set up ACM certificate (us-east-1)
6. Configure Route 53 alias records
7. Test infrastructure connectivity

**Verification**:
- [ ] S3 bucket blocks all public access
- [ ] CloudFront OAC can access S3
- [ ] Direct S3 access denied
- [ ] CloudFront HTTPS working
- [ ] Custom domain resolves

---

### Phase 2: Database Schema Migration (2h)
**Status**: `pending`

**Objectives**:
- Add S3 metadata fields to existing tables
- Create migration for existing data
- Update Prisma schema

**Deliverables**:
- Prisma migration file
- Updated Prisma schema
- Migration script for existing photos

**Tasks**:
1. Update `Photo` model with S3 fields
2. Update `Post` model with S3 fields
3. Create Prisma migration
4. Backfill existing records with placeholder S3 keys
5. Test migration in development

**Database Changes**:
```prisma
model Photo {
  id            String      @id @default(uuid())
  url           String                    // Legacy: Supabase URL
  s3Key         String?     @map("s3_key")         // NEW: S3 key prefix
  s3Bucket      String?     @map("s3_bucket")      // NEW: bucket name
  cdnUrl        String?     @map("cdn_url")        // NEW: CloudFront URL
  fileSize      BigInt?     @map("file_size")      // NEW: bytes
  fileType      String?     @map("file_type")      // NEW: MIME type
  width         Int?        @map("width")          // NEW: pixels
  height        Int?        @map("height")         // NEW: pixels
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
  // ...
  coverImage           String?    @map("cover_image")              // Legacy
  coverImageS3Key      String?    @map("cover_image_s3_key")       // NEW
  coverImageCdnUrl     String?    @map("cover_image_cdn_url")      // NEW
  coverImageFileSize   BigInt?    @map("cover_image_file_size")    // NEW
  coverImageWidth      Int?       @map("cover_image_width")        // NEW
  coverImageHeight     Int?       @map("cover_image_height")       // NEW
  // ...
}
```

**Verification**:
- [ ] Prisma migration runs successfully
- [ ] Existing records have S3 fields (nullable)
- [ ] New records can save S3 metadata
- [ ] No breaking changes to existing queries

---

### Phase 3: Edge Functions Development (4h)
**Status**: `pending`

**Objectives**:
- Create presigned URL generator
- Create S3 object deleter
- Implement authentication checks

**Deliverables**:
- `generate-upload-url` Edge Function
- `delete-s3-object` Edge Function
- Shared S3 client module for Edge Functions

**Tasks**:
1. Create S3 client wrapper (Deno)
2. Implement `generate-upload-url` function
3. Implement `delete-s3-object` function
4. Add Supabase Auth validation
5. Add rate limiting
6. Test presigned URL generation
7. Test S3 deletion

**Edge Function Structure**:
```typescript
// supabase/functions/generate-upload-url/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { S3Client, PutObjectCommand } from "npm:@aws-sdk/client-s3@3"
import { getSignedUrl } from "npm:@aws-sdk/s3-request-presigner@3"

const s3Client = new S3Client({
  region: Deno.env.get('AWS_REGION')!,
  credentials: {
    accessKeyId: Deno.env.get('AWS_ACCESS_KEY_ID')!,
    secretAccessKey: Deno.env.get('AWS_SECRET_ACCESS_KEY')!
  }
})

serve(async (req) => {
  try {
    // Validate auth
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) throw new Error('Unauthorized')

    // Parse request
    const { bucket, sizes } = await req.json()

    // Generate presigned URLs for each size
    const urls = {}
    for (const size of ['thumbnail', 'medium', 'large']) {
      const key = `${bucket}/${crypto.randomUUID()}/${size}.webp`
      const command = new PutObjectCommand({
        Bucket: Deno.env.get('S3_BUCKET')!,
        Key: key,
        ContentType: 'image/webp'
      })
      urls[size] = {
        url: await getSignedUrl(s3Client, command, { expiresIn: 900 }),
        key
      }
    }

    return new Response(JSON.stringify({ urls }), {
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    })
  }
})
```

**Verification**:
- [ ] Presigned URLs valid for 15 minutes
- [ ] Authenticated requests succeed
- [ ] Unauthenticated requests fail
- [ ] URLs work with S3 PUT requests
- [ ] URLs expire after 15 minutes

---

### Phase 4: Browser Image Optimization (3h)
**Status**: `pending`

**Objectives**:
- Implement multi-size generation
- Convert to WebP/AVIF
- Strip EXIF data
- Add progress tracking

**Deliverables**:
- `use-image-optimization` hook
- Image utility functions
- Web Worker for compression

**Tasks**:
1. Create image optimization utilities
2. Implement size generation with Pica
3. Implement WebP/AVIF conversion
4. Create Web Worker for heavy processing
5. Add progress tracking
6. Test with various image formats

**Implementation**:
```typescript
// src/lib/image-optimization.ts
import Pica from 'pica'

export interface ImageSizes {
  thumbnail: Blob  // 200px
  medium: Blob     // 800px
  large: Blob      // 1920px
  original: Blob   // Stripped EXIF
}

export async function generateImageSizes(
  file: File,
  onProgress?: (percent: number) => void
): Promise<ImageSizes> {
  const pica = Pica()
  const sizes = { thumbnail: 200, medium: 800, large: 1920 }
  const results = {} as ImageSizes

  // Load image
  const img = new Image()
  img.src = URL.createObjectURL(file)
  await new Promise(r => img.onload = r)
  onProgress?.(10)

  // Strip EXIF via canvas redraw
  const canvas = document.createElement('canvas')
  canvas.width = img.width
  canvas.height = img.height
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(img, 0, 0)

  results.original = await new Promise(r =>
    canvas.toBlob(r!, 'image/webp', 0.8)
  )
  onProgress?.(20)

  // Generate sizes
  let completed = 0
  await Promise.all(
    Object.entries(sizes).map(async ([name, width]) => {
      const scale = Math.min(width / img.width, width / img.height)
      const resized = document.createElement('canvas')
      resized.width = img.width * scale
      resized.height = img.height * scale

      await pica.resize(canvas, resized, {
        quality: 3,
        alpha: true
      })

      results[name] = await new Promise(r =>
        resized.toBlob(r!, 'image/webp', 0.8)
      )

      completed++
      onProgress?.(20 + (completed / 3) * 80)
    })
  )

  return results
}
```

**Verification**:
- [ ] EXIF data stripped
- [ ] 3 sizes generated correctly
- [ ] WebP format conversion works
- [ ] Progress tracking accurate
- [ ] Works with JPEG, PNG, WebP inputs

---

### Phase 5: React Hooks Implementation (3h)
**Status**: `pending`

**Objectives**:
- Replace `use-upload.ts` with S3 version
- Implement resumable multipart upload
- Add progress tracking
- Error handling & retry logic

**Deliverables**:
- Updated `use-upload.ts` hook
- `use-s3-upload` hook (new)
- Upload state management
- Error handling utilities

**Tasks**:
1. Create `use-s3-upload` hook
2. Implement presigned URL fetching
3. Implement multipart upload logic
4. Add progress tracking
5. Add retry logic with exponential backoff
6. Add resume capability (IndexedDB)
7. Update existing components to use new hook

**Hook Structure**:
```typescript
// src/hooks/use-s3-upload.ts
import { useState } from 'react'
import { generateImageSizes } from '@/lib/image-optimization'

interface S3UploadOptions {
  bucket: 'photos' | 'posts'
  onProgress?: (percent: number) => void
}

export function useS3Upload() {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const upload = async (file: File, options: S3UploadOptions) => {
    setUploading(true)
    setError(null)

    try {
      // 1. Validate
      if (file.size > 2 * 1024 * 1024) {
        throw new Error('File exceeds 2MB limit')
      }

      // 2. Optimize & generate sizes
      const sizes = await generateImageSizes(file, (p) => {
        setProgress(p * 0.3) // 0-30%
      })

      // 3. Get presigned URLs
      const response = await fetch('/generate-upload-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ bucket: options.bucket })
      })

      const { urls } = await response.json()

      // 4. Upload each size
      let uploaded = 0
      await Promise.all(
        Object.entries(sizes).map(([name, blob]) => {
          return uploadWithProgress(
            blob,
            urls[name].url,
            (p) => {
              const totalProgress = 30 + ((uploaded + p / 100) / 3) * 70
              setProgress(totalProgress)
            }
          )
        })
      )

      // 5. Return metadata
      return {
        s3Key: urls.large.key,
        cdnUrl: `https://images.dynamite.vn/${urls.large.key}`,
        sizes: {
          thumbnail: urls.thumbnail.key,
          medium: urls.medium.key,
          large: urls.large.key
        }
      }
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setUploading(false)
    }
  }

  return { upload, uploading, progress, error }
}

async function uploadWithProgress(
  blob: Blob,
  url: string,
  onProgress: (percent: number) => void
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()

    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable) {
        onProgress((e.loaded / e.total) * 100)
      }
    })

    xhr.addEventListener('load', () => {
      if (xhr.status === 200) resolve()
      else reject(new Error(`Upload failed: ${xhr.status}`))
    })

    xhr.addEventListener('error', () =>
      reject(new Error('Network error'))
    )

    xhr.open('PUT', url)
    xhr.setRequestHeader('Content-Type', 'image/webp')
    xhr.send(blob)
  })
}
```

**Verification**:
- [ ] File validation works (2MB limit)
- [ ] Image optimization completes
- [ ] Presigned URLs fetched successfully
- [ ] All 3 sizes upload to S3
- [ ] Progress tracking accurate
- [ ] Errors handled gracefully
- [ ] Retry logic works

---

### Phase 6: Component Integration (2h)
**Status**: `pending`

**Objectives**:
- Update existing components to use S3 upload
- Update database save logic
- Update delete logic
- Test all upload scenarios

**Deliverables**:
- Updated `PhotosAdmin.tsx`
- Updated `PostEditor.tsx`
- Updated `PhotoUploadModal.tsx`
- Updated `use-admin-photos.ts`

**Tasks**:
1. Update `PhotosAdmin.tsx` to save S3 metadata
2. Update `PostEditor.tsx` to use new hook
3. Update `PhotoUploadModal.tsx`
4. Update `use-admin-photos.ts` delete logic
5. Update `MediaUpload.tsx`
6. Test all upload flows
7. Test delete flows

**Component Changes**:
```typescript
// src/pages/admin/PhotosAdmin.tsx (partial)
const { upload, uploading, progress } = useS3Upload()

const handleUpload = async (file: File) => {
  try {
    const metadata = await upload(file, { bucket: 'photos' })

    // Save to database with S3 metadata
    await createPhoto.mutateAsync({
      album: uploadAlbum,
      url: metadata.cdnUrl,
      s3Key: metadata.s3Key,
      s3Bucket: 'dynamite-notes-images',
      cdnUrl: metadata.cdnUrl,
      fileSize: file.size,
      fileType: file.type,
      width: metadata.width,
      height: metadata.height,
      captionVi: "",
      captionEn: "",
    })
  } catch (error) {
    console.error('Upload failed:', error)
  }
}
```

**Verification**:
- [ ] Photos upload successfully
- [ ] Post cover images upload
- [ ] All 3 sizes saved to S3
- [ ] Database records include S3 metadata
- [ ] Delete removes S3 objects
- [ ] UI shows correct progress

---

### Phase 7: Testing & QA (2h)
**Status**: `pending`

**Objectives**:
- Test all upload scenarios
- Test error handling
- Test resumable uploads
- Performance testing
- Cross-browser testing

**Deliverables**:
- Test plan document
- Bug fixes
- Performance benchmarks

**Test Cases**:
1. **File Validation**
   - [ ] Reject files > 2MB
   - [ ] Reject non-image files
   - [ ] Accept valid images

2. **Image Optimization**
   - [ ] JPEG → WebP conversion
   - [ ] PNG → WebP conversion
   - [ ] EXIF stripping verified
   - [ ] All 3 sizes generated

3. **Upload Flow**
   - [ ] Presigned URL generation
   - [ ] Parallel upload of sizes
   - [ ] Progress tracking accurate
   - [ ] Network error handling

4. **Database**
   - [ ] S3 metadata saved correctly
   - [ ] CDN URLs accessible
   - [ ] Legacy records still work

5. **CDN**
   - [ ] CloudFront URLs load
   - [ ] Caching headers correct
   - [ ] HTTPS enforced
   - [ ] Custom domain works

6. **Cross-Browser**
   - [ ] Chrome (latest)
   - [ ] Firefox (latest)
   - [ ] Safari (latest)
   - [ ] Edge (latest)

7. **Resumable Uploads**
   - [ ] Pause/resume works
   - [ ] IndexedDB state persists
   - [ ] Orphaned uploads cleaned

**Performance Targets**:
- 2MB file: < 10 seconds total
- Image optimization: < 3 seconds
- Upload (all sizes): < 7 seconds
- First paint via CDN: < 500ms

---

### Phase 8: Migration & Deployment (1h)
**Status**: `pending`

**Objectives**:
- Run database migration
- Deploy Edge Functions
- Deploy infrastructure
- Monitor initial traffic

**Deliverables**:
- Production S3 bucket
- Production CloudFront distribution
- Deployed Edge Functions
- Database migration executed

**Deployment Steps**:
1. Deploy infrastructure (CloudFormation/Terraform)
2. Deploy Edge Functions to production
3. Run database migration
4. Update environment variables
5. Deploy application (Vercel)
6. Verify uploads work
7. Monitor CloudWatch metrics

**Rollback Plan**:
- Keep Supabase Storage active for 7 days
- Feature flag to revert to old upload system
- Database migration is reversible

**Verification**:
- [ ] Infrastructure deployed
- [ ] Edge Functions accessible
- [ ] Migration successful
- [ ] Uploads work in production
- [ ] CDN serving images
- [ ] No errors in CloudWatch

---

## File Structure

```
/Users/dynamite/workspaces/com.dynamite/dynamitenotes/
├── supabase/
│   └── functions/
│       ├── generate-upload-url/
│       │   └── index.ts                  # Presigned URL generator
│       └── delete-s3-object/
│           └── index.ts                  # S3 object deleter
├── src/
│   ├── hooks/
│   │   ├── use-s3-upload.ts              # NEW: S3 upload hook
│   │   ├── use-upload.ts                 # UPDATED: Kept for compatibility
│   │   └── use-admin-photos.ts           # UPDATED: Delete logic
│   ├── lib/
│   │   ├── image-optimization.ts         # NEW: Image processing
│   │   └── s3-client.ts                  # NEW: S3 utilities (if needed)
│   ├── components/
│   │   └── admin/
│   │       ├── PhotosAdmin.tsx           # UPDATED
│   │       ├── PostEditor.tsx            # UPDATED
│   │       ├── PhotoUploadModal.tsx      # UPDATED
│   │       └── MediaUpload.tsx           # UPDATED
│   └── pages/
│       └── admin/
│           ├── PhotosAdmin.tsx           # UPDATED
│           └── PostEditor.tsx            # UPDATED
├── prisma/
│   ├── schema.prisma                      # UPDATED
│   └── migrations/
│       └── 20260115_s3_migration.sql      # NEW
└── infrastructure/
    ├── s3-cloudfront.yaml                 # NEW: CloudFormation
    └── terraform/                         # NEW: Terraform (alternative)
        ├── main.tf
        ├── s3.tf
        └── cloudfront.tf
```

---

## Environment Variables

```bash
# .env.production
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# NEW: S3 Configuration
VITE_S3_BUCKET=dynamite-notes-images
VITE_S3_REGION=ap-southeast-1
VITE_CLOUDFRONT_DOMAIN=https://images.dynamite.vn

# Edge Function Secrets (via Supabase Dashboard)
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=ap-southeast-1
S3_BUCKET=dynamite-notes-images
```

---

## Risk Mitigation

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| S3 upload failures | High | Medium | Retry logic + fallback to Supabase |
| CloudFront misconfiguration | High | Low | Test in dev before production |
| Image optimization slows UI | Medium | Low | Web Workers + progress feedback |
| Migration data loss | Critical | Low | Backup + dual-write transition |
| Cost overruns | Medium | Low | S3 lifecycle + CloudWatch alarms |

---

## Unresolved Questions

1. Should we implement AVIF encoding given Safari 16+ support?
2. How to handle browser memory limits for batch uploads (20+ images)?
3. Custom domain (`images.dynamite.vn`) or CloudFront default domain?
4. Should we implement signed CloudFront URLs for private images?
5. What's the cleanup strategy for orphaned multipart uploads?
6. Should we use EvaporateJS or custom multipart implementation?

---

## Cost Estimate

**Monthly Costs (estimated)**:
- S3 Storage (100GB): ~$2.30
- S3 Requests (1M PUT): ~$5.00
- CloudFront Transfer (500GB): ~$40-50
- CloudFront Requests (5M GET): ~$3.75
- **Total**: ~$50-60/month

**One-Time Costs**:
- Development: 20h × $50/h = $1,000
- Testing: 4h × $50/h = $200
- **Total**: ~$1,200

---

## Timeline

| Phase | Duration | Start Date | End Date |
|-------|----------|------------|----------|
| Phase 1: Infrastructure | 3h | TBD | TBD |
| Phase 2: Database | 2h | TBD | TBD |
| Phase 3: Edge Functions | 4h | TBD | TBD |
| Phase 4: Image Optimization | 3h | TBD | TBD |
| Phase 5: React Hooks | 3h | TBD | TBD |
| Phase 6: Integration | 2h | TBD | TBD |
| Phase 7: Testing | 2h | TBD | TBD |
| Phase 8: Deployment | 1h | TBD | TBD |
| **Total** | **20h** | | |

---

## Success Criteria

- [ ] All images upload to S3 successfully
- [ ] 3 sizes generated for all uploads (200px, 800px, 1920px)
- [ ] WebP format conversion working
- [ ] CloudFront CDN serving images
- [ ] Upload progress tracking accurate
- [ ] Resumable uploads working for files > 5MB
- [ ] Database records include S3 metadata
- [ ] Delete removes S3 objects
- [ ] Legacy images still accessible
- [ ] No performance degradation
- [ ] Cost under $60/month
- [ ] All tests passing
- [ ] Cross-browser compatible

---

## References

- [AWS S3 Presigned URL Research](./reports/s3-presigned-url-260115-0358-research.md)
- [Browser Image Optimization Research](./reports/researcher-260115-0359-browser-image-optimization.md)
- [CloudFront Setup Research](./reports/cloudfront-setup-260115-0358-research.md)
- [Existing Upload Implementations](./reports/scout-260115-0359-existing-upload-implementations.md)

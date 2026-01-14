# Architecture Diagram - S3 Image Storage System

## Visual Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           USER BROWSER                                      │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │  React Components                                                     │  │
│  │  ├── PhotosAdmin.tsx                                                 │  │
│  │  ├── PostEditor.tsx                                                  │  │
│  │  └── MediaUpload.tsx                                                 │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                    ↓                                        │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │  React Hooks                                                          │  │
│  │  └── useS3Upload()                                                    │  │
│  │      ├── validateImageFile()                                          │  │
│  │      ├── generateImageSizes() ──────┐                                 │  │
│  │      ├── generateUploadUrls()       │                                 │  │
│  │      └── uploadBlobWithProgress()   │                                 │  │
│  └──────────────────────────────────────┼────────────────────────────────┘  │
│                                         ↓                                    │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │  Image Optimization (Browser)                                         │  │
│  │  ├── Pica (resize)                                                   │  │
│  │  ├── Canvas API (EXIF strip, format convert)                         │  │
│  │  └── Web Worker (background processing)                               │  │
│  │                                                                       │  │
│  │  Input: image.jpg (2MB, 4000x3000px)                                 │  │
│  │  Output:                                                              │  │
│  │    - thumbnail.webp (200px, ~10KB)                                   │  │
│  │    - medium.webp (800px, ~50KB)                                      │  │
│  │    - large.webp (1920px, ~200KB)                                     │  │
│  │    - original.webp (4000x3000px, ~500KB)                             │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
                                    ↓
                    ┌───────────────┴───────────────┐
                    │  HTTPS POST (Authenticated)   │
                    │  JWT Token in Header          │
                    └───────────────┬───────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────────┐
│                    SUPABASE EDGE FUNCTION (Deno)                             │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │  generate-upload-url/index.ts                                        │  │
│  │                                                                      │  │
│  │  1. Verify JWT (Supabase Auth)                                       │  │
│  │  2. Validate bucket ('photos' | 'posts')                             │  │
│  │  3. Generate UUID for upload                                         │  │
│  │  4. Create presigned URLs for 3 sizes:                               │  │
│  │     - photos/{uuid}/thumbnail.webp (PUT, 15min)                      │  │
│  │     - photos/{uuid}/medium.webp (PUT, 15min)                         │  │
│  │     - photos/{uuid}/large.webp (PUT, 15min)                          │  │
│  │  5. Return { urls: {...}, uuid, bucket }                             │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                    ↓                                        │
│                    ┌───────────────┴───────────────┐
                    │  HTTPS Response (200 OK)      │
                    │  { urls: {...}, uuid }        │
                    └───────────────┬───────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────────┐
│                           USER BROWSER                                      │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │  Parallel Upload (XMLHttpRequest)                                     │  │
│  │                                                                       │  │
│  │  PUT {thumbnail.url} → thumbnail.webp ──┐                            │  │
│  │  PUT {medium.url} → medium.webp ────────┼── Progress Tracking       │  │
│  │  PUT {large.url} → large.webp ──────────┘    (0-100%)                │  │
│  │                                                                       │  │
│  │  Retry Logic: 3 attempts with exponential backoff                    │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                    ↓                                        │
└─────────────────────────────────────────────────────────────────────────────┘
                    ┌───────────────┴───────────────┐
                    │  HTTPS PUT (Presigned URLs)   │
                    │  3 parallel requests         │
                    └───────────────┬───────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────────┐
│                        AWS S3 (ap-southeast-1)                               │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │  Bucket: dynamite-notes-images                                       │  │
│  │  Access: Private (OAC only)                                          │  │
│  │  Encryption: AES256                                                  │  │
│  │  Versioning: Disabled                                                │  │
│  │                                                                       │  │
│  │  Objects:                                                            │  │
│  │    /photos/                                                          │  │
│  │      ├── {uuid-1}/                                                   │  │
│  │      │   ├── thumbnail.webp  (~10KB)                                 │  │
│  │      │   ├── medium.webp     (~50KB)                                 │  │
│  │      │   └── large.webp      (~200KB)                                │  │
│  │      └── {uuid-2}/                                                   │  │
│  │          ├── thumbnail.webp                                           │  │
│  │          ├── medium.webp                                              │  │
│  │          └── large.webp                                               │  │
│  │    /posts/                                                            │  │
│  │      └── ...                                                          │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                    ↓                                        │
│                    ┌───────────────┴───────────────┐
                    │  CloudFront OAC (sigv4)       │
                    │  Origin Access Control        │
                    └───────────────┬───────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────────┐
│                      CloudFront Distribution                                 │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │  Distribution ID: E1234ABCD                                          │  │
│  │  Domain: d1abc123.cloudfront.net → images.dynamite.vn                │  │
│  │                                                                       │  │
│  │  Cache Policy: CachingOptimized                                      │  │
│  │    - Min TTL: 0                                                      │  │
│  │    - Default TTL: 86400 (1 day)                                      │  │
│  │    - Max TTL: 31536000 (1 year)                                      │  │
│  │                                                                       │  │
│  │  Origin Request Policy: CORS-S3Origin                                │  │
│  │                                                                       │  │
│  │  HTTP Version: http2and3                                             │  │
│  │  Price Class: PriceClass_200 (Asia-Pacific)                          │  │
│  │                                                                       │  │
│  │  Edge Locations: 600+ global POPs                                    │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                    ↓                                        │
└─────────────────────────────────────────────────────────────────────────────┘
                    ┌───────────────┴───────────────┐
                    │  HTTPS GET (Cached)           │
                    │  Cache-Control: max-age=31536000│
                    └───────────────┬───────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────────┐
│                           USER BROWSER                                      │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │  Display Image                                                        │  │
│  │                                                                       │  │
│  │  <img src="https://images.dynamite.vn/photos/{uuid}/large.webp"      │  │
│  │                                                                       │  │
│  │  Performance:                                                         │  │
│  │    - First request: ~500ms (origin fetch)                             │  │
│  │    - Cached requests: ~50ms (edge hit)                                │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                    SUPABASE POSTGRESQL DATABASE                             │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │  photos table                                                        │  │
│  │    ┌──────────┬─────────────────┬─────────────────────────┐          │  │
│  │    │ id       │ url            │ s3_key                  │          │  │
│  │    ├──────────┼─────────────────┼─────────────────────────┤          │  │
│  │    │ uuid-1   │ https://...    │ photos/uuid-1/large.webp│          │  │
│  │    │ uuid-2   │ https://...    │ photos/uuid-2/large.webp│          │  │
│  │    └──────────┴─────────────────┴─────────────────────────┘          │  │
│  │                                                                       │  │
│  │  Additional S3 fields:                                                │  │
│  │    - s3_bucket, cdn_url, file_size, file_type                        │  │
│  │    - width, height                                                    │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                         DELETE FLOW (Optional)                              │
│                                                                           │
│  Browser → Supabase Auth → Edge Function → S3 Delete → Database Delete   │
│                                                                           │
│  1. User clicks "Delete" in PhotosAdmin                                   │
│  2. Call delete-s3-object Edge Function                                   │
│  3. Edge Function deletes all 3 sizes from S3:                            │
│     - DELETE photos/{uuid}/thumbnail.webp                                 │
│     - DELETE photos/{uuid}/medium.webp                                    │
│     - DELETE photos/{uuid}/large.webp                                     │
│  4. Database record deleted via CASCADE                                   │
│                                                                           │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Data Flow Summary

### Upload Flow
1. **User selects image** (max 2MB)
2. **Browser validates** file (type, size)
3. **Browser optimizes** image (3 sizes + WebP conversion)
4. **Browser requests** presigned URLs from Edge Function
5. **Edge Function** generates URLs (15min expiry, requires auth)
6. **Browser uploads** all 3 sizes in parallel to S3
7. **Browser saves** metadata to database (S3 key, CDN URL, dimensions)
8. **CloudFront caches** images (1 year TTL)
9. **Future requests** served from CDN edge locations

### Delete Flow
1. **User clicks delete** in admin panel
2. **Browser calls** delete-s3-object Edge Function
3. **Edge Function deletes** all 3 sizes from S3
4. **Database record** deleted via CASCADE

### Security Layers
- **Supabase Auth**: JWT validation in Edge Functions
- **Presigned URLs**: 15-minute expiry, PUT-only
- **S3 Bucket Policy**: OAC-only access (no public)
- **CloudFront OAC**: sigv4 authentication to S3
- **HTTPS**: Enforced everywhere
- **CORS**: Restricted origins

## Technology Matrix

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Client** | React + TypeScript | UI framework |
| **Client** | Pica | High-quality resize |
| **Client** | Canvas API | EXIF strip, format convert |
| **Client** | XMLHttpRequest | Upload progress |
| **Edge** | Deno (Supabase) | Serverless runtime |
| **Edge** | AWS SDK v3 | S3 presigned URLs |
| **Auth** | Supabase Auth | JWT validation |
| **Storage** | AWS S3 | Object storage |
| **CDN** | CloudFront | Global edge cache |
| **Security** | OAC | S3 access control |
| **DNS** | Route 53 | Custom domain |
| **SSL** | ACM | TLS certificates |
| **Database** | PostgreSQL (Supabase) | Metadata storage |
| **ORM** | Prisma | Type-safe queries |
| **Build** | Vite | Development + build |

## Performance Characteristics

### Upload Performance
- **2MB file**: ~10s total
  - Image optimization: ~3s
  - Upload (3 sizes): ~7s
- **Progress tracking**: Real-time (0-100%)
- **Retry logic**: 3 attempts, exponential backoff

### CDN Performance
- **First request**: ~500ms (origin fetch)
- **Cached requests**: ~50ms (edge hit)
- **Cache hit ratio**: Target 80%+
- **TTL**: 1 year (immutable filenames)

### Storage Efficiency
- **Original**: 2MB JPEG
- **Optimized**: ~500KB WebP (75% reduction)
- **Thumbnail**: ~10KB
- **Medium**: ~50KB
- **Large**: ~200KB
- **Total per image**: ~760KB (vs 2MB original)

## Cost Breakdown

### Per Image (Monthly)
- **S3 Storage**: ~$0.00023/month
- **S3 PUT requests**: ~$0.000005/request (3 per image)
- **CloudFront Transfer**: ~$0.085/GB
- **CloudFront Requests**: ~$0.00075/10K requests

### Estimated Monthly (1000 images, 500GB transfer)
- **S3 Storage**: ~$2.30
- **S3 Requests**: ~$5.00
- **CloudFront Transfer**: ~$40-50
- **CloudFront Requests**: ~$3.75
- **Total**: ~$50-60/month

---

**Architecture Version**: 1.0
**Last Updated**: 2026-01-15
**Author**: Planner Agent

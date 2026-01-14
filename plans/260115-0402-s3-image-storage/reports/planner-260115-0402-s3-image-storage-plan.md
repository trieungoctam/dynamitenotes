# S3 Image Storage Implementation Plan - Summary

**Plan Created**: 2026-01-15
**Status**: Ready for Implementation
**Estimated Effort**: 20 hours
**Priority**: P1 (High)

---

## Executive Summary

Comprehensive implementation plan to migrate from Supabase Storage to AWS S3 + CloudFront CDN for image hosting. Includes browser-side optimization (WebP/AVIF, 3 thumbnail sizes), presigned URL security model, resumable uploads, and complete migration strategy.

**Key Features**:
- 3 image sizes: thumbnail (200px), medium (800px), large (1920px)
- WebP/AVIF format conversion
- 2MB original file size limit
- CloudFront CDN with 1-year caching
- Resumable multipart uploads
- 15-minute presigned URL expiration
- Complete rollback capability

---

## Architecture Overview

```
Browser → Image Optimization → Presigned URL Request → Supabase Edge Function
                                                          ↓
                                                    Generate S3 URLs
                                                          ↓
Browser ← Presigned URLs ← Edge Function
                                                          ↓
Browser → Upload (3 sizes) → S3 (via presigned URLs)
                                                          ↓
                          S3 → CloudFront OAC → CDN Delivery → Browser
```

---

## Phase Breakdown

| Phase | Duration | Description | Status |
|-------|----------|-------------|--------|
| 1. Infrastructure Setup | 3h | S3 bucket, CloudFront, OAC, ACM | pending |
| 2. Database Migration | 2h | Prisma schema, S3 fields, backfill | pending |
| 3. Edge Functions | 4h | Presigned URL generator, deleter | pending |
| 4. Image Optimization | 3h | Multi-size generation, WebP/AVIF | pending |
| 5. React Hooks | 3h | S3 upload hook, progress tracking | pending |
| 6. Component Integration | 2h | Update PhotosAdmin, PostEditor, etc. | pending |
| 7. Testing & QA | 2h | Cross-browser, performance, error handling | pending |
| 8. Migration & Deploy | 1h | Deploy infra, run migration, switch | pending |
| **Total** | **20h** | | |

---

## Technical Stack

### AWS
- **S3**: Object storage (ap-southeast-1)
- **CloudFront**: CDN with OAC
- **ACM**: SSL/TLS certificates
- **Route 53**: DNS (optional custom domain)

### Supabase
- **Edge Functions**: Deno runtime
- **Auth**: User authentication
- **Database**: PostgreSQL

### Browser
- **Pica**: High-quality image resizing
- **browser-image-compression**: Compression utility
- **Canvas API**: EXIF stripping, format conversion
- **XMLHttpRequest**: Upload progress tracking

### Application
- **React**: UI framework
- **TypeScript**: Type safety
- **Prisma**: Database ORM
- **Vite**: Build tool

---

## Database Schema Changes

### Photo Model
```prisma
model Photo {
  s3Key         String?   @map("s3_key")
  s3Bucket      String?   @map("s3_bucket")
  cdnUrl        String?   @map("cdn_url")
  fileSize      BigInt?   @map("file_size")
  fileType      String?   @map("file_type")
  width         Int?      @map("width")
  height        Int?      @map("height")
  // ... existing fields
}
```

### Post Model
```prisma
model Post {
  coverImageS3Key      String?  @map("cover_image_s3_key")
  coverImageCdnUrl     String?  @map("cover_image_cdn_url")
  coverImageFileSize   BigInt?  @map("cover_image_file_size")
  coverImageWidth      Int?     @map("cover_image_width")
  coverImageHeight     Int?     @map("cover_image_height")
  // ... existing fields
}
```

---

## File Structure

```
/Users/dynamite/workspaces/com.dynamite/dynamitenotes/
├── supabase/functions/
│   ├── generate-upload-url/index.ts    # NEW: Presigned URL generator
│   └── delete-s3-object/index.ts       # NEW: S3 object deleter
├── src/
│   ├── hooks/
│   │   ├── use-s3-upload.ts            # NEW: S3 upload hook
│   │   ├── use-upload.ts               # UPDATED: Feature flag support
│   │   └── use-admin-photos.ts         # UPDATED: Delete logic
│   ├── lib/
│   │   └── image-optimization.ts       # NEW: Image processing utilities
│   └── components/admin/
│       ├── PhotosAdmin.tsx             # UPDATED: S3 upload
│       ├── PostEditor.tsx              # UPDATED: S3 upload
│       └── PhotoUploadModal.tsx        # UPDATED: S3 upload
├── prisma/
│   ├── schema.prisma                   # UPDATED: S3 fields
│   └── migrations/                     # NEW: Migration files
└── infrastructure/
    └── s3-cloudfront.yaml              # NEW: CloudFormation stack
```

---

## Key Features

### 1. Multi-Size Image Generation
- **Thumbnail**: 200px (longest side)
- **Medium**: 800px (longest side)
- **Large**: 1920px (longest side)
- **Original**: EXIF-stripped, WebP-converted

### 2. Format Conversion
- Primary: WebP (95% browser support)
- Fallback: JPEG
- Future: AVIF (Safari 16+ support)

### 3. Security
- Presigned URLs (15-minute expiry)
- Supabase Auth required
- S3 bucket private (OAC-only)
- HTTPS enforced

### 4. Performance
- Parallel upload of 3 sizes
- XMLHttpRequest for progress
- Exponential backoff retry
- IndexedDB for resume capability

### 5. CDN Caching
- 1-year TTL (immutable filenames)
- Cache-Control: `public, max-age=31536000, immutable`
- CloudFront edge locations
- HTTP/2 + HTTP/3

---

## Cost Estimate

### Monthly (Estimated)
- S3 Storage (100GB): $2.30
- S3 Requests (1M PUT): $5.00
- CloudFront Transfer (500GB): $40-50
- CloudFront Requests (5M GET): $3.75
- **Total**: ~$50-60/month

### One-Time
- Development: 20h × $50/h = $1,000
- Testing: 4h × $50/h = $200
- **Total**: ~$1,200

---

## Migration Strategy

### Phase 1: Dual-Write (Days 1-3)
1. Add S3 fields to database (non-breaking)
2. **Write to both** Supabase + S3
3. **Read from S3** if available, fallback to Supabase
4. Monitor for issues

### Phase 2: Validation (Days 4-6)
1. Verify all uploads to S3
2. Check CDN serving correctly
3. Monitor error rates
4. Fix any issues

### Phase 3: Cutover (Day 7)
1. Set `VITE_USE_S3=true`
2. Deploy to production
3. Monitor for 24 hours
4. Rollback if needed

### Phase 4: Cleanup (Day 14)
1. Migrate existing URLs to S3
2. Remove Supabase Storage files
3. Remove legacy code paths

---

## Risk Mitigation

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| S3 upload failures | High | Medium | Retry logic + fallback to Supabase |
| CloudFront misconfig | High | Low | Test in dev before prod |
| Image optimization slows UI | Medium | Low | Web Workers + progress feedback |
| Migration data loss | Critical | Low | Backup + dual-write transition |
| Cost overruns | Medium | Low | Lifecycle policies + CloudWatch |

---

## Rollback Plan

### Immediate (Feature Flag)
```bash
# Revert to Supabase Storage
VITE_USE_S3=false
vercel --prod
```

### Full Rollback
```bash
# Revert database migration
npx prisma migrate resolve --rolled-back add_s3_image_metadata

# Delete CloudFront distribution
aws cloudfront delete-distribution --id E1234ABCD

# Delete S3 bucket
aws s3 rb s3://dynamite-notes-images --force
```

---

## Success Criteria

- [ ] All images upload to S3 successfully
- [ ] 3 sizes generated for all uploads
- [ ] WebP format conversion working
- [ ] CloudFront CDN serving images
- [ ] Upload progress tracking accurate
- [ ] Resumable uploads working (> 5MB)
- [ ] Database records include S3 metadata
- [ ] Delete removes S3 objects
- [ ] Legacy images still accessible
- [ ] No performance degradation
- [ ] Cost under $60/month
- [ ] All tests passing
- [ ] Cross-browser compatible

---

## Next Steps

1. **Review Plan**: Stakeholder approval
2. **Schedule Implementation**: Book 20h development time
3. **Start Phase 1**: Infrastructure setup
4. **Track Progress**: Use plan.md phase status
5. **Report Issues**: Update unresolved questions

---

## Unresolved Questions

1. Should we implement AVIF encoding given Safari 16+ support?
2. How to handle browser memory limits for batch uploads (20+ images)?
3. Custom domain (`images.dynamite.vn`) or CloudFront default?
4. Signed CloudFront URLs for private images needed?
5. Cleanup strategy for orphaned multipart uploads?
6. Use EvaporateJS or custom multipart implementation?

---

## References

- **Research Reports**:
  - [S3 Presigned URL Research](../reports/s3-presigned-url-260115-0358-research.md)
  - [Browser Image Optimization](../reports/researcher-260115-0359-browser-image-optimization.md)
  - [CloudFront Setup](../reports/cloudfront-setup-260115-0358-research.md)
  - [Existing Implementations](../reports/scout-260115-0359-existing-upload-implementations.md)

- **Phase Plans**:
  - [Phase 1: Infrastructure](../phase-01-infrastructure-setup.md)
  - [Phase 2: Database Migration](../phase-02-database-migration.md)
  - [Phase 3: Edge Functions](../phase-03-edge-functions.md)
  - [Phase 4: Image Optimization](../phase-04-image-optimization.md)
  - [Phase 5: React Hooks](../phase-05-react-hooks.md)
  - [Phase 6: Component Integration](../phase-06-integration.md)
  - [Phase 7: Testing & QA](../phase-07-testing.md)
  - [Phase 8: Migration & Deploy](../phase-08-deployment.md)

---

## Appendix

### Environment Variables

```bash
# Production
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# AWS (Edge Function secrets)
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=ap-southeast-1
S3_BUCKET=dynamite-notes-images

# CDN
VITE_CLOUDFRONT_DOMAIN=https://images.dynamite.vn

# Feature Flag
VITE_USE_S3=false  # Set to true after migration
```

### Performance Targets

| Metric | Target |
|--------|--------|
| 2MB upload time | < 10s |
| Image optimization | < 3s |
| Upload (all sizes) | < 7s |
| CDN first paint | < 500ms |
| CDN cached response | < 100ms |

### Browser Support

| Browser | Version | Status |
|---------|---------|--------|
| Chrome | 120+ | ✅ Full |
| Firefox | 120+ | ✅ Full |
| Safari | 17+ | ✅ Full |
| Edge | 120+ | ✅ Full |
| iOS Safari | 17+ | ✅ Full |
| Android Chrome | 120+ | ✅ Full |

---

**Plan Status**: ✅ Complete
**Ready for Implementation**: Yes
**Estimated Completion**: 3-5 days (20h)

---

*Generated by planner agent*
*Date: 2026-01-15*
*Location: /Users/dynamite/workspaces/com.dynamite/dynamitenotes/plans/260115-0402-s3-image-storage/*

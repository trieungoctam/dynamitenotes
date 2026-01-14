# Phase 7: Testing & QA

**Status**: `pending`
**Duration**: 2 hours
**Dependencies**: Phase 6 (Component Integration)

---

## Objectives

Comprehensive testing of all upload scenarios, error handling, cross-browser compatibility, and performance benchmarks.

---

## Prerequisites

- All components updated
- S3 infrastructure deployed
- Edge Functions working

---

## Tasks

### 7.1 File Validation Tests (20 min)

**Test Cases**:
- [ ] Accept JPEG under 2MB
- [ ] Accept PNG under 2MB
- [ ] Accept WebP under 2MB
- [ ] Reject files > 2MB
- [ ] Reject non-image files (PDF, TXT, etc.)
- [ ] Reject empty files
- [ ] Show appropriate error messages

**Manual Test Script**:
```typescript
// Test valid file
const validFile = new File(['test'], 'test.jpg', {
  type: 'image/jpeg',
})
const result = validateImageFile(validFile)
console.assert(result.valid === true)

// Test oversized file
const largeFile = new File(['x'.repeat(3 * 1024 * 1024)], 'large.jpg', {
  type: 'image/jpeg'
})
const oversized = validateImageFile(largeFile)
console.assert(oversized.valid === false)
console.assert(oversized.error?.includes('exceeds'))

// Test invalid type
const invalidFile = new File(['test'], 'test.pdf', {
  type: 'application/pdf'
})
const invalid = validateImageFile(invalidFile)
console.assert(invalid.valid === false)
```

---

### 7.2 Image Optimization Tests (30 min)

**Test Cases**:
- [ ] JPEG → WebP conversion
- [ ] PNG → WebP conversion
- [ ] WebP → WebP (no change)
- [ ] EXIF data stripped
- [ ] 3 sizes generated correctly
- [ ] Aspect ratio maintained
- [ ] Image quality acceptable
- [ ] Progress tracking accurate

**Verification**:
```bash
# Upload test image
# Check S3 for 3 files:
# - photos/{uuid}/thumbnail.webp (200px)
# - photos/{uuid}/medium.webp (800px)
# - photos/{uuid}/large.webp (1920px)

# Verify dimensions
aws s3 cp s3://dynamite-notes-images/photos/{uuid}/thumbnail.webp - | \
  identify - | grep "Geometry"
# Expected: 200x150 or similar

aws s3 cp s3://dynamite-notes-images/photos/{uuid}/medium.webp - | \
  identify - | grep "Geometry"
# Expected: 800x600 or similar

aws s3 cp s3://dynamite-notes-images/photos/{uuid}/large.webp - | \
  identify - | grep "Geometry"
# Expected: 1920x1440 or similar
```

---

### 7.3 Upload Flow Tests (30 min)

**Test Cases**:
- [ ] Presigned URL generation succeeds
- [ ] Authenticated requests work
- [ ] Unauthenticated requests fail (401)
- [ ] Invalid buckets rejected
- [ ] All 3 sizes upload successfully
- [ ] Database saves S3 metadata
- [ ] Progress tracking from 0-100%
- [ ] Upload completes within 10s (2MB file)

**Test Script**:
```typescript
// Test complete upload flow
const file = new File(['test-image-data'], 'test.jpg', {
  type: 'image/jpeg'
})

const { upload, uploading, progress, error } = useS3Upload()

try {
  const result = await upload(file, {
    bucket: 'photos',
    onProgress: (p) => console.log(`Progress: ${p}%`)
  })

  console.log('Success!', {
    cdnUrl: result.cdnUrl,
    s3Key: result.s3Key,
    metadata: result.metadata
  })

  // Verify in database
  const photo = await supabase
    .from('photos')
    .select('*')
    .eq('s3_key', result.s3Key)
    .single()

  console.assert(photo.data?.s3_key === result.s3Key)
  console.assert(photo.data?.cdn_url === result.cdnUrl)
  console.assert(photo.data?.width === result.metadata.width)

} catch (error) {
  console.error('Upload failed:', error)
}
```

---

### 7.4 Error Handling Tests (20 min)

**Test Cases**:
- [ ] Network timeout handled
- [ ] Invalid presigned URL handled
- [ ] S3 upload failure handled
- [ ] Database save failure handled
- [ ] Retry logic works (3 attempts)
- [ ] Exponential backoff works
- [ ] User sees error messages

**Simulate Failures**:
```typescript
// Test network failure
// 1. Disconnect network
// 2. Start upload
// 3. Verify error shown
// 4. Reconnect network
// 5. Verify retry works

// Test S3 failure
// 1. Use invalid presigned URL
// 2. Verify error caught
// 3. Verify retry attempted

// Test database failure
// 1. Upload succeeds
// 2. Simulate DB error
// 3. Verify rollback (S3 delete?)
// 4. Verify error message
```

---

### 7.5 Cross-Browser Tests (20 min)

**Test Browsers**:
- [ ] Chrome 120+ (Desktop)
- [ ] Firefox 120+ (Desktop)
- [ ] Safari 17+ (Desktop)
- [ ] Edge 120+ (Desktop)
- [ ] Chrome Mobile (Android)
- [ ] Safari Mobile (iOS)

**Test Checklist per Browser**:
- [ ] File selection works
- [ ] Drag & drop works
- [ ] Progress displays
- [ ] Upload succeeds
- [ ] Images display correctly
- [ ] No console errors

**Browser-Specific Issues**:
- **Safari**: Canvas memory limits (~256MB)
- **iOS**: Automatic EXIF/GPS stripping
- **Firefox**: WebP support check
- **Edge**: Same as Chrome

---

### 7.6 Performance Benchmarks (20 min)

**Metrics to Track**:
- Image optimization time
- Upload time (all 3 sizes)
- Total end-to-end time
- Memory usage
- CDN response time

**Benchmark Script**:
```typescript
const benchmarks = {
  '500KB.jpg': null,
  '1MB.jpg': null,
  '2MB.jpg': null
}

for (const [name, file] of Object.entries(benchmarks)) {
  const start = performance.now()

  await upload(file, {
    bucket: 'photos',
    onProgress: () => {}
  })

  const end = performance.now()
  benchmarks[name] = end - start

  console.log(`${name}: ${benchmarks[name]}ms`)
}

// Expected times:
// 500KB: ~5s total (1s optimize + 4s upload)
// 1MB: ~7s total (2s optimize + 5s upload)
// 2MB: ~10s total (3s optimize + 7s upload)
```

**Performance Targets**:
| File Size | Optimize | Upload | Total |
|-----------|----------|--------|-------|
| 500KB     | < 1s     | < 4s   | < 5s  |
| 1MB       | < 2s     | < 5s   | < 7s  |
| 2MB       | < 3s     | < 7s   | < 10s |

---

### 7.7 CDN Verification Tests (10 min)

**Test Cases**:
- [ ] CloudFront URL accessible
- [ ] HTTPS enforced
- [ ] Custom domain works (if configured)
- [ ] Cache headers correct (1 year)
- [ ] Images load quickly
- [ ] Direct S3 access denied

**Test Commands**:
```bash
# Test CDN access
curl -I https://images.dynamite.vn/photos/{uuid}/large.webp
# Expected: 200 OK, Cache-Control: max-age=31536000

# Test HTTPS redirect
curl -I http://images.dynamite.vn/photos/{uuid}/large.webp
# Expected: 301 Moved Permanently → HTTPS

# Test S3 access blocked
curl -I https://dynamite-notes-images.s3.ap-southeast-1.amazonaws.com/photos/{uuid}/large.webp
# Expected: 403 Forbidden

# Test response time
time curl -I https://images.dynamite.vn/photos/{uuid}/large.webp
# Expected: < 500ms (first request), < 100ms (cached)
```

---

### 7.8 Delete Flow Tests (10 min)

**Test Cases**:
- [ ] Delete removes database record
- [ ] Delete removes all 3 S3 sizes
- [ ] Delete works for legacy images (Supabase)
- [ ] Delete handles missing S3 objects gracefully
- [ ] Delete fails without auth

**Test Script**:
```typescript
// Create test photo
const photo = await createPhoto.mutateAsync({
  url: cdnUrl,
  s3Key: s3Key,
  // ... other fields
})

// Delete photo
await deletePhoto(photo.id)

// Verify database deleted
const { data } = await supabase
  .from('photos')
  .select('*')
  .eq('id', photo.id)
console.assert(data.length === 0)

// Verify S3 objects deleted
const exists = await checkS3ObjectExists(s3Key)
console.assert(exists === false)
```

---

## Bug Tracking

**Document any issues found**:

| Issue | Severity | Status | Fix |
|-------|----------|--------|-----|
| | | | |

**Severity Levels**:
- **P0**: Critical (blocks launch)
- **P1**: High (major functionality broken)
- **P2**: Medium (minor issues)
- **P3**: Low (cosmetic)

---

## Test Report Template

```markdown
# S3 Image Storage Test Report

**Date**: 2026-01-15
**Tester**: [Name]
**Environment**: Development / Staging / Production

## Summary
- Tests Run: XX
- Passed: XX
- Failed: XX
- Skipped: XX

## Test Results

### File Validation
- [ ] Accept valid images
- [ ] Reject oversized files
- [ ] Reject invalid types

### Image Optimization
- [ ] WebP conversion
- [ ] 3 sizes generated
- [ ] EXIF stripped

### Upload Flow
- [ ] Presigned URLs
- [ ] Parallel upload
- [ ] Progress tracking

### Error Handling
- [ ] Network errors
- [ ] Retry logic
- [ ] User feedback

### Cross-Browser
- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge

### Performance
- [ ] 500KB: Xs
- [ ] 1MB: Xs
- [ ] 2MB: Xs

### CDN
- [ ] URLs accessible
- [ ] Cache headers
- [ ] HTTPS enforced

## Issues Found
[List any bugs discovered]

## Recommendations
[Any suggestions for improvement]
```

---

## Verification Checklist

- [ ] All test cases executed
- [ ] All P0 bugs fixed
- [ ] All P1 bugs fixed or documented
- [ ] Performance targets met
- [ ] Cross-browser compatible
- [ ] Test report completed
- [ ] Stakeholder sign-off

---

## Next Phase

Once testing is complete and all critical bugs are fixed, proceed to **Phase 8: Migration & Deployment**.

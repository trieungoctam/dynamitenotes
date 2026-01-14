# Phase 2: Database Schema Migration

**Status**: `pending`
**Duration**: 2 hours
**Dependencies**: Phase 1 complete

---

## Objectives

Add S3 metadata fields to `Photo` and `Post` tables, create Prisma migration, and backfill existing records.

---

## Prerequisites

- Phase 1 infrastructure deployed
- Prisma CLI installed
- Database access (local or remote)

---

## Tasks

### 2.1 Update Prisma Schema (30 min)

**File**: `prisma/schema.prisma`

**Photo Model Changes**:
```prisma
model Photo {
  id            String      @id @default(uuid())
  url           String                    // Legacy: Supabase URL
  s3Key         String?     @map("s3_key")         // NEW
  s3Bucket      String?     @map("s3_bucket")      // NEW
  cdnUrl        String?     @map("cdn_url")        // NEW
  fileSize      BigInt?     @map("file_size")      // NEW: bytes
  fileType      String?     @map("file_type")      // NEW: MIME type
  width         Int?        @map("width")          // NEW: pixels
  height        Int?       @map("height")         // NEW: pixels
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

**Post Model Changes**:
```prisma
model Post {
  id                   String              @id @default(uuid())
  // ... existing fields ...
  coverImage           String?             @map("cover_image")              // Legacy
  coverImageS3Key      String?             @map("cover_image_s3_key")       // NEW
  coverImageCdnUrl     String?             @map("cover_image_cdn_url")      // NEW
  coverImageFileSize   BigInt?             @map("cover_image_file_size")    // NEW
  coverImageWidth      Int?                @map("cover_image_width")        // NEW
  coverImageHeight     Int?                @map("cover_image_height")       // NEW
  // ... rest of fields ...
}
```

---

### 2.2 Create Migration (30 min)

**Generate migration**:
```bash
npx prisma migrate dev --name add_s3_image_metadata
```

**Expected SQL** (generated):
```sql
-- AlterTable: Add S3 fields to photos
ALTER TABLE "photos"
  ADD COLUMN "s3_key" VARCHAR(255),
  ADD COLUMN "s3_bucket" VARCHAR(100),
  ADD COLUMN "cdn_url" VARCHAR(500),
  ADD COLUMN "file_size" BIGINT,
  ADD COLUMN "file_type" VARCHAR(50),
  ADD COLUMN "width" INTEGER,
  ADD COLUMN "height" INTEGER;

-- AlterTable: Add S3 fields to posts
ALTER TABLE "posts"
  ADD COLUMN "cover_image_s3_key" VARCHAR(255),
  ADD COLUMN "cover_image_cdn_url" VARCHAR(500),
  ADD COLUMN "cover_image_file_size" BIGINT,
  ADD COLUMN "cover_image_width" INTEGER,
  ADD COLUMN "cover_image_height" INTEGER;
```

---

### 2.3 Backfill Existing Records (30 min)

**Purpose**: Set default values for existing records to maintain compatibility

**Script**: `scripts/backfill-s3-metadata.ts`

```typescript
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function backfill() {
  // Backfill photos
  const photos = await prisma.photo.findMany({
    where: { s3Key: null }
  })

  for (const photo of photos) {
    await prisma.photo.update({
      where: { id: photo.id },
      data: {
        s3Bucket: 'dynamite-notes-images',
        cdnUrl: photo.url, // Use existing URL as CDN URL
        fileType: 'image/webp',
      }
    })
  }

  // Backfill posts
  const posts = await prisma.post.findMany({
    where: { coverImage: { not: null }, coverImageS3Key: null }
  })

  for (const post of posts) {
    await prisma.post.update({
      where: { id: post.id },
      data: {
        coverImageCdnUrl: post.coverImage,
        coverImageFileType: 'image/webp',
      }
    })
  }

  console.log(`Backfilled ${photos.length} photos, ${posts.length} posts`)
}

backfill().catch(console.error)
```

**Run**:
```bash
npx tsx scripts/backfill-s3-metadata.ts
```

---

### 2.4 Update Type Generation (10 min)

```bash
npx prisma generate
```

---

### 2.5 Test Migration (20 min)

**Test Cases**:
1. Create new photo with S3 fields
2. Query existing photo (should have null S3 fields)
3. Update photo with S3 metadata
4. Delete photo (cascade works)

**Test Script**: `scripts/test-migration.ts`

```typescript
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function test() {
  // Test 1: Create with S3 fields
  const newPhoto = await prisma.photo.create({
    data: {
      url: 'https://test.com/img.jpg',
      s3Key: 'photos/test-uuid/large.webp',
      s3Bucket: 'dynamite-notes-images',
      cdnUrl: 'https://images.dynamite.vn/photos/test-uuid/large.webp',
      fileSize: 1024000,
      fileType: 'image/webp',
      width: 1920,
      height: 1080,
      captionVi: '',
      captionEn: '',
      published: false,
    }
  })
  console.log('Created:', newPhoto)

  // Test 2: Query existing
  const existing = await prisma.photo.findFirst()
  console.log('Existing:', existing)

  // Test 3: Update
  await prisma.photo.update({
    where: { id: newPhoto.id },
    data: { width: 2000 }
  })

  // Test 4: Cleanup
  await prisma.photo.delete({ where: { id: newPhoto.id } })
}

test().catch(console.error)
```

---

## Verification Checklist

- [ ] Prisma schema updated
- [ ] Migration generated successfully
- [ ] Migration runs locally
- [ ] Migration runs on remote DB
- [ ] Backfill script executes
- [ ] Existing records have S3 fields (nullable)
- [ ] Type definitions regenerated
- [ ] Test script passes
- [ ] No breaking changes to existing queries

---

## Rollback Plan

```bash
# Rollback migration
npx prisma migrate reset

# Or manually drop columns
ALTER TABLE "photos" DROP COLUMN "s3_key";
ALTER TABLE "photos" DROP COLUMN "s3_bucket";
ALTER TABLE "photos" DROP COLUMN "cdn_url";
ALTER TABLE "photos" DROP COLUMN "file_size";
ALTER TABLE "photos" DROP COLUMN "file_type";
ALTER TABLE "photos" DROP COLUMN "width";
ALTER TABLE "photos" DROP COLUMN "height";
```

---

## Notes

- All S3 fields are nullable to support gradual migration
- Legacy `url` field kept for backward compatibility
- `cdnUrl` will be primary URL for new uploads
- Old images continue to work via Supabase URLs

---

## Next Phase

Once migration is verified, proceed to **Phase 3: Edge Functions Development**.

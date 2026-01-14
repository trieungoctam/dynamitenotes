# Phase 01: Database Schema & Migration

**Effort**: 1.5h

## Overview

Extend Prisma schema with tags, version history, and media fields for posts.

## Tasks

### 1. Update Prisma Schema

**File**: `prisma/schema.prisma`

Add models:

```prisma
model Tag {
  id        String    @id @default(uuid())
  slug      String    @unique
  nameVi    String    @map("name_vi")
  nameEn    String?   @map("name_en")
  color     String?
  createdAt DateTime  @default(now()) @map("created_at")

  posts     PostTag[]

  @@map("tags")
}

model PostTag {
  postId    String    @map("post_id")
  tagId     String    @map("tag_id")
  createdAt DateTime  @default(now()) @map("created_at")

  post      Post      @relation(fields: [postId], references: [id], onDelete: Cascade)
  tag       Tag       @relation(fields: [tagId], references: [id], onDelete: Cascade)

  @@id([postId, tagId])
  @@map("post_tags")
}

model PostVersion {
  id           String   @id @default(uuid())
  postId       String   @map("post_id")
  titleVi      String   @map("title_vi")
  titleEn      String?  @map("title_en")
  contentVi    String   @map("content_vi")
  contentEn    String?  @map("content_en")
  excerptVi    String?  @map("excerpt_vi")
  excerptEn    String?  @map("excerpt_en")
  coverImage   String?  @map("cover_image")
  changeReason String?  @map("change_reason")
  version      Int      @default(1)
  createdBy    String?  @map("created_by")
  createdAt    DateTime @default(now()) @map("created_at")

  post         Post     @relation(fields: [postId], references: [id], onDelete: Cascade)

  @@map("post_versions")
  @@index([postId])
}
```

Update Post model:

```prisma
model Post {
  // ... existing fields ...

  coverImage   String?    @map("cover_image")
  scheduledFor DateTime?  @map("scheduled_for")

  tags         PostTag[]  @relation("PostTags")
  versions     PostVersion[]
}
```

### 2. Generate Migration

```bash
prisma migrate dev --name add_tags_and_media
```

### 3. Update Database Types

**File**: `src/types/database.ts`

Add Tag, PostTag, PostVersion tables to Database type definition.

### 4. Create Supabase Storage Bucket

**Manual Steps in Supabase Console**:

1. Navigate to Storage → Create bucket
2. Bucket name: `post-media`
3. Settings:
   - Public: false
   - File size limit: 5MB
   - Allowed MIME types: `image/*`, `application/pdf`

### 5. Apply RLS Policies

**SQL in Supabase SQL Editor**:

```sql
-- Allow admins to upload
CREATE POLICY "Admins can upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'post-media'
  AND EXISTS (
    SELECT 1 FROM admins WHERE admins.user_id = auth.uid()
  )
);

-- Allow admins to read
CREATE POLICY "Admins can read"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'post-media'
  AND EXISTS (
    SELECT 1 FROM admins WHERE admins.user_id = auth.uid()
  )
);

-- Allow admins to delete
CREATE POLICY "Admins can delete"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'post-media'
  AND EXISTS (
    SELECT 1 FROM admins WHERE admins.user_id = auth.uid()
  )
);
```

## Acceptance Criteria

- [ ] Migration runs without errors
- [ ] Tag, PostTag, PostVersion tables exist
- [ ] Post table has cover_image, scheduled_for columns
- [ ] Storage bucket `post-media` created
- [ ] RLS policies applied to storage bucket
- [ ] TypeScript types updated

## Rollback

```bash
prisma migrate resolve --rolled-back add_tags_and_media
```

Delete storage bucket in Supabase console.

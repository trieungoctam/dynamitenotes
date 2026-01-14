---
title: "Enhance PostsAdmin with Media Upload and Workflow"
description: "Add Supabase Storage media uploads, tags/categories, bulk actions, and enhanced workflow to existing PostsAdmin page"
status: completed
priority: P2
effort: 10h
issue: none
branch: main
tags: [feature, frontend, backend, database, auth]
created: 2026-01-14
completed: 2026-01-14
---

# Plan: Enhance PostsAdmin with Media Upload and Workflow

## Overview

Enhance existing `PostsAdmin` page (`src/pages/admin/PostsAdmin.tsx`) to add:
1. **Supabase Storage integration** for image/file uploads
2. **Tags/Categories management** via new taxonomy types
3. **Bulk actions** (publish/unpublish/delete)
4. **Enhanced filtering** and sorting UI
5. **Admin auth check** using existing `admins` table

**Existing Infrastructure**: Project has Supabase auth, PostgreSQL with Prisma, TanStack Query, and working PostsAdmin with basic CRUD.

---

## Current State Analysis

### Existing Database Schema
```prisma
model Post {
  id          String        @id @default(uuid())
  slug        String        @unique
  titleVi     String        @map("title_vi")
  titleEn     String?       @map("title_en")
  contentVi   String        @map("content_vi")
  contentEn   String?       @map("content_en")
  excerptVi   String?       @map("excerpt_vi")
  excerptEn   String?       @map("excerpt_en")
  level       PostLevel?    // starter, builder, advanced
  readTime    Int?          @map("read_time")
  featured    Boolean       @default(false)
  published   Boolean       @default(false)
  publishedAt DateTime?     @map("published_at")
  goalId      String?       @map("goal_id")      // Existing relation
  outcomeId   String?       @map("outcome_id")   // Existing relation
  createdAt   DateTime      @default(now()) @map("created_at")
  updatedAt   DateTime      @updatedAt @map("updated_at")
}

model Admin {
  userId    String      @id @map("user_id")
  createdAt DateTime    @default(now()) @map("created_at")
}
```

### Existing Components
- `src/pages/admin/PostsAdmin.tsx` - List view with DataTable, search, status toggle
- `src/hooks/use-admin-posts.ts` - CRUD mutations (useAdminPosts, useCreatePost, useUpdatePost, useDeletePost, useTogglePostPublish)
- `src/components/admin/AdminLayout.tsx` - Admin wrapper layout
- `src/components/admin/DataTable.tsx` - Reusable table with sort/search
- `src/lib/supabase.ts` - Supabase client

### Gaps
1. No tags/categories for posts
2. No media upload functionality
3. No bulk actions UI
4. No admin auth enforcement on routes
5. Limited filtering options

---

## Solution Design

### Phase 1: Database Schema Extensions

#### 1.1 Add Tags Table
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
```

#### 1.2 Update Post Model
```prisma
model Post {
  // ... existing fields ...

  coverImage     String?    @map("cover_image")     // NEW: Featured image
  scheduledFor   DateTime?  @map("scheduled_for")   // NEW: Scheduled publish

  tags           PostTag[]  @relation("PostTags")    // NEW: Many-to-many
}
```

### Phase 2: Supabase Storage Setup

#### 2.1 Storage Bucket Configuration
**Manual Supabase Console Steps**:
1. Create storage bucket: `post-media`
2. **Bucket Settings**:
   - Public: false (use signed URLs)
   - Allowed MIME types: `image/*`, `application/pdf`
   - Max file size: 10MB
3. **RLS Policy**:
```sql
-- Allow authenticated admins to upload
CREATE POLICY "Admins can upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'post-media'
  AND (
    SELECT EXISTS (
      SELECT 1 FROM admins
      WHERE admins.user_id = auth.uid()
    )
  )
);

-- Allow authenticated admins to read
CREATE POLICY "Admins can read"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'post-media'
  AND (
    SELECT EXISTS (
      SELECT 1 FROM admins
      WHERE admins.user_id = auth.uid()
    )
  )
);

-- Allow authenticated admins to delete
CREATE POLICY "Admins can delete"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'post-media'
  AND (
    SELECT EXISTS (
      SELECT 1 FROM admins
      WHERE admins.user_id = auth.uid()
    )
  )
);
```

### Phase 3: Frontend Components

#### 3.1 Media Upload Component
**File**: `src/components/admin/MediaUpload.tsx`

**Features**:
- Drag-drop zone
- File validation (type, size: 10MB)
- Image preview
- Progress indicator
- Compression using `browser-image-compression`
- Delete uploaded file

**Key Props**:
```typescript
interface MediaUploadProps {
  onUpload: (url: string, path: string) => void;
  onRemove: () => void;
  currentUrl?: string;
  accept?: string; // MIME types
  maxSize?: number; // bytes
  bucket?: string; // Supabase bucket name
}
```

**Implementation Approach**:
1. Use `@supabase/storage-js` (part of @supabase/supabase-js)
2. Compress images client-side before upload
3. Generate signed URLs for private bucket
4. Show upload progress with `useUploadMedia` hook

#### 3.2 Tags Selector Component
**File**: `src/components/admin/TagsSelector.tsx`

**Features**:
- Search/create tags inline
- Multi-select with autocomplete
- Color picker for new tags
- Display existing tags as badges

**Key Props**:
```typescript
interface TagsSelectorProps {
  selectedTags: Tag[];
  availableTags: Tag[];
  onChange: (tags: Tag[]) => void;
  onCreate?: (name: string) => Promise<Tag>;
}
```

#### 3.3 Bulk Actions Bar
**File**: `src/components/admin/BulkActionsBar.tsx`

**Features**:
- Checkbox selection in DataTable
- Bulk publish/unpublish
- Bulk delete
- Bulk add tags
- Select all functionality

**Integration**: Modify `DataTable` component to support row selection

#### 3.4 Enhanced Filters
**File**: Enhance `PostsAdmin.tsx`

**Add**:
- Status filter (all/published/draft/scheduled)
- Tag filter dropdown
- Level filter (starter/builder/advanced)
- Featured toggle
- Date range picker

### Phase 4: Hooks & API

#### 4.1 Media Upload Hook
**File**: `src/hooks/use-media-upload.ts`

```typescript
export function useMediaUpload() {
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);

  const upload = async (file: File, path: string) => {
    // 1. Compress if image
    // 2. Upload to Supabase Storage
    // 3. Generate signed URL
    // 4. Return URL
  };

  const remove = async (path: string) => {
    // Delete from Supabase Storage
  };

  return { upload, remove, progress, uploading };
}
```

#### 4.2 Tags Hook
**File**: `src/hooks/use-tags.ts`

```typescript
export function useTags() {
  return useQuery({
    queryKey: ["tags"],
    queryFn: async () => {
      const { data } = await supabase
        .from("tags")
        .select("*")
        .order("name_vi");
      return data;
    },
  });
}

export function useCreateTag() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (tag: InsertTag) => { /* ... */ },
    onSuccess: () => {
      queryClient.invalidateQueries(["tags"]);
    },
  });
}

export function useUpdatePostTags() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ postId, tagIds }: { postId: string; tagIds: string[] }) => {
      // Delete existing PostTag entries
      // Insert new PostTag entries
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["admin", "posts"]);
    },
  });
}
```

#### 4.3 Bulk Actions Hook
**File**: `src/hooks/use-bulk-post-actions.ts`

```typescript
export function useBulkPublish() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ postIds, published }: { postIds: string[]; published: boolean }) => {
      await supabase
        .from("posts")
        .update({ published, published_at: published ? new Date().toISOString() : null })
        .in("id", postIds);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["admin", "posts"]);
    },
  });
}

export function useBulkDelete() {
  // Similar implementation
}
```

#### 4.4 Admin Auth Hook
**File**: `src/hooks/use-admin-auth.ts`

```typescript
export function useAdminAuth() {
  const { data: session } = useSession();
  const { data: isAdmin, isLoading } = useQuery({
    queryKey: ["admin-check", session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return false;
      const { data } = await supabase
        .from("admins")
        .select("user_id")
        .eq("user_id", session.user.id)
        .single();
      return !!data;
    },
    enabled: !!session?.user?.id,
  });

  return { isAdmin, isLoading };
}
```

### Phase 5: Admin Route Protection

**File**: `src/components/admin/AdminProtectedRoute.tsx`

```typescript
export function AdminProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAdmin, isLoading } = useAdminAuth();
  const navigate = useNavigate();

  if (isLoading) return <LoadingSpinner />;
  if (!isAdmin) {
    useEffect(() => navigate("/"), [isAdmin]);
    return null;
  }
  return <>{children}</>;
}
```

**Update**: Wrap all admin routes in `App.tsx`

---

## Phase Breakdown

### Phase 1: Database Schema & Migration
**Effort**: 1.5h

**Tasks**:
1. Update `prisma/schema.prisma` with Tag, PostTag models
2. Add PostVersion model for version history
3. Add cover_image, scheduled_for to Post model
4. Run `prisma migrate dev --name add_tags_and_media`
5. Update `src/types/database.ts` with new types
6. Create Supabase storage bucket in console
7. Apply RLS policies

**Files**:
- `prisma/schema.prisma` (modify)
- `src/types/database.ts` (modify)

#### Additional Schema for Version History
```prisma
model PostVersion {
  id          String   @id @default(uuid())
  postId      String   @map("post_id")
  titleVi     String   @map("title_vi")
  titleEn     String?  @map("title_en")
  contentVi   String   @map("content_vi")
  contentEn   String?  @map("content_en")
  excerptVi   String?  @map("excerpt_vi")
  excerptEn   String?  @map("excerpt_en")
  coverImage  String?  @map("cover_image")
  changeReason String? @map("change_reason")  // "Created", "Updated title", etc.
  version     Int      @default(1)
  createdBy   String?  @map("created_by")     // auth.uid()
  createdAt   DateTime @default(now()) @map("created_at")

  post        Post     @relation(fields: [postId], references: [id], onDelete: Cascade)

  @@map("post_versions")
  @@index([postId])
}
```

---

### Phase 2: Media Upload Infrastructure
**Effort**: 2h

**Tasks**:
1. Create `use-media-upload.ts` hook
2. Create `MediaUpload.tsx` component
3. Add to post edit form
4. Test compression and upload

**Files**:
- `src/hooks/use-media-upload.ts` (create)
- `src/components/admin/MediaUpload.tsx` (create)
- `src/pages/admin/PostEdit.tsx` (modify - if exists, or create)

---

### Phase 3: Tags System
**Effort**: 2h

**Tasks**:
1. Create `use-tags.ts` hook (CRUD operations)
2. Create `TagsSelector.tsx` component
3. Integrate into post edit form
4. Display tags in PostsAdmin table

**Files**:
- `src/hooks/use-tags.ts` (create)
- `src/components/admin/TagsSelector.tsx` (create)
- `src/pages/admin/PostsAdmin.tsx` (modify)
- Post edit form (modify)

---

### Phase 4: Bulk Actions
**Effort**: 1.5h

**Tasks**:
1. Add checkbox selection to `DataTable.tsx`
2. Create `BulkActionsBar.tsx`
3. Create `use-bulk-post-actions.ts`
4. Integrate into PostsAdmin

**Files**:
- `src/components/admin/DataTable.tsx` (modify)
- `src/components/admin/BulkActionsBar.tsx` (create)
- `src/hooks/use-bulk-post-actions.ts` (create)
- `src/pages/admin/PostsAdmin.tsx` (modify)

---

### Phase 5: Enhanced Filters & Admin Auth
**Effort**: 1.5h

**Tasks**:
1. Create `use-admin-auth.ts` hook
2. Create `AdminProtectedRoute.tsx`
3. Wrap admin routes in `App.tsx`
4. Add filter UI to PostsAdmin
5. Add sort dropdown

**Files**:
- `src/hooks/use-admin-auth.ts` (create)
- `src/components/admin/AdminProtectedRoute.tsx` (create)
- `src/App.tsx` (modify)
- `src/pages/admin/PostsAdmin.tsx` (modify)

---

### Phase 6: Version History System
**Effort**: 2h

**Tasks**:
1. Create `use-post-versions.ts` hook (fetch, create, rollback)
2. Add version tracking to `useUpdatePost` hook
3. Create `VersionHistory.tsx` component (timeline view)
4. Create `RollbackConfirmDialog.tsx` component
5. Integrate into post edit form

**Files**:
- `src/hooks/use-post-versions.ts` (create)
- `src/hooks/use-admin-posts.ts` (modify - add version creation on update)
- `src/components/admin/VersionHistory.tsx` (create)
- `src/components/admin/RollbackConfirmDialog.tsx` (create)
- Post edit form (modify)

#### Version History Hook Pattern
```typescript
export function usePostVersions(postId: string) {
  return useQuery({
    queryKey: ["post-versions", postId],
    queryFn: async () => {
      const { data } = await supabase
        .from("post_versions")
        .select("*")
        .eq("post_id", postId)
        .order("version", { ascending: false });
      return data;
    },
  });
}

export function useRollbackVersion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ postId, versionId }: { postId: string; versionId: string }) => {
      // 1. Fetch version data
      // 2. Update post with version data
      // 3. Create new version entry for rollback action
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["admin", "posts"]);
      queryClient.invalidateQueries(["post-versions"]);
    },
  });
}
```

---

### Phase 7: Edge Function for Scheduled Publishing
**Effort**: 1h

**Tasks**:
1. Create Supabase Edge Function `scheduled-publisher`
2. Deploy to Supabase project
3. Set up cron job (every minute)
4. Test scheduling and auto-publishing

**Files**:
- `supabase/functions/scheduled-publisher/index.ts` (create)

#### Edge Function Implementation
```typescript
// supabase/functions/scheduled-publisher/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("posts")
    .select("id")
    .eq("published", false)
    .lte("scheduled_for", now);

  if (error) return new Response(JSON.stringify({ error }), { status: 500 });

  if (data && data.length > 0) {
    const postIds = data.map((p) => p.id);
    await supabase
      .from("posts")
      .update({
        published: true,
        published_at: now,
        scheduled_for: null,
      })
      .in("id", postIds);
  }

  return new Response(JSON.stringify({ published: data?.length || 0 }));
});
```

**Deployment**:
```bash
supabase functions deploy scheduled-publisher
# Set up cron in Supabase dashboard: Functions → scheduled-publisher → Cron: * * * * *
```

---

## Security Considerations

### Auth & Authorization
- **Admin check**: Query `admins` table on mount
- **RLS on posts**: Ensure users can't modify posts without admin access
- **RLS on storage**: Prevent unauthorized file access

### File Upload Validation
- **Client-side**: Check file type, size before upload
- **Server-side**: Supabase storage policies enforce MIME types
- **Compression**: Reduce attack surface via image bombs

### CSRF Protection
- TanStack Query handles CSRF via Supabase auth headers
- No additional action needed

---

## Performance Considerations

### Image Optimization
- Compress client-side before upload (target: < 500KB)
- Generate thumbnails server-side (future: Supabase Edge Functions)
- Lazy load images in admin UI

### Query Optimization
- Select only needed fields in `useAdminPosts`
- Add index on `posts.cover_image`, `posts.scheduled_for`
- Use pagination if posts exceed 100 (future)

### Caching
- TanStack Query caches tag list (5min staleTime)
- Invalidate cache on mutations

---

## Testing Strategy

### Manual Testing Checklist
- [ ] Upload image (JPEG, PNG)
- [ ] Upload PDF
- [ ] Upload oversized file (> 10MB) - should fail
- [ ] Delete uploaded image
- [ ] Create tag and assign to post
- [ ] Remove tag from post
- [ ] Bulk publish 3 posts
- [ ] Bulk delete 2 posts
- [ ] Filter by tag
- [ ] Filter by status (draft/published)
- [ ] Non-admin user cannot access /admin routes

### Future: Automated Tests
- Vitest for hooks (use-media-upload, use-tags)
- React Testing Library for components
- Supabase mock for storage operations

---

## Rollback Plan

If issues arise:
1. **Database**: `prisma migrate resolve --rolled-back [migration-name]`
2. **Storage**: Delete RLS policies in Supabase console
3. **Code**: Git revert to pre-implementation commit

---

## User Decisions

### Scheduled Posts
**Decision**: Yes, auto-publish via Edge Function
- Implement Supabase Edge Function (cron job)
- Runs every minute to check `scheduled_for` <= now
- Updates `published = true` and sets `published_at`

### File Size Limit
**Decision**: 5MB max
- Enforce client-side validation
- Enforce via Supabase storage policy
- Compress images before upload

### Version History
**Decision**: Yes, full history
- Add `post_versions` table to schema
- Track all create/update operations
- Add rollback UI in post edit form

## Open Questions

None - all decisions finalized.

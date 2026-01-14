# Admin Patterns & Database Schema Exploration

**Date:** 2026-01-15  
**Task:** Explore existing admin patterns, database schema, and shared components for creating Resume, Photos, and About admin pages.

---

## 1. Existing Admin Pages Structure

### CRUD Pattern Files

| File | Path | Pattern |
|------|------|---------|
| PostsAdmin | `/src/pages/admin/PostsAdmin.tsx` | DataTable + filters + bulk actions |
| InsightsAdmin | `/src/pages/admin/InsightsAdmin.tsx` | DataTable + pin/publish toggles |
| SeriesAdmin | `/src/pages/admin/SeriesAdmin.tsx` | DataTable + publish toggle |
| PhotosAdmin | `/src/pages/admin/PhotosAdmin.tsx` | Grid layout + multi-file upload |

### Admin Page Pattern (Standard)

All admin pages follow this structure:

```tsx
export default function EntityAdmin() {
  const navigate = useNavigate();
  const { data: items, isLoading } = useAdminEntity();
  const deleteItem = useDeleteEntity();
  const togglePublish = useToggleEntityPublish();

  const columns: Column<EntityRow>[] = [
    { key: "title", header: "Title", sortable: true, render: ... },
    { key: "published", header: "Status", sortable: true, render: ... },
    // ...
  ];

  const actions = (item: EntityRow) => (
    <div className="flex items-center gap-1">
      <Button onClick={() => handleTogglePublish(...)}>
        {published ? <EyeOff /> : <Eye />}
      </Button>
      <Button onClick={() => navigate(`/admin/entity/${id}`)}>
        <Edit />
      </Button>
      <AlertDialog>...</AlertDialog>
    </div>
  );

  return (
    <AdminLayout>
      {/* Header with title + New button */}
      {/* Filters (Select components) */}
      {/* DataTable with columns + actions */}
    </AdminLayout>
  );
}
```

### Key Components Used

- **DataTable** (`/src/components/admin/DataTable.tsx`)
  - Sorting, pagination, search
  - Row selection (checkbox)
  - Custom cell renderers
  - Actions column

- **AdminLayout** (`/src/components/admin/AdminLayout.tsx`)
  - Wraps content with AdminSidebar
  - Fixed sidebar + scrollable main content

- **AdminSidebar** (`/src/components/admin/AdminSidebar.tsx`)
  - Nav items: Dashboard, Posts, Insights, Series, Photos, **Resume**, **About**
  - Active route highlighting
  - Sign out button

- **BulkActionsBar** (`/src/components/admin/BulkActionsBar.tsx`)
  - Publish/Unpublish selected items
  - Bulk delete with confirmation

---

## 2. Database Schema (Prisma)

### Relevant Models

```prisma
// Photo model - EXISTS
model Photo {
  id           String      @id @default(uuid())
  url          String
  thumbnailUrl String?     @map("thumbnail_url")
  captionVi    String?     @map("caption_vi")
  captionEn    String?     @map("caption_en")
  album        String?
  sortOrder    Int         @default(0) @map("sort_order")
  published    Boolean     @default(false)
  takenAt      DateTime?   @map("taken_at")
  createdAt    DateTime    @default(now()) @map("created_at")

  @@map("photos")
}

// About model - EXISTS (singleton)
model About {
  id           String      @id @default(uuid())
  bioVi        String      @map("bio_vi")
  bioEn        String?     @map("bio_en")
  principlesVi String?     @map("principles_vi")
  principlesEn String?     @map("principles_en")
  socialLinks  Json        @map("social_links")
  updatedAt    DateTime    @updatedAt @map("updated_at")

  @@map("about")
}

// Resume model - EXISTS
model ResumeSection {
  id        String            @id @default(uuid())
  type      ResumeSectionType
  titleVi   String            @map("title_vi")
  titleEn   String?           @map("title_en")
  content   Json
  sortOrder Int               @default(0) @map("sort_order")
  createdAt DateTime          @default(now()) @map("created_at")
  updatedAt DateTime          @updatedAt @map("updated_at")

  @@map("resume_sections")
}

enum ResumeSectionType {
  highlight
  experience
  project
  writing
  speaking
}
```

### Schema Status

| Table | Status | Notes |
|-------|--------|-------|
| `photos` | ✅ EXISTS | Admin page exists at `/src/pages/admin/PhotosAdmin.tsx` |
| `about` | ✅ EXISTS | **No admin page yet** - singleton pattern |
| `resume_sections` | ✅ EXISTS | **No admin page yet** - uses JSONB for content |

---

## 3. Shared Components

### Admin Components

| Component | Path | Purpose |
|-----------|------|---------|
| AdminLayout | `/src/components/admin/AdminLayout.tsx` | Main layout wrapper |
| AdminSidebar | `/src/components/admin/AdminSidebar.tsx` | Navigation sidebar |
| DataTable | `/src/components/admin/DataTable.tsx` | Sortable, paginated table |
| BulkActionsBar | `/src/components/admin/BulkActionsBar.tsx` | Bulk publish/delete |
| MarkdownEditor | `/src/components/admin/MarkdownEditor.tsx` | WYSIWYG markdown editor |
| MediaUpload | `/src/components/admin/MediaUpload.tsx` | Drag-drop file upload |
| TagsSelector | `/src/components/admin/TagsSelector.tsx` | Multi-select tag input |
| AdminProtectedRoute | `/src/components/admin/AdminProtectedRoute.tsx` | Auth guard |

### Form Components (shadcn/ui)

- Button, Input, Label, Select, Textarea, Dialog, AlertDialog, Badge

---

## 4. Routing Structure

### App Routes (`/src/App.tsx`)

```tsx
// Public routes
<Route path="/" element={<Index />} />
<Route path="/resume" element={<Resume />} />
<Route path="/about" element={<About />} />
<Route path="/photos" element={<Photos />} />

// Admin routes (with ProtectedRoute)
<Route path="/admin" element={<AdminDashboard />} />
<Route path="/admin/posts" element={<PostsAdmin />} />
<Route path="/admin/posts/:id" element={<PostEditor />} />
<Route path="/admin/insights" element={<InsightsAdmin />} />
<Route path="/admin/insights/:id" element={<InsightEditor />} />
<Route path="/admin/series" element={<SeriesAdmin />} />
<Route path="/admin/series/:id" element={<SeriesEditor />} />
<Route path="/admin/photos" element={<PhotosAdmin />} />

// MISSING ADMIN ROUTES:
// /admin/resume (not exists)
// /admin/about (not exists)
```

### Route Protection

- All admin routes wrapped in `<ProtectedRoute>` (checks auth)
- Admin-specific check: `<AdminProtectedRoute>` (redirects non-admins)

---

## 5. Storage Setup

### Supabase Storage

| Bucket | Purpose | Used By |
|--------|---------|---------|
| `post-images` | Post cover images | useUpload hook |
| `photos` | Photo gallery images | PhotosAdmin |

### Upload Hook (`/src/hooks/use-upload.ts`)

```tsx
const { upload, uploading, progress, error } = useUpload("photos");
const url = await upload(file, { path: "album/filename.jpg" });
```

**Features:**
- Image compression (max 800KB, 1920px)
- Progress tracking
- Auto filename generation
- Public URL returned

---

## 6. Hooks Patterns

### Admin Hooks Structure

```tsx
// Fetch all items
export function useAdminEntities() {
  return useQuery({
    queryKey: ["admin", "entities"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("entities")
        .select("*")
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

// Create
export function useCreateEntity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (entity: EntityInsert) => { ... },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "entities"] });
    },
  });
}

// Update
export function useUpdateEntity() { ... }
// Delete
export function useDeleteEntity() { ... }
// Toggle publish
export function useToggleEntityPublish() { ... }
```

### Existing Hooks

| Hook | Path | Entity |
|------|------|--------|
| useAdminPosts | `/src/hooks/use-admin-posts.ts` | Posts |
| useAdminInsights | `/src/hooks/use-admin-insights.ts` | Insights |
| useAdminSeries | `/src/hooks/use-admin-series.ts` | Series |
| useAdminPhotos | `/src/hooks/use-admin-photos.ts` | Photos |
| useAbout | `/src/hooks/use-about.ts` | About (public only) |
| useResumeSections | `/src/hooks/use-resume.ts` | Resume (public only) |

**Missing:** `use-admin-about.ts`, `use-admin-resume.ts`

---

## 7. Gaps & Missing Pieces

### For Resume Admin Page

1. **Create:** `/src/pages/admin/ResumeAdmin.tsx`
   - Table of resume sections (grouped by type)
   - Add/Edit/Delete section buttons
   - Reorder sections (drag-drop)

2. **Create:** `/src/pages/admin/ResumeSectionEditor.tsx`
   - Form for editing section title + JSON content
   - Type-specific form fields based on `ResumeSectionType`

3. **Create:** `/src/hooks/use-admin-resume.ts`
   - useAdminResumeSections()
   - useCreateResumeSection()
   - useUpdateResumeSection()
   - useDeleteResumeSection()
   - useReorderResumeSections()

### For About Admin Page

1. **Create:** `/src/pages/admin/AboutAdmin.tsx`
   - Single page form (singleton pattern)
   - Bio VI/EN (MarkdownEditor)
   - Principles VI/EN (MarkdownEditor)
   - Social links (JSON form)

2. **Create:** `/src/hooks/use-admin-about.ts`
   - useAdminAbout()
   - useUpdateAbout()

### Routing Updates

Add to `/src/App.tsx`:

```tsx
<Route
  path="/admin/resume"
  element={
    <ProtectedRoute>
      <Suspense fallback={<AdminSkeleton />}>
        <ResumeAdmin />
      </Suspense>
    </ProtectedRoute>
  }
/>
<Route
  path="/admin/resume/:id"
  element={
    <ProtectedRoute>
      <Suspense fallback={<AdminSkeleton />}>
        <ResumeSectionEditor />
      </Suspense>
    </ProtectedRoute>
  }
/>
<Route
  path="/admin/about"
  element={
    <ProtectedRoute>
      <Suspense fallback={<AdminSkeleton />}>
        <AboutAdmin />
      </Suspense>
    </ProtectedRoute>
  }
/>
```

---

## 8. Reusable Patterns

### DataTable Usage

```tsx
<DataTable
  selectable
  selectedIds={selectedIds}
  onSelectionChange={setSelectedIds}
  data={filteredItems}
  columns={columns}
  searchKey="title_vi"
  searchPlaceholder="Search..."
  onRowClick={(item) => navigate(`/admin/entity/${item.id}`)}
  actions={actions}
  emptyMessage="No items found"
/>
```

### Filter Pattern

```tsx
<Select value={statusFilter} onValueChange={setStatusFilter}>
  <SelectTrigger className="w-[150px]">
    <SelectValue placeholder="Status" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="all">All Status</SelectItem>
    <SelectItem value="published">Published</SelectItem>
    <SelectItem value="draft">Draft</SelectItem>
  </SelectContent>
</Select>
```

### Delete Confirmation

```tsx
<AlertDialog>
  <AlertDialogTrigger asChild>
    <Button variant="ghost" size="icon">
      <Trash2 className="w-4 h-4 text-destructive" />
    </Button>
  </AlertDialogTrigger>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Delete Item</AlertDialogTitle>
      <AlertDialogDescription>
        Are you sure? This action cannot be undone.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancel</AlertDialogCancel>
      <AlertDialogAction onClick={() => handleDelete(id)}>
        Delete
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

---

## Summary

**Existing infrastructure is solid:**
- ✅ Database tables exist (`photos`, `about`, `resume_sections`)
- ✅ Shared components ready (DataTable, MarkdownEditor, MediaUpload)
- ✅ Hooks pattern established
- ✅ Routing structure in place
- ✅ Supabase storage configured

**What needs to be built:**
- ❌ `/src/pages/admin/ResumeAdmin.tsx`
- ❌ `/src/pages/admin/ResumeSectionEditor.tsx`
- ❌ `/src/pages/admin/AboutAdmin.tsx`
- ❌ `/src/hooks/use-admin-resume.ts`
- ❌ `/src/hooks/use-admin-about.ts`
- ❌ Add routes to `/src/App.tsx`

**Files to reference:**
- `/src/pages/admin/PostsAdmin.tsx` - Full CRUD with filters
- `/src/pages/admin/PhotosAdmin.tsx` - Grid + upload pattern
- `/src/hooks/use-admin-posts.ts` - Hook pattern
- `/src/components/admin/DataTable.tsx` - Reusable table

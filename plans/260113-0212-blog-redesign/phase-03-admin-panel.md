# Phase 3: Admin Panel

## Context Links
- [Main Plan](./plan.md)
- [Markdown & i18n Research](./reports/researcher-260113-0220-markdown-i18n.md)
- [Supabase Patterns Research](./research/researcher-supabase-patterns.md)
- Dependencies: Phase 1 (Foundation), Phase 2 (Content Pages)

## Overview

| Field | Value |
|-------|-------|
| Date | 2026-01-13 |
| Priority | P1 |
| Effort | 10h |
| Status | completed |
| Review | pending |

**Goal:** Build admin panel for content management with Markdown editor, image upload, CRUD for all content types.

## Key Insights (from research)

- @uiw/react-md-editor for split-pane editing
- browser-image-compression before upload
- Supabase Storage for images
- TanStack Query mutations for CRUD

## Requirements

1. Admin layout with sidebar navigation
2. Dashboard with content stats
3. Posts CRUD with Markdown editor
4. Insights CRUD (simpler form)
5. Series CRUD with post ordering
6. Photos upload and management
7. Image upload integration in editor

## Architecture

### New Files

```
src/
├── components/
│   └── admin/
│       ├── AdminLayout.tsx       # Sidebar + main content
│       ├── AdminSidebar.tsx      # Navigation sidebar
│       ├── MarkdownEditor.tsx    # Split-pane MD editor
│       ├── ImageUploader.tsx     # Drag-drop image upload
│       ├── DataTable.tsx         # Reusable data table
│       ├── TaxonomySelect.tsx    # Goal/Outcome dropdown
│       └── PublishToggle.tsx     # Draft/Published switch
├── pages/
│   └── admin/
│       ├── Dashboard.tsx         # Overview stats
│       ├── PostsAdmin.tsx        # Posts list
│       ├── PostEditor.tsx        # Create/Edit post
│       ├── InsightsAdmin.tsx     # Insights list
│       ├── InsightEditor.tsx     # Create/Edit insight
│       ├── SeriesAdmin.tsx       # Series list
│       ├── SeriesEditor.tsx      # Create/Edit series
│       ├── PhotosAdmin.tsx       # Photos grid
│       └── Login.tsx             # Admin login
└── hooks/
    ├── use-admin-posts.ts        # Posts mutations
    ├── use-admin-insights.ts     # Insights mutations
    ├── use-admin-series.ts       # Series mutations
    └── use-upload.ts             # Image upload hook
```

### Files to Modify

- `src/App.tsx` - Add admin routes with ProtectedRoute

## Implementation Steps

### 1. Install Editor Dependencies (15min)

```bash
bun add @uiw/react-md-editor browser-image-compression
```

### 2. Create AdminLayout (45min)

**File:** `src/components/admin/AdminLayout.tsx`

```typescript
interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="min-h-screen bg-background flex">
      <AdminSidebar />
      <main className="flex-1 p-6 overflow-auto">
        {children}
      </main>
    </div>
  );
}
```

### 3. Create AdminSidebar (30min)

**File:** `src/components/admin/AdminSidebar.tsx`

Links:
- Dashboard (/admin)
- Posts (/admin/posts)
- Insights (/admin/insights)
- Series (/admin/series)
- Photos (/admin/photos)
- Resume (/admin/resume)
- About (/admin/about)
- Settings (/admin/settings)
- Sign Out

### 4. Create Login Page (45min)

**File:** `src/pages/admin/Login.tsx`

- Email/password form
- Call supabase.auth.signInWithPassword
- Redirect to /admin on success
- Show error toast on failure

### 5. Create Dashboard (1h)

**File:** `src/pages/admin/Dashboard.tsx`

Stats cards:
- Total posts (published/draft)
- Total insights
- Total photos
- Total series

Recent activity:
- Last 5 updated items

Quick actions:
- New Post, New Insight buttons

### 6. Create MarkdownEditor (1.5h)

**File:** `src/components/admin/MarkdownEditor.tsx`

```typescript
import MDEditor from '@uiw/react-md-editor';

interface Props {
  value: string;
  onChange: (value: string) => void;
  onImageUpload?: (file: File) => Promise<string>;
}

export function MarkdownEditor({ value, onChange, onImageUpload }: Props) {
  // Custom image upload command
  const imageCommand = {
    name: 'image',
    keyCommand: 'image',
    buttonProps: { 'aria-label': 'Insert image' },
    icon: <ImageIcon />,
    execute: async (state, api) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file && onImageUpload) {
          const url = await onImageUpload(file);
          api.replaceSelection(`![${file.name}](${url})`);
        }
      };
      input.click();
    }
  };

  return (
    <MDEditor
      value={value}
      onChange={(v) => onChange(v || '')}
      height={500}
      preview="live"
      commands={[...defaultCommands, imageCommand]}
    />
  );
}
```

### 7. Create ImageUploader Hook (45min)

**File:** `src/hooks/use-upload.ts`

```typescript
import imageCompression from 'browser-image-compression';
import { supabase } from '@/lib/supabase';

export function useUpload(bucket: 'post-images' | 'photos') {
  const upload = async (file: File, path?: string) => {
    // Compress image
    const compressed = await imageCompression(file, {
      maxSizeMB: 1,
      maxWidthOrHeight: 1920,
      useWebWorker: true
    });

    // Generate filename
    const filename = path || `${Date.now()}-${file.name}`;

    // Upload to Supabase
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filename, compressed, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) throw error;

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(filename);

    return publicUrl;
  };

  return { upload };
}
```

### 8. Create DataTable Component (1h)

**File:** `src/components/admin/DataTable.tsx`

- Uses shadcn-ui Table
- Sortable columns
- Pagination
- Row actions (Edit, Delete, Publish/Unpublish)
- Search input
- Checkbox selection

### 9. Create use-admin-posts Hook (45min)

**File:** `src/hooks/use-admin-posts.ts`

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export function useCreatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (post: PostInsert) => {
      const { data, error } = await supabase
        .from('posts')
        .insert(post)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    }
  });
}

export function useUpdatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...post }: PostUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('posts')
        .update({ ...post, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    }
  });
}

export function useDeletePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    }
  });
}

export function useAdminPosts() {
  return useQuery({
    queryKey: ['admin', 'posts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('updated_at', { ascending: false });
      if (error) throw error;
      return data;
    }
  });
}
```

### 10. Create PostsAdmin Page (1h)

**File:** `src/pages/admin/PostsAdmin.tsx`

- DataTable with columns: Title, Status, Goal, Updated
- New Post button
- Row actions: Edit, Delete, Toggle Publish
- Filter by status (draft/published)

### 11. Create PostEditor Page (1.5h)

**File:** `src/pages/admin/PostEditor.tsx`

Form fields:
- Title VI (required), Title EN
- Slug (auto-generate from title)
- Content VI (MarkdownEditor, required)
- Content EN (MarkdownEditor)
- Excerpt VI, Excerpt EN
- Goal dropdown, Outcome dropdown
- Level radio (starter/builder/advanced)
- Read time (auto-calculate or manual)
- Featured toggle
- Publish toggle

Actions:
- Save Draft
- Publish
- Preview (new tab)

### 12. Create InsightsAdmin + InsightEditor (1h)

**File:** `src/pages/admin/InsightsAdmin.tsx`, `InsightEditor.tsx`

Simpler form:
- Content VI (textarea or small editor)
- Content EN
- Tags (tag input)
- Related post (dropdown)
- Pinned toggle
- Publish toggle

### 13. Create SeriesAdmin + SeriesEditor (1h)

**File:** `src/pages/admin/SeriesAdmin.tsx`, `SeriesEditor.tsx`

Form:
- Title VI, Title EN
- Slug
- Description VI, Description EN
- Cover image upload
- Post ordering (drag-drop list)
- Featured toggle
- Publish toggle

Use dnd-kit or similar for drag-drop ordering.

### 14. Create PhotosAdmin (1h)

**File:** `src/pages/admin/PhotosAdmin.tsx`

- Grid view of photos
- Multi-file upload
- Album assignment
- Caption editor
- Delete with confirmation
- Drag-drop reorder within album

### 15. Update App.tsx Routes (30min)

```typescript
// Admin routes
<Route path="/login" element={<Login />} />
<Route path="/admin" element={<ProtectedRoute><AdminLayout><Dashboard /></AdminLayout></ProtectedRoute>} />
<Route path="/admin/posts" element={<ProtectedRoute><AdminLayout><PostsAdmin /></AdminLayout></ProtectedRoute>} />
<Route path="/admin/posts/new" element={<ProtectedRoute><AdminLayout><PostEditor /></AdminLayout></ProtectedRoute>} />
<Route path="/admin/posts/:id" element={<ProtectedRoute><AdminLayout><PostEditor /></AdminLayout></ProtectedRoute>} />
// ... similar for insights, series, photos
```

## Todo List

- [ ] Install editor dependencies
- [ ] Create AdminLayout component
- [ ] Create AdminSidebar component
- [ ] Create Login page
- [ ] Create Dashboard page
- [ ] Create MarkdownEditor component
- [ ] Create use-upload hook
- [ ] Create DataTable component
- [ ] Create use-admin-posts hook
- [ ] Create PostsAdmin page
- [ ] Create PostEditor page
- [ ] Create InsightsAdmin page
- [ ] Create InsightEditor page
- [ ] Create SeriesAdmin page
- [ ] Create SeriesEditor page
- [ ] Create PhotosAdmin page
- [ ] Update App.tsx with admin routes
- [ ] Test CRUD operations
- [ ] Test image upload

## Success Criteria

- [ ] Admin can log in with email/password
- [ ] Dashboard shows correct stats
- [ ] Posts CRUD works (create, edit, delete, publish)
- [ ] Markdown editor renders preview correctly
- [ ] Images upload and insert into markdown
- [ ] Insights CRUD works
- [ ] Series can add/reorder posts
- [ ] Photos upload in batch
- [ ] Non-admin cannot access /admin/*

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Large image uploads | Medium | Medium | Compress client-side, show progress |
| Losing edits | Medium | High | Auto-save to localStorage |
| RLS blocks admin | Low | High | Verify admin in admins table |

## Security Considerations

- All admin routes behind ProtectedRoute
- RLS policies verify admin status
- Image uploads checked for type
- No service role key in frontend
- Session timeout handling

## Next Steps

After completing Phase 3:
1. Create admin user in Supabase Auth
2. Add user to admins table
3. Seed initial content
4. Proceed to Phase 4: Portfolio Pages

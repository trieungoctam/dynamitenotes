---
title: "Implement Resume, Photos, and About Admin Pages"
description: "Add admin interfaces for managing Resume, Photos, and About page content"
status: pending
priority: P1
effort: 8h
issue: none
branch: main
tags: [admin, crud, feature]
created: 2026-01-15
completed: null
---

# Plan: Implement Resume, Photos, and About Admin Pages

## Overview

Add admin interfaces for three public pages that currently lack editing capabilities. All three pages are database-driven but have no admin UI for content management.

**Priority Order:**
1. **About Admin** (Simplest - single record, markdown editing)
2. **Photos Admin** (Medium - CRUD hooks exist, need UI)
3. **Resume Admin** (Complex - type-specific editors, reordering)

---

## Current State Analysis

### Database Status

| Table | Exists | Admin Hooks | Admin UI |
|-------|--------|-------------|----------|
| `about` | ✅ | ❌ | ❌ |
| `photos` | ✅ | ✅ | ❌ |
| `resume_sections` | ✅ | ❌ | ❌ |

### Existing Infrastructure

**Components Ready:**
- `AdminLayout` - Admin sidebar layout
- `DataTable` - Sortable, filterable data table
- `BulkActionsBar` - Bulk selection actions
- `MarkdownEditor` - From `InsightEditor`
- `MediaUpload` - From PostsAdmin
- `ProtectedRoute` - Auth protection

**Patterns to Follow:**
- PostsAdmin → Full CRUD with filters
- InsightsAdmin → Simple list + edit modal
- SeriesAdmin → Inline editing

---

## Solution Design

### Architecture

```
/admin
├── /about         → AboutAdmin (single record editor)
├── /photos        → PhotosAdmin (upload + management)
└── /resume        → ResumeAdmin (type-based CRUD)
```

### Component Hierarchy

```
AboutAdmin
├── AboutEditForm (single form)
│   ├── BioEditor (markdown, i18n)
│   ├── PrinciplesEditor (markdown, i18n)
│   ├── SocialLinksManager (add/edit/remove)
│   └── ProfileImageUpload

PhotosAdmin
├── PhotosDataTable (with preview thumbnails)
├── PhotoUploadModal (drag-drop, multi-upload)
├── PhotoEditModal (caption, album, tags)
└── AlbumManager (create/rename/delete)

ResumeAdmin
├── ResumeSectionsList (grouped by type)
├── SectionTypeSelector (highlight/experience/project/writing/speaking)
├── SectionEditModal (type-specific forms)
└── ResumeHeaderEditor (name, email, location, links)
```

---

## Phase Breakdown

### Phase 1: About Admin Page
**Effort**: 2h

**Tasks:**
1. Create `use-admin-about.ts` hooks
2. Create `AboutAdmin.tsx` page
3. Create `AboutEditForm.tsx` component
4. Add route to App.tsx

**Database:** No changes needed (`about` table exists)

**Files to Create:**
- `src/hooks/use-admin-about.ts`
- `src/pages/admin/AboutAdmin.tsx`
- `src/components/admin/AboutEditForm.tsx`

**Files to Modify:**
- `src/App.tsx` (add route)

**Data Structure:**
```typescript
interface AboutData {
  id: string;
  bio_vi: string;
  bio_en: string;
  principles_vi: string;
  principles_en: string;
  social_links: Record<string, string>;
}
```

---

### Phase 2: Photos Admin Page
**Effort**: 3h

**Tasks:**
1. Create `PhotosAdmin.tsx` page
2. Create `PhotoUploadModal.tsx` component
3. Create `PhotoEditModal.tsx` component
4. Create `AlbumManager.tsx` component
5. Add route to App.tsx

**Database:** No changes needed (`photos` table + hooks exist)

**Files to Create:**
- `src/pages/admin/PhotosAdmin.tsx`
- `src/components/admin/PhotoUploadModal.tsx`
- `src/components/admin/PhotoEditModal.tsx`
- `src/components/admin/AlbumManager.tsx`

**Files to Modify:**
- `src/App.tsx` (add route)

**Features:**
- Drag-drop upload with progress
- Thumbnail preview in table
- Album filtering in table
- Bulk publish/unpublish
- Bulk delete
- Bulk album assignment

---

### Phase 3: Resume Admin Page
**Effort**: 3h

**Tasks:**
1. Create `use-admin-resume.ts` hooks
2. Create `ResumeAdmin.tsx` page
3. Create type-specific edit forms
4. Create `ResumeHeaderEditor.tsx`
5. Add drag-drop reordering
6. Add route to App.tsx

**Database Changes:**
Optionally add `resume_header` table for personal info

**Files to Create:**
- `src/hooks/use-admin-resume.ts`
- `src/pages/admin/ResumeAdmin.tsx`
- `src/components/admin/ResumeSectionEditModal.tsx`
- `src/components/admin/ResumeHeaderEditor.tsx`

**Files to Modify:**
- `src/App.tsx` (add route)
- `src/pages/Resume.tsx` (use dynamic header)

**Section Types:**
| Type | Fields | Editor Type |
|------|--------|-------------|
| `highlight` | number, label_vi, label_en | Simple form |
| `experience` | company, role_i18n, dates, location, description_i18n | Complex form + markdown |
| `project` | title, description_i18n, tech_stack[], urls | Complex form + tags |
| `writing` | title, publisher, date, url | Simple form |
| `speaking` | title, publisher, date, url | Simple form |

---

## Implementation Details

### 1. About Admin Implementation

#### Hook: `use-admin-about.ts`

```typescript
// src/hooks/use-admin-about.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export function useAbout() {
  return useQuery({
    queryKey: ["about"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("about")
        .select("*")
        .single();

      if (error) throw error;
      return data;
    },
  });
}

export function useUpdateAbout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<AboutData>) => {
      const { error } = await supabase
        .from("about")
        .upsert({ id: "default", ...data });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["about"] });
    },
  });
}
```

#### Component: `AboutEditForm.tsx`

```typescript
// src/components/admin/AboutEditForm.tsx
interface AboutEditFormProps {
  data: AboutData;
  onSubmit: (data: Partial<AboutData>) => void;
  isLoading: boolean;
}

export function AboutEditForm({ data, onSubmit, isLoading }: AboutEditFormProps) {
  const [bioVi, setBioVi] = useState(data?.bio_vi || "");
  const [bioEn, setBioEn] = useState(data?.bio_en || "");
  const [principlesVi, setPrinciplesVi] = useState(data?.principles_vi || "");
  const [principlesEn, setPrinciplesEn] = useState(data?.principles_en || "");
  const [socialLinks, setSocialLinks] = useState<Record<string, string>>(
    data?.social_links || {}
  );

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit({
      bio_vi: bioVi,
      bio_en: bioEn,
      principles_vi: principlesVi,
      principles_en: principlesEn,
      social_links: socialLinks,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Bio Section */}
      <Tabs defaultValue="vi">
        <TabsList>
          <TabsTrigger value="vi">Vietnamese</TabsTrigger>
          <TabsTrigger value="en">English</TabsTrigger>
        </TabsList>
        <TabsContent value="vi">
          <MarkdownEditor value={bioVi} onChange={setBioVi} />
        </TabsContent>
        <TabsContent value="en">
          <MarkdownEditor value={bioEn} onChange={setBioEn} />
        </TabsContent>
      </Tabs>

      {/* Principles Section - same pattern */}

      {/* Social Links */}
      <SocialLinksEditor
        links={socialLinks}
        onChange={setSocialLinks}
      />

      {/* Profile Image Upload */}
      <ProfileImageUpload />

      <Button type="submit" disabled={isLoading}>
        Save Changes
      </Button>
    </form>
  );
}
```

#### Social Links Manager

```typescript
// src/components/admin/SocialLinksEditor.tsx
interface SocialLinksEditorProps {
  links: Record<string, string>;
  onChange: (links: Record<string, string>) => void;
}

const PLATFORMS = [
  { key: "github", label: "GitHub", icon: Github },
  { key: "twitter", label: "Twitter", icon: Twitter },
  { key: "linkedin", label: "LinkedIn", icon: Linkedin },
  { key: "email", label: "Email", icon: Mail },
];

export function SocialLinksEditor({ links, onChange }: SocialLinksEditorProps) {
  const [newPlatform, setNewPlatform] = useState("");
  const [newUrl, setNewUrl] = useState("");

  const addLink = () => {
    if (newPlatform && newUrl) {
      onChange({ ...links, [newPlatform]: newUrl });
      setNewPlatform("");
      setNewUrl("");
    }
  };

  const removeLink = (key: string) => {
    const { [key]: _, ...rest } = links;
    onChange(rest);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Social Links</h3>

      {/* Existing Links */}
      {Object.entries(links).map(([platform, url]) => (
        <div key={platform} className="flex items-center gap-2">
          <Icon icon={platform} />
          <Input value={url} onChange={(e) =>
            onChange({ ...links, [platform]: e.target.value })
          } />
          <Button onClick={() => removeLink(platform)} variant="ghost" size="sm">
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ))}

      {/* Add New Link */}
      <div className="flex gap-2">
        <Select value={newPlatform} onValueChange={setNewPlatform}>
          <SelectTrigger>
            <SelectValue placeholder="Select platform" />
          </SelectTrigger>
          <SelectContent>
            {PLATFORMS.map((p) => (
              <SelectItem key={p.key} value={p.key}>
                {p.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          placeholder="URL"
          value={newUrl}
          onChange={(e) => setNewUrl(e.target.value)}
        />
        <Button onClick={addLink} type="button">
          <Plus className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
```

---

### 2. Photos Admin Implementation

#### Page Structure

```typescript
// src/pages/admin/PhotosAdmin.tsx
export default function PhotosAdmin() {
  const { data: photos, isLoading } = useAdminPhotos();
  const { data: albums } = useAlbums();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [albumFilter, setAlbumFilter] = useState<string>("all");
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [editingPhoto, setEditingPhoto] = useState<Photo | null>(null);

  // Filter by album
  const filteredPhotos = useMemo(() => {
    if (!photos) return [];
    if (albumFilter === "all") return photos;
    return photos.filter((p) => p.album === albumFilter);
  }, [photos, albumFilter]);

  // Bulk delete
  const handleBulkDelete = async () => {
    await Promise.all(
      Array.from(selectedIds).map((id) => deletePhoto.mutateAsync(id))
    );
    setSelectedIds(new Set());
  };

  // Columns for DataTable
  const columns: Column<PhotoRow>[] = [
    {
      key: "thumbnail",
      header: "Preview",
      render: (photo) => (
        <img src={photo.thumbnail_url || photo.url} alt="" className="w-16 h-16 object-cover rounded" />
      ),
    },
    {
      key: "caption_vi",
      header: "Caption (VI)",
      render: (photo) => photo.caption_vi || "-",
    },
    {
      key: "album",
      header: "Album",
      sortable: true,
      render: (photo) => photo.album || <span className="text-muted-foreground">Uncategorized</span>,
    },
    {
      key: "published",
      header: "Status",
      render: (photo) => (
        <Badge variant={photo.published ? "default" : "secondary"}>
          {photo.published ? "Published" : "Draft"}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (photo) => (
        <div className="flex gap-2">
          <Button onClick={() => setEditingPhoto(photo)} size="sm" variant="ghost">
            <Edit className="w-4 h-4" />
          </Button>
          <Button onClick={() => handleDelete(photo.id)} size="sm" variant="ghost">
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Photos</h1>
          <Button onClick={() => setUploadModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Upload Photos
          </Button>
        </div>

        {/* Filters */}
        <div className="flex gap-4">
          <Select value={albumFilter} onValueChange={setAlbumFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All Albums" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Albums</SelectItem>
              {albums?.map((album) => (
                <SelectItem key={album.name} value={album.name}>
                  {album.name} ({album.count})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Bulk Actions */}
        {selectedIds.size > 0 && (
          <BulkActionsBar
            selectedCount={selectedIds.size}
            onClear={() => setSelectedIds(new Set())}
            actions={[
              {
                label: "Publish",
                onClick: () => handleBulkPublish(true),
              },
              {
                label: "Unpublish",
                onClick: () => handleBulkPublish(false),
              },
              {
                label: "Delete",
                onClick: handleBulkDelete,
                variant: "destructive",
              },
            ]}
          />
        )}

        {/* Photos Table */}
        <DataTable
          columns={columns}
          data={filteredPhotos}
          selectable
          selectedIds={selectedIds}
          onSelectChange={setSelectedIds}
        />

        {/* Upload Modal */}
        <PhotoUploadModal
          open={uploadModalOpen}
          onClose={() => setUploadModalOpen(false)}
        />

        {/* Edit Modal */}
        <PhotoEditModal
          photo={editingPhoto}
          onClose={() => setEditingPhoto(null)}
        />
      </div>
    </AdminLayout>
  );
}
```

#### Upload Modal Component

```typescript
// src/components/admin/PhotoUploadModal.tsx
interface PhotoUploadModalProps {
  open: boolean;
  onClose: () => void;
}

export function PhotoUploadModal({ open, onClose }: PhotoUploadModalProps) {
  const createPhoto = useCreatePhoto();
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    const newFiles = Array.from(e.dataTransfer.files).filter(
      (f) => f.type.startsWith("image/")
    );
    setFiles((prev) => [...prev, ...newFiles]);
  };

  const handleUpload = async () => {
    setUploading(true);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Upload to Supabase Storage
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}_${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("photos")
        .upload(filePath, file);

      if (uploadError) {
        console.error(uploadError);
        continue;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from("photos")
        .getPublicUrl(filePath);

      // Create photo record
      await createPhoto.mutateAsync({
        url: publicUrl,
        caption_vi: file.name,
        published: false,
      });

      setProgress(((i + 1) / files.length) * 100);
    }

    setUploading(false);
    setFiles([]);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Upload Photos</DialogTitle>
        </DialogHeader>

        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className="border-2 border-dashed rounded-lg p-12 text-center"
        >
          <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">
            Drag and drop photos here, or click to select
          </p>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => setFiles(Array.from(e.target.files))}
            className="hidden"
            id="photo-upload"
          />
          <label htmlFor="photo-upload">
            <Button variant="outline" className="mt-4" asChild>
              <span>Select Files</span>
            </Button>
          </label>
        </div>

        {/* Preview */}
        {files.length > 0 && (
          <div className="grid grid-cols-4 gap-4 mt-4">
            {files.map((file, i) => (
              <div key={i} className="relative">
                <img
                  src={URL.createObjectURL(file)}
                  alt={file.name}
                  className="w-full aspect-square object-cover rounded"
                />
                <Button
                  onClick={() => setFiles(files.filter((_, j) => j !== i))}
                  variant="destructive"
                  size="sm"
                  className="absolute top-1 right-1"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Progress */}
        {uploading && (
          <Progress value={progress} className="mt-4" />
        )}

        <DialogFooter>
          <Button onClick={onClose} variant="ghost">Cancel</Button>
          <Button onClick={handleUpload} disabled={uploading || files.length === 0}>
            {uploading ? "Uploading..." : "Upload"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

---

### 3. Resume Admin Implementation

#### Hook: `use-admin-resume.ts`

```typescript
// src/hooks/use-admin-resume.ts
export function useAdminResumeSections(type?: string) {
  return useQuery({
    queryKey: ["admin", "resume", type],
    queryFn: async () => {
      let query = supabase.from("resume_sections").select("*");

      if (type) {
        query = query.eq("type", type);
      }

      query = query.order("sort_order");

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateResumeSection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (section: Partial<ResumeSection>) => {
      const { data, error } = await supabase
        .from("resume_sections")
        .insert({
          id: crypto.randomUUID(),
          type: section.type!,
          title_vi: section.title_vi || "",
          content: section.content || {},
          sort_order: section.sort_order || 0,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "resume"] });
      queryClient.invalidateQueries({ queryKey: ["resume"] });
    },
  });
}

export function useUpdateResumeSection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<ResumeSection> & { id: string }) => {
      const { error } = await supabase
        .from("resume_sections")
        .update(data)
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "resume"] });
      queryClient.invalidateQueries({ queryKey: ["resume"] });
    },
  });
}

export function useDeleteResumeSection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("resume_sections")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "resume"] });
      queryClient.invalidateQueries({ queryKey: ["resume"] });
    },
  });
}

export function useUpdateResumeOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sections: Array<{ id: string; sort_order: number }>) => {
      const updates = sections.map(({ id, sort_order }) =>
        supabase.from("resume_sections").update({ sort_order }).eq("id", id)
      );

      await Promise.all(updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "resume"] });
      queryClient.invalidateQueries({ queryKey: ["resume"] });
    },
  });
}
```

#### Type-Specific Editor Component

```typescript
// src/components/admin/ResumeSectionEditModal.tsx
interface ResumeSectionEditModalProps {
  section?: ResumeSection;
  type: ResumeSection["type"];
  open: boolean;
  onClose: () => void;
  onSave: (data: Partial<ResumeSection>) => void;
}

export function ResumeSectionEditModal({
  section,
  type,
  open,
  onClose,
  onSave,
}: ResumeSectionEditModalProps) {
  const [formData, setFormData] = useState({
    title_vi: section?.title_vi || "",
    title_en: section?.title_en || "",
    content: section?.content || {},
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {section ? "Edit" : "Add"} {type} Section
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title inputs */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Title (Vietnamese)</Label>
              <Input
                value={formData.title_vi}
                onChange={(e) => setFormData({ ...formData, title_vi: e.target.value })}
              />
            </div>
            <div>
              <Label>Title (English)</Label>
              <Input
                value={formData.title_en}
                onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
              />
            </div>
          </div>

          {/* Type-specific content editors */}
          {type === "highlight" && (
            <HighlightEditor
              content={formData.content}
              onChange={(content) => setFormData({ ...formData, content })}
            />
          )}

          {type === "experience" && (
            <ExperienceEditor
              content={formData.content}
              onChange={(content) => setFormData({ ...formData, content })}
            />
          )}

          {type === "project" && (
            <ProjectEditor
              content={formData.content}
              onChange={(content) => setFormData({ ...formData, content })}
            />
          )}

          {type === "writing" && (
            <WritingEditor
              content={formData.content}
              onChange={(content) => setFormData({ ...formData, content })}
            />
          )}

          {type === "speaking" && (
            <SpeakingEditor
              content={formData.content}
              onChange={(content) => setFormData({ ...formData, content })}
            />
          )}

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Experience Editor Example
function ExperienceEditor({
  content,
  onChange,
}: {
  content: Record<string, unknown>;
  onChange: (content: Record<string, unknown>) => void;
}) {
  return (
    <div className="space-y-4">
      <div>
        <Label>Company</Label>
        <Input
          value={content.company || ""}
          onChange={(e) => onChange({ ...content, company: e.target.value })}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Role (Vietnamese)</Label>
          <Input
            value={content.role_vi || ""}
            onChange={(e) => onChange({ ...content, role_vi: e.target.value })}
          />
        </div>
        <div>
          <Label>Role (English)</Label>
          <Input
            value={content.role_en || ""}
            onChange={(e) => onChange({ ...content, role_en: e.target.value })}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Start Date</Label>
          <Input
            type="date"
            value={content.start_date || ""}
            onChange={(e) => onChange({ ...content, start_date: e.target.value })}
          />
        </div>
        <div>
          <Label>End Date</Label>
          <Input
            type="date"
            value={content.end_date || ""}
            onChange={(e) => onChange({ ...content, end_date: e.target.value })}
          />
        </div>
      </div>

      <div>
        <Label>Location</Label>
        <Input
          value={content.location || ""}
          onChange={(e) => onChange({ ...content, location: e.target.value })}
        />
      </div>

      <div>
        <Label>Description (Vietnamese)</Label>
        <MarkdownEditor
          value={content.description_vi || ""}
          onChange={(v) => onChange({ ...content, description_vi: v })}
        />
      </div>

      <div>
        <Label>Description (English)</Label>
        <MarkdownEditor
          value={content.description_en || ""}
          onChange={(v) => onChange({ ...content, description_en: v })}
        />
      </div>

      <div>
        <Label>Link</Label>
        <Input
          value={content.link || ""}
          onChange={(e) => onChange({ ...content, link: e.target.value })}
        />
      </div>
    </div>
  );
}
```

#### Resume Header Editor

```typescript
// src/components/admin/ResumeHeaderEditor.tsx
interface ResumeHeaderData {
  name: string;
  email: string;
  location: string;
  github_url: string;
  website_url: string;
}

export function ResumeHeaderEditor() {
  const { data, isLoading } = useQuery({
    queryKey: ["resume", "header"],
    queryFn: async () => {
      // Fetch from about table or new resume_header table
      const { data } = await supabase
        .from("about")
        .select("*")
        .single();

      return {
        name: "Dynamite", // or from data
        email: "hello@dynamite.notes",
        location: "Ho Chi Minh City, Vietnam",
        github_url: "https://github.com",
        website_url: "https://dynamite.notes",
      };
    },
  });

  const updateHeader = useMutation({
    mutationFn: async (data: ResumeHeaderData) => {
      // Update in about table or resume_header table
      await supabase
        .from("about")
        .update({ resume_header: data })
        .eq("id", "default");
    },
  });

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Resume Header</h3>

      <div>
        <Label>Name</Label>
        <Input defaultValue={data?.name} />
      </div>

      <div>
        <Label>Email</Label>
        <Input type="email" defaultValue={data?.email} />
      </div>

      <div>
        <Label>Location</Label>
        <Input defaultValue={data?.location} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>GitHub URL</Label>
          <Input type="url" defaultValue={data?.github_url} />
        </div>
        <div>
          <Label>Website URL</Label>
          <Input type="url" defaultValue={data?.website_url} />
        </div>
      </div>
    </div>
  );
}
```

---

## Database Schema Changes

### Optional: Resume Header Storage

**Option A:** Store in `about` table (simpler)
```sql
ALTER TABLE about ADD COLUMN resume_header JSONB;
```

**Option B:** Create separate `resume_header` table (cleaner)
```sql
CREATE TABLE resume_header (
  id TEXT PRIMARY KEY DEFAULT 'default',
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  location TEXT NOT NULL,
  github_url TEXT,
  website_url TEXT,
  linkedin_url TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Optional: Albums Table

For better album management:
```sql
CREATE TABLE albums (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description_vi TEXT,
  description_en TEXT,
  cover_photo_id TEXT REFERENCES photos(id) ON DELETE SET NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE photos ADD COLUMN album_id TEXT REFERENCES albums(id) ON DELETE SET NULL;
-- Migrate existing album text values to album_id
```

---

## File Summary

### Phase 1: About Admin (3 files)
- `src/hooks/use-admin-about.ts` (new)
- `src/pages/admin/AboutAdmin.tsx` (new)
- `src/components/admin/AboutEditForm.tsx` (new)
- `src/App.tsx` (modify)

### Phase 2: Photos Admin (4 files)
- `src/pages/admin/PhotosAdmin.tsx` (new)
- `src/components/admin/PhotoUploadModal.tsx` (new)
- `src/components/admin/PhotoEditModal.tsx` (new)
- `src/components/admin/AlbumManager.tsx` (new)
- `src/App.tsx` (modify)

### Phase 3: Resume Admin (4 files)
- `src/hooks/use-admin-resume.ts` (new)
- `src/pages/admin/ResumeAdmin.tsx` (new)
- `src/components/admin/ResumeSectionEditModal.tsx` (new)
- `src/components/admin/ResumeHeaderEditor.tsx` (new)
- `src/App.tsx` (modify)

**Total:** 11 new files, 1 modified file

---

## Testing Checklist

### About Admin
- [ ] Edit bio in both languages
- [ ] Edit principles in both languages
- [ ] Add/remove social links
- [ ] Upload profile image
- [ ] Preview changes on public About page

### Photos Admin
- [ ] Upload single photo
- [ ] Upload multiple photos
- [ ] Edit photo caption/album
- [ ] Delete photo
- [ ] Toggle published status
- [ ] Bulk publish/unpublish
- [ ] Bulk delete
- [ ] Filter by album
- [ ] Create/rename/delete albums

### Resume Admin
- [ ] Create new section (each type)
- [ ] Edit existing section
- [ ] Delete section
- [ ] Reorder sections (drag-drop)
- [ ] Edit resume header
- [ ] Preview changes on public Resume page

---

## Rollback Plan

If issues arise:
1. Revert individual files via git
2. No database migrations needed (using existing tables)
3. Delete new routes from App.tsx
4. Safe rollback - no breaking changes

---

## Open Questions

1. **Resume header storage:** Use `about` table or create `resume_header` table?
2. **Profile image:** Keep as `/profile.jpg` or move to database/Supabase Storage?
3. **Album structure:** Keep as text field or create separate `albums` table?
4. **Social platforms:** Support more platforms (youtube, instagram, etc.)?
5. **Multiple resumes:** Support different resume versions/versions?

---

## References

- Scout Report: `plans/260115-0209-admin-pages-expansion/scout/scout-260115-0211-public-pages.md`
- Existing Admin Pages: `src/pages/admin/PostsAdmin.tsx`, `InsightsAdmin.tsx`
- Existing Hooks: `src/hooks/use-admin-posts.ts`, `use-admin-photos.ts`

---

**End of Plan**

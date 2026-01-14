# Scout Report: Public Pages Data Structure Analysis

**Date:** 2026-01-15  
**Focus:** Resume, Photos, and About pages data structure and editability requirements

---

## Executive Summary

All three public pages (Resume, Photos, About) use **database-driven content** via Supabase with **React Query** for data fetching. No hardcoded content exists in components. Each page has dedicated hooks for data retrieval.

---

## 1. Resume Page

### File Location
- **Page:** `/Users/dynamite/workspaces/com.dynamite/dynamitenotes/src/pages/Resume.tsx`
- **Hook:** `/Users/dynamite/workspaces/com.dynamite/dynamitenotes/src/hooks/use-resume.ts`

### Data Structure

#### Database Table: `resume_sections`
```sql
CREATE TABLE resume_sections (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('highlight', 'experience', 'project', 'writing', 'speaking')),
  title_vi TEXT NOT NULL,
  title_en TEXT,
  content JSONB NOT NULL,  -- Flexible content per type
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
```

#### TypeScript Types
```typescript
type ResumeSection = {
  id: string;
  type: "highlight" | "experience" | "project" | "writing" | "speaking";
  content: Record<string, unknown>;
  sort_order: number;
};
```

### Section Types & Content Schema

#### 1. Highlight Type
```typescript
{
  number?: string;        // e.g., "5+", "100%"
  label_vi?: string;      // Vietnamese label
  label_en?: string;      // English label
}
```
**Display:** 4-column grid showing stats/numbers

#### 2. Experience Type
```typescript
{
  company?: string;
  role_vi?: string;
  role_en?: string;
  start_date?: string;
  end_date?: string;
  location?: string;
  description_vi?: string;  // Markdown content
  description_en?: string;  // Markdown content
  link?: string;
}
```
**Display:** Company name + role, dates right-aligned, location, markdown description

#### 3. Project Type
```typescript
{
  title?: string;
  description_vi?: string;  // Markdown content
  description_en?: string;  // Markdown content
  tech_stack?: string[];    // Array of technologies
  demo_url?: string;
  github_url?: string;
}
```
**Display:** Project title, tech stack tags, markdown description, links (GitHub/Demo)

#### 4. Writing Type
```typescript
{
  title?: string;
  publisher?: string;
  date?: string;
  url?: string;
}
```
**Display:** Title, publisher italic, date right-aligned, link

#### 5. Speaking Type
```typescript
{
  title?: string;
  publisher?: string;
  date?: string;
  url?: string;
}
```
**Display:** Same as Writing

### Hardcoded Elements
**Header section is hardcoded** (lines 19-51):
```tsx
<h1>YOUR NAME</h1>
<a href="mailto:hello@dynamite.notes">hello@dynamite.notes</a>
<span>Ho Chi Minh City, Vietnam</span>
<a href="https://github.com">github.com/username</a>
<a href="https://dynamite.notes">dynamite.notes</a>
```

### Admin Editing Requirements

**Need to Add:**
1. **Header editing interface** for:
   - Name display
   - Email address
   - Location
   - GitHub URL
   - Website URL
   
2. **CRUD operations for resume sections:**
   - Create new section (any type)
   - Edit existing section content
   - Delete section
   - Reorder sections (drag-and-drop sort_order)

3. **Type-specific editors:**
   - Highlight: number + label inputs
   - Experience: company, role (i18n), dates, location, description (markdown), link
   - Project: title, description (markdown), tech stack (tags), URLs
   - Writing/Speaking: title, publisher, date, URL

---

## 2. Photos Page

### File Location
- **Page:** `/Users/dynamite/workspaces/com.dynamite/dynamitenotes/src/pages/Photos.tsx`
- **Hook:** `/Users/dynamite/workspaces/com.dynamite/dynamitenotes/src/hooks/use-photos.ts`
- **Admin Hook:** `/Users/dynamite/workspaces/com.dynamite/dynamitenotes/src/hooks/use-admin-photos.ts`

### Data Structure

#### Database Table: `photos`
```sql
CREATE TABLE photos (
  id TEXT PRIMARY KEY,
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  caption_vi TEXT,
  caption_en TEXT,
  album TEXT,
  sort_order INTEGER DEFAULT 0,
  published BOOLEAN DEFAULT false,
  taken_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ
);
```

#### TypeScript Types
```typescript
type Photo = {
  id: string;
  url: string;
  thumbnail_url: string | null;
  caption_vi: string | null;
  caption_en: string | null;
  album: string | null;
  sort_order: number;
};
```

### Display Pattern
- **Masonry grid layout** (1 col mobile, 2 cols tablet, 3 cols desktop)
- **Album filter buttons** with photo counts
- **Lightbox viewer** for full-size images
- **Hover effects** with icon overlay

### Admin Editing Requirements

**Already Exists:** `use-admin-photos.ts` has:
- ✅ `useAdminPhotos()` - fetch all photos
- ✅ `useCreatePhoto()` - create photo
- ✅ `useUpdatePhoto()` - update photo
- ✅ `useDeletePhoto()` - delete photo
- ✅ `useUpdatePhotoOrder()` - reorder photos
- ✅ `useAlbums()` - get album list with counts

**Need to Add:**
1. **Photo upload interface** with:
   - Image upload to Supabase Storage
   - Auto-thumbnail generation
   - Caption editing (i18n)
   - Album assignment/creation
   - Published toggle
   - Date picker (taken_at)

2. **Album management:**
   - Create/rename/delete albums
   - Album photo count display

3. **Batch operations:**
   - Bulk publish/unpublish
   - Bulk album assignment
   - Bulk delete

---

## 3. About Page

### File Location
- **Page:** `/Users/dynamite/workspaces/com.dynamite/dynamitenotes/src/pages/About.tsx`
- **Hook:** `/Users/dynamite/workspaces/com.dynamite/dynamitenotes/src/hooks/use-about.ts`

### Data Structure

#### Database Table: `about`
```sql
CREATE TABLE about (
  id TEXT PRIMARY KEY,
  bio_vi TEXT NOT NULL,
  bio_en TEXT,
  principles_vi TEXT,
  principles_en TEXT,
  social_links JSONB,
  updated_at TIMESTAMPTZ
);
```

#### TypeScript Types
```typescript
type AboutData = {
  id: string;
  bio_vi: string | null;
  bio_en: string | null;
  principles_vi: string | null;
  principles_en: string | null;
  social_links: Record<string, string> | null;
};
```

### Content Fields

#### 1. Bio (Markdown)
- `bio_vi`: Vietnamese biography
- `bio_en`: English biography
- **Display:** Markdown rendered with `MarkdownRenderer`

#### 2. Principles (Markdown)
- `principles_vi`: Vietnamese principles
- `principles_en`: English principles
- **Display:** Markdown rendered with `MarkdownRenderer`
- **Fallback:** Hardcoded defaults if null

#### 3. Social Links (JSONB)
```typescript
{
  github: "https://github.com/username",
  twitter: "https://twitter.com/username",
  linkedin: "https://linkedin.com/in/username",
  email: "mailto:hello@example.com"
}
```
**Display:** Icon + platform name + external link icon

#### 4. Profile Image
- **Hardcoded path:** `/profile.jpg`
- **Fallback:** Avatar with User icon

### Admin Editing Requirements

**Need to Add:**
1. **Single-record editor** (about table has 1 row):
   - Bio editor (markdown, i18n)
   - Principles editor (markdown, i18n)
   
2. **Social links manager:**
   - Add/edit/remove platforms
   - URL validation
   - Icon mapping (github, twitter, linkedin, email)
   
3. **Profile image upload:**
   - Upload to `/profile.jpg` path
   - Preview and replace

---

## 4. Data Flow Summary

### Current Flow
```
Supabase Tables → React Query Hooks → Page Components → Display
```

### Hooks Used
- **Resume:** `useResumeSections()` → filters by type
- **Photos:** `usePhotos(album?)` → filtered by published + optional album
- **About:** `useAbout()` → single record or null

### Query Keys
```typescript
["resume"]           // Resume sections
["photos", album]    // Photos (optional album filter)
["albums"]           // Album list with counts
["about"]            // About page data
```

### Admin Query Keys (pattern)
```typescript
["admin", "photos"]  // All photos (including unpublished)
```

---

## 5. What Needs to be Built

### Priority 1: Resume Admin
**New hooks needed:** `use-admin-resume.ts`
- `useAdminResumeSections(type?)`
- `useCreateResumeSection()`
- `useUpdateResumeSection()`
- `useDeleteResumeSection()`
- `useUpdateResumeOrder()`

**Admin page:** `/admin/resume`
- Section type selector
- Type-specific form editors
- Drag-and-drop reordering
- Header editor (name, email, location, links)

### Priority 2: About Admin
**New hooks needed:** `use-admin-about.ts`
- `useAbout()` (read)
- `useUpdateAbout()` (upsert)

**Admin page:** `/admin/about`
- Bio editor (markdown, i18n)
- Principles editor (markdown, i18n)
- Social links manager
- Profile image upload

### Priority 3: Photos Admin Enhancement
**Already exists:** `use-admin-photos.ts` has CRUD

**Need to build:**
- Admin page: `/admin/photos`
- Upload interface with progress
- Album management UI
- Batch operations UI

---

## 6. Technical Considerations

### Markdown Rendering
All three pages use `MarkdownRenderer` component for:
- Resume: descriptions (experience, projects)
- About: bio, principles
- **Admin needs:** Markdown editor with preview

### i18n Pattern
All content supports Vietnamese (vi) and English (en):
- `field_vi` / `field_en` pattern
- Language context: `useLanguage()`
- **Admin needs:** Tabbed editor or side-by-side view

### Image Storage
- **Photos:** Supabase Storage → `photos` bucket
- **Profile:** Public folder → `/profile.jpg`
- **Admin needs:** Upload component with progress tracking

### Sort Order
All tables use `sort_order` for manual ordering:
- **Admin needs:** Drag-and-drop reordering UI

### Published State
Only `photos` table has `published` flag:
- Public: `eq("published", true)`
- Admin: All records
- **Pattern:** Could add to other tables if needed

---

## 7. Unresolved Questions

1. **Resume header:** Should header data be stored in `about` table or new `resume_header` table?
2. **Profile image:** Should it stay as `/profile.jpg` or move to database/Supabase Storage?
3. **Social links:** Should we support more platforms beyond github, twitter, linkedin, email?
4. **Album structure:** Should albums be a separate table or stay as text field?
5. **Multiple resumes:** Should we support multiple resume versions (e.g., different languages/formats)?

---

## Files Analyzed

### Pages
- `/Users/dynamite/workspaces/com.dynamite/dynamitenotes/src/pages/Resume.tsx` (382 lines)
- `/Users/dynamite/workspaces/com.dynamite/dynamitenotes/src/pages/Photos.tsx` (201 lines)
- `/Users/dynamite/workspaces/com.dynamite/dynamitenotes/src/pages/About.tsx` (241 lines)

### Public Hooks
- `/Users/dynamite/workspaces/com.dynamite/dynamitenotes/src/hooks/use-resume.ts` (42 lines)
- `/Users/dynamite/workspaces/com.dynamite/dynamitenotes/src/hooks/use-photos.ts` (74 lines)
- `/Users/dynamite/workspaces/com.dynamite/dynamitenotes/src/hooks/use-about.ts` (40 lines)

### Admin Hooks (Existing)
- `/Users/dynamite/workspaces/com.dynamite/dynamitenotes/src/hooks/use-admin-photos.ts` (165 lines)

### Database Schema
- `/Users/dynamite/workspaces/com.dynamite/dynamitenotes/scripts/schema.sql` (228 lines)

---

**End of Report**

# Phase 05: Enhanced Filters & Admin Auth

**Effort**: 1.5h

## Overview

Add advanced filtering UI and protect admin routes with auth check.

## Tasks

### 1. Create Admin Auth Hook

**File**: `src/hooks/use-admin-auth.ts`

```typescript
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useSession } from "@/hooks/use-session"; // or wherever session hook is

export function useAdminAuth() {
  const { data: session } = useSession();

  const { data: isAdmin, isLoading } = useQuery({
    queryKey: ["admin-check", session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return false;

      const { data, error } = await supabase
        .from("admins")
        .select("user_id")
        .eq("user_id", session.user.id)
        .maybeSingle();

      if (error && error.code !== "PGRST116") throw error;
      return !!data;
    },
    enabled: !!session?.user?.id,
    retry: false,
  });

  return { isAdmin, isLoading };
}
```

### 2. Create Protected Route Component

**File**: `src/components/admin/AdminProtectedRoute.tsx`

```typescript
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { Loader2 } from "lucide-react";

export function AdminProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAdmin, isLoading } = useAdminAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      navigate("/", { replace: true });
    }
  }, [isAdmin, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return <>{children}</>;
}
```

### 3. Wrap Admin Routes

**File**: `src/App.tsx`

Wrap all admin routes with protection:

```typescript
import { AdminProtectedRoute } from "@/components/admin/AdminProtectedRoute";

// In routes:
<Route path="/admin" element={<AdminProtectedRoute><AdminLayout /></AdminProtectedRoute>}>
  <Route path="posts" element={<PostsAdmin />} />
  {/* ... other admin routes */}
</Route>
```

### 4. Add Enhanced Filters to PostsAdmin

**File**: `src/pages/admin/PostsAdmin.tsx`

Add filter controls:

```typescript
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function PostsAdmin() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [levelFilter, setLevelFilter] = useState<string>("all");
  const [featuredFilter, setFeaturedFilter] = useState<string>("all");
  const [tagFilter, setTagFilter] = useState<string>("all");

  // Filter data before passing to DataTable
  const filteredData = useMemo(() => {
    return (posts || []).filter(post => {
      if (statusFilter === "published" && !post.published) return false;
      if (statusFilter === "draft" && post.published) return false;
      if (statusFilter === "scheduled" && !post.scheduled_for) return false;

      if (levelFilter !== "all" && post.level !== levelFilter) return false;

      if (featuredFilter === "featured" && !post.featured) return false;
      if (featuredFilter === "not-featured" && post.featured) return false;

      if (tagFilter !== "all") {
        const hasTag = post.tags?.some((t: any) => t.id === tagFilter);
        if (!hasTag) return false;
      }

      return true;
    });
  }, [posts, statusFilter, levelFilter, featuredFilter, tagFilter]);

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
            </SelectContent>
          </Select>

          <Select value={levelFilter} onValueChange={setLevelFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value="starter">Starter</SelectItem>
              <SelectItem value="builder">Builder</SelectItem>
              <SelectItem value="advanced">Advanced</SelectItem>
            </SelectContent>
          </Select>

          <Select value={featuredFilter} onValueChange={setFeaturedFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Featured" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Posts</SelectItem>
              <SelectItem value="featured">Featured</SelectItem>
              <SelectItem value="not-featured">Not Featured</SelectItem>
            </SelectContent>
          </Select>

          <Select value={tagFilter} onValueChange={setTagFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Tag" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tags</SelectItem>
              {tags?.map(tag => (
                <SelectItem key={tag.id} value={tag.id}>
                  {tag.name_vi}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Table with filtered data */}
        <DataTable data={filteredData} {...otherProps} />
      </div>
    </AdminLayout>
  );
}
```

### 5. Add Sort Dropdown

```typescript
const [sortBy, setSortBy] = useState<"updated_at" | "title_vi" | "published_at">("updated_at");
const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

const sortedData = useMemo(() => {
  return [...filteredData].sort((a, b) => {
    const aVal = a[sortBy];
    const bVal = b[sortBy];
    const cmp = aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
    return sortOrder === "asc" ? cmp : -cmp;
  });
}, [filteredData, sortBy, sortOrder]);
```

## Acceptance Criteria

- [ ] Non-admin users redirected from /admin routes
- [ ] Admin users can access admin pages
- [ ] Status filter works (published/draft/scheduled)
- [ ] Level filter works
- [ ] Featured filter works
- [ ] Tag filter works
- [ ] Sort dropdown works
- [ ] Filters can be reset

## Files

- `src/hooks/use-admin-auth.ts` (create)
- `src/components/admin/AdminProtectedRoute.tsx` (create)
- `src/App.tsx` (modify)
- `src/pages/admin/PostsAdmin.tsx` (modify)

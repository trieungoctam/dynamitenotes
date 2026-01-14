# Phase 03: Tags System

**Effort**: 2h

## Overview

Implement many-to-many tags for posts with CRUD operations and inline creation.

## Tasks

### 1. Create Tags Hook

**File**: `src/hooks/use-tags.ts`

```typescript
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { InsertTables, UpdateTables } from "@/types/database";
import slugify from "slugify";

type Tag = InsertTables<"tags">;
type TagUpdate = UpdateTables<"tags">;

export function useTags() {
  return useQuery({
    queryKey: ["tags"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tags")
        .select("*")
        .order("name_vi");
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (tag: Omit<Tag, "slug" | "created_at">) => {
      const slug = tag.slug || slugify(tag.name_vi, { lower: true, strict: true });

      const { data, error } = await supabase
        .from("tags")
        .insert({ ...tag, slug })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tags"] });
    },
  });
}

export function useUpdatePostTags() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ postId, tagIds }: { postId: string; tagIds: string[] }) => {
      // Delete existing relationships
      await supabase
        .from("post_tags")
        .delete()
        .eq("post_id", postId);

      // Insert new relationships
      if (tagIds.length > 0) {
        const relationships = tagIds.map(tagId => ({
          post_id: postId,
          tag_id: tagId,
        }));

        await supabase
          .from("post_tags")
          .insert(relationships);
      }
    },
    onSuccess: (_, { postId }) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "posts"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "post", postId] });
      queryClient.invalidateQueries({ queryKey: ["post-tags", postId] });
    },
  });
}

export function usePostTags(postId: string) {
  return useQuery({
    queryKey: ["post-tags", postId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("post_tags")
        .select("tag:tags(*)")
        .eq("post_id", postId);

      if (error) throw error;
      return data?.map(pt => pt.tag) || [];
    },
    enabled: !!postId,
  });
}
```

### 2. Create Tags Selector Component

**File**: `src/components/admin/TagsSelector.tsx`

```typescript
import { useState } from "react";
import { X, Plus, Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useTags, useCreateTag } from "@/hooks/use-tags";

interface TagsSelectorProps {
  selectedTags: string[]; // tag IDs
  availableTags?: Array<{ id: string; name_vi: string; color?: string }>;
  onChange: (tagIds: string[]) => void;
}

export function TagsSelector({
  selectedTags,
  onChange,
  availableTags,
}: TagsSelectorProps) {
  const { data: tags = [] } = useTags();
  const createTag = useCreateTag();

  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const allTags = availableTags || tags;
  const selectedTagObjects = allTags.filter(t => selectedTags.includes(t.id));

  const filteredTags = allTags.filter(
    tag =>
      !selectedTags.includes(tag.id) &&
      tag.name_vi.toLowerCase().includes(search.toLowerCase())
  );

  const handleToggleTag = (tagId: string) => {
    const newSelected = selectedTags.includes(tagId)
      ? selectedTags.filter(id => id !== tagId)
      : [...selectedTags, tagId];
    onChange(newSelected);
  };

  const handleCreateTag = async (name: string) => {
    setIsCreating(true);
    try {
      const color = `hsl(${Math.random() * 360}, 70%, 50%)`;
      const newTag = await createTag.mutateAsync({ name_vi: name, color });
      onChange([...selectedTags, newTag.id]);
      setSearch("");
    } catch (err) {
      console.error("Failed to create tag:", err);
    } finally {
      setIsCreating(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && search.trim()) {
      e.preventDefault();
      handleCreateTag(search.trim());
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {selectedTagObjects.map(tag => (
          <Badge
            key={tag.id}
            variant="secondary"
            className="gap-1"
            style={{ backgroundColor: tag.color }}
          >
            <Tag className="w-3 h-3" />
            {tag.name_vi}
            <button
              onClick={() => handleToggleTag(tag.id)}
              className="hover:bg-black/10 rounded"
            >
              <X className="w-3 h-3" />
            </button>
          </Badge>
        ))}
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1">
              <Plus className="w-4 h-4" />
              Add Tag
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-2">
            <div className="space-y-2">
              <Input
                placeholder="Search or create tag..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                onKeyDown={handleKeyDown}
                autoFocus
              />
              {filteredTags.length === 0 && search.trim() && (
                <Button
                  variant="ghost"
                  className="w-full justify-start text-muted-foreground"
                  onClick={() => handleCreateTag(search.trim())}
                  disabled={isCreating}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create "{search.trim()}"
                </Button>
              )}
              <div className="max-h-48 overflow-y-auto">
                {filteredTags.map(tag => (
                  <button
                    key={tag.id}
                    onClick={() => handleToggleTag(tag.id)}
                    className="w-full text-left px-2 py-1 hover:bg-muted rounded"
                  >
                    <Badge
                      variant="outline"
                      className="mr-2"
                      style={{ backgroundColor: tag.color }}
                    >
                      {tag.name_vi}
                    </Badge>
                  </button>
                ))}
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
```

### 3. Update PostsAdmin Table

**File**: `src/pages/admin/PostsAdmin.tsx`

Add tags column to DataTable:

```typescript
const columns: Column<PostRow>[] = [
  // ... existing columns ...
  {
    key: "tags",
    header: "Tags",
    render: (post) => (
      <div className="flex flex-wrap gap-1">
        {post.tags?.slice(0, 3).map((tag: any) => (
          <Badge key={tag.id} variant="outline" className="text-xs">
            {tag.name_vi}
          </Badge>
        ))}
        {(post.tags?.length || 0) > 3 && (
          <span className="text-xs text-muted-foreground">
            +{(post.tags?.length || 0) - 3}
          </span>
        )}
      </div>
    ),
  },
];
```

Update query to include tags:

```typescript
useAdminPosts: {
  queryFn: async () => {
    const { data, error } = await supabase
      .from("posts")
      .select("*, tags:post_tags(tag:tags(*))")
      .order("updated_at", { ascending: false });
    // ...
  }
}
```

### 4. Integrate into Post Edit Form

Add TagsSelector to post form, save tags on submit using `useUpdatePostTags`.

## Acceptance Criteria

- [ ] Can search existing tags
- [ ] Can create new tag inline
- [ ] Selected tags shown as badges
- [ ] Can remove tags
- [ ] Tags persisted to database
- [ ] Tags displayed in PostsAdmin table

## Files

- `src/hooks/use-tags.ts` (create)
- `src/components/admin/TagsSelector.tsx` (create)
- `src/pages/admin/PostsAdmin.tsx` (modify)
- Post edit form (modify)

# Phase 04: Bulk Actions

**Effort**: 1.5h

## Overview

Add bulk selection, publish/unpublish, and delete functionality to PostsAdmin.

## Tasks

### 1. Update DataTable for Selection

**File**: `src/components/admin/DataTable.tsx`

Add row selection support:

```typescript
interface DataTableProps<T> {
  // ... existing props ...
  selectable?: boolean;
  selectedIds?: Set<string>;
  onSelectionChange?: (ids: Set<string>) => void;
}

export function DataTable<T extends Record<string, any>>({
  selectable,
  selectedIds = new Set(),
  onSelectionChange,
  // ... rest
}: DataTableProps<T>) {
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = new Set(data.map(item => item.id));
      onSelectionChange?.(allIds);
    } else {
      onSelectionChange?.(new Set());
    }
  };

  const handleSelectRow = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedIds);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    onSelectionChange?.(newSelected);
  };

  const isAllSelected = data.length > 0 && selectedIds.size === data.length;
  const isSomeSelected = selectedIds.size > 0 && !isAllSelected;

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            {selectable && (
              <TableHead className="w-12">
                <Checkbox
                  checked={isAllSelected}
                  indeterminate={isSomeSelected}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
            )}
            {/* ... existing headers */}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map(item => (
            <TableRow key={item.id}>
              {selectable && (
                <TableCell>
                  <Checkbox
                    checked={selectedIds.has(item.id)}
                    onCheckedChange={(checked) => handleSelectRow(item.id, !!checked)}
                  />
                </TableCell>
              )}
              {/* ... existing cells */}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
```

### 2. Create Bulk Actions Hook

**File**: `src/hooks/use-bulk-post-actions.ts`

```typescript
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export function useBulkPublish() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ postIds, published }: { postIds: string[]; published: boolean }) => {
      const { error } = await supabase
        .from("posts")
        .update({
          published,
          published_at: published ? new Date().toISOString() : null,
        })
        .in("id", postIds);

      if (error) throw error;
    },
    onSuccess: (_, { published }) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "posts"] });
      toast.success(published ? "Posts published" : "Posts unpublished");
    },
    onError: () => {
      toast.error("Failed to update posts");
    },
  });
}

export function useBulkDelete() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postIds: string[]) => {
      const { error } = await supabase
        .from("posts")
        .delete()
        .in("id", postIds);

      if (error) throw error;
    },
    onSuccess: (_, postIds) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "posts"] });
      toast.success(`${postIds.length} post(s) deleted`);
    },
    onError: () => {
      toast.error("Failed to delete posts");
    },
  });
}

export function useBulkAddTags() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ postIds, tagIds }: { postIds: string[]; tagIds: string[] }) => {
      // For each post, add the tags
      const operations = postIds.flatMap(postId =>
        tagIds.map(tagId => ({
          post_id: postId,
          tag_id: tagId,
        }))
      );

      const { error } = await supabase
        .from("post_tags")
        .insert(operations);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "posts"] });
      toast.success("Tags added to posts");
    },
  });
}
```

### 3. Create Bulk Actions Bar Component

**File**: `src/components/admin/BulkActionsBar.tsx`

```typescript
import { Eye, EyeOff, Trash2, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useBulkPublish, useBulkDelete } from "@/hooks/use-bulk-post-actions";

interface BulkActionsBarProps {
  selectedCount: number;
  onClear: () => void;
}

export function BulkActionsBar({ selectedCount, onClear }: BulkActionsBarProps) {
  const bulkPublish = useBulkPublish();
  const bulkDelete = useBulkDelete();

  const handlePublish = async () => {
    await bulkPublish.mutateAsync({
      postIds: Array.from(/* pass selected IDs */),
      published: true,
    });
    onClear();
  };

  const handleUnpublish = async () => {
    await bulkPublish.mutateAsync({
      postIds: Array.from(/* pass selected IDs */),
      published: false,
    });
    onClear();
  };

  const handleDelete = async () => {
    await bulkDelete.mutateAsync(/* pass selected IDs */);
    onClear();
  };

  return (
    <div className="flex items-center justify-between bg-muted/50 p-3 rounded-lg">
      <span className="text-sm font-medium">
        {selectedCount} post{selectedCount !== 1 ? "s" : ""} selected
      </span>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handlePublish}
          disabled={bulkPublish.isPending}
        >
          <Eye className="w-4 h-4 mr-2" />
          Publish
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleUnpublish}
          disabled={bulkPublish.isPending}
        >
          <EyeOff className="w-4 h-4 mr-2" />
          Unpublish
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm">
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Posts</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete {selectedCount} post(s)? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete}>
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <Button variant="ghost" size="sm" onClick={onClear}>
          Clear
        </Button>
      </div>
    </div>
  );
}
```

### 4. Integrate into PostsAdmin

**File**: `src/pages/admin/PostsAdmin.tsx`

Add selection state and BulkActionsBar:

```typescript
const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

return (
  <AdminLayout>
    <div className="space-y-6">
      {/* ... existing header ... */}

      {selectedIds.size > 0 && (
        <BulkActionsBar
          selectedCount={selectedIds.size}
          onClear={() => setSelectedIds(new Set())}
        />
      )}

      <DataTable
        selectable
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        // ... other props
      />
    </div>
  </AdminLayout>
);
```

## Acceptance Criteria

- [ ] Checkboxes appear in DataTable
- [ ] Select all checkbox works
- [ ] Individual row selection works
- [ ] Bulk actions bar appears when items selected
- [ ] Bulk publish/unpublish works
- [ ] Bulk delete with confirmation works
- [ ] Selection clears after action

## Files

- `src/components/admin/DataTable.tsx` (modify)
- `src/hooks/use-bulk-post-actions.ts` (create)
- `src/components/admin/BulkActionsBar.tsx` (create)
- `src/pages/admin/PostsAdmin.tsx` (modify)

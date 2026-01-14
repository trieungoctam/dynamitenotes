# Phase 06: Version History System

**Effort**: 2h

## Overview

Track all post changes with version history and rollback capability.

## Tasks

### 1. Create Post Versions Hook

**File**: `src/hooks/use-post-versions.ts`

```typescript
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export function usePostVersions(postId: string) {
  return useQuery({
    queryKey: ["post-versions", postId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("post_versions")
        .select("*")
        .eq("post_id", postId)
        .order("version", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!postId,
  });
}

export function useRollbackVersion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ postId, versionId }: { postId: string; versionId: string }) => {
      // Fetch version data
      const { data: version, error: fetchError } = await supabase
        .from("post_versions")
        .select("*")
        .eq("id", versionId)
        .single();

      if (fetchError) throw fetchError;

      // Update post with version data
      const { error: updateError } = await supabase
        .from("posts")
        .update({
          title_vi: version.title_vi,
          title_en: version.title_en,
          content_vi: version.content_vi,
          content_en: version.content_en,
          excerpt_vi: version.excerpt_vi,
          excerpt_en: version.excerpt_en,
          cover_image: version.cover_image,
        })
        .eq("id", postId);

      if (updateError) throw updateError;

      // Create new version entry for rollback
      const { error: versionError } = await supabase
        .from("post_versions")
        .insert({
          post_id: postId,
          title_vi: version.title_vi,
          title_en: version.title_en,
          content_vi: version.content_vi,
          content_en: version.content_en,
          excerpt_vi: version.excerpt_vi,
          excerpt_en: version.excerpt_en,
          cover_image: version.cover_image,
          change_reason: `Rolled back to version ${version.version}`,
          version: version.version, // Keep same version number
        });

      if (versionError) throw versionError;
    },
    onSuccess: (_, { postId }) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "posts"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "post", postId] });
      queryClient.invalidateQueries({ queryKey: ["post-versions", postId] });
      toast.success("Post rolled back successfully");
    },
    onError: () => {
      toast.error("Failed to rollback post");
    },
  });
}

export function useCreatePostVersion() {
  return useMutation({
    mutationFn: async (data: {
      postId: string;
      postData: any;
      changeReason?: string;
    }) => {
      const { postId, postData, changeReason = "Updated" } = data;

      // Get latest version number
      const { data: latestVersion } = await supabase
        .from("post_versions")
        .select("version")
        .eq("post_id", postId)
        .order("version", { ascending: false })
        .limit(1)
        .maybeSingle();

      const nextVersion = (latestVersion?.version || 0) + 1;

      // Create version entry
      const { error } = await supabase
        .from("post_versions")
        .insert({
          post_id: postId,
          title_vi: postData.title_vi,
          title_en: postData.title_en,
          content_vi: postData.content_vi,
          content_en: postData.content_en,
          excerpt_vi: postData.excerpt_vi,
          excerpt_en: postData.excerpt_en,
          cover_image: postData.cover_image,
          change_reason: changeReason,
          version: nextVersion,
          created_by: (await supabase.auth.getUser()).data.user?.id,
        });

      if (error) throw error;
    },
  });
}
```

### 2. Update Post Mutation Hook

**File**: `src/hooks/use-admin-posts.ts`

Add version creation on update:

```typescript
import { useCreatePostVersion } from "./use-post-versions";

export function useUpdatePost() {
  const queryClient = useQueryClient();
  const createVersion = useCreatePostVersion();

  return useMutation({
    mutationFn: async ({ id, ...post }: PostUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from("posts")
        .update(post)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      // Create version entry
      await createVersion.mutateAsync({
        postId: id,
        postData: post,
        changeReason: "Content updated",
      });

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "posts"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "post", data.id] });
      // ...
    },
  });
}
```

### 3. Create Version History Component

**File**: `src/components/admin/VersionHistory.tsx`

```typescript
import { formatDistanceToNow } from "date-fns";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { usePostVersions } from "@/hooks/use-post-versions";
import { RollbackConfirmDialog } from "./RollbackConfirmDialog";

interface VersionHistoryProps {
  postId: string;
}

export function VersionHistory({ postId }: VersionHistoryProps) {
  const { data: versions, isLoading } = usePostVersions(postId);

  if (isLoading) {
    return <div>Loading versions...</div>;
  }

  if (!versions || versions.length === 0) {
    return <p className="text-sm text-muted-foreground">No version history</p>;
  }

  return (
    <div className="space-y-3">
      <h3 className="font-medium">Version History</h3>
      <div className="space-y-2">
        {versions.map((version, index) => (
          <div
            key={version.id}
            className="flex items-start justify-between p-3 border rounded-lg"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge variant="outline">v{version.version}</Badge>
                <span className="text-sm text-muted-foreground">
                  {formatDistanceToNow(new Date(version.created_at), { addSuffix: true })}
                </span>
              </div>
              {version.change_reason && (
                <p className="text-sm">{version.change_reason}</p>
              )}
            </div>
            {index < versions.length - 1 && ( // Don't show rollback for current
              <RollbackConfirmDialog
                postId={postId}
                versionId={version.id}
                versionNumber={version.version}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
```

### 4. Create Rollback Confirm Dialog

**File**: `src/components/admin/RollbackConfirmDialog.tsx`

```typescript
import { RotateCcw } from "lucide-react";
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
import { useRollbackVersion } from "@/hooks/use-post-versions";

interface RollbackConfirmDialogProps {
  postId: string;
  versionId: string;
  versionNumber: number;
}

export function RollbackConfirmDialog({
  postId,
  versionId,
  versionNumber,
}: RollbackConfirmDialogProps) {
  const rollback = useRollbackVersion();

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="sm">
          <RotateCcw className="w-4 h-4 mr-2" />
          Rollback
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Rollback to Version {versionNumber}</AlertDialogTitle>
          <AlertDialogDescription>
            This will replace the current post content with version {versionNumber}.
            A new version entry will be created for this rollback action.
            Are you sure?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => rollback.mutate({ postId, versionId })}
            disabled={rollback.isPending}
          >
            {rollback.isPending ? "Rolling back..." : "Rollback"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
```

### 5. Integrate into Post Edit Form

Add VersionHistory component to post edit page.

## Acceptance Criteria

- [ ] Versions created on post update
- [ ] Version history displays with timestamps
- [ ] Rollback confirmation dialog shows
- [ ] Rollback restores content correctly
- [ ] New version created after rollback
- [ ] Version numbers increment properly

## Files

- `src/hooks/use-post-versions.ts` (create)
- `src/hooks/use-admin-posts.ts` (modify)
- `src/components/admin/VersionHistory.tsx` (create)
- `src/components/admin/RollbackConfirmDialog.tsx` (create)
- Post edit form (modify)

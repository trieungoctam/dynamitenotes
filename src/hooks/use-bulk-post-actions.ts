/**
 * Bulk Post Actions Hook
 * Handles bulk publish, unpublish, delete, and add tags operations
 */

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
      toast.success(`${postIds.length} post${postIds.length > 1 ? "s" : ""} deleted`);
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
    onSuccess: (_, { postIds }) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "posts"] });
      toast.success(`Tags added to ${postIds.length} post${postIds.length > 1 ? "s" : ""}`);
    },
    onError: () => {
      toast.error("Failed to add tags");
    },
  });
}

export function useBulkRemoveTags() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ postIds, tagIds }: { postIds: string[]; tagIds: string[] }) => {
      const { error } = await supabase
        .from("post_tags")
        .delete()
        .in("post_id", postIds)
        .in("tag_id", tagIds);

      if (error) throw error;
    },
    onSuccess: (_, { postIds }) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "posts"] });
      toast.success(`Tags removed from ${postIds.length} post${postIds.length > 1 ? "s" : ""}`);
    },
    onError: () => {
      toast.error("Failed to remove tags");
    },
  });
}

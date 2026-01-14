/**
 * Tags Hook
 * CRUD operations for tags and post-tag relationships
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { InsertTables } from "@/types/database";
import slugify from "slugify";

type Tag = InsertTables<"tags">;

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
      const { error: deleteError } = await supabase
        .from("post_tags")
        .delete()
        .eq("post_id", postId);

      if (deleteError) throw deleteError;

      // Insert new relationships
      if (tagIds.length > 0) {
        const relationships = tagIds.map(tagId => ({
          post_id: postId,
          tag_id: tagId,
        }));

        const { error: insertError } = await supabase
          .from("post_tags")
          .insert(relationships);

        if (insertError) throw insertError;
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

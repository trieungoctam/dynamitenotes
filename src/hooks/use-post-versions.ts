/**
 * Post Versions Hook - Track and manage post version history
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Database } from "@/types/database";

type PostVersion = Database["public"]["Tables"]["post_versions"]["Row"];
type PostVersionInsert = Database["public"]["Tables"]["post_versions"]["Insert"];

/**
 * Fetch all versions of a post
 */
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

/**
 * Create a new version entry for a post
 */
export function useCreatePostVersion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (version: Omit<PostVersionInsert, "version"> & { version?: number }) => {
      // Get the latest version number if not provided
      let versionNumber = version.version;
      if (versionNumber === undefined) {
        const { data } = await supabase
          .from("post_versions")
          .select("version")
          .eq("post_id", version.post_id)
          .order("version", { ascending: false })
          .limit(1)
          .single();
        versionNumber = (data?.version || 0) + 1;
      }

      const { data, error } = await supabase
        .from("post_versions")
        .insert({ ...version, version: versionNumber })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["post-versions", variables.post_id] });
    },
  });
}

/**
 * Rollback a post to a specific version
 */
export function useRollbackVersion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ postId, versionId }: { postId: string; versionId: string }) => {
      // Fetch the version to rollback to
      const { data: version, error: versionError } = await supabase
        .from("post_versions")
        .select("*")
        .eq("id", versionId)
        .single();
      if (versionError) throw versionError;

      // Get current post data for version tracking
      const { data: currentPost, error: postError } = await supabase
        .from("posts")
        .select("*")
        .eq("id", postId)
        .single();
      if (postError) throw postError;

      // Create a version of current state before rollback
      const { error: saveError } = await supabase
        .from("post_versions")
        .insert({
          post_id: postId,
          title_vi: currentPost.title_vi,
          title_en: currentPost.title_en,
          content_vi: currentPost.content_vi,
          content_en: currentPost.content_en,
          excerpt_vi: currentPost.excerpt_vi,
          excerpt_en: currentPost.excerpt_en,
          cover_image: currentPost.cover_image,
          change_reason: "Before rollback",
          created_by: currentPost.updated_at,
        });
      if (saveError) throw saveError;

      // Update post with version data
      const { data, error } = await supabase
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
        .eq("id", postId)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "posts"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "post", data.id] });
      queryClient.invalidateQueries({ queryKey: ["post-versions", data.id] });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });
}

/**
 * Get version diff summary (what changed between versions)
 */
export function getVersionDiffSummary(v1: PostVersion, v2: PostVersion): string {
  const changes: string[] = [];

  if (v1.title_vi !== v2.title_vi) changes.push("title");
  if (v1.content_vi !== v2.content_vi) changes.push("content");
  if (v1.excerpt_vi !== v2.excerpt_vi) changes.push("excerpt");
  if (v1.cover_image !== v2.cover_image) changes.push("cover image");

  if (changes.length === 0) return "No changes";
  if (changes.length === 1) return `Updated ${changes[0]}`;
  if (changes.length === 2) return `Updated ${changes[0]} and ${changes[1]}`;
  return `Updated ${changes.slice(0, -1).join(", ")} and ${changes[changes.length - 1]}`;
}

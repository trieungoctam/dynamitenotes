/**
 * Admin Posts Hooks - CRUD mutations for posts
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import slugify from "slugify";
import type { Database } from "@/types/database";

type Post = Database["public"]["Tables"]["posts"]["Row"];
type PostInsert = Database["public"]["Tables"]["posts"]["Insert"];
type PostUpdate = Database["public"]["Tables"]["posts"]["Update"];

/**
 * Fetch all posts for admin (includes drafts)
 */
export function useAdminPosts() {
  return useQuery({
    queryKey: ["admin", "posts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("posts")
        .select("*, goal:taxonomy!goal_id(*), outcome:taxonomy!outcome_id(*), tags:post_tags(tag:tags(*))")
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

/**
 * Fetch single post for editing
 */
export function useAdminPost(id: string) {
  return useQuery({
    queryKey: ["admin", "post", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("posts")
        .select("*, tags:post_tags(tag:tags(*))")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}

/**
 * Create new post
 */
export function useCreatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (post: Omit<PostInsert, "slug"> & { slug?: string }) => {
      // Auto-generate slug from Vietnamese title if not provided
      const slug = post.slug || slugify(post.title_vi, { lower: true, strict: true });

      const { data, error } = await supabase
        .from("posts")
        .insert({ ...post, slug })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "posts"] });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });
}

/**
 * Update existing post (creates version snapshot)
 */
export function useUpdatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...post }: PostUpdate & { id: string; changeReason?: string }) => {
      // Fetch current post for version snapshot
      const { data: currentPost } = await supabase
        .from("posts")
        .select("*")
        .eq("id", id)
        .single();

      if (currentPost) {
        // Get latest version number
        const { data: latestVersion } = await supabase
          .from("post_versions")
          .select("version")
          .eq("post_id", id)
          .order("version", { ascending: false })
          .limit(1)
          .maybeSingle();

        const nextVersion = (latestVersion?.version || 0) + 1;

        // Create version snapshot before update
        await supabase
          .from("post_versions")
          .insert({
            post_id: id,
            title_vi: currentPost.title_vi,
            title_en: currentPost.title_en,
            content_vi: currentPost.content_vi,
            content_en: currentPost.content_en,
            excerpt_vi: currentPost.excerpt_vi,
            excerpt_en: currentPost.excerpt_en,
            cover_image: currentPost.cover_image,
            change_reason: post.changeReason || "Updated",
            version: nextVersion,
          });
      }

      const { data, error } = await supabase
        .from("posts")
        .update(post)
        .eq("id", id)
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
      queryClient.invalidateQueries({ queryKey: ["post", data.slug] });
    },
  });
}

/**
 * Delete post
 */
export function useDeletePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("posts").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "posts"] });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });
}

/**
 * Toggle post publish status
 */
export function useTogglePostPublish() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, published }: { id: string; published: boolean }) => {
      const { data, error } = await supabase
        .from("posts")
        .update({
          published,
          published_at: published ? new Date().toISOString() : null,
        })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "posts"] });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });
}

/**
 * Calculate read time from content
 */
export function calculateReadTime(content: string): number {
  const wordsPerMinute = 200;
  const words = content.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / wordsPerMinute));
}

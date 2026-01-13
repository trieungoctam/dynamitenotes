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
        .select("*, goal:taxonomy!goal_id(*), outcome:taxonomy!outcome_id(*)")
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
        .select("*")
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
 * Update existing post
 */
export function useUpdatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...post }: PostUpdate & { id: string }) => {
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

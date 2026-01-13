/**
 * use-posts hook
 * TanStack Query hooks for fetching posts from Supabase.
 */

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Post, Taxonomy } from "@/types/database";

// Extended post type with relations
export type PostWithRelations = Post & {
  goal?: Taxonomy | null;
  outcome?: Taxonomy | null;
};

interface PostFilters {
  goal?: string;
  outcome?: string;
  level?: string;
}

export function usePosts(filters?: PostFilters) {
  return useQuery({
    queryKey: ["posts", filters],
    queryFn: async () => {
      let query = supabase
        .from("posts")
        .select(
          `
          *,
          goal:taxonomy!posts_goal_id_fkey(*),
          outcome:taxonomy!posts_outcome_id_fkey(*)
        `
        )
        .eq("published", true)
        .order("published_at", { ascending: false });

      if (filters?.goal) {
        query = query.eq("goal_id", filters.goal);
      }
      if (filters?.outcome) {
        query = query.eq("outcome_id", filters.outcome);
      }
      if (filters?.level) {
        query = query.eq("level", filters.level);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as PostWithRelations[];
    },
  });
}

export function usePost(slug: string) {
  return useQuery({
    queryKey: ["post", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("posts")
        .select(
          `
          *,
          goal:taxonomy!posts_goal_id_fkey(*),
          outcome:taxonomy!posts_outcome_id_fkey(*)
        `
        )
        .eq("slug", slug)
        .eq("published", true)
        .single();

      if (error) throw error;
      return data as PostWithRelations;
    },
    enabled: !!slug,
  });
}

export function useFeaturedPosts() {
  return useQuery({
    queryKey: ["posts", "featured"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .eq("published", true)
        .eq("featured", true)
        .order("published_at", { ascending: false })
        .limit(3);

      if (error) throw error;
      return data as Post[];
    },
  });
}

export function useRelatedPosts(postId: string, goalId?: string | null) {
  return useQuery({
    queryKey: ["posts", "related", postId, goalId],
    queryFn: async () => {
      if (!goalId) return [];

      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .eq("published", true)
        .eq("goal_id", goalId)
        .neq("id", postId)
        .order("published_at", { ascending: false })
        .limit(3);

      if (error) throw error;
      return data as Post[];
    },
    enabled: !!goalId,
  });
}

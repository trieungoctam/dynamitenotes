/**
 * use-goals hook
 * Fetches unique goal taxonomies from the database.
 * Goals are dynamically populated based on actual post content.
 */

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Taxonomy } from "@/types/database";

/**
 * Fetch all unique goal taxonomies that have published posts
 */
export function useGoals() {
  return useQuery({
    queryKey: ["goals"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("taxonomy")
        .select("*")
        .eq("type", "goal")
        .order("name");

      if (error) throw error;
      return data as Taxonomy[];
    },
  });
}

/**
 * Fetch goals that have at least one published post
 */
export function useActiveGoals() {
  return useQuery({
    queryKey: ["goals", "active"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("taxonomy")
        .select(`
          *,
          posts(count)
        `)
        .eq("type", "goal")
        .order("name");

      if (error) throw error;

      // Filter to only goals with at least one published post
      const activeGoals = (data as (Taxonomy & { posts: { count: number } }[])[])
        .filter(t => t.posts?.[0]?.count > 0);

      return activeGoals.map(({ posts, ...taxonomy }) => taxonomy) as Taxonomy[];
    },
  });
}

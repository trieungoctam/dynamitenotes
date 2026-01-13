/**
 * use-insights hook
 * TanStack Query hooks for fetching insights from Supabase.
 */

import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Insight, Post } from "@/types/database";

// Extended insight type with relations
export type InsightWithRelations = Insight & {
  related_post?: Post | null;
};

const PAGE_SIZE = 10;

export function useInsights() {
  return useInfiniteQuery({
    queryKey: ["insights"],
    queryFn: async ({ pageParam = 0 }) => {
      const from = pageParam * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      const { data, error, count } = await supabase
        .from("insights")
        .select(
          `
          *,
          related_post:posts(*)
        `,
          { count: "exact" }
        )
        .eq("published", true)
        .order("pinned", { ascending: false })
        .order("published_at", { ascending: false })
        .range(from, to);

      if (error) throw error;

      return {
        insights: data as InsightWithRelations[],
        nextPage: to < (count || 0) - 1 ? pageParam + 1 : undefined,
        totalCount: count || 0,
      };
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextPage,
  });
}

export function usePinnedInsights() {
  return useQuery({
    queryKey: ["insights", "pinned"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("insights")
        .select(
          `
          *,
          related_post:posts(*)
        `
        )
        .eq("published", true)
        .eq("pinned", true)
        .order("published_at", { ascending: false });

      if (error) throw error;
      return data as InsightWithRelations[];
    },
  });
}

export function useLatestInsights(limit = 3) {
  return useQuery({
    queryKey: ["insights", "latest", limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("insights")
        .select("*")
        .eq("published", true)
        .order("published_at", { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data as Insight[];
    },
  });
}

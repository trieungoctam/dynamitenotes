/**
 * use-series hook
 * TanStack Query hooks for fetching series from Supabase.
 */

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Series, Post } from "@/types/database";

// Extended series type with posts
export type SeriesWithPosts = Series & {
  posts?: Post[];
};

export function useSeries() {
  return useQuery({
    queryKey: ["series"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("series")
        .select("*")
        .eq("published", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Series[];
    },
  });
}

export function useSeriesDetail(slug: string) {
  return useQuery({
    queryKey: ["series", slug],
    queryFn: async () => {
      // First get the series
      const { data: series, error: seriesError } = await supabase
        .from("series")
        .select("*")
        .eq("slug", slug)
        .eq("published", true)
        .single();

      if (seriesError) throw seriesError;

      // Then fetch posts by IDs in order
      if (series.post_ids && series.post_ids.length > 0) {
        const { data: posts, error: postsError } = await supabase
          .from("posts")
          .select("*")
          .in("id", series.post_ids)
          .eq("published", true);

        if (postsError) throw postsError;

        // Sort posts by order in post_ids array
        const orderedPosts = series.post_ids
          .map((id: string) => posts?.find((p) => p.id === id))
          .filter(Boolean) as Post[];

        return {
          ...series,
          posts: orderedPosts,
        } as SeriesWithPosts;
      }

      return { ...series, posts: [] } as SeriesWithPosts;
    },
    enabled: !!slug,
  });
}

export function useFeaturedSeries() {
  return useQuery({
    queryKey: ["series", "featured"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("series")
        .select("*")
        .eq("published", true)
        .eq("featured", true)
        .order("created_at", { ascending: false })
        .limit(3);

      if (error) throw error;
      return data as Series[];
    },
  });
}

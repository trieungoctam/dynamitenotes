/**
 * Admin Series Hooks - CRUD mutations for series
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import slugify from "slugify";
import type { Database } from "@/types/database";

type Series = Database["public"]["Tables"]["series"]["Row"];
type SeriesInsert = Database["public"]["Tables"]["series"]["Insert"];
type SeriesUpdate = Database["public"]["Tables"]["series"]["Update"];

/**
 * Fetch all series for admin (includes unpublished)
 */
export function useAdminSeries() {
  return useQuery({
    queryKey: ["admin", "series"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("series")
        .select("*")
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

/**
 * Fetch single series with posts for editing
 */
export function useAdminSeriesDetail(id: string) {
  return useQuery({
    queryKey: ["admin", "series", id],
    queryFn: async () => {
      // Fetch series
      const { data: series, error: seriesError } = await supabase
        .from("series")
        .select("*")
        .eq("id", id)
        .single();
      if (seriesError) throw seriesError;

      // Fetch series posts
      const { data: seriesPosts, error: postsError } = await supabase
        .from("series_posts")
        .select("*, post:posts(*)")
        .eq("series_id", id)
        .order("sort_order", { ascending: true });
      if (postsError) throw postsError;

      return {
        ...series,
        posts: seriesPosts?.map((sp) => sp.post) || [],
      };
    },
    enabled: !!id,
  });
}

/**
 * Create new series
 */
export function useCreateSeries() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (series: Omit<SeriesInsert, "slug"> & { slug?: string }) => {
      const slug = series.slug || slugify(series.title_vi, { lower: true, strict: true });

      const { data, error } = await supabase
        .from("series")
        .insert({ ...series, slug })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "series"] });
      queryClient.invalidateQueries({ queryKey: ["series"] });
    },
  });
}

/**
 * Update existing series
 */
export function useUpdateSeries() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...series }: SeriesUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from("series")
        .update(series)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "series"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "series", data.id] });
      queryClient.invalidateQueries({ queryKey: ["series"] });
    },
  });
}

/**
 * Delete series
 */
export function useDeleteSeries() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("series").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "series"] });
      queryClient.invalidateQueries({ queryKey: ["series"] });
    },
  });
}

/**
 * Update series posts (order and membership)
 */
export function useUpdateSeriesPosts() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      seriesId,
      postIds,
    }: {
      seriesId: string;
      postIds: string[];
    }) => {
      // Delete existing posts
      await supabase.from("series_posts").delete().eq("series_id", seriesId);

      // Insert new order
      if (postIds.length > 0) {
        const inserts = postIds.map((postId, index) => ({
          series_id: seriesId,
          post_id: postId,
          sort_order: index,
        }));
        const { error } = await supabase.from("series_posts").insert(inserts);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "series"] });
      queryClient.invalidateQueries({ queryKey: ["series"] });
    },
  });
}

/**
 * Toggle series publish status
 */
export function useToggleSeriesPublish() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, published }: { id: string; published: boolean }) => {
      const { data, error } = await supabase
        .from("series")
        .update({ published })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "series"] });
      queryClient.invalidateQueries({ queryKey: ["series"] });
    },
  });
}

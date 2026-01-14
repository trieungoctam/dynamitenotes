/**
 * Admin Insights Hooks - CRUD mutations for insights
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Database } from "@/types/database";

type Insight = Database["public"]["Tables"]["insights"]["Row"];
type InsightInsert = Database["public"]["Tables"]["insights"]["Insert"];
type InsightUpdate = Database["public"]["Tables"]["insights"]["Update"];

/**
 * Fetch all insights for admin (includes unpublished)
 */
export function useAdminInsights() {
  return useQuery({
    queryKey: ["admin", "insights"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("insights")
        .select("*, related_post:posts(*)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

/**
 * Fetch single insight for editing
 */
export function useAdminInsight(id: string) {
  return useQuery({
    queryKey: ["admin", "insight", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("insights")
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
 * Create new insight
 */
export function useCreateInsight() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (insight: InsightInsert) => {
      const { data, error } = await supabase
        .from("insights")
        .insert(insight)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "insights"] });
      queryClient.invalidateQueries({ queryKey: ["insights"] });
    },
  });
}

/**
 * Update existing insight
 */
export function useUpdateInsight() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...insight }: InsightUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from("insights")
        .update(insight)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "insights"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "insight", data.id] });
      queryClient.invalidateQueries({ queryKey: ["insights"] });
    },
  });
}

/**
 * Delete insight
 */
export function useDeleteInsight() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("insights").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "insights"] });
      queryClient.invalidateQueries({ queryKey: ["insights"] });
    },
  });
}

/**
 * Toggle insight publish status
 */
export function useToggleInsightPublish() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, published }: { id: string; published: boolean }) => {
      const { data, error } = await supabase
        .from("insights")
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
      queryClient.invalidateQueries({ queryKey: ["admin", "insights"] });
      queryClient.invalidateQueries({ queryKey: ["insights"] });
    },
  });
}

/**
 * Toggle insight pinned status
 */
export function useToggleInsightPin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, pinned }: { id: string; pinned: boolean }) => {
      const { data, error } = await supabase
        .from("insights")
        .update({ pinned })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "insights"] });
      queryClient.invalidateQueries({ queryKey: ["insights"] });
    },
  });
}

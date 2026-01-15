/**
 * Resume Admin Hooks
 * Admin operations for resume sections.
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

// Browser-compatible UUID generator using Web Crypto API
function generateUUID(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for older browsers
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export type ResumeSection = {
  id: string;
  type: "highlight" | "experience" | "education" | "skill" | "certification" | "project" | "writing" | "speaking";
  title_vi: string;
  title_en: string | null;
  content: Record<string, unknown>;
  sort_order: number;
  created_at?: string;
  updated_at?: string;
};

/**
 * Fetch all resume sections (admin)
 */
export function useAdminResumeSections(type?: string) {
  return useQuery({
    queryKey: ["admin", "resume", type],
    queryFn: async () => {
      let query = supabase
        .from("resume_sections")
        .select("*")
        .order("sort_order", { ascending: true });

      if (type) {
        query = query.eq("type", type);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as ResumeSection[];
    },
  });
}

/**
 * Create new resume section
 */
export function useCreateResumeSection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (section: Omit<ResumeSection, "id" | "created_at" | "updated_at">) => {
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from("resume_sections")
        .insert({
          id: generateUUID(),
          created_at: now,
          updated_at: now,
          ...section,
        })
        .select()
        .single();

      if (error) throw error;
      return data as ResumeSection;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "resume"] });
      queryClient.invalidateQueries({ queryKey: ["resume"] });
    },
  });
}

/**
 * Update existing resume section
 */
export function useUpdateResumeSection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<ResumeSection> & { id: string }) => {
      const { error } = await supabase
        .from("resume_sections")
        .update({
          ...data,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "resume"] });
      queryClient.invalidateQueries({ queryKey: ["resume"] });
    },
  });
}

/**
 * Delete resume section
 */
export function useDeleteResumeSection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("resume_sections")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "resume"] });
      queryClient.invalidateQueries({ queryKey: ["resume"] });
    },
  });
}

/**
 * Update resume sections order (for drag-drop reordering)
 */
export function useUpdateResumeOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sections: Array<{ id: string; sort_order: number }>) => {
      const updates = sections.map(({ id, sort_order }) =>
        supabase
          .from("resume_sections")
          .update({ sort_order })
          .eq("id", id)
      );

      await Promise.all(updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "resume"] });
      queryClient.invalidateQueries({ queryKey: ["resume"] });
    },
  });
}

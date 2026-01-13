/**
 * Resume Hooks
 * Fetch resume sections and achievements.
 */

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

type ResumeSection = {
  id: string;
  type: "highlight" | "experience" | "project" | "writing" | "speaking";
  content: Record<string, unknown>;
  sort_order: number;
};

/**
 * Fetch all resume sections ordered by sort_order
 */
export function useResumeSections() {
  return useQuery({
    queryKey: ["resume"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("resume_sections")
        .select("*")
        .order("sort_order", { ascending: true });

      if (error) throw error;
      return data as ResumeSection[];
    },
  });
}

/**
 * Get resume sections by type
 */
export function useResumeByType(type: ResumeSection["type"]) {
  const { data: sections } = useResumeSections();

  return sections?.filter((s) => s.type === type) || [];
}

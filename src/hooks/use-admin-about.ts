/**
 * About Admin Hooks
 * Admin operations for about page content.
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export type AboutData = {
  id: string;
  bio_vi: string | null;
  bio_en: string | null;
  principles_vi: string | null;
  principles_en: string | null;
  social_links: Record<string, string> | null;
  resume_header?: {
    name?: string;
    email?: string;
    location?: string;
    github_url?: string;
    website_url?: string;
    linkedin_url?: string;
  } | null;
};

/**
 * Fetch about page content (admin - no published filter)
 */
export function useAdminAbout() {
  return useQuery({
    queryKey: ["admin", "about"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("about")
        .select("*")
        .single();

      if (error && error.code === "PGRST116") {
        return null;
      }

      if (error) throw error;
      return data as AboutData;
    },
  });
}

/**
 * Update about page content
 */
export function useUpdateAbout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<AboutData>) => {
      const { error } = await supabase
        .from("about")
        .upsert({
          id: "default",
          ...data,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["about"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "about"] });
    },
  });
}

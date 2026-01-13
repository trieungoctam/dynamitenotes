/**
 * About Hooks
 * Fetch about page data.
 */

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

type AboutData = {
  id: string;
  bio_vi: string | null;
  bio_en: string | null;
  principles_vi: string | null;
  principles_en: string | null;
  social_links: Record<string, string> | null;
};

/**
 * Fetch about page content
 */
export function useAbout() {
  return useQuery({
    queryKey: ["about"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("about")
        .select("*")
        .single();

      // Return null if no data (graceful degradation)
      if (error && error.code === "PGRST116") {
        return null;
      }

      if (error) throw error;
      return data as AboutData;
    },
  });
}

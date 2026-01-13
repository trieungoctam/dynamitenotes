/**
 * use-taxonomy hook
 * Fetches taxonomy items (goals, outcomes, tags) from Supabase.
 */

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Taxonomy } from "@/types/database";

type TaxonomyType = "goal" | "outcome" | "tag";

export function useTaxonomy(type: TaxonomyType) {
  return useQuery({
    queryKey: ["taxonomy", type],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("taxonomy")
        .select("*")
        .eq("type", type)
        .order("sort_order", { ascending: true });

      if (error) throw error;
      return data as Taxonomy[];
    },
  });
}

export function useAllTaxonomy() {
  return useQuery({
    queryKey: ["taxonomy"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("taxonomy")
        .select("*")
        .order("type")
        .order("sort_order", { ascending: true });

      if (error) throw error;
      return data as Taxonomy[];
    },
  });
}

export function useTaxonomyById(id: string) {
  return useQuery({
    queryKey: ["taxonomy", "item", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("taxonomy")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as Taxonomy;
    },
    enabled: !!id,
  });
}

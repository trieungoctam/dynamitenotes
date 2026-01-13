/**
 * useSearch
 * Hook for searching posts and insights with language awareness.
 */

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useLanguage } from "@/contexts/LanguageContext";

interface SearchResult {
  posts: PostResult[];
  insights: InsightResult[];
}

interface PostResult {
  id: string;
  slug: string;
  title_vi: string;
  title_en: string | null;
  excerpt_vi: string | null;
  excerpt_en: string | null;
  published_at: string | null;
}

interface InsightResult {
  id: string;
  content_vi: string;
  content_en: string | null;
  tags: string[] | null;
  created_at: string;
}

export function useSearch(query: string) {
  const { lang } = useLanguage();

  return useQuery<SearchResult>({
    queryKey: ["search", query, lang],
    queryFn: async () => {
      if (!query || query.length < 2) {
        return { posts: [], insights: [] };
      }

      const searchTerm = `%${query}%`;

      // Search posts - search in both title and content
      const { data: posts, error: postsError } = await supabase
        .from("posts")
        .select("id, slug, title_vi, title_en, excerpt_vi, excerpt_en, published_at")
        .eq("published", true)
        .or(
          lang === "en"
            ? `title_en.ilike.${searchTerm},content_en.ilike.${searchTerm}`
            : `title_vi.ilike.${searchTerm},content_vi.ilike.${searchTerm}`
        )
        .order("published_at", { ascending: false })
        .limit(20);

      // Search insights
      const { data: insights, error: insightsError } = await supabase
        .from("insights")
        .select("id, content_vi, content_en, tags, created_at")
        .eq("published", true)
        .or(
          lang === "en"
            ? `content_en.ilike.${searchTerm}`
            : `content_vi.ilike.${searchTerm}`
        )
        .order("created_at", { ascending: false })
        .limit(10);

      if (postsError) {
        console.error("Posts search error:", postsError);
        throw postsError;
      }

      if (insightsError) {
        console.error("Insights search error:", insightsError);
        throw insightsError;
      }

      return {
        posts: (posts as PostResult[]) || [],
        insights: (insights as InsightResult[]) || [],
      };
    },
    enabled: query.length >= 2,
    staleTime: 60000, // 1 minute cache
    gcTime: 300000, // 5 minutes garbage collection
  });
}

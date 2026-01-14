/**
 * Insights Page
 * Displays all insights with infinite scroll, tag filtering, and search.
 * Enhanced with Dark Mode (OLED) styling.
 */

import { useEffect, useState, useMemo, useCallback } from "react";
import { useInView } from "react-intersection-observer";
import { useInsights, usePinnedInsights } from "@/hooks/use-insights";
import { InsightCard } from "@/components/content/InsightCard";
import { TagFilterBar } from "@/components/content/TagFilterBar";
import { InsightsSearch } from "@/components/content/InsightsSearch";
import { Loader2, Pin, Sparkles, X } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";

export default function Insights() {
  const { ref, inView } = useInView();
  const { getLocalizedField } = useLanguage();

  // Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
  const [searchInput, setSearchInput] = useState("");

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(searchInput);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const {
    data: pinnedData,
    isLoading: pinnedLoading,
  } = usePinnedInsights();

  const {
    data: insightsData,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInsights();

  // Trigger fetch when bottom is in view
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Flatten paginated data
  const allInsights = insightsData?.pages.flatMap((page) => page.insights) || [];

  // Extract all unique tags
  const allTags = useMemo(() => {
    const tagsSet = new Set<string>();
    allInsights.forEach((insight) => {
      insight.tags?.forEach((tag) => tagsSet.add(tag));
    });
    return Array.from(tagsSet).sort();
  }, [allInsights]);

  // Filter insights based on search and tags
  const filteredInsights = useMemo(() => {
    return allInsights.filter((insight) => {
      // Search filter
      if (searchQuery) {
        const content = getLocalizedField(insight, "content").toLowerCase();
        if (!content.includes(searchQuery.toLowerCase())) return false;
      }

      // Tag filter (OR logic - match any selected tag)
      if (selectedTags.size > 0) {
        const insightTags = insight.tags || [];
        if (!selectedTags.some((tag) => insightTags.includes(tag))) return false;
      }

      return true;
    });
  }, [allInsights, searchQuery, selectedTags, getLocalizedField]);

  // Filter out pinned from main list to avoid duplicates
  const pinnedIds = new Set(pinnedData?.map((i) => i.id) || []);
  const nonPinnedInsights = filteredInsights.filter((i) => !pinnedIds.has(i.id));

  // Filter pinned insights
  const filteredPinnedInsights = useMemo(() => {
    if (!pinnedData) return [];
    return pinnedData.filter((insight) => {
      // Search filter
      if (searchQuery) {
        const content = getLocalizedField(insight, "content").toLowerCase();
        if (!content.includes(searchQuery.toLowerCase())) return false;
      }

      // Tag filter
      if (selectedTags.size > 0) {
        const insightTags = insight.tags || [];
        if (!selectedTags.some((tag) => insightTags.includes(tag))) return false;
      }

      return true;
    });
  }, [pinnedData, searchQuery, selectedTags, getLocalizedField]);

  // Tag toggle handler
  const handleTagToggle = useCallback((tag: string) => {
    setSelectedTags((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(tag)) {
        newSet.delete(tag);
      } else {
        newSet.add(tag);
      }
      return newSet;
    });
  }, []);

  // Clear all filters
  const handleClearAll = useCallback(() => {
    setSelectedTags(new Set());
    setSearchInput("");
    setSearchQuery("");
  }, []);

  // Check if any filters are active
  const hasActiveFilters = searchQuery || selectedTags.size > 0;

  // Get filtered pinned IDs for deduplication
  const filteredPinnedIds = new Set(filteredPinnedInsights.map((i) => i.id));

  return (
    <main className="min-h-screen">
      {/* Header with gradient background */}
      <section className="relative overflow-hidden border-b border-border/30">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 via-transparent to-transparent" />
        <div className="container px-4 md:px-6 lg:px-8 py-12 md:py-16">
          <div className="relative">
            <h1 className="text-4xl md:text-5xl font-bold mb-3">Insights</h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Quick notes, learnings, and observations from the field.
            </p>

            {/* Search Input */}
            <div className="mt-6 max-w-md">
              <InsightsSearch
                value={searchInput}
                onChange={setSearchInput}
                placeholder="Search insights..."
              />
            </div>

            {/* Active Filters */}
            {hasActiveFilters && (
              <div className="mt-4 flex items-center gap-2 flex-wrap">
                <span className="text-sm text-muted-foreground">Active filters:</span>
                {searchQuery && (
                  <div className="inline-flex items-center gap-1 px-2 py-1 border border-primary/30 text-primary text-xs rounded-full bg-primary/5 dark:bg-transparent">
                    <span>Search: "{searchQuery}"</span>
                    <button
                      onClick={() => {
                        setSearchInput("");
                        setSearchQuery("");
                      }}
                      className="hover:opacity-70"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
                {Array.from(selectedTags).map((tag) => (
                  <div
                    key={tag}
                    className="inline-flex items-center gap-1 px-2 py-1 border border-primary/30 text-primary text-xs rounded-full bg-primary/5 dark:bg-transparent"
                  >
                    <span>{tag}</span>
                    <button
                      onClick={() => handleTagToggle(tag)}
                      className="hover:opacity-70"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={handleClearAll}
                >
                  Clear all
                </Button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Pinned Insights */}
      {pinnedLoading ? (
        <section className="container px-4 md:px-6 lg:px-8 py-8">
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="h-32 rounded-2xl bg-muted/30 animate-pulse border border-border/30"
              />
            ))}
          </div>
        </section>
      ) : filteredPinnedInsights.length > 0 ? (
        <section className="border-b border-border/30">
          <div className="container px-4 md:px-6 lg:px-8 py-8">
            <div className="flex items-center gap-2 mb-6 text-amber-500">
              <Pin className="w-5 h-5" />
              <h2 className="text-xl font-bold">Pinned</h2>
            </div>
            <div className="space-y-4">
              {filteredPinnedInsights.map((insight) => (
                <InsightCard key={insight.id} insight={insight} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* All Insights */}
      {isLoading ? (
        <section className="container px-4 md:px-6 lg:px-8 py-8">
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="h-32 rounded-2xl bg-muted/30 animate-pulse border border-border/30"
              />
            ))}
          </div>
        </section>
      ) : nonPinnedInsights.length > 0 ? (
        <section className="container px-4 md:px-6 lg:px-8 py-8 md:py-12">
          {/* Tag Filter Bar */}
          {allTags.length > 0 && (
            <div className="mb-8">
              <TagFilterBar
                availableTags={allTags}
                selectedTags={selectedTags}
                onTagToggle={handleTagToggle}
                onClearAll={handleClearAll}
              />
            </div>
          )}

          <div className="space-y-4">
            {nonPinnedInsights.map((insight) => (
              <InsightCard key={insight.id} insight={insight} />
            ))}

            {/* Infinite scroll trigger */}
            <div ref={ref} className="py-8 text-center">
              {isFetchingNextPage && (
                <div className="flex items-center justify-center gap-3 text-muted-foreground">
                  <Loader2 className="w-5 h-5 animate-spin text-blue-400" />
                  <span>Loading more...</span>
                </div>
              )}
              {!hasNextPage && nonPinnedInsights.length > 0 && (
                <div className="flex items-center justify-center gap-2 py-4">
                  <Sparkles className="w-5 h-5 text-blue-400" />
                  <p className="text-sm text-muted-foreground">
                    You've seen all insights
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>
      ) : (
        <section className="container px-4 md:px-6 lg:px-8 py-16">
          {/* Tag Filter Bar (show even when no results) */}
          {allTags.length > 0 && (
            <div className="mb-8">
              <TagFilterBar
                availableTags={allTags}
                selectedTags={selectedTags}
                onTagToggle={handleTagToggle}
                onClearAll={handleClearAll}
              />
            </div>
          )}

          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-muted/20 mb-4">
              <Sparkles className="w-8 h-8 text-muted-foreground" />
            </div>
            {hasActiveFilters ? (
              <>
                <p className="text-lg text-muted-foreground mb-4">
                  No insights match your filters
                </p>
                <Button variant="outline" onClick={handleClearAll}>
                  Clear filters
                </Button>
              </>
            ) : (
              <p className="text-lg text-muted-foreground">
                No insights yet. Check back soon!
              </p>
            )}
          </div>
        </section>
      )}
    </main>
  );
}

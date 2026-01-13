/**
 * Insights Page
 * Displays all insights with infinite scroll.
 * Enhanced with Dark Mode (OLED) styling.
 */

import { useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { useInsights, usePinnedInsights } from "@/hooks/use-insights";
import { InsightCard } from "@/components/content/InsightCard";
import { Loader2, Pin, Sparkles } from "lucide-react";

export default function Insights() {
  const { ref, inView } = useInView();

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

  // Filter out pinned from main list to avoid duplicates
  const pinnedIds = new Set(pinnedData?.map((i) => i.id) || []);
  const nonPinnedInsights = allInsights.filter((i) => !pinnedIds.has(i.id));

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
      ) : pinnedData && pinnedData.length > 0 ? (
        <section className="border-b border-border/30">
          <div className="container px-4 md:px-6 lg:px-8 py-8">
            <div className="flex items-center gap-2 mb-6 text-amber-500">
              <Pin className="w-5 h-5" />
              <h2 className="text-xl font-bold">Pinned</h2>
            </div>
            <div className="space-y-4">
              {pinnedData.map((insight) => (
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
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-muted/20 mb-4">
              <Sparkles className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-lg text-muted-foreground">No insights yet. Check back soon!</p>
          </div>
        </section>
      )}
    </main>
  );
}

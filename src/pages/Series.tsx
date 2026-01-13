/**
 * Series Page
 * Displays all published series.
 */

import { useSeries } from "@/hooks/use-series";
import { SeriesCard } from "@/components/content/SeriesCard";

export default function Series() {
  const { data: series, isLoading, error } = useSeries();

  return (
    <main className="container px-4 md:px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Series</h1>
        <p className="text-muted-foreground">
          Curated collections of posts organized by topic.
        </p>
      </div>

      {/* Series Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-64 rounded-xl bg-muted/50 animate-pulse"
            />
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-red-500">Error loading series. Please try again.</p>
        </div>
      ) : series && series.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {series.map((s) => (
            <SeriesCard key={s.id} series={s} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          <p>No series yet. Check back soon!</p>
        </div>
      )}
    </main>
  );
}

/**
 * SeriesCard
 * Displays a series preview with cover, title, and post count.
 */

import { Link } from "react-router-dom";
import { BookOpen, Clock, ArrowRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent } from "@/components/ui/card";
import type { Series } from "@/types/database";

interface SeriesCardProps {
  series: Series;
}

export function SeriesCard({ series }: SeriesCardProps) {
  const { getLocalizedField } = useLanguage();

  const title = getLocalizedField(series, "title");
  const description = getLocalizedField(series, "description");
  const postCount = series.post_ids?.length || 0;

  return (
    <Link to={`/series/${series.slug}`}>
      <Card className="group h-full overflow-hidden hover:bg-muted/50 transition-colors border-border/50">
        {series.cover_image && (
          <div className="aspect-video overflow-hidden">
            <img
              src={series.cover_image}
              alt={title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        )}
        <CardContent className="p-4 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
              {title}
            </h3>
            <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-1" />
          </div>

          {description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {description}
            </p>
          )}

          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <BookOpen className="w-3 h-3" />
              <span>
                {postCount} {postCount === 1 ? "post" : "posts"}
              </span>
            </div>
            {series.featured && (
              <div className="flex items-center gap-1 text-amber-500">
                <Clock className="w-3 h-3" />
                <span>Featured</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

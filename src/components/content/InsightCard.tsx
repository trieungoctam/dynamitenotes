/**
 * InsightCard
 * Displays a compact insight preview with tags and related post.
 */

import { Link } from "react-router-dom";
import { Pin, ArrowRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { MarkdownRenderer } from "./MarkdownRenderer";
import type { InsightWithRelations } from "@/hooks/use-insights";

interface InsightCardProps {
  insight: InsightWithRelations;
}

export function InsightCard({ insight }: InsightCardProps) {
  const { getLocalizedField } = useLanguage();

  const content = getLocalizedField(insight, "content");

  // Truncate content for preview (first 200 chars)
  const previewContent =
    content.length > 200 ? content.substring(0, 200) + "..." : content;

  return (
    <Card className="border-border/50 hover:bg-muted/30 transition-colors">
      <CardContent className="p-4 space-y-3">
        {insight.pinned && (
          <div className="flex items-center gap-1 text-xs text-amber-500">
            <Pin className="w-3 h-3" />
            <span>Pinned</span>
          </div>
        )}

        <div className="prose prose-sm prose-invert max-w-none">
          <MarkdownRenderer content={previewContent} className="text-sm" />
        </div>

        {insight.tags && insight.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {insight.tags.map((tag) => (
              <Badge
                key={tag}
                variant="outline"
                className="text-xs bg-muted/50"
              >
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {insight.related_post && (
          <Link
            to={`/posts/${insight.related_post.slug}`}
            className="flex items-center gap-1 text-xs text-primary hover:underline"
          >
            <span>Related: {insight.related_post.title_vi}</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        )}
      </CardContent>
    </Card>
  );
}

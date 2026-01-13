/**
 * SearchResultItem
 * Individual search result with query highlighting.
 */

import { Link } from "react-router-dom";
import { Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";

interface SearchResultItemProps {
  title: string;
  excerpt: string;
  href: string;
  query: string;
  date?: string;
  className?: string;
}

/**
 * Highlight matching text in content
 */
function highlightText(text: string, query: string): React.ReactNode {
  if (!query) return text;

  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
  const parts = text.split(regex);

  return parts.map((part, index) =>
    regex.test(part) ? (
      <mark key={index} className="bg-yellow-500/20 text-foreground rounded px-0.5">
        {part}
      </mark>
    ) : (
      part
    )
  );
}

/**
 * Truncate text to max length, preserving word boundaries
 */
function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;

  const truncated = text.slice(0, maxLength);
  const lastSpace = truncated.lastIndexOf(" ");

  return lastSpace > 0 ? truncated.slice(0, lastSpace) + "..." : truncated + "...";
}

export function SearchResultItem({
  title,
  excerpt,
  href,
  query,
  date,
  className = "",
}: SearchResultItemProps) {
  const { lang } = useLanguage();

  // Format date
  const formattedDate = date
    ? new Date(date).toLocaleDateString(lang === "vi" ? "vi-VN" : "en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : null;

  // Get truncated excerpt for display
  const displayExcerpt = truncateText(excerpt || "", 200);

  return (
    <Link
      to={href}
      className={cn(
        "block p-4 rounded-lg border border-border bg-surface-elevated",
        "hover:bg-muted/50 hover:border-border/80 transition-all",
        "group"
      , className)}
    >
      {/* Title with highlighting */}
      <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors mb-2">
        {highlightText(title, query)}
      </h3>

      {/* Excerpt with highlighting */}
      <p className="text-sm text-muted-foreground leading-relaxed">
        {highlightText(displayExcerpt, query)}
      </p>

      {/* Date if available */}
      {formattedDate && (
        <div className="flex items-center gap-1.5 mt-3 text-xs text-muted-foreground">
          <Calendar className="w-3 h-3" />
          <span>{formattedDate}</span>
        </div>
      )}
    </Link>
  );
}

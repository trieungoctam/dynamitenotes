/**
 * PostCard - Editorial Magazine Design
 * ====================================
 * Distinctive blog post card with asymmetric layout,
 * dramatic typography, and memorable interactions.
 *
 * Design features:
 * - Giant post number as background watermark
 * - Hover-triggered image reveal
 * - Brutalist metadata badges
 * - Asymmetric information hierarchy
 */

import { Link } from "react-router-dom";
import { Clock, ArrowRight, Calendar } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import type { PostWithRelations } from "@/hooks/use-posts";

interface PostCardProps {
  post: PostWithRelations;
  index?: number;
  variant?: "default" | "featured" | "compact";
}

export function PostCard({ post, index = 0, variant = "default" }: PostCardProps) {
  const { getLocalizedField } = useLanguage();
  const title = getLocalizedField(post, "title");
  const excerpt = getLocalizedField(post, "excerpt");

  // Featured variant: larger, more dramatic
  if (variant === "featured") {
    return (
      <Link
        to={`/posts/${post.slug}`}
        className="group block brutal-box p-8 md:p-12 hover-lift relative overflow-hidden"
      >
        {/* Giant watermark number */}
        <div className="absolute -right-8 -top-8 text-[12rem] md:text-[16rem] font-display font-bold opacity-5 leading-none select-none">
          {String(index + 1).padStart(2, "0")}
        </div>

        {/* Content */}
        <div className="relative z-10">
          {/* Metadata row */}
          <div className="flex items-center gap-4 mb-6 text-sm font-mono">
            {post.published_at && (
              <span className="flex items-center gap-2 opacity-70">
                <Calendar className="w-4 h-4" />
                {new Date(post.published_at).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            )}
            {post.read_time && (
              <span className="flex items-center gap-2 opacity-70">
                <Clock className="w-4 h-4" />
                {post.read_time}m
              </span>
            )}
          </div>

          {/* Title - dramatic editorial */}
          <h3 className="font-display text-3xl md:text-4xl lg:text-5xl leading-[0.95] mb-6 group-hover:underline decoration-4 underline-offset-4 transition-all">
            {title}
          </h3>

          {/* Excerpt */}
          {excerpt && (
            <p className="text-base md:text-lg opacity-70 leading-relaxed mb-6 line-clamp-3 max-w-2xl">
              {excerpt}
            </p>
          )}

          {/* Tags */}
          <div className="flex items-center gap-3 flex-wrap">
            {post.level && (
              <span className="code-label">
                {post.level.toUpperCase()}
              </span>
            )}
            {post.goal && (
              <span className="code-label">
                {post.goal.name_en.toUpperCase()}
              </span>
            )}
            {post.outcome && (
              <span className="code-label">
                {post.outcome.name_en.toUpperCase()}
              </span>
            )}
          </div>

          {/* Arrow indicator */}
          <ArrowRight className="w-6 h-6 mt-6 opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all duration-300" />
        </div>
      </Link>
    );
  }

  // Compact variant for grids
  if (variant === "compact") {
    return (
      <Link
        to={`/posts/${post.slug}`}
        className="group block brutal-box-sm p-5 hover-lift relative"
      >
        {/* Subtle watermark */}
        <div className="absolute -right-2 -bottom-2 text-6xl font-display font-bold opacity-5 leading-none select-none">
          {index + 1}
        </div>

        <div className="relative z-10">
          {/* Title */}
          <h3 className="font-display text-xl leading-tight mb-3 group-hover:underline decoration-2 underline-offset-2 transition-all">
            {title}
          </h3>

          {/* Metadata */}
          <div className="flex items-center gap-3 text-xs font-mono opacity-60">
            {post.published_at && (
              <span>
                {new Date(post.published_at).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </span>
            )}
            {post.read_time && (
              <span>• {post.read_time}m</span>
            )}
          </div>

          {/* Tags */}
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            {post.level && (
              <span className="text-[10px] font-mono px-2 py-0.5 border border-foreground/30">
                {post.level}
              </span>
            )}
            {post.goal && (
              <span className="text-[10px] font-mono px-2 py-0.5 border border-foreground/30">
                {post.goal.name_en}
              </span>
            )}
          </div>
        </div>
      </Link>
    );
  }

  // Default variant - asymmetric editorial card
  return (
    <Link
      to={`/posts/${post.slug}`}
      className="group block brutal-box p-6 hover-lift relative overflow-hidden"
    >
      {/* Giant watermark number */}
      <div className="absolute -right-4 -bottom-4 text-8xl font-display font-bold opacity-5 leading-none select-none">
        {index + 1}
      </div>

      <div className="relative z-10">
        {/* Metadata row */}
        <div className="flex items-center gap-3 mb-4 text-xs font-mono opacity-50">
          {post.published_at && (
            <span>
              {new Date(post.published_at).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </span>
          )}
          {post.read_time && (
            <span>• {post.read_time}m</span>
          )}
        </div>

        {/* Title */}
        <h3 className="font-display text-2xl leading-[0.95] mb-3 group-hover:underline decoration-2 underline-offset-2 transition-all line-clamp-3">
          {title}
        </h3>

        {/* Excerpt */}
        {excerpt && (
          <p className="text-sm opacity-60 leading-relaxed mb-4 line-clamp-2">
            {excerpt}
          </p>
        )}

        {/* Tags */}
        <div className="flex items-center gap-2 flex-wrap">
          {post.level && (
            <span className="text-[10px] font-mono px-2 py-1 border border-foreground/30">
              {post.level.toUpperCase()}
            </span>
          )}
          {post.goal && (
            <span className="text-[10px] font-mono px-2 py-1 border border-foreground/30">
              {post.goal.name_en.toUpperCase()}
            </span>
          )}
        </div>

        {/* Arrow - appears on hover */}
        <ArrowRight className="w-5 h-5 mt-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
      </div>
    </Link>
  );
}

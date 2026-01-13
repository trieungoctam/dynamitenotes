/**
 * Posts Page - Editorial Magazine Design
 * ======================================
 * Displays all published posts with asymmetric grid layout,
 * dramatic typography, and distinctive visual hierarchy.
 *
 * Design features:
 * - Featured posts section with large hero cards
 * - Bento-style asymmetric grid for remaining posts
 * - Sticky filters sidebar on desktop
 * - Animated number counter for posts
 */

import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { usePosts } from "@/hooks/use-posts";
import { PostCard } from "@/components/content/PostCard";
import { GoalPicker } from "@/components/content/GoalPicker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X, Filter } from "lucide-react";

export default function Posts() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialGoal = searchParams.get("goal");

  const [selectedGoal, setSelectedGoal] = useState<string | null>(initialGoal);
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);

  const { data: posts, isLoading, error } = usePosts({
    goal: selectedGoal || undefined,
    level: selectedLevel || undefined,
  });

  const handleGoalChange = (goal: string | null) => {
    setSelectedGoal(goal);
    if (goal) {
      setSearchParams({ goal });
    } else {
      setSearchParams({});
    }
  };

  const clearFilters = () => {
    setSelectedGoal(null);
    setSelectedLevel(null);
    setSearchParams({});
  };

  const hasActiveFilters = selectedGoal || selectedLevel;

  // Split posts: first 2-3 as featured, rest in grid
  const { featuredPosts, gridPosts } = useMemo(() => {
    if (!posts || posts.length === 0) return { featuredPosts: [], gridPosts: [] };

    const featured = posts.slice(0, 3);
    const grid = posts.slice(3);

    return { featuredPosts: featured, gridPosts: grid };
  }, [posts]);

  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Noise overlay */}
      <div className="fixed inset-0 bg-noise pointer-events-none z-50" />

      {/* ========================================
          HERO HEADER - Dramatic Editorial
          ======================================== */}
      <section className="border-b-2 border-foreground relative overflow-hidden">
        {/* Giant background text */}
        <div className="absolute inset-0 flex items-center justify-center overflow-hidden opacity-[0.02] pointer-events-none">
          <h1 className="font-display text-[20vw] leading-none whitespace-nowrap">
            ARCHIVE
          </h1>
        </div>

        <div className="container px-4 md:px-8 lg:px-12 py-16 md:py-24 relative z-10">
          {/* Eyebrow */}
          <div className="flex items-center gap-4 mb-8 animate-hidden animate-in">
            <div className="w-24 h-px bg-foreground" />
            <span className="code-label">LIBRARY</span>
            <div className="w-24 h-px bg-foreground" />
          </div>

          {/* Main title */}
          <div className="grid lg:grid-cols-12 gap-8 items-end">
            <div className="lg:col-span-8">
              <h1 className="text-editorial-xl font-display mb-6 animate-hidden animate-slide-up delay-100">
                The Archive
              </h1>
              <p className="text-lg md:text-xl max-w-2xl opacity-70 leading-relaxed animate-hidden animate-in delay-200">
                Long-form articles, guides, and playbooks for product development.
                <br />
                <span className="font-mono text-sm opacity-50">
                  {posts?.length || 0} articles published
                </span>
              </p>
            </div>

            {/* Stats box */}
            <div className="lg:col-span-4 animate-hidden animate-scale-in delay-300">
              <div className="brutal-box-sm">
                <div className="font-mono text-xs opacity-50 mb-2">FILTERS</div>
                <div className="font-display text-3xl">
                  {posts?.length || 0}
                </div>
                <div className="text-sm opacity-60">Articles</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================
          FILTERS BAR - Sticky on Desktop
          ======================================== */}
      <section className="sticky top-0 z-40 border-b-2 border-foreground bg-background/95 backdrop-blur">
        <div className="container px-4 md:px-8 lg:px-12 py-6">
          <div className="flex items-start gap-8">
            {/* Label */}
            <div className="hidden md:flex items-center gap-2 font-mono text-sm">
              <Filter className="w-4 h-4" />
              <span>REFINE</span>
            </div>

            {/* Filters */}
            <div className="flex-1 flex items-center gap-4 flex-wrap">
              {/* Goal Picker */}
              <div>
                <span className="text-xs font-mono opacity-50 block mb-2">GOAL</span>
                <GoalPicker
                  selectedGoal={selectedGoal}
                  onSelectGoal={handleGoalChange}
                  compact
                />
              </div>

              {/* Level Filter */}
              <div>
                <span className="text-xs font-mono opacity-50 block mb-2">LEVEL</span>
                <Select
                  value={selectedLevel || "all"}
                  onValueChange={(value) =>
                    setSelectedLevel(value === "all" ? null : value)
                  }
                >
                  <SelectTrigger className="w-36 border-2 border-foreground bg-transparent h-10">
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="starter">Starter</SelectItem>
                    <SelectItem value="builder">Builder</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Clear */}
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="brutal-btn-sm px-4 py-2 text-sm h-10 mt-6"
                >
                  <X className="w-4 h-4 mr-1" />
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ========================================
          FEATURED POSTS - Asymmetric Hero Layout
          ======================================== */}
      {featuredPosts.length > 0 && (
        <section className="container px-4 md:px-8 lg:px-12 py-12 md:py-16">
          {/* Section header */}
          <div className="flex items-center gap-4 mb-8">
            <span className="code-label">FEATURED</span>
            <div className="flex-1 h-px bg-foreground/20" />
          </div>

          {/* Featured grid - asymmetric bento layout */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {/* First featured post spans full width on mobile, 2 cols on tablet */}
            {featuredPosts.map((post, idx) => (
              <div
                key={post.id}
                className={idx === 0 ? "md:col-span-2" : ""}
              >
                <PostCard post={post} index={idx} variant="featured" />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ========================================
          GRID POSTS - Masonry-style Grid
          ======================================== */}
      {gridPosts.length > 0 && (
        <section className="container px-4 md:px-8 lg:px-12 py-12 border-t-2 border-foreground/10">
          {/* Section header */}
          <div className="flex items-center gap-4 mb-8">
            <span className="code-label">ALL POSTS</span>
            <div className="flex-1 h-px bg-foreground/20" />
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="brutal-box h-64 flex items-center justify-center"
                >
                  <div className="animate-spin w-12 h-12 border-4 border-foreground border-t-transparent" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="brutal-box py-16 text-center">
              <X className="w-16 h-16 mx-auto mb-4" />
              <p className="text-xl font-display mb-2">Error loading posts</p>
              <p className="text-sm opacity-70">Please try again later</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {gridPosts.map((post, idx) => (
                <PostCard
                  key={post.id}
                  post={post}
                  index={idx + featuredPosts.length}
                  variant="default"
                />
              ))}
            </div>
          )}
        </section>
      )}

      {/* ========================================
          EMPTY STATE
          ======================================== */}
      {!isLoading && !error && posts && posts.length === 0 && (
        <section className="container px-4 md:px-8 lg:px-12 py-24">
          <div className="brutal-box py-20 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 border-2 border-foreground mb-6">
              <X className="w-10 h-10" />
            </div>
            <div className="space-y-6">
              <p className="text-3xl font-display">No posts found</p>
              {hasActiveFilters && (
                <div className="space-y-3">
                  <p className="text-sm opacity-70">
                    Try adjusting your filters
                  </p>
                  <button
                    onClick={clearFilters}
                    className="brutal-btn"
                  >
                    Clear all filters
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}

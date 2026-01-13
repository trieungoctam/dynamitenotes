/**
 * PostDetail Page - Editorial Magazine Design
 * ============================================
 * Displays a single post with dramatic typography,
 * asymmetric layout, and distinctive visual hierarchy.
 *
 * Design features:
 * - Giant drop-cap style numbering
 * - Full-bleed header with backdrop blur
 * - Progress reading indicator
 * - Sticky metadata sidebar on desktop
 */

import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Clock, Calendar, ArrowRight, X } from "lucide-react";
import { usePost, useRelatedPosts } from "@/hooks/use-posts";
import { useLanguage } from "@/contexts/LanguageContext";
import { MarkdownRenderer } from "@/components/content/MarkdownRenderer";
import { PostCard } from "@/components/content/PostCard";
import { format } from "date-fns";
import { updateMetaTags, resetMetaTags, getPostMetaConfig } from "@/lib/seo";

export default function PostDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { data: post, isLoading, error } = usePost(slug || "");
  const { getLocalizedField, lang } = useLanguage();
  const [readingProgress, setReadingProgress] = useState(0);

  // Update SEO meta tags when post loads
  useEffect(() => {
    if (post) {
      const metaConfig = getPostMetaConfig(post, lang);
      updateMetaTags(metaConfig);
    }

    // Cleanup: reset meta tags on unmount
    return () => {
      resetMetaTags();
    };
  }, [post, lang]);

  // Reading progress indicator
  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight - windowHeight;
      const scrolled = window.scrollY;
      const progress = (scrolled / documentHeight) * 100;
      setReadingProgress(Math.min(100, Math.max(0, progress)));
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const { data: relatedPosts } = useRelatedPosts(
    post?.id || "",
    post?.goal_id
  );

  if (isLoading) {
    return (
      <main className="min-h-screen">
        {/* Loading state */}
        <section className="container px-4 md:px-8 lg:px-12 py-24">
          <div className="max-w-4xl mx-auto">
            <div className="h-4 w-32 bg-foreground/10 animate-pulse mb-8" />
            <div className="h-16 md:h-24 w-full bg-foreground/10 animate-pulse mb-6" />
            <div className="space-y-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="h-4 w-full bg-foreground/5 animate-pulse"
                  style={{ animationDelay: `${i * 100}ms` }}
                />
              ))}
            </div>
          </div>
        </section>
      </main>
    );
  }

  if (error || !post) {
    return (
      <main className="min-h-screen">
        <section className="container px-4 md:px-8 lg:px-12 py-24">
          <div className="max-w-2xl mx-auto text-center py-16">
            <div className="brutal-box p-12">
              <div className="inline-flex items-center justify-center w-20 h-20 border-2 border-foreground mb-8">
                <X className="w-10 h-10" />
              </div>
              <h1 className="text-4xl md:text-5xl font-display mb-6">Post Not Found</h1>
              <p className="text-lg opacity-70 mb-8 max-w-md mx-auto">
                The post you're looking for doesn't exist or has been removed.
              </p>
              <Link to="/posts" className="brutal-btn">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Posts
              </Link>
            </div>
          </div>
        </section>
      </main>
    );
  }

  const title = getLocalizedField(post, "title");
  const content = getLocalizedField(post, "content");
  const excerpt = getLocalizedField(post, "excerpt");

  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Noise overlay */}
      <div className="fixed inset-0 bg-noise pointer-events-none z-50" />

      {/* Reading progress bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-foreground/10 z-50">
        <div
          className="h-full bg-foreground transition-all duration-150 ease-out"
          style={{ width: `${readingProgress}%` }}
        />
      </div>

      <article>
        {/* ========================================
            BACK NAVIGATION - Minimal
            ======================================== */}
        <nav className="container px-4 md:px-8 lg:px-12 py-6">
          <Link
            to="/posts"
            className="inline-flex items-center text-sm font-mono opacity-50 hover:opacity-100 transition-opacity group"
          >
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform duration-300" />
            ARCHIVE
          </Link>
        </nav>

        {/* ========================================
            HEADER - Dramatic Editorial
            ======================================== */}
        <header className="border-b-2 border-foreground relative overflow-hidden">
          {/* Giant background number */}
          <div className="absolute top-0 right-0 text-[30vw] font-display font-bold opacity-[0.02] leading-none select-none pointer-events-none">
            {String(post.published_at ? new Date(post.published_at).getFullYear() : new Date().getFullYear())}
          </div>

          <div className="container px-4 md:px-8 lg:px-12 py-16 md:py-24 relative z-10">
            <div className="max-w-4xl mx-auto">
              {/* Metadata row */}
              <div className="flex items-center gap-6 mb-8 text-sm font-mono opacity-50">
                {post.published_at && (
                  <span className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {format(new Date(post.published_at), "MMM d, yyyy")}
                  </span>
                )}
                {post.read_time && (
                  <span className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    {post.read_time} min read
                  </span>
                )}
              </div>

              {/* Title - Dramatic editorial */}
              <h1 className="font-display text-4xl md:text-5xl lg:text-7xl leading-[0.95] mb-8">
                {title}
              </h1>

              {/* Excerpt */}
              {excerpt && (
                <p className="text-xl md:text-2xl opacity-70 leading-relaxed mb-8 max-w-3xl">
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
            </div>
          </div>
        </header>

        {/* ========================================
            CONTENT - Editorial Layout
            ======================================== */}
        <section className="container px-4 md:px-8 lg:px-12 py-16 md:py-24">
          <div className="max-w-4xl mx-auto">
            <div className="prose prose-invert prose-lg max-w-none">
              <MarkdownRenderer content={content} />
            </div>
          </div>
        </section>

        {/* ========================================
            DIVIDER - Graphic Element
            ======================================== */}
        <div className="container px-4 md:px-8 lg:px-12">
          <div className="max-w-4xl mx-auto">
            <div className="h-px bg-foreground/20" />
          </div>
        </div>

        {/* ========================================
            RELATED POSTS - Editorial Grid
            ======================================== */}
        {relatedPosts && relatedPosts.length > 0 && (
          <section className="container px-4 md:px-8 lg:px-12 py-16 md:py-24">
            <div className="max-w-4xl mx-auto">
              {/* Section header */}
              <div className="flex items-center gap-4 mb-12">
                <span className="code-label">RELATED</span>
                <div className="flex-1 h-px bg-foreground/20" />
              </div>

              {/* Grid */}
              <div className="grid md:grid-cols-2 gap-6">
                {relatedPosts.map((relatedPost) => (
                  <PostCard
                    key={relatedPost.id}
                    post={relatedPost}
                    variant="compact"
                  />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ========================================
            BOTTOM NAVIGATION
            ======================================== */}
        <nav className="border-t-2 border-foreground">
          <div className="container px-4 md:px-8 lg:px-12 py-12">
            <div className="max-w-4xl mx-auto">
              <Link
                to="/posts"
                className="brutal-btn group"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                All Posts
                <ArrowRight className="w-4 h-4 ml-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </Link>
            </div>
          </div>
        </nav>
      </article>
    </main>
  );
}

/**
 * DYNAMITE NOTES - HOMEPAGE
 * ==========================
 * Brutalist editorial design with black & white aesthetic
 *
 * Design Philosophy:
 * - Extreme contrast (pure black #000 on pure white #fff)
 * - Oversized typography with tight tracking
 * - Sharp geometric borders (no rounded corners)
 * - Grid-based asymmetric layouts
 * - Snappy, deliberate animations
 */

import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, PenLine, Camera, FileText, Lightbulb, ArrowRight } from "lucide-react";
import { PostCard } from "@/components/content/PostCard";
import { useFeaturedPosts } from "@/hooks/use-posts";
import { useLatestInsights } from "@/hooks/use-insights";
import { useLanguage } from "@/contexts/LanguageContext";
import { resetMetaTags } from "@/lib/seo";

const Index = () => {
  const { data: featuredPosts, isLoading: postsLoading } = useFeaturedPosts();
  const { data: latestInsights, isLoading: insightsLoading } = useLatestInsights(3);
  const { getLocalizedField } = useLanguage();

  useEffect(() => {
    resetMetaTags();
  }, []);

  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Noise texture overlay */}
      <div className="fixed inset-0 bg-noise pointer-events-none z-50" />

      {/* ========================================
          HERO SECTION - Oversized Typography
          ======================================== */}
      <section className="relative min-h-screen flex items-center border-b-2 border-foreground">
        {/* Grid background */}
        <div className="absolute inset-0 grid-brutal opacity-50" />

        <div className="container px-4 md:px-8 lg:px-12 py-20 relative z-10">
          <div className="grid lg:grid-cols-12 gap-8 items-center">
            {/* Left: Main headline */}
            <div className="lg:col-span-8 space-y-8">
              {/* Eyebrow */}
              <div className="animate-hidden animate-in">
                <div className="inline-flex items-center gap-4">
                  <div className="w-16 h-px bg-foreground" />
                  <span className="text-sm font-mono uppercase tracking-widest">
                    Portfolio & Blog
                  </span>
                </div>
              </div>

              {/* Main headline - brutalist oversized */}
              <div className="animate-hidden animate-slide-up delay-100">
                <h1 className="text-editorial-xl font-display">
                  DYNAMITE
                  <br />
                  <span className="text-outline">NOTES</span>
                </h1>
              </div>

              {/* Description */}
              <p className="text-lg md:text-xl max-w-2xl leading-relaxed animate-hidden animate-in delay-200">
                Writing about technology, sharing insights from the trenches,
                and documenting the journey through code and creativity.
              </p>

              {/* CTA Buttons - Brutalist style */}
              <div className="flex flex-wrap gap-4 pt-8 animate-hidden animate-in delay-300">
                <Link
                  to="/posts"
                  className="brutal-btn-filled group"
                >
                  Read the Blog
                  <ArrowUpRight className="w-4 h-4 ml-2 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </Link>
                <Link
                  to="/about"
                  className="brutal-btn"
                >
                  About Me
                </Link>
              </div>
            </div>

            {/* Right: Info box */}
            <div className="lg:col-span-4 animate-hidden animate-scale-in delay-400">
              <div className="brutal-box">
                {/* Status indicator */}
                <div className="flex items-center justify-between border-b-2 border-foreground pb-4 mb-6">
                  <span className="text-sm font-mono uppercase">Status</span>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-foreground animate-pulse" />
                    <span className="text-sm font-mono">ONLINE</span>
                  </div>
                </div>

                {/* Bio */}
                <div className="space-y-4">
                  <p className="text-base">
                    Building products, writing code, and sharing what I learn along the way.
                  </p>

                  {/* Tech stack tags */}
                  <div className="flex flex-wrap gap-2 pt-4">
                    {["React", "TypeScript", "Node.js", "AI/ML"].map((tag) => (
                      <span
                        key={tag}
                        className="code-label"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="flex flex-col items-center gap-2">
            <span className="text-xs font-mono uppercase">Scroll</span>
            <div className="w-px h-12 bg-foreground" />
          </div>
        </div>
      </section>

      {/* ========================================
        MARQUEE SECTION - Scrolling Typography
        ======================================== */}
      <section className="border-b-2 border-foreground overflow-hidden py-8 bg-foreground text-background">
        <div className="flex whitespace-nowrap">
          <div className="marquee-text">
            DESIGN • CODE • CREATE • BUILD • SHIP • LEARN • DESIGN • CODE • CREATE • BUILD • SHIP • LEARN •
            DESIGN • CODE • CREATE • BUILD • SHIP • LEARN • DESIGN • CODE • CREATE • BUILD • SHIP • LEARN •
          </div>
          <div className="marquee-text" aria-hidden="true">
            DESIGN • CODE • CREATE • BUILD • SHIP • LEARN • DESIGN • CODE • CREATE • BUILD • SHIP • LEARN •
            DESIGN • CODE • CREATE • BUILD • SHIP • LEARN • DESIGN • CODE • CREATE • BUILD • SHIP • LEARN •
          </div>
        </div>
      </section>

      {/* ========================================
        FEATURED POSTS SECTION
        ======================================== */}
      <section className="py-20 border-b-2 border-foreground">
        <div className="container px-4 md:px-8 lg:px-12">
          {/* Section header */}
          <div className="flex items-end justify-between mb-12">
            <div>
              <span className="code-label mb-4 inline-block">01</span>
              <h2 className="text-editorial-lg">Featured</h2>
            </div>
            <Link
              to="/posts"
              className="brutal-btn hidden md:flex"
            >
              View All Posts
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </div>

          {/* Posts grid - brutalist layout with new variants */}
          {postsLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="brutal-box aspect-square flex items-center justify-center"
                >
                  <div className="animate-spin w-12 h-12 border-4 border-foreground border-t-transparent" />
                </div>
              ))}
            </div>
          ) : featuredPosts && featuredPosts.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredPosts.map((post, index) => (
                <div
                  key={post.id}
                  className="animate-hidden animate-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <PostCard post={post} index={index} variant={index === 0 ? "featured" : "default"} />
                </div>
              ))}
            </div>
          ) : (
            <div className="brutal-box py-12 text-center">
              <p className="text-xl font-display">No posts yet. Stay tuned!</p>
            </div>
          )}

          {/* Mobile CTA */}
          <div className="mt-8 md:hidden">
            <Link to="/posts" className="brutal-btn w-full justify-center">
              View All Posts
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* ========================================
        INSIGHTS SECTION - Asymmetric Layout
        ======================================== */}
      <section className="py-20 border-b-2 border-foreground">
        <div className="container px-4 md:px-8 lg:px-12">
          <div className="grid lg:grid-cols-12 gap-8">
            {/* Left: Title */}
            <div className="lg:col-span-5">
              <span className="code-label mb-4 inline-block">02</span>
              <h2 className="text-editorial-lg mb-6">Latest Insights</h2>
              <p className="text-lg max-w-md">
                Quick thoughts, observations, and learnings from the frontlines of development.
              </p>
            </div>

            {/* Right: Insights grid */}
            <div className="lg:col-span-7">
              {insightsLoading ? (
                <div className="grid md:grid-cols-2 gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="brutal-box-sm h-32" />
                  ))}
                </div>
              ) : latestInsights && latestInsights.length > 0 ? (
                <div className="grid md:grid-cols-2 gap-4">
                  {latestInsights.map((insight, index) => (
                    <Link
                      key={insight.id}
                      to={`/insights/${insight.slug}`}
                      className="brutal-box-sm group cursor-pointer hover-lift animate-hidden animate-in"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <span className="code-label">#{index + 1}</span>
                        <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <h3 className="font-display text-xl mb-2 group-hover:underline decoration-2 underline-offset-4">
                        {getLocalizedField(insight, 'title')}
                      </h3>
                      <p className="text-sm opacity-70 line-clamp-2">
                        {getLocalizedField(insight, 'excerpt')}
                      </p>
                    </Link>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      {/* ========================================
        NAVIGATION GRID - Quick Links
        ======================================== */}
      <section className="py-20 border-b-2 border-foreground">
        <div className="container px-4 md:px-8 lg:px-12">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { to: "/posts", icon: FileText, label: "Posts", desc: "Articles & tutorials" },
              { to: "/insights", icon: Lightbulb, label: "Insights", desc: "Quick thoughts" },
              { to: "/photos", icon: Camera, label: "Photos", desc: "Photography" },
              { to: "/about", icon: PenLine, label: "About", desc: "More about me" },
            ].map((item, index) => (
              <Link
                key={item.to}
                to={item.to}
                className="brutal-box group cursor-pointer hover-lift animate-hidden animate-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <item.icon className="w-8 h-8 mb-4" />
                <h3 className="font-display text-2xl mb-2">{item.label}</h3>
                <p className="text-sm opacity-70">{item.desc}</p>
                <ArrowRight className="w-5 h-5 mt-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================
        FOOTER
        ======================================== */}
      <footer className="py-12">
        <div className="container px-4 md:px-8 lg:px-12">
          <div className="grid md:grid-cols-2 gap-8 items-center border-b-2 border-foreground pb-8 mb-8">
            <div>
              <h2 className="font-display text-4xl md:text-5xl mb-4">
                Let's Connect
              </h2>
              <p className="text-lg max-w-md">
                Have a project in mind? Let's build something extraordinary together.
              </p>
            </div>
            <div className="flex justify-end">
              <a href="mailto:hello@dynamite.notes" className="brutal-btn-filled">
                Get In Touch
                <ArrowUpRight className="w-4 h-4 ml-2" />
              </a>
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm font-mono">
              © {new Date().getFullYear()} Dynamite Notes. All rights reserved.
            </p>
            <p className="text-sm font-mono">
              Built with React, TypeScript & Brutalist Design
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
};

export default Index;

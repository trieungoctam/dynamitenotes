/**
 * SeriesDetail Page
 * Displays a single series with its ordered posts.
 */

import { useParams, Link } from "react-router-dom";
import { ArrowLeft, BookOpen, Clock, CheckCircle2 } from "lucide-react";
import { useSeriesDetail } from "@/hooks/use-series";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function SeriesDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { data: series, isLoading, error } = useSeriesDetail(slug || "");
  const { getLocalizedField } = useLanguage();

  if (isLoading) {
    return (
      <main className="container px-4 md:px-6 py-8">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="h-8 w-48 bg-muted/50 rounded animate-pulse" />
          <div className="h-48 w-full bg-muted/50 rounded-xl animate-pulse" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-20 w-full bg-muted/50 rounded animate-pulse"
              />
            ))}
          </div>
        </div>
      </main>
    );
  }

  if (error || !series) {
    return (
      <main className="container px-4 md:px-6 py-8">
        <div className="max-w-3xl mx-auto text-center py-12">
          <h1 className="text-2xl font-bold mb-4">Series not found</h1>
          <p className="text-muted-foreground mb-6">
            The series you're looking for doesn't exist or has been removed.
          </p>
          <Button asChild>
            <Link to="/series">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Series
            </Link>
          </Button>
        </div>
      </main>
    );
  }

  const title = getLocalizedField(series, "title");
  const description = getLocalizedField(series, "description");
  const posts = series.posts || [];
  const totalReadTime = posts.reduce((acc, p) => acc + (p.read_time || 0), 0);

  return (
    <main className="container px-4 md:px-6 py-8">
      <article className="max-w-3xl mx-auto">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <Link
            to="/series"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Series
          </Link>
        </nav>

        {/* Cover Image */}
        {series.cover_image && (
          <div className="aspect-video rounded-xl overflow-hidden mb-6">
            <img
              src={series.cover_image}
              alt={title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Header */}
        <header className="mb-8 space-y-4">
          <h1 className="text-3xl md:text-4xl font-bold">{title}</h1>

          {description && (
            <p className="text-lg text-muted-foreground">{description}</p>
          )}

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <BookOpen className="w-4 h-4" />
              <span>
                {posts.length} {posts.length === 1 ? "post" : "posts"}
              </span>
            </div>
            {totalReadTime > 0 && (
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{totalReadTime} min total</span>
              </div>
            )}
          </div>
        </header>

        {/* Posts List */}
        {posts.length > 0 ? (
          <section className="space-y-4">
            <h2 className="text-xl font-semibold">Posts in this series</h2>
            <ol className="space-y-3">
              {posts.map((post, index) => (
                <li key={post.id}>
                  <Link
                    to={`/posts/${post.slug}`}
                    className="flex items-start gap-4 p-4 rounded-xl border border-border/50 hover:bg-muted/50 transition-colors group"
                  >
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-sm font-medium flex-shrink-0">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium group-hover:text-primary transition-colors">
                        {getLocalizedField(post, "title")}
                      </h3>
                      {post.read_time && (
                        <p className="text-sm text-muted-foreground">
                          {post.read_time} min read
                        </p>
                      )}
                    </div>
                    {post.level && (
                      <Badge variant="outline" className="flex-shrink-0">
                        {post.level}
                      </Badge>
                    )}
                  </Link>
                </li>
              ))}
            </ol>
          </section>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <p>No posts in this series yet.</p>
          </div>
        )}

        {/* Navigation */}
        <nav className="border-t border-border/50 pt-8 mt-8">
          <Button variant="outline" asChild>
            <Link to="/series">
              <ArrowLeft className="w-4 h-4 mr-2" />
              All Series
            </Link>
          </Button>
        </nav>
      </article>
    </main>
  );
}

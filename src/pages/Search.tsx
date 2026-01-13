/**
 * Search Page
 * Full-text search results page for posts and insights.
 */

import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { FileText, Lightbulb, Search } from "lucide-react";
import { SearchInput } from "@/components/search/SearchInput";
import { SearchResultItem } from "@/components/search/SearchResultItem";
import { useSearch } from "@/hooks/use-search";
import { useLanguage } from "@/contexts/LanguageContext";
import { Skeleton } from "@/components/ui/skeleton";
import { getPageMetaConfig, updateMetaTags } from "@/lib/seo";

// Loading skeleton for search results
function SearchSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="p-4 rounded-lg border border-border bg-surface-elevated">
          <Skeleton className="h-6 w-3/4 mb-2" />
          <Skeleton className="h-4 w-full mb-1" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      ))}
    </div>
  );
}

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryParam = searchParams.get("q") || "";
  const [inputValue, setInputValue] = useState(queryParam);
  const { data, isLoading, isError } = useSearch(queryParam);
  const { lang, getLocalizedField } = useLanguage();

  // Update SEO meta tags
  useEffect(() => {
    const metaConfig = getPageMetaConfig(
      lang === "vi" ? "Tìm kiếm" : "Search",
      lang === "vi"
        ? "Tìm kiếm bài viết và góc nhìn về sản phẩm, kỹ thuật và học tập."
        : "Search posts and insights about product management, engineering, and learning.",
      "/search"
    );
    updateMetaTags(metaConfig);
  }, [lang]);

  // Sync input with URL param
  useEffect(() => {
    setInputValue(queryParam);
  }, [queryParam]);

  const handleSearch = () => {
    if (inputValue.trim()) {
      setSearchParams({ q: inputValue.trim() });
    } else {
      setSearchParams({});
    }
  };

  // Count total results
  const totalResults =
    (data?.posts.length || 0) + (data?.insights.length || 0);
  const hasQuery = queryParam.length >= 2;

  return (
    <main className="container px-4 md:px-6 py-12 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">
          {lang === "vi" ? "Tìm kiếm" : "Search"}
        </h1>
        <p className="text-muted-foreground text-sm">
          {lang === "vi"
            ? "Tìm kiếm bài viết và góc nhìn"
            : "Search posts and insights"}
        </p>
      </div>

      {/* Search Input */}
      <div className="mb-8">
        <SearchInput
          value={inputValue}
          onChange={setInputValue}
          onSubmit={handleSearch}
          placeholder={
            lang === "vi" ? "Tìm bài viết, góc nhìn..." : "Search posts, insights..."
          }
          className="max-w-2xl"
        />
      </div>

      {/* Results */}
      {hasQuery && (
        <div className="space-y-8">
          {isLoading && <SearchSkeleton />}

          {isError && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                {lang === "vi"
                  ? "Có lỗi xảy ra khi tìm kiếm. Vui lòng thử lại."
                  : "An error occurred while searching. Please try again."}
              </p>
            </div>
          )}

          {!isLoading && !isError && data && (
            <>
              {/* Results count */}
              {totalResults > 0 && (
                <p className="text-sm text-muted-foreground">
                  {lang === "vi" ? "Tìm thấy" : "Found"} {totalResults}{" "}
                  {lang === "vi" ? "kết quả" : "results"}
                  {queryParam && (
                    <span>
                      {" "}"
                      <span className="font-mono text-foreground">{queryParam}</span>"
                    </span>
                  )}
                </p>
              )}

              {/* Posts Section */}
              {data.posts.length > 0 && (
                <section>
                  <div className="flex items-center gap-2 mb-4">
                    <FileText className="w-5 h-5 text-primary" />
                    <h2 className="text-lg font-semibold">
                      {lang === "vi" ? "Bài viết" : "Posts"}
                      <span className="ml-2 text-sm font-normal text-muted-foreground">
                        ({data.posts.length})
                      </span>
                    </h2>
                  </div>
                  <div className="grid gap-4">
                    {data.posts.map((post) => (
                      <SearchResultItem
                        key={post.id}
                        title={getLocalizedField(post, "title") || post.title_vi}
                        excerpt={
                          getLocalizedField(post, "excerpt") || post.excerpt_vi || ""
                        }
                        href={`/posts/${post.slug}`}
                        query={queryParam}
                        date={post.published_at || undefined}
                      />
                    ))}
                  </div>
                </section>
              )}

              {/* Insights Section */}
              {data.insights.length > 0 && (
                <section>
                  <div className="flex items-center gap-2 mb-4">
                    <Lightbulb className="w-5 h-5 text-primary" />
                    <h2 className="text-lg font-semibold">
                      {lang === "vi" ? "Góc nhìn" : "Insights"}
                      <span className="ml-2 text-sm font-normal text-muted-foreground">
                        ({data.insights.length})
                      </span>
                    </h2>
                  </div>
                  <div className="grid gap-4">
                    {data.insights.map((insight) => {
                      const content =
                        getLocalizedField(insight, "content") || insight.content_vi;
                      // Extract first tag as title, or use default
                      const title =
                        insight.tags && insight.tags.length > 0
                          ? insight.tags[0]
                          : lang === "vi"
                            ? "Góc nhìn"
                            : "Insight";

                      return (
                        <SearchResultItem
                          key={insight.id}
                          title={title}
                          excerpt={content.slice(0, 200)}
                          href="/insights"
                          query={queryParam}
                          date={insight.created_at}
                        />
                      );
                    })}
                  </div>
                </section>
              )}

              {/* No results */}
              {totalResults === 0 && (
                <div className="text-center py-12">
                  <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">
                    {lang === "vi" ? "Không tìm thấy kết quả" : "No results found"}
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    {lang === "vi"
                      ? "Thử tìm kiếm với từ khóa khác"
                      : "Try searching with different keywords"}
                  </p>
                  <Link
                    to="/posts"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                  >
                    {lang === "vi" ? "Xem tất cả bài viết" : "Browse all posts"}
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Empty state - no query yet */}
      {!hasQuery && (
        <div className="text-center py-16">
          <Search className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-30" />
          <h3 className="text-lg font-semibold mb-2">
            {lang === "vi" ? "Bắt đầu tìm kiếm" : "Start searching"}
          </h3>
          <p className="text-muted-foreground">
            {lang === "vi"
              ? "Nhập từ khóa để tìm bài viết và góc nhìn"
              : "Enter keywords to search posts and insights"}
          </p>
        </div>
      )}
    </main>
  );
}

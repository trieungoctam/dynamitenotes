/**
 * Admin Dashboard - Overview of content stats and quick actions
 */

import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { FileText, Lightbulb, BookOpen, Image, Plus, Eye, EyeOff } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";

interface ContentStats {
  posts: { total: number; published: number; draft: number };
  insights: { total: number; published: number; pinned: number };
  series: { total: number; published: number };
  photos: { total: number };
}

function useContentStats() {
  return useQuery({
    queryKey: ["admin", "stats"],
    queryFn: async (): Promise<ContentStats> => {
      // Fetch counts in parallel
      const [postsRes, insightsRes, seriesRes, photosRes] = await Promise.all([
        supabase.from("posts").select("id, published", { count: "exact" }),
        supabase.from("insights").select("id, published, pinned", { count: "exact" }),
        supabase.from("series").select("id, published", { count: "exact" }),
        supabase.from("photos").select("id", { count: "exact" }),
      ]);

      const posts = postsRes.data || [];
      const insights = insightsRes.data || [];
      const series = seriesRes.data || [];

      return {
        posts: {
          total: posts.length,
          published: posts.filter((p) => p.published).length,
          draft: posts.filter((p) => !p.published).length,
        },
        insights: {
          total: insights.length,
          published: insights.filter((i) => i.published).length,
          pinned: insights.filter((i) => i.pinned).length,
        },
        series: {
          total: series.length,
          published: series.filter((s) => s.published).length,
        },
        photos: {
          total: photosRes.data?.length || 0,
        },
      };
    },
    staleTime: 30000, // Cache for 30s
  });
}

interface RecentItem {
  id: string;
  type: "post" | "insight" | "series";
  title: string;
  published: boolean;
  updated_at: string;
}

function useRecentActivity() {
  return useQuery({
    queryKey: ["admin", "recent"],
    queryFn: async (): Promise<RecentItem[]> => {
      // Fetch recent items from each table
      const [postsRes, insightsRes, seriesRes] = await Promise.all([
        supabase
          .from("posts")
          .select("id, title_vi, published, updated_at")
          .order("updated_at", { ascending: false })
          .limit(5),
        supabase
          .from("insights")
          .select("id, content_vi, published, updated_at")
          .order("updated_at", { ascending: false })
          .limit(5),
        supabase
          .from("series")
          .select("id, title_vi, published, updated_at")
          .order("updated_at", { ascending: false })
          .limit(5),
      ]);

      const items: RecentItem[] = [
        ...(postsRes.data?.map((p) => ({
          id: p.id,
          type: "post" as const,
          title: p.title_vi || "Untitled",
          published: p.published,
          updated_at: p.updated_at,
        })) || []),
        ...(insightsRes.data?.map((i) => ({
          id: i.id,
          type: "insight" as const,
          title: i.content_vi?.slice(0, 50) + "..." || "Untitled",
          published: i.published,
          updated_at: i.updated_at,
        })) || []),
        ...(seriesRes.data?.map((s) => ({
          id: s.id,
          type: "series" as const,
          title: s.title_vi || "Untitled",
          published: s.published,
          updated_at: s.updated_at,
        })) || []),
      ];

      // Sort by updated_at and take top 10
      return items
        .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
        .slice(0, 10);
    },
    staleTime: 30000,
  });
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { data: stats, isLoading: statsLoading } = useContentStats();
  const { data: recent, isLoading: recentLoading } = useRecentActivity();

  const statCards = [
    {
      title: "Posts",
      icon: FileText,
      href: "/admin/posts",
      count: stats?.posts.total || 0,
      sub: `${stats?.posts.published || 0} published, ${stats?.posts.draft || 0} drafts`,
    },
    {
      title: "Insights",
      icon: Lightbulb,
      href: "/admin/insights",
      count: stats?.insights.total || 0,
      sub: `${stats?.insights.published || 0} published, ${stats?.insights.pinned || 0} pinned`,
    },
    {
      title: "Series",
      icon: BookOpen,
      href: "/admin/series",
      count: stats?.series.total || 0,
      sub: `${stats?.series.published || 0} published`,
    },
    {
      title: "Photos",
      icon: Image,
      href: "/admin/photos",
      count: stats?.photos.total || 0,
      sub: "In gallery",
    },
  ];

  const getItemHref = (item: RecentItem) => {
    switch (item.type) {
      case "post":
        return `/admin/posts/${item.id}`;
      case "insight":
        return `/admin/insights/${item.id}`;
      case "series":
        return `/admin/series/${item.id}`;
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of your content
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat) => (
            <Card
              key={stat.title}
              className="cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => navigate(stat.href)}
            >
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <stat.icon className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {statsLoading ? (
                  <div className="h-8 w-16 bg-muted/50 rounded animate-pulse" />
                ) : (
                  <>
                    <div className="text-2xl font-bold">{stat.count}</div>
                    <p className="text-xs text-muted-foreground">{stat.sub}</p>
                  </>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => navigate("/admin/posts/new")}>
            <Plus className="w-4 h-4 mr-2" />
            New Post
          </Button>
          <Button variant="outline" onClick={() => navigate("/admin/insights/new")}>
            <Plus className="w-4 h-4 mr-2" />
            New Insight
          </Button>
          <Button variant="outline" onClick={() => navigate("/admin/series/new")}>
            <Plus className="w-4 h-4 mr-2" />
            New Series
          </Button>
          <Button variant="outline" onClick={() => navigate("/admin/photos")}>
            <Image className="w-4 h-4 mr-2" />
            Upload Photos
          </Button>
        </div>

        {/* Recent Activity */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
          {recentLoading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-12 bg-muted/50 rounded animate-pulse" />
              ))}
            </div>
          ) : recent && recent.length > 0 ? (
            <div className="border rounded-lg divide-y">
              {recent.map((item) => (
                <Link
                  key={`${item.type}-${item.id}`}
                  to={getItemHref(item)}
                  className="flex items-center gap-4 p-3 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    {item.type === "post" && <FileText className="w-4 h-4 flex-shrink-0" />}
                    {item.type === "insight" && <Lightbulb className="w-4 h-4 flex-shrink-0" />}
                    {item.type === "series" && <BookOpen className="w-4 h-4 flex-shrink-0" />}
                    <span className="truncate">{item.title}</span>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {item.published ? (
                      <Eye className="w-4 h-4 text-green-500" />
                    ) : (
                      <EyeOff className="w-4 h-4 text-muted-foreground" />
                    )}
                    <span className="text-xs text-muted-foreground">
                      {new Date(item.updated_at).toLocaleDateString()}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground border rounded-lg">
              <p>No content yet. Start by creating your first post!</p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

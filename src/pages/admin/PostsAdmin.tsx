/**
 * PostsAdmin - Admin page for managing posts
 */

import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Edit, Trash2, Eye, EyeOff, X } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { DataTable, Column } from "@/components/admin/DataTable";
import { BulkActionsBar } from "@/components/admin/BulkActionsBar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useAdminPosts,
  useDeletePost,
  useTogglePostPublish,
} from "@/hooks/use-admin-posts";
import { useTags } from "@/hooks/use-tags";
import { toast } from "sonner";

interface PostRow {
  id: string;
  title_vi: string;
  slug: string;
  published: boolean;
  featured: boolean;
  level: string | null;
  read_time: number | null;
  updated_at: string;
  goal?: { name_vi: string } | null;
  tags?: Array<{ tag: { id: string; name_vi: string; color?: string } }> | null;
}

export default function PostsAdmin() {
  const navigate = useNavigate();
  const { data: posts, isLoading } = useAdminPosts();
  const deletePost = useDeletePost();
  const togglePublish = useTogglePostPublish();
  const { data: tags = [] } = useTags();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Filter states
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [levelFilter, setLevelFilter] = useState<string>("all");
  const [featuredFilter, setFeaturedFilter] = useState<string>("all");
  const [tagFilter, setTagFilter] = useState<string>("all");

  // Filter data
  const filteredPosts = useMemo(() => {
    if (!posts) return [];

    return posts.filter((post) => {
      // Status filter
      if (statusFilter === "published" && !post.published) return false;
      if (statusFilter === "draft" && post.published) return false;

      // Level filter
      if (levelFilter !== "all" && post.level !== levelFilter) return false;

      // Featured filter
      if (featuredFilter === "featured" && !post.featured) return false;
      if (featuredFilter === "not-featured" && post.featured) return false;

      // Tag filter
      if (tagFilter !== "all") {
        const postTags = post.tags?.map((t: any) => t.tag.id) || [];
        if (!postTags.includes(tagFilter)) return false;
      }

      return true;
    });
  }, [posts, statusFilter, levelFilter, featuredFilter, tagFilter]);

  const handleDelete = async (id: string) => {
    try {
      await deletePost.mutateAsync(id);
      toast.success("Post deleted");
    } catch {
      toast.error("Failed to delete post");
    }
  };

  const handleTogglePublish = async (id: string, currentStatus: boolean) => {
    try {
      await togglePublish.mutateAsync({ id, published: !currentStatus });
      toast.success(currentStatus ? "Post unpublished" : "Post published");
    } catch {
      toast.error("Failed to update post");
    }
  };

  const columns: Column<PostRow>[] = [
    {
      key: "title_vi",
      header: "Title",
      sortable: true,
      render: (post) => (
        <div>
          <p className="font-medium">{post.title_vi}</p>
          <p className="text-sm text-muted-foreground">{post.slug}</p>
        </div>
      ),
    },
    {
      key: "published",
      header: "Status",
      sortable: true,
      render: (post) => (
        <Badge variant={post.published ? "default" : "secondary"}>
          {post.published ? "Published" : "Draft"}
        </Badge>
      ),
    },
    {
      key: "level",
      header: "Level",
      sortable: true,
      render: (post) =>
        post.level ? (
          <Badge variant="outline">{post.level}</Badge>
        ) : (
          <span className="text-muted-foreground">-</span>
        ),
    },
    {
      key: "tags",
      header: "Tags",
      render: (post) => {
        const postTags = post.tags?.map(t => t.tag) || [];
        const visibleTags = postTags.slice(0, 2);
        const remainingCount = postTags.length - 2;

        return (
          <div className="flex flex-wrap gap-1">
            {visibleTags.map(tag => (
              <Badge
                key={tag.id}
                variant="outline"
                className="text-xs px-1.5 py-0"
                style={{
                  backgroundColor: tag.color?.split("|")[0],
                  borderColor: tag.color?.split("|")[1] || tag.color,
                }}
              >
                {tag.name_vi}
              </Badge>
            ))}
            {remainingCount > 0 && (
              <span className="text-xs text-muted-foreground">
                +{remainingCount}
              </span>
            )}
          </div>
        );
      },
    },
    {
      key: "read_time",
      header: "Read",
      sortable: true,
      render: (post) =>
        post.read_time ? (
          <span>{post.read_time} min</span>
        ) : (
          <span className="text-muted-foreground">-</span>
        ),
    },
    {
      key: "updated_at",
      header: "Updated",
      sortable: true,
      render: (post) => (
        <span className="text-muted-foreground">
          {new Date(post.updated_at).toLocaleDateString()}
        </span>
      ),
    },
  ];

  const actions = (post: PostRow) => (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => handleTogglePublish(post.id, post.published)}
        title={post.published ? "Unpublish" : "Publish"}
      >
        {post.published ? (
          <EyeOff className="w-4 h-4" />
        ) : (
          <Eye className="w-4 h-4" />
        )}
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => navigate(`/admin/posts/${post.id}`)}
        title="Edit"
      >
        <Edit className="w-4 h-4" />
      </Button>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="ghost" size="icon" title="Delete">
            <Trash2 className="w-4 h-4 text-destructive" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Post</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{post.title_vi}"? This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => handleDelete(post.id)}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Posts</h1>
            <p className="text-muted-foreground">Manage your blog posts</p>
          </div>
          <Button onClick={() => navigate("/admin/posts/new")}>
            <Plus className="w-4 h-4 mr-2" />
            New Post
          </Button>
        </div>

        {/* Bulk Actions Bar */}
        {selectedIds.size > 0 && (
          <BulkActionsBar
            selectedIds={selectedIds}
            onClear={() => setSelectedIds(new Set())}
          />
        )}

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
            </SelectContent>
          </Select>

          <Select value={levelFilter} onValueChange={setLevelFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value="starter">Starter</SelectItem>
              <SelectItem value="builder">Builder</SelectItem>
              <SelectItem value="advanced">Advanced</SelectItem>
            </SelectContent>
          </Select>

          <Select value={featuredFilter} onValueChange={setFeaturedFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Featured" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Posts</SelectItem>
              <SelectItem value="featured">Featured</SelectItem>
              <SelectItem value="not-featured">Not Featured</SelectItem>
            </SelectContent>
          </Select>

          <Select value={tagFilter} onValueChange={setTagFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Tag" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tags</SelectItem>
              {tags.map((tag) => (
                <SelectItem key={tag.id} value={tag.id}>
                  {tag.name_vi}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {(statusFilter !== "all" || levelFilter !== "all" ||
            featuredFilter !== "all" || tagFilter !== "all") && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setStatusFilter("all");
                setLevelFilter("all");
                setFeaturedFilter("all");
                setTagFilter("all");
              }}
            >
              <X className="w-4 h-4 mr-2" />
              Clear Filters
            </Button>
          )}
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : (
          <DataTable
            selectable
            selectedIds={selectedIds}
            onSelectionChange={setSelectedIds}
            data={(filteredPosts as PostRow[]) || []}
            columns={columns}
            searchKey="title_vi"
            searchPlaceholder="Search posts..."
            onRowClick={(post) => navigate(`/admin/posts/${post.id}`)}
            actions={actions}
            emptyMessage="No posts match your filters."
          />
        )}
      </div>
    </AdminLayout>
  );
}

/**
 * PostsAdmin - Admin page for managing posts
 */

import { useNavigate } from "react-router-dom";
import { Plus, Edit, Trash2, Eye, EyeOff } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { DataTable, Column } from "@/components/admin/DataTable";
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
  useAdminPosts,
  useDeletePost,
  useTogglePostPublish,
} from "@/hooks/use-admin-posts";
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
}

export default function PostsAdmin() {
  const navigate = useNavigate();
  const { data: posts, isLoading } = useAdminPosts();
  const deletePost = useDeletePost();
  const togglePublish = useTogglePostPublish();

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

        {/* Table */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : (
          <DataTable
            data={(posts as PostRow[]) || []}
            columns={columns}
            searchKey="title_vi"
            searchPlaceholder="Search posts..."
            onRowClick={(post) => navigate(`/admin/posts/${post.id}`)}
            actions={actions}
            emptyMessage="No posts yet. Create your first post!"
          />
        )}
      </div>
    </AdminLayout>
  );
}

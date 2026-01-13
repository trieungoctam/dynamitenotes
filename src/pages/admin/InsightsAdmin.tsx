/**
 * InsightsAdmin - Admin page for managing insights
 */

import { useNavigate } from "react-router-dom";
import { Plus, Edit, Trash2, Eye, EyeOff, Pin, PinOff } from "lucide-react";
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
  useAdminInsights,
  useDeleteInsight,
  useToggleInsightPublish,
  useToggleInsightPin,
} from "@/hooks/use-admin-insights";
import { toast } from "sonner";

interface InsightRow {
  id: string;
  content_vi: string;
  tags: string[] | null;
  pinned: boolean;
  published: boolean;
  updated_at: string;
  related_post?: { title_vi: string; slug: string } | null;
}

export default function InsightsAdmin() {
  const navigate = useNavigate();
  const { data: insights, isLoading } = useAdminInsights();
  const deleteInsight = useDeleteInsight();
  const togglePublish = useToggleInsightPublish();
  const togglePin = useToggleInsightPin();

  const handleDelete = async (id: string) => {
    try {
      await deleteInsight.mutateAsync(id);
      toast.success("Insight deleted");
    } catch {
      toast.error("Failed to delete insight");
    }
  };

  const handleTogglePublish = async (id: string, currentStatus: boolean) => {
    try {
      await togglePublish.mutateAsync({ id, published: !currentStatus });
      toast.success(currentStatus ? "Insight unpublished" : "Insight published");
    } catch {
      toast.error("Failed to update insight");
    }
  };

  const handleTogglePin = async (id: string, currentStatus: boolean) => {
    try {
      await togglePin.mutateAsync({ id, pinned: !currentStatus });
      toast.success(currentStatus ? "Insight unpinned" : "Insight pinned");
    } catch {
      toast.error("Failed to update insight");
    }
  };

  const columns: Column<InsightRow>[] = [
    {
      key: "content_vi",
      header: "Content",
      render: (insight) => (
        <div className="max-w-md">
          <p className="line-clamp-2 text-sm">{insight.content_vi}</p>
        </div>
      ),
    },
    {
      key: "tags",
      header: "Tags",
      render: (insight) =>
        insight.tags && insight.tags.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {insight.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {insight.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{insight.tags.length - 3}
              </Badge>
            )}
          </div>
        ) : (
          <span className="text-muted-foreground">-</span>
        ),
    },
    {
      key: "published",
      header: "Status",
      sortable: true,
      render: (insight) => (
        <div className="flex gap-1">
          <Badge variant={insight.published ? "default" : "secondary"}>
            {insight.published ? "Published" : "Draft"}
          </Badge>
          {insight.pinned && (
            <Badge variant="outline">Pinned</Badge>
          )}
        </div>
      ),
    },
    {
      key: "updated_at",
      header: "Updated",
      sortable: true,
      render: (insight) => (
        <span className="text-muted-foreground text-sm">
          {new Date(insight.updated_at).toLocaleDateString()}
        </span>
      ),
    },
  ];

  const actions = (insight: InsightRow) => (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => handleTogglePin(insight.id, insight.pinned)}
        title={insight.pinned ? "Unpin" : "Pin"}
      >
        {insight.pinned ? (
          <PinOff className="w-4 h-4" />
        ) : (
          <Pin className="w-4 h-4" />
        )}
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => handleTogglePublish(insight.id, insight.published)}
        title={insight.published ? "Unpublish" : "Publish"}
      >
        {insight.published ? (
          <EyeOff className="w-4 h-4" />
        ) : (
          <Eye className="w-4 h-4" />
        )}
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => navigate(`/admin/insights/${insight.id}`)}
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
            <AlertDialogTitle>Delete Insight</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this insight? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => handleDelete(insight.id)}>
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
            <h1 className="text-2xl font-bold">Insights</h1>
            <p className="text-muted-foreground">
              Manage your quick insights and thoughts
            </p>
          </div>
          <Button onClick={() => navigate("/admin/insights/new")}>
            <Plus className="w-4 h-4 mr-2" />
            New Insight
          </Button>
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : (
          <DataTable
            data={(insights as InsightRow[]) || []}
            columns={columns}
            searchKey="content_vi"
            searchPlaceholder="Search insights..."
            onRowClick={(insight) => navigate(`/admin/insights/${insight.id}`)}
            actions={actions}
            emptyMessage="No insights yet. Share your first thought!"
          />
        )}
      </div>
    </AdminLayout>
  );
}

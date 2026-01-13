/**
 * SeriesAdmin - Admin page for managing series
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
  useAdminSeries,
  useDeleteSeries,
  useToggleSeriesPublish,
} from "@/hooks/use-admin-series";
import { toast } from "sonner";

interface SeriesRow {
  id: string;
  title_vi: string;
  slug: string;
  published: boolean;
  featured: boolean;
  updated_at: string;
}

export default function SeriesAdmin() {
  const navigate = useNavigate();
  const { data: series, isLoading } = useAdminSeries();
  const deleteSeries = useDeleteSeries();
  const togglePublish = useToggleSeriesPublish();

  const handleDelete = async (id: string) => {
    try {
      await deleteSeries.mutateAsync(id);
      toast.success("Series deleted");
    } catch {
      toast.error("Failed to delete series");
    }
  };

  const handleTogglePublish = async (id: string, currentStatus: boolean) => {
    try {
      await togglePublish.mutateAsync({ id, published: !currentStatus });
      toast.success(currentStatus ? "Series unpublished" : "Series published");
    } catch {
      toast.error("Failed to update series");
    }
  };

  const columns: Column<SeriesRow>[] = [
    {
      key: "title_vi",
      header: "Title",
      sortable: true,
      render: (s) => (
        <div>
          <p className="font-medium">{s.title_vi}</p>
          <p className="text-sm text-muted-foreground">{s.slug}</p>
        </div>
      ),
    },
    {
      key: "published",
      header: "Status",
      sortable: true,
      render: (s) => (
        <div className="flex gap-1">
          <Badge variant={s.published ? "default" : "secondary"}>
            {s.published ? "Published" : "Draft"}
          </Badge>
          {s.featured && <Badge variant="outline">Featured</Badge>}
        </div>
      ),
    },
    {
      key: "updated_at",
      header: "Updated",
      sortable: true,
      render: (s) => (
        <span className="text-muted-foreground">
          {new Date(s.updated_at).toLocaleDateString()}
        </span>
      ),
    },
  ];

  const actions = (s: SeriesRow) => (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => handleTogglePublish(s.id, s.published)}
        title={s.published ? "Unpublish" : "Publish"}
      >
        {s.published ? (
          <EyeOff className="w-4 h-4" />
        ) : (
          <Eye className="w-4 h-4" />
        )}
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => navigate(`/admin/series/${s.id}`)}
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
            <AlertDialogTitle>Delete Series</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{s.title_vi}"? Posts in this
              series will not be deleted, only the series itself.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => handleDelete(s.id)}>
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
            <h1 className="text-2xl font-bold">Series</h1>
            <p className="text-muted-foreground">
              Organize posts into curated collections
            </p>
          </div>
          <Button onClick={() => navigate("/admin/series/new")}>
            <Plus className="w-4 h-4 mr-2" />
            New Series
          </Button>
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : (
          <DataTable
            data={(series as SeriesRow[]) || []}
            columns={columns}
            searchKey="title_vi"
            searchPlaceholder="Search series..."
            onRowClick={(s) => navigate(`/admin/series/${s.id}`)}
            actions={actions}
            emptyMessage="No series yet. Create your first collection!"
          />
        )}
      </div>
    </AdminLayout>
  );
}

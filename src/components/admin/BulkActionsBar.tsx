/**
 * BulkActionsBar - Bulk action buttons for selected items
 */

import { Eye, EyeOff, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { useBulkPublish, useBulkDelete } from "@/hooks/use-bulk-post-actions";

interface BulkActionsBarProps {
  selectedIds: Set<string>;
  onClear: () => void;
}

export function BulkActionsBar({ selectedIds, onClear }: BulkActionsBarProps) {
  const bulkPublish = useBulkPublish();
  const bulkDelete = useBulkDelete();

  const handlePublish = async () => {
    await bulkPublish.mutateAsync({
      postIds: Array.from(selectedIds),
      published: true,
    });
    onClear();
  };

  const handleUnpublish = async () => {
    await bulkPublish.mutateAsync({
      postIds: Array.from(selectedIds),
      published: false,
    });
    onClear();
  };

  const handleDelete = async () => {
    await bulkDelete.mutateAsync(Array.from(selectedIds));
    onClear();
  };

  const selectedCount = selectedIds.size;

  return (
    <div className="flex items-center justify-between bg-muted/50 p-3 rounded-lg">
      <span className="text-sm font-medium">
        {selectedCount} post{selectedCount !== 1 ? "s" : ""} selected
      </span>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handlePublish}
          disabled={bulkPublish.isPending}
        >
          <Eye className="w-4 h-4 mr-2" />
          Publish
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleUnpublish}
          disabled={bulkPublish.isPending}
        >
          <EyeOff className="w-4 h-4 mr-2" />
          Unpublish
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm">
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Posts</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete {selectedCount} post{selectedCount !== 1 ? "s" : ""}? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete}>
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <Button variant="ghost" size="sm" onClick={onClear}>
          Clear
        </Button>
      </div>
    </div>
  );
}

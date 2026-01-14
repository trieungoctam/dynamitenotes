/**
 * RollbackConfirmDialog - Confirmation dialog for post version rollback
 */

import { useEffect } from "react";
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
import type { PostVersion } from "@/types/database";
import { Badge } from "@/components/ui/badge";

interface RollbackConfirmDialogProps {
  version: PostVersion;
  onConfirm: () => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function RollbackConfirmDialog({
  version,
  onConfirm,
  open,
  onOpenChange,
}: RollbackConfirmDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Rollback to Version {version.version}?</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-3">
              <p>
                This will restore the post content from version {version.version}{" "}
                created on {new Date(version.created_at).toLocaleDateString()}.
              </p>
              <div className="bg-muted/50 p-3 rounded-lg space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Title:</span>
                  <span className="text-sm">{version.title_vi}</span>
                </div>
                {version.excerpt_vi && (
                  <div className="flex items-start gap-2">
                    <span className="text-sm font-medium">Excerpt:</span>
                    <span className="text-sm line-clamp-2">{version.excerpt_vi}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Content:</span>
                  <span className="text-sm text-muted-foreground">
                    {version.content_vi.slice(0, 100)}
                    {version.content_vi.length > 100 && "..."}
                  </span>
                </div>
                {version.cover_image && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Cover:</span>
                    <Badge variant="outline" className="text-xs">
                      Has cover image
                    </Badge>
                  </div>
                )}
              </div>
              <p className="text-destructive font-medium">
                A new version will be created with your current content before
                rolling back, so you can undo this action if needed.
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => onOpenChange?.(false)}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              onConfirm();
              onOpenChange?.(false);
            }}
          >
            Rollback to Version {version.version}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

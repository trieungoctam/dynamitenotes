/**
 * VersionHistory - Timeline view of post version history
 */

import { Clock, GitCommit, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { PostVersion } from "@/types/database";
import { getVersionDiffSummary } from "@/hooks/use-post-versions";

interface VersionHistoryProps {
  versions: PostVersion[];
  currentPost: {
    title_vi: string;
    content_vi: string;
    excerpt_vi: string | null;
    cover_image: string | null;
  };
  onRollback: (versionId: string) => void;
  isLoading?: boolean;
}

export function VersionHistory({
  versions,
  currentPost,
  onRollback,
  isLoading = false,
}: VersionHistoryProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
      </div>
    );
  }

  if (versions.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p>No version history yet</p>
        <p className="text-sm">Versions are created when you update this post</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Current version marker */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground pb-2 border-b">
        <Badge variant="default">Current</Badge>
        <span>Latest version</span>
      </div>

      {/* Version timeline */}
      <div className="relative space-y-4">
        {/* Timeline line */}
        <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-border" />

        {versions.map((version, index) => {
          const isFirst = index === 0;
          const isLast = index === versions.length - 1;

          return (
            <div key={version.id} className="relative flex gap-4">
              {/* Timeline dot */}
              <div className="relative z-10 flex-shrink-0">
                <div
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    isFirst
                      ? "bg-primary border-primary"
                      : "bg-background border-border"
                  }`}
                >
                  {isFirst ? (
                    <GitCommit className="w-3 h-3 text-primary-foreground" />
                  ) : (
                    <div className="w-2 h-2 rounded-full bg-muted-foreground" />
                  )}
                </div>
              </div>

              {/* Version content */}
              <div className="flex-1 min-w-0 pb-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Version {version.version}</span>
                      {version.change_reason && (
                        <Badge variant="outline" className="text-xs">
                          {version.change_reason}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm font-medium truncate mt-1">
                      {version.title_vi}
                    </p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(version.created_at).toLocaleString()}
                      </span>
                      <span>
                        {version.content_vi.length} characters
                      </span>
                    </div>
                  </div>

                  {!isFirst && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onRollback(version.id)}
                    >
                      Rollback
                    </Button>
                  )}
                </div>

                {/* Diff summary (if not last) */}
                {!isLast && versions[index + 1] && (
                  <p className="text-xs text-muted-foreground mt-2">
                    {getVersionDiffSummary(version, versions[index + 1])}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

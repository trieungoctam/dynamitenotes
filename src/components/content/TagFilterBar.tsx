import { useState } from "react";
import { Button } from "@/components/ui/button";
import { TagChip } from "./TagChip";

interface TagFilterBarProps {
  availableTags: string[];
  selectedTags: Set<string>;
  onTagToggle: (tag: string) => void;
  onClearAll: () => void;
  maxVisible?: number;
}

export function TagFilterBar({
  availableTags,
  selectedTags,
  onTagToggle,
  onClearAll,
  maxVisible = 8,
}: TagFilterBarProps) {
  const [showAll, setShowAll] = useState(false);

  const visibleTags = showAll ? availableTags : availableTags.slice(0, maxVisible);
  const hasMore = availableTags.length > maxVisible;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-sm text-muted-foreground/80">Filter by:</span>
      {visibleTags.map((tag) => (
        <TagChip
          key={tag}
          tag={tag}
          selected={selectedTags.has(tag)}
          onClick={() => onTagToggle(tag)}
        />
      ))}
      {!showAll && hasMore && (
        <Button
          variant="ghost"
          size="sm"
          className="h-7 text-xs"
          onClick={() => setShowAll(true)}
        >
          +{availableTags.length - maxVisible} more
        </Button>
      )}
      {selectedTags.size > 0 && (
        <Button
          variant="ghost"
          size="sm"
          className="h-7 text-xs"
          onClick={onClearAll}
        >
          Clear filters
        </Button>
      )}
    </div>
  );
}

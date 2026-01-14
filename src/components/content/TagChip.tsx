import { Badge } from "@/components/ui/badge";

interface TagChipProps {
  tag: string;
  selected: boolean;
  onClick: () => void;
  onRemove?: () => void;
  variant?: "filter" | "active";
}

export function TagChip({
  tag,
  selected,
  onClick,
  onRemove,
  variant = "filter",
}: TagChipProps) {
  const baseClasses = "cursor-pointer transition-colors";

  if (variant === "active") {
    return (
      <Badge className={`${baseClasses} bg-primary text-primary-foreground dark:bg-primary/10 dark:text-primary border border-transparent dark:border-primary/30`}>
        {tag}
        {onRemove && (
          <button
            onClick={onRemove}
            className="ml-1 hover:opacity-70"
            aria-label={`Remove ${tag} filter`}
          >
            ×
          </button>
        )}
      </Badge>
    );
  }

  return (
    <Badge
      variant={selected ? "default" : "outline"}
      className={`${baseClasses} ${selected ? "" : "hover:bg-muted"}`}
      onClick={onClick}
    >
      {tag}
    </Badge>
  );
}

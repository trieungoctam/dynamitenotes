/**
 * TagsSelector - Multi-select tag input with inline creation
 */

import { useState } from "react";
import { X, Plus, Tag as TagIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useTags, useCreateTag } from "@/hooks/use-tags";
import { toast } from "sonner";

interface TagsSelectorProps {
  selectedTags: string[]; // tag IDs
  availableTags?: Array<{ id: string; name_vi: string; color?: string }>;
  onChange: (tagIds: string[]) => void;
}

export function TagsSelector({
  selectedTags,
  availableTags,
  onChange,
}: TagsSelectorProps) {
  const { data: tags = [], isLoading } = useTags();
  const createTag = useCreateTag();

  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const allTags = availableTags || tags;
  const selectedTagObjects = allTags.filter(t => selectedTags.includes(t.id));

  const filteredTags = allTags.filter(
    tag =>
      !selectedTags.includes(tag.id) &&
      tag.name_vi.toLowerCase().includes(search.toLowerCase())
  );

  const handleToggleTag = (tagId: string) => {
    const newSelected = selectedTags.includes(tagId)
      ? selectedTags.filter(id => id !== tagId)
      : [...selectedTags, tagId];
    onChange(newSelected);
  };

  const handleCreateTag = async (name: string) => {
    setIsCreating(true);
    try {
      // Generate random pastel color
      const hue = Math.floor(Math.random() * 360);
      const color = `hsl(${hue}, 70%, 85%)`;
      const borderColor = `hsl(${hue}, 70%, 50%)`;

      const newTag = await createTag.mutateAsync({
        name_vi: name,
        color: `${color}|${borderColor}`,
      });

      onChange([...selectedTags, newTag.id]);
      setSearch("");
      toast.success(`Tag "${name}" created`);
    } catch (err) {
      console.error("Failed to create tag:", err);
      toast.error("Failed to create tag");
    } finally {
      setIsCreating(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && search.trim()) {
      e.preventDefault();
      handleCreateTag(search.trim());
    }
  };

  const getTagStyle = (color?: string) => {
    if (!color) return {};

    const [bg, border] = color.split("|");
    return {
      backgroundColor: bg || color,
      borderColor: border || color,
    };
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {selectedTagObjects.map(tag => (
          <Badge
            key={tag.id}
            variant="secondary"
            className="gap-1 px-2 py-1 border"
            style={getTagStyle(tag.color)}
          >
            <TagIcon className="w-3 h-3" />
            {tag.name_vi}
            <button
              type="button"
              onClick={() => handleToggleTag(tag.id)}
              className="hover:bg-black/10 rounded-full p-0.5"
            >
              <X className="w-3 h-3" />
            </button>
          </Badge>
        ))}
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button type="button" variant="outline" size="sm" className="gap-1 h-7">
              <Plus className="w-4 h-4" />
              Add Tag
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-2">
            <div className="space-y-2">
              <Input
                placeholder="Search or create tag..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                onKeyDown={handleKeyDown}
                autoFocus
                disabled={isCreating}
              />
              {filteredTags.length === 0 && search.trim() && (
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full justify-start text-muted-foreground h-8"
                  onClick={() => handleCreateTag(search.trim())}
                  disabled={isCreating}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {isCreating ? "Creating..." : `Create "${search.trim()}"`}
                </Button>
              )}
              <div className="max-h-48 overflow-y-auto space-y-1">
                {filteredTags.map(tag => (
                  <button
                    type="button"
                    key={tag.id}
                    onClick={() => handleToggleTag(tag.id)}
                    className="w-full text-left px-2 py-1.5 hover:bg-muted rounded flex items-center gap-2"
                  >
                    <Badge
                      variant="outline"
                      className="text-xs px-1.5 py-0 border"
                      style={getTagStyle(tag.color)}
                    >
                      {tag.name_vi}
                    </Badge>
                  </button>
                ))}
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}

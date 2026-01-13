/**
 * MarkdownEditor - Simple markdown editor with image upload
 * Lightweight replacement for @uiw/react-md-editor
 */

import { useRef, useState, useCallback } from "react";
import { ImagePlus, Bold, Italic, Link2, List, ListOrdered, Code, Quote, Heading2, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  onImageUpload?: (file: File) => Promise<string>;
  height?: number;
  placeholder?: string;
}

export function MarkdownEditor({
  value,
  onChange,
  onImageUpload,
  height = 500,
  placeholder = "Write your content in Markdown...",
}: MarkdownEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [uploading, setUploading] = useState(false);

  // Insert text at cursor position
  const insertText = useCallback((before: string, after: string = "") => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const newText = value.substring(0, start) + before + selectedText + after + value.substring(end);

    onChange(newText);

    // Restore cursor position after React re-render
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + before.length + selectedText.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  }, [value, onChange]);

  // Wrap selected text with markdown syntax
  const wrapSelection = useCallback((wrapper: string) => {
    insertText(wrapper, wrapper);
  }, [insertText]);

  // Handle image upload
  const handleImageUpload = useCallback(async () => {
    if (!onImageUpload) return;

    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        try {
          setUploading(true);
          const url = await onImageUpload(file);
          insertText(`![${file.name}](${url})`);
        } catch (error) {
          console.error("Failed to upload image:", error);
        } finally {
          setUploading(false);
        }
      }
    };
    input.click();
  }, [onImageUpload, insertText]);

  // Toolbar button component
  const ToolbarButton = ({
    icon: Icon,
    title,
    onClick,
    disabled = false
  }: {
    icon: typeof Bold;
    title: string;
    onClick: () => void;
    disabled?: boolean;
  }) => (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
      title={title}
      onClick={onClick}
      disabled={disabled}
    >
      <Icon className="h-4 w-4" />
    </Button>
  );

  return (
    <div className="border border-border rounded-lg overflow-hidden bg-background">
      {/* Toolbar */}
      <div className="flex items-center gap-1 p-2 border-b border-border bg-muted/30 flex-wrap">
        <ToolbarButton icon={Bold} title="Bold (Ctrl+B)" onClick={() => wrapSelection("**")} />
        <ToolbarButton icon={Italic} title="Italic (Ctrl+I)" onClick={() => wrapSelection("*")} />
        <div className="w-px h-4 bg-border mx-1" />
        <ToolbarButton icon={Heading2} title="Heading" onClick={() => insertText("## ")} />
        <ToolbarButton icon={Link2} title="Link" onClick={() => insertText("[", "](url)")} />
        <ToolbarButton icon={Quote} title="Quote" onClick={() => insertText("> ")} />
        <ToolbarButton icon={Code} title="Code" onClick={() => wrapSelection("`")} />
        <div className="w-px h-4 bg-border mx-1" />
        <ToolbarButton icon={List} title="Bullet List" onClick={() => insertText("- ")} />
        <ToolbarButton icon={ListOrdered} title="Numbered List" onClick={() => insertText("1. ")} />
        <ToolbarButton icon={Minus} title="Horizontal Rule" onClick={() => insertText("\n---\n")} />
        {onImageUpload && (
          <>
            <div className="w-px h-4 bg-border mx-1" />
            <ToolbarButton
              icon={ImagePlus}
              title="Upload Image"
              onClick={handleImageUpload}
              disabled={uploading}
            />
          </>
        )}
      </div>

      {/* Editor */}
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="border-0 rounded-none resize-none focus-visible:ring-0 font-mono text-sm"
        style={{ height: height - 52 }} // Subtract toolbar height
      />
    </div>
  );
}

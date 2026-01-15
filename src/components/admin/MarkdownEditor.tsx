/**
 * MarkdownEditor with Live Preview
 * Split pane layout with sync scrolling
 */

import { useRef, useState, useCallback } from "react";
import {
  ImagePlus, Bold, Italic, Link2, List, ListOrdered,
  Code, Quote, Heading2, Minus, Eye, EyeOff, Maximize2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MarkdownRenderer } from "@/components/content/MarkdownRenderer";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  onImageUpload?: (file: File) => Promise<string>;
  height?: number;
  placeholder?: string;
  showPreview?: boolean;
}

export function MarkdownEditor({
  value,
  onChange,
  onImageUpload,
  height = 500,
  placeholder = "Write your content in Markdown...",
  showPreview = true,
}: MarkdownEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const [uploading, setUploading] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(showPreview);
  const [fullscreenPreview, setFullscreenPreview] = useState(false);

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

  // Sync scroll between editor and preview
  const handleEditorScroll = useCallback((e: React.UIEvent<HTMLTextAreaElement>) => {
    if (!previewRef.current || !previewVisible) return;

    const editor = e.currentTarget;
    const preview = previewRef.current;

    const scrollPercentage = editor.scrollTop / (editor.scrollHeight - editor.clientHeight);
    const previewScrollTop = scrollPercentage * (preview.scrollHeight - preview.clientHeight);

    preview.scrollTop = previewScrollTop;
  }, [previewVisible]);

  // Toolbar button component
  const ToolbarButton = ({
    icon: Icon,
    title,
    onClick,
    disabled = false,
    active = false
  }: {
    icon: typeof Bold;
    title: string;
    onClick: () => void;
    disabled?: boolean;
    active?: boolean;
  }) => (
    <Button
      type="button"
      variant={active ? "default" : "ghost"}
      size="sm"
      className="h-8 w-8 p-0"
      title={title}
      onClick={onClick}
      disabled={disabled}
    >
      <Icon className="h-4 w-4" />
    </Button>
  );

  return (
    <>
      <div className="border border-border rounded-lg overflow-hidden bg-background">
        {/* Toolbar */}
        <div className="flex items-center gap-1 p-2 border-b border-border bg-muted/30 flex-wrap">
          {/* Text formatting */}
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

          {/* Preview toggle - right aligned */}
          <div className="flex-1" />
          {previewVisible && (
            <ToolbarButton
              icon={Maximize2}
              title="Fullscreen Preview"
              onClick={() => setFullscreenPreview(true)}
            />
          )}
          <ToolbarButton
            icon={previewVisible ? Eye : EyeOff}
            title={previewVisible ? "Hide Preview" : "Show Preview"}
            onClick={() => setPreviewVisible(!previewVisible)}
            active={previewVisible}
          />
        </div>

        {/* Editor and Preview */}
        <div className={cn(
          "grid",
          previewVisible ? "md:grid-cols-2" : "grid-cols-1"
        )}>
          {/* Editor */}
          <Textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onScroll={handleEditorScroll}
            placeholder={placeholder}
            className="border-0 rounded-none resize-none focus-visible:ring-0 font-mono text-sm min-h-[500px]"
          />

          {/* Preview */}
          {previewVisible && (
            <div
              ref={previewRef}
              className="border-l border-border p-6 overflow-auto bg-background min-h-[500px]"
            >
              {value ? (
                <MarkdownRenderer content={value} />
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <p>Preview will appear here...</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Fullscreen Preview Dialog */}
      <Dialog open={fullscreenPreview} onOpenChange={setFullscreenPreview}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Preview</DialogTitle>
          </DialogHeader>
          <div className="p-6">
            <MarkdownRenderer content={value} />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

/**
 * MediaUpload - Drag-drop file upload with Supabase Storage integration
 */

import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, X, Image as ImageIcon, FileText, AlertCircle } from "lucide-react";
import { useMediaUpload } from "@/hooks/use-media-upload";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface MediaUploadProps {
  onUpload: (url: string, path: string) => void;
  onRemove: () => void;
  currentUrl?: string;
  currentPath?: string;
  accept?: string;
  maxSize?: number; // bytes
  bucket?: string;
}

export function MediaUpload({
  onUpload,
  onRemove,
  currentUrl,
  currentPath,
  accept = "image/*,application/pdf",
  maxSize = 5 * 1024 * 1024, // 5MB
  bucket,
}: MediaUploadProps) {
  const { upload, remove, progress, uploading, error } = useMediaUpload({ maxSize, bucket });

  const onDrop = useCallback(async (files: File[]) => {
    if (files.length === 0) return;

    const file = files[0];

    try {
      const result = await upload(file, currentPath);
      onUpload(result.url, result.path);
    } catch (err) {
      console.error("Upload failed:", err);
    }
  }, [upload, onUpload, currentPath]);

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    accept: {
      "image/png": [".png"],
      "image/jpeg": [".jpg", ".jpeg"],
      "image/gif": [".gif"],
      "image/webp": [".webp"],
      "application/pdf": [".pdf"],
    },
    maxSize,
    multiple: false,
  });

  const handleRemove = async () => {
    if (currentPath) {
      try {
        await remove(currentPath);
      } catch (err) {
        console.error("Remove failed:", err);
      }
    }
    onRemove();
  };

  // Format file size for display
  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  // Get file rejection error
  const fileError = fileRejections[0]?.errors[0];

  return (
    <div className="space-y-3">
      {/* Error display */}
      {(error || fileError) && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error || fileError?.message}
          </AlertDescription>
        </Alert>
      )}

      {/* Current image preview */}
      {currentUrl ? (
        <div className="relative group">
          {currentUrl.match(/\.(png|jpg|jpeg|gif|webp)$/i) ? (
            <img
              src={currentUrl}
              alt="Preview"
              className="w-full h-48 object-cover rounded-lg border border-border"
            />
          ) : (
            <div className="w-full h-48 border border-border rounded-lg flex items-center justify-center bg-muted/30">
              <div className="text-center">
                <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">File uploaded</p>
              </div>
            </div>
          )}
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition"
            onClick={handleRemove}
            disabled={uploading}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      ) : (
        /* Drop zone */
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition ${
            isDragActive
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/50"
          }`}
        >
          <input {...getInputProps()} />
          {uploading ? (
            <div className="space-y-3">
              <div className="w-16 h-16 mx-auto border-4 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-sm font-medium">Uploading...</p>
              <p className="text-xs text-muted-foreground">{Math.round(progress)}%</p>
            </div>
          ) : (
            <div className="space-y-3">
              <ImageIcon className="w-16 h-16 mx-auto text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">
                  {isDragActive ? "Drop file here" : "Drag & drop or click to upload"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  PNG, JPG, GIF, WebP, PDF (max {formatSize(maxSize)})
                </p>
              </div>
              <Button type="button" variant="outline" size="sm" disabled>
                <Upload className="w-4 h-4 mr-2" />
                Choose File
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * PhotoUploadModal - Modal for uploading multiple photos
 * Supports both Supabase Storage (legacy) and AWS S3 (new) via feature flag
 */

import { useState, useCallback, DragEvent } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { useCreatePhoto } from "@/hooks/use-admin-photos";
import { useS3Upload } from "@/hooks/use-s3-upload";
import { supabase } from "@/lib/supabase";
import type { PhotoInsert } from "@/types/database";

// Feature flag for S3 migration
const USE_S3 = import.meta.env.VITE_USE_S3 === 'true';

interface PhotoUploadModalProps {
  open: boolean;
  onClose: () => void;
  defaultAlbum?: string;
}

interface UploadingFile {
  file: File;
  preview: string;
  status: "pending" | "uploading" | "success" | "error";
  error?: string;
}

export function PhotoUploadModal({ open, onClose, defaultAlbum = "" }: PhotoUploadModalProps) {
  const createPhoto = useCreatePhoto();
  const s3Upload = useS3Upload();
  const [files, setFiles] = useState<UploadingFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleDrop = useCallback((e: DragEvent) => {
    e.preventDefault();
    const newFiles = Array.from(e.dataTransfer.files).filter(
      (f) => f.type.startsWith("image/")
    ).map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      status: "pending" as const,
    }));
    setFiles((prev) => [...prev, ...newFiles]);
  }, []);

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []).filter(
      (f) => f.type.startsWith("image/")
    ).map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      status: "pending" as const,
    }));
    setFiles((prev) => [...prev, ...selectedFiles]);
  };

  const removeFile = (index: number) => {
    setFiles((prev) => {
      const newFiles = [...prev];
      URL.revokeObjectURL(newFiles[index].preview);
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    setUploading(true);
    setProgress(0);

    for (let i = 0; i < files.length; i++) {
      const fileData = files[i];

      try {
        setFiles((prev) => {
          const updated = [...prev];
          updated[i] = { ...fileData, status: "uploading" };
          return updated;
        });

        let publicUrl: string;
        let s3Key: string | null = null;
        let s3Bucket: string | null = null;
        let cdnUrl: string | null = null;
        let fileSize: number | null = null;
        let fileType: string | null = null;
        let width: number | null = null;
        let height: number | null = null;

        if (USE_S3) {
          // S3 upload path
          const result = await s3Upload.upload(fileData.file, {
            bucket: 'photos',
            onProgress: (p) => setProgress(((i + p / 100) / files.length) * 100)
          });

          publicUrl = result.cdnUrl;
          s3Key = result.s3Key;
          s3Bucket = 'dynamite-notes-images';
          cdnUrl = result.cdnUrl;
          fileSize = result.metadata.fileSize;
          fileType = result.metadata.fileType;
          width = result.metadata.width;
          height = result.metadata.height;
        } else {
          // Legacy Supabase Storage path
          const fileExt = fileData.file.name.split(".").pop();
          const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
          const filePath = fileName;

          const { error: uploadError } = await supabase.storage
            .from("photos")
            .upload(filePath, fileData.file);

          if (uploadError) throw uploadError;

          // Get public URL
          const { data: { publicUrl: url } } = supabase.storage
            .from("photos")
            .getPublicUrl(filePath);

          publicUrl = url;
        }

        // Create photo record
        const photoData: PhotoInsert = {
          url: publicUrl,
          s3_key: s3Key,
          s3_bucket: s3Bucket,
          cdn_url: cdnUrl,
          file_size: fileSize,
          file_type: fileType,
          width: width,
          height: height,
          caption_vi: fileData.file.name,
          caption_en: null,
          album: defaultAlbum || null,
          published: false,
          sort_order: 0,
        };

        await createPhoto.mutateAsync(photoData);

        setFiles((prev) => {
          const updated = [...prev];
          updated[i] = { ...fileData, status: "success" };
          return updated;
        });

      } catch (error) {
        console.error("Upload failed:", error);
        setFiles((prev) => {
          const updated = [...prev];
          updated[i] = {
            ...fileData,
            status: "error",
            error: error instanceof Error ? error.message : "Upload failed"
          };
          return updated;
        });
      }

      setProgress(((i + 1) / files.length) * 100);
    }

    setUploading(false);

    // Close modal after short delay if all successful
    const allSuccess = files.every((f) => f.status === "success");
    if (allSuccess) {
      setTimeout(() => {
        setFiles([]);
        onClose();
      }, 1000);
    }
  };

  const handleClose = () => {
    if (!uploading) {
      // Clean up previews
      files.forEach((f) => URL.revokeObjectURL(f.preview));
      setFiles([]);
      setProgress(0);
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Upload Photos</DialogTitle>
        </DialogHeader>

        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className="border-2 border-dashed rounded-lg p-12 text-center transition-colors hover:border-primary/50"
        >
          <Upload className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <p className="text-lg mb-2">Drag and drop photos here</p>
          <p className="text-sm text-muted-foreground mb-4">
            or click to select files
          </p>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            id="photo-upload"
            disabled={uploading}
          />
          <label htmlFor="photo-upload">
            <Button type="button" variant="outline" disabled={uploading} asChild>
              <span>Select Files</span>
            </Button>
          </label>
        </div>

        {/* File Preview */}
        {files.length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-semibold mb-3">
              {files.length} {files.length === 1 ? "file" : "files"} selected
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {files.map((fileData, i) => (
                <div key={i} className="relative group">
                  <img
                    src={fileData.preview}
                    alt={fileData.file.name}
                    className="w-full aspect-square object-cover rounded-lg border"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                    {fileData.status === "pending" && (
                      <span className="text-white text-sm">Ready to upload</span>
                    )}
                    {fileData.status === "uploading" && (
                      <span className="text-white text-sm">Uploading...</span>
                    )}
                    {fileData.status === "success" && (
                      <span className="text-green-400 text-sm flex items-center gap-1">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Uploaded
                      </span>
                    )}
                    {fileData.status === "error" && (
                      <span className="text-red-400 text-sm text-center px-2">
                        {fileData.error || "Failed"}
                      </span>
                    )}
                  </div>
                  {!uploading && (
                    <Button
                      type="button"
                      onClick={() => removeFile(i)}
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2 h-8 w-8 p-0"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Progress Bar */}
        {uploading && (
          <div className="mt-6">
            <Progress value={progress} className="h-2" />
            <p className="text-sm text-center text-muted-foreground mt-2">
              Uploading... {Math.round(progress)}%
            </p>
          </div>
        )}

        <DialogFooter>
          <Button type="button" variant="ghost" onClick={handleClose} disabled={uploading}>
            Cancel
          </Button>
          <Button onClick={handleUpload} disabled={uploading || files.length === 0}>
            {uploading ? "Uploading..." : `Upload ${files.length} ${files.length === 1 ? "Photo" : "Photos"}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

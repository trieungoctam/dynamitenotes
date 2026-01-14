# Phase 02: Media Upload Infrastructure

**Effort**: 2h

## Overview

Implement Supabase Storage integration with client-side compression for image uploads.

## Tasks

### 1. Create Media Upload Hook

**File**: `src/hooks/use-media-upload.ts`

```typescript
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import imageCompression from "browser-image-compression";

interface UploadOptions {
  bucket?: string;
  maxSize?: number; // bytes
  maxWidth?: number; // px
  quality?: number; // 0-1
}

export function useMediaUpload(options: UploadOptions = {}) {
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const bucket = options.bucket || "post-media";
  const maxSize = options.maxSize || 5 * 1024 * 1024; // 5MB

  const upload = async (file: File, path: string) => {
    setUploading(true);
    setError(null);
    setProgress(0);

    try {
      // Validate size
      if (file.size > maxSize) {
        throw new Error(`File too large. Max ${maxSize / 1024 / 1024}MB`);
      }

      let fileToUpload = file;

      // Compress if image
      if (file.type.startsWith("image/")) {
        fileToUpload = await imageCompression(file, {
          maxSizeMB: 1,
          maxWidthOrHeight: 1920,
          useWebWorker: true,
          quality: options.quality || 0.8,
        });
      }

      // Upload to Supabase
      const { data, error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(path, fileToUpload, {
          cacheControl: "3600",
          upsert: true,
          onUploadProgress: (progress) => {
            const percent = (progress.loaded / progress.total) * 100;
            setProgress(percent);
          },
        });

      if (uploadError) throw uploadError;

      // Generate signed URL (private bucket)
      const { data: { signedUrl } } = await supabase.storage
        .from(bucket)
        .createSignedUrl(path, 60 * 60 * 24 * 365); // 1 year

      return { url: signedUrl!, path: data.path };
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
      throw err;
    } finally {
      setUploading(false);
    }
  };

  const remove = async (path: string) => {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path]);

    if (error) throw error;
  };

  return { upload, remove, progress, uploading, error };
}
```

### 2. Create Media Upload Component

**File**: `src/components/admin/MediaUpload.tsx`

```typescript
import { useCallback } from "react";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { useMediaUpload } from "@/hooks/use-media-upload";

interface MediaUploadProps {
  onUpload: (url: string, path: string) => void;
  onRemove: () => void;
  currentUrl?: string;
  accept?: string;
  maxSize?: number;
}

export function MediaUpload({
  onUpload,
  onRemove,
  currentUrl,
  accept = "image/*,application/pdf",
  maxSize = 5 * 1024 * 1024,
}: MediaUploadProps) {
  const { upload, remove, progress, uploading } = useMediaUpload({ maxSize });

  const onDrop = useCallback(async (files: File[]) => {
    if (files.length === 0) return;

    const file = files[0];
    const path = `${Date.now()}-${file.name}`;

    try {
      const result = await upload(file, path);
      onUpload(result.url, result.path);
    } catch (err) {
      console.error("Upload failed:", err);
    }
  }, [upload, onUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp"],
      "application/pdf": [".pdf"],
    },
    maxSize,
    multiple: false,
  });

  const handleRemove = async () => {
    if (currentUrl) {
      // Extract path from URL (signed URLs have format: .../storage/v1/.../path)
      const pathMatch = currentUrl.match(/\/([^/]+)$/);
      if (pathMatch) {
        await remove(pathMatch[1]);
      }
    }
    onRemove();
  };

  return (
    <div className="space-y-2">
      {currentUrl ? (
        <div className="relative group">
          <img
            src={currentUrl}
            alt="Preview"
            className="w-full h-48 object-cover rounded-lg"
          />
          <button
            onClick={handleRemove}
            className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-md opacity-0 group-hover:opacity-100 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition ${
            isDragActive
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/25 hover:border-primary/50"
          }`}
        >
          <input {...getInputProps()} />
          {uploading ? (
            <div className="space-y-2">
              <div className="w-12 h-12 mx-auto border-4 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-muted-foreground">
                Uploading... {Math.round(progress)}%
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <ImageIcon className="w-12 h-12 mx-auto text-muted-foreground" />
              <p className="text-sm font-medium">
                {isDragActive ? "Drop file here" : "Drag & drop or click to upload"}
              </p>
              <p className="text-xs text-muted-foreground">
                PNG, JPG, GIF, WebP, PDF (max {maxSize / 1024 / 1024}MB)
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
```

### 3. Install Dependencies

```bash
bun add browser-image-compression react-dropzone
bun add -D @types/browser-image-compression
```

### 4. Integrate into Post Edit Form

**File**: Post edit form (if exists, create otherwise)

Add cover image field using MediaUpload component.

## Acceptance Criteria

- [ ] Hook handles compression for images
- [ ] Component shows drag-drop zone
- [ ] Upload progress displayed
- [ ] Preview shown after upload
- [ ] Delete functionality works
- [ ] File size validation (5MB max)
- [ ] Error handling for failed uploads

## Files

- `src/hooks/use-media-upload.ts` (create)
- `src/components/admin/MediaUpload.tsx` (create)
- Post edit form (modify)

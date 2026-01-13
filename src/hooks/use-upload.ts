/**
 * useUpload - Image upload hook with compression
 * Compresses images before uploading to Supabase Storage
 */

import { useState } from "react";
import imageCompression from "browser-image-compression";
import { supabase } from "@/lib/supabase";

type Bucket = "post-images" | "photos";

interface UploadOptions {
  maxSizeMB?: number;
  maxWidthOrHeight?: number;
  path?: string;
}

interface UseUploadReturn {
  upload: (file: File, options?: UploadOptions) => Promise<string>;
  uploading: boolean;
  progress: number;
  error: string | null;
}

export function useUpload(bucket: Bucket): UseUploadReturn {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const upload = async (file: File, options?: UploadOptions): Promise<string> => {
    setUploading(true);
    setProgress(0);
    setError(null);

    try {
      // Compress image
      setProgress(10);
      const compressed = await imageCompression(file, {
        maxSizeMB: options?.maxSizeMB ?? 0.8, // 800KB max as per plan
        maxWidthOrHeight: options?.maxWidthOrHeight ?? 1920,
        useWebWorker: true,
        onProgress: (p) => setProgress(10 + p * 0.4), // 10-50%
      });

      // Generate unique filename
      setProgress(50);
      const ext = file.name.split(".").pop() || "jpg";
      const filename = options?.path || `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

      // Upload to Supabase Storage
      setProgress(60);
      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filename, compressed, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) throw uploadError;

      setProgress(90);

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(filename);

      setProgress(100);
      return urlData.publicUrl;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Upload failed";
      setError(message);
      throw err;
    } finally {
      setUploading(false);
    }
  };

  return { upload, uploading, progress, error };
}

/**
 * useDeleteFile - Delete file from Supabase Storage
 */
export function useDeleteFile(bucket: Bucket) {
  const [deleting, setDeleting] = useState(false);

  const deleteFile = async (path: string): Promise<void> => {
    setDeleting(true);
    try {
      const { error } = await supabase.storage.from(bucket).remove([path]);
      if (error) throw error;
    } finally {
      setDeleting(false);
    }
  };

  return { deleteFile, deleting };
}

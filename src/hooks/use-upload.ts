/**
 * useUpload - Image upload hook with compression
 * Compresses images before uploading to Supabase Storage
 *
 * S3 Migration: Feature flag controlled via VITE_USE_S3 env var
 * - false: Legacy Supabase Storage (current)
 * - true: AWS S3 + CloudFront CDN (new)
 */

import { useState } from "react";
import imageCompression from "browser-image-compression";
import { supabase } from "@/lib/supabase";
import { useS3Upload } from "./use-s3-upload";

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

// Feature flag for S3 migration
const USE_S3 = import.meta.env.VITE_USE_S3 === 'true';

export function useUpload(bucket: Bucket): UseUploadReturn {
  // Use S3 hook if enabled
  const s3Upload = useS3Upload();
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const upload = async (file: File, options?: UploadOptions): Promise<string> => {
    setUploading(true);
    setProgress(0);
    setError(null);

    try {
      if (USE_S3) {
        // S3 upload path
        const result = await s3Upload.upload(file, {
          bucket: bucket as 'photos' | 'posts',
          onProgress: setProgress
        });

        return result.cdnUrl;
      } else {
        // Legacy Supabase Storage path
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
      }
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
 * useDeleteFile - Delete file from Supabase Storage or S3
 */
export function useDeleteFile(bucket: Bucket) {
  const [deleting, setDeleting] = useState(false);

  const deleteFile = async (path: string): Promise<void> => {
    setDeleting(true);
    try {
      if (USE_S3) {
        // Delete from S3 via Edge Function
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) {
          throw new Error('Not authenticated');
        }

        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/delete-s3-object`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${session.access_token}`
            },
            body: JSON.stringify({ s3Key: path })
          }
        );

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Failed to delete from S3');
        }
      } else {
        // Legacy Supabase Storage delete
        const { error } = await supabase.storage.from(bucket).remove([path]);
        if (error) throw error;
      }
    } finally {
      setDeleting(false);
    }
  };

  return { deleteFile, deleting };
}

/**
 * Media Upload Hook
 * Handles file upload to Supabase Storage (legacy) or AWS S3 (new) via feature flag
 */

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import imageCompression from "browser-image-compression";
import { useS3Upload } from "./use-s3-upload";

// Feature flag for S3 migration
const USE_S3 = import.meta.env.VITE_USE_S3 === 'true';

interface UploadOptions {
  bucket?: string;
  maxSize?: number; // bytes (default: 5MB)
  maxWidth?: number; // px for compression (default: 1920)
  quality?: number; // 0-1 for compression (default: 0.8)
}

interface UploadResult {
  url: string;
  path: string;
}

export function useMediaUpload(options: UploadOptions = {}) {
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const s3Upload = useS3Upload();

  const bucket = options.bucket || "post-media";
  const maxSize = options.maxSize || 5 * 1024 * 1024; // 5MB

  const upload = async (file: File, path?: string): Promise<UploadResult> => {
    setUploading(true);
    setError(null);
    setProgress(0);

    try {
      // Validate size
      if (file.size > maxSize) {
        throw new Error(`File too large. Max ${maxSize / 1024 / 1024}MB`);
      }

      if (USE_S3) {
        // S3 upload path
        const result = await s3Upload.upload(file, {
          bucket: bucket as 'photos' | 'posts',
          onProgress: setProgress
        });

        return {
          url: result.cdnUrl,
          path: result.s3Key
        };
      } else {
        // Legacy Supabase Storage path
        let fileToUpload = file;

        // Compress if image
        if (file.type.startsWith("image/")) {
          fileToUpload = await imageCompression(file, {
            maxSizeMB: 1,
            maxWidthOrHeight: options.maxWidth || 1920,
            useWebWorker: true,
            quality: options.quality || 0.8,
          });
        }

        // Generate path if not provided
        const uploadPath = path || `${Date.now()}-${fileToUpload.name}`;

        // Upload to Supabase
        const { data, error: uploadError } = await supabase.storage
          .from(bucket)
          .upload(uploadPath, fileToUpload, {
            cacheControl: "3600",
            upsert: true,
            onUploadProgress: (progressEvent) => {
              const percent = progressEvent.total
                ? (progressEvent.loaded / progressEvent.total) * 100
                : 0;
              setProgress(percent);
            },
          });

        if (uploadError) throw uploadError;

        // Generate signed URL (private bucket)
        const { data: signedData } = await supabase.storage
          .from(bucket)
          .createSignedUrl(uploadPath, 60 * 60 * 24 * 365); // 1 year

        if (!signedData?.signedUrl) {
          throw new Error("Failed to generate signed URL");
        }

        return { url: signedData.signedUrl, path: data.path };
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Upload failed";
      setError(message);
      throw err;
    } finally {
      setUploading(false);
    }
  };

  const remove = async (path: string): Promise<void> => {
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
      const { error } = await supabase.storage
        .from(bucket)
        .remove([path]);

      if (error) throw error;
    }
  };

  return { upload, remove, progress, uploading, error };
}

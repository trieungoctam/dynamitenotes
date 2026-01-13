/**
 * Admin Photos Hooks - CRUD mutations for photos
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Database } from "@/types/database";

type Photo = Database["public"]["Tables"]["photos"]["Row"];
type PhotoInsert = Database["public"]["Tables"]["photos"]["Insert"];
type PhotoUpdate = Database["public"]["Tables"]["photos"]["Update"];

/**
 * Fetch all photos for admin, optionally filtered by album
 */
export function useAdminPhotos(album?: string) {
  return useQuery({
    queryKey: ["admin", "photos", album],
    queryFn: async () => {
      let query = supabase
        .from("photos")
        .select("*")
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false });

      if (album) {
        query = query.eq("album", album);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Photo[];
    },
  });
}

/**
 * Create new photo
 */
export function useCreatePhoto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (photo: PhotoInsert) => {
      const { data, error } = await supabase
        .from("photos")
        .insert(photo)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "photos"] });
      queryClient.invalidateQueries({ queryKey: ["photos"] });
    },
  });
}

/**
 * Update existing photo (caption, album, sort_order)
 */
export function useUpdatePhoto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...photo }: PhotoUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from("photos")
        .update(photo)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "photos"] });
      queryClient.invalidateQueries({ queryKey: ["photos"] });
    },
  });
}

/**
 * Delete photo
 */
export function useDeletePhoto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      // Get photo URL first to delete from storage
      const { data: photo } = await supabase
        .from("photos")
        .select("url")
        .eq("id", id)
        .single();

      // Delete from database
      const { error } = await supabase.from("photos").delete().eq("id", id);
      if (error) throw error;

      // Optionally delete from storage (extract path from URL)
      if (photo?.url) {
        const url = new URL(photo.url);
        const pathMatch = url.pathname.match(/\/storage\/v1\/object\/public\/photos\/(.+)/);
        if (pathMatch) {
          await supabase.storage.from("photos").remove([pathMatch[1]]);
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "photos"] });
      queryClient.invalidateQueries({ queryKey: ["photos"] });
    },
  });
}

/**
 * Batch update photo order
 */
export function useUpdatePhotoOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (photos: { id: string; sort_order: number }[]) => {
      const updates = photos.map(({ id, sort_order }) =>
        supabase.from("photos").update({ sort_order }).eq("id", id)
      );
      await Promise.all(updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "photos"] });
      queryClient.invalidateQueries({ queryKey: ["photos"] });
    },
  });
}

/**
 * Get albums with photo counts
 */
export function useAlbums() {
  return useQuery({
    queryKey: ["albums"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("photos")
        .select("album");

      if (error) throw error;

      // Count photos per album
      const albumCounts: Record<string, number> = {};
      data?.forEach((photo) => {
        albumCounts[photo.album] = (albumCounts[photo.album] || 0) + 1;
      });

      return Object.entries(albumCounts).map(([name, count]) => ({
        name,
        count,
      }));
    },
  });
}

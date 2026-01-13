/**
 * Public Photos Hooks
 * Fetch photos and albums for the public photos page.
 */

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

type Photo = {
  id: string;
  url: string;
  thumbnail_url: string | null;
  caption_vi: string | null;
  caption_en: string | null;
  album: string | null;
  sort_order: number;
};

/**
 * Fetch published photos, optionally filtered by album
 */
export function usePhotos(album?: string) {
  return useQuery({
    queryKey: ["photos", album],
    queryFn: async () => {
      let query = supabase
        .from("photos")
        .select("*")
        .eq("published", true)
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
 * Fetch all unique albums with photo counts
 */
export function useAlbumList() {
  return useQuery({
    queryKey: ["albums"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("photos")
        .select("album")
        .eq("published", true)
        .not("album", "is", null);

      if (error) throw error;

      // Count photos per album
      const albumCounts: Record<string, number> = {};
      data?.forEach((photo) => {
        if (photo.album) {
          albumCounts[photo.album] = (albumCounts[photo.album] || 0) + 1;
        }
      });

      // Sort alphabetically and return with counts
      return Object.entries(albumCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => a.name.localeCompare(b.name));
    },
  });
}

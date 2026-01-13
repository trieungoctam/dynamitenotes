/**
 * Photos Page
 * Photo gallery with masonry layout and lightbox viewer.
 * Enhanced with Dark Mode (OLED) styling.
 */

import { useState } from "react";
import { useParams } from "react-router-dom";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import { usePhotos, useAlbumList } from "@/hooks/use-photos";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Camera, Sparkles } from "lucide-react";

// Loading skeleton
function PhotoSkeleton() {
  return (
    <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="break-inside-avoid">
          <Skeleton className="w-full aspect-square rounded-2xl border border-border/30" />
        </div>
      ))}
    </div>
  );
}

// Empty state
function EmptyState({ message }: { message: string }) {
  return (
    <div className="text-center py-20">
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-muted/20 border border-border/30 mb-6">
        <Camera className="w-10 h-10 text-muted-foreground" />
      </div>
      <h3 className="text-xl font-semibold mb-2">No photos yet</h3>
      <p className="text-muted-foreground">{message}</p>
    </div>
  );
}

export default function Photos() {
  const { album: albumParam } = useParams();
  const [selectedAlbum, setSelectedAlbum] = useState<string | undefined>(
    albumParam
  );
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const { data: photos, isLoading } = usePhotos(selectedAlbum);
  const { data: albums } = useAlbumList();
  const { lang } = useLanguage();

  // Prepare slides for lightbox
  const slides = photos?.map((photo) => ({
    src: photo.url,
    alt: lang === "en" && photo.caption_en
      ? photo.caption_en
      : photo.caption_vi || "",
  }));

  // Open lightbox at specific index
  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  // Album filter text
  const title = lang === "vi" ? "Ảnh" : "Photos";
  const subtitle =
    lang === "vi"
      ? "Khoảnh khắc từ hành trình"
      : "Moments from the journey";
  const emptyMessage =
    lang === "vi"
      ? "Chưa có ảnh nào. Hãy quay lại sau!"
      : "No photos yet. Check back soon!";
  const allText = lang === "vi" ? "Tất cả" : "All";

  return (
    <main className="min-h-screen">
      {/* Header with gradient background */}
      <section className="relative overflow-hidden border-b border-border/30">
        <div className="absolute inset-0 bg-gradient-to-b from-pink-500/5 via-transparent to-transparent" />
        <div className="container px-4 md:px-6 lg:px-8 py-12 md:py-16">
          <div className="relative">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-xl bg-pink-500/10 border border-pink-500/20">
                <Camera className="w-5 h-5 text-pink-400" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold">{title}</h1>
            </div>
            <p className="text-lg text-muted-foreground ml-14">{subtitle}</p>
          </div>
        </div>
      </section>

      {/* Album Filter */}
      {albums && albums.length > 0 && (
        <section className="border-b border-border/30">
          <div className="container px-4 md:px-6 lg:px-8 py-6">
            <div className="flex flex-wrap gap-3">
              <Button
                variant={!selectedAlbum ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedAlbum(undefined)}
                className={!selectedAlbum ? "bg-pink-600 hover:bg-pink-700 text-white" : "border-border/30 hover:border-border/50"}
              >
                {allText}
              </Button>
              {albums.map((album) => (
                <Button
                  key={album.name}
                  variant={selectedAlbum === album.name ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedAlbum(album.name)}
                  className={selectedAlbum === album.name ? "bg-pink-600 hover:bg-pink-700 text-white" : "border-border/30 hover:border-border/50"}
                >
                  {album.name} <span className="ml-1 text-muted-foreground">({album.count})</span>
                </Button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Photos */}
      {isLoading ? (
        <section className="container px-4 md:px-6 lg:px-8 py-8">
          <PhotoSkeleton />
        </section>
      ) : photos && photos.length > 0 ? (
        <section className="container px-4 md:px-6 lg:px-8 py-8 md:py-12">
          {/* Masonry Grid */}
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
            {photos.map((photo, index) => (
              <div
                key={photo.id}
                className="break-inside-avoid cursor-pointer group"
                onClick={() => openLightbox(index)}
              >
                <div className="relative overflow-hidden rounded-2xl bg-muted/30 border border-border/30 group-hover:border-pink-500/30 transition-all duration-300">
                  <img
                    src={photo.thumbnail_url || photo.url}
                    alt={
                      lang === "en" && photo.caption_en
                        ? photo.caption_en
                        : photo.caption_vi || ""
                    }
                    className="w-full transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 pointer-events-none" />
                  {/* Icon on hover */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="p-3 rounded-full bg-white/10 backdrop-blur-sm">
                      <Camera className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </div>
                {/* Caption */}
                {(photo.caption_vi || photo.caption_en) && (
                  <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                    {lang === "en" && photo.caption_en
                      ? photo.caption_en
                      : photo.caption_vi}
                  </p>
                )}
                {/* Album tag */}
                {photo.album && (
                  <span className="inline-block mt-2 text-xs px-3 py-1 rounded-full bg-pink-500/10 text-pink-400 border border-pink-500/20">
                    {photo.album}
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Lightbox */}
          <Lightbox
            open={lightboxOpen}
            close={() => setLightboxOpen(false)}
            index={lightboxIndex}
            slides={slides}
            carousel={{
              finite: true,
              preload: 2,
            }}
          />
        </section>
      ) : (
        <section className="container px-4 md:px-6 lg:px-8 py-16">
          <EmptyState message={emptyMessage} />
        </section>
      )}
    </main>
  );
}

/**
 * PhotoEditModal - Modal for editing photo metadata
 */

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useUpdatePhoto } from "@/hooks/use-admin-photos";
import type { Photo } from "@/hooks/use-admin-photos";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface PhotoEditModalProps {
  photo: Photo | null;
  open: boolean;
  onClose: () => void;
}

export function PhotoEditModal({ photo, open, onClose }: PhotoEditModalProps) {
  const updatePhoto = useUpdatePhoto();

  const [captionVi, setCaptionVi] = useState("");
  const [captionEn, setCaptionEn] = useState("");
  const [album, setAlbum] = useState("");
  const [published, setPublished] = useState(false);

  useEffect(() => {
    if (photo) {
      setCaptionVi(photo.caption_vi || "");
      setCaptionEn(photo.caption_en || "");
      setAlbum(photo.album || "");
      setPublished(photo.published || false);
    }
  }, [photo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!photo) return;

    try {
      await updatePhoto.mutateAsync({
        id: photo.id,
        caption_vi: captionVi || null,
        caption_en: captionEn || null,
        album: album || null,
        published,
      });
      toast.success("Photo updated successfully");
      onClose();
    } catch (error) {
      console.error("Failed to update photo:", error);
      toast.error("Failed to update photo");
    }
  };

  if (!photo) return null;

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Photo</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Preview */}
          <div>
            <Label>Preview</Label>
            <img
              src={photo.thumbnail_url || photo.url}
              alt=""
              className="w-full max-w-sm aspect-video object-cover rounded-lg border mt-2"
            />
          </div>

          {/* Caption Vietnamese */}
          <div>
            <Label htmlFor="caption-vi">Caption (Vietnamese)</Label>
            <Textarea
              id="caption-vi"
              value={captionVi}
              onChange={(e) => setCaptionVi(e.target.value)}
              placeholder="Enter caption in Vietnamese..."
              rows={3}
            />
          </div>

          {/* Caption English */}
          <div>
            <Label htmlFor="caption-en">Caption (English)</Label>
            <Textarea
              id="caption-en"
              value={captionEn}
              onChange={(e) => setCaptionEn(e.target.value)}
              placeholder="Enter caption in English..."
              rows={3}
            />
          </div>

          {/* Album */}
          <div>
            <Label htmlFor="album">Album</Label>
            <Input
              id="album"
              value={album}
              onChange={(e) => setAlbum(e.target.value)}
              placeholder="Enter album name (or leave empty)"
            />
          </div>

          {/* Published */}
          <div className="flex items-center justify-between">
            <Label htmlFor="published">Published</Label>
            <Switch
              id="published"
              checked={published}
              onCheckedChange={setPublished}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={updatePhoto.isPending}>
              {updatePhoto.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

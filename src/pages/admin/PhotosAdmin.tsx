/**
 * PhotosAdmin - Admin page for managing photos
 * Supports multi-file upload, album management, and reordering
 */

import { useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { Plus, Trash2, Upload, X, Image as ImageIcon } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useUpload } from "@/hooks/use-upload";
import { useAdminPhotos, useCreatePhoto, useDeletePhoto, useUpdatePhoto } from "@/hooks/use-admin-photos";
import { toast } from "sonner";

const DEFAULT_ALBUMS = ["travel", "life", "work", "misc"];

export default function PhotosAdmin() {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedAlbum = searchParams.get("album") || "";

  const { data: photos, isLoading } = useAdminPhotos(selectedAlbum);
  const createPhoto = useCreatePhoto();
  const deletePhoto = useDeletePhoto();
  const updatePhoto = useUpdatePhoto();
  const { upload, uploading, progress } = useUpload("photos");

  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadAlbum, setUploadAlbum] = useState(selectedAlbum || "misc");
  const [uploadingIndex, setUploadingIndex] = useState(-1);

  const [editingPhoto, setEditingPhoto] = useState<{
    id: string;
    caption_vi: string;
    caption_en: string;
  } | null>(null);

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles((prev) => [...prev, ...files]);
  };

  // Remove file from selection
  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // Upload all selected files
  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    for (let i = 0; i < selectedFiles.length; i++) {
      setUploadingIndex(i);
      try {
        const file = selectedFiles[i];
        const url = await upload(file, {
          path: `${uploadAlbum}/${Date.now()}-${file.name}`,
        });
        await createPhoto.mutateAsync({
          album: uploadAlbum,
          url,
          caption_vi: "",
          caption_en: "",
        });
      } catch (error) {
        console.error("Failed to upload:", error);
        toast.error(`Failed to upload ${selectedFiles[i].name}`);
      }
    }

    setUploadingIndex(-1);
    setSelectedFiles([]);
    setUploadDialogOpen(false);
    toast.success(`Uploaded ${selectedFiles.length} photos`);
  };

  // Delete photo
  const handleDelete = async (id: string) => {
    try {
      await deletePhoto.mutateAsync(id);
      toast.success("Photo deleted");
    } catch {
      toast.error("Failed to delete photo");
    }
  };

  // Save caption edit
  const handleSaveCaption = async () => {
    if (!editingPhoto) return;

    try {
      await updatePhoto.mutateAsync({
        id: editingPhoto.id,
        caption_vi: editingPhoto.caption_vi,
        caption_en: editingPhoto.caption_en,
      });
      toast.success("Caption updated");
      setEditingPhoto(null);
    } catch {
      toast.error("Failed to update caption");
    }
  };

  // Get unique albums from photos
  const albums = Array.from(
    new Set([...DEFAULT_ALBUMS, ...(photos?.map((p) => p.album) || [])])
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Photos</h1>
            <p className="text-muted-foreground">
              Manage your photo gallery
            </p>
          </div>
          <Button onClick={() => setUploadDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Upload Photos
          </Button>
        </div>

        {/* Album Filter */}
        <div className="flex items-center gap-4">
          <Label>Album:</Label>
          <Select
            value={selectedAlbum}
            onValueChange={(v) => {
              if (v) {
                setSearchParams({ album: v });
              } else {
                setSearchParams({});
              }
            }}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="All albums" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All albums</SelectItem>
              {albums.map((album) => (
                <SelectItem key={album} value={album}>
                  {album.charAt(0).toUpperCase() + album.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Photos Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : photos && photos.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {photos.map((photo) => (
              <div
                key={photo.id}
                className="group relative aspect-square rounded-lg overflow-hidden border bg-muted"
              >
                <img
                  src={photo.url}
                  alt={photo.caption_vi || "Photo"}
                  className="w-full h-full object-cover"
                />
                {/* Overlay */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button
                    variant="secondary"
                    size="icon"
                    onClick={() =>
                      setEditingPhoto({
                        id: photo.id,
                        caption_vi: photo.caption_vi || "",
                        caption_en: photo.caption_en || "",
                      })
                    }
                  >
                    <ImageIcon className="w-4 h-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="icon">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Photo</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this photo? This action
                          cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(photo.id)}>
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
                {/* Album badge */}
                <div className="absolute bottom-2 left-2">
                  <span className="text-xs bg-black/70 text-white px-2 py-1 rounded">
                    {photo.album}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <ImageIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No photos yet.</p>
            <p className="text-sm">Upload some photos to get started.</p>
          </div>
        )}

        {/* Upload Dialog */}
        <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Upload Photos</DialogTitle>
              <DialogDescription>
                Select photos to upload to your gallery.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* Album selection */}
              <div className="space-y-2">
                <Label>Album</Label>
                <Select value={uploadAlbum} onValueChange={setUploadAlbum}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {albums.map((album) => (
                      <SelectItem key={album} value={album}>
                        {album.charAt(0).toUpperCase() + album.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* File input */}
              <div className="space-y-2">
                <Label>Photos</Label>
                <Input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileSelect}
                />
              </div>

              {/* Selected files */}
              {selectedFiles.length > 0 && (
                <div className="space-y-2">
                  <Label>Selected ({selectedFiles.length})</Label>
                  <div className="max-h-40 overflow-y-auto space-y-1">
                    {selectedFiles.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between text-sm bg-muted p-2 rounded"
                      >
                        <span className="truncate flex-1">{file.name}</span>
                        {uploadingIndex === index ? (
                          <span className="text-muted-foreground">
                            {progress}%
                          </span>
                        ) : (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => removeFile(index)}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedFiles([]);
                  setUploadDialogOpen(false);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpload}
                disabled={selectedFiles.length === 0 || uploading}
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload {selectedFiles.length} Photos
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Caption Dialog */}
        <Dialog open={!!editingPhoto} onOpenChange={() => setEditingPhoto(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Caption</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Caption (Vietnamese)</Label>
                <Input
                  value={editingPhoto?.caption_vi || ""}
                  onChange={(e) =>
                    setEditingPhoto((prev) =>
                      prev ? { ...prev, caption_vi: e.target.value } : null
                    )
                  }
                  placeholder="Chú thích..."
                />
              </div>
              <div className="space-y-2">
                <Label>Caption (English)</Label>
                <Input
                  value={editingPhoto?.caption_en || ""}
                  onChange={(e) =>
                    setEditingPhoto((prev) =>
                      prev ? { ...prev, caption_en: e.target.value } : null
                    )
                  }
                  placeholder="Caption..."
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingPhoto(null)}>
                Cancel
              </Button>
              <Button onClick={handleSaveCaption}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}

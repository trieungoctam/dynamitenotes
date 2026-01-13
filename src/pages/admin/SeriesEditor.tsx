/**
 * SeriesEditor - Create and edit series with post ordering
 */

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Eye, GripVertical, Plus, X } from "lucide-react";
import slugify from "slugify";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useAdminSeriesDetail,
  useCreateSeries,
  useUpdateSeries,
  useUpdateSeriesPosts,
} from "@/hooks/use-admin-series";
import { useAdminPosts } from "@/hooks/use-admin-posts";
import { useUpload } from "@/hooks/use-upload";
import { toast } from "sonner";

interface SeriesFormData {
  title_vi: string;
  title_en: string;
  slug: string;
  description_vi: string;
  description_en: string;
  cover_image: string;
  featured: boolean;
  published: boolean;
}

const initialFormData: SeriesFormData = {
  title_vi: "",
  title_en: "",
  slug: "",
  description_vi: "",
  description_en: "",
  cover_image: "",
  featured: false,
  published: false,
};

export default function SeriesEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = id === "new";

  const { data: series, isLoading } = useAdminSeriesDetail(isNew ? "" : id || "");
  const { data: allPosts } = useAdminPosts();
  const createSeries = useCreateSeries();
  const updateSeries = useUpdateSeries();
  const updateSeriesPosts = useUpdateSeriesPosts();
  const { upload, uploading } = useUpload("post-images");

  const [formData, setFormData] = useState<SeriesFormData>(initialFormData);
  const [selectedPosts, setSelectedPosts] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  // Load series data when editing
  useEffect(() => {
    if (series && !isNew) {
      setFormData({
        title_vi: series.title_vi || "",
        title_en: series.title_en || "",
        slug: series.slug || "",
        description_vi: series.description_vi || "",
        description_en: series.description_en || "",
        cover_image: series.cover_image || "",
        featured: series.featured || false,
        published: series.published || false,
      });
      // Load post IDs in order
      if (series.posts) {
        setSelectedPosts(series.posts.map((p: { id: string }) => p.id));
      }
    }
  }, [series, isNew]);

  // Auto-generate slug from Vietnamese title
  const handleTitleChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      title_vi: value,
      slug: isNew ? slugify(value, { lower: true, strict: true }) : prev.slug,
    }));
  };

  // Update form field
  const updateField = <K extends keyof SeriesFormData>(
    key: K,
    value: SeriesFormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  // Handle cover image upload
  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const url = await upload(file);
        updateField("cover_image", url);
        toast.success("Cover image uploaded");
      } catch {
        toast.error("Failed to upload image");
      }
    }
  };

  // Add post to series
  const addPost = (postId: string) => {
    if (!selectedPosts.includes(postId)) {
      setSelectedPosts([...selectedPosts, postId]);
    }
  };

  // Remove post from series
  const removePost = (postId: string) => {
    setSelectedPosts(selectedPosts.filter((id) => id !== postId));
  };

  // Move post up in order
  const movePostUp = (index: number) => {
    if (index === 0) return;
    const newPosts = [...selectedPosts];
    [newPosts[index - 1], newPosts[index]] = [newPosts[index], newPosts[index - 1]];
    setSelectedPosts(newPosts);
  };

  // Move post down in order
  const movePostDown = (index: number) => {
    if (index === selectedPosts.length - 1) return;
    const newPosts = [...selectedPosts];
    [newPosts[index], newPosts[index + 1]] = [newPosts[index + 1], newPosts[index]];
    setSelectedPosts(newPosts);
  };

  // Get available posts (not already in series)
  const availablePosts = allPosts?.filter(
    (p) => !selectedPosts.includes(p.id)
  );

  // Get post by ID
  const getPost = (postId: string) => allPosts?.find((p) => p.id === postId);

  // Save series
  const handleSave = async (publish = false) => {
    if (!formData.title_vi.trim()) {
      toast.error("Title (Vietnamese) is required");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...formData,
        published: publish ? true : formData.published,
      };

      let seriesId = id;

      if (isNew) {
        const result = await createSeries.mutateAsync(payload);
        seriesId = result.id;
        toast.success("Series created");
      } else {
        await updateSeries.mutateAsync({ id: id!, ...payload });
        toast.success("Series saved");
      }

      // Update posts in series
      if (seriesId && seriesId !== "new") {
        await updateSeriesPosts.mutateAsync({
          seriesId,
          postIds: selectedPosts,
        });
      }

      if (isNew && seriesId) {
        navigate(`/admin/series/${seriesId}`, { replace: true });
      }
    } catch (error) {
      toast.error("Failed to save series");
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  // Preview series
  const handlePreview = () => {
    if (formData.slug) {
      window.open(`/series/${formData.slug}`, "_blank");
    }
  };

  if (isLoading && !isNew) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/admin/series")}
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h1 className="text-2xl font-bold">
              {isNew ? "New Series" : "Edit Series"}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            {!isNew && formData.slug && (
              <Button variant="outline" onClick={handlePreview}>
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => handleSave(false)}
              disabled={saving || uploading}
            >
              <Save className="w-4 h-4 mr-2" />
              Save Draft
            </Button>
            <Button
              onClick={() => handleSave(true)}
              disabled={saving || uploading}
            >
              {formData.published ? "Update" : "Publish"}
            </Button>
          </div>
        </div>

        {/* Form */}
        <div className="grid grid-cols-3 gap-6">
          {/* Main Content - 2 columns */}
          <div className="col-span-2 space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title_vi">Title (Vietnamese) *</Label>
              <Input
                id="title_vi"
                value={formData.title_vi}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Tên series..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="title_en">Title (English)</Label>
              <Input
                id="title_en"
                value={formData.title_en}
                onChange={(e) => updateField("title_en", e.target.value)}
                placeholder="Series title in English..."
              />
            </div>

            {/* Slug */}
            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => updateField("slug", e.target.value)}
                placeholder="series-url-slug"
              />
            </div>

            {/* Description Tabs */}
            <Tabs defaultValue="vi" className="space-y-4">
              <TabsList>
                <TabsTrigger value="vi">Vietnamese</TabsTrigger>
                <TabsTrigger value="en">English</TabsTrigger>
              </TabsList>
              <TabsContent value="vi" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="description_vi">Description (Vietnamese)</Label>
                  <Textarea
                    id="description_vi"
                    value={formData.description_vi}
                    onChange={(e) =>
                      updateField("description_vi", e.target.value)
                    }
                    placeholder="Mô tả series..."
                    rows={4}
                  />
                </div>
              </TabsContent>
              <TabsContent value="en" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="description_en">Description (English)</Label>
                  <Textarea
                    id="description_en"
                    value={formData.description_en}
                    onChange={(e) =>
                      updateField("description_en", e.target.value)
                    }
                    placeholder="Series description..."
                    rows={4}
                  />
                </div>
              </TabsContent>
            </Tabs>

            {/* Posts in Series */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Posts in Series</Label>
                <Select onValueChange={addPost}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Add post..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availablePosts?.map((post) => (
                      <SelectItem key={post.id} value={post.id}>
                        {post.title_vi}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedPosts.length > 0 ? (
                <div className="border rounded-lg divide-y">
                  {selectedPosts.map((postId, index) => {
                    const post = getPost(postId);
                    return (
                      <div
                        key={postId}
                        className="flex items-center gap-3 p-3"
                      >
                        <div className="flex flex-col gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5"
                            onClick={() => movePostUp(index)}
                            disabled={index === 0}
                          >
                            <GripVertical className="w-3 h-3 rotate-90" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5"
                            onClick={() => movePostDown(index)}
                            disabled={index === selectedPosts.length - 1}
                          >
                            <GripVertical className="w-3 h-3 -rotate-90" />
                          </Button>
                        </div>
                        <span className="text-sm text-muted-foreground w-6">
                          {index + 1}.
                        </span>
                        <span className="flex-1">
                          {post?.title_vi || "Unknown post"}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removePost(postId)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="border rounded-lg p-8 text-center text-muted-foreground">
                  <p>No posts in this series yet.</p>
                  <p className="text-sm">Use the dropdown above to add posts.</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar - 1 column */}
          <div className="space-y-6">
            {/* Status */}
            <div className="p-4 border rounded-lg space-y-4">
              <h3 className="font-semibold">Status</h3>
              <div className="flex items-center justify-between">
                <Label htmlFor="published">Published</Label>
                <Switch
                  id="published"
                  checked={formData.published}
                  onCheckedChange={(v) => updateField("published", v)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="featured">Featured</Label>
                <Switch
                  id="featured"
                  checked={formData.featured}
                  onCheckedChange={(v) => updateField("featured", v)}
                />
              </div>
            </div>

            {/* Cover Image */}
            <div className="p-4 border rounded-lg space-y-4">
              <h3 className="font-semibold">Cover Image</h3>
              {formData.cover_image && (
                <img
                  src={formData.cover_image}
                  alt="Cover"
                  className="w-full aspect-video object-cover rounded"
                />
              )}
              <div className="space-y-2">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleCoverUpload}
                  disabled={uploading}
                />
                <Input
                  value={formData.cover_image}
                  onChange={(e) => updateField("cover_image", e.target.value)}
                  placeholder="Or paste image URL..."
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

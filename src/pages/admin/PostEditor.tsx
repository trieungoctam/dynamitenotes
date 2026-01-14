/**
 * PostEditor - Create and edit posts with Markdown editor
 * Includes auto-save every 30s, image upload, and bilingual fields
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Eye, Clock, History, ChevronDown } from "lucide-react";
import slugify from "slugify";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { MarkdownEditor } from "@/components/admin/MarkdownEditor";
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
  useAdminPost,
  useCreatePost,
  useUpdatePost,
  calculateReadTime,
} from "@/hooks/use-admin-posts";
import { useUpload } from "@/hooks/use-upload";
import { useTaxonomy } from "@/hooks/use-taxonomy";
import { usePostVersions, useRollbackVersion } from "@/hooks/use-post-versions";
import { VersionHistory } from "@/components/admin/VersionHistory";
import { RollbackConfirmDialog } from "@/components/admin/RollbackConfirmDialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { toast } from "sonner";

interface PostFormData {
  title_vi: string;
  title_en: string;
  slug: string;
  excerpt_vi: string;
  excerpt_en: string;
  content_vi: string;
  content_en: string;
  cover_image: string;
  goal_id: string | null;
  outcome_id: string | null;
  level: string | null;
  read_time: number;
  featured: boolean;
  published: boolean;
}

const initialFormData: PostFormData = {
  title_vi: "",
  title_en: "",
  slug: "",
  excerpt_vi: "",
  excerpt_en: "",
  content_vi: "",
  content_en: "",
  cover_image: "",
  goal_id: null,
  outcome_id: null,
  level: null,
  read_time: 5,
  featured: false,
  published: false,
};

const AUTO_SAVE_INTERVAL = 30000; // 30 seconds

export default function PostEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = id === "new";

  const { data: post, isLoading } = useAdminPost(isNew ? "" : id || "");
  const createPost = useCreatePost();
  const updatePost = useUpdatePost();
  const { upload, uploading } = useUpload("post-images");
  const { data: goals } = useTaxonomy("goal");
  const { data: outcomes } = useTaxonomy("outcome");
  const { data: versions, isLoading: versionsLoading } = usePostVersions(isNew ? "" : id || "");
  const rollbackVersion = useRollbackVersion();

  const [formData, setFormData] = useState<PostFormData>(initialFormData);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [rollbackVersionId, setRollbackVersionId] = useState<string | null>(null);
  const autoSaveRef = useRef<NodeJS.Timeout | null>(null);

  // Load post data when editing
  useEffect(() => {
    if (post && !isNew) {
      setFormData({
        title_vi: post.title_vi || "",
        title_en: post.title_en || "",
        slug: post.slug || "",
        excerpt_vi: post.excerpt_vi || "",
        excerpt_en: post.excerpt_en || "",
        content_vi: post.content_vi || "",
        content_en: post.content_en || "",
        cover_image: post.cover_image || "",
        goal_id: post.goal_id || null,
        outcome_id: post.outcome_id || null,
        level: post.level || null,
        read_time: post.read_time || 5,
        featured: post.featured || false,
        published: post.published || false,
      });
    }
  }, [post, isNew]);

  // Auto-generate slug from Vietnamese title
  const handleTitleChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      title_vi: value,
      slug: isNew ? slugify(value, { lower: true, strict: true }) : prev.slug,
    }));
    setHasChanges(true);
  };

  // Update form field
  const updateField = <K extends keyof PostFormData>(
    key: K,
    value: PostFormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  // Calculate read time when content changes
  useEffect(() => {
    const readTime = calculateReadTime(formData.content_vi);
    if (readTime !== formData.read_time) {
      setFormData((prev) => ({ ...prev, read_time: readTime }));
    }
  }, [formData.content_vi]);

  // Handle image upload for markdown editor
  const handleImageUpload = async (file: File): Promise<string> => {
    const url = await upload(file);
    return url;
  };

  // Save post
  const handleSave = useCallback(
    async (publish = false) => {
      if (!formData.title_vi.trim()) {
        toast.error("Title (Vietnamese) is required");
        return;
      }

      setSaving(true);
      try {
        const payload = {
          ...formData,
          published: publish ? true : formData.published,
          published_at:
            publish && !formData.published
              ? new Date().toISOString()
              : undefined,
        };

        if (isNew) {
          const result = await createPost.mutateAsync(payload);
          toast.success("Post created");
          navigate(`/admin/posts/${result.id}`, { replace: true });
        } else {
          await updatePost.mutateAsync({ id: id!, ...payload });
          toast.success("Post saved");
        }
        setLastSaved(new Date());
        setHasChanges(false);
      } catch (error) {
        toast.error("Failed to save post");
        console.error(error);
      } finally {
        setSaving(false);
      }
    },
    [formData, isNew, id, createPost, updatePost, navigate]
  );

  // Auto-save for existing posts
  useEffect(() => {
    if (!isNew && hasChanges) {
      autoSaveRef.current = setTimeout(() => {
        handleSave(false);
      }, AUTO_SAVE_INTERVAL);
    }

    return () => {
      if (autoSaveRef.current) {
        clearTimeout(autoSaveRef.current);
      }
    };
  }, [isNew, hasChanges, handleSave]);

  // Preview post
  const handlePreview = () => {
    if (formData.slug) {
      window.open(`/posts/${formData.slug}`, "_blank");
    }
  };

  // Handle rollback to version
  const handleRollback = async (versionId: string) => {
    try {
      await rollbackVersion.mutateAsync({ postId: id!, versionId });
      toast.success("Rolled back to previous version");
      setRollbackVersionId(null);
    } catch {
      toast.error("Failed to rollback");
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
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/admin/posts")}
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">
                {isNew ? "New Post" : "Edit Post"}
              </h1>
              {lastSaved && (
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Last saved {lastSaved.toLocaleTimeString()}
                </p>
              )}
            </div>
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
                placeholder="Tiêu đề bài viết..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="title_en">Title (English)</Label>
              <Input
                id="title_en"
                value={formData.title_en}
                onChange={(e) => updateField("title_en", e.target.value)}
                placeholder="Post title in English..."
              />
            </div>

            {/* Slug */}
            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => updateField("slug", e.target.value)}
                placeholder="post-url-slug"
              />
            </div>

            {/* Content Tabs */}
            <Tabs defaultValue="vi" className="space-y-4">
              <TabsList>
                <TabsTrigger value="vi">Vietnamese</TabsTrigger>
                <TabsTrigger value="en">English</TabsTrigger>
              </TabsList>
              <TabsContent value="vi" className="space-y-4">
                <div className="space-y-2">
                  <Label>Content (Vietnamese) *</Label>
                  <MarkdownEditor
                    value={formData.content_vi}
                    onChange={(v) => updateField("content_vi", v)}
                    onImageUpload={handleImageUpload}
                    height={400}
                    placeholder="Write your post in Vietnamese..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="excerpt_vi">Excerpt (Vietnamese)</Label>
                  <Textarea
                    id="excerpt_vi"
                    value={formData.excerpt_vi}
                    onChange={(e) => updateField("excerpt_vi", e.target.value)}
                    placeholder="Brief summary..."
                    rows={3}
                  />
                </div>
              </TabsContent>
              <TabsContent value="en" className="space-y-4">
                <div className="space-y-2">
                  <Label>Content (English)</Label>
                  <MarkdownEditor
                    value={formData.content_en}
                    onChange={(v) => updateField("content_en", v)}
                    onImageUpload={handleImageUpload}
                    height={400}
                    placeholder="Write your post in English..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="excerpt_en">Excerpt (English)</Label>
                  <Textarea
                    id="excerpt_en"
                    value={formData.excerpt_en}
                    onChange={(e) => updateField("excerpt_en", e.target.value)}
                    placeholder="Brief summary..."
                    rows={3}
                  />
                </div>
              </TabsContent>
            </Tabs>
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

            {/* Taxonomy */}
            <div className="p-4 border rounded-lg space-y-4">
              <h3 className="font-semibold">Categories</h3>
              <div className="space-y-2">
                <Label>Goal</Label>
                <Select
                  value={formData.goal_id || ""}
                  onValueChange={(v) => updateField("goal_id", v || null)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select goal..." />
                  </SelectTrigger>
                  <SelectContent>
                    {goals?.map((goal) => (
                      <SelectItem key={goal.id} value={goal.id}>
                        {goal.name_vi}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Outcome</Label>
                <Select
                  value={formData.outcome_id || ""}
                  onValueChange={(v) => updateField("outcome_id", v || null)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select outcome..." />
                  </SelectTrigger>
                  <SelectContent>
                    {outcomes?.map((outcome) => (
                      <SelectItem key={outcome.id} value={outcome.id}>
                        {outcome.name_vi}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Level</Label>
                <Select
                  value={formData.level || ""}
                  onValueChange={(v) => updateField("level", v || null)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select level..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Meta */}
            <div className="p-4 border rounded-lg space-y-4">
              <h3 className="font-semibold">Meta</h3>
              <div className="space-y-2">
                <Label htmlFor="read_time">Read Time (min)</Label>
                <Input
                  id="read_time"
                  type="number"
                  min={1}
                  value={formData.read_time}
                  onChange={(e) =>
                    updateField("read_time", parseInt(e.target.value) || 1)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cover_image">Cover Image URL</Label>
                <Input
                  id="cover_image"
                  value={formData.cover_image}
                  onChange={(e) => updateField("cover_image", e.target.value)}
                  placeholder="https://..."
                />
              </div>
            </div>

            {/* Version History - Only show when editing */}
            {!isNew && (
              <Collapsible
                open={showVersionHistory}
                onOpenChange={setShowVersionHistory}
                className="p-4 border rounded-lg space-y-4"
              >
                <CollapsibleTrigger className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2 font-semibold">
                    <History className="w-4 h-4" />
                    <span>Version History</span>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${
                      showVersionHistory ? "rotate-180" : ""
                    }`}
                  />
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <VersionHistory
                    versions={versions || []}
                    currentPost={{
                      title_vi: formData.title_vi,
                      content_vi: formData.content_vi,
                      excerpt_vi: formData.excerpt_vi,
                      cover_image: formData.cover_image || null,
                    }}
                    onRollback={(versionId) => setRollbackVersionId(versionId)}
                    isLoading={versionsLoading}
                  />
                </CollapsibleContent>
              </Collapsible>
            )}
          </div>
        </div>
      </div>

      {/* Rollback Confirmation Dialog */}
      {rollbackVersionId && versions && (
        <RollbackConfirmDialog
          version={versions.find((v) => v.id === rollbackVersionId)!}
          onConfirm={() => handleRollback(rollbackVersionId)}
          open={!!rollbackVersionId}
          onOpenChange={(open) => !open && setRollbackVersionId(null)}
        />
      )}
    </AdminLayout>
  );
}

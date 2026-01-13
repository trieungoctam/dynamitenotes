/**
 * InsightEditor - Create and edit insights
 */

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Save, X } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useAdminInsight,
  useCreateInsight,
  useUpdateInsight,
} from "@/hooks/use-admin-insights";
import { useAdminPosts } from "@/hooks/use-admin-posts";
import { toast } from "sonner";

interface InsightFormData {
  content_vi: string;
  content_en: string;
  tags: string[];
  related_post_id: string | null;
  pinned: boolean;
  published: boolean;
}

const initialFormData: InsightFormData = {
  content_vi: "",
  content_en: "",
  tags: [],
  related_post_id: null,
  pinned: false,
  published: false,
};

export default function InsightEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = id === "new";

  const { data: insight, isLoading } = useAdminInsight(isNew ? "" : id || "");
  const { data: posts } = useAdminPosts();
  const createInsight = useCreateInsight();
  const updateInsight = useUpdateInsight();

  const [formData, setFormData] = useState<InsightFormData>(initialFormData);
  const [tagInput, setTagInput] = useState("");
  const [saving, setSaving] = useState(false);

  // Load insight data when editing
  useEffect(() => {
    if (insight && !isNew) {
      setFormData({
        content_vi: insight.content_vi || "",
        content_en: insight.content_en || "",
        tags: insight.tags || [],
        related_post_id: insight.related_post_id || null,
        pinned: insight.pinned || false,
        published: insight.published || false,
      });
    }
  }, [insight, isNew]);

  // Update form field
  const updateField = <K extends keyof InsightFormData>(
    key: K,
    value: InsightFormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  // Add tag
  const addTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !formData.tags.includes(tag)) {
      updateField("tags", [...formData.tags, tag]);
      setTagInput("");
    }
  };

  // Remove tag
  const removeTag = (tagToRemove: string) => {
    updateField(
      "tags",
      formData.tags.filter((t) => t !== tagToRemove)
    );
  };

  // Handle tag input keydown
  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    }
  };

  // Save insight
  const handleSave = async (publish = false) => {
    if (!formData.content_vi.trim()) {
      toast.error("Content (Vietnamese) is required");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...formData,
        published: publish ? true : formData.published,
        published_at:
          publish && !formData.published ? new Date().toISOString() : undefined,
      };

      if (isNew) {
        const result = await createInsight.mutateAsync(payload);
        toast.success("Insight created");
        navigate(`/admin/insights/${result.id}`, { replace: true });
      } else {
        await updateInsight.mutateAsync({ id: id!, ...payload });
        toast.success("Insight saved");
      }
    } catch (error) {
      toast.error("Failed to save insight");
      console.error(error);
    } finally {
      setSaving(false);
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
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/admin/insights")}
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h1 className="text-2xl font-bold">
              {isNew ? "New Insight" : "Edit Insight"}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => handleSave(false)}
              disabled={saving}
            >
              <Save className="w-4 h-4 mr-2" />
              Save Draft
            </Button>
            <Button onClick={() => handleSave(true)} disabled={saving}>
              {formData.published ? "Update" : "Publish"}
            </Button>
          </div>
        </div>

        {/* Form */}
        <div className="grid grid-cols-3 gap-6">
          {/* Main Content - 2 columns */}
          <div className="col-span-2 space-y-6">
            <Tabs defaultValue="vi" className="space-y-4">
              <TabsList>
                <TabsTrigger value="vi">Vietnamese</TabsTrigger>
                <TabsTrigger value="en">English</TabsTrigger>
              </TabsList>
              <TabsContent value="vi" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="content_vi">Content (Vietnamese) *</Label>
                  <Textarea
                    id="content_vi"
                    value={formData.content_vi}
                    onChange={(e) => updateField("content_vi", e.target.value)}
                    placeholder="Write your insight in Vietnamese..."
                    rows={8}
                  />
                  <p className="text-xs text-muted-foreground">
                    Supports Markdown formatting
                  </p>
                </div>
              </TabsContent>
              <TabsContent value="en" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="content_en">Content (English)</Label>
                  <Textarea
                    id="content_en"
                    value={formData.content_en}
                    onChange={(e) => updateField("content_en", e.target.value)}
                    placeholder="Write your insight in English..."
                    rows={8}
                  />
                  <p className="text-xs text-muted-foreground">
                    Supports Markdown formatting
                  </p>
                </div>
              </TabsContent>
            </Tabs>

            {/* Tags */}
            <div className="space-y-2">
              <Label>Tags</Label>
              <div className="flex gap-2">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                  placeholder="Add a tag..."
                  className="flex-1"
                />
                <Button type="button" variant="outline" onClick={addTag}>
                  Add
                </Button>
              </div>
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="cursor-pointer"
                      onClick={() => removeTag(tag)}
                    >
                      {tag}
                      <X className="w-3 h-3 ml-1" />
                    </Badge>
                  ))}
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
                <Label htmlFor="pinned">Pinned</Label>
                <Switch
                  id="pinned"
                  checked={formData.pinned}
                  onCheckedChange={(v) => updateField("pinned", v)}
                />
              </div>
            </div>

            {/* Related Post */}
            <div className="p-4 border rounded-lg space-y-4">
              <h3 className="font-semibold">Related Post</h3>
              <Select
                value={formData.related_post_id || ""}
                onValueChange={(v) =>
                  updateField("related_post_id", v || null)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a post..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {posts?.map((post) => (
                    <SelectItem key={post.id} value={post.id}>
                      {post.title_vi}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

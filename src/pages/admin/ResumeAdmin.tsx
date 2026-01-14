/**
 * ResumeAdmin - Admin page for managing resume sections
 * Modern brutalist design with improved visual hierarchy
 * Supports 5 section types: highlight, experience, project, writing, speaking
 */

import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { ResumeSectionEditModal } from "@/components/admin/ResumeSectionEditModal";
import {
  useAdminResumeSections,
  useCreateResumeSection,
  useUpdateResumeSection,
  useDeleteResumeSection,
} from "@/hooks/use-admin-resume";
import type { ResumeSection } from "@/hooks/use-admin-resume";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, FileText, GripVertical, Sparkles } from "lucide-react";
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
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const SECTION_TYPES = [
  {
    value: "highlight",
    label: "Highlights",
    icon: <Sparkles className="w-4 h-4" />,
    color: "blue",
    bgGradient: "from-blue-500/10 to-cyan-500/10",
    borderColor: "border-blue-500/30",
    badgeColor: "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20",
  },
  {
    value: "experience",
    label: "Experience",
    icon: <GripVertical className="w-4 h-4" />,
    color: "green",
    bgGradient: "from-green-500/10 to-emerald-500/10",
    borderColor: "border-green-500/30",
    badgeColor: "bg-green-500/10 text-green-700 dark:text-green-300 border-green-500/20",
  },
  {
    value: "project",
    label: "Projects",
    icon: <FileText className="w-4 h-4" />,
    color: "purple",
    bgGradient: "from-purple-500/10 to-violet-500/10",
    borderColor: "border-purple-500/30",
    badgeColor: "bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/20",
  },
  {
    value: "writing",
    label: "Writing",
    icon: <FileText className="w-4 h-4" />,
    color: "orange",
    bgGradient: "from-orange-500/10 to-amber-500/10",
    borderColor: "border-orange-500/30",
    badgeColor: "bg-orange-500/10 text-orange-700 dark:text-orange-300 border-orange-500/20",
  },
  {
    value: "speaking",
    label: "Speaking",
    icon: <Sparkles className="w-4 h-4" />,
    color: "pink",
    bgGradient: "from-pink-500/10 to-rose-500/10",
    borderColor: "border-pink-500/30",
    badgeColor: "bg-pink-500/10 text-pink-700 dark:text-pink-300 border-pink-500/20",
  },
] as const;

const TYPE_ICONS: Record<string, string> = {
  highlight: "💫",
  experience: "💼",
  project: "🚀",
  writing: "✍️",
  speaking: "🎤",
};

export default function ResumeAdmin() {
  const { data: sections = [], isLoading } = useAdminResumeSections();
  const createSection = useCreateResumeSection();
  const updateSection = useUpdateResumeSection();
  const deleteSection = useDeleteResumeSection();

  const [editingSection, setEditingSection] = useState<ResumeSection | undefined>();
  const [modalOpen, setModalOpen] = useState(false);

  const handleAdd = () => {
    setEditingSection(undefined);
    setModalOpen(true);
  };

  const handleEdit = (section: ResumeSection) => {
    setEditingSection(section);
    setModalOpen(true);
  };

  const handleDelete = (id: string) => {
    deleteSection.mutate(id, {
      onSuccess: () => toast.success("Section deleted"),
      onError: () => toast.error("Failed to delete section"),
    });
  };

  const handleSave = async (data: Omit<ResumeSection, "id" | "created_at" | "updated_at">) => {
    try {
      if (editingSection) {
        await updateSection.mutateAsync({
          id: editingSection.id,
          ...data,
        });
        toast.success("Section updated");
      } else {
        await createSection.mutateAsync(data);
        toast.success("Section added");
      }
      setModalOpen(false);
    } catch (error) {
      console.error("Failed to save section:", error);
      toast.error("Failed to save section");
    }
  };

  const sectionsByType = sections.reduce((acc, section) => {
    if (!acc[section.type]) {
      acc[section.type] = [];
    }
    acc[section.type].push(section);
    return acc;
  }, {} as Record<string, ResumeSection[]>);

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Resume</h1>
            <p className="text-muted-foreground">Manage your professional story</p>
          </div>
          <Button onClick={handleAdd} size="lg">
            <Plus className="w-4 h-4 mr-2" />
            Add Section
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {SECTION_TYPES.map((type) => {
            const count = (sectionsByType[type.value] || []).length;
            return (
              <button
                key={type.value}
                onClick={handleAdd}
                className={cn(
                  "group relative overflow-hidden rounded-lg border-2 p-4 text-left transition-all hover:shadow-lg",
                  type.borderColor,
                  "hover:-translate-y-1",
                  "bg-gradient-to-br",
                  type.bgGradient
                )}
              >
                <div className="flex items-start justify-between mb-3">
                  <span className="text-2xl">{TYPE_ICONS[type.value]}</span>
                  <Badge
                    variant="outline"
                    className={cn("text-xs font-semibold", type.badgeColor)}
                  >
                    {count}
                  </Badge>
                </div>
                <div className="font-semibold text-sm">{type.label}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {count === 1 ? "1 item" : `${count} items`}
                </div>
              </button>
            );
          })}
        </div>

        {/* Empty State */}
        {sections.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center mb-6">
              <FileText className="w-10 h-10 text-primary/50" />
            </div>
            <h2 className="text-2xl font-bold mb-2">No sections yet</h2>
            <p className="text-muted-foreground mb-6 max-w-md">
              Start building your resume by adding your first section. Choose from highlights, experience, projects, writing, or speaking.
            </p>
            <Button onClick={handleAdd} size="lg">
              <Plus className="w-4 h-4 mr-2" />
              Create First Section
            </Button>
          </div>
        ) : (
          <div className="space-y-8">
            {SECTION_TYPES.map((type) => {
              const typeSections = sectionsByType[type.value] || [];
              if (typeSections.length === 0) return null;

              return (
                <section key={type.value} className="space-y-4">
                  {/* Section Header */}
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{TYPE_ICONS[type.value]}</span>
                    <h2 className="text-xl font-bold">{type.label}</h2>
                    <Badge variant="secondary" className="ml-auto">
                      {typeSections.length} {typeSections.length === 1 ? "item" : "items"}
                    </Badge>
                  </div>

                  {/* Cards Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {typeSections.map((section) => (
                      <div
                        key={section.id}
                        className={cn(
                          "group relative rounded-lg border-2 p-4 transition-all hover:shadow-lg",
                          type.borderColor,
                          "hover:-translate-y-1",
                          "bg-gradient-to-br",
                          type.bgGradient,
                          "cursor-pointer"
                        )}
                        onClick={() => handleEdit(section)}
                      >
                        {/* Action Buttons */}
                        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            type="button"
                            variant="secondary"
                            size="icon"
                            className="h-7 w-7"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(section);
                            }}
                          >
                            <Pencil className="w-3 h-3" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild onClick={(e) => e.stopPropagation()}>
                              <Button
                                variant="destructive"
                                size="icon"
                                className="h-7 w-7"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Section</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{section.title_vi}"? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(section.id)}>
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>

                        {/* Content */}
                        <div className="pr-16">
                          <div className="flex items-start gap-2 mb-2">
                            <span className="text-lg">{TYPE_ICONS[section.type]}</span>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold truncate">{section.title_vi}</h3>
                              {section.title_en && (
                                <p className="text-sm text-muted-foreground truncate font-mono">
                                  {section.title_en}
                                </p>
                              )}
                            </div>
                          </div>
                          <Badge
                            variant="outline"
                            className={cn("text-xs", type.badgeColor)}
                          >
                            {type.label}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      <ResumeSectionEditModal
        section={editingSection}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
      />
    </AdminLayout>
  );
}

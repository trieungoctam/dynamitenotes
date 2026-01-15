/**
 * ResumeSectionEditModal - Modal for editing resume sections
 * Supports 8 section types matching seed data structure:
 * highlight, experience, education, skill, certification, project, writing, speaking
 */

import { useState, useEffect, FormEvent, useRef } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X, Plus, Trash2 } from "lucide-react";
import { MarkdownEditor } from "./MarkdownEditor";
import type { ResumeSection } from "@/hooks/use-admin-resume";

interface ResumeSectionEditModalProps {
  section?: ResumeSection;
  open: boolean;
  onClose: () => void;
  onSave: (data: Omit<ResumeSection, "id" | "created_at" | "updated_at">) => void;
}

// Content types matching seed data structure
type HighlightContent = { items: string[] };
type ExperienceItem = {
  title: string;
  company: string;
  period: string;
  description: string;
  location: string;
};
type ExperienceContent = { experiences: ExperienceItem[] };
type EducationItem = {
  degree: string;
  school: string;
  period: string;
  description: string;
  location: string;
};
type EducationContent = { education: EducationItem[] };
type SkillCategory = { name: string; skills: string[] };
type SkillContent = { categories: SkillCategory[] };
type CertificationItem = { name: string; issuer: string; year: string };
type CertificationContent = { certifications: CertificationItem[] };
type ProjectItem = {
  name: string;
  description: string;
  tech: string[];
  url: string;
};
type ProjectContent = { projects: ProjectItem[] };
type WritingContent = { title?: string; publisher?: string; date?: string; url?: string };
type SpeakingContent = { title?: string; publisher?: string; date?: string; url?: string };

const SECTION_TYPES = [
  { value: "highlight", label: "Highlights", color: "bg-blue-500", borderColor: "border-blue-500", icon: "💫" },
  { value: "experience", label: "Experience", color: "bg-green-500", borderColor: "border-green-500", icon: "💼" },
  { value: "education", label: "Education", color: "bg-cyan-500", borderColor: "border-cyan-500", icon: "🎓" },
  { value: "skill", label: "Skills", color: "bg-yellow-500", borderColor: "border-yellow-500", icon: "⚡" },
  { value: "certification", label: "Certifications", color: "bg-amber-500", borderColor: "border-amber-500", icon: "🏆" },
  { value: "project", label: "Projects", color: "bg-purple-500", borderColor: "border-purple-500", icon: "🚀" },
  { value: "writing", label: "Writing", color: "bg-orange-500", borderColor: "border-orange-500", icon: "✍️" },
  { value: "speaking", label: "Speaking", color: "bg-pink-500", borderColor: "border-pink-500", icon: "🎤" },
] as const;

export function ResumeSectionEditModal({
  section,
  open,
  onClose,
  onSave,
}: ResumeSectionEditModalProps) {
  const previousSectionId = useRef<string | undefined>();
  const isLoadingSection = useRef(false);
  const lastSelectedType = useRef<ResumeSection["type"]>("highlight");

  const [type, setType] = useState<ResumeSection["type"]>("highlight");
  const [titleVi, setTitleVi] = useState("");
  const [titleEn, setTitleEn] = useState("");

  // Highlight content - list of strings
  const [highlightItems, setHighlightItems] = useState<string[]>([]);
  const [newHighlightItem, setNewHighlightItem] = useState("");

  // Experience content - list of experience items
  const [experiences, setExperiences] = useState<ExperienceItem[]>([]);

  // Education content - list of education items
  const [educationItems, setEducationItems] = useState<EducationItem[]>([]);

  // Skill content - list of skill categories
  const [skillCategories, setSkillCategories] = useState<SkillCategory[]>([]);

  // Certification content - list of certifications
  const [certifications, setCertifications] = useState<CertificationItem[]>([]);

  // Project content - list of projects
  const [projects, setProjects] = useState<ProjectItem[]>([]);

  // Writing/Speaking content (single item)
  const [articleTitle, setArticleTitle] = useState("");
  const [publisher, setPublisher] = useState("");
  const [articleDate, setArticleDate] = useState("");
  const [articleUrl, setArticleUrl] = useState("");

  useEffect(() => {
    if (section) {
      isLoadingSection.current = true;
      setType(section.type);
      setTitleVi(section.title_vi);
      setTitleEn(section.title_en || "");

      const content = section.content;

      if (section.type === "highlight") {
        setHighlightItems((content as HighlightContent).items || []);
      } else if (section.type === "experience") {
        setExperiences((content as ExperienceContent).experiences || []);
      } else if (section.type === "education") {
        setEducationItems((content as EducationContent).education || []);
      } else if (section.type === "skill") {
        setSkillCategories((content as SkillContent).categories || []);
      } else if (section.type === "certification") {
        setCertifications((content as CertificationContent).certifications || []);
      } else if (section.type === "project") {
        setProjects((content as ProjectContent).projects || []);
      } else if (section.type === "writing" || section.type === "speaking") {
        setArticleTitle((content as WritingContent).title || "");
        setPublisher((content as WritingContent).publisher || "");
        setArticleDate((content as WritingContent).date || "");
        setArticleUrl((content as WritingContent).url || "");
      }
      setTimeout(() => { isLoadingSection.current = false; }, 0);
    } else if (previousSectionId.current) {
      resetForm();
    }
    previousSectionId.current = section?.id;
  }, [section]);

  useEffect(() => {
    if (!isLoadingSection.current) {
      lastSelectedType.current = type;
    }
  }, [type]);

  // Clear type-specific fields when switching types
  useEffect(() => {
    if (isLoadingSection.current) return;
    setHighlightItems([]);
    setNewHighlightItem("");
    setExperiences([]);
    setEducationItems([]);
    setSkillCategories([]);
    setCertifications([]);
    setProjects([]);
    setArticleTitle("");
    setPublisher("");
    setArticleDate("");
    setArticleUrl("");
  }, [type]);

  const resetForm = () => {
    setType(lastSelectedType.current);
    setTitleVi("");
    setTitleEn("");
    setHighlightItems([]);
    setNewHighlightItem("");
    setExperiences([]);
    setEducationItems([]);
    setSkillCategories([]);
    setCertifications([]);
    setProjects([]);
    setArticleTitle("");
    setPublisher("");
    setArticleDate("");
    setArticleUrl("");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    let content: Record<string, unknown> = {};

    if (type === "highlight") {
      content = { items: highlightItems };
    } else if (type === "experience") {
      content = { experiences };
    } else if (type === "education") {
      content = { education: educationItems };
    } else if (type === "skill") {
      content = { categories: skillCategories };
    } else if (type === "certification") {
      content = { certifications };
    } else if (type === "project") {
      content = { projects };
    } else if (type === "writing" || type === "speaking") {
      content = {
        title: articleTitle,
        publisher,
        date: articleDate,
        url: articleUrl,
      };
    }

    onSave({
      type,
      title_vi: titleVi,
      title_en: titleEn || null,
      content,
      sort_order: section?.sort_order || 0,
    });

    handleClose();
  };

  // Highlight helpers
  const addHighlightItem = () => {
    if (newHighlightItem.trim()) {
      setHighlightItems([...highlightItems, newHighlightItem.trim()]);
      setNewHighlightItem("");
    }
  };
  const removeHighlightItem = (index: number) => {
    setHighlightItems(highlightItems.filter((_, i) => i !== index));
  };

  // Experience helpers
  const addExperience = () => {
    setExperiences([...experiences, { title: "", company: "", period: "", description: "", location: "" }]);
  };
  const updateExperience = (index: number, field: keyof ExperienceItem, value: string) => {
    const updated = [...experiences];
    updated[index] = { ...updated[index], [field]: value };
    setExperiences(updated);
  };
  const removeExperience = (index: number) => {
    setExperiences(experiences.filter((_, i) => i !== index));
  };

  // Education helpers
  const addEducation = () => {
    setEducationItems([...educationItems, { degree: "", school: "", period: "", description: "", location: "" }]);
  };
  const updateEducation = (index: number, field: keyof EducationItem, value: string) => {
    const updated = [...educationItems];
    updated[index] = { ...updated[index], [field]: value };
    setEducationItems(updated);
  };
  const removeEducation = (index: number) => {
    setEducationItems(educationItems.filter((_, i) => i !== index));
  };

  // Skill category helpers
  const addSkillCategory = () => {
    setSkillCategories([...skillCategories, { name: "", skills: [] }]);
  };
  const updateSkillCategoryName = (index: number, name: string) => {
    const updated = [...skillCategories];
    updated[index] = { ...updated[index], name };
    setSkillCategories(updated);
  };
  const addSkillToCategory = (catIndex: number, skill: string) => {
    if (skill.trim()) {
      const updated = [...skillCategories];
      updated[catIndex] = { ...updated[catIndex], skills: [...updated[catIndex].skills, skill.trim()] };
      setSkillCategories(updated);
    }
  };
  const removeSkillFromCategory = (catIndex: number, skillIndex: number) => {
    const updated = [...skillCategories];
    updated[catIndex] = { ...updated[catIndex], skills: updated[catIndex].skills.filter((_, i) => i !== skillIndex) };
    setSkillCategories(updated);
  };
  const removeSkillCategory = (index: number) => {
    setSkillCategories(skillCategories.filter((_, i) => i !== index));
  };

  // Certification helpers
  const addCertification = () => {
    setCertifications([...certifications, { name: "", issuer: "", year: "" }]);
  };
  const updateCertification = (index: number, field: keyof CertificationItem, value: string) => {
    const updated = [...certifications];
    updated[index] = { ...updated[index], [field]: value };
    setCertifications(updated);
  };
  const removeCertification = (index: number) => {
    setCertifications(certifications.filter((_, i) => i !== index));
  };

  // Project helpers
  const addProject = () => {
    setProjects([...projects, { name: "", description: "", tech: [], url: "" }]);
  };
  const updateProject = (index: number, field: keyof Omit<ProjectItem, "tech">, value: string) => {
    const updated = [...projects];
    updated[index] = { ...updated[index], [field]: value };
    setProjects(updated);
  };
  const addTechToProject = (projIndex: number, tech: string) => {
    if (tech.trim()) {
      const updated = [...projects];
      updated[projIndex] = { ...updated[projIndex], tech: [...updated[projIndex].tech, tech.trim()] };
      setProjects(updated);
    }
  };
  const removeTechFromProject = (projIndex: number, techIndex: number) => {
    const updated = [...projects];
    updated[projIndex] = { ...updated[projIndex], tech: updated[projIndex].tech.filter((_, i) => i !== techIndex) };
    setProjects(updated);
  };
  const removeProject = (index: number) => {
    setProjects(projects.filter((_, i) => i !== index));
  };

  const currentType = SECTION_TYPES.find((t) => t.value === type);

  return (
    <Dialog open={open} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto border-2 border-foreground rounded-none p-0" onEscapeKeyDown={handleClose} onPointerDownOutside={handleClose}>
        {/* Header */}
        <div className="border-b-2 border-foreground p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className={`w-2 h-6 ${currentType?.color}`} />
            <DialogTitle className="font-display font-bold text-xl uppercase tracking-tight">
              {section ? "EDIT" : "ADD"} {currentType?.label} SECTION
            </DialogTitle>
            <DialogDescription className="sr-only">
              {section ? "Edit" : "Add"} a {currentType?.label} section for your resume
            </DialogDescription>
          </div>
          <p className="text-muted-foreground text-sm">
            Fill in the details below to {section ? "update" : "create"} your resume section
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-0">
          {/* Section Type */}
          <div className="p-6 border-b border-border">
            <Label className="text-sm uppercase tracking-wider font-bold mb-3 block">
              Section Type
            </Label>
            <Select value={type} onValueChange={(v) => setType(v as ResumeSection["type"])}>
              <SelectTrigger className="border-2 border-foreground rounded-none h-12">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SECTION_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value} className="focus:bg-accent">
                    <div className="flex items-center gap-2">
                      <span>{t.icon}</span>
                      <span className="font-bold">{t.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Title Section */}
          <div className="p-6 border-b border-border space-y-4">
            <div>
              <Label className="text-sm uppercase tracking-wider font-bold mb-2 block">
                Title (Vietnamese) <span className="text-destructive">*</span>
              </Label>
              <Input
                value={titleVi}
                onChange={(e) => setTitleVi(e.target.value)}
                placeholder="Enter title in Vietnamese"
                required
                className="border-2 border-foreground rounded-none h-12 font-mono"
              />
            </div>
            <div>
              <Label className="text-sm uppercase tracking-wider font-bold mb-2 block">
                Title (English)
              </Label>
              <Input
                value={titleEn}
                onChange={(e) => setTitleEn(e.target.value)}
                placeholder="Enter title in English"
                className="border-2 border-foreground rounded-none h-12 font-mono"
              />
            </div>
          </div>

          {/* Type-specific content */}
          <div className="p-6 space-y-6">
            {/* HIGHLIGHT: List of strings */}
            {type === "highlight" && (
              <div className="space-y-4">
                <Label className="text-sm uppercase tracking-wider font-bold block">
                  💫 Highlight Items
                </Label>
                <div className="flex gap-2">
                  <Input
                    value={newHighlightItem}
                    onChange={(e) => setNewHighlightItem(e.target.value)}
                    placeholder="Add a highlight..."
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addHighlightItem();
                      }
                    }}
                    className="border-2 border-foreground rounded-none h-12 font-mono flex-1"
                  />
                  <Button type="button" onClick={addHighlightItem} className="brutal-btn">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="space-y-2">
                  {highlightItems.map((item, index) => (
                    <div key={index} className="flex items-center gap-2 p-3 border-2 border-foreground/20 bg-accent/5">
                      <span className="flex-1 font-mono text-sm">{item}</span>
                      <Button type="button" variant="ghost" size="icon" onClick={() => removeHighlightItem(index)}>
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* EXPERIENCE: List of experience items */}
            {type === "experience" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-sm uppercase tracking-wider font-bold">💼 Work Experience</Label>
                  <Button type="button" onClick={addExperience} variant="outline" size="sm">
                    <Plus className="w-4 h-4 mr-1" /> Add Experience
                  </Button>
                </div>
                {experiences.map((exp, index) => (
                  <div key={index} className="border-2 border-foreground/20 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold">Experience #{index + 1}</span>
                      <Button type="button" variant="ghost" size="icon" onClick={() => removeExperience(index)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                    <Input value={exp.title} onChange={(e) => updateExperience(index, "title", e.target.value)} placeholder="Job Title" className="border-2 border-foreground rounded-none" />
                    <Input value={exp.company} onChange={(e) => updateExperience(index, "company", e.target.value)} placeholder="Company Name" className="border-2 border-foreground rounded-none" />
                    <div className="grid grid-cols-2 gap-2">
                      <Input value={exp.period} onChange={(e) => updateExperience(index, "period", e.target.value)} placeholder="Period (e.g., Jul 2025 - Present)" className="border-2 border-foreground rounded-none" />
                      <Input value={exp.location} onChange={(e) => updateExperience(index, "location", e.target.value)} placeholder="Location" className="border-2 border-foreground rounded-none" />
                    </div>
                    <MarkdownEditor value={exp.description} onChange={(v) => updateExperience(index, "description", v)} placeholder="Job description..." height={100} />
                  </div>
                ))}
              </div>
            )}

            {/* EDUCATION: List of education items */}
            {type === "education" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-sm uppercase tracking-wider font-bold">🎓 Education</Label>
                  <Button type="button" onClick={addEducation} variant="outline" size="sm">
                    <Plus className="w-4 h-4 mr-1" /> Add Education
                  </Button>
                </div>
                {educationItems.map((edu, index) => (
                  <div key={index} className="border-2 border-foreground/20 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold">Education #{index + 1}</span>
                      <Button type="button" variant="ghost" size="icon" onClick={() => removeEducation(index)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                    <Input value={edu.degree} onChange={(e) => updateEducation(index, "degree", e.target.value)} placeholder="Degree / Field of Study" className="border-2 border-foreground rounded-none" />
                    <Input value={edu.school} onChange={(e) => updateEducation(index, "school", e.target.value)} placeholder="School / University" className="border-2 border-foreground rounded-none" />
                    <div className="grid grid-cols-2 gap-2">
                      <Input value={edu.period} onChange={(e) => updateEducation(index, "period", e.target.value)} placeholder="Period (e.g., 2021 - 2025)" className="border-2 border-foreground rounded-none" />
                      <Input value={edu.location} onChange={(e) => updateEducation(index, "location", e.target.value)} placeholder="Location" className="border-2 border-foreground rounded-none" />
                    </div>
                    <MarkdownEditor value={edu.description} onChange={(v) => updateEducation(index, "description", v)} placeholder="Description..." height={80} />
                  </div>
                ))}
              </div>
            )}

            {/* SKILL: List of skill categories */}
            {type === "skill" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-sm uppercase tracking-wider font-bold">⚡ Skill Categories</Label>
                  <Button type="button" onClick={addSkillCategory} variant="outline" size="sm">
                    <Plus className="w-4 h-4 mr-1" /> Add Category
                  </Button>
                </div>
                {skillCategories.map((cat, catIndex) => (
                  <div key={catIndex} className="border-2 border-foreground/20 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <Input value={cat.name} onChange={(e) => updateSkillCategoryName(catIndex, e.target.value)} placeholder="Category Name (e.g., Languages)" className="border-2 border-foreground rounded-none flex-1 mr-2" />
                      <Button type="button" variant="ghost" size="icon" onClick={() => removeSkillCategory(catIndex)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {cat.skills.map((skill, skillIndex) => (
                        <Badge key={skillIndex} variant="secondary" className="gap-1">
                          {skill}
                          <button type="button" onClick={() => removeSkillFromCategory(catIndex, skillIndex)}>
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                    <SkillInput onAdd={(skill) => addSkillToCategory(catIndex, skill)} />
                  </div>
                ))}
              </div>
            )}

            {/* CERTIFICATION: List of certifications */}
            {type === "certification" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-sm uppercase tracking-wider font-bold">🏆 Certifications & Awards</Label>
                  <Button type="button" onClick={addCertification} variant="outline" size="sm">
                    <Plus className="w-4 h-4 mr-1" /> Add Certification
                  </Button>
                </div>
                {certifications.map((cert, index) => (
                  <div key={index} className="border-2 border-foreground/20 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold">Certification #{index + 1}</span>
                      <Button type="button" variant="ghost" size="icon" onClick={() => removeCertification(index)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                    <Input value={cert.name} onChange={(e) => updateCertification(index, "name", e.target.value)} placeholder="Certification Name" className="border-2 border-foreground rounded-none" />
                    <div className="grid grid-cols-2 gap-2">
                      <Input value={cert.issuer} onChange={(e) => updateCertification(index, "issuer", e.target.value)} placeholder="Issuer" className="border-2 border-foreground rounded-none" />
                      <Input value={cert.year} onChange={(e) => updateCertification(index, "year", e.target.value)} placeholder="Year" className="border-2 border-foreground rounded-none" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* PROJECT: List of projects */}
            {type === "project" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-sm uppercase tracking-wider font-bold">🚀 Projects</Label>
                  <Button type="button" onClick={addProject} variant="outline" size="sm">
                    <Plus className="w-4 h-4 mr-1" /> Add Project
                  </Button>
                </div>
                {projects.map((proj, index) => (
                  <div key={index} className="border-2 border-foreground/20 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold">Project #{index + 1}</span>
                      <Button type="button" variant="ghost" size="icon" onClick={() => removeProject(index)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                    <Input value={proj.name} onChange={(e) => updateProject(index, "name", e.target.value)} placeholder="Project Name" className="border-2 border-foreground rounded-none" />
                    <MarkdownEditor value={proj.description} onChange={(v) => updateProject(index, "description", v)} placeholder="Project description..." height={80} />
                    <div>
                      <Label className="text-xs uppercase tracking-wider mb-2 block">Tech Stack</Label>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {proj.tech.map((tech, techIndex) => (
                          <Badge key={techIndex} variant="secondary" className="gap-1">
                            {tech}
                            <button type="button" onClick={() => removeTechFromProject(index, techIndex)}>
                              <X className="w-3 h-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                      <TechInput onAdd={(tech) => addTechToProject(index, tech)} />
                    </div>
                    <Input value={proj.url} onChange={(e) => updateProject(index, "url", e.target.value)} placeholder="Project URL" className="border-2 border-foreground rounded-none" />
                  </div>
                ))}
              </div>
            )}

            {/* WRITING */}
            {type === "writing" && (
              <div className="space-y-4">
                <div className="brutal-box p-6 bg-orange-50/50 dark:bg-orange-950/20">
                  <Label className="text-sm uppercase tracking-wider font-bold mb-3 block flex items-center gap-2">
                    <span className="text-2xl">📰</span> Article Title
                  </Label>
                  <Input value={articleTitle} onChange={(e) => setArticleTitle(e.target.value)} placeholder="Your Article Title" className="border-2 border-foreground rounded-none h-14 font-mono text-lg" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm uppercase tracking-wider font-bold mb-2 block">Publisher</Label>
                    <Input value={publisher} onChange={(e) => setPublisher(e.target.value)} placeholder="Tech Blog, Magazine..." className="border-2 border-foreground rounded-none h-12 font-mono" />
                  </div>
                  <div>
                    <Label className="text-sm uppercase tracking-wider font-bold mb-2 block">📅 Published</Label>
                    <Input type="date" value={articleDate} onChange={(e) => setArticleDate(e.target.value)} className="border-2 border-foreground rounded-none h-12 font-mono" />
                  </div>
                </div>
                <div>
                  <Label className="text-xs uppercase tracking-wider font-bold mb-2 block">🔗 Article Link</Label>
                  <Input type="url" value={articleUrl} onChange={(e) => setArticleUrl(e.target.value)} placeholder="https://..." className="border-2 border-foreground rounded-none h-12 font-mono" />
                </div>
              </div>
            )}

            {/* SPEAKING */}
            {type === "speaking" && (
              <div className="space-y-4">
                <div className="brutal-box p-6 bg-pink-50/50 dark:bg-pink-950/20">
                  <Label className="text-sm uppercase tracking-wider font-bold mb-3 block flex items-center gap-2">
                    <span className="text-2xl">🎤</span> Talk Title
                  </Label>
                  <Input value={articleTitle} onChange={(e) => setArticleTitle(e.target.value)} placeholder="Your Talk Title" className="border-2 border-foreground rounded-none h-14 font-mono text-lg" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm uppercase tracking-wider font-bold mb-2 block">Event / Conference</Label>
                    <Input value={publisher} onChange={(e) => setPublisher(e.target.value)} placeholder="Conference Name, Event..." className="border-2 border-foreground rounded-none h-12 font-mono" />
                  </div>
                  <div>
                    <Label className="text-sm uppercase tracking-wider font-bold mb-2 block">📅 Date</Label>
                    <Input type="date" value={articleDate} onChange={(e) => setArticleDate(e.target.value)} className="border-2 border-foreground rounded-none h-12 font-mono" />
                  </div>
                </div>
                <div>
                  <Label className="text-xs uppercase tracking-wider font-bold mb-2 block">🔗 Recording / Slides</Label>
                  <Input type="url" value={articleUrl} onChange={(e) => setArticleUrl(e.target.value)} placeholder="https://youtube.com/..." className="border-2 border-foreground rounded-none h-12 font-mono" />
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <DialogFooter className="border-t-2 border-foreground p-6 gap-3">
            <Button type="button" variant="ghost" onClick={handleClose} className="brutal-btn-sm">
              CANCEL
            </Button>
            <Button type="submit" className="brutal-btn">
              {section ? "SAVE CHANGES" : "ADD SECTION"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Helper component for skill input
function SkillInput({ onAdd }: { onAdd: (skill: string) => void }) {
  const [value, setValue] = useState("");
  return (
    <div className="flex gap-2">
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Add skill..."
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            onAdd(value);
            setValue("");
          }
        }}
        className="border-2 border-foreground rounded-none flex-1"
      />
      <Button type="button" variant="outline" onClick={() => { onAdd(value); setValue(""); }}>
        Add
      </Button>
    </div>
  );
}

// Helper component for tech input
function TechInput({ onAdd }: { onAdd: (tech: string) => void }) {
  const [value, setValue] = useState("");
  return (
    <div className="flex gap-2">
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Add technology..."
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            onAdd(value);
            setValue("");
          }
        }}
        className="border-2 border-foreground rounded-none flex-1"
      />
      <Button type="button" variant="outline" onClick={() => { onAdd(value); setValue(""); }}>
        Add
      </Button>
    </div>
  );
}

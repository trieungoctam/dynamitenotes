/**
 * ResumeSectionEditModal - Modal for editing resume sections
 * Brutalist design with sharp borders, bold typography, and high contrast
 * Supports 5 section types: highlight, experience, project, writing, speaking
 */

import { useState, useEffect, FormEvent, useRef } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X, Plus } from "lucide-react";
import { MarkdownEditor } from "./MarkdownEditor";
import type { ResumeSection } from "@/hooks/use-admin-resume";

interface ResumeSectionEditModalProps {
  section?: ResumeSection;
  open: boolean;
  onClose: () => void;
  onSave: (data: Omit<ResumeSection, "id" | "created_at" | "updated_at">) => void;
}

type HighlightContent = {
  number?: string;
  label_vi?: string;
  label_en?: string;
};

type ExperienceContent = {
  company?: string;
  role_vi?: string;
  role_en?: string;
  start_date?: string;
  end_date?: string;
  location?: string;
  description_vi?: string;
  description_en?: string;
  link?: string;
};

type ProjectContent = {
  title?: string;
  description_vi?: string;
  description_en?: string;
  tech_stack?: string[];
  demo_url?: string;
  github_url?: string;
};

type WritingContent = {
  title?: string;
  publisher?: string;
  date?: string;
  url?: string;
};

type SpeakingContent = {
  title?: string;
  publisher?: string;
  date?: string;
  url?: string;
};

const SECTION_TYPES = [
  { value: "highlight", label: "Highlight", color: "bg-blue-500", borderColor: "border-blue-500" },
  { value: "experience", label: "Experience", color: "bg-green-500", borderColor: "border-green-500" },
  { value: "project", label: "Project", color: "bg-purple-500", borderColor: "border-purple-500" },
  { value: "writing", label: "Writing", color: "bg-orange-500", borderColor: "border-orange-500" },
  { value: "speaking", label: "Speaking", color: "bg-pink-500", borderColor: "border-pink-500" },
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

  // Highlight content
  const [highlightNumber, setHighlightNumber] = useState("");
  const [highlightLabelVi, setHighlightLabelVi] = useState("");
  const [highlightLabelEn, setHighlightLabelEn] = useState("");

  // Experience content
  const [company, setCompany] = useState("");
  const [roleVi, setRoleVi] = useState("");
  const [roleEn, setRoleEn] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [location, setLocation] = useState("");
  const [descriptionVi, setDescriptionVi] = useState("");
  const [descriptionEn, setDescriptionEn] = useState("");
  const [link, setLink] = useState("");

  // Project content
  const [projectTitle, setProjectTitle] = useState("");
  const [projectDescVi, setProjectDescVi] = useState("");
  const [projectDescEn, setProjectDescEn] = useState("");
  const [techStack, setTechStack] = useState<string[]>([]);
  const [techInput, setTechInput] = useState("");
  const [demoUrl, setDemoUrl] = useState("");
  const [githubUrl, setGithubUrl] = useState("");

  // Writing/Speaking content
  const [articleTitle, setArticleTitle] = useState("");
  const [publisher, setPublisher] = useState("");
  const [articleDate, setArticleDate] = useState("");
  const [articleUrl, setArticleUrl] = useState("");

  useEffect(() => {
    if (section) {
      // Editing existing section - load data
      isLoadingSection.current = true;
      setType(section.type);
      setTitleVi(section.title_vi);
      setTitleEn(section.title_en || "");

      const content = section.content;

      if (section.type === "highlight") {
        setHighlightNumber((content as HighlightContent).number || "");
        setHighlightLabelVi((content as HighlightContent).label_vi || "");
        setHighlightLabelEn((content as HighlightContent).label_en || "");
      } else if (section.type === "experience") {
        setCompany((content as ExperienceContent).company || "");
        setRoleVi((content as ExperienceContent).role_vi || "");
        setRoleEn((content as ExperienceContent).role_en || "");
        setStartDate((content as ExperienceContent).start_date || "");
        setEndDate((content as ExperienceContent).end_date || "");
        setLocation((content as ExperienceContent).location || "");
        setDescriptionVi((content as ExperienceContent).description_vi || "");
        setDescriptionEn((content as ExperienceContent).description_en || "");
        setLink((content as ExperienceContent).link || "");
      } else if (section.type === "project") {
        setProjectTitle((content as ProjectContent).title || "");
        setProjectDescVi((content as ProjectContent).description_vi || "");
        setProjectDescEn((content as ProjectContent).description_en || "");
        setTechStack((content as ProjectContent).tech_stack || []);
        setDemoUrl((content as ProjectContent).demo_url || "");
        setGithubUrl((content as ProjectContent).github_url || "");
      } else if (section.type === "writing" || section.type === "speaking") {
        setArticleTitle((content as WritingContent).title || "");
        setPublisher((content as WritingContent).publisher || "");
        setArticleDate((content as WritingContent).date || "");
        setArticleUrl((content as WritingContent).url || "");
      }
      // Reset loading flag after state updates
      setTimeout(() => { isLoadingSection.current = false; }, 0);
    } else if (previousSectionId.current) {
      // Switching from edit to add - reset form
      resetForm();
    }
    // Track current section for next comparison
    previousSectionId.current = section?.id;
    // Don't reset when section is undefined and no previous section
  }, [section]);

  // Track last selected type (for new sections)
  useEffect(() => {
    if (!isLoadingSection.current) {
      lastSelectedType.current = type;
    }
  }, [type]);

  // Clear type-specific fields when switching types (both new and edit)
  useEffect(() => {
    // Skip if loading section data (don't clear fields we just loaded)
    if (isLoadingSection.current) return;

    // Clear all type-specific fields when switching types
    setHighlightNumber("");
    setHighlightLabelVi("");
    setHighlightLabelEn("");
    setCompany("");
    setRoleVi("");
    setRoleEn("");
    setStartDate("");
    setEndDate("");
    setLocation("");
    setDescriptionVi("");
    setDescriptionEn("");
    setLink("");
    setProjectTitle("");
    setProjectDescVi("");
    setProjectDescEn("");
    setTechStack([]);
    setTechInput("");
    setDemoUrl("");
    setGithubUrl("");
    setArticleTitle("");
    setPublisher("");
    setArticleDate("");
    setArticleUrl("");
  }, [type]);

  const resetForm = () => {
    setType(lastSelectedType.current);
    setTitleVi("");
    setTitleEn("");
    setHighlightNumber("");
    setHighlightLabelVi("");
    setHighlightLabelEn("");
    setCompany("");
    setRoleVi("");
    setRoleEn("");
    setStartDate("");
    setEndDate("");
    setLocation("");
    setDescriptionVi("");
    setDescriptionEn("");
    setLink("");
    setProjectTitle("");
    setProjectDescVi("");
    setProjectDescEn("");
    setTechStack([]);
    setTechInput("");
    setDemoUrl("");
    setGithubUrl("");
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
      content = {
        number: highlightNumber,
        label_vi: highlightLabelVi,
        label_en: highlightLabelEn,
      };
    } else if (type === "experience") {
      content = {
        company,
        role_vi: roleVi,
        role_en: roleEn,
        start_date: startDate,
        end_date: endDate,
        location,
        description_vi: descriptionVi,
        description_en: descriptionEn,
        link,
      };
    } else if (type === "project") {
      content = {
        title: projectTitle,
        description_vi: projectDescVi,
        description_en: projectDescEn,
        tech_stack: techStack,
        demo_url: demoUrl,
        github_url: githubUrl,
      };
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

  const addTechStack = () => {
    if (techInput && !techStack.includes(techInput)) {
      setTechStack([...techStack, techInput]);
      setTechInput("");
    }
  };

  const removeTechStack = (item: string) => {
    setTechStack(techStack.filter((t) => t !== item));
  };

  const currentType = SECTION_TYPES.find((t) => t.value === type);

  return (
    <Dialog open={open} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto border-2 border-foreground rounded-none p-0" onEscapeKeyDown={handleClose} onPointerDownOutside={handleClose}>
        {/* Brutalist Header */}
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
                        <div className={`w-3 h-3 ${t.color}`} />
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

          {/* Type-specific content - unique design per type */}
          <div className="p-6 space-y-6">
            {type === "highlight" && (
              <div className="space-y-6 animate-in">
                {/* Highlight: Big number focused design */}
                <div className="brutal-box p-6 text-center bg-accent/5">
                  <Label className="text-xs uppercase tracking-wider font-bold mb-4 block text-muted-foreground">
                    Your Number / Stat
                  </Label>
                  <Input
                    value={highlightNumber}
                    onChange={(e) => setHighlightNumber(e.target.value)}
                    placeholder="5+"
                    className="border-2 border-foreground rounded-none h-20 font-mono text-5xl text-center font-bold"
                  />
                </div>

                <div className="space-y-4">
                  <Label className="text-sm uppercase tracking-wider font-bold block">
                    Description
                  </Label>
                  <Tabs defaultValue="vi" className="brutal-box-sm p-0">
                    <TabsList className="h-auto border-b-2 border-foreground rounded-none p-0 bg-transparent">
                      <TabsTrigger value="vi" className="border-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-foreground data-[state=active]:text-background rounded-none px-6 py-3 font-bold uppercase text-sm">
                        🇻🇳 Vietnamese
                      </TabsTrigger>
                      <TabsTrigger value="en" className="border-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-foreground data-[state=active]:text-background rounded-none px-6 py-3 font-bold uppercase text-sm">
                        🇬🇧 English
                      </TabsTrigger>
                    </TabsList>
                    <TabsContent value="vi" className="p-4">
                      <Input
                        value={highlightLabelVi}
                        onChange={(e) => setHighlightLabelVi(e.target.value)}
                        placeholder="Nhãn cho số liệu..."
                        className="border-2 border-foreground rounded-none h-12 font-mono"
                      />
                    </TabsContent>
                    <TabsContent value="en" className="p-4">
                      <Input
                        value={highlightLabelEn}
                        onChange={(e) => setHighlightLabelEn(e.target.value)}
                        placeholder="Label for the stat..."
                        className="border-2 border-foreground rounded-none h-12 font-mono"
                      />
                    </TabsContent>
                  </Tabs>
                </div>
              </div>
            )}

            {type === "experience" && (
              <div className="space-y-6 animate-in">
                {/* Experience: Timeline/career focused design */}
                <div className="brutal-box p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-1 h-8 bg-green-500" />
                    <Label className="text-lg uppercase tracking-wider font-bold">
                      Company & Role
                    </Label>
                  </div>
                  <div className="space-y-3">
                    <Input
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      placeholder="Company Name"
                      className="border-2 border-foreground rounded-none h-12 font-mono text-lg"
                    />
                    <Tabs defaultValue="vi" className="brutal-box-sm p-0">
                      <TabsList className="h-auto border-b-2 border-foreground rounded-none p-0 bg-transparent">
                        <TabsTrigger value="vi" className="border-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-foreground data-[state=active]:text-background rounded-none px-6 py-3 font-bold uppercase text-sm">
                          🇻🇳 Vietnamese
                        </TabsTrigger>
                        <TabsTrigger value="en" className="border-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-foreground data-[state=active]:text-background rounded-none px-6 py-3 font-bold uppercase text-sm">
                          🇬🇧 English
                        </TabsTrigger>
                      </TabsList>
                      <TabsContent value="vi" className="p-4">
                        <Input
                          value={roleVi}
                          onChange={(e) => setRoleVi(e.target.value)}
                          placeholder="Chức danh..."
                          className="border-2 border-foreground rounded-none h-12 font-mono"
                        />
                      </TabsContent>
                      <TabsContent value="en" className="p-4">
                        <Input
                          value={roleEn}
                          onChange={(e) => setRoleEn(e.target.value)}
                          placeholder="Job Title..."
                          className="border-2 border-foreground rounded-none h-12 font-mono"
                        />
                      </TabsContent>
                    </Tabs>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-xs uppercase tracking-wider font-bold mb-2 block text-muted-foreground">
                      📅 Start
                    </Label>
                    <Input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="border-2 border-foreground rounded-none h-12 font-mono"
                    />
                  </div>
                  <div>
                    <Label className="text-xs uppercase tracking-wider font-bold mb-2 block text-muted-foreground">
                      📅 End
                    </Label>
                    <Input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="border-2 border-foreground rounded-none h-12 font-mono"
                    />
                  </div>
                  <div>
                    <Label className="text-xs uppercase tracking-wider font-bold mb-2 block text-muted-foreground">
                      📍 Location
                    </Label>
                    <Input
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="City, Country"
                      className="border-2 border-foreground rounded-none h-12 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-sm uppercase tracking-wider font-bold mb-3 block">
                    Description
                  </Label>
                  <Tabs defaultValue="vi" className="brutal-box-sm p-0">
                    <TabsList className="h-auto border-b-2 border-foreground rounded-none p-0 bg-transparent">
                      <TabsTrigger value="vi" className="border-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-foreground data-[state=active]:text-background rounded-none px-6 py-3 font-bold uppercase text-sm">
                        Vietnamese
                      </TabsTrigger>
                      <TabsTrigger value="en" className="border-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-foreground data-[state=active]:text-background rounded-none px-6 py-3 font-bold uppercase text-sm">
                        English
                      </TabsTrigger>
                    </TabsList>
                    <TabsContent value="vi" className="p-4">
                      <MarkdownEditor
                        value={descriptionVi}
                        onChange={setDescriptionVi}
                        placeholder="Job description in Vietnamese..."
                        height={150}
                      />
                    </TabsContent>
                    <TabsContent value="en" className="p-4">
                      <MarkdownEditor
                        value={descriptionEn}
                        onChange={setDescriptionEn}
                        placeholder="Job description in English..."
                        height={150}
                      />
                    </TabsContent>
                  </Tabs>
                </div>

                <div>
                  <Label className="text-sm uppercase tracking-wider font-bold mb-2 block">
                    Link
                  </Label>
                  <Input
                    type="url"
                    value={link}
                    onChange={(e) => setLink(e.target.value)}
                    placeholder="https://..."
                    className="border-2 border-foreground rounded-none h-12 font-mono"
                  />
                </div>
              </div>
            )}

            {type === "project" && (
              <div className="space-y-6 animate-in">
                {/* Project: Code-focused design with tech stack */}
                <div className="brutal-box p-6 bg-purple-50/50 dark:bg-purple-950/20">
                  <Label className="text-sm uppercase tracking-wider font-bold mb-3 block flex items-center gap-2">
                    <span className="text-2xl">💻</span> Project Name
                  </Label>
                  <Input
                    value={projectTitle}
                    onChange={(e) => setProjectTitle(e.target.value)}
                    placeholder="My Awesome Project"
                    className="border-2 border-foreground rounded-none h-14 font-mono text-lg"
                  />
                </div>

                <div>
                  <Label className="text-sm uppercase tracking-wider font-bold mb-3 block">
                    📝 Description
                  </Label>
                  <Tabs defaultValue="vi" className="brutal-box-sm p-0">
                    <TabsList className="h-auto border-b-2 border-foreground rounded-none p-0 bg-transparent">
                      <TabsTrigger value="vi" className="border-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-foreground data-[state=active]:text-background rounded-none px-6 py-3 font-bold uppercase text-sm">
                        🇻🇳 Vietnamese
                      </TabsTrigger>
                      <TabsTrigger value="en" className="border-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-foreground data-[state=active]:text-background rounded-none px-6 py-3 font-bold uppercase text-sm">
                        🇬🇧 English
                      </TabsTrigger>
                    </TabsList>
                    <TabsContent value="vi" className="p-4">
                      <MarkdownEditor
                        value={projectDescVi}
                        onChange={setProjectDescVi}
                        placeholder="Mô tả dự án..."
                        height={150}
                      />
                    </TabsContent>
                    <TabsContent value="en" className="p-4">
                      <MarkdownEditor
                        value={projectDescEn}
                        onChange={setProjectDescEn}
                        placeholder="Project description..."
                        height={150}
                      />
                    </TabsContent>
                  </Tabs>
                </div>

                <div>
                  <Label className="text-sm uppercase tracking-wider font-bold mb-3 block flex items-center gap-2">
                    <span className="text-xl">⚡</span> Tech Stack
                  </Label>
                  <div className="brutal-box p-4 bg-muted/30">
                    <div className="flex gap-2 mb-4">
                      <Input
                        value={techInput}
                        onChange={(e) => setTechInput(e.target.value)}
                        placeholder="React, TypeScript, Node.js..."
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addTechStack();
                          }
                        }}
                        className="border-2 border-foreground rounded-none h-12 font-mono flex-1"
                      />
                      <Button
                        type="button"
                        onClick={addTechStack}
                        className="brutal-btn rounded-none"
                      >
                        ADD
                      </Button>
                    </div>
                    {techStack.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {techStack.map((tech) => (
                          <Badge
                            key={tech}
                            variant="secondary"
                            className="border-2 border-purple-500 bg-purple-100 dark:bg-purple-900/30 text-purple-900 dark:text-purple-100 rounded-none px-3 py-2 font-mono text-sm gap-2 hover:bg-purple-200 dark:hover:bg-purple-800 transition-colors"
                          >
                            {tech}
                            <button
                              type="button"
                              onClick={() => removeTechStack(tech)}
                              className="hover:text-red-600 dark:hover:text-red-400"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="brutal-box-sm p-4">
                    <Label className="text-xs uppercase tracking-wider font-bold mb-2 block flex items-center gap-2 text-muted-foreground">
                      🔗 Demo
                    </Label>
                    <Input
                      type="url"
                      value={demoUrl}
                      onChange={(e) => setDemoUrl(e.target.value)}
                      placeholder="https://demo.project.com"
                      className="border-2 border-foreground rounded-none h-12 font-mono"
                    />
                  </div>
                  <div className="brutal-box-sm p-4">
                    <Label className="text-xs uppercase tracking-wider font-bold mb-2 block flex items-center gap-2 text-muted-foreground">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.746.162-.386.232-.083.577 1.05 1.123 1.89 2.027 1.89 2.027 1.089 0 1.938-.589 2.222-1.043.26-.429.506-1.055.588-1.678.085-.672.428-1.027.862-1.027.567 0 1.043.435 1.043 1.043.835 0 1.662-.693 1.926-1.481.26-.79.518-1.736.518-1.736 0-.329.14-.676.379-.984.482-.692 1.069-1.481 2.278-1.481.926 0 1.672.646 1.672 1.444 0 2.598-1.402 2.598-3.122v-.483c0-.316-.17-.577-.408-.727l-1.958-1.194c-.501-.307-.862-.543-.862-1.326 0-2.076 1.321-2.763 2.32-2.763 1.321 0 2.541.852 2.541 2.541 0 1.176-.598 1.853-1.393l.769-1.055c.26-.347.503-.697.742-1.049.526-.783.983-1.568 1.549-2.417 2.649-4.095 5.777-4.095 10.449 0 14.446 9.623 14.446 14.446 0 4.823-9.623 14.446-14.446 14.446z"/>
                      </svg>
                      GitHub
                    </Label>
                    <Input
                      type="url"
                      value={githubUrl}
                      onChange={(e) => setGithubUrl(e.target.value)}
                      placeholder="https://github.com/user/repo"
                      className="border-2 border-foreground rounded-none h-12 font-mono"
                    />
                  </div>
                </div>
              </div>
            )}

            {type === "writing" && (
              <div className="space-y-6 animate-in">
                {/* Writing: Publication/article focused design */}
                <div className="brutal-box p-6 bg-orange-50/50 dark:bg-orange-950/20">
                  <Label className="text-sm uppercase tracking-wider font-bold mb-3 block flex items-center gap-2">
                    <span className="text-2xl">📰</span> Article Title
                  </Label>
                  <Input
                    value={articleTitle}
                    onChange={(e) => setArticleTitle(e.target.value)}
                    placeholder="Your Article Title"
                    className="border-2 border-foreground rounded-none h-14 font-mono text-lg"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm uppercase tracking-wider font-bold mb-2 block">
                      Publisher
                    </Label>
                    <Input
                      value={publisher}
                      onChange={(e) => setPublisher(e.target.value)}
                      placeholder="Tech Blog, Magazine..."
                      className="border-2 border-foreground rounded-none h-12 font-mono"
                    />
                  </div>
                  <div>
                    <Label className="text-sm uppercase tracking-wider font-bold mb-2 block flex items-center gap-2">
                      📅 Published
                    </Label>
                    <Input
                      type="date"
                      value={articleDate}
                      onChange={(e) => setArticleDate(e.target.value)}
                      className="border-2 border-foreground rounded-none h-12 font-mono"
                    />
                  </div>
                </div>

                <div className="brutal-box p-4">
                  <Label className="text-xs uppercase tracking-wider font-bold mb-2 block flex items-center gap-2 text-muted-foreground">
                    🔗 Article Link
                  </Label>
                  <Input
                    type="url"
                    value={articleUrl}
                    onChange={(e) => setArticleUrl(e.target.value)}
                    placeholder="https://..."
                    className="border-2 border-foreground rounded-none h-12 font-mono"
                  />
                </div>
              </div>
            )}

            {type === "speaking" && (
              <div className="space-y-6 animate-in">
                {/* Speaking: Event/talk focused design */}
                <div className="brutal-box p-6 bg-pink-50/50 dark:bg-pink-950/20">
                  <Label className="text-sm uppercase tracking-wider font-bold mb-3 block flex items-center gap-2">
                    <span className="text-2xl">🎤</span> Talk Title
                  </Label>
                  <Input
                    value={articleTitle}
                    onChange={(e) => setArticleTitle(e.target.value)}
                    placeholder="Your Talk Title"
                    className="border-2 border-foreground rounded-none h-14 font-mono text-lg"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm uppercase tracking-wider font-bold mb-2 block">
                      Event / Conference
                    </Label>
                    <Input
                      value={publisher}
                      onChange={(e) => setPublisher(e.target.value)}
                      placeholder="Conference Name, Event..."
                      className="border-2 border-foreground rounded-none h-12 font-mono"
                    />
                  </div>
                  <div>
                    <Label className="text-sm uppercase tracking-wider font-bold mb-2 block flex items-center gap-2">
                      📅 Date
                    </Label>
                    <Input
                      type="date"
                      value={articleDate}
                      onChange={(e) => setArticleDate(e.target.value)}
                      className="border-2 border-foreground rounded-none h-12 font-mono"
                    />
                  </div>
                </div>

                <div className="brutal-box p-4">
                  <Label className="text-xs uppercase tracking-wider font-bold mb-2 block flex items-center gap-2 text-muted-foreground">
                    🔗 Recording / Slides
                  </Label>
                  <Input
                    type="url"
                    value={articleUrl}
                    onChange={(e) => setArticleUrl(e.target.value)}
                    placeholder="https://youtube.com/..."
                    className="border-2 border-foreground rounded-none h-12 font-mono"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Brutalist Footer */}
          <DialogFooter className="border-t-2 border-foreground p-6 gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={handleClose}
              className="brutal-btn-sm"
            >
              CANCEL
            </Button>
            <Button
              type="submit"
              className="brutal-btn"
            >
              {section ? "SAVE CHANGES" : "ADD SECTION"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

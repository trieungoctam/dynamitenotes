/**
 * Resume Page - Harvard Business School Style
 * =============================================
 * Clean, professional resume layout inspired by HBS format:
 * - Centered name header with prominent display typography
 * - Contact info in horizontal line below name
 * - Section headers with horizontal rules
 * - Right-aligned dates
 * - Professional spacing and hierarchy
 * - Pure black & white brutalist aesthetic
 *
 * Supports 8 section types matching seed data:
 * highlight, experience, education, skill, certification, project, writing, speaking
 */

import { useResumeSections } from "@/hooks/use-resume";
import { useLanguage } from "@/contexts/LanguageContext";
import { MarkdownRenderer } from "@/components/content/MarkdownRenderer";
import { Mail, MapPin, ExternalLink, Github, Globe, Sparkles } from "lucide-react";

// Content types from seed data
type HighlightContent = { items: string[] };
type ExperienceItem = { title: string; company: string; period: string; description: string; location: string };
type ExperienceContent = { experiences: ExperienceItem[] };
type EducationItem = { degree: string; school: string; period: string; description: string; location: string };
type EducationContent = { education: EducationItem[] };
type SkillCategory = { name: string; skills: string[] };
type SkillContent = { categories: SkillCategory[] };
type CertificationItem = { name: string; issuer: string; year: string };
type CertificationContent = { certifications: CertificationItem[] };
type ProjectItem = { name: string; description: string; tech: string[]; url: string };
type ProjectContent = { projects: ProjectItem[] };
type WritingContent = { title?: string; publisher?: string; date?: string; url?: string };
type SpeakingContent = { title?: string; publisher?: string; date?: string; url?: string };

// Harvard-style Resume Header Component
function ResumeHeader() {
  return (
    <header className="text-center py-12 border-b-2 border-foreground">
      {/* Name - Centered, Display Font */}
      <h1 className="font-display text-5xl md:text-7xl lg:text-8xl leading-none mb-6">
        TRIỆU NGỌC TÂM
      </h1>

      {/* Contact Info - Horizontal Line */}
      <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 text-sm font-mono">
        <a href="mailto:ss.optimus2003@gmail.com" className="hover:underline flex items-center gap-2">
          <Mail className="w-4 h-4" />
          ss.optimus2003@gmail.com
        </a>
        <span className="hidden md:inline">•</span>
        <span className="flex items-center gap-2">
          <MapPin className="w-4 h-4" />
          Vietnam
        </span>
        <span className="hidden md:inline">•</span>
        <a href="https://github.com/trieungoctam" target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-2">
          <Github className="w-4 h-4" />
          github.com/trieungoctam
        </a>
        <span className="hidden md:inline">•</span>
        <a href="https://linkedin.com/in/trieungoctam" target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-2">
          <Globe className="w-4 h-4" />
          linkedin.com/in/trieungoctam
        </a>
      </div>
    </header>
  );
}

// Harvard-style Section Header
interface SectionHeaderProps {
  title: string;
}

function SectionHeader({ title }: SectionHeaderProps) {
  return (
    <div className="mb-6">
      <h2 className="font-display text-xl md:text-2xl uppercase tracking-wide border-b-2 border-foreground pb-2 mb-4">
        {title}
      </h2>
    </div>
  );
}

// Loading skeleton
function ResumeSkeleton() {
  return (
    <div className="animate-pulse space-y-8">
      <div className="h-32 bg-foreground/5 rounded" />
      <div className="space-y-4">
        <div className="h-6 w-32 bg-foreground/5 rounded" />
        <div className="h-20 bg-foreground/5 rounded" />
        <div className="h-20 bg-foreground/5 rounded" />
      </div>
    </div>
  );
}

export default function Resume() {
  const { data: sections, isLoading } = useResumeSections();
  const { lang } = useLanguage();

  const highlights = sections?.filter((s) => s.type === "highlight") || [];
  const experience = sections?.filter((s) => s.type === "experience") || [];
  const education = sections?.filter((s) => s.type === "education") || [];
  const skills = sections?.filter((s) => s.type === "skill") || [];
  const certifications = sections?.filter((s) => s.type === "certification") || [];
  const projects = sections?.filter((s) => s.type === "project") || [];
  const writing = sections?.filter((s) => s.type === "writing") || [];
  const speaking = sections?.filter((s) => s.type === "speaking") || [];

  // Text labels
  const highlightsTitle = lang === "vi" ? "ĐIỂM NỔI BẬT" : "HIGHLIGHTS";
  const experienceTitle = lang === "vi" ? "KINH NGHIỆM LÀM VIỆC" : "WORK EXPERIENCE";
  const educationTitle = lang === "vi" ? "HỌC VẤN" : "EDUCATION";
  const skillsTitle = lang === "vi" ? "KỸ NĂNG" : "SKILLS";
  const certificationsTitle = lang === "vi" ? "CHỨNG CHỈ & GIẢI THƯỞNG" : "CERTIFICATIONS & AWARDS";
  const projectsTitle = lang === "vi" ? "DỰ ÁN NỔI BẬT" : "FEATURED PROJECTS";
  const writingTitle = lang === "vi" ? "BÀI VIẾT" : "WRITING";
  const speakingTitle = lang === "vi" ? "DIỄN GIẢ" : "SPEAKING";
  const emptyMessage =
    lang === "vi"
      ? "Nội dung đang được cập nhật. Vui lòng quay lại sau!"
      : "Content coming soon. Check back later!";

  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Noise overlay */}
      <div className="fixed inset-0 bg-noise pointer-events-none z-50" />

      {/* Resume container - A4 proportioned */}
      <div className="max-w-4xl mx-auto bg-background">
        {/* Header */}
        <ResumeHeader />

        {/* Content */}
        <div className="px-6 md:px-12 py-10">
          {isLoading ? (
            <ResumeSkeleton />
          ) : sections && sections.length > 0 ? (
            <div className="space-y-10">
              {/* Highlights */}
              {highlights.length > 0 && (
                <section>
                  <SectionHeader title={highlightsTitle} />
                  {highlights.map((section) => {
                    const content = section.content as HighlightContent;
                    const items = content.items || [];
                    return (
                      <ul key={section.id} className="list-disc list-inside space-y-1 text-sm leading-relaxed">
                        {items.map((item, index) => (
                          <li key={index}>{item}</li>
                        ))}
                      </ul>
                    );
                  })}
                </section>
              )}

              {/* Experience */}
              {experience.length > 0 && (
                <section>
                  <SectionHeader title={experienceTitle} />
                  {experience.map((section) => {
                    const content = section.content as ExperienceContent;
                    const experiences = content.experiences || [];
                    return (
                      <div key={section.id} className="space-y-6">
                        {experiences.map((exp, index) => (
                          <div key={index} className="mb-6">
                            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-1 mb-1">
                              <div className="flex-1">
                                <h3 className="font-semibold text-base md:text-lg">{exp.company}</h3>
                                <p className="text-sm italic opacity-80">{exp.title}</p>
                              </div>
                              <div className="text-sm font-mono opacity-60 whitespace-nowrap">
                                {exp.period}
                              </div>
                            </div>
                            {exp.location && (
                              <p className="text-sm opacity-60 mb-2">{exp.location}</p>
                            )}
                            {exp.description && (
                              <div className="text-sm leading-relaxed opacity-80">
                                <MarkdownRenderer content={exp.description} />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </section>
              )}

              {/* Education */}
              {education.length > 0 && (
                <section>
                  <SectionHeader title={educationTitle} />
                  {education.map((section) => {
                    const content = section.content as EducationContent;
                    const educationItems = content.education || [];
                    return (
                      <div key={section.id} className="space-y-6">
                        {educationItems.map((edu, index) => (
                          <div key={index} className="mb-4">
                            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-1 mb-1">
                              <div className="flex-1">
                                <h3 className="font-semibold text-base md:text-lg">{edu.school}</h3>
                                <p className="text-sm italic opacity-80">{edu.degree}</p>
                              </div>
                              <div className="text-sm font-mono opacity-60 whitespace-nowrap">
                                {edu.period}
                              </div>
                            </div>
                            {edu.location && (
                              <p className="text-sm opacity-60 mb-2">{edu.location}</p>
                            )}
                            {edu.description && (
                              <div className="text-sm leading-relaxed opacity-80">
                                <MarkdownRenderer content={edu.description} />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </section>
              )}

              {/* Skills */}
              {skills.length > 0 && (
                <section>
                  <SectionHeader title={skillsTitle} />
                  {skills.map((section) => {
                    const content = section.content as SkillContent;
                    const categories = content.categories || [];
                    return (
                      <div key={section.id} className="space-y-4">
                        {categories.map((cat, catIndex) => (
                          <div key={catIndex} className="flex flex-col md:flex-row gap-2">
                            <span className="font-semibold text-sm min-w-[140px]">{cat.name}:</span>
                            <span className="text-sm opacity-80">{cat.skills.join(", ")}</span>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </section>
              )}

              {/* Certifications */}
              {certifications.length > 0 && (
                <section>
                  <SectionHeader title={certificationsTitle} />
                  {certifications.map((section) => {
                    const content = section.content as CertificationContent;
                    const certItems = content.certifications || [];
                    return (
                      <div key={section.id} className="space-y-2">
                        {certItems.map((cert, index) => (
                          <div key={index} className="flex flex-col md:flex-row md:items-start md:justify-between gap-1">
                            <div className="flex-1">
                              <span className="font-semibold text-sm">{cert.name}</span>
                              {cert.issuer && <span className="text-sm opacity-60"> — {cert.issuer}</span>}
                            </div>
                            <div className="text-sm font-mono opacity-60">{cert.year}</div>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </section>
              )}

              {/* Projects */}
              {projects.length > 0 && (
                <section>
                  <SectionHeader title={projectsTitle} />
                  {projects.map((section) => {
                    const content = section.content as ProjectContent;
                    const projectItems = content.projects || [];
                    return (
                      <div key={section.id} className="space-y-6">
                        {projectItems.map((proj, index) => (
                          <div key={index} className="mb-4">
                            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-1 mb-1">
                              <h3 className="font-semibold text-base md:text-lg">{proj.name}</h3>
                              {proj.url && (
                                <a
                                  href={proj.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm font-mono hover:underline flex items-center gap-1"
                                >
                                  <ExternalLink className="w-3 h-3" />
                                  Link
                                </a>
                              )}
                            </div>
                            {proj.tech && proj.tech.length > 0 && (
                              <p className="text-sm font-mono opacity-60 mb-2">
                                {proj.tech.join(" • ")}
                              </p>
                            )}
                            {proj.description && (
                              <div className="text-sm leading-relaxed opacity-80">
                                <MarkdownRenderer content={proj.description} />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </section>
              )}

              {/* Writing */}
              {writing.length > 0 && (
                <section>
                  <SectionHeader title={writingTitle} />
                  {writing.map((section) => {
                    const content = section.content as WritingContent;
                    return (
                      <div key={section.id} className="mb-4">
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-1">
                          <div className="flex-1">
                            <h3 className="font-semibold text-base">{content.title}</h3>
                            {content.publisher && (
                              <p className="text-sm italic opacity-80">{content.publisher}</p>
                            )}
                          </div>
                          <div className="text-sm font-mono opacity-60">{content.date}</div>
                        </div>
                        {content.url && (
                          <a
                            href={content.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-sm hover:underline mt-1"
                          >
                            <ExternalLink className="w-3 h-3" />
                            Link
                          </a>
                        )}
                      </div>
                    );
                  })}
                </section>
              )}

              {/* Speaking */}
              {speaking.length > 0 && (
                <section>
                  <SectionHeader title={speakingTitle} />
                  {speaking.map((section) => {
                    const content = section.content as SpeakingContent;
                    return (
                      <div key={section.id} className="mb-4">
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-1">
                          <div className="flex-1">
                            <h3 className="font-semibold text-base">{content.title}</h3>
                            {content.publisher && (
                              <p className="text-sm italic opacity-80">{content.publisher}</p>
                            )}
                          </div>
                          <div className="text-sm font-mono opacity-60">{content.date}</div>
                        </div>
                        {content.url && (
                          <a
                            href={content.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-sm hover:underline mt-1"
                          >
                            <ExternalLink className="w-3 h-3" />
                            Link
                          </a>
                        )}
                      </div>
                    );
                  })}
                </section>
              )}
            </div>
          ) : (
            <div className="text-center py-24">
              <div className="brutal-box p-12 inline-block">
                <Sparkles className="w-12 h-12 mx-auto mb-6 opacity-50" />
                <p className="text-lg opacity-70">{emptyMessage}</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer - Print/Download hint */}
        <div className="text-center py-8 border-t-2 border-foreground text-sm font-mono opacity-50">
          Press Cmd+P to save as PDF
        </div>
      </div>
    </main>
  );
}

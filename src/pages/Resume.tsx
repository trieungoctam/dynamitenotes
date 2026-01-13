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
 */

import { useResumeSections } from "@/hooks/use-resume";
import { useLanguage } from "@/contexts/LanguageContext";
import { MarkdownRenderer } from "@/components/content/MarkdownRenderer";
import { Mail, MapPin, ExternalLink, Github, Globe, Sparkles } from "lucide-react";

// Harvard-style Resume Header Component
function ResumeHeader() {
  return (
    <header className="text-center py-12 border-b-2 border-foreground">
      {/* Name - Centered, Display Font */}
      <h1 className="font-display text-5xl md:text-7xl lg:text-8xl leading-none mb-6">
        YOUR NAME
      </h1>

      {/* Contact Info - Horizontal Line */}
      <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 text-sm font-mono">
        <a href="mailto:hello@dynamite.notes" className="hover:underline flex items-center gap-2">
          <Mail className="w-4 h-4" />
          hello@dynamite.notes
        </a>
        <span className="hidden md:inline">•</span>
        <span className="flex items-center gap-2">
          <MapPin className="w-4 h-4" />
          Ho Chi Minh City, Vietnam
        </span>
        <span className="hidden md:inline">•</span>
        <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-2">
          <Github className="w-4 h-4" />
          github.com/username
        </a>
        <span className="hidden md:inline">•</span>
        <a href="https://dynamite.notes" target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-2">
          <Globe className="w-4 h-4" />
          dynamite.notes
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

// Experience Item - Harvard Style
function ExperienceItem({
  content,
}: {
  content: {
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
}) {
  const { lang } = useLanguage();
  const role = lang === "vi" ? content.role_vi : content.role_en;
  const description = lang === "vi" ? content.description_vi : content.description_en;

  return (
    <div className="mb-6">
      {/* Header row with company/role left, date right */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-1 mb-1">
        <div className="flex-1">
          <h3 className="font-semibold text-base md:text-lg">
            {content.company}
          </h3>
          <p className="text-sm italic opacity-80">{role}</p>
        </div>
        <div className="text-sm font-mono opacity-60 whitespace-nowrap">
          {content.start_date && content.end_date
            ? `${content.start_date} – ${content.end_date}`
            : content.start_date || content.end_date}
        </div>
      </div>

      {/* Location */}
      {content.location && (
        <p className="text-sm opacity-60 mb-2">{content.location}</p>
      )}

      {/* Description - Bullet points */}
      {description && (
        <div className="text-sm leading-relaxed opacity-80">
          <MarkdownRenderer content={description} />
        </div>
      )}

      {/* Link */}
      {content.link && (
        <a
          href={content.link}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-sm hover:underline mt-2"
        >
          <ExternalLink className="w-3 h-3" />
          {lang === "vi" ? "Xem công ty" : "View company"}
        </a>
      )}
    </div>
  );
}

// Project Item - Harvard Style
function ProjectItem({
  content,
}: {
  content: {
    title?: string;
    description_vi?: string;
    description_en?: string;
    tech_stack?: string[];
    demo_url?: string;
    github_url?: string;
  };
}) {
  const { lang } = useLanguage();
  const description = lang === "vi" ? content.description_vi : content.description_en;

  return (
    <div className="mb-6">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-1 mb-1">
        <h3 className="font-semibold text-base md:text-lg">{content.title}</h3>
        <div className="flex gap-3 text-sm font-mono">
          {content.github_url && (
            <a
              href={content.github_url}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline"
            >
              GitHub
            </a>
          )}
          {content.demo_url && (
            <a
              href={content.demo_url}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline"
            >
              Demo
            </a>
          )}
        </div>
      </div>

      {/* Tech stack as inline tags */}
      {content.tech_stack && content.tech_stack.length > 0 && (
        <p className="text-sm font-mono opacity-60 mb-2">
          {content.tech_stack.join(" • ")}
        </p>
      )}

      {/* Description */}
      {description && (
        <div className="text-sm leading-relaxed opacity-80">
          <MarkdownRenderer content={description} />
        </div>
      )}
    </div>
  );
}

// Publication Item - Harvard Style
function PublicationItem({
  content,
}: {
  content: {
    title?: string;
    publisher?: string;
    date?: string;
    url?: string;
  };
}) {
  return (
    <div className="mb-4">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-1">
        <div className="flex-1">
          <h3 className="font-semibold text-base">{content.title}</h3>
          {content.publisher && (
            <p className="text-sm italic opacity-80">{content.publisher}</p>
          )}
        </div>
        <div className="text-sm font-mono opacity-60">
          {content.date}
        </div>
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
  const projects = sections?.filter((s) => s.type === "project") || [];
  const writing = sections?.filter((s) => s.type === "writing") || [];
  const speaking = sections?.filter((s) => s.type === "speaking") || [];

  // Text labels
  const highlightsTitle = lang === "vi" ? "Điểm nổi bật" : "HIGHLIGHTS";
  const experienceTitle = lang === "vi" ? "KINH NGHIỆM" : "EXPERIENCE";
  const projectsTitle = lang === "vi" ? "DỰ ÁN" : "PROJECTS";
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
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    {highlights.map((section) => {
                      const content = section.content as {
                        number?: string;
                        label_vi?: string;
                        label_en?: string;
                      };
                      return (
                        <div key={section.id} className="text-center p-4 border border-foreground/20">
                          {content.number && (
                            <div className="font-display text-2xl md:text-3xl mb-1">
                              {content.number}
                            </div>
                          )}
                          <p className="text-xs font-mono opacity-60">
                            {lang === "vi" ? content.label_vi : content.label_en}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </section>
              )}

              {/* Experience */}
              {experience.length > 0 && (
                <section>
                  <SectionHeader title={experienceTitle} />
                  {experience.map((section) => (
                    <ExperienceItem
                      key={section.id}
                      content={section.content as { [key: string]: unknown }}
                    />
                  ))}
                </section>
              )}

              {/* Projects */}
              {projects.length > 0 && (
                <section>
                  <SectionHeader title={projectsTitle} />
                  {projects.map((section) => (
                    <ProjectItem
                      key={section.id}
                      content={section.content as { [key: string]: unknown }}
                    />
                  ))}
                </section>
              )}

              {/* Writing */}
              {writing.length > 0 && (
                <section>
                  <SectionHeader title={writingTitle} />
                  {writing.map((section) => (
                    <PublicationItem
                      key={section.id}
                      content={section.content as { [key: string]: unknown }}
                    />
                  ))}
                </section>
              )}

              {/* Speaking */}
              {speaking.length > 0 && (
                <section>
                  <SectionHeader title={speakingTitle} />
                  {speaking.map((section) => (
                    <PublicationItem
                      key={section.id}
                      content={section.content as { [key: string]: unknown }}
                    />
                  ))}
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

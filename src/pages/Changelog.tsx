import { Link } from "react-router-dom";
import { 
  Clock, Sparkles, Wrench, BookOpen, 
  ArrowUpRight, Tag, GitCommit 
} from "lucide-react";

interface ChangelogEntry {
  version: string;
  date: string;
  title: string;
  type: "feature" | "update" | "content";
  description: string;
  details?: string[];
  link?: string;
}

const changelog: ChangelogEntry[] = [
  {
    version: "v2.4.0",
    date: "January 12, 2026",
    title: "Prompt Lab is here 🎉",
    type: "feature",
    description: "New interactive playground to build, test, and refine your prompts with real-time feedback and pattern suggestions.",
    details: [
      "Real-time prompt analysis and suggestions",
      "Pattern library with 50+ proven templates",
      "Export prompts as shareable cards",
      "Integration with evaluation framework",
    ],
    link: "/playground/prompt-lab",
  },
  {
    version: "v2.3.2",
    date: "January 8, 2026",
    title: "AI-First PRD Template",
    type: "content",
    description: "Added comprehensive template for writing PRDs with AI integration patterns.",
    details: [
      "Structured sections for AI capabilities",
      "Risk assessment framework",
      "Example filled-in template",
    ],
    link: "/packages/ai-first-pm/prd-template",
  },
  {
    version: "v2.3.0",
    date: "January 5, 2026",
    title: "Learning paths redesign",
    type: "update",
    description: "Improved navigation and progress tracking across all learning paths.",
    details: [
      "New visual progress indicators",
      "Estimated completion times",
      "Save your progress (coming soon)",
    ],
  },
  {
    version: "v2.2.0",
    date: "December 28, 2025",
    title: "Experiment Builder",
    type: "feature",
    description: "Interactive tool to design and plan your A/B experiments with risk assessment.",
    link: "/playground/experiment-builder",
  },
  {
    version: "v2.1.5",
    date: "December 20, 2025",
    title: "Metrics Package Expansion",
    type: "content",
    description: "Added 5 new articles covering retention cohorts, activation milestones, and leading indicators.",
  },
  {
    version: "v2.1.0",
    date: "December 15, 2025",
    title: "Command Palette",
    type: "feature",
    description: "Press ⌘K to quickly navigate anywhere in the repo. Search packages, docs, and playgrounds instantly.",
  },
];

const typeConfig = {
  feature: { 
    icon: Sparkles, 
    color: "text-primary", 
    bg: "bg-primary/10",
    border: "border-primary/30",
    label: "New Feature"
  },
  update: { 
    icon: Wrench, 
    color: "text-warning", 
    bg: "bg-warning/10",
    border: "border-warning/30",
    label: "Update"
  },
  content: { 
    icon: BookOpen, 
    color: "text-success", 
    bg: "bg-success/10",
    border: "border-success/30",
    label: "Content"
  },
};

export default function Changelog() {
  return (
    <main className="container px-4 md:px-6 pb-20">
      {/* Header */}
      <div className="py-12">
        <div className="flex items-center gap-2 mb-4">
          <span className="code-label">/changelog</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold">Release Notes</h1>
        <p className="mt-2 text-muted-foreground max-w-2xl">
          What's new in the AI-First PM repo. New packages, playgrounds, and content updates.
        </p>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-[23px] top-0 bottom-0 w-px bg-border hidden md:block" />

        <div className="space-y-6">
          {changelog.map((entry, index) => {
            const TypeIcon = typeConfig[entry.type].icon;
            return (
              <div
                key={entry.version}
                id={entry.version}
                className="relative flex gap-6"
                style={{
                  opacity: 0,
                  animation: `fade-in 0.4s ease-out ${index * 100}ms forwards`
                }}
              >
                {/* Icon */}
                <div className={`relative z-10 hidden md:flex w-12 h-12 rounded-xl ${typeConfig[entry.type].bg} border ${typeConfig[entry.type].border} items-center justify-center shrink-0`}>
                  <TypeIcon className={`w-5 h-5 ${typeConfig[entry.type].color}`} />
                </div>

                {/* Content */}
                <div className="flex-1 glass rounded-xl p-6 glass-hover">
                  {/* Meta */}
                  <div className="flex flex-wrap items-center gap-3 mb-3">
                    <span className="font-mono text-sm text-primary font-medium">
                      {entry.version}
                    </span>
                    <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      {entry.date}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${typeConfig[entry.type].bg} ${typeConfig[entry.type].color}`}>
                      {typeConfig[entry.type].label}
                    </span>
                  </div>

                  {/* Title */}
                  <h2 className="text-xl font-semibold mb-2">{entry.title}</h2>

                  {/* Description */}
                  <p className="text-muted-foreground leading-relaxed">
                    {entry.description}
                  </p>

                  {/* Details */}
                  {entry.details && (
                    <ul className="mt-4 space-y-2">
                      {entry.details.map((detail, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <GitCommit className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                          {detail}
                        </li>
                      ))}
                    </ul>
                  )}

                  {/* Link */}
                  {entry.link && (
                    <Link
                      to={entry.link}
                      className="inline-flex items-center gap-1.5 mt-4 text-sm text-primary hover:underline"
                    >
                      Check it out
                      <ArrowUpRight className="w-4 h-4" />
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}

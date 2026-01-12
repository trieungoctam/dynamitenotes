import { Link } from "react-router-dom";
import { 
  FileText, Download, Copy, CheckCircle2,
  BookOpen, ListChecks, Layout, ArrowRight
} from "lucide-react";
import { useState } from "react";

interface DocItem {
  id: string;
  title: string;
  description: string;
  type: "template" | "checklist" | "framework";
  downloads: number;
}

const docs: DocItem[] = [
  {
    id: "ai-first-prd",
    title: "AI-First PRD Template",
    description: "Complete product requirements document template with AI capability sections.",
    type: "template",
    downloads: 2847,
  },
  {
    id: "experiment-checklist",
    title: "Experiment Launch Checklist",
    description: "15-point checklist before shipping any A/B test. Never miss a step.",
    type: "checklist",
    downloads: 1923,
  },
  {
    id: "positioning-canvas",
    title: "Positioning Canvas",
    description: "One-page canvas for crafting compelling product positioning.",
    type: "framework",
    downloads: 3156,
  },
  {
    id: "metrics-framework",
    title: "North Star Metrics Framework",
    description: "Structured approach to defining and measuring your North Star.",
    type: "framework",
    downloads: 2341,
  },
  {
    id: "launch-checklist",
    title: "Product Launch Checklist",
    description: "Complete 40-point checklist for launching features confidently.",
    type: "checklist",
    downloads: 4512,
  },
  {
    id: "user-research-template",
    title: "User Research Template",
    description: "Interview guide and synthesis template for user research.",
    type: "template",
    downloads: 1876,
  },
];

const typeConfig = {
  template: { icon: FileText, color: "text-primary", label: "Template" },
  checklist: { icon: ListChecks, color: "text-success", label: "Checklist" },
  framework: { icon: Layout, color: "text-warning", label: "Framework" },
};

export default function Docs() {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (id: string) => {
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <main className="container px-4 md:px-6 pb-20">
      {/* Header */}
      <div className="py-12">
        <div className="flex items-center gap-2 mb-4">
          <span className="code-label">/docs</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold">Playbooks & Templates</h1>
        <p className="mt-2 text-muted-foreground max-w-2xl">
          Battle-tested templates and checklists. Copy, customize, and ship.
        </p>
      </div>

      {/* Filters */}
      <div className="mb-8 flex items-center gap-3">
        <BookOpen className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Filter:</span>
        {["all", "template", "checklist", "framework"].map((type) => (
          <button
            key={type}
            className="px-3 py-1 rounded-full text-sm font-medium bg-muted text-muted-foreground hover:bg-muted/80 transition-colors"
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}
      </div>

      {/* Docs grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {docs.map((doc, index) => {
          const TypeIcon = typeConfig[doc.type].icon;
          return (
            <div
              key={doc.id}
              className="glass rounded-xl p-5 glass-hover group"
              style={{
                opacity: 0,
                animation: `fade-in 0.4s ease-out ${index * 80}ms forwards`
              }}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className={`p-2 rounded-lg bg-muted/50 ${typeConfig[doc.type].color}`}>
                  <TypeIcon className="w-5 h-5" />
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full bg-muted ${typeConfig[doc.type].color}`}>
                  {typeConfig[doc.type].label}
                </span>
              </div>

              {/* Content */}
              <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors">
                {doc.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                {doc.description}
              </p>

              {/* Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-border/50">
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Download className="w-3.5 h-3.5" />
                  {doc.downloads.toLocaleString()} uses
                </span>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopy(doc.id)}
                    className="p-2 rounded-lg hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground"
                    title="Copy to clipboard"
                  >
                    {copiedId === doc.id ? (
                      <CheckCircle2 className="w-4 h-4 text-success" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                  <Link
                    to={`/docs/${doc.id}`}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition-colors"
                  >
                    View
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}

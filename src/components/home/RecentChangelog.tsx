import { Link } from "react-router-dom";
import { Clock, ArrowRight, Tag, Sparkles, Wrench, BookOpen } from "lucide-react";

interface ChangelogEntry {
  version: string;
  date: string;
  title: string;
  type: "feature" | "update" | "content";
  description: string;
}

const changelog: ChangelogEntry[] = [
  {
    version: "v2.4.0",
    date: "Jan 12, 2026",
    title: "Prompt Lab is here",
    type: "feature",
    description: "New interactive playground to build, test, and refine your prompts with real-time feedback.",
  },
  {
    version: "v2.3.2",
    date: "Jan 8, 2026",
    title: "AI-First PRD Template",
    type: "content",
    description: "Added comprehensive template for writing PRDs with AI integration patterns.",
  },
  {
    version: "v2.3.0",
    date: "Jan 5, 2026",
    title: "Learning paths redesign",
    type: "update",
    description: "Improved navigation and progress tracking across all learning paths.",
  },
];

const typeConfig = {
  feature: { icon: Sparkles, color: "text-primary", bg: "bg-primary/10" },
  update: { icon: Wrench, color: "text-warning", bg: "bg-warning/10" },
  content: { icon: BookOpen, color: "text-success", bg: "bg-success/10" },
};

export function RecentChangelog() {
  return (
    <section className="py-12">
      <div className="flex items-center justify-between mb-6">
        <div>
          <span className="code-label">changelog.md</span>
          <h2 className="mt-2 text-xl font-semibold">Recent Releases</h2>
        </div>
        <Link 
          to="/changelog" 
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          View all
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="space-y-3">
        {changelog.map((entry, index) => {
          const TypeIcon = typeConfig[entry.type].icon;
          return (
            <Link
              key={entry.version}
              to={`/changelog#${entry.version}`}
              className="block glass-hover rounded-xl p-4 group"
              style={{
                opacity: 0,
                animation: `fade-in 0.4s ease-out ${index * 80}ms forwards`
              }}
            >
              <div className="flex items-start gap-4">
                <div className={`p-2 rounded-lg ${typeConfig[entry.type].bg}`}>
                  <TypeIcon className={`w-4 h-4 ${typeConfig[entry.type].color}`} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs text-primary">{entry.version}</span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {entry.date}
                    </span>
                  </div>
                  <h3 className="font-medium group-hover:text-primary transition-colors">
                    {entry.title}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground line-clamp-1">
                    {entry.description}
                  </p>
                </div>

                <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

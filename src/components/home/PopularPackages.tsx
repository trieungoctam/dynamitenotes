import { Link } from "react-router-dom";
import { 
  Folder, FolderOpen, ChevronRight, Sparkles, 
  FlaskConical, MessageSquare, BarChart3, Megaphone, Briefcase 
} from "lucide-react";
import { useState } from "react";

interface PackageItem {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  itemCount: number;
  difficulty: "starter" | "builder" | "advanced";
}

const packages: PackageItem[] = [
  {
    id: "ai-first-pm",
    name: "ai-first-pm",
    description: "AI-first product thinking",
    icon: <Sparkles className="w-4 h-4" />,
    itemCount: 12,
    difficulty: "builder",
  },
  {
    id: "experiments",
    name: "experiments",
    description: "A/B testing & rapid prototyping",
    icon: <FlaskConical className="w-4 h-4" />,
    itemCount: 8,
    difficulty: "starter",
  },
  {
    id: "prompts",
    name: "prompts",
    description: "Prompt patterns & evaluation",
    icon: <MessageSquare className="w-4 h-4" />,
    itemCount: 15,
    difficulty: "starter",
  },
  {
    id: "metrics",
    name: "metrics",
    description: "North star, retention, activation",
    icon: <BarChart3 className="w-4 h-4" />,
    itemCount: 10,
    difficulty: "builder",
  },
  {
    id: "gtm",
    name: "gtm",
    description: "Positioning, messaging, launch",
    icon: <Megaphone className="w-4 h-4" />,
    itemCount: 7,
    difficulty: "advanced",
  },
  {
    id: "career",
    name: "career",
    description: "PM growth & portfolio building",
    icon: <Briefcase className="w-4 h-4" />,
    itemCount: 6,
    difficulty: "starter",
  },
];

const difficultyColors = {
  starter: "text-success bg-success/10",
  builder: "text-primary bg-primary/10",
  advanced: "text-warning bg-warning/10",
};

export function PopularPackages() {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <section className="py-12">
      <div className="mb-6">
        <span className="code-label">/packages</span>
        <h2 className="mt-2 text-xl font-semibold">Knowledge Areas</h2>
      </div>

      <div className="glass rounded-xl overflow-hidden">
        {packages.map((pkg, index) => (
          <Link
            key={pkg.id}
            to={`/packages/${pkg.id}`}
            className="flex items-center gap-3 px-4 py-3 border-b border-border/50 last:border-b-0 hover:bg-muted/30 transition-colors group"
            onMouseEnter={() => setHoveredId(pkg.id)}
            onMouseLeave={() => setHoveredId(null)}
            style={{
              opacity: 0,
              animation: `slide-in 0.3s ease-out ${index * 50}ms forwards`
            }}
          >
            {/* Folder icon */}
            <div className="text-primary">
              {hoveredId === pkg.id ? (
                <FolderOpen className="w-5 h-5" />
              ) : (
                <Folder className="w-5 h-5" />
              )}
            </div>

            {/* Name */}
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <span className="font-mono text-sm text-foreground group-hover:text-primary transition-colors">
                {pkg.name}/
              </span>
              <span className="hidden sm:inline text-sm text-muted-foreground truncate">
                — {pkg.description}
              </span>
            </div>

            {/* Meta */}
            <div className="hidden md:flex items-center gap-3">
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${difficultyColors[pkg.difficulty]}`}>
                {pkg.difficulty}
              </span>
              <span className="text-xs text-muted-foreground font-mono">
                {pkg.itemCount} items
              </span>
            </div>

            {/* Arrow */}
            <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
          </Link>
        ))}
      </div>
    </section>
  );
}

import { useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { 
  Folder, FolderOpen, ChevronRight, ChevronDown,
  Sparkles, FlaskConical, MessageSquare, BarChart3, 
  Megaphone, Briefcase, Clock, CheckCircle2, ArrowRight,
  Filter
} from "lucide-react";

interface Package {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  difficulty: "starter" | "builder" | "advanced";
  timeToComplete: string;
  items: {
    id: string;
    title: string;
    type: "article" | "template" | "playground";
    readTime: string;
  }[];
}

const packagesData: Package[] = [
  {
    id: "ai-first-pm",
    name: "ai-first-pm",
    description: "AI-first product thinking",
    icon: <Sparkles className="w-5 h-5" />,
    difficulty: "builder",
    timeToComplete: "4 hours",
    items: [
      { id: "intro", title: "What is AI-First Product Development?", type: "article", readTime: "8 min" },
      { id: "framework", title: "The AI-First Framework", type: "article", readTime: "12 min" },
      { id: "prd-template", title: "AI-First PRD Template", type: "template", readTime: "5 min" },
      { id: "use-cases", title: "Finding AI Use Cases in Your Product", type: "article", readTime: "10 min" },
      { id: "playground", title: "AI Feature Ideation", type: "playground", readTime: "15 min" },
    ],
  },
  {
    id: "experiments",
    name: "experiments",
    description: "A/B testing & rapid prototyping",
    icon: <FlaskConical className="w-5 h-5" />,
    difficulty: "starter",
    timeToComplete: "2 hours",
    items: [
      { id: "basics", title: "Experiment Design 101", type: "article", readTime: "6 min" },
      { id: "hypothesis", title: "Writing Good Hypotheses", type: "article", readTime: "8 min" },
      { id: "sample-size", title: "Sample Size Calculator", type: "playground", readTime: "5 min" },
      { id: "analysis", title: "Analyzing Results", type: "article", readTime: "10 min" },
    ],
  },
  {
    id: "prompts",
    name: "prompts",
    description: "Prompt patterns & evaluation",
    icon: <MessageSquare className="w-5 h-5" />,
    difficulty: "starter",
    timeToComplete: "3 hours",
    items: [
      { id: "basics", title: "Prompt Engineering Fundamentals", type: "article", readTime: "10 min" },
      { id: "patterns", title: "Essential Prompt Patterns", type: "article", readTime: "15 min" },
      { id: "lab", title: "Prompt Lab", type: "playground", readTime: "20 min" },
      { id: "eval", title: "Evaluating Prompt Quality", type: "article", readTime: "12 min" },
    ],
  },
  {
    id: "metrics",
    name: "metrics",
    description: "North star, retention, activation",
    icon: <BarChart3 className="w-5 h-5" />,
    difficulty: "builder",
    timeToComplete: "3 hours",
    items: [
      { id: "north-star", title: "Finding Your North Star Metric", type: "article", readTime: "12 min" },
      { id: "activation", title: "Activation Metrics Deep Dive", type: "article", readTime: "10 min" },
      { id: "retention", title: "Retention Analysis Framework", type: "template", readTime: "8 min" },
    ],
  },
  {
    id: "gtm",
    name: "gtm",
    description: "Positioning, messaging, launch",
    icon: <Megaphone className="w-5 h-5" />,
    difficulty: "advanced",
    timeToComplete: "5 hours",
    items: [
      { id: "positioning", title: "Positioning Workshop", type: "playground", readTime: "30 min" },
      { id: "messaging", title: "Message Testing Framework", type: "template", readTime: "15 min" },
      { id: "launch", title: "Launch Checklist", type: "template", readTime: "10 min" },
    ],
  },
  {
    id: "career",
    name: "career",
    description: "PM growth & portfolio building",
    icon: <Briefcase className="w-5 h-5" />,
    difficulty: "starter",
    timeToComplete: "2 hours",
    items: [
      { id: "portfolio", title: "Building Your PM Portfolio", type: "article", readTime: "15 min" },
      { id: "interview", title: "Interview Prep Guide", type: "article", readTime: "20 min" },
      { id: "growth", title: "Career Growth Framework", type: "template", readTime: "10 min" },
    ],
  },
];

const difficultyColors = {
  starter: "text-success bg-success/10 border-success/20",
  builder: "text-primary bg-primary/10 border-primary/20",
  advanced: "text-warning bg-warning/10 border-warning/20",
};

const typeIcons = {
  article: "📝",
  template: "📋",
  playground: "🎮",
};

export default function Packages() {
  const [searchParams] = useSearchParams();
  const mode = searchParams.get("mode");
  const [expandedPackage, setExpandedPackage] = useState<string | null>("ai-first-pm");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("all");

  const filteredPackages = packagesData.filter((pkg) => {
    if (difficultyFilter === "all") return true;
    return pkg.difficulty === difficultyFilter;
  });

  return (
    <main className="container px-4 md:px-6 pb-20">
      {/* Header */}
      <div className="py-12">
        <div className="flex items-center gap-2 mb-4">
          <span className="code-label">/packages</span>
          {mode && (
            <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
              {mode} mode
            </span>
          )}
        </div>
        <h1 className="text-3xl md:text-4xl font-bold">Knowledge Packages</h1>
        <p className="mt-2 text-muted-foreground max-w-2xl">
          Explore curated learning paths organized by topic. Each package contains articles, 
          templates, and interactive playgrounds.
        </p>
      </div>

      {/* Filters */}
      <div className="mb-8 flex items-center gap-3">
        <Filter className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Difficulty:</span>
        {["all", "starter", "builder", "advanced"].map((level) => (
          <button
            key={level}
            onClick={() => setDifficultyFilter(level)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              difficultyFilter === level
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {level.charAt(0).toUpperCase() + level.slice(1)}
          </button>
        ))}
      </div>

      {/* Package list */}
      <div className="grid lg:grid-cols-2 gap-4">
        {filteredPackages.map((pkg, index) => (
          <div
            key={pkg.id}
            className="glass rounded-xl overflow-hidden"
            style={{
              opacity: 0,
              animation: `fade-in 0.4s ease-out ${index * 80}ms forwards`
            }}
          >
            {/* Package header */}
            <button
              onClick={() => setExpandedPackage(expandedPackage === pkg.id ? null : pkg.id)}
              className="w-full flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors text-left"
            >
              <div className="text-primary">
                {expandedPackage === pkg.id ? (
                  <FolderOpen className="w-6 h-6" />
                ) : (
                  <Folder className="w-6 h-6" />
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-medium">{pkg.name}/</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs border ${difficultyColors[pkg.difficulty]}`}>
                    {pkg.difficulty}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-0.5">{pkg.description}</p>
              </div>

              <div className="hidden sm:flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {pkg.timeToComplete}
                </span>
              </div>

              {expandedPackage === pkg.id ? (
                <ChevronDown className="w-5 h-5 text-muted-foreground" />
              ) : (
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              )}
            </button>

            {/* Expanded items */}
            {expandedPackage === pkg.id && (
              <div className="border-t border-border/50 bg-muted/20">
                {pkg.items.map((item, itemIndex) => (
                  <Link
                    key={item.id}
                    to={`/packages/${pkg.id}/${item.id}`}
                    className="flex items-center gap-3 px-4 py-3 pl-14 hover:bg-muted/30 transition-colors group"
                    style={{
                      opacity: 0,
                      animation: `slide-in 0.2s ease-out ${itemIndex * 50}ms forwards`
                    }}
                  >
                    <span className="text-lg">{typeIcons[item.type]}</span>
                    <span className="flex-1 text-sm group-hover:text-primary transition-colors">
                      {item.title}
                    </span>
                    <span className="text-xs text-muted-foreground">{item.readTime}</span>
                    <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                ))}
                
                {/* Start path CTA */}
                <div className="p-4 pl-14 border-t border-border/50">
                  <Link
                    to={`/packages/${pkg.id}/start`}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Start Learning Path
                  </Link>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </main>
  );
}

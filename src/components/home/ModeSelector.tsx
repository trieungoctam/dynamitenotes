import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Rocket, Brain, Zap, ArrowRight } from "lucide-react";

interface Mode {
  id: string;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  description: string;
  gradient: string;
  path: string;
}

const modes: Mode[] = [
  {
    id: "pm",
    icon: <Rocket className="w-8 h-8" />,
    title: "I'm building a product",
    subtitle: "PM Mode",
    description: "Frameworks, metrics, and strategies for shipping products that matter.",
    gradient: "from-primary/20 via-primary/5 to-transparent",
    path: "/packages?mode=pm",
  },
  {
    id: "ai",
    icon: <Brain className="w-8 h-8" />,
    title: "I'm learning AI tools",
    subtitle: "AI Mode",
    description: "Master prompting, AI workflows, and building AI-first products.",
    gradient: "from-[hsl(280,70%,60%)]/20 via-[hsl(280,70%,60%)]/5 to-transparent",
    path: "/packages?mode=ai",
  },
  {
    id: "quick",
    icon: <Zap className="w-8 h-8" />,
    title: "I want quick wins today",
    subtitle: "Snack Mode",
    description: "Templates, checklists, and actionable insights you can use right now.",
    gradient: "from-warning/20 via-warning/5 to-transparent",
    path: "/packages?mode=quick",
  },
];

export function ModeSelector() {
  const [hoveredMode, setHoveredMode] = useState<string | null>(null);
  const navigate = useNavigate();

  return (
    <section className="py-12">
      <div className="mb-8">
        <span className="code-label">pick_your_mode()</span>
        <h2 className="mt-3 text-2xl font-semibold">Where should we start?</h2>
        <p className="mt-1 text-muted-foreground">Choose your learning path — you can always switch later.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {modes.map((mode, index) => (
          <button
            key={mode.id}
            onClick={() => navigate(mode.path)}
            onMouseEnter={() => setHoveredMode(mode.id)}
            onMouseLeave={() => setHoveredMode(null)}
            className="mode-card group text-left"
            style={{ 
              animationDelay: `${index * 100}ms`,
              opacity: 0,
              animation: `fade-in 0.5s ease-out ${index * 100}ms forwards`
            }}
          >
            {/* Gradient overlay */}
            <div className={`absolute inset-0 bg-gradient-to-br ${mode.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
            
            <div className="relative z-10">
              {/* Icon */}
              <div className={`mb-4 inline-flex p-3 rounded-xl bg-muted/50 text-muted-foreground group-hover:text-primary group-hover:bg-primary/10 transition-colors duration-300`}>
                {mode.icon}
              </div>

              {/* Content */}
              <div className="mb-3">
                <span className="text-xs font-mono text-primary/80">{mode.subtitle}</span>
                <h3 className="mt-1 text-lg font-semibold group-hover:text-primary transition-colors">
                  {mode.title}
                </h3>
              </div>

              <p className="text-sm text-muted-foreground leading-relaxed">
                {mode.description}
              </p>

              {/* Arrow */}
              <div className={`mt-4 flex items-center gap-2 text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transform translate-x-0 group-hover:translate-x-1 transition-all duration-300`}>
                <span>Start learning</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}

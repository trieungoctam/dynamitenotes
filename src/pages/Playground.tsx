import { Link } from "react-router-dom";
import { 
  MessageSquare, FlaskConical, FileText, Target,
  ArrowRight, Play, Clock, Sparkles
} from "lucide-react";

interface PlaygroundItem {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  gradient: string;
  timeEstimate: string;
  comingSoon?: boolean;
}

const playgrounds: PlaygroundItem[] = [
  {
    id: "prompt-lab",
    title: "Prompt Lab",
    description: "Build, test, and refine your prompts with real-time feedback and pattern suggestions.",
    icon: <MessageSquare className="w-6 h-6" />,
    gradient: "from-primary/20 to-primary/5",
    timeEstimate: "15 min",
  },
  {
    id: "experiment-builder",
    title: "Experiment Builder",
    description: "Design A/B tests with hypothesis templates, sample size calculator, and risk assessment.",
    icon: <FlaskConical className="w-6 h-6" />,
    gradient: "from-success/20 to-success/5",
    timeEstimate: "20 min",
  },
  {
    id: "prd-generator",
    title: "PRD Generator Lite",
    description: "Input 5 bullets, get a structured PRD skeleton. No login required.",
    icon: <FileText className="w-6 h-6" />,
    gradient: "from-warning/20 to-warning/5",
    timeEstimate: "10 min",
  },
  {
    id: "positioning-workshop",
    title: "Positioning Workshop",
    description: "Guided flow from ICP → pain → claim → proof → CTA. Export as shareable artifact.",
    icon: <Target className="w-6 h-6" />,
    gradient: "from-[hsl(280,70%,60%)]/20 to-[hsl(280,70%,60%)]/5",
    timeEstimate: "30 min",
    comingSoon: true,
  },
];

export default function Playground() {
  return (
    <main className="container px-4 md:px-6 pb-20">
      {/* Header */}
      <div className="py-12">
        <div className="flex items-center gap-2 mb-4">
          <span className="code-label">/playground</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold">Interactive Playgrounds</h1>
        <p className="mt-2 text-muted-foreground max-w-2xl">
          Don't just read — practice. Each playground generates artifacts you can save and share.
        </p>
      </div>

      {/* Playground grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {playgrounds.map((playground, index) => (
          <Link
            key={playground.id}
            to={playground.comingSoon ? "#" : `/playground/${playground.id}`}
            className={`group relative overflow-hidden rounded-2xl border border-border p-6 transition-all duration-300 ${
              playground.comingSoon 
                ? "opacity-70 cursor-not-allowed" 
                : "hover:border-primary/50 hover:shadow-[0_0_60px_-15px_hsl(var(--primary)/0.3)]"
            }`}
            style={{
              opacity: 0,
              animation: `fade-in 0.4s ease-out ${index * 100}ms forwards`
            }}
            onClick={(e) => playground.comingSoon && e.preventDefault()}
          >
            {/* Gradient background */}
            <div className={`absolute inset-0 bg-gradient-to-br ${playground.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

            <div className="relative z-10">
              {/* Icon */}
              <div className="mb-4 inline-flex p-3 rounded-xl bg-muted/50 text-muted-foreground group-hover:text-primary group-hover:bg-primary/10 transition-colors">
                {playground.icon}
              </div>

              {/* Coming soon badge */}
              {playground.comingSoon && (
                <span className="absolute top-6 right-6 px-2 py-1 rounded-full bg-muted text-xs text-muted-foreground">
                  Coming Soon
                </span>
              )}

              {/* Content */}
              <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                {playground.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                {playground.description}
              </p>

              {/* Footer */}
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  {playground.timeEstimate}
                </span>
                
                {!playground.comingSoon && (
                  <span className="flex items-center gap-1.5 text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                    <Play className="w-4 h-4" />
                    Launch
                    <ArrowRight className="w-4 h-4" />
                  </span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* CTA */}
      <div className="mt-12 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-muted-foreground">More playgrounds shipping every week</span>
        </div>
      </div>
    </main>
  );
}

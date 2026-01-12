import { FileText, GitCommit, Eye, Star } from "lucide-react";

export function ReadmeHeader() {
  return (
    <section className="relative py-16 md:py-24">
      {/* Background grid */}
      <div className="absolute inset-0 bg-grid opacity-50 pointer-events-none" />
      
      {/* Gradient orb */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10">
        {/* File indicator */}
        <div className="flex items-center gap-2 mb-6">
          <FileText className="w-5 h-5 text-primary" />
          <span className="font-mono text-sm text-muted-foreground">README.md</span>
          <span className="text-muted-foreground/50">•</span>
          <span className="text-xs text-muted-foreground">Last updated 2 days ago</span>
        </div>

        {/* Main heading */}
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
          <span className="gradient-text">AI-First</span>
          <br />
          <span className="text-foreground">Product Building</span>
        </h1>

        {/* Subtitle */}
        <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed">
          A curated knowledge base for modern product managers. Learn to ship products 
          that leverage AI, run experiments, and grow with intention.
        </p>

        {/* Stats */}
        <div className="mt-8 flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-2 text-sm">
            <GitCommit className="w-4 h-4 text-primary" />
            <span className="text-muted-foreground">120+ commits</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Eye className="w-4 h-4 text-primary" />
            <span className="text-muted-foreground">15k views/month</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Star className="w-4 h-4 text-warning" />
            <span className="text-muted-foreground">2.4k stars</span>
          </div>
        </div>

        {/* Quick start hint */}
        <div className="mt-10 inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm">
          <span className="text-muted-foreground">Pro tip:</span>
          <span>Press</span>
          <kbd className="px-1.5 py-0.5 rounded bg-muted font-mono text-xs">⌘K</kbd>
          <span>to quickly jump anywhere</span>
        </div>
      </div>
    </section>
  );
}

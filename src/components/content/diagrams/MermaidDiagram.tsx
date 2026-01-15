/**
 * MermaidDiagram Component
 *
 * Renders Mermaid diagrams from markdown code blocks.
 * Supports dark/light theme switching.
 */

import { useEffect, useRef, useState } from "react";

interface MermaidDiagramProps {
  chart: string;
  theme?: "default" | "dark" | "neutral" | "forest";
}

// Initialize mermaid once at module level
let mermaidInitialized = false;
let mermaidInstance: any = null;

async function getMermaid() {
  if (!mermaidInstance) {
    mermaidInstance = await import("mermaid");
  }
  return mermaidInstance.default;
}

export function MermaidDiagram({
  chart,
  theme = "default",
}: MermaidDiagramProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function renderDiagram() {
      if (!ref.current) return;

      try {
        setLoading(true);
        setError(null);

        const mermaid = await getMermaid();

        // Initialize mermaid once
        if (!mermaidInitialized) {
          mermaid.initialize({
            startOnLoad: false,
            theme,
            securityLevel: "loose",
            logLevel: "error",
          });
          mermaidInitialized = true;
        }

        // Generate unique ID
        const id = `mermaid-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;

        // Render diagram
        const { svg } = await mermaid.render(id, chart);

        if (isMounted && ref.current) {
          ref.current.innerHTML = svg;
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          console.error("Mermaid render error:", err);
          setError(err instanceof Error ? err.message : "Failed to render diagram");
          setLoading(false);
        }
      }
    }

    renderDiagram();

    return () => {
      isMounted = false;
    };
  }, [chart, theme]);

  if (error) {
    return (
      <div className="my-6 rounded-lg border border-red-500/50 bg-red-500/10 p-4">
        <p className="text-sm font-medium text-red-600 dark:text-red-400">
          Failed to render diagram
        </p>
        <details className="mt-2">
          <summary className="cursor-pointer text-sm text-muted-foreground">
            View source
          </summary>
          <pre className="mt-2 overflow-auto text-xs">{chart}</pre>
        </details>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="my-6 flex items-center justify-center p-8">
        <div className="text-sm text-muted-foreground">Loading diagram...</div>
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className="my-6 flex justify-center overflow-x-auto"
      role="img"
      aria-label="Mermaid diagram"
    />
  );
}

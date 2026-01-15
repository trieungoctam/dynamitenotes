/**
 * MermaidDiagram Component
 *
 * Renders Mermaid diagrams from markdown code blocks.
 * Uses a separate container for Mermaid SVG to avoid React DOM conflicts.
 * Supports dark/light theme switching.
 */

import { useEffect, useRef, useState } from "react";

interface MermaidDiagramProps {
  chart: string;
  theme?: "default" | "dark" | "neutral" | "forest";
}

// Track mermaid module separately from instances
let mermaidModule: any = null;
const mermaidInitialized = new Set<string>();

async function getMermaid() {
  if (!mermaidModule) {
    mermaidModule = await import("mermaid");
  }
  return mermaidModule.default;
}

export function MermaidDiagram({
  chart,
  theme = "default",
}: MermaidDiagramProps) {
  // Use separate ref for Mermaid container - React won't touch its children
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [svgContent, setSvgContent] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    async function renderDiagram() {
      try {
        setLoading(true);
        setError(null);

        const mermaid = await getMermaid();

        // Initialize per theme if not already done
        const themeKey = `mermaid-${theme}`;
        if (!mermaidInitialized.has(themeKey)) {
          mermaid.initialize({
            startOnLoad: false,
            theme,
            securityLevel: "loose",
            logLevel: "error",
          });
          mermaidInitialized.add(themeKey);
        }

        // Generate unique ID
        const id = `mermaid-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;

        const { svg } = await mermaid.render(id, chart);

        if (isMounted && !controller.signal.aborted) {
          setSvgContent(svg);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted && !controller.signal.aborted) {
          setError(err instanceof Error ? err.message : String(err));
          setLoading(false);
        }
      }
    }

    renderDiagram();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [chart, theme]);

  // Inject SVG into container via ref to avoid React DOM conflicts
  useEffect(() => {
    if (containerRef.current && svgContent) {
      containerRef.current.innerHTML = svgContent;
    }
  }, [svgContent]);

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

  return (
    <div className="my-6 flex justify-center overflow-x-auto" role="img" aria-label="Mermaid diagram">
      {loading ? (
        <div className="flex items-center justify-center p-8">
          <div className="text-sm text-muted-foreground">Loading diagram...</div>
        </div>
      ) : (
        // Empty container for Mermaid SVG - React doesn't manage children
        <div ref={containerRef} />
      )}
    </div>
  );
}

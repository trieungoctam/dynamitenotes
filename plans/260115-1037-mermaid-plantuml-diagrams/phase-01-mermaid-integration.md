# Phase 1: Mermaid Integration

**Status:** Pending
**Duration:** 45 min
**Dependencies:** None

---

## Overview

Install mermaid package and create MermaidDiagram component with proper error handling and lazy loading.

---

## Implementation Steps

### 1.1 Install Dependencies

```bash
npm install mermaid
npm install -D @types/mermaid
```

### 1.2 Create MermaidDiagram Component

**File:** `src/components/content/diagrams/MermaidDiagram.tsx`

```tsx
import { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';

interface MermaidDiagramProps {
  chart: string;
  theme?: 'default' | 'dark' | 'neutral' | 'forest';
}

export function MermaidDiagram({ chart, theme = 'default' }: MermaidDiagramProps) {
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

        // Initialize mermaid
        await mermaid.initialize({
          startOnLoad: false,
          theme,
          securityLevel: 'loose',
          logLevel: 'error',
        });

        // Generate unique ID
        const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;

        // Render diagram
        const { svg } = await mermaid.render(id, chart);

        if (isMounted && ref.current) {
          ref.current.innerHTML = svg;
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to render diagram');
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
      <div className="rounded-lg border border-red-500/50 bg-red-500/10 p-4">
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
      <div className="flex items-center justify-center p-8">
        <div className="text-sm text-muted-foreground">Loading diagram...</div>
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className="my-6 flex justify-center overflow-x-auto"
      role="img"
      aria-label={`Mermaid diagram`}
    />
  );
}
```

### 1.3 Create Diagrams Directory

```bash
mkdir -p src/components/content/diagrams
```

### 1.4 Export from Index

**File:** `src/components/content/diagrams/index.ts`

```tsx
export { MermaidDiagram } from './MermaidDiagram';
```

---

## Success Criteria

- [ ] mermaid package installed
- [ ] MermaidDiagram component created
- [ ] TypeScript compiles without errors
- [ ] Component handles errors gracefully

---

## Notes

- Mermaid bundle size: ~148KB gzipped
- Will add lazy loading in Phase 3
- Theme switching handled in Phase 4

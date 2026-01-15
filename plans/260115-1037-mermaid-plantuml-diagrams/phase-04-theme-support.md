# Phase 4: Theme Support

**Status:** Pending
**Duration:** 30 min
**Dependencies:** Phase 1, Phase 3

---

## Overview

Add dark/light theme detection and switching for Mermaid diagrams. PlantUML uses pre-rendered images so no theme support needed.

---

## Implementation Steps

### 4.1 Detect Current Theme

**File:** `src/components/content/diagrams/use-theme.ts`

```tsx
import { useEffect, useState } from 'react';

export function useTheme() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    // Check initial theme from document
    const isDark = document.documentElement.classList.contains('dark');
    setTheme(isDark ? 'dark' : 'light');

    // Listen for theme changes (if using next-themes or similar)
    const observer = new MutationObserver(() => {
      const isDark = document.documentElement.classList.contains('dark');
      setTheme(isDark ? 'dark' : 'light');
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, []);

  return theme;
}
```

### 4.2 Map App Theme to Mermaid Theme

**File:** `src/components/content/diagrams/get-mermaid-theme.ts`

```tsx
export function getMermaidTheme(appTheme: 'light' | 'dark'): 'default' | 'dark' {
  return appTheme === 'dark' ? 'dark' : 'default';
}
```

### 4.3 Update MermaidDiagram

**File:** `src/components/content/diagrams/MermaidDiagram.tsx`

```tsx
import { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { useTheme } from './use-theme';
import { getMermaidTheme } from './get-mermaid-theme';

interface MermaidDiagramProps {
  chart: string;
}

export function MermaidDiagram({ chart }: MermaidDiagramProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const appTheme = useTheme();
  const mermaidTheme = getMermaidTheme(appTheme);

  useEffect(() => {
    let isMounted = true;

    async function renderDiagram() {
      if (!ref.current) return;

      try {
        setLoading(true);
        setError(null);

        // Initialize mermaid with theme
        await mermaid.initialize({
          startOnLoad: false,
          theme: mermaidTheme,
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
  }, [chart, mermaidTheme]); // Re-render when theme changes

  // ... rest of component (error/loading states)
}
```

### 4.4 Alternative: Force Re-render with Key

If theme changes don't trigger re-render, use key prop:

```tsx
// In MarkdownRenderer, add key to force re-render:
import { useTheme } from '../diagrams/use-theme';

// In code handler:
if (language === 'mermaid') {
  const theme = useTheme();
  const key = `${theme}-${code.slice(0, 20)}`; // Unique key per theme + content

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DiagramErrorBoundary>
        <MermaidDiagram key={key} chart={code} />
      </DiagramErrorBoundary>
    </Suspense>
  );
}
```

---

## Success Criteria

- [ ] Mermaid detects current theme
- [ ] Diagrams update when theme changes
- [ ] No TypeScript errors
- [ ] Both light and dark themes render correctly

---

## Notes

- Mermaid themes: `default`, `dark`, `neutral`, `forest`
- Custom theme variables can be added for brand colors
- PlantUML images are pre-rendered, so theme doesn't apply

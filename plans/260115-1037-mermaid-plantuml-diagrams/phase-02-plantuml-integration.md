# Phase 2: PlantUML Integration

**Status:** Pending
**Duration:** 45 min
**Dependencies:** None

---

## Overview

Install plantuml-encoder package and create PlantUMLDiagram component that uses external API to render diagrams as images.

---

## Implementation Steps

### 2.1 Install Dependencies

```bash
npm install plantuml-encoder
```

### 2.2 Create PlantUML Diagram Component

**File:** `src/components/content/diagrams/PlantUMLDiagram.tsx`

```tsx
import { useEffect, useState } from 'react';
import { encode } from 'plantuml-encoder';

interface PlantUMLDiagramProps {
  source: string;
  format?: 'png' | 'svg';
  serverUrl?: string;
}

const PLANTUML_SERVER = 'https://www.plantuml.com/plantuml';

export function PlantUMLDiagram({
  source,
  format = 'svg',
  serverUrl = PLANTUML_SERVER
}: PlantUMLDiagramProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function generateImage() {
      try {
        setLoading(true);
        setError(null);

        // Encode PlantUML source
        const encoded = encode(source);

        // Build URL
        const url = `${serverUrl}/${format}/${encoded}`;

        if (isMounted) {
          setImageUrl(url);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to encode diagram');
          setLoading(false);
        }
      }
    }

    generateImage();

    return () => {
      isMounted = false;
    };
  }, [source, format, serverUrl]);

  // Handle image load error
  const handleImageError = () => {
    setError('Failed to load diagram from server');
    setLoading(false);
  };

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
          <pre className="mt-2 overflow-auto text-xs">{source}</pre>
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

  if (format === 'svg') {
    return (
      <div className="my-6 flex justify-center overflow-x-auto">
        <img
          src={imageUrl!}
          alt="PlantUML diagram"
          className="max-w-full"
          onError={handleImageError}
          loading="lazy"
        />
      </div>
    );
  }

  return (
    <div className="my-6 flex justify-center">
      <img
        src={imageUrl!}
        alt="PlantUML diagram"
        className="rounded-lg border border-border max-w-full"
        onError={handleImageError}
        loading="lazy"
      />
    </div>
  );
}
```

### 2.3 Update Export

**File:** `src/components/content/diagrams/index.ts`

```tsx
export { MermaidDiagram } from './MermaidDiagram';
export { PlantUMLDiagram } from './PlantUMLDiagram';
```

---

## Success Criteria

- [ ] plantuml-encoder package installed
- [ ] PlantUMLDiagram component created
- [ ] TypeScript compiles without errors
- [ ] Component handles API errors gracefully

---

## Notes

- PlantUML public server: `https://www.plantuml.com/plantuml`
- SVG preferred for scalability
- Add environment variable support for custom server URL
- Consider caching for production (future phase)

# Phase 3: MarkdownRenderer Update

**Status:** Pending
**Duration:** 30 min
**Dependencies:** Phase 1, Phase 2

---

## Overview

Update MarkdownRenderer to detect ```mermaid and ```plantuml code blocks and render them with appropriate components.

---

## Implementation Steps

### 3.1 Update MarkdownRenderer

**File:** `src/components/content/MarkdownRenderer.tsx`

Add diagram components to imports and update code component handler:

```tsx
import { MermaidDiagram, PlantUMLDiagram } from './diagrams';

// In the components prop, update the code handler:
code({ className, children, ...props }) {
  const match = /language-(\w+)/.exec(className || '');
  const code = String(children).replace(/\n$/, '');
  const language = match?.[1] || '';
  const isInline = !match && !code.includes('\n');

  // Inline code
  if (isInline) {
    return <code className={className} {...props}>{children}</code>;
  }

  // Mermaid diagrams
  if (language === 'mermaid') {
    return <MermaidDiagram chart={code} />;
  }

  // PlantUML diagrams
  if (language === 'plantuml') {
    return <PlantUMLDiagram source={code} />;
  }

  // Regular code blocks with syntax highlighting
  return (
    <CodeBlock
      language={language}
      code={code}
      theme={codeTheme}
    />
  );
}
```

### 3.2 Create Diagram Error Boundary

**File:** `src/components/content/diagrams/DiagramErrorBoundary.tsx`

```tsx
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class DiagramErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Diagram rendering error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="rounded-lg border border-yellow-500/50 bg-yellow-500/10 p-4">
          <p className="text-sm font-medium text-yellow-600 dark:text-yellow-400">
            Diagram unavailable
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### 3.3 Add Lazy Loading

**File:** `src/components/content/diagrams/index.ts`

```tsx
import { lazy } from 'react';

export const MermaidDiagram = lazy(() =>
  import('./MermaidDiagram').then(m => ({ default: m.MermaidDiagram }))
);

export const PlantUMLDiagram = lazy(() =>
  import('./PlantUMLDiagram').then(m => ({ default: m.PlantUMLDiagram }))
);

export { DiagramErrorBoundary } from './DiagramErrorBoundary';
```

### 3.4 Wrap with Suspense

In MarkdownRenderer, wrap diagram components:

```tsx
import { Suspense } from 'react';
import { MermaidDiagram, PlantUMLDiagram, DiagramErrorBoundary } from './diagrams';

// In code handler:
if (language === 'mermaid') {
  return (
    <Suspense fallback={<div className="my-6 p-8 text-center text-sm text-muted-foreground">Loading diagram...</div>}>
      <DiagramErrorBoundary>
        <MermaidDiagram chart={code} />
      </DiagramErrorBoundary>
    </Suspense>
  );
}

if (language === 'plantuml') {
  return (
    <Suspense fallback={<div className="my-6 p-8 text-center text-sm text-muted-foreground">Loading diagram...</div>}>
      <DiagramErrorBoundary>
        <PlantUMLDiagram source={code} />
      </DiagramErrorBoundary>
    </Suspense>
  );
}
```

---

## Success Criteria

- [ ] MarkdownRenderer detects mermaid/plantuml blocks
- [ ] Diagrams render correctly
- [ ] Lazy loading works
- [ ] Error boundaries catch errors
- [ ] TypeScript compiles without errors

---

## Testing Content

```markdown
## Mermaid Flowchart

\`\`\`mermaid
graph TD
    A[Start] --> B{Decision}
    B -->|Yes| C[Action]
    B -->|No| D[End]
    C --> D
\`\`\`

## PlantUML Sequence

\`\`\`plantuml
@startuml
Alice -> Bob: Hello
Bob -> Alice: Hi!
@enduml
\`\`\`
```

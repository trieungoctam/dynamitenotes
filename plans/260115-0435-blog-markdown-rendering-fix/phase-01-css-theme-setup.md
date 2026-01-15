# Phase 1: CSS Variables & Theme Setup

**Duration**: 45 min
**Dependencies**: None

---

## Objectives

Create markdown-specific CSS with shadcn/ui design tokens, supporting light/dark modes.

---

## Tasks

### 1.1 Create Markdown CSS File (30 min)

**File**: `src/styles/markdown.css`

```css
/**
 * Markdown Rendering Styles
 * Aligned with shadcn/ui design tokens
 * Supports light/dark modes
 */

@layer base {
  /* Custom markdown styles */
  .markdown-content {
    /* Typography */
    --markdown-font-sans: system-ui, -apple-system, sans-serif;
    --markdown-font-mono: ui-monospace, SFMono-Regular, Menlo, monospace;

    /* Colors - using shadcn/ui CSS variables */
    --markdown-fg: hsl(var(--foreground));
    --markdown-fg-muted: hsl(var(--muted-foreground));
    --markdown-bg: hsl(var(--background));
    --markdown-bg-muted: hsl(var(--muted));
    --markdown-primary: hsl(var(--primary));
    --markdown-border: hsl(var(--border));

    /* Spacing */
    --markdown-spacing-xs: 0.25rem;
    --markdown-spacing-sm: 0.5rem;
    --markdown-spacing-md: 1rem;
    --markdown-spacing-lg: 1.5rem;
    --markdown-spacing-xl: 2rem;
  }
}

@layer components {
  .markdown-content {
    font-family: var(--markdown-font-sans);
    color: var(--markdown-fg);
    line-height: 1.75;
  }

  /* Headings */
  .markdown-content h1,
  .markdown-content h2,
  .markdown-content h3,
  .markdown-content h4,
  .markdown-content h5,
  .markdown-content h6 {
    font-weight: 600;
    color: var(--markdown-fg);
    margin-top: var(--markdown-spacing-xl);
    margin-bottom: var(--markdown-spacing-md);
    line-height: 1.25;
  }

  .markdown-content h1 {
    font-size: 2.25rem;
    border-bottom: 1px solid var(--markdown-border);
    padding-bottom: var(--markdown-spacing-sm);
  }

  .markdown-content h2 {
    font-size: 1.875rem;
    border-bottom: 1px solid var(--markdown-border);
    padding-bottom: var(--markdown-spacing-xs);
  }

  .markdown-content h3 {
    font-size: 1.5rem;
  }

  .markdown-content h4 {
    font-size: 1.25rem;
  }

  /* Paragraphs */
  .markdown-content p {
    margin-bottom: var(--markdown-spacing-md);
    color: var(--markdown-fg-muted);
  }

  /* Links */
  .markdown-content a {
    color: var(--markdown-primary);
    text-decoration: none;
    border-bottom: 1px solid transparent;
    transition: border-color 0.2s;
  }

  .markdown-content a:hover {
    border-bottom-color: var(--markdown-primary);
  }

  /* Inline code */
  .markdown-content code:not(pre code) {
    font-family: var(--markdown-font-mono);
    font-size: 0.875em;
    background-color: var(--markdown-bg-muted);
    color: var(--markdown-primary);
    padding: 0.125rem 0.375rem;
    border-radius: 0.25rem;
    font-weight: 500;
  }

  /* Code blocks */
  .markdown-content pre {
    margin-bottom: var(--markdown-spacing-lg);
    border-radius: 0.5rem;
    overflow-x: auto;
  }

  .markdown-content pre code {
    display: block;
    padding: var(--markdown-spacing-md);
    font-family: var(--markdown-font-mono);
    font-size: 0.875rem;
    line-height: 1.5;
    background-color: transparent;
    color: inherit;
  }

  /* Blockquotes */
  .markdown-content blockquote {
    margin-bottom: var(--markdown-spacing-lg);
    padding-left: var(--markdown-spacing-md);
    border-left: 4px solid var(--markdown-primary);
    color: var(--markdown-fg-muted);
    font-style: italic;
  }

  /* Lists */
  .markdown-content ul,
  .markdown-content ol {
    margin-bottom: var(--markdown-spacing-md);
    padding-left: var(--markdown-spacing-lg);
  }

  .markdown-content li {
    margin-bottom: var(--markdown-spacing-xs);
    color: var(--markdown-fg-muted);
  }

  .markdown-content li::marker {
    color: var(--markdown-fg-muted);
  }

  .markdown-content ul ul,
  .markdown-content ol ol,
  .markdown-content ul ol,
  .markdown-content ol ul {
    margin-top: var(--markdown-spacing-xs);
    margin-bottom: var(--markdown-spacing-xs);
  }

  /* Tables */
  .markdown-content table {
    width: 100%;
    margin-bottom: var(--markdown-spacing-lg);
    border-collapse: collapse;
    border-radius: 0.5rem;
    overflow: hidden;
    border: 1px solid var(--markdown-border);
  }

  .markdown-content thead {
    background-color: var(--markdown-bg-muted);
  }

  .markdown-content th {
    padding: var(--markdown-spacing-sm) var(--markdown-spacing-md);
    text-align: left;
    font-weight: 600;
    color: var(--markdown-fg);
    border-bottom: 1px solid var(--markdown-border);
  }

  .markdown-content td {
    padding: var(--markdown-spacing-sm) var(--markdown-spacing-md);
    border-bottom: 1px solid var(--markdown-border);
    color: var(--markdown-fg-muted);
  }

  .markdown-content tbody tr:last-child td {
    border-bottom: none;
  }

  .markdown-content tbody tr:hover {
    background-color: var(--markdown-bg-muted);
  }

  /* Images */
  .markdown-content img {
    max-width: 100%;
    height: auto;
    border-radius: 0.5rem;
    margin: var(--markdown-spacing-md) 0;
  }

  /* Horizontal rules */
  .markdown-content hr {
    border: none;
    border-top: 1px solid var(--markdown-border);
    margin: var(--markdown-spacing-xl) 0;
  }

  /* Strong and emphasis */
  .markdown-content strong {
    font-weight: 600;
    color: var(--markdown-fg);
  }

  .markdown-content em {
    font-style: italic;
  }
}
```

---

### 1.2 Update index.css (10 min)

**File**: `src/index.css`

Add import after Tailwind imports:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Add after Tailwind imports */
@import './styles/markdown.css';

/* ... rest of file ... */
```

---

### 1.3 Update MarkdownRenderer Classes (5 min)

**File**: `src/components/content/MarkdownRenderer.tsx`

Replace prose classes with custom class:

```typescript
// Before
<div className={cn(
  "prose prose-invert max-w-none",
  // ... many prose classes
)}>

// After
<div className={cn(
  "markdown-content max-w-none",
  className
)}>
```

---

## Verification

- [ ] markdown.css file created
- [ ] Import added to index.css
- [ ] MarkdownRenderer uses new class
- [ ] Dev tools show styles applied
- [ ] Dark/light mode both work

---

## Next Phase

After CSS is set up, proceed to **Phase 2: MarkdownRenderer Refactor**.

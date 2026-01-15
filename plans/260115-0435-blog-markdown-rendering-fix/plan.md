# Blog Markdown Rendering Fix Plan

**Created**: 2026-01-15
**Status**: Draft
**Priority**: Medium
**Estimated**: 3-4 hours

---

## Problem Summary

Blog content markdown rendering has styling issues affecting:
- Post detail pages
- Post preview cards
- Admin editor preview
- All blog-related components

**Broken Features**:
- Code blocks (```code``` and inline `code`)
- Images/media embedding
- Tables and lists
- Custom components (if any)

---

## Current Implementation Analysis

### Stack Identified
- **Library**: `react-markdown` v10.1.0
- **GFM Support**: `remark-gfm` v4.0.1 (GitHub Flavored Markdown)
- **Syntax Highlighting**: `react-syntax-highlighter` v16.1.0
- **Typography**: `@tailwindcss/typography` v0.5.16
- **Theme**: `oneDark` for code blocks

### Components Found

#### 1. MarkdownRenderer (`src/components/content/MarkdownRenderer.tsx`)
```typescript
// Current implementation
- Uses react-markdown + remarkGfm
- SyntaxHighlighter with oneDark theme
- Prose classes for typography
- Custom components for: code, a, img, table
```

**Issues Identified**:
- `oneDark` theme hard-coded (doesn't adapt to light mode)
- Prose classes may conflict with shadcn/ui
- No custom component for lists/tables styling
- Images lack responsive container

#### 2. MarkdownEditor (`src/components/admin/MarkdownEditor.tsx`)
```typescript
- Simple textarea with toolbar
- No live preview
- Image upload support
```

**Issue**: No preview pane to see rendered markdown

#### 3. PostDetail (`src/pages/PostDetail.tsx`)
```typescript
- Uses MarkdownRenderer with prose classes
- Editorial magazine design
- Reading progress indicator
```

#### 4. PostCard (`src/components/content/PostCard.tsx`)
```typescript
- Shows excerpt only (no markdown rendering)
- No preview of content styling
```

---

## Root Causes

### 1. Dark Mode Code Theme
`oneDark` is always applied even in light mode:
```typescript
<SyntaxHighlighter style={oneDark} ... />
```

### 2. Prose Class Conflicts
Tailwind Typography prose classes may not align with shadcn/ui design tokens:
```typescript
className="prose prose-invert max-w-none"
```

### 3. Missing Custom Styling
- Lists use default prose styling (may not match design system)
- Tables lack proper borders/striping
- Inline code may have poor contrast

### 4. No Preview in Editor
Admin has no way to preview rendered markdown while editing

---

## Solution Design

### Approach
1. **Theme-aware syntax highlighting** - Use CSS variables for code themes
2. **Shadcn/ui-aligned prose classes** - Override prose with design tokens
3. **Enhanced component styling** - Custom styles for tables, lists, images
4. **Live preview** - Add preview pane to MarkdownEditor

### Key Changes

#### 1. MarkdownRenderer Enhancements
```typescript
// Dynamic theme based on dark mode
const codeTheme = dark ? vscDarkPlus : vscLightPlus

// Or use CSS custom properties
<SyntaxHighlighter
  style={customThemeWithCssVars}
  ...
/>
```

#### 2. Prose Class Overrides
```css
/* In index.css or markdown.css */
@layer components {
  .prose-custom {
    /* Override with shadcn tokens */
    --prose-p-color: hsl(var(--muted-foreground));
    --prose-headings-color: hsl(var(--foreground));
    /* ... */
  }
}
```

#### 3. Enhanced Components
```typescript
// Table with shadcn styling
table: ({ children }) => (
  <div className="my-6 w-full overflow-y-auto">
    <table className="w-full">
      {children}
    </table>
  </div>
)
```

#### 4. Editor Preview Pane
```typescript
// Split view: editor | preview
<div className="grid grid-cols-2 gap-4">
  <Textarea ... />
  <MarkdownRenderer content={value} />
</div>
```

---

## Implementation Plan

### Phase 1: CSS Variables & Theme Setup (45 min)

**1.1 Create markdown-specific CSS file**
- File: `src/styles/markdown.css`
- Define CSS custom properties for all markdown elements
- Support light/dark modes

**1.2 Update index.css**
- Import markdown.css
- Ensure proper cascade order

### Phase 2: MarkdownRenderer Refactor (60 min)

**2.1 Update MarkdownRenderer component**
- Remove `oneDark` hard-coded theme
- Add theme detection
- Implement dynamic theme switching
- Add proper styling for:
  - Code blocks (line numbers, copy button)
  - Tables (borders, striping, responsive)
  - Lists (custom markers, spacing)
  - Blockquotes (left border, background)
  - Images (container, captions)

**2.2 Create CodeBlock wrapper component**
- Syntax highlighting with theme
- Copy to clipboard button
- Language label
- Line numbers (optional)

### Phase 3: MarkdownEditor Enhancement (45 min)

**3.1 Add live preview**
- Split pane layout
- Sync scrolling
- Toggle preview visibility

**3.2 Add preview controls**
- Theme toggle (for preview only)
- Fullscreen preview

### Phase 4: Prose Class Alignment (30 min)

**4.1 Create custom prose variant**
- File: `src/tailwindcss/prose.css`
- Override default prose styles
- Align with shadcn/ui design tokens

**4.2 Update all MarkdownRenderer instances**
- Replace prose classes with custom variant
- Test across all pages

### Phase 5: Testing & Verification (30 min)

**5.1 Test all markdown elements**
- Headings (h1-h6)
- Paragraphs
- Lists (ordered, unordered, nested)
- Code blocks (inline, multi-line, various languages)
- Tables
- Blockquotes
- Images
- Links
- Horizontal rules

**5.2 Test across components**
- PostDetail page
- Admin editor preview
- Any other components using MarkdownRenderer

**5.3 Test dark/light modes**
- Verify all elements in both modes
- Check contrast ratios

---

## File Changes

### New Files (2)
1. `src/styles/markdown.css` - Markdown-specific styles
2. `src/components/content/CodeBlock.tsx` - Enhanced code block component

### Modified Files (3)
1. `src/components/content/MarkdownRenderer.tsx` - Main updates
2. `src/components/admin/MarkdownEditor.tsx` - Add preview
3. `src/index.css` - Import markdown.css

### Optional (if needed)
1. `src/tailwindcss/prose.css` - Custom prose variant

---

## Code Snippets

### MarkdownRenderer with Dynamic Theme
```typescript
import { useTheme } from "@/components/theme-provider"
import { vscDarkPlus, vs } from "react-syntax-highlighter/dist/esm/styles/prism"

export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  const { theme } = useTheme()
  const isDark = theme === "dark"

  return (
    <Markdown
      remarkPlugins={[remarkGfm]}
      components={{
        code({ className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || "")
          const code = String(children).replace(/\n$/, "")
          const isInline = !match && !code.includes("\n")

          if (isInline) {
            return <code className="bg-muted px-1.5 py-0.5 rounded text-sm">{children}</code>
          }

          return (
            <CodeBlock
              language={match?.[1] || "text"}
              code={code}
              theme={isDark ? vscDarkPlus : vs}
            />
          )
        }
      }}
    >
      {content}
    </Markdown>
  )
}
```

### Enhanced Table Component
```typescript
table: ({ children }) => (
  <div className="my-6 w-full overflow-y-auto rounded-lg border">
    <table className="w-full">
      {children}
    </table>
  </div>
),
thead: ({ children }) => (
  <thead className="bg-muted [&_tr]:border-b">
    {children}
  </thead>
),
tbody: ({ children }) => (
  <tbody className="[&_tr:last-child]:border-0">
    {children}
  </tbody>
),
tr: ({ children }) => (
  <tr className="border-b transition-colors hover:bg-muted/50">
    {children}
  </tr>
),
th: ({ children }) => (
  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
    {children}
  </th>
),
td: ({ children }) => (
  <td className="p-4 align-middle">
    {children}
  </td>
),
```

### MarkdownEditor with Preview
```typescript
const [showPreview, setShowPreview] = useState(true)

return (
  <div className={cn(
  "grid gap-4",
  showPreview ? "md:grid-cols-2" : "grid-cols-1"
)}>
    {/* Editor */}
    <div className="border rounded-lg">
      <Textarea ... />
    </div>

    {/* Preview */}
    {showPreview && (
      <div className="border rounded-lg p-4 bg-background">
        <MarkdownRenderer content={value} />
      </div>
    )}
  </div>
)
```

---

## Verification Checklist

### Styling
- [ ] Code blocks have proper syntax highlighting
- [ ] Code blocks adapt to dark/light mode
- [ ] Inline code has good contrast
- [ ] Tables have borders and striping
- [ ] Tables are scrollable on mobile
- [ ] Lists have proper spacing
- [ ] Blockquotes have left border styling
- [ ] Images are responsive
- [ ] Links have hover states

### Components
- [ ] MarkdownRenderer works on PostDetail
- [ ] MarkdownRenderer works in editor preview
- [ ] MarkdownEditor has live preview
- [ ] Preview can be toggled
- [ ] All markdown features render correctly

### Cross-Mode
- [ ] All elements work in dark mode
- [ ] All elements work in light mode
- [ ] Theme switching works without reload
- [ ] Contrast ratios meet WCAG AA

---

## Rollback Plan

If issues occur:
1. Revert MarkdownRenderer to previous version
2. Remove markdown.css import
3. Disable preview in MarkdownEditor

Git commit before starting for easy rollback.

---

## Dependencies (No New Installations)

All required packages already installed:
- react-markdown
- remark-gfm
- react-syntax-highlighter
- @tailwindcss/typography
- @types/react-syntax-highlighter

---

## Next Steps

Once approved:
1. Create CSS file with markdown styles
2. Refactor MarkdownRenderer component
3. Add preview to MarkdownEditor
4. Test all scenarios
5. Commit changes

---

## Unresolved Questions

1. Should code blocks have line numbers?
2. Should there be a "copy code" button?
3. Should editor preview be enabled by default?
4. Any custom markdown syntax to support (e.g., YouTube embeds, tweets)?

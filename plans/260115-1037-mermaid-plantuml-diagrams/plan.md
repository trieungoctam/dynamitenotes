# Mermaid & PlantUML Diagram Support for Blog Markdown

**Status:** Planning
**Created:** 2026-01-15
**Priority:** Medium
**Complexity:** Medium

---

## Overview

Add support for rendering Mermaid and PlantUML diagrams in blog markdown content. Diagrams will be rendered from fenced code blocks (```mermaid, ```plantuml) in the MarkdownRenderer component.

---

## Phases

| Phase | Status | Description |
|-------|--------|-------------|
| [Phase 1](./phase-01-mermaid-integration.md) | Pending | Install mermaid package, create MermaidDiagram component |
| [Phase 2](./phase-02-plantuml-integration.md) | Pending | Install plantuml-encoder, create PlantUMLDiagram component |
| [Phase 3](./phase-03-markdown-renderer-update.md) | Pending | Update MarkdownRenderer to detect and render diagram blocks |
| [Phase 4](./phase-04-theme-support.md) | Pending | Add dark/light theme support for Mermaid |
| [Phase 5](./phase-05-testing-verification.md) | Pending | Test all diagram types and error handling |

---

## Requirements

**Functional:**
- Render Mermaid diagrams (flowcharts, sequence diagrams, etc.)
- Render PlantUML diagrams via external API
- Support fenced code blocks: ```mermaid and ```plantuml
- Fallback to syntax highlighting if rendering fails
- Dark/light mode support

**Non-Functional:**
- Lazy load diagram components
- Handle errors gracefully
- Cache PlantUML images
- Responsive design

---

## Architecture

```
src/components/content/
├── MarkdownRenderer.tsx          # Update: detect diagram blocks
├── diagrams/
│   ├── MermaidDiagram.tsx        # New: Mermaid component
│   ├── PlantUMLDiagram.tsx       # New: PlantUML component
│   └── DiagramErrorBoundary.tsx  # New: Error boundary
├── code/
│   └── CodeBlock.tsx             # Existing: syntax highlighting
```

---

## Dependencies

```json
{
  "dependencies": {
    "mermaid": "^11.12.0",
    "plantuml-encoder": "^1.4.0"
  }
}
```

---

## Key Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Mermaid Package | Core `mermaid` | Smaller bundle, active maintenance |
| PlantUML Method | External API | No server-side component required |
| Theme Detection | useTheme hook | Aligns with existing theme system |
| Error Handling | Multi-layer (try/catch + boundary) | Graceful degradation |

---

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| PlantUML API downtime | Medium | Fallback to source code display |
| Mermaid bundle size | Low | Lazy loading, code splitting |
| Theme sync issues | Low | Force re-render on theme change |

---

## Success Criteria

- [ ] Mermaid diagrams render correctly
- [ ] PlantUML diagrams render as images
- [ ] Dark/light mode works for Mermaid
- [ ] Error fallbacks work
- [ ] No TypeScript errors
- [ ] Build succeeds

---

## Unresolved Questions

1. Should we cache PlantUML images locally?
2. Do we need a self-hosted PlantUML server for production?
3. Should we support diagram export (PNG/SVG)?

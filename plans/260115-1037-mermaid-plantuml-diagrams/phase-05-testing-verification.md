# Phase 5: Testing & Verification

**Status:** Pending
**Duration:** 30 min
**Dependencies:** All previous phases

---

## Overview

Test all diagram types, error handling, theme switching, and performance.

---

## Test Cases

### 5.1 Mermaid Diagrams

Test content:

```markdown
### Flowchart
\`\`\`mermaid
graph TD
    A[Start] --> B{Decision}
    B -->|Yes| C[Action]
    B -->|No| D[End]
    C --> D
\`\`\`

### Sequence Diagram
\`\`\`mermaid
sequenceDiagram
    participant Alice
    participant Bob
    Alice->>Bob: Hello
    Bob-->>Alice: Hi!
\`\`\`

### Class Diagram
\`\`\`mermaid
classDiagram
    class Animal {
        +String name
        +eat()
    }
    class Dog {
        +bark()
    }
    Animal <|-- Dog
\`\`\`
```

**Verify:**
- [ ] All diagram types render
- [ ] No console errors
- [ ] Loading state shows
- [ ] Error fallback works for invalid syntax

### 5.2 PlantUML Diagrams

Test content:

```markdown
### Use Case
\`\`\`plantuml
@startuml
actor User
participant "Blog System" as System

User -> System : View Post
System -> User : Display Content
@enduml
\`\`\`

### Component
\`\`\`plantuml
@startuml
component "MarkdownRenderer" as MR
component "MermaidDiagram" as MD
component "PlantUMLDiagram" as PD

MR --> MD : renders
MR --> PD : renders
@enduml
\`\`\`
```

**Verify:**
- [ ] SVG images load
- [ ] Fallback works when API unavailable
- [ ] Error message shows on encoding failure
- [ ] Source code displays on error

### 5.3 Theme Switching

**Verify:**
- [ ] Mermaid diagrams update on theme change
- [ ] No visual artifacts after switching
- [ ] Both themes look correct

### 5.4 Performance

**Verify:**
- [ ] Lazy loading works (check network tab)
- [ ] Initial bundle size acceptable
- [ ] No layout shifts
- [ ] Smooth loading states

### 5.5 Error Handling

Test invalid syntax:

```markdown
\`\`\`mermaid
invalid syntax here
\`\`\`

\`\`\`plantuml
@startuml
invalid plantuml
@enduml
\`\`\`
```

**Verify:**
- [ ] Error boundary catches errors
- [ ] Fallback UI displays
- [ ] Source code visible in details
- [ ] App doesn't crash

---

## Build Verification

```bash
# TypeScript check
npx tsc --noEmit

# Build
npm run build

# Dev server
npm run dev
```

**Verify:**
- [ ] No TypeScript errors
- [ ] Build succeeds
- [ ] No runtime errors in console
- [ ] Bundle size acceptable

---

## Success Criteria

- [ ] All Mermaid diagram types render
- [ ] PlantUML diagrams render as images
- [ ] Dark/light mode works
- [ ] Error fallbacks work
- [ ] Lazy loading confirmed
- [ ] No TypeScript/build errors
- [ ] Manual testing passes

---

## Next Steps After Testing

If tests pass:
1. Document diagram syntax in docs
2. Create sample blog post with diagrams
3. Commit and push changes

If tests fail:
1. Document failures
2. Fix issues
3. Re-test

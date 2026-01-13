# Code Standards & Best Practices

This document defines the coding conventions, patterns, and best practices for Dynamite Notes. Following these standards ensures consistency, maintainability, and code quality across the codebase.

## File Organization

### Directory Structure Conventions

```
src/
├── components/           # React components
│   ├── home/            # Page-specific components (landing page)
│   ├── layout/          # Layout components (TopNav, CommandPalette)
│   ├── ui/              # shadcn-ui primitives (never modify directly)
│   └── {feature}/       # Feature-specific components (future)
├── pages/               # Route-level page components
├── hooks/               # Custom React hooks (reusable logic)
├── lib/                 # Utility functions and helpers
├── types/               # TypeScript type definitions (future)
├── constants/           # Application constants (future)
└── styles/              # Global styles (currently in index.css)
```

### File Naming Conventions

**React Components**:
- PascalCase for component files: `ModeSelector.tsx`, `TopNav.tsx`
- Match component name to filename
- One component per file (exceptions for tightly coupled small components)

**Utilities & Hooks**:
- kebab-case for non-component files: `use-mobile.tsx`, `utils.ts`
- Prefix hooks with `use-`: `use-toast.ts`, `use-mobile.tsx`

**Configuration Files**:
- kebab-case with appropriate extensions: `vite.config.ts`, `tailwind.config.ts`

**Type Definitions** (future):
- PascalCase for type files: `Package.ts`, `User.ts`
- Match primary exported type to filename

### Import Organization

**Order** (top to bottom):
1. External libraries (React, third-party)
2. Internal aliases (`@/components`, `@/lib`)
3. Relative imports (`./`, `../`)
4. Type imports (if using type-only imports)
5. CSS imports (if any)

**Example**:
```typescript
// External libraries
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown } from "lucide-react";

// Internal aliases
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Relative imports
import { ModeSelector } from "./ModeSelector";

// Type imports
import type { Package } from "@/types/package";
```

## TypeScript Conventions

### Current Configuration

The project uses **relaxed TypeScript strictness** for rapid iteration:

```json
{
  "noImplicitAny": false,
  "strictNullChecks": false,
  "noUnusedLocals": false,
  "noUnusedParameters": false
}
```

**Implication**: Type safety is advisory, not enforced. Developers must be vigilant about types.

### Type Definitions

**Interface vs Type**:
- Use `interface` for object shapes that may be extended
- Use `type` for unions, intersections, and primitives

**Good**:
```typescript
interface Package {
  id: string;
  name: string;
  difficulty: "starter" | "builder" | "advanced";
}

type Difficulty = "starter" | "builder" | "advanced";
type PackageWithMeta = Package & { createdAt: Date };
```

**Component Props**:
- Define props interfaces inline for simple components
- Extract to named interface for complex or reused props

**Simple** (inline):
```typescript
export const Button = ({
  children,
  variant = "default"
}: {
  children: React.ReactNode;
  variant?: "default" | "outline"
}) => {
  // ...
};
```

**Complex** (named interface):
```typescript
interface PackageCardProps {
  package: Package;
  onExpand: (id: string) => void;
  isExpanded: boolean;
  showDifficulty?: boolean;
}

export const PackageCard = ({
  package,
  onExpand,
  isExpanded,
  showDifficulty = true
}: PackageCardProps) => {
  // ...
};
```

### Type Imports

Use type-only imports when possible (future best practice):
```typescript
import type { Package } from "@/types/package";
```

**Benefit**: Clearer intent, better tree-shaking, faster transpilation.

### Avoid `any`

Even with `noImplicitAny: false`, avoid explicit `any`:

**Bad**:
```typescript
const processData = (data: any) => {
  return data.items.map((item: any) => item.name);
};
```

**Good**:
```typescript
const processData = (data: { items: Array<{ name: string }> }) => {
  return data.items.map(item => item.name);
};
```

**Acceptable**: Use `any` for truly dynamic data (JSON parsing, third-party libs without types).

## React Patterns

### Component Structure

**Standard structure**:
1. Imports
2. Type/interface definitions
3. Component function
4. Exports

**Example**:
```typescript
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface CounterProps {
  initialCount?: number;
}

export const Counter = ({ initialCount = 0 }: CounterProps) => {
  const [count, setCount] = useState(initialCount);

  return (
    <div>
      <p>Count: {count}</p>
      <Button onClick={() => setCount(c => c + 1)}>Increment</Button>
    </div>
  );
};
```

### Component Naming

**Components**: PascalCase
```typescript
export const ModeSelector = () => { /* ... */ };
export const TopNav = () => { /* ... */ };
```

**Component Files**: Match component name
- File: `ModeSelector.tsx`
- Export: `export const ModeSelector = () => { /* ... */ };`

### Exports

**Default exports**: Use for page components
```typescript
// pages/Index.tsx
const Index = () => { /* ... */ };
export default Index;
```

**Named exports**: Use for reusable components
```typescript
// components/home/ModeSelector.tsx
export const ModeSelector = () => { /* ... */ };
```

**Rationale**: Default exports for pages align with React Router patterns. Named exports for components improve refactoring and tree-shaking.

### State Management

**Local State**: Use `useState` for component-specific state
```typescript
const [isOpen, setIsOpen] = useState(false);
const [selectedMode, setSelectedMode] = useState<string | null>(null);
```

**URL State**: Use `useSearchParams` for shareable state
```typescript
const [searchParams, setSearchParams] = useSearchParams();
const mode = searchParams.get("mode") || "pm";

const handleModeChange = (newMode: string) => {
  setSearchParams({ mode: newMode });
};
```

**Route Params**: Use `useParams` for hierarchical navigation
```typescript
const { packageId, itemId } = useParams();
```

**Future Global State**: Consider Context API or Zustand when cross-cutting state emerges. Avoid premature abstraction.

### Event Handlers

**Naming**: Prefix with `handle` or `on`
```typescript
const handleClick = () => { /* ... */ };
const handleSubmit = (e: FormEvent) => { /* ... */ };
```

**Inline vs Named**:
- **Inline**: For trivial handlers (state toggles)
  ```typescript
  <Button onClick={() => setOpen(true)}>Open</Button>
  ```

- **Named**: For handlers with logic or multiple lines
  ```typescript
  const handleFilterChange = (difficulty: Difficulty) => {
    setSearchParams({ difficulty });
    logEvent("filter_applied", { difficulty });
  };

  <Select onValueChange={handleFilterChange}>
  ```

### Conditional Rendering

**Boolean Conditions**: Use `&&` for simple conditionals
```typescript
{isLoading && <Spinner />}
{error && <Alert>{error.message}</Alert>}
```

**Ternary**: Use for if-else scenarios
```typescript
{isAuthenticated ? <Dashboard /> : <Login />}
```

**Complex Conditions**: Extract to variables or early returns
```typescript
const showEmptyState = !isLoading && items.length === 0;
const showContent = !isLoading && items.length > 0;

return (
  <div>
    {isLoading && <Spinner />}
    {showEmptyState && <EmptyState />}
    {showContent && <ItemList items={items} />}
  </div>
);
```

### Lists & Keys

**Always use stable keys**:
```typescript
// Good: Use unique ID
{packages.map(pkg => (
  <PackageCard key={pkg.id} package={pkg} />
))}

// Avoid: Use index only if items never reorder and have no IDs
{items.map((item, index) => (
  <div key={index}>{item}</div>
))}
```

## Styling Conventions

### Tailwind CSS Patterns

**Utility-First Approach**: Compose styles from utility classes

**Good**:
```typescript
<div className="flex items-center gap-4 p-6 rounded-lg bg-surface border border-border">
  <Icon className="w-5 h-5 text-primary" />
  <span className="text-sm text-muted-foreground">Description</span>
</div>
```

**Avoid**: Custom CSS classes for one-off styles

**Bad**:
```css
/* Don't create custom classes for simple layouts */
.custom-card-container {
  display: flex;
  align-items: center;
  gap: 1rem;
}
```

### Responsive Design

**Mobile-First**: Apply base styles for mobile, override for larger screens

```typescript
<div className="
  flex flex-col gap-2       /* mobile: stack vertically */
  md:flex-row md:gap-4     /* tablet+: horizontal layout */
  lg:gap-6                 /* desktop: larger gaps */
">
```

**Breakpoints** (Tailwind defaults):
- `sm`: 640px (mobile landscape)
- `md`: 768px (tablet)
- `lg`: 1024px (desktop)
- `xl`: 1280px (large desktop)
- `2xl`: 1536px (extra large)

### Semantic Color Tokens

**Always use CSS variables, never hard-coded colors**:

**Good**:
```typescript
<div className="bg-surface text-foreground border-border">
<Button className="bg-primary text-primary-foreground">
```

**Bad**:
```typescript
<div className="bg-gray-900 text-white border-gray-800">
```

**Available Tokens** (defined in `index.css`):
- `--background`, `--foreground`
- `--primary`, `--primary-foreground`
- `--secondary`, `--secondary-foreground`
- `--muted`, `--muted-foreground`
- `--accent`, `--accent-foreground`
- `--surface`, `--surface-elevated`
- `--border`, `--ring`, `--glow`
- `--destructive`, `--success`, `--warning`

### Conditional Classes

**Use `cn()` utility** from `@/lib/utils`:

```typescript
import { cn } from "@/lib/utils";

<button className={cn(
  "px-4 py-2 rounded-lg",           // base styles
  isActive && "bg-primary",          // conditional
  disabled && "opacity-50 cursor-not-allowed"
)}>
```

**Never use string concatenation**:
```typescript
// Bad
className={`px-4 py-2 ${isActive ? 'bg-primary' : ''}`}
```

### Component Variants

**Use `class-variance-authority` for complex variants**:

```typescript
import { cva } from "class-variance-authority";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        outline: "border border-border hover:bg-accent",
        ghost: "hover:bg-accent hover:text-accent-foreground",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 px-3",
        lg: "h-11 px-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export const Button = ({ variant, size, className, ...props }) => (
  <button className={cn(buttonVariants({ variant, size }), className)} {...props} />
);
```

**See `src/components/ui/button.tsx` for reference implementation**.

## Data Patterns

### Static Data

**Co-locate with components** (current pattern):
```typescript
// src/pages/Packages.tsx
const packagesData: Package[] = [
  {
    id: "ai-first-pm",
    name: "ai-first-pm",
    description: "AI-first product thinking",
    // ...
  },
  // ... more packages
];
```

**Rationale**: Simple, no over-engineering for static data. When data becomes dynamic, migrate to API calls.

### Future: API Data

**Use TanStack Query** for server state:

```typescript
import { useQuery } from "@tanstack/react-query";
import { fetchPackages } from "@/lib/api";

export const Packages = () => {
  const { data: packages, isLoading, error } = useQuery({
    queryKey: ["packages"],
    queryFn: fetchPackages,
  });

  if (isLoading) return <Spinner />;
  if (error) return <Alert>Failed to load packages</Alert>;

  return <PackageList packages={packages} />;
};
```

**Benefits**: Built-in caching, loading states, error handling, refetching, optimistic updates.

### Data Transformations

**Keep transformations close to usage**:

**Good**:
```typescript
const Packages = () => {
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);

  const filteredPackages = packagesData.filter(
    pkg => !difficulty || pkg.difficulty === difficulty
  );

  return <PackageList packages={filteredPackages} />;
};
```

**Avoid**: Premature abstraction into utility functions unless reused 3+ times.

## Performance Best Practices

### Avoid Unnecessary Re-renders

**Use `React.memo` for expensive components**:
```typescript
export const PackageCard = React.memo(({ package, onExpand }: PackageCardProps) => {
  // Expensive rendering logic
});
```

**Stable callback references** with `useCallback`:
```typescript
const handleExpand = useCallback((id: string) => {
  setExpandedId(id);
  logEvent("package_expanded", { id });
}, []); // Empty deps if no external dependencies
```

### Lazy Loading

**Route-level code splitting** (already implemented via React Router):
```typescript
// Vite automatically code-splits by route
<Route path="/packages" element={<Packages />} />
```

**Component-level lazy loading** (for heavy components):
```typescript
import { lazy, Suspense } from "react";

const HeavyChart = lazy(() => import("@/components/HeavyChart"));

export const Dashboard = () => (
  <Suspense fallback={<Spinner />}>
    <HeavyChart data={data} />
  </Suspense>
);
```

### Image Optimization

**Use appropriate formats**:
- WebP for modern browsers (lighter than PNG/JPG)
- SVG for icons and logos (scalable, small)
- Lazy load images below the fold

**Example**:
```typescript
<img
  src="/images/hero.webp"
  alt="Hero image"
  loading="lazy"
  width={800}
  height={600}
/>
```

## Error Handling

### Current State

**No error boundaries implemented** (future work).

### Component-Level Errors

**Handle errors locally** in components:
```typescript
const [error, setError] = useState<string | null>(null);

const handleAction = async () => {
  try {
    await riskyOperation();
  } catch (err) {
    setError(err instanceof Error ? err.message : "Unknown error");
  }
};

return (
  <>
    {error && <Alert variant="destructive">{error}</Alert>}
    <Button onClick={handleAction}>Do Action</Button>
  </>
);
```

### Future: Error Boundaries

**Wrap routes in error boundaries**:
```typescript
// Future pattern
<ErrorBoundary fallback={<ErrorPage />}>
  <Routes>
    <Route path="/" element={<Index />} />
  </Routes>
</ErrorBoundary>
```

## Accessibility Standards

### Semantic HTML

**Use correct HTML elements**:

**Good**:
```typescript
<nav>
  <ul>
    <li><a href="/packages">Packages</a></li>
  </ul>
</nav>

<main>
  <h1>Page Title</h1>
  <article>Content</article>
</main>
```

**Bad**:
```typescript
<div className="nav">
  <div className="link">Packages</div>
</div>
```

### Keyboard Navigation

**All interactive elements must be keyboard-accessible**:

**Good**:
```typescript
<button onClick={handleClick}>Click Me</button>
<a href="/packages">Packages</a>
```

**Avoid**: `<div onClick={...}>` without `role`, `tabIndex`, and keyboard handlers.

**If using `div` for interactive elements** (rare cases):
```typescript
<div
  role="button"
  tabIndex={0}
  onClick={handleClick}
  onKeyDown={(e) => {
    if (e.key === "Enter" || e.key === " ") {
      handleClick();
    }
  }}
>
  Clickable Div
</div>
```

### ARIA Labels

**Add labels for screen readers**:
```typescript
<button aria-label="Close dialog" onClick={onClose}>
  <X className="w-4 h-4" />
</button>

<input type="search" placeholder="Search..." aria-label="Search packages" />
```

**shadcn-ui components include ARIA by default** - leverage them.

### Focus Management

**Visible focus indicators** (Tailwind default: `focus-visible:ring-2`):
```typescript
<button className="focus-visible:ring-2 focus-visible:ring-ring">
  Submit
</button>
```

**Trap focus in modals**:
```typescript
// shadcn-ui Dialog component handles this automatically
<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogContent>
    {/* Focus is trapped within dialog */}
  </DialogContent>
</Dialog>
```

## Testing (Future)

### Testing Stack (Not Yet Implemented)

**Planned**:
- **Vitest**: Unit and integration tests
- **React Testing Library**: Component tests
- **Playwright**: E2E tests

### Testing Patterns

**Unit Tests**: Test pure functions and utilities
```typescript
// src/lib/utils.test.ts
import { cn } from "./utils";

describe("cn", () => {
  it("merges class names", () => {
    expect(cn("px-4", "py-2")).toBe("px-4 py-2");
  });

  it("handles conditional classes", () => {
    expect(cn("base", false && "hidden", "visible")).toBe("base visible");
  });
});
```

**Component Tests**: Test user interactions
```typescript
// src/components/ModeSelector.test.tsx
import { render, screen, fireEvent } from "@testing-library/react";
import { ModeSelector } from "./ModeSelector";

test("selects mode on click", () => {
  render(<ModeSelector />);
  const pmButton = screen.getByText(/PM/i);
  fireEvent.click(pmButton);
  expect(pmButton).toHaveClass("bg-primary");
});
```

## Git Conventions

### Commit Messages

**Format**: `<type>: <description>`

**Types**:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, no logic change)
- `refactor`: Code restructuring (no feature or bug change)
- `test`: Add or update tests
- `chore`: Build process, tooling, dependencies

**Examples**:
```
feat: add difficulty filter to packages page
fix: command palette not closing on mobile
docs: update README with deployment instructions
refactor: extract package card into separate component
```

**Length**: < 72 characters for first line, detailed body if needed.

### Branch Naming

**Pattern**: `<type>/<short-description>`

**Examples**:
- `feat/user-authentication`
- `fix/mobile-nav-overflow`
- `docs/api-documentation`
- `refactor/state-management`

### Pull Request Guidelines

**Title**: Same format as commit messages
**Description**:
- What changed and why
- Any breaking changes
- Screenshots for UI changes
- Testing performed

---

**See Also**: [Code Review Guidelines](./code-review-guidelines.md) for review checklists, anti-patterns, and maintenance guidelines.

---

**Document Version**: 1.0
**Last Updated**: 2026-01-13
**Next Review**: Q2 2026
**Owner**: Engineering Team

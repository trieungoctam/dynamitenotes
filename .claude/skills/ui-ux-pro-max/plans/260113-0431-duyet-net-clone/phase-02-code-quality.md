---
title: "Phase 2: Code Quality"
description: "Modularize large files, enable TypeScript strict mode, add testing"
status: pending
priority: P1
effort: 6h
---

## Context

**Source:** [Code Review](../../reports/code-reviewer-260113-0431-dynamite-notes.md)

**Issues:** 8 files >200 lines, 0% test coverage, relaxed TypeScript config

## Requirements

From code review, must address:

### Critical (P0)
1. 8 files exceeding 200 lines (development rule violation)
2. Zero test coverage (0%)
3. Missing error boundaries
4. Empty catch blocks in admin pages

### High (P1)
5. Relaxed TypeScript configuration
6. Console statements in production code
7. Limited performance optimization
8. Missing loading states

## Implementation Steps

### Step 1: Modularize Large Files (3 hours)

**Files to split:**
1. `src/components/ui/sidebar.tsx` (637 lines) → Split into 10 files
2. `src/pages/admin/PostEditor.tsx` (463 lines) → Extract 4 modules
3. `src/pages/admin/SeriesEditor.tsx` (457 lines) → Extract 4 modules
4. `src/pages/Resume.tsx` (401 lines) → Split into components
5. `src/pages/admin/PhotosAdmin.tsx` (391 lines) → Extract gallery logic
6. `src/types/database.ts` (333 lines) → Split by table
7. `src/pages/admin/InsightEditor.tsx` (308 lines) → Extract form logic
8. `src/components/ui/chart.tsx` (303 lines) → Split chart types

**Example - sidebar.tsx split:**

```bash
# Create directory structure
mkdir -p src/components/ui/sidebar

# Split into files:
# - index.tsx (main export, ~50 lines)
# - SidebarProvider.tsx (~80 lines)
# - SidebarTrigger.tsx (~30 lines)
# - SidebarContent.tsx (~100 lines)
# - SidebarHeader.tsx (~40 lines)
# - SidebarFooter.tsx (~40 lines)
# - SidebarMenu.tsx (~80 lines)
# - SidebarMenuItem.tsx (~50 lines)
# - constants.ts (~20 lines)
# - types.ts (~30 lines)
```

**Example - database.ts split:**

```bash
mkdir -p src/types/database

# Split by table:
# - index.ts (re-exports)
# - posts.ts
# - insights.ts
# - series.ts
# - photos.ts
# - taxonomy.ts
# - resume.ts
# - about.ts
# - common.ts
```

**Success:** All files <200 lines, clear single responsibility

### Step 2: Enable TypeScript Strict Mode (1 hour)

**Current state:**
```json
{
  "strict": false,
  "noImplicitAny": false,
  "strictNullChecks": false
}
```

**Step-by-step migration:**

```json
// 1. Enable strict mode first
{
  "strict": true
}

// 2. Fix resulting errors incrementally
// 3. Add additional checks
{
  "noUnusedLocals": true,
  "noUnusedParameters": true,
  "noUncheckedIndexedAccess": true
}
```

**Process:**
1. Enable `strict: true`
2. Run `tsc --noEmit` to see errors
3. Fix in batches (10-20 files at a time)
4. Commit after each batch
5. Enable additional checks incrementally

**Success:** TypeScript strict mode enabled, 0 TS errors

### Step 3: Add Error Boundaries (30 min)

Create reusable error boundary:

```typescript
// src/components/ErrorBoundary.tsx
import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Error caught by boundary:', error, errorInfo);
    // Send to error tracking service
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Something went wrong</h1>
          <p className="text-neutral-600">Please refresh the page</p>
        </div>
      );
    }

    return this.props.children;
  }
}
```

Wrap routes in `App.tsx`:

```typescript
<ErrorBoundary>
  <Routes>
    {/* ... routes */}
  </Routes>
</ErrorBoundary>
```

**Success:** All routes wrapped in error boundaries

### Step 4: Fix Empty Catch Blocks (30 min)

**Before (BAD):**
```typescript
} catch {
  // Silent failure
}
```

**After (GOOD):**
```typescript
} catch (error) {
  console.error('Failed to delete post:', error);
  toast.error('Failed to delete post. Please try again.');
}
```

Update files:
- `src/pages/admin/PostsAdmin.tsx`
- `src/pages/admin/InsightsAdmin.tsx`
- `src/pages/admin/SeriesAdmin.tsx`

**Success:** All catch blocks have error handling + user feedback

### Step 5: Set Up Testing Framework (1 hour)

Install dependencies:

```bash
bun add -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

Configure `vite.config.ts`:

```typescript
export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.tsx', 'src/**/*.ts'],
      all: true,
      lines: 70,
      functions: 70,
      branches: 70,
      statements: 70
    }
  }
});
```

Create test setup:

```typescript
// src/test/setup.ts
import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

afterEach(() => {
  cleanup();
});
```

Write first 5 critical tests:

```typescript
// src/components/ErrorBoundary.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ErrorBoundary } from './ErrorBoundary';

describe('ErrorBoundary', () => {
  it('renders children when no error', () => {
    render(
      <ErrorBoundary>
        <div>Test Content</div>
      </ErrorBoundary>
    );
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('renders fallback when error occurs', () => {
    // ... test error state
  });
});
```

**Success:** Vitest configured, 5+ tests passing, coverage > 0%

## Success Criteria

- [ ] All 8 files modularized to <200 lines
- [ ] TypeScript strict mode enabled with 0 errors
- [ ] Error boundaries wrap all routes
- [ ] All catch blocks have error handling
- [ ] Vitest configured with 5+ tests passing
- [ ] Console statements replaced with proper logging

## Risk Assessment

**Medium Risk:** TypeScript strict mode may introduce 100+ errors

**Mitigation:**
1. Enable incrementally (strict → fix errors → additional checks)
2. Fix in small batches with commits
3. Use `@ts-ignore` sparingly as temporary workaround
4. Allocate extra time for this step

## Next Steps

After code quality improvements complete, proceed to [Phase 3: Design System](./phase-03-design-system.md)

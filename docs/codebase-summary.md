# Codebase Summary

## Overview

Dynamite Notes is a PM knowledge base and learning platform focused on AI-first product development. Built as a single-page application (SPA) using React 18, TypeScript, and Vite, the project emphasizes keyboard-first navigation, glassmorphism design aesthetics, and educational content delivery.

**Current Version**: v2.4.0
**Build Tool**: Vite 5.4 with React SWC
**Package Manager**: bun
**Design System**: shadcn-ui with Tailwind CSS
**Typography**: Geist Mono (monospace-first)

## Repository Metrics

Based on repomix analysis:
- **Total Files**: 90 files
- **Total Tokens**: 202,740 tokens
- **Total Characters**: 596,223 chars
- **Largest File**: release-manifest.json (69% of codebase)

### Top Files by Complexity
1. `src/components/ui/sidebar.tsx` - 5,794 tokens (advanced UI component)
2. `src/pages/Packages.tsx` - 2,556 tokens (main content navigation)
3. `src/components/ui/chart.tsx` - 2,283 tokens (data visualization)
4. `src/components/ui/menubar.tsx` - 1,986 tokens (navigation component)

## Directory Structure

```
/Users/dynamite/workspaces/com.dynamite/dynamitenotes/
├── .claude/                    # AI assistant configuration
├── .opencode/                  # Development tooling
├── docs/                       # Project documentation (you are here)
├── plans/                      # Development plans and reports
├── public/                     # Static assets
│   ├── favicon.ico
│   ├── placeholder.svg
│   └── robots.txt
├── src/                        # Source code
│   ├── components/             # React components
│   │   ├── home/               # Landing page components (4 files)
│   │   ├── layout/             # App layout components (3 files)
│   │   └── ui/                 # shadcn-ui components (48 files)
│   ├── hooks/                  # Custom React hooks (2 files)
│   ├── lib/                    # Utility libraries (1 file)
│   ├── pages/                  # Route page components (6 files)
│   ├── App.tsx                 # Root application component
│   ├── main.tsx                # Application entry point
│   └── index.css               # Global styles
├── AGENTS.md                   # AI agent orchestration guide
├── CLAUDE.md                   # Claude Code integration guide
├── package.json                # Dependencies and scripts
├── tailwind.config.ts          # Tailwind configuration
├── tsconfig.json               # TypeScript configuration
└── vite.config.ts              # Vite build configuration
```

## Architecture

### Application Entry Flow

```
index.html
  └─> src/main.tsx (React DOM render)
      └─> App.tsx (Provider setup)
          └─> QueryClientProvider
              └─> TooltipProvider
                  └─> BrowserRouter
                      └─> TopNav + CommandPalette
                          └─> Routes
```

### Provider Stack (Outer to Inner)

1. **QueryClientProvider** - TanStack Query for data fetching (configured but not actively used)
2. **TooltipProvider** - Radix UI tooltip context
3. **BrowserRouter** - React Router v6 for client-side routing

### Routing Structure

| Route | Component | Description |
|-------|-----------|-------------|
| `/` | Index | Landing page with mode selector, popular packages, changelog |
| `/packages` | Packages | Learning path catalog with difficulty filtering |
| `/packages/:packageId` | Packages | Specific package detail view |
| `/packages/:packageId/:itemId` | Packages | Individual package item |
| `/docs` | Docs | Documentation templates and frameworks |
| `/docs/:docId` | Docs | Specific document view |
| `/playground` | Playground | Interactive tools and experiments |
| `/playground/:playgroundId` | Playground | Specific playground tool |
| `/changelog` | Changelog | Version history timeline |
| `/*` | NotFound | 404 error page |

## Component Architecture

### Component Organization

**Total Components**: 65+ React components

#### Layout Components (3)
- `TopNav` - Global navigation bar with command palette trigger
- `CommandPalette` - Keyboard-driven navigation (Cmd+K)
- `ThemeToggle` - Dark/light mode switcher (currently dark-only)

#### Home Page Components (4)
- `ReadmeHeader` - Project introduction header
- `ModeSelector` - PM/AI/Snack mode filter
- `PopularPackages` - Featured package preview cards
- `RecentChangelog` - Latest version updates

#### UI Components (48)
Complete shadcn-ui component library including:
- **Forms**: Button, Input, Textarea, Select, Checkbox, Radio, Switch, Slider
- **Data Display**: Table, Card, Badge, Avatar, Skeleton
- **Feedback**: Alert, Toast, Dialog, Drawer, HoverCard
- **Navigation**: Tabs, Accordion, Menubar, Breadcrumb, Pagination
- **Layout**: Separator, Resizable, ScrollArea, Sidebar
- **Charts**: Chart component with recharts integration

#### Utility Components (1)
- `NavLink` - Router-aware navigation link with active states

### Component Patterns

**State Management**:
- Component-local state via `useState`
- URL state via `useSearchParams`
- No global state management library (Redux, Zustand, etc.)

**Data Patterns**:
- Static data defined in components (no backend yet)
- TanStack Query configured but unused (ready for API integration)

**Styling Approach**:
- Tailwind utility classes
- CSS custom properties for theming (`--background`, `--primary`, etc.)
- Class variance authority for component variants
- tailwind-merge for conditional class merging

## Key Technologies

### Core Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.3.1 | UI framework |
| TypeScript | 5.8.3 | Type safety |
| Vite | 5.4.19 | Build tool & dev server |
| React Router | 6.30.1 | Client-side routing |
| Tailwind CSS | 3.4.17 | Utility-first styling |

### UI Component Library

| Package | Purpose |
|---------|---------|
| @radix-ui/* (25+ packages) | Unstyled accessible primitives |
| shadcn-ui | Pre-styled Radix components |
| lucide-react | Icon library (462 icons) |
| cmdk | Command palette (Cmd+K interface) |
| next-themes | Theme management |
| vaul | Drawer component |
| sonner | Toast notifications |

### Form & Data Handling

| Package | Purpose |
|---------|---------|
| react-hook-form | Form state management |
| @hookform/resolvers | Form validation integration |
| zod | Schema validation |
| @tanstack/react-query | Server state management (ready) |

### Additional Libraries

| Package | Purpose |
|---------|---------|
| date-fns | Date manipulation |
| embla-carousel-react | Carousel component |
| recharts | Chart visualization |
| react-resizable-panels | Resizable layouts |
| class-variance-authority | Component variant styling |
| tailwindcss-animate | Animation utilities |

## Configuration

### TypeScript Configuration

**Strictness**: Relaxed (quick iteration over strict type safety)
- `noImplicitAny: false`
- `strictNullChecks: false`
- `noUnusedLocals: false`
- `noUnusedParameters: false`

**Path Aliases**:
- `@/*` → `./src/*`

### Vite Configuration

**Dev Server**:
- Host: `::` (all network interfaces)
- Port: `8080`

**Plugins**:
- `@vitejs/plugin-react-swc` - Fast refresh with SWC
- `lovable-tagger` (dev only) - Component tagging for Lovable platform

### Tailwind Configuration

**Theme Extensions**:
- **Fonts**: Geist Mono for all font families (sans, mono, serif)
- **Colors**: CSS variable-based theme system (12 color tokens)
- **Animations**: Custom fade-in, slide-in, glow-pulse, accordion
- **Custom Colors**: `glow`, `surface`, `surface-elevated`, `success`, `warning`

**Dark Mode**: Class-based (`class` strategy)

### ESLint Configuration

**Plugins**:
- `@eslint/js`
- `typescript-eslint`
- `eslint-plugin-react-hooks`
- `eslint-plugin-react-refresh`

## Data Models

### Package Structure

```typescript
interface Package {
  id: string;                          // kebab-case identifier
  name: string;                        // display name
  description: string;                 // short description
  icon: React.ReactNode;               // Lucide icon component
  difficulty: "starter" | "builder" | "advanced";
  timeToComplete: string;              // human-readable duration
  items: PackageItem[];
}

interface PackageItem {
  id: string;                          // item identifier
  title: string;                       // display title
  type: "article" | "template" | "playground";
  readTime: string;                    // estimated read time
}
```

**Current Packages** (6 total):
1. `ai-first-pm` - AI-first product thinking (builder, 4 hours)
2. `experiments` - A/B testing & rapid prototyping (starter, 2 hours)
3. `user-research` - Understanding user needs (starter, 3 hours)
4. `metrics` - Data-driven decision making (builder, 5 hours)
5. `go-to-market` - Launch strategy (advanced, 6 hours)
6. `stakeholders` - Communication & influence (builder, 4 hours)

### Document Structure

Documents in the `/docs` route follow a simple structure (implementation varies):
- Featured documents with icons
- Type classification (template, framework, checklist)
- Read time estimation

### Changelog Entry Structure

Changelog entries include:
- Version number (semantic versioning)
- Release date
- Changes categorized by type
- Optional descriptions

## Development Patterns

### Code Organization Principles

1. **Component Locality**: Each page component is self-contained
2. **Static Data Co-location**: Data defined alongside components (no external data layer yet)
3. **UI Abstraction**: Business components compose shadcn-ui primitives
4. **Hook Reusability**: Shared logic extracted to custom hooks

### Naming Conventions

**Files**:
- React components: PascalCase (e.g., `ModeSelector.tsx`)
- Utilities/hooks: kebab-case (e.g., `use-mobile.tsx`, `utils.ts`)
- Config files: kebab-case with extensions (e.g., `vite.config.ts`)

**Components**:
- Named exports for pages: `export default Index`
- Named exports for reusable components: `export { Button }`
- Props interfaces: `{ComponentName}Props` (when needed)

**CSS Classes**:
- Utility-first Tailwind classes
- BEM convention avoided (Tailwind replaces this)
- Custom CSS variables: kebab-case with `--` prefix

### State Management Strategy

**Current Approach**:
- Local state for UI interactions (`useState`)
- URL state for shareable views (`useSearchParams`, route params)
- No global state manager (not needed for current scale)

**Future Considerations**:
- TanStack Query ready for API integration
- Context API available for cross-cutting concerns
- Consider Zustand/Jotai if global state becomes complex

### Styling Guidelines

**Approach**: Utility-first with semantic design tokens

**Pattern**:
```tsx
// Good: Semantic color tokens
<div className="bg-surface border-border text-foreground">

// Avoid: Hard-coded Tailwind colors
<div className="bg-gray-900 border-gray-800 text-white">
```

**Custom Properties**:
All colors map to CSS variables defined in `src/index.css`:
- `--background`, `--foreground`
- `--primary`, `--primary-foreground`
- `--muted`, `--muted-foreground`
- `--accent`, `--accent-foreground`
- `--surface`, `--surface-elevated`
- `--border`, `--ring`, `--glow`

## Build & Deployment

### Available Scripts

| Script | Command | Purpose |
|--------|---------|---------|
| `dev` | `vite` | Start dev server on port 8080 |
| `build` | `vite build` | Production build to `dist/` |
| `build:dev` | `vite build --mode development` | Dev mode build |
| `lint` | `eslint .` | Run ESLint on codebase |
| `preview` | `vite preview` | Preview production build locally |

### Build Output

**Target**: Modern browsers (ES2020+)
**Output Directory**: `dist/`
**Entry Point**: `index.html` → `src/main.tsx`

### Environment Modes

- **Development**: Dev server with HMR, component tagging enabled
- **Production**: Optimized bundle with minification, no dev tools

## Current State & Gaps

### Implemented Features
- Complete UI component library (shadcn-ui)
- Client-side routing with 6 pages
- Command palette navigation (Cmd+K)
- Dark mode by default
- Static content for packages, docs, playground
- Responsive design with mobile breakpoints

### Not Yet Implemented
- Backend API integration (TanStack Query configured but unused)
- User authentication/authorization
- Data persistence (everything is static)
- Server-side rendering / SSG
- Real-time features
- Analytics integration
- SEO optimization
- Content management system
- Search functionality (beyond command palette)
- User progress tracking
- Interactive playground implementations

### Technical Debt
- Relaxed TypeScript strictness (expedites development, increases runtime risk)
- No unit/integration tests
- No CI/CD pipeline configured
- No error boundary implementation
- No loading states for future async operations
- Large release-manifest.json (69% of codebase size)
- No code splitting beyond React Router routes

## Integration Points

### Future Backend Considerations

When adding a backend, these integration points are ready:
- **TanStack Query**: Already configured in App.tsx
- **API Client**: Add to `src/lib/` directory
- **Environment Variables**: Vite supports `.env` files
- **Authentication**: Consider adding to provider stack in App.tsx

### Content Management

Current static data locations to replace:
- Package definitions in `src/pages/Packages.tsx`
- Document listings in `src/pages/Docs.tsx`
- Playground tools in `src/pages/Playground.tsx`
- Changelog entries in `src/pages/Changelog.tsx`

### Analytics Integration

Recommended integration points:
- Route change tracking in `App.tsx` via `useLocation` hook
- Custom event tracking via utility functions in `src/lib/`
- Performance monitoring via Vite plugins

## Development Workflow

### Local Development

1. Install dependencies: `bun install`
2. Start dev server: `bun dev`
3. Access at: `http://localhost:8080`
4. Hot module replacement (HMR) active

### Code Quality

**Linting**: ESLint with TypeScript support
**Formatting**: Not configured (consider adding Prettier)
**Type Checking**: TypeScript in relaxed mode

### File Modification Frequency

Based on Git change tracking (repomix sorts by change count):
- Most modified: Release manifest, package files
- Least modified: UI components (stable after initial setup)

## Security Considerations

**Repomix Security Check**: No suspicious files detected

**Current Security Posture**:
- Client-side only (no auth/secrets exposure risk)
- No external API calls yet
- Standard npm dependency vulnerabilities apply

**Future Security Needs**:
- Environment variable management for API keys
- CORS configuration when adding backend
- Input validation and XSS prevention
- Rate limiting for API calls
- Authentication token management

## Performance Characteristics

### Bundle Size Considerations

**Large Dependencies**:
- 25+ Radix UI packages (tree-shakeable)
- React ecosystem (React, ReactDOM, Router)
- Tailwind CSS (purged in production)
- Recharts (chart library, ~200KB)

**Optimization Strategies**:
- Vite's automatic code splitting by route
- Lazy loading for heavy components (can be improved)
- Tree-shaking for unused library code
- Minification in production builds

### Runtime Performance

**Rendering Strategy**: Client-side only (no SSR)
**State Updates**: Local state minimizes unnecessary re-renders
**Navigation**: Client-side routing (no full page reloads)

## Extensibility

### Adding New Pages

1. Create component in `src/pages/`
2. Add route in `src/App.tsx`
3. Update navigation in `TopNav` and `CommandPalette`

### Adding New Components

1. Create in appropriate `src/components/` subdirectory
2. Import shadcn-ui primitives from `src/components/ui/`
3. Follow existing component patterns

### Adding New Styles

1. Extend `tailwind.config.ts` for theme changes
2. Add CSS variables to `src/index.css` for semantic tokens
3. Use `cn()` utility from `src/lib/utils.ts` for conditional classes

## Maintenance Notes

### Dependency Updates

**Update Frequency**: Check monthly for security patches
**Breaking Changes**: Monitor Radix UI and React Router releases
**Version Pinning**: Currently using `^` (minor version flexibility)

### Documentation Synchronization

Keep these docs updated when:
- Adding/removing routes
- Changing component architecture
- Updating build configuration
- Modifying TypeScript strictness
- Adding new dependencies

---

**Generated**: 2026-01-13
**Codebase Version**: v2.4.0
**Documentation Maintainer**: docs-manager agent

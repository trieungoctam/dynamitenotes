# Core Application Structure Analysis Report

**Generated**: 2026-01-13  
**Project**: Dynamite Notes (React + Vite + TypeScript + shadcn-ui)  
**Package Manager**: bun

---

## 1. App Architecture

### Entry Point Flow
```
index.html → src/main.tsx → App.tsx → BrowserRouter → Pages
```

**Key Setup (`main.tsx`):**
- React 18 createRoot rendering
- ThemeProvider from `next-themes` wrapping entire app
- Default theme: system with dark/light support

**Root Component (`App.tsx`):**
- Provider stack: QueryClientProvider > TooltipProvider
- Global layout: TopNav + CommandPalette + Routes
- Dark mode forced by default via useEffect
- Global keyboard shortcut: Cmd/Ctrl+K for command palette
- Fixed top navigation with `pt-14` content offset

### Routing Structure
```
/ → Index (home)
/packages → Packages (with optional :packageId/:itemId params)
/docs → Docs (with optional :docId param)
/playground → Playground (with optional :playgroundId param)
/changelog → Changelog
/* → NotFound (404)
```

**Routing Strategy:**
- React Router v6 with BrowserRouter
- Nested routes for packages, docs, playground
- URL params for deep linking (packageId, itemId, docId, playgroundId)
- Query params for mode selection (`?mode=pm|ai|quick`)

---

## 2. Pages Summary

### `/` - Index (Home)
**Components:**
- ReadmeHeader: Hero/intro section
- ModeSelector: 3 learning paths (PM/AI/Snack modes)
- PopularPackages: Featured content preview
- RecentChangelog: Latest updates

**Purpose:** Landing page with mode selection for personalized learning paths

### `/packages` - Packages
**Functionality:**
- Displays 6 knowledge packages (ai-first-pm, experiments, prompts, metrics, gtm, career)
- Difficulty filtering (starter/builder/advanced)
- Expandable package tree structure
- Shows time estimates, item counts, types (article/template/playground)
- Supports mode query param for filtered views

**Data Model:**
```ts
Package {
  id, name, description, icon, difficulty, timeToComplete,
  items: [{ id, title, type, readTime }]
}
```

### `/docs` - Docs (Templates & Playbooks)
**Content Types:**
- Templates (PRD, User Research)
- Checklists (Experiment, Launch)
- Frameworks (Positioning, Metrics)

**Features:**
- Copy to clipboard functionality
- Download counter simulation
- Filter by type (all/template/checklist/framework)
- 6 featured documents with metadata

### `/playground` - Interactive Playgrounds
**Active Playgrounds:**
1. Prompt Lab (15 min)
2. Experiment Builder (20 min)
3. PRD Generator Lite (10 min)
4. Positioning Workshop (30 min) - Coming Soon

**UX Pattern:** Gradient hover effects, time estimates, coming soon badges

### `/changelog` - Release Notes
**Entry Structure:**
```ts
{
  version, date, title, type (feature/update/content),
  description, details[], link?
}
```

**Latest:** v2.4.0 - Prompt Lab feature (Jan 12, 2026)
**Display:** Timeline with icons, color-coded types, expandable details

### `/404` - NotFound
**Behavior:**
- Logs route to console.error
- Simple centered layout
- Return to home link
- Uses muted background

---

## 3. Styling System

### CSS Architecture
**Base:** Tailwind CSS with custom design tokens via CSS variables

**Theme Strategy:**
- CSS variables in `index.css` for light/dark modes
- HSL color system with CSS custom properties
- All fonts use Geist Mono (monospace) for distinctive tech aesthetic

**Color Palette:**
```css
/* Dark Mode Primaries */
--background: 0 0% 4%
--foreground: 0 0% 98%
--primary: 0 0% 45% (gray-based neutral)
--surface: 0 0% 6% / elevated: 9%
--code-bg: 0 0% 12%
```

**Custom Design Tokens:**
- `--glow`: Subtle glow effects
- `--surface` / `--surface-elevated`: Layering system
- `--code-bg`: Code block backgrounds
- `--success` / `--warning`: Semantic colors

### Custom Utility Classes
**Glass morphism:**
```css
.glass → bg-surface-elevated/80 backdrop-blur-xl border
.glass-hover → hover:bg-surface-elevated transition
```

**Animations:**
- `fade-in`: Opacity + translateY (stagger on lists)
- `slide-in`: Opacity + translateX (nested items)
- `glow-pulse`: Subtle box-shadow pulse
- `animate-pulse-slow`: 3s infinite pulse

**Typography:**
- `.code-label`: Monospace tags (e.g., `/packages`)
- `.glow-text`: Text shadow for emphasis
- All headings use Geist Mono for consistency

### Tailwind Config Highlights
- Container: centered, max-width 1400px
- Border radius: `--radius` base (0.5rem)
- Custom animations: accordion, fade-in, slide-in, glow-pulse
- Extended colors: glow, surface, success, warning

---

## 4. Build Configuration

### Vite Setup (`vite.config.ts`)
```ts
Server: port 8080, host "::"
Plugins: 
  - @vitejs/plugin-react-swc (Fast React refresh)
  - lovable-tagger (dev only, component tagging)
Alias: "@" → "./src"
```

### TypeScript Configuration
**3-file strategy:**
1. `tsconfig.json` (root): References app + node configs, path aliases
2. `tsconfig.app.json`: Main app config (ES2020, JSX, bundler mode)
3. `tsconfig.node.json`: Vite config types (ES2023, strict)

**Strictness:** Intentionally relaxed
- `strict: false`
- `noImplicitAny: false`
- `noUnusedLocals/Parameters: false`
- Allows rapid prototyping with less type overhead

### ESLint Config (`eslint.config.js`)
- TypeScript ESLint base
- React Hooks plugin (recommended rules)
- React Refresh warnings for HMR
- Disabled: `@typescript-eslint/no-unused-vars`
- Ignores: `dist/`

### PostCSS
- Minimal: TailwindCSS + Autoprefixer

---

## 5. Key Patterns

### State Management
**Approach:** Minimal, component-local state
- `useState` for UI state (command palette, filters, expanded items)
- No global state library (Redux, Zustand)
- TanStack Query ready (QueryClientProvider set up but not actively used)

### Data Fetching
**Current:** Static in-file data (changelog, packages, docs, playgrounds)
- No backend API calls yet
- TanStack Query configured for future use
- All content hardcoded as constants

### Component Composition
**Patterns:**
- Layout components: TopNav, CommandPalette
- Home components: ReadmeHeader, ModeSelector, PopularPackages
- UI components: shadcn/ui library (60+ components available)
- Page components: Self-contained route handlers

**Prop Drilling:** Minimal
- Command palette controlled via App.tsx state
- Theme managed by next-themes context

### URL State
- Query params for modes (`?mode=pm`)
- Route params for nested navigation (`:packageId/:itemId`)
- `useSearchParams` and `useNavigate` from react-router-dom

### Keyboard Navigation
- Global: Cmd/Ctrl+K → command palette
- Command palette: Arrow keys, Enter, Escape
- Accessibility-focused with kbd shortcuts

---

## 6. Dependencies Analysis

### Core Libraries
**React Ecosystem:**
- `react` 18.3.1, `react-dom` 18.3.1
- `react-router-dom` 6.30.1 (routing)
- `@tanstack/react-query` 5.83.0 (data fetching, ready but unused)

**UI Framework:**
- `@radix-ui/*` (25+ primitives for accessible components)
- `shadcn-ui` pattern (components in `src/components/ui/`)
- `lucide-react` 0.462.0 (icons)
- `cmdk` 1.1.1 (command palette base)

**Styling:**
- `tailwindcss` 3.4.17
- `tailwindcss-animate` 1.0.7
- `class-variance-authority` 0.7.1 (variant utilities)
- `clsx` + `tailwind-merge` (className merging)

**Theme:**
- `next-themes` 0.3.0 (dark/light mode)

**Forms (unused currently):**
- `react-hook-form` 7.61.1
- `@hookform/resolvers` 3.10.0
- `zod` 3.25.76 (validation)

**Charts (unused currently):**
- `recharts` 2.15.4

**Other:**
- `sonner` 1.7.4 (toast notifications)
- `date-fns` 3.6.0 (date utilities)
- `vaul` 0.9.9 (drawer component)

### Dev Dependencies
- `vite` 5.4.19 (build tool)
- `typescript` 5.8.3
- `@vitejs/plugin-react-swc` (fast refresh)
- `eslint` 9.32.0 + TypeScript ESLint
- `lovable-tagger` 1.1.13 (dev tagging)
- `@tailwindcss/typography` 0.5.16 (prose styles)

**Notable:** No test framework installed (Jest, Vitest, Testing Library)

---

## 7. File Structure

```
dynamitenotes/
├── src/
│   ├── main.tsx                  # Entry point
│   ├── App.tsx                   # Root component
│   ├── App.css                   # Legacy styles (minimal use)
│   ├── index.css                 # Tailwind + theme variables
│   ├── vite-env.d.ts             # Vite types
│   ├── pages/
│   │   ├── Index.tsx
│   │   ├── Packages.tsx
│   │   ├── Docs.tsx
│   │   ├── Playground.tsx
│   │   ├── Changelog.tsx
│   │   └── NotFound.tsx
│   ├── components/
│   │   ├── layout/               # TopNav, CommandPalette, ThemeToggle
│   │   ├── home/                 # Home page components
│   │   ├── ui/                   # shadcn-ui components (60+)
│   │   └── NavLink.tsx
│   └── lib/
│       └── utils.ts              # cn() utility (clsx + twMerge)
├── index.html                    # HTML template
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig*.json
├── eslint.config.js
├── postcss.config.js
├── components.json               # shadcn-ui config
└── package.json
```

**Component Count:**
- Pages: 6
- Layout components: 3
- Home components: 4
- UI components: 60+ (shadcn-ui)

---

## 8. Design System Highlights

### Typography Scale
- All fonts: Geist Mono (loaded from Google Fonts)
- Monospace-first design (technical aesthetic)
- `.code-label`: Small tags for routes/functions
- `font-mono` class applied globally

### Spacing & Layout
- Container: `max-w-7xl` equivalent (1400px)
- Padding: `px-4 md:px-6` (responsive)
- Top nav: Fixed `h-14` height
- Content offset: `pt-14` to account for fixed nav

### Interactive Elements
- Hover states: `glass-hover` pattern
- Click targets: Minimum `p-2` (touch-friendly)
- Transitions: 300ms default, 500ms for gradients
- Focus: Ring styles via `--ring` CSS variable

### Iconography
- Lucide React icons throughout
- Consistent sizing: `w-4 h-4` (small), `w-5 h-5` (medium), `w-8 h-8` (large)
- Icon colors match text color (foreground/muted-foreground)

---

## 9. Notable Implementation Details

### Command Palette Implementation
- Keyboard-first UX (arrow keys, enter, escape)
- Grouped by category (Navigation, Packages)
- Fuzzy search on label + description
- Auto-focus on open, body scroll lock
- Selected index tracking for keyboard nav

### Theme Management
- Default: Dark mode forced on mount
- next-themes provider: Supports system/light/dark
- Class-based theming (`class="dark"`)
- CSS variables for all colors (easy theme switching)

### Animation Strategy
- Staggered fade-in on list items (100ms delay increments)
- Slide-in for nested items (50ms delay increments)
- CSS animations in Tailwind config (not JS-based)
- Inline styles for dynamic delays (`style={{ animationDelay }}`)

### Accessibility Features
- Semantic HTML (header, main, nav)
- ARIA roles implied by Radix UI components
- Keyboard shortcuts with visual indicators (kbd elements)
- Focus management in command palette
- Color contrast via HSL system

---

## 10. Build & Deploy

### Scripts (package.json)
```json
{
  "dev": "vite",                      // Dev server (port 8080)
  "build": "vite build",              // Prod build
  "build:dev": "vite build --mode development",
  "lint": "eslint .",
  "preview": "vite preview"
}
```

### Meta Tags (index.html)
- Title: "Dynamite Notes | Knowledge Repo by Triệu Ngọc Tâm"
- Description: PM knowledge base for AI-first products
- Theme color: Dark (#0a0a0a) / Light (#ffffff)
- Open Graph + Twitter cards configured
- Author: Triệu Ngọc Tâm

### Deployment Context
- Built for Lovable.dev platform
- No backend (static SPA)
- Client-side routing (BrowserRouter)
- Requires server-side redirect to index.html for SPA routing

---

## Summary

**Architecture:** Clean SPA with React Router, minimal state, static data.
**Styling:** Tailwind + shadcn-ui with monospace-first design, dark mode default.
**Build:** Vite + SWC for fast dev, TypeScript with relaxed strictness.
**UX:** Command palette, keyboard shortcuts, staggered animations, glass morphism.
**Patterns:** Component composition, URL state, local state only, no backend yet.
**Notable:** 60+ UI components available, TanStack Query ready, no tests yet.

---

## Unresolved Questions

1. Are home components (ReadmeHeader, PopularPackages, RecentChangelog) implemented?
2. Is TanStack Query intended for future API integration?
3. Should test framework be added (Vitest recommended with Vite)?
4. Are unused dependencies (recharts, react-hook-form) intentional for future use?
5. Should TypeScript strictness be increased for production?

# Component Library & Utilities Analysis

**Date:** 2026-01-13  
**Scope:** React components, hooks, and utilities in Dynamite Notes  
**Tech Stack:** React + TypeScript + Vite + shadcn-ui + Tailwind CSS

---

## 1. Layout System

### TopNav (`/src/components/layout/TopNav.tsx`)
**Purpose:** Fixed header navigation with responsive design

**Features:**
- Logo with @tam/dynamite-notes branding
- Desktop horizontal nav: Readme, Packages, Docs, Playground, Changelog
- Mobile hamburger menu with slide-down navigation
- Command palette trigger (⌘K) with keyboard hint
- ThemeToggle integration
- Active route highlighting via `useLocation()`

**Props:**
- `onOpenCommand: () => void` - Callback to open command palette

**Styling:**
- Fixed positioning with `z-40`
- Glass morphism effect via `glass` class
- Height: 56px (`h-14`)
- Responsive: Desktop nav hidden on mobile (`md:flex`), mobile menu shows below

---

### CommandPalette (`/src/components/layout/CommandPalette.tsx`)
**Purpose:** Full-screen keyboard-first search/navigation modal

**Features:**
- Search across navigation, packages, and docs
- Keyboard navigation: Arrow keys, Enter, Escape
- Categories: "Navigation" and "Packages"
- Hardcoded command list (11 items):
  - 5 navigation routes
  - 6 package quick-links (ai-first-pm, experiments, prompts)
- Live filtering by label and description
- Visual selection indicator with arrow icon
- Keyboard shortcuts footer (↑↓ navigate, ↵ select, esc close)

**Props:**
- `isOpen: boolean`
- `onClose: () => void`

**Behavior:**
- Blocks body scroll when open
- Grouped results by category
- Auto-focus search input
- Click outside to close

**Styling:**
- Modal overlay with dark backdrop
- Glass card with rounded corners (`rounded-2xl`)
- Max height 400px scrollable results
- Smooth animations (`animate-in`)

---

### ThemeToggle (`/src/components/layout/ThemeToggle.tsx`)
**Purpose:** Theme switcher dropdown (Light/Dark/System)

**Features:**
- Uses `next-themes` library
- Dropdown menu with 3 options
- Animated icon transition (Sun ↔ Moon)
- System theme detection support

**UI:**
- Sun/Moon icons with rotate/scale animations
- Compact dropdown aligned to right edge
- Icons: Sun (light), Moon (dark), Monitor (system)

---

## 2. Home Page Components

### ModeSelector (`/src/components/home/ModeSelector.tsx`)
**Purpose:** Interactive learning path selector cards

**Features:**
- 3 learning modes:
  1. **PM Mode** - "Building a product" (Rocket icon, primary gradient)
  2. **AI Mode** - "Learning AI tools" (Brain icon, purple gradient)
  3. **Snack Mode** - "Quick wins today" (Zap icon, warning gradient)
- Staggered fade-in animations (100ms delay per card)
- Hover effects: gradient overlay, icon color change, arrow reveal
- Click navigates to filtered packages page with mode query param

**Styling:**
- 3-column grid on desktop (`md:grid-cols-3`)
- Each card has gradient overlay effect on hover
- Transition duration: 300-500ms for different properties

---

### PopularPackages (`/src/components/home/PopularPackages.tsx`)
**Purpose:** List of knowledge area packages with metadata

**Features:**
- 6 hardcoded packages:
  - ai-first-pm (12 items, builder)
  - experiments (8 items, starter)
  - prompts (15 items, starter)
  - metrics (10 items, builder)
  - gtm (7 items, advanced)
  - career (6 items, starter)
- Folder/FolderOpen icon toggle on hover
- Difficulty badges: starter (green), builder (primary), advanced (warning)
- Item count display
- Staggered slide-in animations (50ms delay per item)

**Link Structure:**
- Routes to `/packages/{id}`
- Glass card background with border
- Chevron icon shifts on hover

---

### ReadmeHeader (`/src/components/home/ReadmeHeader.tsx`)
**Purpose:** Hero section with project branding and stats

**Features:**
- Large typography: "Dynamite Notes"
- File indicator: "README.md by Triệu Ngọc Tâm"
- Subtitle describing the project
- Stats display: 120+ commits, 15k views/month, 2.4k stars
- Keyboard hint: "Press ⌘K to quickly jump anywhere"

**Visual Effects:**
- Background grid pattern with opacity
- Gradient orb blur effect (500px diameter, blur-100px)
- Large responsive heading (4xl → 5xl → 6xl)

---

### RecentChangelog (`/src/components/home/RecentChangelog.tsx`)
**Purpose:** Display 3 most recent changelog entries

**Features:**
- Hardcoded 3 entries:
  - v2.4.0: Prompt Lab (feature, Jan 12)
  - v2.3.2: AI-First PRD Template (content, Jan 8)
  - v2.3.0: Learning paths redesign (update, Jan 5)
- Type indicators: Sparkles (feature), Wrench (update), BookOpen (content)
- Color coding by type
- "View all" link to full changelog
- Staggered fade-in (80ms delay per item)

**Link Structure:**
- Routes to `/changelog#{version}`
- Hover reveals arrow icon

---

## 3. Navigation Component

### NavLink (`/src/components/NavLink.tsx`)
**Purpose:** Wrapper around React Router's NavLink with className utilities

**Features:**
- Supports `activeClassName` and `pendingClassName` props
- Uses `cn()` utility for conditional class merging
- Forward ref support
- Compatible with React Router v6 patterns

**Usage:**
```tsx
<NavLink 
  to="/path" 
  className="base-class"
  activeClassName="active-class"
/>
```

---

## 4. Custom Hooks

### useIsMobile (`/src/hooks/use-mobile.tsx`)
**Purpose:** Responsive design hook for mobile detection

**Features:**
- Breakpoint: 768px (md breakpoint)
- Returns `boolean` (true if window width < 768px)
- Listens to window resize via `matchMedia`
- SSR-safe (starts as `undefined`, updates on mount)

**Usage:**
```tsx
const isMobile = useIsMobile();
if (isMobile) { /* mobile UI */ }
```

---

### useToast (`/src/hooks/use-toast.ts`)
**Purpose:** Toast notification system with imperative API

**Architecture:**
- Reducer-based state management
- Memory state with listener pattern (not React context)
- Actions: ADD_TOAST, UPDATE_TOAST, DISMISS_TOAST, REMOVE_TOAST
- Toast limit: 1 concurrent toast
- Auto-remove delay: 1,000,000ms (16.6 minutes - seems like a placeholder)

**API:**
```tsx
const { toast, dismiss, toasts } = useToast();

toast({
  title: "Success",
  description: "Action completed",
  variant: "default"
});

// Imperative usage anywhere:
import { toast } from "@/hooks/use-toast";
toast({ title: "Alert" });
```

**Features:**
- ID generation with rollover safety
- Update and dismiss individual toasts
- Open state management
- Timeout queue management

---

## 5. Utility Functions

### utils.ts (`/src/lib/utils.ts`)
**Purpose:** Single utility function for className merging

**Function:**
```tsx
cn(...inputs: ClassValue[])
```

**Implementation:**
- Combines `clsx` (conditional classes) + `twMerge` (Tailwind deduplication)
- Essential for shadcn-ui component pattern

**Usage:**
```tsx
cn("base-class", condition && "conditional-class", className)
// Properly merges and deduplicates Tailwind classes
```

---

## 6. UI Component Library (shadcn-ui)

### Overview
- 48 shadcn-ui components in `/src/components/ui/`
- Built on Radix UI primitives
- Fully customizable via Tailwind classes
- TypeScript with proper ref forwarding

### Component Pattern (from samples):

**Button** (`button.tsx`):
- Uses `class-variance-authority` for variants
- 6 variants: default, destructive, outline, secondary, ghost, link
- 4 sizes: default, sm, lg, icon
- `asChild` prop for polymorphic behavior via Radix Slot

**Card** (`card.tsx`):
- Composition pattern: Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter
- Semantic subcomponents
- Consistent spacing and typography

**Dialog** (`dialog.tsx`):
- Radix Dialog primitive wrapper
- Portal rendering
- Overlay with fade animations
- Auto-close button
- Composable: DialogTrigger, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription

### Key Libraries:
- `@radix-ui/*` - Accessible primitives
- `class-variance-authority` - Variant management
- `lucide-react` - Icon system
- `clsx` + `tailwind-merge` - Class utilities

### Full Component List:
accordion, alert-dialog, alert, aspect-ratio, avatar, badge, breadcrumb, button, calendar, card, carousel, chart, checkbox, collapsible, command, context-menu, dialog, drawer, dropdown-menu, form, hover-card, input-otp, input, label, menubar, navigation-menu, pagination, popover, progress, radio-group, resizable, scroll-area, select, separator, sheet, sidebar, skeleton, slider, sonner, switch, table, tabs, textarea, toast, toaster, toggle-group, toggle, tooltip

---

## 7. Component Patterns

### Styling Approach:
1. **Tailwind Utility First** - All components use Tailwind CSS classes
2. **Custom CSS Variables** - Theme tokens defined in CSS (e.g., `bg-primary`, `text-muted-foreground`)
3. **Glass Morphism** - Repeated use of `glass` and `glass-hover` classes (likely custom)
4. **Responsive Design** - Mobile-first with `md:` and `sm:` breakpoints

### Props Patterns:
1. **Minimal Required Props** - Most components work without props
2. **Callback Props** - `onClick`, `onOpenCommand`, `onClose` for actions
3. **Composition Over Configuration** - Small focused components (Card subcomponents)
4. **Forward Refs** - All UI components use `forwardRef` for DOM access

### Reusability:
1. **Domain Components** - Home page components are specific, not reusable
2. **Layout Components** - TopNav, CommandPalette designed for single use
3. **UI Components** - Fully reusable, library-style
4. **Hooks** - Generic and reusable across features

### Data Handling:
- **Hardcoded Data** - Packages, changelog, modes are static arrays in components
- **No API Integration** - All data is frontend-only
- **React Router** - Navigation via `useNavigate()` and `Link`

---

## 8. Animation System

### Techniques:
1. **Staggered Animations** - Items animate in sequence with delay
2. **CSS Keyframes** - `fade-in`, `slide-in`, `animate-in` classes
3. **Inline Styles** - `opacity: 0` + `animation` with forward fill
4. **Transition Classes** - `transition-colors`, `transition-all` with duration

### Examples:
```tsx
// Staggered list
style={{
  opacity: 0,
  animation: `slide-in 0.3s ease-out ${index * 50}ms forwards`
}}

// Hover transitions
className="transition-all duration-300 group-hover:opacity-100"
```

---

## Unresolved Questions

1. Where are `glass`, `glass-hover`, `code-label`, `mode-card` classes defined? (Likely in `globals.css`)
2. Is the toast remove delay (1M ms) intentional or a bug?
3. Are package/changelog data meant to be fetched from CMS or remain static?
4. What triggers the command palette keyboard shortcut (⌘K) - is it in App.tsx?
5. Are there any context providers beyond ThemeProvider from next-themes?

---

**End of Report**

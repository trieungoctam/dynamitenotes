# Duyet.net Design Specification
**Research Date:** 2026-01-13
**Source:** https://github.com/duyet/new-blog (monorepo)
**Target:** Replicate design for Dynamite Notes blog

---

## Executive Summary

Duyet.net uses **Next.js 16.1.1** with **React 19.2.3** in a monorepo architecture. The design features a **minimalist, content-focused aesthetic** with warm card colors, elegant typography, and subtle animations. Built with **Tailwind CSS v4.1.6**, custom component system, and no external UI library.

---

## Tech Stack Analysis

### Core Framework
- **Next.js:** 16.1.1 (App Router, Turbopack)
- **React:** 19.2.3
- **TypeScript:** 5.8.3
- **Package Manager:** Bun 1.3.4
- **Build Tool:** Turborepo (monorepo)

### Styling & UI
- **Tailwind CSS:** 4.1.6 (latest v4 with `@tailwindcss/postcss`)
- **Typography:** `@tailwindcss/typography` 0.5.19
- **Headless UI:** `@headlessui/tailwindcss` 0.2.1
- **Icons:** `lucide-react` 0.562.0, `@radix-ui/react-icons` 1.3.0
- **Animations:** `framer-motion` 12.0.0, `tw-animate-css` 1.2.9
- **Theming:** `next-themes` 0.4.0

### Key Libraries
- **Data Fetching:** SWR 2.0.0
- **Math Rendering:** KaTeX 0.16.11, rehype-katex 7.0.1
- **Analytics:** Vercel Analytics
- **Markdown:** Custom with remark-math 6.0.0

### Architecture Pattern
- **Monorepo:** Turborepo with workspace separation
- **Shared Packages:** `@duyet/components`, `@duyet/config`, `@duyet/libs`
- **Deployment:** Vercel + Cloudflare Pages (dual)

---

## Typography Scale

### Primary Fonts
```typescript
// Inter (Sans-serif)
Inter: {
  weights: [400, 700],
  subsets: ["latin", "vietnamese"],
  variable: "--font-inter",
  display: "swap"
}

// Libre Baskerville (Serif)
Libre_Baskerville: {
  weights: [400, 700],
  subsets: ["latin", "latin-ext"],
  variable: "--font-serif",
  display: "swap"
}
```

### Font Usage
- **Body/UI:** Inter (system-ui fallback)
- **Headings/Titles:** Libre Baskerville (Georgia fallback)
- **Code:** System monospace

### Type Scale
```css
/* Year headings */
.text-5xl → 48px (mobile)
.text-6xl → 60px (sm)
.text-7xl → 72px (md)

/* Card titles */
.text-xl → 20px (default)
.text-2xl → 24px (default)
.text-3xl → 30px (md)

/* Body text */
.text-base → 16px
.text-sm → 14px
.text-xs → 12px
```

---

## Color Palette

### Card Colors (Primary Design System)
```javascript
{
  ivory: "#f5f3ef",      // Light beige
  oat: "#e3dacc",        // Warm tan
  cream: "#faf8f3",      // Off-white
  cactus: "#bcd1ca",     // Muted green
  sage: "#b8ccc5",       // Soft green
  lavender: "#c5c8dc",   // Soft purple
  terracotta: "#e07856", // Burnt orange
  coral: "#f39c7a"       // Pink-orange
}
```

**Color Variants:**
- Light variants: `bg-{color}-light` (10% lighter)
- Medium variants: `bg-{color}-medium` (between DEFAULT & light)
- Example: `terracotta-light: "#f4b8a0"`

### Claude-inspired Brand Colors
```javascript
{
  "claude-peach": "#f5dcd0",
  "claude-mint": "#a8d5ba",
  "claude-lavender": "#c5c5ff",
  "claude-coral": "#ff9999",
  "claude-yellow": "#f0d9a8",
  "claude-sky": "#b3d9ff"
}
```

### Neutral Colors
```css
--background: #ffffff (light), #0f172a (dark)
--foreground: #374151 (light), #f8fafc (dark)
--gray-200: border color
```

### Text Colors
- `text-neutral-900`: Headings (almost black)
- `text-neutral-800`: Primary text
- `text-neutral-700`: Secondary text
- `text-neutral-600`: Metadata
- `text-neutral-500`: Light metadata

---

## Component Architecture

### Shared Components (`@duyet/components`)

#### Layout Components
```
Container.tsx       - Max-width wrapper (max-w-4xl)
Header.tsx          - Logo + branding + nav
Footer.tsx          - Multi-column footer with social
Menu.tsx            - Navigation menu
ThemeProvider.tsx   - Dark mode wrapper
```

#### Card Components
```
ContentCard.tsx     - Generic content cards with illustrations
FeaturedCard.tsx    - Featured post card (larger)
LinkCard.tsx        - External link cards
AiFeaturedCard.tsx  - AI-powered dynamic card
```

#### Supporting Components
```
Analytics.tsx       - Vercel Analytics
Logo.tsx            - SVG logo component
Social.tsx          - Social media links
ThemeToggle.tsx     - Dark/light mode toggle
LoadingState.tsx    - Loading skeletons
ErrorBoundary.tsx   - Error handling
```

### Blog-Specific Components (`apps/blog/components`)
```
HomeCards.tsx       - Homepage card grid
YearPost.tsx        - Year-grouped post lists
Series.tsx          - Series navigation
Latest.tsx          - Latest posts widget
```

---

## Page Structure

### Homepage Layout
```tsx
<bg-cream-warm>        // Warm background
  <Header longText="Data Engineering" />
  <Container max-w-4xl>
    <Intro Text>       // Centered, post count, links
    <HomeCards>        // 3-card grid (featured + topics + series)
    <YearPost Groups>  // Reverse chronological, by year
  </Container>
  <Footer />
</bg-cream-warm>
```

### Post List Design
**Year Section:**
```html
<h1 className="text-5xl md:text-7xl font-serif font-bold">
  {year}
</h1>

<article className="flex items-center gap-4">
  <Link>{post.title}</Link>          // New/Featured badges
  <hr className="border-dotted" />    // Dotted line separator
  <time>MMM dd</time>                 // Date
</article>
```

**Key Features:**
- Dotted line separators between title & date
- "New" badge (blue) for current month posts
- "Featured" badge (purple) for featured posts
- Hover: underline with offset-4

### Card Grid Layout
```tsx
// Homepage: 3 cards
<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
  // Featured: full width (sm:col-span-2)
  // Others: 2-column grid
</div>
```

---

## Design Patterns

### 1. Card Design System
```tsx
<ContentCard
  title="Explore by Topics"
  href="/tags"
  category="Browse"
  description="Discover content organized by..."
  tags={topTags}
  color="oat"              // 8 color options
  illustration="geometric" // wavy | geometric | blob | none
/>
```

**Visual Features:**
- Rounded corners: `rounded-2xl`
- Padding: `p-6`
- Hover: `-translate-y-1` + shadow
- Illustration: Bottom-right, 20% opacity
- Category badge: `bg-white/70`, uppercase, tracking-wide

### 2. Minimalist Typography
**Headings:**
```css
font-serif              // Libre Baskerville
font-bold              // Weight 700
leading-snug           // Tight line-height
text-neutral-900       // High contrast
```

**Body:**
```css
text-base              // 16px
leading-relaxed        // 1.625 line-height
text-neutral-700       // Softer than headings
```

### 3. Subtle Animations
```tsx
// Card hover
hover:-translate-y-1    // Lift effect
hover:shadow-md
transition-all duration-300

// Links
hover:underline
hover:underline-offset-4
transition-colors

// Theme toggle
transition-colors duration-1000  // 1s smooth transition
```

### 4. Content Organization
**Chronological by Year:**
- Reverse chronological (newest year first)
- Year as massive serif heading
- Dotted line separators
- Compact date display

**Tag-Based Navigation:**
- Tags page with count
- Tag-based filtering
- Series collections
- Featured posts section

---

## Unique Features & Interactions

### 1. AI-Powered Dynamic Content
```tsx
<AiFeaturedCard
  title="Featured Posts"
  href="/featured"
  category="Highlights"
  fallbackDescription="..."
  color="terracotta"
  cardType="featured"
/>
```
- AI-generated descriptions
- Dynamic content selection
- Fallback to manual config

### 2. Dotted Line Separators
```tsx
<hr className="shrink grow border-dotted border-neutral-300" />
```
- Visual hierarchy in post lists
- Distinctive minimalist aesthetic
- Responsive width (shrinks/grows)

### 3. Badge System
```tsx
// New posts (current month)
<span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs">
  New
</span>

// Featured posts
<span className="bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full text-xs">
  Featured
</span>
```

### 4. Theme-Aware Design
```tsx
// CSS variables for smooth transitions
:root {
  --background: #ffffff;
  --foreground: #374151;
}
:root.dark {
  --background: #0f172a;
  --foreground: #f8fafc;
}
```

### 5. Container System
```tsx
<Container className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
  {/* Content */}
</Container>
```
- Consistent max-width: 896px (4xl)
- Responsive padding
- Centered with auto margins

---

## Spacing & Layout

### Section Spacing
```css
py-10          // Header vertical padding
mb-10          // Container bottom margin
mb-12          // Intro section margin
mb-16          // Card section margin
gap-4          // List item gap
gap-6          // Card grid gap
gap-12         // Year section gap
```

### Container Widths
```css
max-w-4xl      // Blog content (896px)
max-w-[90rem]  // Footer (1440px)
container      // Responsive wrapper
```

### Responsive Breakpoints
```tsx
sm:text-2xl    // 640px+
md:text-7xl    // 768px+
lg:px-8        // 1024px+
```

---

## Illustration System

### Abstract Shape Components
```tsx
import { GeometricPattern, OrganicBlob, WavyLines } from "@duyet/components"

<IllustrationComponent
  className="h-full w-full text-{color}"
/>
```

**Usage:**
- Bottom-right card placement
- 20% opacity (30% on hover)
- Color-matched to card
- SVG-based, scalable

---

## Implementation Recommendations for Dynamite Notes

### Phase 1: Foundation
1. **Install dependencies:**
   ```bash
   npm install tailwindcss@4.1.6 @tailwindcss/typography@0.5.19 next-themes framer-motion lucide-react
   ```

2. **Configure Tailwind v4:**
   - Use `@tailwindcss/postcss`
   - Set up `@config` directive
   - Import `tw-animate-css`

3. **Add fonts:**
   ```typescript
   import { Inter, Libre_Baskerville } from 'next/font/google'
   ```

### Phase 2: Color System
1. **Add card colors to `tailwind.config.js`:**
   ```javascript
   colors: {
     ivory: "#f5f3ef",
     oat: "#e3dacc",
     cream: "#faf8f3",
     cactus: "#bcd1ca",
     sage: "#b8ccc5",
     lavender: "#c5c8dc",
     terracotta: "#e07856",
     coral: "#f39c7a"
   }
   ```

2. **Create CSS variables for theme:**
   ```css
   :root { --background: #ffffff; --foreground: #374151; }
   :root.dark { --background: #0f172a; --foreground: #f8fafc; }
   ```

### Phase 3: Core Components
1. **Container component:**
   ```tsx
   <div className="container max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-10">
   ```

2. **Header component:**
   - Serif logo text
   - Responsive navigation
   - Center-aligned option

3. **Card components:**
   - ContentCard (with illustrations)
   - FeaturedCard (larger)
   - LinkCard (external links)

### Phase 4: Page Layouts
1. **Homepage:**
   - Warm background (`bg-cream-warm`)
   - Intro text with links
   - 3-card grid
   - Year-grouped posts

2. **Post detail:**
   - Typography plugin for markdown
   - KaTeX for math
   - Clean reading layout

### Phase 5: Polish
1. **Add animations:**
   - Framer Motion for page transitions
   - Hover effects on cards
   - Theme toggle animation

2. **Responsive design:**
   - Mobile-first approach
   - Typography scaling
   - Grid adjustments

---

## Key Differences from Standard Next.js

### Unique to Duyet.net
1. **Monorepo structure** with shared components
2. **Custom card color palette** (8 warm colors)
3. **Dotted line separators** in post lists
4. **Abstract shape illustrations** in cards
5. **AI-powered dynamic content** generation
6. **Dual deployment** (Vercel + Cloudflare)

### What to Adapt
- **Keep:** Minimalist aesthetic, warm colors, serif headings
- **Simplify:** Remove monorepo complexity, inline components
- **Adapt:** Use existing Supabase backend instead of custom API
- **Enhance:** Add more interactive elements, animations

---

## Unresolved Questions

1. **Exact animation timing** - Need to check framer-motion usage in detail
2. **Card illustration SVG paths** - Abstract shapes implementation details
3. **AI integration** - How `AiFeaturedCard` generates content dynamically
4. **Post frontmatter schema** - Exact field structure for posts
5. **Image optimization** - How images are handled in blog posts
6. **Search functionality** - Local search implementation (if any)

---

## Sources

- [GitHub Repository](https://github.com/duyet/new-blog) - Complete source code
- [Live Blog](https://blog.duyet.net) - Production deployment
- [Tailwind CSS v4](https://tailwindcss.com/blog/tailwindcss-v4-alpha) - v4 documentation
- [Next.js 16](https://nextjs.org/blog) - Release notes
- [Framer Motion](https://www.framer.com/motion/) - Animation library

---

**Report Generated:** 2026-01-13 04:29 UTC
**Researcher:** UI/UX Pro Max Subagent
**Status:** Complete - Ready for implementation planning

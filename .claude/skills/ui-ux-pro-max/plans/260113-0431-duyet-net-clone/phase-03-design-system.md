---
title: "Phase 3: Design System"
description: "Implement duyet.net color palette, typography, and component library"
status: pending
priority: P1
effort: 5h
---

## Context

**Source:** [duyet.net Design Spec](../../reports/researcher-260113-0427-duyet-net-design-spec.md)

**Key Elements:** Warm card colors, Inter + Libre Baskerville fonts, minimalist aesthetic

## Requirements

From duyet.net research, must implement:

### Color Palette
8 warm card colors (ivory, oat, cream, cactus, sage, lavender, terracotta, coral)

### Typography
- Inter (sans-serif) for body/UI
- Libre Baskerville (serif) for headings
- System monospace for code

### Components
- Container system (max-w-4xl)
- ContentCard with illustrations
- FeaturedCard (larger variant)
- Dotted line separators
- Badge system (New, Featured)

## Implementation Steps

### Step 1: Install Dependencies (15 min)

```bash
# Tailwind CSS v4 (if not already installed)
bun add -D tailwindcss@latest @tailwindcss/postcss

# Additional packages from duyet.net stack
bun add framer-motion next-themes
bun add lucide-react @radix-ui/react-icons

# Fonts
bun add @fontsource/inter @fontsource/libre-baskerville
```

### Step 2: Configure Tailwind v4 (30 min)

Update `tailwind.config.js` with duyet.net colors:

```javascript
export default {
  theme: {
    extend: {
      colors: {
        // Card colors
        ivory: '#f5f3ef',
        oat: '#e3dacc',
        cream: '#faf8f3',
        cactus: '#bcd1ca',
        sage: '#b8ccc5',
        lavender: '#c5c8dc',
        terracotta: '#e07856',
        coral: '#f39c7a',

        // Light variants
        'ivory-light': '#faf9f6',
        'oat-light': '#efe8da',
        'cream-light': '#fcfbf8',

        // Claude-inspired brand colors
        'claude-peach': '#f5dcd0',
        'claude-mint': '#a8d5ba',
        'claude-lavender': '#c5c5ff',
        'claude-coral': '#ff9999',
        'claude-yellow': '#f0d9a8',
        'claude-sky': '#b3d9ff',

        // Text colors
        'neutral-900': '#171717',
        'neutral-800': '#262626',
        'neutral-700': '#404040',
        'neutral-600': '#525252',
        'neutral-500': '#737373',
      },

      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Libre Baskerville', 'Georgia', 'serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'monospace'],
      },

      spacing: {
        '18': '4.5rem',   // 72px
        'container': '896px', // max-w-4xl
      }
    }
  }
}
```

### Step 3: Add Fonts (30 min)

Update `src/index.css`:

```css
@import '@fontsource/inter/400.css';
@import '@fontsource/inter/700.css';
@import '@fontsource/libre-baskerville/400.css';
@import '@fontsource/libre-baskerville/700.css';

:root {
  --background: #ffffff;
  --foreground: #374151;
}

.dark {
  --background: #0f172a;
  --foreground: #f8fafc;
}

body {
  font-family: 'Inter', system-ui, sans-serif;
  background-color: var(--background);
  color: var(--foreground);
  transition: background-color 1s ease, color 1s ease;
}

h1, h2, h3, h4, h5, h6 {
  font-family: 'Libre Baskerville', Georgia, serif;
}
```

**Success:** Fonts loaded, variables configured for smooth theme transitions

### Step 4: Create Container Component (30 min)

```typescript
// src/components/layout/Container.tsx
interface ContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function Container({ children, className = '' }: ContainerProps) {
  return (
    <div className={`container max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-10 ${className}`}>
      {children}
    </div>
  );
}
```

**Success:** Reusable container with consistent max-width (896px)

### Step 5: Create ContentCard Component (1.5 hours)

```typescript
// src/components/cards/ContentCard.tsx
import { Link } from 'react-router-dom';

interface ContentCardProps {
  title: string;
  href: string;
  category?: string;
  description?: string;
  tags?: string[];
  color: 'ivory' | 'oat' | 'cream' | 'cactus' | 'sage' | 'lavender' | 'terracotta' | 'coral';
  illustration?: 'geometric' | 'wavy' | 'blob' | 'none';
}

export function ContentCard({
  title,
  href,
  category,
  description,
  tags = [],
  color,
  illustration = 'geometric'
}: ContentCardProps) {
  return (
    <Link
      to={href}
      className={`bg-${color} rounded-2xl p-6 hover:-translate-y-1 hover:shadow-md transition-all duration-300 relative overflow-hidden group`}
    >
      {/* Category badge */}
      {category && (
        <span className={`bg-white/70 text-xs uppercase tracking-wider px-2 py-1 rounded-full`}>
          {category}
        </span>
      )}

      {/* Title */}
      <h3 className="text-xl md:text-2xl font-serif font-bold text-neutral-900 leading-snug mb-2">
        {title}
      </h3>

      {/* Description */}
      {description && (
        <p className="text-neutral-700 leading-relaxed mb-4">
          {description}
        </p>
      )}

      {/* Tags */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map(tag => (
            <span key={tag} className="text-sm text-neutral-600">
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Illustration */}
      {illustration !== 'none' && (
        <div className="absolute bottom-0 right-0 w-32 h-32 opacity-20 group-hover:opacity-30 transition-opacity">
          <Illustration type={illustration} color={`text-${color}`} />
        </div>
      )}
    </Link>
  );
}
```

Create illustration components:

```typescript
// src/components/illustrations/GeometricPattern.tsx
export function GeometricPattern({ color = 'text-oat' }: { color?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={`w-full h-full ${color}`}>
      <polygon points="50,10 90,90 10,90" fill="currentColor" />
      <circle cx="50" cy="50" r="20" fill="currentColor" opacity="0.5" />
    </svg>
  );
}
```

**Success:** ContentCard component with 8 color options, 4 illustration types

### Step 6: Create Badge Components (30 min)

```typescript
// src/components/ui/badges.tsx
export function NewBadge() {
  return (
    <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs font-medium">
      New
    </span>
  );
}

export function FeaturedBadge() {
  return (
    <span className="bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full text-xs font-medium">
      Featured
    </span>
  );
}
```

**Success:** Reusable badge components matching duyet.net style

### Step 7: Create DottedLine Separator (15 min)

```typescript
// src/components/ui/DottedLine.tsx
export function DottedLine() {
  return (
    <hr className="shrink grow border-dotted border-neutral-300 my-4" />
  );
}
```

**Success:** Dotted line separator for post lists

### Step 8: Update Theme Toggle (30 min)

Update existing `LanguageToggle.tsx` to match duyet.net smooth transitions:

```typescript
// src/components/layout/ThemeToggle.tsx
import { useTheme } from 'next-themes';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors duration-1000"
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}
```

**Success:** 1-second smooth theme transitions matching duyet.net

## Success Criteria

- [ ] Tailwind configured with 8 card colors + variants
- [ ] Inter + Libre Baskerville fonts loaded
- [ ] Container component created (max-w-4xl)
- [ ] ContentCard component with 8 colors, 4 illustrations
- [ ] Badge components (New, Featured) created
- [ ] DottedLine separator component created
- [ ] Theme toggle with 1s smooth transitions

## Risk Assessment

**Low Risk:** Design system changes don't affect existing functionality

**Mitigation:**
1. Create components in parallel with existing ones
2. Test color contrast ratios (WCAG AA)
3. Ensure font loading doesn't block rendering

## Next Steps

After design system complete, proceed to [Phase 4: UI Redesign](./phase-04-ui-redesign.md)

---
title: "Fix Dark Mode Color Contrast Issues"
description: "Site-wide dark mode color contrast fixes for WCAG compliance and improved readability"
status: pending
priority: P2
effort: 3h
issue: none
branch: main
tags: [ux, accessibility, dark-mode]
created: 2026-01-14
completed: null
---

# Plan: Fix Dark Mode Color Contrast Issues

## Overview

Fix low contrast issues in dark mode across the site. The design system uses correct CSS variables, but several components use hardcoded Tailwind colors or opacity-based colors that don't adapt properly to dark mode.

**Key Issues:**
- Active filter chips have poor contrast (`bg-primary/10 text-primary`)
- Hardcoded colors (`text-blue-400`, `bg-blue-500/10`) lack dark mode variants
- Opacity utilities (`opacity-70`) reduce readability in dark mode
- Social link cards use blue colors that are too bright in dark mode

**Existing Infrastructure:**
- ✅ shadcn/ui CSS variables correctly configured
- ✅ Tailwind `darkMode: 'class'` enabled
- ✅ Proper OKLCH color tokens defined

**Gaps:**
- Hardcoded color classes without dark mode variants
- Opacity-based text coloring
- Low-opacity backgrounds in dark mode

---

## Current State Analysis

### Design System Status: ✅ CORRECT

The CSS variables in `src/index.css` are properly defined for both light and dark modes:

```css
/* Light mode */
:root {
  --primary: 0 0% 0%;              /* Black */
  --primary-foreground: 0 0% 100%; /* White */
  --muted-foreground: 0 0% 0%;
}

/* Dark mode */
.dark {
  --primary: 0 0% 100%;            /* White */
  --primary-foreground: 0 0% 0%;   /* Black */
  --muted-foreground: 0 0% 100%;
}
```

**Conclusion:** The token system is solid. Issues stem from hardcoded Tailwind colors.

### Issues Found: 14 files, 12 medium severity

| File | Severity | Issue Type |
|------|----------|------------|
| Insights.tsx (lines 161, 177) | MEDIUM | `bg-primary/10 text-primary` |
| About.tsx (social links) | MEDIUM | `hover:text-blue-400` |
| GoalPicker.tsx (color map) | MEDIUM | Hardcoded blue/purple/orange |
| PostCard.tsx | MEDIUM | `opacity-70`, `opacity-60` |
| TagChip.tsx | MEDIUM | Active badge styling |
| TagFilterBar.tsx | LOW | Label contrast |
| About.tsx (profile) | MEDIUM | Multiple hardcoded colors |

---

## Solution Design

### Fix Strategy

**Pattern 1: Hardcoded Colors → Semantic Tokens**
```tsx
// Before
text-blue-400
bg-blue-500/10

// After
text-primary
bg-primary/10 dark:bg-primary/20
```

**Pattern 2: Opacity on Text → Foreground Tokens**
```tsx
// Before
className="opacity-70"

// After
className="text-muted-foreground"
// OR
className="text-foreground/70"
```

**Pattern 3: Primary/10 Backgrounds → Border Variant**
```tsx
// Before
bg-primary/10 text-primary

// After (Option 1: Increase opacity in dark)
bg-primary/10 dark:bg-primary/20 text-primary

// After (Option 2: Use border - RECOMMENDED)
border border-primary/30 text-primary bg-transparent
```

### Active Filter Design

For active filters in dark mode, use **border variant** instead of background:

```tsx
// Light mode: white bg with black text
// Dark mode: transparent bg with white border + white text
<div className="inline-flex items-center gap-1 px-2 py-1 border border-primary/30 text-primary text-xs rounded-full">
```

**Rationale:** Borders provide better contrast in dark mode than low-opacity backgrounds.

---

## Phase Breakdown

### Phase 1: Fix Critical Contrast Issues
**Effort**: 1h

**Tasks:**
1. Fix active filter chips in `Insights.tsx`
2. Fix social link cards in `About.tsx`
3. Fix opacity usage in `PostCard.tsx`

**Files:**
- `src/pages/Insights.tsx` (modify lines 161, 177)
- `src/pages/About.tsx` (modify social link cards)
- `src/components/content/PostCard.tsx` (modify opacity usage)

**Expected Impact:** Major readability improvements for user-reported issues

---

### Phase 2: Refactor Color Systems
**Effort**: 1h

**Tasks:**
1. Refactor `GoalPicker.tsx` color map with dark mode variants
2. Update `TagChip.tsx` and `TagFilterBar.tsx` for consistency
3. Update `About.tsx` profile section colors

**Files:**
- `src/components/content/GoalPicker.tsx` (modify color map)
- `src/components/content/TagChip.tsx` (modify active variant)
- `src/components/content/TagFilterBar.tsx` (modify label)
- `src/pages/About.tsx` (modify profile section)

**Expected Impact:** Consistent color system across components

---

### Phase 3: Polish & Verify
**Effort**: 1h

**Tasks:**
1. Test all pages in dark mode
2. Verify WCAG AA compliance (4.5:1 contrast)
3. Add any missing dark mode utility classes
4. Test colorblind accessibility

**Files:**
- All modified files from previous phases

**Expected Impact:** Full accessibility compliance

---

## Implementation Details

### 1. Insights.tsx Active Filters

**Location:** Lines 161, 177

**Current:**
```tsx
<div className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
```

**Fix:**
```tsx
<div className="inline-flex items-center gap-1 px-2 py-1 border border-primary/30 text-primary text-xs rounded-full bg-primary/5 dark:bg-transparent">
```

**Why:** Border provides better contrast in dark mode. Low-opacity background in light mode for subtle effect.

---

### 2. About.tsx Social Links

**Location:** Lines 177, 193, 203, 211

**Current:**
```tsx
className="... hover:text-blue-400 hover:border-blue-500/50 hover:bg-blue-500/10 ..."
```

**Fix:**
```tsx
className="... hover:text-primary hover:border-primary/50 hover:bg-primary/10 dark:hover:bg-primary/20 ..."
```

**Why:** Semantic tokens adapt to dark mode. Increased opacity in dark mode for better contrast.

---

### 3. PostCard.tsx Opacity

**Location:** Lines 47, 57, 121, 167, 187

**Current:**
```tsx
<span className="flex items-center gap-2 opacity-70">
<div className="flex items-center gap-3 text-xs font-mono opacity-60">
```

**Fix:**
```tsx
<span className="flex items-center gap-2 text-muted-foreground">
<div className="flex items-center gap-3 text-xs font-mono text-muted-foreground/70">
```

**Why:** `text-muted-foreground` uses proper CSS variables. `/70` modifier maintains hierarchy.

---

### 4. GoalPicker.tsx Color Map

**Location:** Lines 58-77

**Current:**
```tsx
const colorMap: Record<string, string> = {
  decide: "text-blue-500 bg-blue-500/10 border-blue-500/30 hover:bg-blue-500/20",
  spec: "text-purple-500 bg-purple-500/10 border-purple-500/30 hover:bg-purple-500/20",
  build: "text-orange-500 bg-orange-500/10 border-orange-500/30 hover:bg-orange-500/20",
  // ...
};
```

**Fix (Option 1 - Dark Mode Variants):**
```tsx
const colorMap: Record<string, string> = {
  decide: "text-blue-500 dark:text-blue-400 bg-blue-500/10 dark:bg-blue-500/20 border-blue-500/30",
  spec: "text-purple-500 dark:text-purple-400 bg-purple-500/10 dark:bg-purple-500/20 border-purple-500/30",
  build: "text-orange-500 dark:text-orange-400 bg-orange-500/10 dark:bg-orange-500/20 border-orange-500/30",
  // ...
};
```

**Fix (Option 2 - Semantic - RECOMMENDED):**
```tsx
const colorMap: Record<string, string> = {
  decide: "text-primary bg-primary/10 dark:bg-primary/20 border-primary/30",
  spec: "text-primary bg-primary/10 dark:bg-primary/20 border-primary/30",
  build: "text-primary bg-primary/10 dark:bg-primary/20 border-primary/30",
  // Use different visual indicators instead of colors
};
```

**Why:** Semantic tokens are more maintainable and ensure dark mode consistency. Use icons or patterns for goal distinction instead of colors.

---

### 5. TagChip.tsx Active Variant

**Location:** Line 22

**Current:**
```tsx
<Badge className={`${baseClasses} bg-primary text-primary-foreground`}>
```

**Fix:**
```tsx
<Badge className={`${baseClasses} bg-primary text-primary-foreground dark:bg-primary/10 dark:text-primary border border-transparent dark:border-primary/30`}>
```

**Why:** In dark mode, use subtle background with border instead of solid white background.

---

### 6. About.tsx Profile Section

**Multiple locations** with hardcoded blue/purple/green colors.

**Fix Pattern:**
```tsx
// Before
text-blue-400
bg-blue-500/10
border-blue-500/20

// After
text-primary
bg-primary/10 dark:bg-primary/20
border-primary/20 dark:border-primary/30
```

**Why:** Unify to semantic tokens for consistency. Use opacity modifiers for subtle variations.

---

## Testing Strategy

### Manual Testing Checklist

- [ ] Test Insights page with active filters in dark mode
- [ ] Test About page social links hover states in dark mode
- [ ] Test GoalPicker buttons in dark mode
- [ ] Test PostCard metadata readability in dark mode
- [ ] Verify all text meets WCAG AA 4.5:1 contrast
- [ ] Test with browser dev tools dark mode emulation
- [ ] Test with system preference dark mode

### Accessibility Testing

**Tools:**
- WebAIM Contrast Checker: https://webaim.org/resources/contrastchecker/
- Chrome DevTools Lighthouse accessibility audit
- Color blindness simulator (Chrome extension)

**Contrast Requirements:**
- Normal text (<18pt): 4.5:1 minimum
- Large text (≥18pt): 3:1 minimum
- UI components/icons: 3:1 minimum

### Edge Cases

- All filters active simultaneously
- Long tag names with active state
- Social links in various hover states
- Goal badges with all goal types
- Empty states in dark mode

---

## Files to Modify

### Modify (7 files)
1. `src/pages/Insights.tsx` - Active filter chips (lines 161, 177)
2. `src/pages/About.tsx` - Social links, profile colors
3. `src/components/content/PostCard.tsx` - Opacity usage
4. `src/components/content/GoalPicker.tsx` - Color map
5. `src/components/content/TagChip.tsx` - Active variant
6. `src/components/content/TagFilterBar.tsx` - Label contrast
7. `src/components/content/InsightsSearch.tsx` - Verify (may be OK)

---

## Rollback Plan

If issues arise:
1. Revert individual file changes using git
2. No database changes required (safe rollback)
3. No breaking changes to component APIs

---

## Design Decisions

### Decision 1: Active Filter Visual Style

**Question:** How should active filters appear in dark mode?

**Options:**
- A) Inverted colors (white bg, black text) - High contrast but harsh
- B) Border with transparent background - Subtle, consistent
- C) Higher opacity backgrounds (primary/20) - Moderate contrast

**Selection:** **Option B** - Border variant

**Rationale:**
- More subtle than solid backgrounds
- Better than low-opacity backgrounds
- Consistent with shadcn/ui "outline" variant pattern
- Provides clear visual feedback without harsh contrast

---

### Decision 2: Goal Button Color Strategy

**Question:** Should goal buttons have different colors in dark mode?

**Options:**
- A) Keep distinct colors (blue, purple, orange) with dark mode variants
- B) Unify to semantic primary token for consistency
- C) Use color + icon/pattern for distinction

**Selection:** **Option A** with dark mode variants

**Rationale:**
- Color distinction is valuable for goal categorization
- Adding dark mode variants (`dark:text-blue-400`) maintains contrast
- Preserves existing visual language
- Users familiar with current color coding

---

### Decision 3: Opacity Replacement Strategy

**Question:** Replace all opacity utilities or only where problematic?

**Options:**
- A) Replace all `opacity-*` utilities site-wide
- B) Replace only on text elements
- C) Replace only where contrast issues exist

**Selection:** **Option B** - Replace on text elements only

**Rationale:**
- Text readability is critical for accessibility
- Opacity on non-text elements (images, icons) may be intentional
- Targeted fix minimizes scope and risk
- PostCard metadata is the primary concern

---

## Open Questions

1. **Brand Accent Colors:** Should the site have a defined accent color palette beyond primary/secondary, or keep the minimal black/white aesthetic?

2. **Goal Color Semantic Mapping:** If unifying goal colors to semantic tokens, how should we distinguish goals? Icons? Patterns? Position?

3. **Animation Transitions:** Should color transitions be disabled in dark mode for performance, or kept for visual polish?

---

## References

- Research report: `plans/260114-2140-dark-mode-color-fix/research/researcher-01-tailwind-dark-mode.md`
- Audit report: `plans/260114-2140-dark-mode-color-fix/scout/scout-01-dark-mode-audit.md`

---

**End of Plan**

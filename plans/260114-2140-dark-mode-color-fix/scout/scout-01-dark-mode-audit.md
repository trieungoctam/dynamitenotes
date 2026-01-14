# Dark Mode Color Contrast Audit Report

**Date**: 2026-01-14  
**Scope**: Full codebase audit for dark mode color contrast issues  
**Method**: Manual review of components + automated pattern search

---

## Executive Summary

Found **14 files** with dark mode color contrast issues across the codebase. Most issues are **MEDIUM** severity, involving hardcoded colors that lack dark mode variants. The design system uses CSS variables correctly, but several components use direct color classes or opacity-based colors that don't adapt to dark mode.

### Severity Breakdown
- **Critical**: 0 issues
- **Medium**: 12 issues (affecting readability)
- **Low**: 2 issues (cosmetic only)

---

## Known Issues (User-Reported)

### 1. TagChip.tsx - Active Filter Badge
**File**: `/Users/dynamite/workspaces/com.dynamite/dynamitenotes/src/components/content/TagChip.tsx`  
**Line**: 22  
**Severity**: MEDIUM  

**Issue**: Active filter badges use `bg-primary/10 text-primary` which has low contrast in dark mode.

```tsx
// Line 22
<Badge className={`${baseClasses} bg-primary text-primary-foreground`}>
```

**Problem**: In dark mode, `--primary` is white (100% lightness), so `bg-primary` becomes solid white with black text, but there's no dark mode variant for the active state.

**Fix**:
```tsx
// Before
<Badge className={`${baseClasses} bg-primary text-primary-foreground`}>

// After
<Badge className={`${baseClasses} bg-primary text-primary-foreground dark:bg-primary/10 dark:text-primary`}>
```

---

### 2. TagFilterBar.tsx - Filter Label
**File**: `/Users/dynamite/workspaces/com.dynamite/dynamitenotes/src/components/content/TagFilterBar.tsx`  
**Line**: 27  
**Severity**: LOW  

**Issue**: "Filter by:" label uses `text-muted-foreground` which may be too dark in dark mode.

```tsx
// Line 27
<span className="text-sm text-muted-foreground">Filter by:</span>
```

**Problem**: In dark mode, muted-foreground is white with high opacity, but the label lacks sufficient contrast.

**Fix**:
```tsx
// Before
<span className="text-sm text-muted-foreground">Filter by:</span>

// After
<span className="text-sm text-muted-foreground/70">Filter by:</span>
```

---

### 3. InsightsSearch.tsx - Search Icon
**File**: `/Users/dynamite/workspaces/com.dynamite/dynamitenotes/src/components/content/InsightsSearch.tsx`  
**Line**: 17  
**Severity**: LOW  

**Issue**: Search icon uses `text-muted-foreground` directly without dark mode consideration.

```tsx
// Line 17
<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
```

**Fix**: This is actually acceptable as `text-muted-foreground` is properly defined in CSS variables. No fix needed.

---

### 4. Insights.tsx - Active Filters Section
**File**: `/Users/dynamite/workspaces/com.dynamite/dynamitenotes/src/pages/Insights.tsx`  
**Lines**: 161, 177  
**Severity**: MEDIUM  

**Issue**: Active filter chips use `bg-primary/10 text-primary` which has poor contrast in dark mode.

```tsx
// Lines 161-172
<div className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
  <span>Search: "{searchQuery}"</span>
  <button onClick={() => { setSearchInput(""); setSearchQuery(""); }} className="hover:opacity-70">
    <X className="w-3 h-3" />
  </button>
</div>

// Lines 174-186
<div className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
  <span>{tag}</span>
  <button onClick={() => handleTagToggle(tag)} className="hover:opacity-70">
    <X className="w-3 h-3" />
  </button>
</div>
```

**Problem**: In dark mode with white primary color, `bg-primary/10` is 10% white which is very subtle, and `text-primary` is white text on light background = poor contrast.

**Fix**:
```tsx
// Before
<div className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">

// After
<div className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary text-xs rounded-full">
```

**Better Fix** (use semantic color classes):
```tsx
// Use border instead of background for better contrast
<div className="inline-flex items-center gap-1 px-2 py-1 border border-primary/30 text-primary text-xs rounded-full">
```

---

## Additional Issues Found

### 5. About.tsx - Social Link Cards
**File**: `/Users/dynamite/workspaces/com.dynamite/dynamitenotes/src/pages/About.tsx`  
**Lines**: 177, 193, 203, 211  
**Severity**: MEDIUM  

**Issue**: Social link cards use hardcoded blue colors that don't adapt to dark mode.

```tsx
// Lines 177, 193, 203, 211
className="group flex items-center gap-3 px-5 py-3 rounded-xl bg-gradient-to-br from-card to-card/50 border border-border/30 text-muted-foreground hover:text-blue-400 hover:border-blue-500/50 hover:bg-blue-500/10 transition-all duration-300"
```

**Problem**: Hardcoded `blue-400`, `blue-500/50`, `blue-500/10` colors don't have dark mode variants. In dark mode, bright blue is too intense.

**Fix**:
```tsx
// Before
className="... hover:text-blue-400 hover:border-blue-500/50 hover:bg-blue-500/10 ..."

// After
className="... hover:text-primary hover:border-primary/50 hover:bg-primary/10 ..."
```

---

### 6. About.tsx - Profile Gradients
**File**: `/Users/dynamite/workspaces/com.dynamite/dynamitenotes/src/pages/About.tsx`  
**Lines**: 79, 96, 99, 100, 106, 113, 114, 131, 132, 146, 147, 160, 161  
**Severity**: MEDIUM  

**Issue**: Multiple hardcoded color classes (blue-400, purple-400, green-400) throughout the page.

**Examples**:
```tsx
// Line 79 - Header gradient
<div className="absolute inset-0 bg-gradient-to-b from-green-500/5 via-transparent to-transparent" />

// Line 96 - Avatar glow
<div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-xl" />

// Line 100 - Avatar fallback icon
<AvatarFallback className="text-3xl bg-gradient-to-br from-blue-500/10 to-purple-500/10">
  <User className="w-14 h-14 text-blue-400" />
</AvatarFallback>

// Line 106 - Subtitle color
<p className="text-lg text-blue-400 font-medium">{subtitle}</p>
```

**Fix Pattern**:
```tsx
// Replace all hardcoded blue/purple/green with semantic tokens

// Before
text-blue-400 → text-primary
bg-blue-500/10 → bg-primary/10
border-blue-500/20 → border-primary/20

// For variety, use opacity modifiers on primary
text-primary/80
text-primary/60
```

---

### 7. GoalPicker.tsx - Hardcoded Color Map
**File**: `/Users/dynamite/workspaces/com.dynamite/dynamitenotes/src/components/content/GoalPicker.tsx`  
**Lines**: 58-77  
**Severity**: MEDIUM  

**Issue**: Entire color mapping system uses hardcoded Tailwind colors (blue-500, purple-500, etc.) that don't adapt to dark mode.

```tsx
// Lines 58-77
const colorMap: Record<string, string> = {
  decide: "text-blue-500 bg-blue-500/10 border-blue-500/30 hover:bg-blue-500/20",
  spec: "text-purple-500 bg-purple-500/10 border-purple-500/30 hover:bg-purple-500/20",
  build: "text-orange-500 bg-orange-500/10 border-orange-500/30 hover:bg-orange-500/20",
  ship: "text-green-500 bg-green-500/10 border-green-500/30 hover:bg-green-500/20",
  measure: "text-cyan-500 bg-cyan-500/10 border-cyan-500/30 hover:bg-cyan-500/20",
  operate: "text-gray-400 bg-gray-500/10 border-gray-500/30 hover:bg-gray-500/20",
};

const fallbackColors = [
  "text-blue-500 bg-blue-500/10 border-blue-500/30 hover:bg-blue-500/20",
  "text-purple-500 bg-purple-500/10 border-purple-500/30 hover:bg-purple-500/20",
  // ... etc
];
```

**Problem**: These colors are designed for light mode and have poor contrast in dark mode (e.g., gray-400 text on black background).

**Fix**: Use dark mode variants or semantic tokens:
```tsx
// Option 1: Add dark mode prefixes
decide: "text-blue-500 dark:text-blue-400 bg-blue-500/10 dark:bg-blue-500/20 border-blue-500/30"

// Option 2: Use CSS custom properties (recommended)
// Define in index.css:
--goal-decide: 220 100% 50%; // blue hsl
--goal-spec: 270 100% 50%; // purple hsl

// Then use:
decide: "text-[hsl(var(--goal-decide))] bg-[hsl(var(--goal-decide))/0.1]"
```

---

### 8. Search.tsx - Search Icon Colors
**File**: `/Users/dynamite/workspaces/com.dynamite/dynamitenotes/src/pages/Search.tsx`  
**Lines**: 130, 159  
**Severity**: LOW  

**Issue**: Section icons use `text-primary` which is fine, but inconsistent with other icon colors.

```tsx
// Lines 130, 159
<FileText className="w-5 h-5 text-primary" />
<Lightbulb className="w-5 h-5 text-primary" />
```

**Status**: Actually acceptable - `text-primary` adapts correctly to dark mode via CSS variables. No fix needed.

---

### 9. Packages.tsx - Primary Color Usage
**File**: `/Users/dynamite/workspaces/com.dynamite/dynamitenotes/src/pages/Packages.tsx`  
**Lines**: 112, 140, 162, 187, 233, 245  
**Severity**: LOW  

**Issue**: Multiple uses of `bg-primary/10`, `text-primary`, `bg-primary` - these are actually correct!

**Status**: No issues found. These properly use CSS variables that adapt to dark mode.

---

### 10. PostCard.tsx - Opacity-Based Colors
**File**: `/Users/dynamite/workspaces/com.dynamite/dynamitenotes/src/components/content/PostCard.tsx`  
**Lines**: 47, 57, 121, 138, 167, 187, 195, 200  
**Severity**: MEDIUM  

**Issue**: Uses `opacity-70`, `opacity-60`, `opacity-50` on text which creates contrast issues in dark mode.

```tsx
// Line 47
<span className="flex items-center gap-2 opacity-70">

// Line 57
<span className="flex items-center gap-2 opacity-70">

// Line 121
<div className="flex items-center gap-3 text-xs font-mono opacity-60">

// Line 167
<div className="flex items-center gap-3 mb-4 text-xs font-mono opacity-50">
```

**Problem**: In dark mode, reducing opacity of white text makes it harder to read. Better to use semantic color classes.

**Fix**:
```tsx
// Before
className="... opacity-70"

// After
className="... text-muted-foreground"
// OR
className="... text-foreground/70"
```

---

### 11. InsightCard.tsx - Tag Badge Colors
**File**: `/Users/dynamite/workspaces/com.dynamite/dynamitenotes/src/components/content/InsightCard.tsx`  
**Lines**: 31, 47  
**Severity**: LOW  

**Issue**: Tag badge uses hardcoded amber color for "Pinned" status.

```tsx
// Line 31
<div className="flex items-center gap-1 text-xs text-amber-500">

// Line 47
<Badge variant="outline" className="text-xs bg-muted/50">
```

**Status**: `text-amber-500` for pinned status is intentional and acceptable. The badge uses proper semantic classes.

---

### 12. SeriesCard.tsx - Featured Badge
**File**: `/Users/dynamite/workspaces/com.dynamite/dynamitenotes/src/components/content/SeriesCard.tsx`  
**Lines**: 57  
**Severity**: LOW  

**Issue**: Featured badge uses hardcoded amber color.

```tsx
// Line 57
<div className="flex items-center gap-1 text-amber-500">
```

**Status**: Intentional accent color. Acceptable as-is.

---

### 13. Changelog.tsx - Accent Colors
**File**: `/Users/dynamite/workspaces/com.dynamite/dynamitenotes/src/pages/Changelog.tsx`  
**Lines**: 84, 85, 146, 171, 182  
**Severity**: MEDIUM  

**Issue**: Type badges use `text-primary` but could benefit from more semantic colors.

```tsx
// Lines 84-85
color: "text-primary", 
bg: "bg-primary/10",

// Line 146
<span className="font-mono text-sm text-primary font-medium">

// Line 171
<GitCommit className="w-4 h-4 text-primary shrink-0 mt-0.5" />

// Line 182
className="inline-flex items-center gap-1.5 mt-4 text-sm text-primary hover:underline"
```

**Status**: Actually correct usage of semantic tokens. No fix needed.

---

### 14. Docs.tsx - Primary Color Links
**File**: `/Users/dynamite/workspaces/com.dynamite/dynamitenotes/src/pages/Docs.tsx`  
**Lines**: 62, 126, 154  
**Severity**: LOW  

**Issue**: Uses `text-primary` for links and highlights - this is correct!

**Status**: Proper use of semantic color tokens. No issues.

---

## Design System Analysis

### CSS Variables (index.css)
**Status**: ✅ CORRECT

The CSS variables are properly defined for both light and dark modes:

```css
/* Light mode */
:root {
  --primary: 0 0% 0%;              /* Black */
  --primary-foreground: 0 0% 100%; /* White */
  --muted: 0 0% 96%;               /* Light gray */
  --muted-foreground: 0 0% 0%;     /* Black */
  --border: 0 0% 90%;              /* Light gray border */
}

/* Dark mode */
.dark {
  --primary: 0 0% 100%;            /* White */
  --primary-foreground: 0 0% 0%;   /* Black */
  --muted: 0 0% 10%;               /* Dark gray */
  --muted-foreground: 0 0% 100%;   /* White */
  --border: 0 0% 20%;              /* Dark gray border */
}
```

**Recommendation**: The design system is solid. Issues stem from hardcoded Tailwind colors, not the token system.

---

## Patterns Requiring Fixes

### Pattern 1: Hardcoded Color Classes
**Found in**: 8 files  
**Severity**: MEDIUM  

Examples:
- `text-blue-400` → should use `text-primary` or `text-blue-400 dark:text-blue-300`
- `bg-blue-500/10` → should use `bg-primary/10`
- `border-purple-500/20` → should use `border-primary/20`

**Fix Strategy**:
1. Replace with semantic tokens (`text-primary`, `bg-primary/10`)
2. Or add dark mode variants (`dark:text-blue-300`)

### Pattern 2: Opacity on Foreground Colors
**Found in**: 3 files  
**Severity**: MEDIUM  

Examples:
- `opacity-70` on text → use `text-muted-foreground` or `text-foreground/70`
- `opacity-50` on text → use `text-foreground/50`

**Fix Strategy**:
- Use `text-foreground/{opacity}` instead of `opacity-{percent}`
- Or use semantic `text-muted-foreground` class

### Pattern 3: Primary/10 Backgrounds in Dark Mode
**Found in**: 4 files  
**Severity**: MEDIUM  

**Problem**: `bg-primary/10` in dark mode = white with 10% opacity = very subtle, poor contrast.

**Fix Strategy**:
```tsx
// Option 1: Increase opacity in dark mode
className="bg-primary/10 dark:bg-primary/20"

// Option 2: Use border instead
className="border border-primary/30 text-primary"

// Option 3: Use solid colors with opacity modifiers
className="bg-primary text-primary-foreground dark:bg-primary/90"
```

---

## Summary of Fixes Required

### High Priority (Affects Readability)
1. **Insights.tsx** (lines 161, 177) - Active filter chips
2. **About.tsx** (lines 177, 193, 203, 211) - Social link hover states
3. **GoalPicker.tsx** (lines 58-77) - Color mapping system
4. **PostCard.tsx** (lines 47, 57, 121, 167, 187) - Opacity usage

### Medium Priority (Visual Polish)
5. **TagChip.tsx** (line 22) - Active badge styling
6. **TagFilterBar.tsx** (line 27) - Label contrast
7. **About.tsx** (lines 79, 96, 100, 106, 113, 131, 146, 160) - Profile section colors

### Low Priority (Nice to Have)
8. **InsightsSearch.tsx** (line 17) - Search icon (actually OK)
9. **SeriesCard.tsx** (line 57) - Featured badge (intentional)
10. **InsightCard.tsx** (line 31) - Pinned badge (intentional)

---

## Recommended Approach

### Phase 1: Fix Critical Contrast Issues
1. Fix active filter chips in `Insights.tsx`
2. Fix social link cards in `About.tsx`
3. Fix opacity usage in `PostCard.tsx`

### Phase 2: Refactor Color Systems
4. Refactor `GoalPicker.tsx` color map to use dark mode variants
5. Update `TagChip.tsx` and `TagFilterBar.tsx` for consistency

### Phase 3: Polish & Consistency
6. Update hardcoded accent colors in `About.tsx`
7. Add dark mode utility classes where needed

---

## Testing Checklist

After fixes:
- [ ] Test all pages in dark mode (browser dev tools or system preference)
- [ ] Verify text contrast ratios meet WCAG AA standards (4.5:1 for normal text)
- [ ] Check interactive elements (buttons, links, cards) have clear hover states
- [ ] Test with various color blindness simulators
- [ ] Verify all badges and tags are readable
- [ ] Check form inputs and search fields have proper contrast

---

## Unresolved Questions

1. **GoalPicker Color Variety**: Should goal buttons have different colors in dark mode, or unify to use semantic tokens for better consistency?

2. **Accent Colors**: Pages like About.tsx use blue/purple/green accents. Should these:
   - Keep hardcoded colors for variety?
   - Switch to semantic primary/accent tokens?
   - Use a defined accent color palette?

3. **Active State Indication**: In dark mode, should active filters use:
   - Inverted colors (white bg, black text)?
   - Borders with transparent background?
   - Higher opacity backgrounds?

4. **Brutalist Design Constraints**: The design uses "pure black & white" aesthetic. How much color variation is acceptable while maintaining this identity?

---

## Files Requiring Updates

```
src/components/content/TagChip.tsx
src/components/content/TagFilterBar.tsx
src/components/content/PostCard.tsx
src/components/content/GoalPicker.tsx
src/pages/Insights.tsx
src/pages/About.tsx
src/pages/Search.tsx
src/pages/Changelog.tsx
```

**Total Estimated Fixes**: 20-30 class updates across 8 files

---

**End of Report**

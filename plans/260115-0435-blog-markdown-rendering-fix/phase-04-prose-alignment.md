# Phase 4: Prose Class Alignment

**Duration**: 30 min
**Dependencies**: Phase 3 complete

---

## Objectives

Create custom prose variant aligned with shadcn/ui design tokens.

---

## Tasks

### 4.1 Create Custom Prose CSS (20 min)

**File**: `src/tailwindcss/prose.css` (create directory if needed)

```css
/**
 * Custom Prose Styles for Markdown
 * Aligned with shadcn/ui design tokens
 */

@layer components {
  /* Base prose variant */
  .prose-custom {
    /* Using shadcn/ui CSS variables */
    --prose-p-color: hsl(var(--muted-foreground));
    --prose-headings-color: hsl(var(--foreground));
    --prose-a-color: hsl(var(--primary));
    --prose-strong-color: hsl(var(--foreground));
    --prose-code-color: hsl(var(--primary));
    --prose-pre-color: hsl(var(--foreground));
    --prose-blockquote-color: hsl(var(--muted-foreground));
    --prose-hr-color: hsl(var(--border));

    font-family: theme("fontFamily.sans");
    line-height: 1.75;
  }

  /* Dark mode variant */
  .dark .prose-custom {
    --prose-p-color: hsl(var(--muted-foreground));
    --prose-headings-color: hsl(var(--foreground));
    --prose-a-color: hsl(var(--primary));
    --prose-strong-color: hsl(var(--foreground));
    --prose-code-color: hsl(var(--primary));
  }
}

/* Alternative: Extend Tailwind typography config */
/* Add to tailwind.config.js instead if preferred */
```

---

### 4.2 Update Tailwind Config (10 min)

**File**: `tailwind.config.js`

Add to plugins section:

```javascript
module.exports = {
  // ...
  plugins: [
    require("@tailwindcss/typography"),
    // ... other plugins
  ],
  theme: {
    extend: {
      typography: ({ theme }) => ({
        DEFAULT: {
          css: {
            // Override with shadcn/ui colors
            "--tw-prose-body": theme("colors.muted.foreground"),
            "--tw-prose-headings": theme("colors.foreground"),
            "--tw-prose-links": theme("colors.primary.DEFAULT"),
            "--tw-prose-bold": theme("colors.foreground"),
            "--tw-prose-code": theme("colors.primary.DEFAULT"),
            "--tw-prose-hr": theme("colors.border"),
          },
        },
      }),
    },
  },
}
```

---

## Verification

- [ ] prose.css created (or tailwind.config updated)
- [ ] Styles align with shadcn/ui design
- [ ] Dark mode works correctly
- [ ] All prose elements styled properly

---

## Alternative Approach

If custom prose classes conflict, stick with `markdown-content` class from Phase 1 and skip this phase.

---

## Next Phase

After prose alignment, proceed to **Phase 5: Testing & Verification**.

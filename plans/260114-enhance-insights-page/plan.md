---
title: "Enhance Insights Page with Filtering and Search"
description: "Add tag filtering, search functionality, and improved UX to the public Insights page"
status: completed
priority: P3
effort: 4h
issue: none
branch: main
tags: [feature, frontend, ux]
created: 2026-01-14
completed: 2026-01-14
---

# Plan: Enhance Insights Page

## Overview

Enhance the existing `/insights` public page to add:
1. **Tag filtering** - Filter insights by tags with selectable tag chips
2. **Search functionality** - Real-time search through insight content
3. **Improved empty states** - Better UX when no insights match filters
4. **Active filter display** - Show currently active filters with clear option

**Existing Infrastructure:**
- Insights page with infinite scroll ✅
- Pinned insights section ✅
- InsightCard component ✅
- Vietnamese/English support ✅
- Responsive design ✅
- Published-only filtering ✅

**Gaps:**
- No tag filtering UI
- No search functionality
- Limited filter state management

---

## Current State Analysis

### Existing Pages/Components
- `src/pages/Insights.tsx` - Main insights page with infinite scroll
- `src/components/content/InsightCard.tsx` - Card component for individual insight
- `src/hooks/use-insights.ts` - Data fetching hooks

### Database Schema
```prisma
model Insight {
  id            String      @id @default(uuid())
  contentVi     String      @map("content_vi")
  contentEn     String?     @map("content_en")
  tags          String[]    // Array of tag strings
  pinned        Boolean     @default(false)
  published     Boolean     @default(false)
  publishedAt   DateTime?   @map("published_at")
  createdAt     DateTime    @default(now()) @map("created_at")
  relatedPost   Post?       @relation("PostInsights")
  relatedPostId String?     @map("related_post_id")
}
```

---

## Solution Design

### Component Architecture

```
Insights (page)
├── InsightsHeader (new)
│   ├── Title
│   ├── SearchInput
│   └── ActiveFilters
├── PinnedSection (existing)
├── TagFilterBar (new)
│   └── TagChip (selectable)
├── InsightsList
│   └── InsightCard (existing)
└── EmptyState (enhanced)
```

### State Management

Use React state for filters (no complex state library needed):
```typescript
interface InsightsFilters {
  search: string;
  selectedTags: Set<string>;
}
```

### Data Filtering Strategy

**Two-tier filtering:**
1. **Client-side** - Filter already fetched insights (for tags + search)
2. **Server-side** - Supabase queries for published insights only

**Rationale:** Since insights are relatively small content, client-side filtering after pagination is simpler and sufficient. Can optimize to server-side later if needed.

---

## Phase Breakdown

### Phase 1: Create Tag Filter Component
**Effort**: 1h

**Tasks:**
1. Create `src/components/content/TagFilterBar.tsx`
2. Create `src/components/content/TagChip.tsx`
3. Style with shadcn/ui Badge as base
4. Add hover/select states

**Files:**
- `src/components/content/TagFilterBar.tsx` (create)
- `src/components/content/TagChip.tsx` (create)

**TagFilterBar Specification:**
```typescript
interface TagFilterBarProps {
  availableTags: string[];  // All unique tags from insights
  selectedTags: Set<string>;
  onTagToggle: (tag: string) => void;
  onClearAll: () => void;
}
```

---

### Phase 2: Create Search Component
**Effort**: 0.5h

**Tasks:**
1. Create `src/components/content/InsightsSearch.tsx`
2. Use shadcn/ui Input with search icon
3. Debounce input to prevent excessive re-renders

**Files:**
- `src/components/content/InsightsSearch.tsx` (create)

**InsightsSearch Specification:**
```typescript
interface InsightsSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}
```

---

### Phase 3: Update Insights Page with Filters
**Effort**: 1.5h

**Tasks:**
1. Add filter state (search, selectedTags)
2. Extract unique tags from insights
3. Implement filtering logic for insights array
4. Add filter bar and search to header
5. Update empty state to show "no matching insights"
6. Show active filters with clear button

**Files:**
- `src/pages/Insights.tsx` (modify)

**Filtering Logic:**
```typescript
const filteredInsights = useMemo(() => {
  return allInsights.filter(insight => {
    // Search filter
    if (searchQuery) {
      const content = getLocalizedField(insight, "content").toLowerCase();
      if (!content.includes(searchQuery.toLowerCase())) return false;
    }

    // Tag filter
    if (selectedTags.size > 0) {
      const insightTags = insight.tags || [];
      if (!selectedTags.some(tag => insightTags.includes(tag))) return false;
    }

    return true;
  });
}, [allInsights, searchQuery, selectedTags]);
```

---

### Phase 4: Add Active Filters Display
**Effort**: 0.5h

**Tasks:**
1. Create `ActiveFilters` component showing selected tags + search term
2. Add individual clear buttons (x on each tag)
3. Add "Clear all" button

**Files:**
- `src/components/content/ActiveFilters.tsx` (create)
- `src/pages/Insights.tsx` (modify - add ActiveFilters)

---

### Phase 5: Enhance Empty States
**Effort**: 0.5h

**Tasks:**
1. Update empty state when no insights exist
2. Add empty state when filters return no results
3. Add "Clear filters" CTA button

**Files:**
- `src/pages/Insights.tsx` (modify)

---

## Implementation Details

### Tag Extraction

Get all unique tags from insights:
```typescript
const allTags = useMemo(() => {
  const tagsSet = new Set<string>();
  allInsights.forEach(insight => {
    insight.tags?.forEach(tag => tagsSet.add(tag));
  });
  return Array.from(tagsSet).sort();
}, [allInsights]);
```

### Debounced Search

Use simple timeout debounce for search input:
```typescript
const [searchDebounceTimer, setSearchDebounceTimer] = useState<NodeJS.Timeout>();

const handleSearchChange = (value: string) => {
  clearTimeout(searchDebounceTimer);
  setSearchDebounceTimer(
    setTimeout(() => {
      setSearchQuery(value);
    }, 300)
  );
};
```

### URL State (Optional Enhancement)

Persist filters in URL for shareable links:
```typescript
// Use URLSearchParams for search and tags
const params = new URLSearchParams();
if (searchQuery) params.set('q', searchQuery);
selectedTags.forEach(tag => params.append('tag', tag));
```

---

## UI Design Specifications

### Layout Structure
```
┌─────────────────────────────────────────────┐
│  Insights Header                              │
│  ┌─────────────────────────────────────────┐  │
│  │ Search: [________________] 🔍           │  │
│  └─────────────────────────────────────────┘  │
│  ┌─────────────────────────────────────────┐  │
│  │ Active Filters: [tag1] [tag2] [x clear] │  │
│  └─────────────────────────────────────────┘  │
└─────────────────────────────────────────────┘
┌─────────────────────────────────────────────┐
│  📌 Pinned                                  │
│  ┌─────────────────────────────────────────┐  │
│  │ Pinned insight 1                         │  │
│  └─────────────────────────────────────────┘  │
│  ┌─────────────────────────────────────────┐  │
│  │ Pinned insight 2                         │  │
│  └─────────────────────────────────────────┘  │
└─────────────────────────────────────────────┘
┌─────────────────────────────────────────────┐
│  Filter by Tags:                             │
│  [design] [react] [tips] [career] [+3 more]  │
└─────────────────────────────────────────────┘
┌─────────────────────────────────────────────┐
│  All Insights                                │
│  ┌─────────────────────────────────────────┐  │
│  │ Regular insight 1                         │  │
│  └─────────────────────────────────────────┘  │
│  ┌─────────────────────────────────────────┐  │
│  │ Regular insight 2                         │  │
│  └─────────────────────────────────────────┘  │
└─────────────────────────────────────────────┘
```

### Color Scheme
- **Tag chips**: Outline variant, muted background, colored border on hover
- **Active filters**: Solid variant with contrasting background
- **Search input**: Standard shadcn Input with search icon

---

## Component Specifications

### TagChip.tsx
```typescript
interface TagChipProps {
  tag: string;
  selected: boolean;
  onClick: () => void;
  onRemove?: () => void;  // For active filter removal
  variant?: 'filter' | 'active';
}

export function TagChip({ tag, selected, onClick, onRemove, variant = 'filter' }: TagChipProps) {
  const baseClasses = "cursor-pointer transition-colors";

  if (variant === 'active') {
    return (
      <Badge className={`${baseClasses} bg-primary text-primary-foreground`}>
        {tag}
        {onRemove && (
          <button onClick={onRemove} className="ml-1 hover:opacity-70">×</button>
        )}
      </Badge>
    );
  }

  return (
    <Badge
      variant={selected ? "default" : "outline"}
      className={`${baseClasses} ${selected ? "" : "hover:bg-muted"}`}
      onClick={onClick}
    >
      {tag}
    </Badge>
  );
}
```

### TagFilterBar.tsx
```typescript
interface TagFilterBarProps {
  availableTags: string[];
  selectedTags: Set<string>;
  onTagToggle: (tag: string) => void;
  onClearAll: () => void;
  maxVisible?: number;  // Show "N more" for many tags
}

export function TagFilterBar({
  availableTags,
  selectedTags,
  onTagToggle,
  onClearAll,
  maxVisible = 8
}: TagFilterBarProps) {
  const [showAll, setShowAll] = useState(false);

  const visibleTags = showAll ? availableTags : availableTags.slice(0, maxVisible);
  const hasMore = availableTags.length > maxVisible;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-sm text-muted-foreground">Filter by:</span>
      {visibleTags.map(tag => (
        <TagChip
          key={tag}
          tag={tag}
          selected={selectedTags.has(tag)}
          onClick={() => onTagToggle(tag)}
        />
      ))}
      {!showAll && hasMore && (
        <Button
          variant="ghost"
          size="sm"
          className="h-7 text-xs"
          onClick={() => setShowAll(true)}
        >
          +{availableTags.length - maxVisible} more
        </Button>
      )}
      {selectedTags.size > 0 && (
        <Button
          variant="ghost"
          size="sm"
          className="h-7 text-xs"
          onClick={onClearAll}
        >
          Clear filters
        </Button>
      )}
    </div>
  );
}
```

---

## Testing Strategy

### Manual Testing Checklist
- [ ] Search filters insights by content
- [ ] Tag filter shows all unique tags
- [ ] Clicking tag filters insights by that tag
- [ ] Multiple tags work (OR logic)
- [ ] Active filters display correctly
- [ ] Clear all filters resets view
- [ ] Individual tag removal works
- [ ] Empty state shows when no results
- [ ] Infinite scroll still works with filters
- [ ] Vietnamese/English content displays correctly

### Edge Cases
- No insights exist
- No tags on any insights
- Search returns no results
- All filtered out by tags
- Very long tag names
- Special characters in search

---

## Files to Create/Modify

### Create (4 files)
1. `src/components/content/TagChip.tsx`
2. `src/components/content/TagFilterBar.tsx`
3. `src/components/content/InsightsSearch.tsx`
4. `src/components/content/ActiveFilters.tsx`

### Modify (1 file)
1. `src/pages/Insights.tsx` - Add filter state, filter logic, and new components

---

## Rollback Plan

If issues arise:
1. Revert `src/pages/Insights.tsx` to previous version
2. Delete new components if causing issues
3. No database changes required (safe rollback)

---

## Open Questions

None - requirements are clear and existing infrastructure is sufficient.

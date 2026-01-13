# Code Review Guidelines

This document provides checklists, anti-patterns to avoid, and maintenance guidelines for Dynamite Notes development.

**Related**: [Code Standards](./code-standards.md) for coding conventions and patterns.

---

## Code Review Checklist

Before submitting code for review:

### Functionality
- [ ] Feature works as expected
- [ ] No console errors or warnings
- [ ] Tested on Chrome, Firefox, Safari
- [ ] Tested on mobile viewport

### Code Quality
- [ ] Follows TypeScript conventions
- [ ] Uses semantic color tokens (no hard-coded colors)
- [ ] Component is focused and reusable
- [ ] No duplicate code (DRY principle)

### Performance
- [ ] No unnecessary re-renders
- [ ] Images optimized and lazy-loaded
- [ ] Large components code-split or lazy-loaded

### Accessibility
- [ ] Keyboard navigation works
- [ ] Sufficient color contrast (check with DevTools)
- [ ] Semantic HTML used
- [ ] ARIA labels for icon-only buttons

### Documentation
- [ ] Complex logic has JSDoc comments
- [ ] README updated if needed
- [ ] Props documented for reusable components

---

## Common Anti-Patterns to Avoid

### 1. Inline Styles

**Bad**:
```typescript
<div style={{ display: "flex", gap: "16px" }}>
```

**Good**:
```typescript
<div className="flex gap-4">
```

### 2. Magic Numbers

**Bad**:
```typescript
if (items.length > 10) { /* ... */ }
setTimeout(callback, 3000);
```

**Good**:
```typescript
const MAX_VISIBLE_ITEMS = 10;
const DEBOUNCE_DELAY_MS = 3000;

if (items.length > MAX_VISIBLE_ITEMS) { /* ... */ }
setTimeout(callback, DEBOUNCE_DELAY_MS);
```

### 3. Prop Drilling

**Bad** (passing props through 3+ levels):
```typescript
<App user={user}>
  <Dashboard user={user}>
    <Sidebar user={user}>
      <UserMenu user={user} />
```

**Good** (use Context when prop drilling > 2 levels):
```typescript
<UserContext.Provider value={user}>
  <App>
    <Dashboard>
      <Sidebar>
        <UserMenu /> {/* Uses useContext(UserContext) */}
```

### 4. Large Components

**Avoid**: Components > 200 lines (excluding shadcn-ui components)

**Solution**: Extract subcomponents, custom hooks, or utility functions.

### 5. Non-Descriptive Names

**Bad**:
```typescript
const handleClick = () => { /* ... */ };
const data = fetchData();
const item = items[0];
```

**Good**:
```typescript
const handlePackageExpand = () => { /* ... */ };
const packages = fetchPackages();
const firstPackage = packages[0];
```

---

## Maintenance Guidelines

### When to Refactor

**Triggers**:
- Component exceeds 200 lines
- Logic duplicated in 3+ places
- Component has 5+ props (consider composition)
- Difficult to test in isolation

**Process**:
1. Create feature branch
2. Write tests for existing behavior (if not tested)
3. Refactor incrementally
4. Verify tests still pass
5. Submit PR with before/after comparison

### Dependency Updates

**Frequency**: Monthly security audits, quarterly feature updates

**Process**:
1. Run `bun audit` for vulnerabilities
2. Check changelogs for breaking changes
3. Update `package.json` and lock file
4. Test critical paths (routes, command palette, forms)
5. Update docs if API changes

**Priority**:
- **Critical**: Security vulnerabilities (immediate)
- **High**: Breaking changes in major dependencies
- **Medium**: New features in libraries
- **Low**: Patch updates for minor bugs

---

## Pull Request Template

```markdown
## Summary
<!-- Brief description of changes -->

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Refactoring
- [ ] Documentation update
- [ ] Breaking change

## Testing Performed
<!-- How was this tested? -->

## Screenshots (if UI changes)
<!-- Add before/after screenshots -->

## Checklist
- [ ] Code follows project conventions
- [ ] Self-reviewed changes
- [ ] Added/updated tests as needed
- [ ] Documentation updated
```

---

**Document Version**: 1.0
**Last Updated**: 2026-01-13
**Next Review**: Q2 2026
**Owner**: Engineering Team

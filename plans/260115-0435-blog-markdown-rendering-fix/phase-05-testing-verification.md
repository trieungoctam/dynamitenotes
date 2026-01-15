# Phase 5: Testing & Verification

**Duration**: 30 min
**Dependencies**: All previous phases complete

---

## Objectives

Test all markdown elements across components and modes.

---

## Test Cases

### 5.1 Markdown Elements (15 min)

Create test markdown file or use existing posts to verify:

```markdown
# Heading 1
## Heading 2
### Heading 3
#### Heading 4
##### Heading 5
###### Heading 6

This is a paragraph with **bold text** and *italic text* and `inline code`.

This is a [link](https://example.com).

> This is a blockquote.
> It can span multiple lines.

- Unordered list item 1
- Unordered list item 2
  - Nested item
  - Another nested item

1. Ordered list item 1
2. Ordered list item 2
3. Ordered list item 3

---

### Code Blocks

```javascript
function hello() {
  console.log("Hello, world!");
}
```

```python
def greet(name):
    print(f"Hello, {name}!")
```

```
Plain text code block
without syntax highlighting
```

### Inline Code
Use `backticks` for inline code.

### Tables

| Column 1 | Column 2 | Column 3 |
|----------|----------|----------|
| Cell 1   | Cell 2   | Cell 3   |
| Cell 4   | Cell 5   | Cell 6   |

### Images

![Alt text](https://via.placeholder.com/600x400)

### Combined Elements

**Bold with `code` inside**

- List with **bold**
- Nested list with *italic*
  - Third level with `code`

---

### Horizontal Rule

Above the line.
***
Below the line.

### Task Lists (GFM)

- [x] Completed task
- [ ] Incomplete task
```

---

### 5.2 Component Testing (10 min)

#### PostDetail Page
1. Navigate to a blog post
2. Verify all markdown elements render correctly
3. Check dark/light mode switching
4. Verify code blocks have copy button
5. Verify tables are scrollable on mobile

#### MarkdownEditor (Admin)
1. Open admin post editor
2. Type sample markdown
3. Toggle preview on/off
4. Verify preview updates in real-time
5. Test sync scrolling
6. Test fullscreen preview

#### Other Components
1. Check any other components using MarkdownRenderer
2. Verify consistent styling

---

### 5.3 Cross-Browser Testing (5 min)

Test in:
- [ ] Chrome/Edge
- [ ] Firefox
- [ ] Safari (if available)

---

## Verification Checklist

### Styling
- [ ] Headings have proper hierarchy
- [ ] Paragraphs have good line-height
- [ ] Links are colored and underlined on hover
- [ ] Bold text stands out
- [ ] Italic text is distinguishable
- [ ] Inline code has background color
- [ ] Code blocks have syntax highlighting
- [ ] Code blocks have copy button
- [ ] Code blocks adapt to dark/light mode
- [ ] Blockquotes have left border
- [ ] Lists have proper indentation
- [ ] Tables have borders
- [ ] Tables are scrollable on mobile
- [ ] Images are responsive
- [ ] Horizontal rules display correctly

### Functionality
- [ ] MarkdownRenderer renders all elements
- [ ] Copy button works on code blocks
- [ ] Preview toggle works in editor
- [ ] Sync scrolling works in editor
- [ ] Fullscreen preview works
- [ ] Theme switching works

### Cross-Mode
- [ ] Light mode looks good
- [ ] Dark mode looks good
- [ ] Theme switching doesn't break layout
- [ ] Code blocks update theme correctly

---

## Performance Checks

- [ ] No console errors
- [ ] Fast rendering (< 100ms for typical content)
- [ ] Smooth scrolling
- [ ] No layout shifts

---

## Accessibility

- [ ] Contrast ratios meet WCAG AA
- [ ] Code blocks readable
- [ ] Tables have proper headers
- [ ] Links have focus states
- [ ] Keyboard navigation works

---

## Bug Report Template

If issues found, document:

```markdown
## Issue: [Brief description]

**Location**: [Component/Page]
**Severity**: [Critical/High/Medium/Low]

**Steps to Reproduce**:
1.
2.
3.

**Expected Behavior**:
[What should happen]

**Actual Behavior**:
[What actually happens]

**Screenshot**:
[Attach if visual issue]

**Environment**:
- Browser: [Chrome/Firefox/Safari]
- Theme: [Light/Dark]
- Screen Size: [Desktop/Mobile]
```

---

## Success Criteria

All markdown elements render correctly in both light and dark modes, with proper styling aligned to shadcn/ui design system.

---

## Next Steps After Verification

If all tests pass:
1. Commit changes
2. Document any known issues
3. Create user documentation (if needed)

If issues found:
1. Create bug report
2. Fix issues
3. Re-test
4. Document workarounds

---

## Project Completion

Once all phases complete and verified, the markdown rendering issues should be resolved.

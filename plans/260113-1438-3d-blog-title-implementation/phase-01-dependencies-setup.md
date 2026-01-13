---
title: "Phase 01: Dependencies & Font Setup"
description: "Verify Three.js dependencies, select font for SDF generation, and configure TypeScript types"
status: pending
priority: P2
effort: 30m
created: 2026-01-13
---

## Context
- **Parent Plan**: [plan.md](./plan.md)
- **Dependencies**: `three@0.182.0`, `troika-three-text@0.52.4`, `@react-three/fiber@8.0.0`, `@react-three/drei@10.7.7` (already installed)

## Overview
Verify dependency versions, select appropriate font for SDF text generation, and ensure TypeScript compatibility.

## Key Insights
- All Three.js dependencies already installed in package.json
- Available fonts: clash-display-700.woff2, satoshi-400/500.woff2, geist-mono-400.woff2
- Troika requires JSON font format or TTF/OTF for SDF atlas generation
- Existing woff2 fonts cannot be directly used - need conversion or alternative

## Requirements
- Verify dependency compatibility
- Select font (Clash Display recommended for display text)
- Font licensing verification needed for SDF generation
- TypeScript type definitions for Troika

## Architecture
```
src/
├── components/three/
│   ├── BlogTitle3D/
│   │   ├── BlogTitle3D.tsx (main component)
│   │   ├── shaders.ts (GLSL shader constants)
│   │   └── index.ts (exports)
```

## Related Code Files
- `/Users/dynamite/workspaces/com.dynamite/dynamitenotes/package.json`
- `/Users/dynamite/workspaces/com.dynamite/dynamitenotes/public/fonts/*`
- `/Users/dynamite/workspaces/com.dynamite/dynamitenotes/src/components/three/Title3D.tsx` (existing stub)

## Implementation Steps

### 1. Verify Dependencies
```bash
# Check installed versions
npm list three troika-three-text @react-three/fiber @react-three/drei

# Verify versions match requirements
# three@0.182.0 ✓
# troika-three-text@0.52.4 ✓
# @react-three/fiber@8.0.0 ✓
# @react-three/drei@10.7.7 ✓
```

### 2. Font Selection Strategy

**Option A: Use Troika's Default Font** (Recommended)
- Pros: No licensing issues, works immediately
- Cons: Generic appearance

**Option B: Convert Clash Display to SDF**
- Pros: Brand consistency
- Cons: Licensing unclear, requires font conversion tool

**Option C: Use Google Font via Troika**
- Pros: Licensing clear, many options
- Cons: Requires HTTP fetch, may delay render

**Decision**: Start with Option A (Troika default), evaluate Option C if needed

### 3. TypeScript Configuration
```typescript
// Already handled by @types/three
// Troika types are included in troika-three-text package
```

### 4. Test Basic Setup
Create minimal test to verify Three.js + Troika works:
```typescript
// src/components/three/BlogTitle3D/test-setup.tsx
import { Canvas } from '@react-three/fiber';
import { Text } from '@react-three/drei';

export function TestSetup() {
  return (
    <Canvas>
      <Text fontSize={1} color="orange">
        Dynamite
      </Text>
    </Canvas>
  );
}
```

## Todo List
- [ ] Verify dependency versions are compatible
- [ ] Create `src/components/three/BlogTitle3D/` directory
- [ ] Implement basic test component with Troika default font
- [ ] Test rendering in dev environment
- [ ] Document font licensing status
- [ ] Decide on font strategy (default vs custom)

## Success Criteria
- [ ] All dependencies verified compatible
- [ ] Basic "Dynamite" text renders with Troika
- [ ] No TypeScript errors
- [ ] Font strategy documented

## Risk Assessment
- **Low**: Dependency conflicts (already installed, should work)
- **Medium**: Font licensing for custom SDF generation
- **Mitigation**: Start with Troika default font, evaluate later

## Security Considerations
- Font files from external sources must be verified
- No additional network requests for default Troika font
- Validate any custom font files before integration

## Next Steps
Once dependencies verified and basic test passes, proceed to [Phase 02: Base Component](./phase-02-base-component.md)

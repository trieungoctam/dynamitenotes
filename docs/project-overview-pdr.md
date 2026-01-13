# Project Overview & Product Development Requirements (PDR)

## Executive Summary

**Dynamite Notes** is a PM knowledge base and learning platform that democratizes product management expertise with a focus on AI-first product development. The platform delivers structured learning paths, practical templates, and interactive tools through a modern, keyboard-driven web interface.

**Target Audience**: Product managers, aspiring PMs, and product teams seeking to master AI-first product thinking and modern PM practices.

**Current Version**: v2.4.0 (Client-side SPA, static content)

## Product Vision

### Mission Statement

Empower product professionals to build better AI-first products through accessible, actionable knowledge that bridges theory and practice.

### Long-term Vision

Become the definitive learning platform for AI-first product management, where PMs of all experience levels can:
- Learn structured frameworks for AI product development
- Access templates and checklists that accelerate delivery
- Practice skills through interactive playgrounds
- Track progress and build verifiable competencies
- Contribute to and benefit from community knowledge

### Value Proposition

**For Individual PMs**:
- Structured learning paths with clear time commitments
- Practical tools and templates for immediate use
- Keyboard-driven interface for efficient navigation
- Self-paced learning with progress tracking (future)

**For Product Teams**:
- Shared knowledge base and common frameworks
- Standardized templates for cross-functional work
- Centralized documentation and best practices
- Team skill development and onboarding resources

**For Organizations**:
- AI-first product development capability building
- Reduced onboarding time for new PMs
- Consistent product development practices
- Measurable skill development (future)

## Target Users

### Primary Personas

**1. Growth-Stage PM (Primary)**
- **Profile**: 2-4 years PM experience, moving into AI product features
- **Goals**: Learn AI-first frameworks, gain practical skills, deliver AI features
- **Pain Points**: Lack of structured AI PM education, uncertain how to scope AI features, no clear templates
- **Use Cases**: Learning packages, template library, playground experiments
- **Success Metrics**: Completed learning paths, templates used, time saved

**2. Aspiring PM (Secondary)**
- **Profile**: Career switcher or junior role, building foundational skills
- **Goals**: Learn PM fundamentals, understand AI product landscape, build portfolio
- **Pain Points**: Overwhelming information, no clear learning path, lack of hands-on practice
- **Use Cases**: Starter packages, framework documentation, basic templates
- **Success Metrics**: Completed starter paths, knowledge retention, confidence gains

**3. Senior PM / Product Leader (Tertiary)**
- **Profile**: 5+ years experience, leading teams or building strategy
- **Goals**: Reference materials, team enablement, strategic frameworks
- **Pain Points**: Time constraints, need for quick reference, team skill gaps
- **Use Cases**: Template library, advanced frameworks, team sharing (future)
- **Success Metrics**: Templates adopted, team usage, time saved

### User Needs Analysis

| Need | Current Solution | Priority | Status |
|------|------------------|----------|--------|
| Structured AI PM learning | 6 learning packages | High | Implemented |
| Quick knowledge access | Command palette (Cmd+K) | High | Implemented |
| Practical templates | Document library | Medium | Implemented |
| Hands-on practice | Interactive playgrounds | Medium | Partial (4 tools, 1 placeholder) |
| Progress tracking | None | High | Planned |
| Community contributions | None | Medium | Future |
| Personalization | Mode selector (PM/AI/Snack) | Low | Implemented |
| Team collaboration | None | Medium | Future |

## Product Features

### Current Features (v2.4.0)

#### 1. Learning Packages (Core Feature)

**Description**: Structured learning paths organized by topic and difficulty level.

**Capabilities**:
- 6 thematic packages covering AI-first PM, experiments, user research, metrics, go-to-market, stakeholder management
- Difficulty levels: Starter, Builder, Advanced
- Time-to-complete estimates for planning
- Mixed content types: articles, templates, playgrounds
- Expandable tree navigation for easy browsing
- Difficulty filtering for skill-appropriate content

**User Value**: Clear learning roadmap with time-boxed modules for busy professionals.

**Technical Implementation**: Static data in `Packages.tsx`, client-side filtering, URL-based navigation.

#### 2. Command Palette Navigation

**Description**: Keyboard-driven global navigation (Cmd+K / Ctrl+K).

**Capabilities**:
- Instant access to all pages and content
- Keyboard-first interaction model
- Visual search results
- Quick navigation without mouse

**User Value**: Power user efficiency, reduced cognitive load, faster content discovery.

**Technical Implementation**: `cmdk` library, global keyboard listener, React portal for overlay.

#### 3. Document Library

**Description**: Curated templates, frameworks, and checklists for PM work.

**Capabilities**:
- Featured documents with descriptions
- Type categorization (template, framework, checklist)
- Read time estimates
- Direct access to specific documents via URL

**User Value**: Immediate access to production-ready PM artifacts.

**Technical Implementation**: Static content list, client-side rendering.

#### 4. Interactive Playgrounds

**Description**: Hands-on tools for practicing PM skills.

**Capabilities**:
- 4 interactive tools (1 coming soon indicator)
- Tool categorization and descriptions
- Dedicated tool pages

**User Value**: Learn by doing, experiment without consequences, build intuition.

**Technical Implementation**: Separate tool components, URL routing to specific tools.

#### 5. Changelog / Version History

**Description**: Timeline of platform updates and new content releases.

**Capabilities**:
- Chronological version entries
- Change categorization
- Release date tracking

**User Value**: Transparency, awareness of new features, content freshness signals.

**Technical Implementation**: Static changelog data, timeline UI component.

#### 6. Glassmorphism UI with Dark Mode

**Description**: Modern, visually distinctive interface design.

**Capabilities**:
- Dark mode default (glass effects optimized for dark)
- Geist Mono typography (monospace-first aesthetic)
- Consistent design system via shadcn-ui
- Responsive layout for mobile/tablet/desktop
- Smooth animations and transitions

**User Value**: Reduced eye strain, professional aesthetic, brand differentiation.

**Technical Implementation**: Tailwind CSS with custom theme, CSS variables, next-themes integration.

#### 7. Mode Selector

**Description**: Content filtering by user interest (PM, AI, Snack).

**Capabilities**:
- Three modes: PM-focused, AI-focused, Snack-sized content
- Visual mode selection on landing page
- URL state preservation

**User Value**: Personalized content discovery, reduced information overload.

**Technical Implementation**: URL search params, client-side filtering (visual only currently).

### Planned Features (Roadmap)

See [Project Roadmap](./project-roadmap.md) for detailed timeline and priorities.

**High Priority** (v3.x):
- User authentication and profiles
- Progress tracking and completion states
- Backend API integration for dynamic content
- Full-text search across all content
- Bookmark and favorites system
- Content recommendations based on history

**Medium Priority** (v4.x):
- User-generated content contributions
- Team workspaces and sharing
- Learning path customization
- Certificate of completion for paths
- Discussion threads on content items
- Rich text editing for playground tools

**Low Priority** (Future):
- AI-powered learning assistant
- Skill assessments and quizzes
- Video content integration
- Live cohort-based learning
- Marketplace for premium content
- Mobile native apps (iOS/Android)

## Functional Requirements

### FR-1: Learning Package System

**Requirements**:
- Display packages with metadata (name, description, icon, difficulty, time)
- Filter packages by difficulty level
- Expand/collapse package contents
- Navigate to individual package items
- Preserve navigation state in URL

**Acceptance Criteria**:
- All 6 packages load within 100ms (static data)
- Difficulty filter updates view instantly
- Package expansion state persists on page refresh
- Deep links to package items work correctly
- Mobile layout supports touch interactions

**Status**: Implemented

### FR-2: Command Palette

**Requirements**:
- Trigger via Cmd+K (Mac) or Ctrl+K (Windows/Linux)
- Display all navigable pages and content
- Support fuzzy search/filtering
- Keyboard navigation (arrow keys, Enter, Escape)
- Close on selection or Escape key

**Acceptance Criteria**:
- Opens within 50ms of keypress
- All routes accessible via palette
- Search results update as user types
- Keyboard-only operation fully supported
- Backdrop click dismisses palette

**Status**: Implemented

### FR-3: Document Library

**Requirements**:
- Display featured documents with metadata
- Support direct navigation to documents
- Categorize by type (template, framework, checklist)
- Show read time estimates
- Provide clear visual hierarchy

**Acceptance Criteria**:
- Documents load instantly (static content)
- Type badges clearly visible
- URLs are shareable and bookmarkable
- Mobile-optimized card layout
- Icons meaningful and consistent

**Status**: Implemented

### FR-4: Interactive Playgrounds

**Requirements**:
- List available playground tools
- Navigate to individual tools
- Display tool descriptions and purposes
- Indicate tools under development
- Support full-page tool interfaces

**Acceptance Criteria**:
- Tool list loads instantly
- "Coming soon" state clearly indicated
- Tool interfaces are interactive and responsive
- State resets between tool switches
- Mobile-friendly interactions

**Status**: Partially implemented (tool list complete, some tools need implementation)

### FR-5: Responsive Design

**Requirements**:
- Support desktop (1024px+), tablet (768-1023px), mobile (320-767px)
- Adaptive navigation (hamburger menu on mobile)
- Touch-friendly interactions on mobile
- Readable typography at all sizes
- No horizontal scrolling

**Acceptance Criteria**:
- Layout adapts smoothly at all breakpoints
- Touch targets minimum 44x44px on mobile
- Text remains readable without zoom
- Images and components scale appropriately
- Command palette works on mobile

**Status**: Implemented

### FR-6: Dark Mode

**Requirements**:
- Default to dark mode on first visit
- Consistent dark theme across all pages
- Sufficient contrast for accessibility (WCAG AA)
- Smooth theme transition animations

**Acceptance Criteria**:
- All UI elements support dark mode
- Contrast ratios meet WCAG 2.1 AA standards
- No flash of unstyled content on load
- Custom CSS properties drive all colors
- Theme preference persists (future: user preference)

**Status**: Implemented (dark only, light mode UI exists but not activated)

## Non-Functional Requirements

### NFR-1: Performance

**Requirements**:
- Initial page load: < 2 seconds (LCP)
- Time to interactive: < 3 seconds (TTI)
- Route transitions: < 100ms
- Command palette open: < 50ms
- Lighthouse score: 90+ (Performance, Accessibility, Best Practices)

**Measurement**: Lighthouse CI, real user monitoring (future)

**Status**: Initial load meets targets, Lighthouse not yet integrated

### NFR-2: Accessibility

**Requirements**:
- WCAG 2.1 Level AA compliance
- Keyboard navigation for all interactive elements
- Screen reader support (ARIA labels, semantic HTML)
- Focus indicators visible and clear
- Sufficient color contrast (4.5:1 for text, 3:1 for UI)
- No reliance on color alone for information

**Measurement**: Lighthouse accessibility score, axe DevTools, manual keyboard testing

**Status**: Partial (shadcn-ui provides accessible primitives, but not fully audited)

### NFR-3: Browser Compatibility

**Requirements**:
- Chrome 90+ (primary target)
- Firefox 88+
- Safari 14+
- Edge 90+
- No IE11 support (modern browsers only)

**Measurement**: BrowserStack testing, analytics on browser usage

**Status**: Modern browser build (ES2020+), not tested cross-browser

### NFR-4: Mobile Optimization

**Requirements**:
- Responsive layout down to 320px width
- Touch targets minimum 44x44px
- No horizontal scrolling
- Fast rendering on mobile devices
- Minimal JavaScript payload for fast parsing

**Measurement**: Mobile Lighthouse scores, device testing

**Status**: Responsive design implemented, mobile performance not measured

### NFR-5: SEO & Discoverability

**Requirements**:
- Semantic HTML structure
- Meta tags for social sharing (Open Graph, Twitter Cards)
- Descriptive page titles for each route
- Sitemap.xml for search engines
- robots.txt for crawler guidance
- Structured data (JSON-LD) for rich results

**Measurement**: Google Search Console, SEO audits

**Status**: Basic HTML structure, meta tags and structured data not implemented

### NFR-6: Maintainability

**Requirements**:
- Component reusability > 70%
- Clear separation of concerns (UI, logic, data)
- Comprehensive documentation for all features
- Consistent code style (ESLint rules)
- TypeScript for type safety
- Git commit message conventions

**Measurement**: Code review metrics, documentation coverage

**Status**: Strong component reuse, documentation in progress, TS strictness relaxed

### NFR-7: Scalability

**Requirements**:
- Architecture supports backend API integration
- State management ready for complex data flows
- Code splitting by route (automatic with Vite)
- Lazy loading for heavy components
- Database-ready data models (future)

**Measurement**: Bundle size analysis, route-level code splitting

**Status**: TanStack Query configured, code splitting active, no backend yet

### NFR-8: Security

**Requirements**:
- No client-side storage of sensitive data
- HTTPS-only in production
- Content Security Policy (CSP) headers
- Dependency vulnerability scanning
- Secure authentication when implemented (future)

**Measurement**: OWASP ZAP scans, npm audit, Snyk

**Status**: No auth yet, static site (minimal security surface)

## Technical Constraints

### Technology Stack Constraints

**Fixed Decisions**:
- React 18 (framework choice)
- TypeScript (language choice)
- Vite (build tool choice)
- Tailwind CSS (styling approach)
- shadcn-ui (component library)
- React Router v6 (routing)

**Rationale**: Modern stack optimized for developer velocity, strong TypeScript support, excellent Vite performance, rich shadcn-ui ecosystem.

**Trade-offs**:
- No SSR (client-side only) - limits SEO, increases TTI
- No backend (static site) - limits personalization, requires future migration
- Relaxed TypeScript - faster iteration but more runtime risk

### Infrastructure Constraints

**Hosting**: Static site hosting (Vercel, Netlify, Cloudflare Pages)
- **Implication**: No server-side logic, API routes, or database
- **Workaround**: Future backend via separate service or serverless functions

**Build Time**: Vite build must complete in < 2 minutes
- **Implication**: Keep bundle size manageable, avoid heavy compile-time operations
- **Mitigation**: Code splitting, lazy loading, tree-shaking

**Browser Support**: ES2020+ features only (no polyfills)
- **Implication**: < 5% global browser support excluded (IE11, older mobile browsers)
- **Benefit**: Smaller bundles, modern JavaScript features, faster parsing

### Data Constraints

**Current**: All data is static (hardcoded in components)
- **Implication**: No user-generated content, no personalization, no analytics
- **Migration Path**: Add backend API, migrate static data to database

**Future**: API-driven content
- **Requirement**: Backend service with REST or GraphQL API
- **Consideration**: API versioning, caching strategy, offline support

## Dependencies & Integrations

### External Dependencies

**Core Dependencies** (must have):
- React 18.3.1
- React Router 6.30.1
- Tailwind CSS 3.4.17
- Radix UI primitives (25+ packages)
- TypeScript 5.8.3

**UI Dependencies** (can substitute):
- lucide-react (could use heroicons, react-icons)
- cmdk (could build custom command palette)
- next-themes (could use custom theme solution)

**Form & Validation** (future):
- react-hook-form (could use Formik)
- zod (could use Yup, io-ts)

### Future Integrations

**Authentication** (planned):
- Candidates: Supabase Auth, Clerk, Auth0, Firebase Auth
- Requirements: Social login, email/password, JWT tokens
- Integration Point: Provider in App.tsx, protected routes

**Analytics** (planned):
- Candidates: PostHog, Mixpanel, Amplitude, Google Analytics 4
- Requirements: Event tracking, user journeys, conversion funnels
- Integration Point: Custom event hook, route change listener

**Backend API** (planned):
- Candidates: Supabase, Firebase, custom Node.js/Python API
- Requirements: RESTful or GraphQL, real-time subscriptions (optional)
- Integration Point: TanStack Query, API client in src/lib/

**Search** (planned):
- Candidates: Algolia, Typesense, Meilisearch, Fuse.js (client-side)
- Requirements: Full-text search, fuzzy matching, instant results
- Integration Point: Search bar in TopNav, command palette integration

**Content Management** (future):
- Candidates: Sanity, Contentful, Strapi, custom CMS
- Requirements: Markdown support, media library, version control
- Integration Point: API integration, preview mode

## Success Metrics

### Product Metrics (North Star)

**Primary**: Weekly Active Learners (WAL)
- Definition: Unique users who engage with learning content per week
- Target: 1,000 WAL by Q2 2026, 10,000 WAL by Q4 2026
- Measurement: Analytics events (page views, package expansions, tool usage)

**Secondary**: Learning Path Completion Rate
- Definition: % of users who complete at least one full package
- Target: 30% completion rate
- Measurement: Progress tracking (requires auth and backend)

### Engagement Metrics

**Content Consumption**:
- Packages viewed per session (target: 2+)
- Average session duration (target: 8+ minutes)
- Return visitor rate (target: 40%)
- Docs/templates downloaded (future)

**Feature Usage**:
- Command palette activation rate (target: 50% of sessions)
- Playground tool usage (target: 20% of sessions)
- Mobile vs desktop split (baseline to establish)

### Technical Metrics

**Performance**:
- Largest Contentful Paint < 2s (target: 95th percentile)
- Cumulative Layout Shift < 0.1 (target: 95th percentile)
- First Input Delay < 100ms (target: 95th percentile)
- Lighthouse Performance score 90+ (target: all pages)

**Reliability**:
- Uptime 99.9% (hosting SLA)
- Error rate < 0.1% (JavaScript errors, failed loads)
- Crash-free sessions > 99.9%

**Quality**:
- Accessibility score 90+ (Lighthouse)
- SEO score 90+ (Lighthouse, when implemented)
- Code coverage > 70% (future, when tests added)

### Business Metrics (Future)

**Growth**:
- User sign-ups per week
- Organic traffic growth MoM
- Referral traffic share

**Retention**:
- Day 1, Day 7, Day 30 retention rates
- Churn rate for returning users

**Monetization** (if applicable):
- Conversion to premium tier (if freemium model)
- Template/tool usage by paid users

## Risks & Mitigation

### Technical Risks

**Risk 1: Static Site Limitations**
- **Impact**: Cannot deliver personalization, progress tracking, user content
- **Probability**: Certain (already materialized)
- **Mitigation**: Plan backend migration, design data models now, use TanStack Query for easy transition

**Risk 2: Bundle Size Bloat**
- **Impact**: Slow initial load, poor mobile performance
- **Probability**: Medium (many dependencies)
- **Mitigation**: Regular bundle analysis, lazy loading, consider lighter alternatives (e.g., Preact)

**Risk 3: TypeScript Strictness Gaps**
- **Impact**: Runtime errors not caught at compile time
- **Probability**: Medium (relaxed config)
- **Mitigation**: Gradual strictness increase, add runtime validation with Zod

**Risk 4: Dependency Vulnerabilities**
- **Impact**: Security exploits, supply chain attacks
- **Probability**: Medium (25+ UI packages)
- **Mitigation**: Regular `npm audit`, Dependabot alerts, minimal dependency philosophy going forward

### Product Risks

**Risk 5: Content Becomes Stale**
- **Impact**: Users lose trust, platform seen as abandoned
- **Probability**: High (manual content updates)
- **Mitigation**: Regular content audit schedule, community contributions (future), changelog transparency

**Risk 6: Poor Content Fit**
- **Impact**: Users don't find value, high bounce rates
- **Probability**: Medium (unvalidated learning paths)
- **Mitigation**: User research, feedback loops, analytics on content engagement, A/B testing (future)

**Risk 7: Discoverability Issues**
- **Impact**: Users can't find relevant content, underutilize platform
- **Probability**: Medium (no search yet)
- **Mitigation**: Implement search, improve navigation, better content tagging, AI recommendations (future)

### Business Risks

**Risk 8: Unclear Monetization Path**
- **Impact**: Unsustainable project, no resources for growth
- **Probability**: High (no revenue model)
- **Mitigation**: Explore freemium model, corporate training licenses, sponsored content, grants

**Risk 9: Competitive Differentiation**
- **Impact**: Users choose alternatives (e.g., Reforge, Product School)
- **Probability**: Medium (crowded market)
- **Mitigation**: Focus on AI-first niche, free/accessible positioning, community-driven content, better UX

## Open Questions

### Product Questions

1. **Should we gate advanced content behind authentication?**
   - Pro: Enables personalization, progress tracking, email list growth
   - Con: Friction for first-time users, requires backend
   - Decision needed: Q1 2026

2. **What is the right content balance (theory vs practice)?**
   - Current: Heavy on articles/frameworks, light on interactive tools
   - User feedback: Needed to guide ratio
   - Decision needed: Post-user research

3. **Should we support user-generated content contributions?**
   - Pro: Scales content creation, builds community
   - Con: Moderation burden, quality control challenges
   - Decision needed: Q2 2026

4. **Is the mode selector (PM/AI/Snack) valuable or confusing?**
   - Current: Visual only, no filtering implemented
   - Validate: User testing, analytics
   - Decision needed: Q1 2026

### Technical Questions

5. **What backend architecture should we choose?**
   - Options: Supabase (fastest), Firebase (ecosystem), Custom API (flexibility)
   - Decision factors: Real-time needs, scale, team expertise
   - Decision needed: Before starting backend work (Q1 2026)

6. **Should we migrate to Next.js for SSR/SSG?**
   - Pro: Better SEO, faster initial loads, streaming SSR
   - Con: Migration effort, complexity increase, vendor lock-in
   - Decision needed: Q2 2026

7. **How do we handle offline support?**
   - Options: Service worker, local-first architecture, no offline
   - Decision factors: User needs, complexity, data sync challenges
   - Decision needed: Q3 2026

---

**Document Version**: 1.0
**Last Updated**: 2026-01-13
**Next Review**: Q1 2026
**Owner**: Product Team

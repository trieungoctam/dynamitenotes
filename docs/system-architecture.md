# System Architecture

This document describes the technical architecture of Dynamite Notes, including component hierarchies, data flow patterns, routing structure, and deployment architecture.

## Architecture Overview

Dynamite Notes is a **client-side single-page application (SPA)** built with React 18, TypeScript, and Vite. The application follows a component-based architecture with clear separation between presentation (UI), logic (hooks), and utilities (lib).

**Architecture Type**: Client-side rendered (CSR) SPA
**Build Tool**: Vite 5.4 with React SWC
**Deployment**: Static hosting (Vercel, Netlify, Cloudflare Pages)
**Backend**: None (future: API-driven architecture)

### High-Level Architecture Diagram

```mermaid
graph TB
    subgraph "Client Browser"
        A[index.html] --> B[main.tsx]
        B --> C[App.tsx]
        C --> D[Provider Stack]
        D --> E[BrowserRouter]
        E --> F[Routes]
        F --> G[Page Components]
        G --> H[Feature Components]
        H --> I[UI Components]
    end

    subgraph "Build Process"
        J[Source Code] --> K[Vite Build]
        K --> L[dist/ Bundle]
    end

    subgraph "Deployment"
        L --> M[Static Hosting]
        M --> N[CDN Distribution]
    end

    subgraph "Future Architecture"
        O[Backend API] -.-> G
        P[Database] -.-> O
        Q[Auth Service] -.-> D
    end

    style O stroke-dasharray: 5 5
    style P stroke-dasharray: 5 5
    style Q stroke-dasharray: 5 5
```

## Application Entry Flow

### Bootstrap Sequence

```mermaid
sequenceDiagram
    participant Browser
    participant HTML as index.html
    participant Main as main.tsx
    participant App as App.tsx
    participant Router as React Router
    participant Page as Page Component

    Browser->>HTML: Load page
    HTML->>Main: Load <script type="module" src="/src/main.tsx">
    Main->>Main: React.StrictMode wrapper
    Main->>App: Render <App />
    App->>App: Initialize providers
    App->>App: Set dark mode default
    App->>App: Setup Cmd+K listener
    App->>Router: Render <BrowserRouter>
    Router->>Router: Match current URL
    Router->>Page: Render matched page component
    Page->>Browser: Display UI
```

### Provider Hierarchy

```mermaid
graph TB
    A[React.StrictMode] --> B[QueryClientProvider]
    B --> C[TooltipProvider]
    C --> D[BrowserRouter]
    D --> E[App Layout]
    E --> F[TopNav]
    E --> G[CommandPalette]
    E --> H[Routes]
    H --> I[Page Components]

    style A fill:#e3f2fd
    style B fill:#fff3e0
    style C fill:#f3e5f5
    style D fill:#e8f5e9
```

**Provider Responsibilities**:

| Provider | Purpose | Source |
|----------|---------|--------|
| `React.StrictMode` | Development mode checks, warnings | React 18 |
| `QueryClientProvider` | TanStack Query state management (unused) | @tanstack/react-query |
| `TooltipProvider` | Radix tooltip context | @radix-ui/react-tooltip |
| `BrowserRouter` | Client-side routing | react-router-dom |

## Routing Architecture

### Route Structure

```mermaid
graph LR
    A[/] --> B[Index]
    C[/packages] --> D[Packages]
    E[/packages/:packageId] --> D
    F[/packages/:packageId/:itemId] --> D
    G[/docs] --> H[Docs]
    I[/docs/:docId] --> H
    J[/playground] --> K[Playground]
    L[/playground/:playgroundId] --> K
    M[/changelog] --> N[Changelog]
    O[/*] --> P[NotFound]

    style B fill:#c8e6c9
    style D fill:#fff9c4
    style H fill:#ffccbc
    style K fill:#b3e5fc
    style N fill:#f8bbd0
    style P fill:#ffcdd2
```

### Route Configuration

| Route | Component | Props from URL | Purpose |
|-------|-----------|----------------|---------|
| `/` | `Index` | - | Landing page with mode selector, packages, changelog |
| `/packages` | `Packages` | - | Package catalog with difficulty filter |
| `/packages/:packageId` | `Packages` | `packageId` | Specific package detail view |
| `/packages/:packageId/:itemId` | `Packages` | `packageId`, `itemId` | Individual package item |
| `/docs` | `Docs` | - | Document library listing |
| `/docs/:docId` | `Docs` | `docId` | Specific document view |
| `/playground` | `Playground` | - | Interactive tools listing |
| `/playground/:playgroundId` | `Playground` | `playgroundId` | Specific tool |
| `/changelog` | `Changelog` | - | Version history |
| `/*` | `NotFound` | - | 404 page |

**URL State Management**:
- `useSearchParams()` for query strings (e.g., `?mode=ai`, `?difficulty=advanced`)
- `useParams()` for route parameters (e.g., `/packages/:packageId`)
- `useNavigate()` for programmatic navigation

## Component Architecture

### Component Hierarchy

```mermaid
graph TB
    A[App.tsx] --> B[TopNav]
    A --> C[CommandPalette]
    A --> D[Routes]

    D --> E[Index Page]
    D --> F[Packages Page]
    D --> G[Docs Page]
    D --> H[Playground Page]
    D --> I[Changelog Page]
    D --> J[NotFound Page]

    E --> K[ReadmeHeader]
    E --> L[ModeSelector]
    E --> M[PopularPackages]
    E --> N[RecentChangelog]

    F --> O[Package Filtering]
    F --> P[Package Tree]
    F --> Q[Package Details]

    B --> R[NavLinks]
    B --> S[ThemeToggle]

    C --> T[Command Items]

    K --> U[UI Components]
    L --> U
    M --> U
    N --> U
    O --> U
    P --> U
    Q --> U
    R --> U
    S --> U
    T --> U

    style A fill:#1976d2,color:#fff
    style E fill:#66bb6a
    style F fill:#ffa726
    style G fill:#ef5350
    style H fill:#42a5f5
    style I fill:#ec407a
    style J fill:#ab47bc
    style U fill:#bdbdbd
```

### Component Categories

**1. Layout Components** (`src/components/layout/`):
- `TopNav.tsx` - Global navigation bar
- `CommandPalette.tsx` - Cmd+K search interface
- `ThemeToggle.tsx` - Dark/light mode switcher

**2. Home Components** (`src/components/home/`):
- `ReadmeHeader.tsx` - Project intro section
- `ModeSelector.tsx` - PM/AI/Snack mode filter
- `PopularPackages.tsx` - Featured package cards
- `RecentChangelog.tsx` - Latest updates preview

**3. UI Components** (`src/components/ui/`):
- 48 shadcn-ui primitives (buttons, dialogs, forms, etc.)
- Never modify directly (regenerate via `npx shadcn-ui add`)

**4. Page Components** (`src/pages/`):
- 6 route-level components (Index, Packages, Docs, Playground, Changelog, NotFound)

**5. Utility Components**:
- `NavLink.tsx` - Router-aware navigation link

### Component Communication Patterns

```mermaid
sequenceDiagram
    participant User
    participant TopNav
    participant App
    participant CommandPalette
    participant Router
    participant Page

    User->>TopNav: Click "Cmd+K" button
    TopNav->>App: Call onOpenCommand()
    App->>App: setCommandOpen(true)
    App->>CommandPalette: Pass isOpen={true}
    CommandPalette->>User: Display palette

    User->>CommandPalette: Select "Packages"
    CommandPalette->>Router: Navigate to /packages
    Router->>Page: Render <Packages />
    CommandPalette->>App: Call onClose()
    App->>App: setCommandOpen(false)
```

**Patterns Used**:
- **Props Drilling**: Parent passes callbacks to children (1-2 levels max)
- **URL State**: Components read/write search params for shareable state
- **Local State**: Each component manages its own UI state
- **No Global State**: No Redux, Zustand, or Context for state (yet)

## Data Flow Architecture

### Current: Static Data Flow

```mermaid
graph LR
    A[Component File] --> B[Static Data Array]
    B --> C[Component State]
    C --> D[Render]
    D --> E[UI]

    F[User Interaction] --> G[Local State Update]
    G --> C

    H[URL Params] --> C
    C --> I[setSearchParams]
    I --> H

    style B fill:#ffd54f
    style C fill:#4fc3f7
    style E fill:#81c784
```

**Example** (Packages Page):
1. `packagesData` array defined in component file
2. Component reads `difficulty` from URL search params
3. Component filters `packagesData` by difficulty
4. Filtered data renders as package cards
5. User clicks difficulty filter → updates URL → re-filters data

### Future: API-Driven Data Flow

```mermaid
graph LR
    A[Component] --> B[useQuery Hook]
    B --> C[TanStack Query]
    C --> D{Cache Hit?}

    D -->|Yes| E[Return Cached Data]
    D -->|No| F[API Request]

    F --> G[Backend API]
    G --> H[Database]
    H --> G
    G --> F
    F --> C
    C --> I[Update Cache]
    I --> E

    E --> J[Component State]
    J --> K[Render UI]

    style A fill:#64b5f6
    style C fill:#ffd54f
    style G fill:#81c784
    style H fill:#e57373
```

**Planned Pattern**:
```typescript
// Future API integration
const { data: packages, isLoading } = useQuery({
  queryKey: ["packages"],
  queryFn: () => api.get("/packages"),
  staleTime: 5 * 60 * 1000, // 5 minutes
});
```

## State Management

### State Types & Locations

| State Type | Storage | Persistence | Example |
|------------|---------|-------------|---------|
| **UI State** | `useState` | Session (lost on refresh) | `isOpen`, `selectedTab` |
| **URL State** | `useSearchParams` | Persistent (in URL) | `?mode=ai`, `?difficulty=advanced` |
| **Route Params** | `useParams` | Persistent (in URL) | `/packages/:packageId` |
| **Form State** | `react-hook-form` | Session | Form inputs |
| **Server State** (future) | TanStack Query | Cache (configurable) | API responses |
| **Global State** (future) | Context API / Zustand | Session | User profile, auth |

### State Flow Diagram

```mermaid
graph TB
    A[User Interaction] --> B{State Type?}

    B -->|UI State| C[useState]
    B -->|Filter/Mode| D[URL Search Params]
    B -->|Navigation| E[Route Params]
    B -->|Form Input| F[React Hook Form]

    C --> G[Component Re-render]
    D --> H[URL Update]
    E --> I[Route Change]
    F --> J[Form Validation]

    H --> G
    I --> K[New Page Component]
    J --> L{Valid?}

    L -->|Yes| M[Submit Action]
    L -->|No| N[Show Errors]

    style C fill:#ffcc80
    style D fill:#80deea
    style E fill:#ce93d8
    style F fill:#a5d6a7
```

## Build & Deployment Architecture

### Build Process

```mermaid
graph LR
    A[Source Code] --> B[TypeScript Compiler]
    A --> C[Tailwind CSS Processor]
    A --> D[Vite Bundler]

    B --> E[JavaScript Output]
    C --> F[CSS Output]
    D --> G[Bundle Optimization]

    E --> G
    F --> G

    G --> H[Code Splitting]
    G --> I[Tree Shaking]
    G --> J[Minification]

    H --> K[dist/]
    I --> K
    J --> K

    K --> L[Static Assets]
    K --> M[index.html]
    K --> N[JS Chunks]
    K --> O[CSS Files]

    style K fill:#66bb6a
```

**Build Outputs**:
- `dist/index.html` - Entry HTML file
- `dist/assets/*.js` - JavaScript chunks (code-split by route)
- `dist/assets/*.css` - Compiled and purged Tailwind CSS
- `dist/assets/*.svg`, `*.png` - Static assets

**Optimization Techniques**:
- **Code Splitting**: Automatic by route (React Router + Vite)
- **Tree Shaking**: Remove unused library code
- **Minification**: JavaScript and CSS compression
- **CSS Purging**: Remove unused Tailwind classes (reduces CSS by ~95%)

### Deployment Architecture

```mermaid
graph TB
    A[Git Push] --> B[CI/CD Pipeline]
    B --> C[Vite Build]
    C --> D[dist/ Artifact]

    D --> E[Static Hosting]
    E --> F[CDN Edge Servers]

    F --> G[User Request]
    G --> H{Cached?}

    H -->|Yes| I[Serve from Edge]
    H -->|No| J[Fetch from Origin]
    J --> K[Cache at Edge]
    K --> I

    I --> L[User Browser]

    M[Custom Domain] --> N[DNS]
    N --> F

    style E fill:#4caf50
    style F fill:#03a9f4
    style L fill:#ff9800
```

**Deployment Platforms** (Static Hosting):
- **Vercel** (recommended): Zero-config, automatic deployments, edge network
- **Netlify**: Similar features, good CDN, custom headers support
- **Cloudflare Pages**: Fast global CDN, DDoS protection
- **GitHub Pages**: Free, simple, good for open-source projects

**Deployment Steps**:
1. Push code to Git repository (GitHub, GitLab, Bitbucket)
2. Hosting platform detects push via webhook
3. Platform runs `bun build` (or `npm run build`)
4. Platform deploys `dist/` folder to CDN
5. Platform assigns URL (e.g., `https://project.vercel.app`)
6. Platform distributes assets to edge servers globally

### Environment Configuration

```mermaid
graph LR
    A[Local .env] --> B[Development Build]
    C[Platform Env Vars] --> D[Production Build]

    B --> E[import.meta.env.VITE_*]
    D --> E

    E --> F[Application Runtime]

    style A fill:#fff3e0
    style C fill:#c8e6c9
```

**Environment Variable Naming**:
- Prefix with `VITE_` for client-side access
- Example: `VITE_API_URL`, `VITE_ANALYTICS_ID`

**Usage**:
```typescript
const apiUrl = import.meta.env.VITE_API_URL || "https://api.default.com";
```

## Security Architecture

### Current Security Posture

**Threat Model**:
- **No backend** → No API vulnerabilities (yet)
- **No auth** → No credential theft risk (yet)
- **Client-side only** → Limited attack surface

**Security Measures**:
- HTTPS enforced (via hosting platform)
- Content Security Policy (CSP) headers (configured at hosting level)
- Dependency vulnerability scanning (npm audit, Dependabot)
- No sensitive data in client-side code

### Future Security Architecture

```mermaid
graph TB
    A[User Browser] --> B[HTTPS Connection]
    B --> C[CDN / WAF]
    C --> D[Static Assets]

    A --> E[API Gateway]
    E --> F[Authentication Service]
    F --> G{Valid Token?}

    G -->|Yes| H[Backend API]
    G -->|No| I[401 Unauthorized]

    H --> J[Rate Limiting]
    J --> K[Business Logic]
    K --> L[Database]

    style C fill:#4caf50
    style F fill:#ff9800
    style J fill:#f44336
```

**Planned Security Features**:
- **Authentication**: JWT tokens, secure cookie storage
- **Authorization**: Role-based access control (RBAC)
- **Rate Limiting**: Prevent abuse of API endpoints
- **Input Validation**: Zod schemas for all user inputs
- **CSRF Protection**: Anti-CSRF tokens for state-changing operations
- **XSS Prevention**: React's automatic escaping + CSP headers

## Performance Architecture

### Performance Budget

| Metric | Target | Current |
|--------|--------|---------|
| Largest Contentful Paint (LCP) | < 2.0s | ~1.5s (static) |
| First Input Delay (FID) | < 100ms | < 50ms |
| Cumulative Layout Shift (CLS) | < 0.1 | < 0.05 |
| Time to Interactive (TTI) | < 3.0s | ~2.0s |
| Total Bundle Size (gzip) | < 200KB | ~150KB (JS) |

### Performance Optimization Strategies

```mermaid
graph TB
    A[Performance Goals] --> B[Code Splitting]
    A --> C[Lazy Loading]
    A --> D[Caching]
    A --> E[CDN Distribution]
    A --> F[Asset Optimization]

    B --> G[Route-level Chunks]
    C --> H[Component-level Lazy]
    D --> I[TanStack Query Cache]
    D --> J[Browser Cache]
    E --> K[Edge Caching]
    F --> L[Image Compression]
    F --> M[CSS Purging]

    style A fill:#4caf50
    style B fill:#ff9800
    style C fill:#03a9f4
    style D fill:#9c27b0
    style E fill:#e91e63
    style F fill:#00bcd4
```

**Implemented Optimizations**:
1. **Route-based code splitting** (automatic with Vite + React Router)
2. **Tailwind CSS purging** (removes unused classes in production)
3. **Tree shaking** (removes unused library code)
4. **SWC compilation** (faster than Babel, smaller output)
5. **CDN delivery** (edge caching, global distribution)

**Future Optimizations**:
- Lazy load heavy components (charts, editors)
- Image optimization (WebP format, lazy loading)
- Service worker for offline caching
- Preload critical resources

## Monitoring & Observability (Future)

### Planned Monitoring Architecture

```mermaid
graph LR
    A[User Browser] --> B[Application Code]
    B --> C[Error Tracking]
    B --> D[Performance Monitoring]
    B --> E[Analytics Events]

    C --> F[Sentry / LogRocket]
    D --> G[Web Vitals / Vercel Analytics]
    E --> H[PostHog / Mixpanel]

    F --> I[Alerts]
    G --> J[Dashboards]
    H --> K[Funnels]

    style F fill:#e57373
    style G fill:#64b5f6
    style H fill:#81c784
```

**Metrics to Track**:
- **Errors**: JavaScript exceptions, failed API calls, unhandled promises
- **Performance**: Core Web Vitals, route transition times, API latency
- **User Behavior**: Page views, button clicks, feature usage, conversion funnels
- **Business Metrics**: User sign-ups, content completions, retention rates

## Technology Stack Summary

### Frontend Stack

```mermaid
graph TB
    A[React 18.3.1] --> B[TypeScript 5.8.3]
    B --> C[Vite 5.4.19]
    C --> D[Production Bundle]

    E[React Router 6.30.1] --> A
    F[Tailwind CSS 3.4.17] --> C
    G[shadcn-ui] --> A
    H[Radix UI] --> G

    I[TanStack Query 5.83.0] --> A
    J[React Hook Form 7.61.1] --> A
    K[Zod 3.25.76] --> J

    style A fill:#61dafb
    style B fill:#3178c6
    style C fill:#646cff
```

### Build & Tooling Stack

```mermaid
graph LR
    A[Vite] --> B[React SWC]
    A --> C[Tailwind CSS]
    A --> D[TypeScript]

    E[ESLint] --> F[Code Quality]
    G[PostCSS] --> C
    H[Autoprefixer] --> G

    style A fill:#646cff
    style E fill:#4b32c3
    style C fill:#06b6d4
```

**Key Technologies**:
- **Framework**: React 18.3.1
- **Language**: TypeScript 5.8.3
- **Build Tool**: Vite 5.4.19 with @vitejs/plugin-react-swc
- **Routing**: React Router DOM 6.30.1
- **Styling**: Tailwind CSS 3.4.17, @tailwindcss/typography
- **UI Components**: shadcn-ui (48 components) built on Radix UI
- **State Management**: TanStack Query 5.83.0 (configured, unused)
- **Forms**: React Hook Form 7.61.1, Zod 3.25.76
- **Icons**: Lucide React 0.462.0
- **Utilities**: class-variance-authority, clsx, tailwind-merge
- **Notifications**: Sonner 1.7.4
- **Theme**: next-themes 0.3.0
- **Charts**: Recharts 2.15.4
- **Date Handling**: date-fns 3.6.0

## Architecture Evolution

### Current Architecture (v2.4.0)

**Characteristics**:
- Client-side rendering only
- Static data in component files
- No backend or database
- No authentication
- Limited interactivity

**Strengths**:
- Fast development iteration
- Simple deployment (static hosting)
- No infrastructure management
- Low cost (hosting is free/cheap)

**Limitations**:
- No personalization
- No user-generated content
- No progress tracking
- SEO challenges (CSR only)
- No real-time features

### Future Architecture (v3.x+)

```mermaid
graph TB
    subgraph "Frontend"
        A[Next.js App Router] --> B[React Server Components]
        B --> C[Client Components]
    end

    subgraph "Backend"
        D[API Gateway] --> E[Auth Service]
        D --> F[Content API]
        D --> G[Analytics API]
    end

    subgraph "Data Layer"
        H[(PostgreSQL)] --> F
        I[(Redis Cache)] --> F
        J[Object Storage] --> F
    end

    C -.->|API Calls| D
    E -.->|JWT| C

    style A fill:#61dafb
    style D fill:#4caf50
    style H fill:#336791
```

**Planned Enhancements**:
- **Backend API**: RESTful or GraphQL API for dynamic content
- **Database**: PostgreSQL for relational data, Redis for caching
- **Authentication**: JWT-based auth with social login
- **Server-Side Rendering**: Next.js for improved SEO and performance
- **Real-time Features**: WebSockets for live collaboration (future)
- **Content Management**: Headless CMS for non-technical content updates

---

**Document Version**: 1.0
**Last Updated**: 2026-01-13
**Next Review**: Q2 2026
**Architecture Owner**: Engineering Team

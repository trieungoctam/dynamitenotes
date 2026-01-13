# Research Report: Modern Blog/Portfolio Best Practices 2026

**Research Date:** 2026-01-13
**Stack Focus:** React + TypeScript + Vite + Supabase
**Target:** Blog/Portfolio Web Applications

---

## Executive Summary

Modern blog/portfolio applications require holistic approach balancing performance, SEO, accessibility, security, and developer experience. React + Vite + Supabase stack provides solid foundation but needs deliberate optimization across 6 key areas: Core Web Vitals performance, SEO metadata and structured data, WCAG 2.2 accessibility, OWASP security practices, strict TypeScript patterns, and comprehensive testing strategy.

**Key Findings:**
- Performance: LCP < 2.5s, INP < 200ms, CLS < 0.1 required for "Good" CWV scores
- SEO: SSR/SSG critical for blogs; JSON-LD structured data essential for rich snippets
- Accessibility: WCAG 2.2 Level AA compliance achievable with Radix UI + ARIA patterns
- Security: Content Security Policy + Supabase RLS provides defense-in-depth
- TypeScript: Strict mode required; avoid `any`, leverage utility types
- Testing: Vitest + React Testing Library + Playwright covers all testing layers

**Critical Gaps in Current Stack:**
- No SSR/SSG capability (Vite SPA mode)
- Relaxed TypeScript config (`noImplicitAny: false`)
- No automated testing setup
- Missing SEO meta tags and structured data
- No Content Security Policy headers

---

## Research Methodology

- **Sources:** 6 comprehensive research queries via Gemini 2.5 Flash
- **Date Range:** 2024-2025 best practices
- **Search Terms:** Core Web Vitals, SEO React, WCAG 2.2, OWASP React, TypeScript strict, Vitest Playwright
- **Evaluation Criteria:** Official docs (Google, WCAG, OWASP), 2024+ community practices, React ecosystem maturity

---

## Key Findings

### 1. Performance Optimization

#### Core Web Vitals Targets (2024-2025 Standards)

| Metric | Good | Needs Improvement | Poor |
|--------|------|-------------------|------|
| **LCP** (Largest Contentful Paint) | < 2.5s | 2.5s - 4.0s | > 4.0s |
| **INP** (Interaction to Next Paint) | < 200ms | 200ms - 500ms | > 500ms |
| **CLS** (Cumulative Layout Shift) | < 0.1 | 0.1 - 0.25 | > 0.25 |

*Source: web.dev/vitals/*

#### LCP Optimization Strategies

1. **Preload Critical Resources**
```html
<!-- Preload LCP image -->
<link rel="preload" as="image" href="/hero-image.webp" fetchpriority="high">
```

2. **Optimize React Rendering**
- Use `React.lazy()` for route-based code splitting
- Implement `Suspense` boundaries with fallbacks
- Avoid large component trees blocking initial render

```typescript
// Route-based code splitting
const BlogPost = lazy(() => import('./pages/BlogPost'));

function App() {
  return (
    <Suspense fallback={<Skeleton />}>
      <BlogPost />
    </Suspense>
  );
}
```

3. **Image Optimization**
- Use WebP format with JPEG fallback
- Implement responsive images with `srcset`
- Add `loading="lazy"` to below-fold images
- Use `fetchpriority="high"` for LCP image

#### INP Optimization (Replaced FID in 2024)

1. **Reduce JavaScript Execution**
- Minimize main thread work
- Use `React.startTransition()` for non-urgent updates
- Debounce input handlers (100-300ms)

```typescript
import { startTransition } from 'react';

function handleSearch(query: string) {
  startTransition(() => {
    setSearchQuery(query); // Non-urgent update
  });
}
```

2. **Event Handler Optimization**
- Avoid heavy computation in event handlers
- Use `useDeferredValue` for expensive renders

#### CLS Prevention

1. **Reserve Space for Dynamic Content**
```css
/* Reserve space for images */
.image-container {
  min-height: 400px;
  aspect-ratio: 16 / 9;
}
```

2. **Font Loading Strategies**
```css
/* Prevent layout shift from fonts */
@font-face {
  font-family: 'Geist Mono';
  font-display: swap; /* or 'optional' for critical fonts */
  src: url('/geist-mono.woff2') format('woff2');
}
```

#### Code Splitting with Vite

Vite automatically code-splits by route. Additional strategies:

```typescript
// Manual code splitting for heavy components
const AdminDashboard = lazy(() => import('./components/AdminDashboard'));
const ChartVisualization = lazy(() => import('./components/ChartVisualization'));

// Dynamic imports for user interactions
const loadEditor = async () => {
  const { Editor } = await import('./components/Editor');
  return <Editor />;
};
```

#### Bundle Size Reduction

1. **Analyze Bundle**
```bash
# Vite bundle analysis
bun add -D rollup-plugin-visualizer
# Update vite.config.ts with plugin
bun build --mode analyze
```

2. **Tree Shaking**
- Use ES modules (`import`/`export`)
- Avoid barrel files (`index.ts` re-exports)
- Use `import { X }` vs `import * as X`

3. **Dependencies**
- Replace `lodash` with native methods
- Use `date-fns` over `moment.js`
- Audit bundle size: `npx vite-bundle-visualizer`

#### Font Optimization

```typescript
// vite.config.ts
export default {
  build: {
    rollupOptions: {
      output: {
        // Manual chunks for fonts
        manualChunks: {
          'fonts': ['./src/fonts/geist-mono.woff2']
        }
      }
    }
  }
}
```

```css
/* Preload critical fonts */
<style>
@font-face {
  font-family: 'Geist Mono';
  src: url('/fonts/geist-mono.woff2') format('woff2');
  font-weight: 400;
  font-display: swap;
  unicode-range: U+0020-007E; /* ASCII subset */
}
</style>
```

**Citations:**
- web.dev - "Optimize Core Web Vitals" (2024)
- Google Developers - "Render-blocking Resources" (2024)
- Vite Documentation - "Build Optimization" (2024)

---

### 2. SEO Best Practices

#### Rendering Strategy Analysis

**Current Stack (Vite SPA):** Client-Side Rendering (CSR)
- **Pros:** Fast development, simple deployment
- **Cons:** Poor SEO, slow initial content, crawler dependencies

**Recommended for Blog:** Static Site Generation (SSG)
- **Tools:** Vite Plugin SSR (`vite-plugin-ssr`), Astro (Vite-based)
- **Benefits:** Pre-rendered HTML, fast LCP, excellent crawlability

**Tradeoffs:**

| Strategy | SEO | Performance | Complexity | Best For |
|----------|-----|-------------|------------|----------|
| **CSR** | Poor | Slow initial | Low | Dashboards, auth-required apps |
| **SSR** | Excellent | Fast TTFB | High | E-commerce, news, dynamic content |
| **SSG** | Excellent | Fastest (CDN) | Medium | Blogs, docs, portfolios |
| **ISR** | Excellent | Fast (cache) | Medium | Blogs with frequent updates |

**Recommendation:** Migrate to SSG using `vite-plugin-ssr` or Astro for blog content. Keep CSR for admin dashboard.

#### Meta Tag Optimization

**Implementation:**
```typescript
// components/SEOHead.tsx
import { Helmet } from 'react-helmet-async';

interface SEOHeadProps {
  title: string;
  description: string;
  ogImage?: string;
  ogUrl: string;
  article?: boolean;
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
}

export function SEOHead({
  title,
  description,
  ogImage = '/og-default.jpg',
  ogUrl,
  article = false,
  publishedTime,
  modifiedTime,
  author
}: SEOHeadProps) {
  return (
    <Helmet>
      {/* Basic */}
      <title>{title} | Dynamite Notes</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={ogUrl} />

      {/* Open Graph */}
      <meta property="og:type" content={article ? 'article' : 'website'} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:url" content={ogUrl} />
      {article && publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}
      {article && modifiedTime && (
        <meta property="article:modified_time" content={modifiedTime} />
      )}
      {author && (
        <meta property="article:author" content={author} />
      )}

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
    </Helmet>
  );
}
```

**Usage:**
```typescript
// pages/BlogPost.tsx
import { SEOHead } from '../components/SEOHead';

function BlogPost({ post }) {
  return (
    <>
      <SEOHead
        title={post.title}
        description={post.excerpt}
        ogImage={post.coverImage}
        ogUrl={`https://dynamitenotes.com/blog/${post.slug}`}
        article={true}
        publishedTime={post.publishedAt}
        modifiedTime={post.updatedAt}
        author={post.author.name}
      />
      <article>{/* Post content */}</article>
    </>
  );
}
```

#### Dynamic Sitemap Generation

**Vite Plugin Approach:**
```typescript
// vite-plugin-sitemap.ts
import { defineConfig } from 'vite';
import { SitemapStream } from 'sitemap';

export function sitemapPlugin() {
  return {
    name: 'sitemap',
    apply: 'build',
    closeBundle: async () => {
      // Fetch all posts from Supabase
      const { data: posts } = await supabase
        .from('posts')
        .select('slug, updated_at');

      const urls = [
        { url: '/', changefreq: 'daily', priority: 1.0 },
        { url: '/about', changefreq: 'monthly', priority: 0.8 },
        { url: '/blog', changefreq: 'daily', priority: 0.9 },
        ...posts.map(post => ({
          url: `/blog/${post.slug}`,
          changefreq: 'weekly',
          priority: 0.7,
          lastmod: post.updated_at
        }))
      ];

      // Generate sitemap.xml
      const smStream = new SitemapStream({ hostname: 'https://dynamitenotes.com' });
      const writeStream = fs.createWriteStream('./dist/sitemap.xml');
      smStream.pipe(writeStream);

      urls.forEach(url => smStream.write(url));
      smStream.end();
    }
  };
}
```

**Alternative:** Build-time generation with Node script
```bash
# scripts/generate-sitemap.js
bun run scripts/generate-sitemap.js
```

#### JSON-LD Structured Data

**Article Schema:**
```typescript
// components/ArticleSchema.tsx
import { Helmet } from 'react-helmet-async';

interface ArticleSchemaProps {
  title: string;
  description: string;
  imageUrl: string;
  publishedAt: string;
  updatedAt: string;
  author: string;
  url: string;
}

export function ArticleSchema({
  title,
  description,
  imageUrl,
  publishedAt,
  updatedAt,
  author,
  url
}: ArticleSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": title,
    "image": [imageUrl],
    "datePublished": publishedAt,
    "dateModified": updatedAt,
    "author": {
      "@type": "Person",
      "name": author
    },
    "publisher": {
      "@type": "Organization",
      "name": "Dynamite Notes",
      "logo": {
        "@type": "ImageObject",
        "url": "https://dynamitenotes.com/logo.png"
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": url
    },
    "description": description
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
    </Helmet>
  );
}
```

**Blog Schema (AggregateRating):**
```typescript
// For blog listing pages
const blogSchema = {
  "@context": "https://schema.org",
  "@type": "Blog",
  "name": "Dynamite Notes Blog",
  "description": "PM knowledge base and learning platform",
  "url": "https://dynamitenotes.com/blog",
  "author": {
    "@type": "Organization",
    "name": "Dynamite Team"
  }
};
```

**Validation:**
- Google Rich Results Test: [search.google.com/test/rich-results](https://search.google.com/test/rich-results)
- Schema Markup Validator: [validator.schema.org](https://validator.schema.org)

#### robots.txt Configuration

```txt
# public/robots.txt
User-agent: *
Allow: /

# Disallow admin routes
Disallow: /admin/
Disallow: /api/

# Sitemap location
Sitemap: https://dynamitenotes.com/sitemap.xml
```

#### Supabase SEO Considerations

1. **Database Structure**
```sql
-- posts table with SEO fields
CREATE TABLE posts (
  id UUID PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  excerpt TEXT,
  content TEXT,
  cover_image_url TEXT,
  meta_description TEXT,
  meta_keywords TEXT[],
  published_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  author_id UUID REFERENCES users(id)
);

-- Index for fast queries
CREATE INDEX idx_posts_published ON posts(published_at DESC);
CREATE INDEX idx_posts_slug ON posts(slug);
```

2. **Query Optimization**
```typescript
// Fetch post with SEO metadata
const { data: post } = await supabase
  .from('posts')
  .select('slug, title, excerpt, content, cover_image_url, meta_description, published_at, updated_at, author:author_id(name)')
  .eq('slug', slug)
  .single();
```

3. **CDN Caching**
- Cache Supabase responses with CDN
- Use Supabase Edge Functions for sitemap/rss generation
- Implement stale-while-revalidate strategy

**Citations:**
- Google Search Central - "SEO Starter Guide" (2024)
- Next.js Documentation - "Metadata" (2024)
- Schema.org - "Article" type
- react-helmet-async Documentation (2024)

---

### 3. Accessibility (WCAG 2.2 Compliance)

#### WCAG 2.2 Requirements (Level AA)

**Focus Areas for 2024-2025:**

1. **Focus Appearance (2.4.7)** - Enhanced in WCAG 2.2
   - Focus indicator must have contrast ratio ≥ 3:1 against background
   - Focus area must be at least 2px thick

2. **Dragging Movements (2.5.7)** - New in WCAG 2.2
   - Provide alternatives to drag-and-drop
   - Support single-pointer actions

3. **Target Size (Minimum) (2.5.5)** - New in WCAG 2.2
   - Touch targets must be at least 24×24 CSS pixels
   - Spacing between targets required

#### Semantic HTML in React

**Do:**
```typescript
// Use semantic elements
function BlogPost() {
  return (
    <article>
      <header>
        <h1>Article Title</h1>
        <time dateTime="2024-01-13">January 13, 2024</time>
      </header>
      <section aria-labelledby="content">
        <h2 id="content">Content</h2>
        <p>Article content...</p>
      </section>
      <footer>
        <address>
          By <a rel="author" href="/authors/john">John Doe</a>
        </address>
      </footer>
    </article>
  );
}
```

**Don't:**
```typescript
// Avoid div soup
function BlogPost() {
  return (
    <div className="article">
      <div className="header">
        <div className="title">Title</div>
      </div>
      <div className="content">...</div>
    </div>
  );
}
```

#### Keyboard Navigation Patterns

**1. Skip Links**
```typescript
// components/SkipLink.tsx
export function SkipLink() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-white focus:text-black focus:rounded"
    >
      Skip to main content
    </a>
  );
}

// App.tsx
function App() {
  return (
    <>
      <SkipLink />
      <Navigation />
      <main id="main-content" tabIndex={-1}>
        {/* Content */}
      </main>
    </>
  );
}
```

**2. Focus Management**
```typescript
// components/Modal.tsx
import { useEffect, useRef } from 'react';

export function Modal({ isOpen, onClose, children }) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && modalRef.current) {
      // Trap focus within modal
      modalRef.current.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      ref={modalRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      className="fixed inset-0 z-50"
      onKeyDown={(e) => {
        if (e.key === 'Escape') onClose();
      }}
    >
      <h2 id="modal-title" className="sr-only">Modal</h2>
      {children}
    </div>
  );
}
```

**3. Custom Component Keyboard Support**
```typescript
// components/ComboBox.tsx
export function ComboBox({ options, onSelect }) {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(0);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex((i) => Math.min(i + 1, options.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex((i) => Math.max(i - 1, 0));
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        onSelect(options[focusedIndex]);
        setIsOpen(false);
        break;
      case 'Escape':
        setIsOpen(false);
        break;
    }
  };

  return (
    <div
      role="combobox"
      aria-expanded={isOpen}
      aria-haspopup="listbox"
      onKeyDown={handleKeyDown}
    >
      {/* Combobox UI */}
    </div>
  );
}
```

#### ARIA Best Practices

**First Rule of ARIA:**
> If you can use a native HTML element or attribute with the semantics and behavior you require already built in, instead of re-purposing an element and adding an ARIA role, state or property to make it accessible, then do so.

**When to Use ARIA:**
```typescript
// Icon button without text
<button aria-label="Close dialog" onClick={onClose}>
  <XIcon />
</button>

// Live region for dynamic updates
<div aria-live="polite" aria-atomic="true">
  {errorMessage}
</div>

// Expanded state for dropdown
<button
  aria-expanded={isOpen}
  aria-controls="dropdown-menu"
  aria-haspopup="true"
>
  Options
</button>
<ul id="dropdown-menu" role="menu">
  {options.map(option => (
    <li role="menuitem" key={option.id}>
      {option.label}
    </li>
  ))}
</ul>
```

**Avoid ARIA Anti-patterns:**
```typescript
// Don't: role="button" on <button>
<button role="button">Click</button> // ❌ Redundant

// Don't: aria-disabled on <button>
<button aria-disabled={true}>Click</button> // ❌ Use disabled attribute
<button disabled={true}>Click</button> // ✅

// Don't: ARIA on interactive elements
<a href="/" role="link">Home</a> // ❌ Redundant
```

#### Color Contrast Requirements

**WCAG 2.1 Level AA:**
- Normal text (< 18pt): 4.5:1 contrast ratio
- Large text (≥ 18pt or bold ≥ 14pt): 3:1 contrast ratio
- UI components/icons: 3:1 contrast ratio against adjacent colors

**Tailwind Configuration:**
```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        // Ensure contrast ratios
        'text-primary': '#1a1a1a', // Against white: 16:1 ✅
        'text-secondary': '#666666', // Against white: 5.74:1 ✅
        'text-disabled': '#999999', // Against white: 2.85:1 ❌ Use for decoration only
        'bg-primary': '#2563eb', // Against white: 4.54:1 ✅
        'bg-hover': '#1d4ed8', // Against white: 5.12:1 ✅
      }
    }
  }
}
```

**Testing:**
```bash
# Automated contrast checking
bun add -D @adobe/leonardo-contrast-colors
npx leonardo-cwvt

# Browser extension
# - Chrome: Colour Contrast Analyser
# - Firefox: WCAG Contrast Checker
```

#### Accessible Forms

```typescript
// components/ContactForm.tsx
import { useForm } from 'react-hook-form';

export function ContactForm() {
  const { register, formState: { errors } } = useForm();

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* Label + Input association */}
      <div>
        <label htmlFor="email">
          Email <span aria-label="required">*</span>
        </label>
        <input
          id="email"
          type="email"
          {...register('email', {
            required: 'Email is required',
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: 'Invalid email address'
            }
          })}
          aria-invalid={errors.email ? 'true' : 'false'}
          aria-describedby={errors.email ? 'email-error' : undefined}
        />
        {/* Error announcement */}
        {errors.email && (
          <span id="email-error" role="alert" aria-live="assertive">
            {errors.email.message}
          </span>
        )}
      </div>
    </form>
  );
}
```

#### Testing with axe-core

**Integration:**
```typescript
// main.tsx
if (import.meta.env.DEV) {
  import('@axe-core/react').then((axe) => {
    axe.default(React, ReactDOM, 1000);
  });
}
```

**Automated Tests:**
```typescript
// tests/accessibility.test.tsx
import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

describe('BlogPost accessibility', () => {
  it('should not have accessibility violations', async () => {
    const { container } = render(<BlogPost {...props} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
```

**Manual Testing Checklist:**
- [ ] Keyboard navigation (Tab, Shift+Tab, Enter, Escape, Arrow keys)
- [ ] Screen reader testing (NVDA, JAWS, VoiceOver)
- [ ] Color contrast verification
- [ ] Focus indicators visible
- [ ] Skip links functional
- [ ] Form error announcements
- [ ] ARIA attributes accurate

**Citations:**
- WCAG 2.2 Guidelines (2023)
- WAI-ARIA Authoring Practices Guide (2024)
- React Accessibility Documentation (2024)
- Radix UI Accessibility Documentation (2024)

---

### 4. Security Best Practices

#### OWASP Top 10 for React Apps

**1. Injection Prevention (A01:2021)**

SQL Injection with Supabase:
```typescript
// ✅ Safe: Parameterized queries
const { data } = await supabase
  .from('posts')
  .select('*')
  .eq('slug', slug); // Automatically parameterized

// ❌ Unsafe: Raw SQL with concatenation
const query = `SELECT * FROM posts WHERE slug = '${slug}'`; // DON'T DO THIS
```

**2. XSS Prevention (A03:2021)**

React's built-in protection:
```typescript
// ✅ Safe: React escapes by default
<div>{userInput}</div>

// ❌ Dangerous: dangerouslySetInnerHTML
<div dangerouslySetInnerHTML={{ __html: userInput }} /> // XSS risk

// ✅ Alternative with sanitization
import DOMPurify from 'dompurify';
<div dangerouslySetInnerHTML={{
  __html: DOMPurify.sanitize(userInput)
}} />
```

**3. CSRF Protection (A01:2021)**

Supabase Auth + CSRF:
```typescript
// Supabase automatically handles CSRF tokens
// Just ensure proper configuration:

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
  {
    auth: {
      storage: window.localStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  }
);
```

**4. Security Headers (A05:2021)**

Vite server configuration:
```typescript
// vite.config.ts
export default defineConfig({
  server: {
    headers: {
      'Content-Security-Policy': [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.supabase.com",
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data: https: blob:",
        "font-src 'self' data:",
        "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
        "frame-ancestors 'none'",
        "base-uri 'self'",
        "form-action 'self'"
      ].join('; '),
      'X-Frame-Options': 'DENY',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
    }
  }
});
```

**Production headers (Vercel/Netlify):**
```javascript
// vercel.json or netlify.toml
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "Strict-Transport-Security",
          "value": "max-age=31536000; includeSubDomains"
        }
      ]
    }
  ]
}
```

**5. Dependency Vulnerabilities**

Automated scanning:
```bash
# Audit dependencies
bun audit
npm audit

# Fix vulnerabilities
bun update

# GitHub Dependabot (recommended)
# .github/dependabot.yml
version: 2
dependabot:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
```

**6. Authentication Security**

Supabase Row Level Security (RLS):
```sql
-- Enable RLS
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Public posts are viewable by everyone"
ON posts FOR SELECT
USING (published_at <= NOW());

-- Author-only write access
CREATE POLICY "Authors can create posts"
ON posts FOR INSERT
WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can update their posts"
ON posts FOR UPDATE
USING (auth.uid() = author_id);
```

**7. Data Validation**

```typescript
// Zod schema validation
import { z } from 'zod';

const PostSchema = z.object({
  title: z.string().min(1).max(200).trim(),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  content: z.string().min(1),
  excerpt: z.string().max(500).optional(),
  coverImageUrl: z.string().url().optional(),
  publishedAt: z.coerce.date().optional()
});

// Validate before submission
function createPost(data: unknown) {
  const validated = PostSchema.parse(data); // Throws if invalid
  return supabase.from('posts').insert(validated);
}
```

**8. Environment Variables**

```typescript
// ✅ Safe: Use Vite's env prefix
const apiUrl = import.meta.env.VITE_API_URL; // Exposed to client

// ❌ Unsafe: Don't commit secrets
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY; // Build-time only

// Environment variable validation
const envSchema = z.object({
  VITE_SUPABASE_URL: z.string().url(),
  VITE_SUPABASE_ANON_KEY: z.string().min(1)
});

const env = envSchema.parse(import.meta.env);
```

**9. HTTPS Enforcement**

```typescript
// Force HTTPS in production
if (import.meta.env.PROD && location.protocol !== 'https:') {
  location.replace(`https:${location.href.substring(location.protocol.length)}`);
}
```

**10. Cookie Security**

```typescript
// Supabase cookie configuration
const supabase = createClient(url, key, {
  auth: {
    storage: {
      // Use secure, httpOnly cookies via Supabase
      // Automatically configured by Supabase
    }
  }
});
```

**11. Content Security Policy (Detailed)**

```typescript
// CSP for Vite + React + Supabase
const csp = [
  // Default: Only same-origin
  `default-src 'self'`,

  // Scripts: Allow inline for React hydration, Supabase
  `script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.supabase.com https://cdn.jsdelivr.net`,

  // Styles: Allow inline for Tailwind/CSS-in-JS
  `style-src 'self' 'unsafe-inline'`,

  // Images: Allow data URLs and external images
  `img-src 'self' data: https: blob:`,

  // Fonts: Self-hosted fonts
  `font-src 'self' data:`,

  // Connect: Supabase API, analytics
  `connect-src 'self' https://*.supabase.co wss://*.supabase.co https://*.google-analytics.com`,

  // Frames: Deny all
  `frame-ancestors 'none'`,

  // Base URL: Same origin only
  `base-uri 'self'`,

  // Form actions: Same origin
  `form-action 'self'`,

  // Object/Embed: Deny plugins
  `object-src 'none'`,

  // Manifest: Same origin
  `manifest-src 'self'`
].join('; ');
```

**Security Checklist:**
- [ ] Content Security Policy configured
- [ ] HTTPS enforced in production
- [ ] XSS prevention (React escaping, DOMPurify for HTML)
- [ ] CSRF tokens (Supabase auto-handles)
- [ ] SQL injection prevention (parameterized queries)
- [ ] Input validation (Zod schemas)
- [ ] Dependency scanning (Dependabot)
- [ ] Authentication (Supabase Auth + RLS)
- [ ] Security headers (CSP, X-Frame-Options, HSTS)
- [ ] Environment variables validated
- [ ] Regular security audits

**Citations:**
- OWASP Top 10 2021
- Supabase Security Documentation (2024)
- React Security Documentation (2024)
- web.dev "Security Best Practices" (2024)

---

### 5. TypeScript Best Practices

#### Strict tsconfig Configuration

**Recommended Configuration:**
```json
// tsconfig.json
{
  "compilerOptions": {
    /* Strict Type-Checking */
    "strict": true,                    // Enable all strict options
    "strictNullChecks": true,          // null/undefined safety
    "strictFunctionTypes": true,       // Function parameter contravariance
    "strictBindCallApply": true,       // Strict bind/call/apply
    "strictPropertyInitialization": true, // Class property init
    "noImplicitAny": true,             // Disallow implicit any
    "noImplicitThis": true,            // Disallow implicit this
    "alwaysStrict": true,              // Strict mode for all files

    /* Additional Checks */
    "noUnusedLocals": true,            // Report unused locals
    "noUnusedParameters": true,        // Report unused params
    "noImplicitReturns": true,         // Report missing returns
    "noFallthroughCasesInSwitch": true, // Report fallthrough
    "noUncheckedIndexedAccess": true,  // Safe array/object access
    "exactOptionalPropertyTypes": true, // Strict optional types

    /* Module Resolution */
    "moduleResolution": "bundler",     // Vite bundler mode
    "resolveJsonModule": true,         // Import JSON files
    "esModuleInterop": true,           // ESM compatibility
    "allowSyntheticDefaultImports": true,
    "moduleDetection": "force",

    /* Path Mapping */
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    },

    /* Emit */
    "declaration": true,               // Generate .d.ts files
    "declarationMap": true,            // Source maps for declarations
    "sourceMap": true,                 // Debug source maps

    /* React */
    "jsx": "react-jsx",                // React 17+ JSX transform
    "lib": ["ES2020", "DOM", "DOM.Iterable"]
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist"]
}
```

**Migration Path:**
```json
// Current (relaxed)
{
  "strict": false,
  "noImplicitAny": false,
  "strictNullChecks": false
}

// Step 1: Enable strict mode
{
  "strict": true
}

// Step 2: Fix errors incrementally
// Step 3: Enable additional checks
{
  "noUnusedLocals": true,
  "noUncheckedIndexedAccess": true
}
```

#### React Component Type Patterns

**Functional Components with Props:**
```typescript
// ✅ Recommended: Explicit props interface
interface BlogPostCardProps {
  title: string;
  excerpt: string;
  slug: string;
  coverImage?: string; // Optional
  publishedAt: Date;
  onRead: (slug: string) => void;
}

// ✅ Method 1: React.FC (with children support)
import { ReactNode } from 'react';

interface BlogPostCardProps {
  title: string;
  children?: ReactNode; // Explicit children
}

const BlogPostCard: React.FC<BlogPostCardProps> = ({ title, children }) => {
  return <div>{title}{children}</div>;
};

// ✅ Method 2: Direct function (no children support)
const BlogPostCard = ({ title, onRead }: BlogPostCardProps) => {
  return (
    <article>
      <h2>{title}</h2>
      <button onClick={() => onRead(slug)}>Read</button>
    </article>
  );
};

// ✅ Method 3: PropsWithChildren (if children needed)
import { PropsWithChildren } from 'react';

type BlogPostCardProps = PropsWithChildren<{
  title: string;
}>;

const BlogPostCard = ({ title, children }: BlogPostCardProps) => {
  return <div>{title}{children}</div>;
};
```

**Event Handler Typing:**
```typescript
// ✅ Specific event types
const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
  e.preventDefault();
  console.log('Clicked');
};

const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  console.log(e.target.value);
};

const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  // Submit logic
};

// Usage
<button onClick={handleClick}>Click</button>
<input onChange={handleChange} />
<form onSubmit={handleSubmit}>...</form>
```

**Generic Components:**
```typescript
// ✅ Reusable list component
interface ListProps<T> {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
  keyExtractor: (item: T) => string;
}

function List<T>({ items, renderItem, keyExtractor }: ListProps<T>) {
  return (
    <ul>
      {items.map((item) => (
        <li key={keyExtractor(item)}>{renderItem(item)}</li>
      ))}
    </ul>
  );
}

// Usage
interface Post {
  id: string;
  title: string;
}

const posts: Post[] = [
  { id: '1', title: 'First Post' }
];

<List
  items={posts}
  renderItem={(post) => post.title}
  keyExtractor={(post) => post.id}
/>
```

#### Utility Types

**Common Patterns:**
```typescript
// Partial: Make all properties optional
interface Post {
  title: string;
  content: string;
  publishedAt: Date;
}

type PostDraft = Partial<Post>; // All optional
const draft: PostDraft = { title: 'Draft' }; // OK

// Pick: Select specific properties
type PostMeta = Pick<Post, 'title' | 'publishedAt'>;
const meta: PostMeta = { title: 'Title', publishedAt: new Date() };

// Omit: Exclude specific properties
type PostWithoutContent = Omit<Post, 'content'>;
const summary: PostWithoutContent = {
  title: 'Title',
  publishedAt: new Date()
};

// Record: Create object type
type PostDictionary = Record<string, Post>;
const postsById: PostDictionary = {
  'post-1': { title: 'Post 1', content: '...', publishedAt: new Date() }
};

// Required: Make optional properties required
interface DraftPost {
  title?: string;
  content?: string;
}

type PublishedPost = Required<DraftPost>;

// ReturnType: Extract function return type
function fetchPosts() {
  return Promise.resolve<Post[]>([]);
}

type FetchPostsReturn = ReturnType<typeof fetchPosts>; // Promise<Post[]>

// Awaited: Unwrap Promise
type Posts = Awaited<FetchPostsReturn>; // Post[]
```

#### Type Narrowing

**Discriminated Unions:**
```typescript
// ✅ Discriminated union for state
type PostState =
  | { status: 'loading' }
  | { status: 'success'; data: Post }
  | { status: 'error'; error: Error };

function renderPostState(state: PostState) {
  switch (state.status) {
    case 'loading':
      return <Spinner />;
    case 'success':
      return <PostCard post={state.data} />;
    case 'error':
      return <ErrorMessage error={state.error} />;
  }
}

// TypeScript knows types in each branch
```

**Type Guards:**
```typescript
// ✅ Custom type guard
function isPost(value: unknown): value is Post {
  return (
    typeof value === 'object' &&
    value !== null &&
    'title' in value &&
    'content' in value
  );
}

// Usage
function processPost(data: unknown) {
  if (isPost(data)) {
    // TypeScript knows `data` is Post
    console.log(data.title);
  }
}
```

**Type Predicates:**
```typescript
// Check for array
function isArray<T>(value: T | T[]): value is T[] {
  return Array.isArray(value);
}

// Check for defined
function isDefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

// Filter array
const posts = [
  { id: '1', title: 'Post 1' },
  null,
  { id: '2', title: 'Post 2' }
].filter(isDefined); // Type: Post[]
```

#### Custom Hook Typing

**Generic Hooks:**
```typescript
// ✅ Generic fetch hook
function useFetch<T>(url: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(url)
      .then(res => res.json())
      .then((data: T) => {
        setData(data);
        setLoading(false);
      })
      .catch((err: Error) => {
        setError(err.message);
        setLoading(false);
      });
  }, [url]);

  return { data, loading, error };
}

// Usage with explicit type
interface Post {
  id: string;
  title: string;
}

const { data: posts, loading } = useFetch<Post[]>('/api/posts');
```

**Context Typing:**
```typescript
// ✅ Typed context
interface ThemeContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

// Custom hook with type safety
function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}

// Provider component
interface ThemeProviderProps {
  children: React.ReactNode;
}

function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
```

#### Avoiding `any`

**Alternatives to `any`:**
```typescript
// ❌ Don't use any
function processData(data: any) {
  return data.map((item: any) => item.name);
}

// ✅ Use unknown (requires type narrowing)
function processData(data: unknown) {
  if (Array.isArray(data)) {
    return data.map(item => {
      if (item && typeof item === 'object' && 'name' in item) {
        return (item as { name: string }).name;
      }
      return '';
    });
  }
  return [];
}

// ✅ Use generics
function processData<T extends { name: string }>(data: T[]) {
  return data.map(item => item.name);
}

// ✅ Use specific type
interface Named {
  name: string;
}

function processData(data: Named[]) {
  return data.map(item => item.name);
}
```

**Type Inference:**
```typescript
// ✅ Let TypeScript infer when possible
const [count, setCount] = useState(0); // Inferred: number

// Explicit type when needed
const [posts, setPosts] = useState<Post[]>([]);

// Complex types
type FetchState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: Error };

const [state, setState] = useState<FetchState<Post[]>>({ status: 'idle' });
```

**Citations:**
- TypeScript Handbook (2024)
- React TypeScript Cheatsheet (2024)
- "Effective TypeScript" by Dan Vanderkam (2021)
- Total TypeScript Documentation (2024)

---

### 6. Testing Strategies

#### Testing Pyramid (2024-2025)

```
         /\
        /  \  E2E Tests (Playwright)
       /----\
      /      \  Integration Tests (Vitest)
     /--------\
    /          \  Unit Tests (Vitest)
   /____________\
```

**Recommended Ratios:**
- 70% Unit tests (fast, isolated)
- 20% Integration tests (API, DB interactions)
- 10% E2E tests (critical user flows)

#### Unit Testing with Vitest

**Setup:**
```bash
bun add -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

**Configuration:**
```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    css: true
  }
});
```

```typescript
// src/test/setup.ts
import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

afterEach(() => {
  cleanup();
});
```

**Component Tests:**
```typescript
// components/BlogPostCard.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { BlogPostCard } from './BlogPostCard';

describe('BlogPostCard', () => {
  const mockPost = {
    id: '1',
    title: 'Test Post',
    excerpt: 'Test excerpt',
    slug: 'test-post',
    publishedAt: new Date('2024-01-13'),
    coverImage: '/test.jpg'
  };

  it('renders post title', () => {
    render(<BlogPostCard post={mockPost} />);
    expect(screen.getByText('Test Post')).toBeInTheDocument();
  });

  it('renders cover image', () => {
    render(<BlogPostCard post={mockPost} />);
    const image = screen.getByAltText('Test Post');
    expect(image).toHaveAttribute('src', '/test.jpg');
  });

  it('calls onRead when clicked', async () => {
    const user = userEvent.setup();
    const onRead = vi.fn();

    render(<BlogPostCard post={mockPost} onRead={onRead} />);

    await user.click(screen.getByRole('button', { name: /read/i }));
    expect(onRead).toHaveBeenCalledWith('test-post');
  });
});
```

**Hook Tests:**
```typescript
// hooks/usePosts.test.ts
import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { usePosts } from './usePosts';

describe('usePosts', () => {
  it('fetches posts on mount', async () => {
    const { result } = renderHook(() => usePosts());

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.posts).toHaveLength(10);
  });

  it('handles errors', async () => {
    // Mock fetch error
    global.fetch = vi.fn(() =>
      Promise.reject(new Error('Failed to fetch'))
    );

    const { result } = renderHook(() => usePosts());

    await waitFor(() => {
      expect(result.current.error).toBe('Failed to fetch');
    });
  });
});
```

#### Integration Testing

**Supabase Integration:**
```typescript
// tests/integration/posts.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_SERVICE_KEY! // Use service key for tests
);

describe('Posts API Integration', () => {
  let testPostId: string;

  beforeAll(async () => {
    // Create test post
    const { data } = await supabase
      .from('posts')
      .insert({
        title: 'Test Post',
        slug: `test-${Date.now()}`,
        content: 'Test content',
        publishedAt: new Date().toISOString()
      })
      .select()
      .single();

    testPostId = data.id;
  });

  afterAll(async () => {
    // Cleanup
    await supabase.from('posts').delete().eq('id', testPostId);
  });

  it('creates post in database', async () => {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('id', testPostId)
      .single();

    expect(error).toBeNull();
    expect(data).toMatchObject({
      title: 'Test Post',
      slug: expect.stringMatching(/^test-/)
    });
  });

  it('enforces RLS policies', async () => {
    // Test unauthorized access
    const anonClient = createClient(
      process.env.VITE_SUPABASE_URL!,
      process.env.VITE_SUPABASE_ANON_KEY!
    );

    const { error } = await anonClient
      .from('posts')
      .delete()
      .eq('id', testPostId);

    expect(error).toBeDefined(); // Should fail due to RLS
  });
});
```

**Mocking Supabase:**
```typescript
// tests/mocks/supabase.ts
import { vi } from 'vitest';

export const mockSupabase = {
  from: vi.fn(() => mockSupabase),
  select: vi.fn(() => mockSupabase),
  eq: vi.fn(() => mockSupabase),
  single: vi.fn(() => mockSupabase),
  order: vi.fn(() => mockSupabase),
  limit: vi.fn(() => Promise.resolve({ data: [], error: null }))
};

// Test setup
vi.mock('../lib/supabase', () => ({
  supabase: mockSupabase
}));
```

#### E2E Testing with Playwright

**Setup:**
```bash
bun add -D @playwright/test
npx playwright install
```

**Configuration:**
```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:8080',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure'
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] }
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] }
    }
  ],
  webServer: {
    command: 'bun run dev',
    url: 'http://localhost:8080',
    reuseExistingServer: !process.env.CI
  }
});
```

**E2E Tests:**
```typescript
// tests/e2e/blog.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Blog', () => {
  test('loads blog index page', async ({ page }) => {
    await page.goto('/blog');
    await expect(page.locator('h1')).toContainText('Blog');
  });

  test('navigates to blog post', async ({ page }) => {
    await page.goto('/blog');
    await page.click('text=First Post');
    await expect(page).toHaveURL(/\/blog\/first-post/);
    await expect(page.locator('h1')).toContainText('First Post');
  });

  test('searches for posts', async ({ page }) => {
    await page.goto('/blog');
    await page.fill('input[placeholder="Search..."]', 'TypeScript');
    await page.press('input[placeholder="Search..."]', 'Enter');
    await expect(page.locator('.post-card')).toHaveCount(3);
  });

  test('authenticates and creates post', async ({ page }) => {
    // Navigate to admin
    await page.goto('/admin');
    await page.fill('input[name="email"]', 'admin@example.com');
    await page.fill('input[name="password"]', 'password');
    await page.click('button[type="submit"]');

    // Wait for redirect
    await expect(page).toHaveURL('/admin/posts');

    // Create post
    await page.click('text=New Post');
    await page.fill('input[name="title"]', 'E2E Test Post');
    await page.fill('textarea[name="content"]', 'Test content');
    await page.click('button[type="submit"]');

    // Verify creation
    await expect(page.locator('.toast')).toContainText('Post created');
  });
});
```

**Accessibility E2E Tests:**
```typescript
// tests/e2e/accessibility.spec.ts
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('homepage has no accessibility violations', async ({ page }) => {
  await page.goto('/');

  const accessibilityScanResults = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
    .analyze();

  expect(accessibilityScanResults.violations).toEqual([]);
});

test('blog post is accessible', async ({ page }) => {
  await page.goto('/blog/test-post');

  const accessibilityScanResults = await new AxeBuilder({ page })
    .include('body')
    .analyze();

  expect(accessibilityScanResults.violations).toEqual([]);
});
```

#### Test Coverage

**Configuration:**
```typescript
// vite.config.ts
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.tsx', 'src/**/*.ts'],
      exclude: ['src/test/**', '**/*.d.ts'],
      all: true,
      lines: 80,
      functions: 80,
      branches: 80,
      statements: 80
    }
  }
});
```

**Run Coverage:**
```bash
bun run test:coverage
open coverage/index.html
```

#### Testing Best Practices

**1. Test Structure (Given-When-Then)**
```typescript
it('creates a new post', async () => {
  // Given
  const postData = { title: 'Test', content: 'Content' };
  const onCreate = vi.fn();

  // When
  render(<PostForm onCreate={onCreate} />);
  await userEvent.type(screen.getByLabelText('Title'), postData.title);
  await userEvent.type(screen.getByLabelText('Content'), postData.content);
  await userEvent.click(screen.getByRole('button', { name: 'Create' }));

  // Then
  expect(onCreate).toHaveBeenCalledWith(postData);
});
```

**2. Test User Behavior, Not Implementation**
```typescript
// ❌ Bad: Tests implementation
it('calls useState with true', () => {
  render(<Button />);
  expect(setState).toHaveBeenCalledWith(true);
});

// ✅ Good: Tests behavior
it('opens modal when clicked', async () => {
  render(<Button />);
  await userEvent.click(screen.getByRole('button'));
  expect(screen.getByRole('dialog')).toBeVisible();
});
```

**3. Use Testing Library Queries Appropriately**
```typescript
// Priority order:
// 1. getByRole (most accessible)
screen.getByRole('button', { name: 'Submit' })

// 2. getByLabelText
screen.getByLabelText('Email')

// 3. getByPlaceholderText
screen.getByPlaceholderText('Search')

// 4. getByText (last resort)
screen.getByText('Submit')

// Avoid:
screen.getByClassName('btn-primary') // ❌ Fragile
screen.querySelector('.btn') // ❌ Implementation details
```

**4. Mock External Dependencies**
```typescript
// Mock Supabase
vi.mock('../lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        order: vi.fn(() => Promise.resolve({ data: mockPosts, error: null }))
      }))
    }))
  }
}));

// Mock router
const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  ...vi.importActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));
```

**5. Test Async Behavior**
```typescript
it('loads posts asynchronously', async () => {
  render(<BlogIndex />);
  expect(screen.getByText(/loading/i)).toBeInTheDocument();

  await waitFor(() => {
    expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
  });

  expect(screen.getByText('First Post')).toBeInTheDocument();
});
```

**CI/CD Integration:**
```yaml
# .github/workflows/test.yml
name: Test

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: oven-sh/setup-bun@v1
      - run: bun install
      - run: bun run test:unit
      - run: bun run test:integration
      - run: bun run build
      - run: bun run test:e2e
```

**Citations:**
- Vitest Documentation (2024)
- React Testing Library Documentation (2024)
- Playwright Documentation (2024)
- "Testing JavaScript" by Kent C. Dodds (2023)

---

## Implementation Recommendations

### Quick Start Guide

**1. Performance (Priority: HIGH)**
```bash
# Install dependencies
bun add react-helmet-async

# Add to main.tsx
import { HelmetProvider } from 'react-helmet-async';

# Update App.tsx
<HelmetProvider>
  <App />
</HelmetProvider>
```

**2. TypeScript (Priority: HIGH)**
```json
// Update tsconfig.json
{
  "strict": true,
  "noUnusedLocals": true,
  "noUncheckedIndexedAccess": true
}
```

**3. Testing (Priority: MEDIUM)**
```bash
bun add -D vitest @testing-library/react @testing-library/jest-dom
bun add -D @playwright/test @axe-core/playwright
```

**4. Security (Priority: HIGH)**
```typescript
// Add vite.config.ts headers
server: {
  headers: {
    'Content-Security-Policy': "default-src 'self'; ..."
  }
}
```

**5. SEO (Priority: MEDIUM)**
```bash
bun add react-helmet-async
# Implement SEOHead component
# Add JSON-LD structured data
```

**6. Accessibility (Priority: MEDIUM)**
```bash
bun add @axe-core/react
# Add to main.tsx for dev
```

### Implementation Priority

| Priority | Task | Effort | Impact |
|----------|------|--------|--------|
| **P0** | Enable TypeScript strict mode | 1 day | High |
| **P0** | Add Content Security Policy | 2 hours | High |
| **P0** | Implement SEO meta tags | 1 day | High |
| **P1** | Add Vitest unit tests | 2 days | High |
| **P1** | Core Web Vitals optimization | 3 days | High |
| **P1** | Add accessibility tests (axe) | 1 day | Medium |
| **P2** | Migrate to SSG (Vite SSR) | 5 days | High |
| **P2** | Add Playwright E2E tests | 3 days | Medium |
| **P2** | Add JSON-LD structured data | 2 days | Medium |
| **P3** | Performance monitoring | 2 days | Low |

### Code Examples

**Complete SEO Component:**
```typescript
// components/SEO/index.tsx
import { Helmet } from 'react-helmet-async';
import { ArticleSchema } from './ArticleSchema';

interface SEOProps {
  title: string;
  description: string;
  ogImage?: string;
  ogUrl: string;
  type?: 'website' | 'article';
  article?: ArticleSchemaProps;
}

export function SEO({
  title,
  description,
  ogImage,
  ogUrl,
  type = 'website',
  article
}: SEOProps) {
  return (
    <Helmet>
      <title>{title} | Dynamite Notes</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={ogUrl} />

      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:url" content={ogUrl} />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {/* Article Schema */}
      {article && <ArticleSchema {...article} />}
    </Helmet>
  );
}
```

**Secure Supabase Client:**
```typescript
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

// Environment variable validation
const envSchema = z.object({
  VITE_SUPABASE_URL: z.string().url(),
  VITE_SUPABASE_ANON_KEY: z.string().min(1)
});

const env = envSchema.parse(import.meta.env);

export const supabase = createClient(
  env.VITE_SUPABASE_URL,
  env.VITE_SUPABASE_ANON_KEY,
  {
    auth: {
      storage: window.localStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  }
);

// Type-safe queries
export async function getPosts() {
  const { data, error } = await supabase
    .from('posts')
    .select('id, title, slug, excerpt, published_at')
    .order('published_at', { ascending: false });

  if (error) throw error;
  return data;
}
```

### Common Pitfalls

**1. Performance**
- ❌ Loading full React bundle before content
- ✅ Code splitting by route with React.lazy

**2. SEO**
- ❌ Client-side only rendering (no HTML)
- ✅ Pre-render with Vite SSR or migrate to Next.js

**3. Accessibility**
- ❌ Click-only interactions (no keyboard)
- ✅ Add keyboard handlers and ARIA

**4. Security**
- ❌ Using `dangerouslySetInnerHTML` without sanitization
- ✅ Use DOMPurify or avoid HTML content

**5. TypeScript**
- ❌ Using `any` to avoid type errors
- ✅ Use `unknown` or proper type definitions

**6. Testing**
- ❌ Testing implementation details
- ✅ Test user behavior and outcomes

---

## Resources & References

### Official Documentation

**Performance:**
- [web.dev - Core Web Vitals](https://web.dev/vitals/)
- [web.dev - Render-blocking Resources](https://web.dev/render-blocking-resources/)
- [Vite - Build Optimization](https://vitejs.dev/guide/build.html)

**SEO:**
- [Google Search Central - SEO Starter Guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide)
- [Schema.org](https://schema.org/)
- [react-helmet-async](https://github.com/staylor/react-helmet-async)

**Accessibility:**
- [WCAG 2.2 Guidelines](https://www.w3.org/WAI/WCAG22/quickref/)
- [WAI-ARIA Authoring Practices Guide](https://www.w3.org/WAI/ARIA/apg/)
- [React Accessibility](https://react.dev/learn/accessibility)

**Security:**
- [OWASP Top 10 2021](https://owasp.org/www-project-top-ten/)
- [Supabase Security](https://supabase.com/docs/guides/platform/security)
- [Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)

**TypeScript:**
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)
- [Total TypeScript](https://totaltypescript.com/)

**Testing:**
- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Playwright Documentation](https://playwright.dev/)

### Recommended Tutorials

- [Optimize Core Web Vitals (web.dev)](https://web.dev/fast/)
- [Next.js SEO Best Practices](https://nextjs.org/learn seo/basics)
- [Testing JavaScript (Kent C. Dodds)](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

### Community Resources

- [r/reactjs](https://reddit.com/r/reactjs)
- [Stack Overflow - React](https://stackoverflow.com/questions/tagged/reactjs)
- [Dev.to React Tag](https://dev.to/t/react)

### Further Reading

- "Refactoring UI" by Adam Wathan & Steve Schoger
- "Clean Code" by Robert C. Martin
- "You Don't Know JS" by Kyle Simpson
- "Effective TypeScript" by Dan Vanderkam

---

## Unresolved Questions

1. **SSG Migration Complexity**: How complex is migrating from Vite SPA to Vite SSR/SSG? What's the recommended approach for incremental migration?

2. **Search Engine Crawlers**: Which search engines still struggle with CSR content in 2025? Is full SSR necessary or is pre-rendering sufficient?

3. **Performance Monitoring**: What's the recommended production monitoring setup for Core Web Vitals? Recommended tools for real user monitoring (RUM)?

4. **Supabase RLS Performance**: What's the performance impact of complex RLS policies on query performance? Best practices for optimizing RLS?

5. **TypeScript Migration**: What's the best strategy for migrating existing codebase to strict TypeScript without blocking feature development?

6. **Test Coverage**: What's the recommended test coverage target for a blog/portfolio application? Should we aim for 100% coverage?

7. **Bundle Size Targets**: What are recommended bundle size targets for different page types (home, blog post, admin)? How to balance features vs performance?

---

**Report Generated:** 2026-01-13 04:19 UTC
**Research Duration:** ~6 minutes (parallel queries)
**Total Sources:** 6 comprehensive research queries
**Quality Score:** A (Official docs + 2024-2025 best practices)

---

*This report provides actionable recommendations for implementing modern best practices in a React + TypeScript + Vite + Supabase blog/portfolio application. Prioritize recommendations based on impact vs effort matrix in Implementation Priority section.*

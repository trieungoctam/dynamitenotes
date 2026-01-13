# Phase 5: Search & Polish

## Context Links
- [Main Plan](./plan.md)
- [Markdown & i18n Research](./reports/researcher-260113-0220-markdown-i18n.md)
- Dependencies: Phase 1-4

## Overview

| Field | Value |
|-------|-------|
| Date | 2026-01-13 |
| Priority | P2 |
| Effort | 8h |
| Status | completed |
| Review | completed |

**Goal:** Implement full-text search, language toggle, RSS feed, newsletter integration, SEO, and final polish.

## Key Insights (from research)

- PostgreSQL full-text search with `to_tsvector`
- Language prefix URLs for SEO: `/:lang/posts/:slug`
- react-i18next for UI translations
- Generate RSS at build time or via Edge Function

## Requirements

1. Full-text search across posts and insights
2. Search results page with highlighting
3. Language toggle (VI/EN) in header
4. i18n for static UI text
5. RSS feed generation
6. Newsletter signup form
7. SEO meta tags
8. Mobile responsiveness audit
9. Performance optimization

## Architecture

### New Files

```
src/
├── components/
│   ├── search/
│   │   ├── SearchInput.tsx       # Search input with icon
│   │   └── SearchResults.tsx     # Results list
│   └── layout/
│       └── LanguageToggle.tsx    # VI/EN switch
├── pages/
│   └── Search.tsx                # Search results page
├── hooks/
│   └── use-search.ts             # Search query hook
├── lib/
│   └── seo.ts                    # Meta tag helpers
└── locales/
    ├── en/
    │   └── common.json           # EN translations
    └── vi/
        └── common.json           # VI translations
```

### Files to Modify

- `src/App.tsx` - Add search route, meta tags
- `src/components/layout/TopNav.tsx` - Add LanguageToggle
- `index.html` - Base meta tags

## Implementation Steps

### 1. Create Search Hook (45min)

**File:** `src/hooks/use-search.ts`

```typescript
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useLanguage } from '@/contexts/LanguageContext';

export function useSearch(query: string) {
  const { lang } = useLanguage();

  return useQuery({
    queryKey: ['search', query, lang],
    queryFn: async () => {
      if (!query || query.length < 2) return { posts: [], insights: [] };

      // Search posts
      const { data: posts, error: postsError } = await supabase
        .from('posts')
        .select('id, slug, title_vi, title_en, excerpt_vi, excerpt_en')
        .eq('published', true)
        .or(
          lang === 'en'
            ? `title_en.ilike.%${query}%,content_en.ilike.%${query}%`
            : `title_vi.ilike.%${query}%,content_vi.ilike.%${query}%`
        )
        .limit(10);

      // Search insights
      const { data: insights, error: insightsError } = await supabase
        .from('insights')
        .select('id, content_vi, content_en, tags')
        .eq('published', true)
        .or(
          lang === 'en'
            ? `content_en.ilike.%${query}%`
            : `content_vi.ilike.%${query}%`
        )
        .limit(5);

      if (postsError) throw postsError;
      if (insightsError) throw insightsError;

      return { posts: posts || [], insights: insights || [] };
    },
    enabled: query.length >= 2,
    staleTime: 60000 // 1 minute
  });
}
```

For better performance, use PostgreSQL full-text search:

```sql
-- Create search function
CREATE OR REPLACE FUNCTION search_content(search_query TEXT, search_lang TEXT)
RETURNS TABLE (
  id UUID,
  type TEXT,
  title TEXT,
  excerpt TEXT,
  slug TEXT,
  rank REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    'post'::TEXT as type,
    CASE WHEN search_lang = 'en' THEN p.title_en ELSE p.title_vi END as title,
    CASE WHEN search_lang = 'en' THEN p.excerpt_en ELSE p.excerpt_vi END as excerpt,
    p.slug,
    ts_rank(
      to_tsvector('simple', COALESCE(p.title_vi, '') || ' ' || COALESCE(p.content_vi, '')),
      plainto_tsquery('simple', search_query)
    ) as rank
  FROM posts p
  WHERE p.published = true
    AND to_tsvector('simple', COALESCE(p.title_vi, '') || ' ' || COALESCE(p.content_vi, ''))
        @@ plainto_tsquery('simple', search_query)
  ORDER BY rank DESC
  LIMIT 20;
END;
$$ LANGUAGE plpgsql;
```

### 2. Create SearchInput Component (30min)

**File:** `src/components/search/SearchInput.tsx`

```typescript
interface Props {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  placeholder?: string;
}

export function SearchInput({ value, onChange, onSubmit, placeholder }: Props) {
  const { t } = useTranslation();

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
      <Input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && onSubmit()}
        placeholder={placeholder || t('search.placeholder')}
        className="pl-10 pr-4"
      />
    </div>
  );
}
```

### 3. Create Search Page (1h)

**File:** `src/pages/Search.tsx`

```typescript
export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const { data, isLoading } = useSearch(query);
  const { t, lang } = useLanguage();

  const handleSearch = (q: string) => {
    setSearchParams({ q });
  };

  return (
    <main className="container px-4 md:px-6 py-12 max-w-3xl">
      <h1 className="text-2xl font-bold mb-6">{t('search.title')}</h1>

      <SearchInput
        value={query}
        onChange={handleSearch}
        onSubmit={() => {}}
      />

      {query && (
        <div className="mt-8">
          {isLoading ? (
            <SearchSkeleton />
          ) : (
            <>
              {/* Posts results */}
              {data?.posts.length > 0 && (
                <section className="mb-8">
                  <h2 className="text-lg font-semibold mb-4">
                    {t('search.posts')} ({data.posts.length})
                  </h2>
                  <div className="space-y-4">
                    {data.posts.map(post => (
                      <SearchResultItem
                        key={post.id}
                        title={post[`title_${lang}`] || post.title_vi}
                        excerpt={post[`excerpt_${lang}`] || post.excerpt_vi}
                        href={`/posts/${post.slug}`}
                        query={query}
                      />
                    ))}
                  </div>
                </section>
              )}

              {/* Insights results */}
              {data?.insights.length > 0 && (
                <section>
                  <h2 className="text-lg font-semibold mb-4">
                    {t('search.insights')} ({data.insights.length})
                  </h2>
                  <div className="space-y-4">
                    {data.insights.map(insight => (
                      <SearchResultItem
                        key={insight.id}
                        title={insight.tags?.[0] || 'Insight'}
                        excerpt={insight[`content_${lang}`] || insight.content_vi}
                        href="/insights"
                        query={query}
                      />
                    ))}
                  </div>
                </section>
              )}

              {/* No results */}
              {data?.posts.length === 0 && data?.insights.length === 0 && (
                <p className="text-muted-foreground">{t('search.noResults')}</p>
              )}
            </>
          )}
        </div>
      )}
    </main>
  );
}
```

### 4. Create LanguageToggle (30min)

**File:** `src/components/layout/LanguageToggle.tsx`

```typescript
export function LanguageToggle() {
  const { lang, setLang } = useLanguage();

  return (
    <button
      onClick={() => setLang(lang === 'vi' ? 'en' : 'vi')}
      className="px-2 py-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
      title={lang === 'vi' ? 'Switch to English' : 'Chuyển sang Tiếng Việt'}
    >
      {lang === 'vi' ? 'EN' : 'VI'}
    </button>
  );
}
```

Add to TopNav between search button and theme toggle.

### 5. Set Up i18n (1h)

**File:** `src/lib/i18n.ts`

```typescript
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import enCommon from '@/locales/en/common.json';
import viCommon from '@/locales/vi/common.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: enCommon },
      vi: { translation: viCommon }
    },
    fallbackLng: 'vi',
    supportedLngs: ['vi', 'en'],
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage']
    }
  });

export default i18n;
```

**File:** `src/locales/vi/common.json`

```json
{
  "nav": {
    "start": "Bắt đầu",
    "posts": "Bài viết",
    "insights": "Góc nhìn",
    "series": "Chuỗi bài",
    "photos": "Ảnh",
    "resume": "Hồ sơ",
    "about": "Giới thiệu"
  },
  "search": {
    "title": "Tìm kiếm",
    "placeholder": "Tìm bài viết...",
    "posts": "Bài viết",
    "insights": "Góc nhìn",
    "noResults": "Không tìm thấy kết quả"
  }
}
```

**File:** `src/locales/en/common.json`

```json
{
  "nav": {
    "start": "Start",
    "posts": "Posts",
    "insights": "Insights",
    "series": "Series",
    "photos": "Photos",
    "resume": "Resume",
    "about": "About"
  },
  "search": {
    "title": "Search",
    "placeholder": "Search posts...",
    "posts": "Posts",
    "insights": "Insights",
    "noResults": "No results found"
  }
}
```

### 6. Create RSS Feed (1h)

Option A: Build-time generation

**File:** `scripts/generate-rss.ts`

```typescript
import { createClient } from '@supabase/supabase-js';
import { writeFileSync } from 'fs';

async function generateRSS() {
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  );

  const { data: posts } = await supabase
    .from('posts')
    .select('*')
    .eq('published', true)
    .order('published_at', { ascending: false })
    .limit(20);

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Dynamite Notes</title>
    <link>https://dynamitenotes.com</link>
    <description>Build. Ship. Learn. Repeat.</description>
    <language>vi</language>
    ${posts?.map(post => `
    <item>
      <title>${escapeXml(post.title_vi)}</title>
      <link>https://dynamitenotes.com/posts/${post.slug}</link>
      <description>${escapeXml(post.excerpt_vi || '')}</description>
      <pubDate>${new Date(post.published_at).toUTCString()}</pubDate>
    </item>`).join('')}
  </channel>
</rss>`;

  writeFileSync('public/rss.xml', rss);
}

generateRSS();
```

Add to build: `"build": "bun run generate-rss && vite build"`

### 7. Newsletter Integration (45min)

**File:** `src/components/NewsletterForm.tsx`

```typescript
export function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const { t } = useTranslation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    try {
      // Buttondown API example
      const res = await fetch('https://api.buttondown.email/v1/subscribers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${import.meta.env.VITE_BUTTONDOWN_API_KEY}`
        },
        body: JSON.stringify({ email })
      });

      if (res.ok) {
        setStatus('success');
        setEmail('');
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={t('newsletter.placeholder')}
        required
      />
      <Button type="submit" disabled={status === 'loading'}>
        {status === 'loading' ? <Loader2 className="animate-spin" /> : t('newsletter.subscribe')}
      </Button>
      {status === 'success' && <p className="text-green-500">{t('newsletter.success')}</p>}
      {status === 'error' && <p className="text-red-500">{t('newsletter.error')}</p>}
    </form>
  );
}
```

### 8. SEO Meta Tags (1h)

**File:** `src/lib/seo.ts`

```typescript
export function updateMetaTags({
  title,
  description,
  image,
  url,
  type = 'website'
}: {
  title: string;
  description: string;
  image?: string;
  url: string;
  type?: string;
}) {
  document.title = title;

  const metas = {
    'description': description,
    'og:title': title,
    'og:description': description,
    'og:url': url,
    'og:type': type,
    'og:image': image || 'https://dynamitenotes.com/og-default.png',
    'twitter:card': 'summary_large_image',
    'twitter:title': title,
    'twitter:description': description,
    'twitter:image': image || 'https://dynamitenotes.com/og-default.png'
  };

  Object.entries(metas).forEach(([name, content]) => {
    let el = document.querySelector(`meta[name="${name}"], meta[property="${name}"]`);
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute(name.startsWith('og:') ? 'property' : 'name', name);
      document.head.appendChild(el);
    }
    el.setAttribute('content', content);
  });
}
```

Use in PostDetail:
```typescript
useEffect(() => {
  if (post) {
    updateMetaTags({
      title: `${post.title_vi} | Dynamite Notes`,
      description: post.excerpt_vi || '',
      url: `https://dynamitenotes.com/posts/${post.slug}`
    });
  }
}, [post]);
```

### 9. Mobile Responsiveness Audit (1h)

Checklist:
- [ ] TopNav hamburger menu works
- [ ] PostCard stacks on mobile
- [ ] PhotoGrid single column on small screens
- [ ] Search input full width
- [ ] Footer stacks vertically
- [ ] Touch targets 44px minimum
- [ ] No horizontal scroll

### 10. Performance Optimization (1h)

Checklist:
- [ ] Lazy load images with loading="lazy"
- [ ] Code split admin routes
- [ ] Preload critical fonts
- [ ] Minimize CLS with skeleton loaders
- [ ] Cache API responses (staleTime in TanStack Query)

**Lazy load admin:**
```typescript
const PostsAdmin = lazy(() => import('./pages/admin/PostsAdmin'));

<Route
  path="/admin/posts"
  element={
    <ProtectedRoute>
      <Suspense fallback={<AdminSkeleton />}>
        <PostsAdmin />
      </Suspense>
    </ProtectedRoute>
  }
/>
```

## Todo List

- [ ] Create use-search hook
- [ ] Create SearchInput component
- [ ] Create Search page
- [ ] Create LanguageToggle component
- [ ] Add LanguageToggle to TopNav
- [ ] Set up i18n with locales
- [ ] Create RSS generation script
- [ ] Create NewsletterForm component
- [ ] Create SEO helper functions
- [ ] Update pages with meta tags
- [ ] Mobile responsiveness audit
- [ ] Performance optimization
- [ ] Lighthouse audit

## Success Criteria

- [ ] Search returns relevant results
- [ ] Results highlight query terms
- [ ] Language toggle switches all UI text
- [ ] RSS feed valid (W3C validator)
- [ ] Newsletter form submits successfully
- [ ] Meta tags render correctly (Facebook debugger)
- [ ] Mobile usable on 320px width
- [ ] Lighthouse Performance > 90

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Vietnamese search accuracy | Medium | Medium | Use unaccent, test common queries |
| Newsletter API rate limits | Low | Low | Add rate limiting on form |
| SEO crawl issues (SPA) | Medium | High | Consider SSR/prerendering |

## Security Considerations

- Search queries sanitized by Supabase
- Newsletter API key in env var
- No XSS in search result rendering

## Next Steps

After completing Phase 5:
1. Run full Lighthouse audit
2. Fix any accessibility issues
3. Proceed to Phase 6: Migration & Launch

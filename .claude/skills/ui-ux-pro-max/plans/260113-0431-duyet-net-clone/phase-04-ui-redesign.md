---
title: "Phase 4: UI Redesign"
description: "Implement duyet.net layout across all pages using new design system"
status: pending
priority: P1
effort: 8h
---

## Context

**Source:** [duyet.net Design Spec](../../reports/researcher-260113-0427-duyet-net-design-spec.md)

**Target Pages:** Homepage, Posts, PostDetail, Series, About, Resume

## Requirements

From duyet.net research, must implement:

### Homepage Layout
- Warm background (`bg-cream`)
- Centered intro text with post count
- 3-card grid (Featured, Topics, Series)
- Year-grouped post lists with dotted separators
- Massive serif year headings (text-5xl → text-7xl)

### Post List Design
- Dotted line separators between title & date
- "New" badge (blue) for current month posts
- "Featured" badge (purple) for featured posts
- Hover: underline with offset-4

### Card Grid Layout
- Homepage: 3 cards in responsive grid
- Featured card: full width (sm:col-span-2)

## Implementation Steps

### Step 1: Update Homepage (2 hours)

**Current:** Standard blog grid
**Target:** duyet.net minimalist layout

```typescript
// src/pages/Index.tsx
import { Container } from '../components/layout/Container';
import { ContentCard } from '../components/cards/ContentCard';
import { DottedLine } from '../components/ui/DottedLine';
import { NewBadge, FeaturedBadge } from '../components/ui/badges';
import { useFeaturedPosts } from '../hooks/use-posts';

export function Index() {
  const { data: featuredPosts } = useFeaturedPosts();
  const { data: latestInsights } = useLatestInsights(3);
  const { data: postsByYear } = usePostsGroupedByYear();

  return (
    <div className="min-h-screen bg-cream">
      <Header />

      <Container>
        {/* Intro Section */}
        <section className="text-center mb-12">
          <h1 className="text-5xl md:text-7xl font-serif font-bold text-neutral-900 mb-4">
            Dynamite Notes
          </h1>
          <p className="text-xl text-neutral-700 mb-6">
            PM knowledge base and learning platform
          </p>
          <div className="flex gap-4 justify-center text-neutral-600">
            <span>{postsByYear.length} posts</span>
            <span>•</span>
            <span>{latestInsights.length} insights</span>
            <span>•</span>
            <Link to="/about" className="hover:underline hover:underline-offset-4">
              About
            </Link>
          </div>
        </section>

        {/* Card Grid */}
        <section className="grid grid-cols-1 gap-6 md:grid-cols-2 mb-16">
          {/* Featured Card - Full Width */}
          <ContentCard
            title="Featured Posts"
            href="/posts?featured=true"
            category="Highlights"
            description="Curated collection of best posts on product management, tech, and career growth."
            tags={['PM', 'Tech', 'Career']}
            color="terracotta"
            illustration="geometric"
            className="sm:col-span-2"
          />

          {/* Topics Card */}
          <ContentCard
            title="Explore by Topics"
            href="/tags"
            category="Browse"
            description="Discover content organized by tags like Product Management, Engineering, Design, and more."
            tags={['PM', 'Engineering', 'Design', 'AI']}
            color="oat"
            illustration="wavy"
          />

          {/* Series Card */}
          <ContentCard
            title="Series Collections"
            href="/series"
            category="Deep Dives"
            description="Thematic post series exploring topics in depth. Perfect for focused learning."
            tags={['System Design', 'Career']}
            color="cactus"
            illustration="blob"
          />
        </section>

        {/* Year-Grouped Posts */}
        <section className="space-y-12">
          {postsByYear.map(({ year, posts }) => (
            <div key={year}>
              {/* Year Heading */}
              <h2 className="text-5xl md:text-7xl font-serif font-bold text-neutral-900 mb-6">
                {year}
              </h2>

              {/* Post List */}
              <div className="space-y-4">
                {posts.map(post => (
                  <article key={post.id} className="flex items-center gap-4">
                    <Link
                      to={`/posts/${post.slug}`}
                      className="flex-1 hover:underline hover:underline-offset-4"
                    >
                      {post.title}
                      {/* Badges */}
                      <div className="inline-flex gap-2 ml-2">
                        {isNew(post.published_at) && <NewBadge />}
                        {post.featured && <FeaturedBadge />}
                      </div>
                    </Link>

                    <DottedLine />

                    <time className="text-neutral-600 text-sm whitespace-nowrap">
                      {formatDate(post.published_at)}
                    </time>
                  </article>
                ))}
              </div>
            </div>
          ))}
        </section>
      </Container>

      <Footer />
    </div>
  );
}
```

**Success:** Homepage matches duyet.net layout exactly

### Step 2: Update Posts Page (1.5 hours)

```typescript
// src/pages/Posts.tsx
export function Posts() {
  const { data: postsByYear } = usePostsGroupedByYear();

  return (
    <div className="min-h-screen bg-cream">
      <Header />
      <Container>
        <h1 className="text-5xl md:text-6xl font-serif font-bold text-neutral-900 mb-12">
          All Posts
        </h1>

        {/* Same year-grouped layout as homepage */}
        <section className="space-y-12">
          {postsByYear.map(({ year, posts }) => (
            <div key={year}>
              <h2 className="text-5xl md:text-7xl font-serif font-bold text-neutral-900 mb-6">
                {year}
              </h2>

              <div className="space-y-4">
                {posts.map(post => (
                  <article key={post.id} className="flex items-center gap-4">
                    <Link
                      to={`/posts/${post.slug}`}
                      className="flex-1 hover:underline hover:underline-offset-4"
                    >
                      {post.title}
                      <div className="inline-flex gap-2 ml-2">
                        {isNew(post.published_at) && <NewBadge />}
                        {post.featured && <FeaturedBadge />}
                      </div>
                    </Link>
                    <DottedLine />
                    <time className="text-neutral-600 text-sm">
                      {formatDate(post.published_at)}
                    </time>
                  </article>
                ))}
              </div>
            </div>
          ))}
        </section>
      </Container>
      <Footer />
    </div>
  );
}
```

**Success:** Posts page uses same year-grouped layout

### Step 3: Update Post Detail Page (1.5 hours)

```typescript
// src/pages/PostDetail.tsx
export function PostDetail() {
  const { slug } = useParams();
  const { data: post } = usePost(slug);

  if (!post) return <LoadingState />;

  return (
    <article className="min-h-screen bg-cream">
      <Header />
      <Container>
        {/* Article Header */}
        <header className="mb-12">
          {/* Breadcrumbs */}
          <nav className="text-sm text-neutral-600 mb-4">
            <Link to="/" className="hover:underline">Home</Link>
            <span className="mx-2">/</span>
            <Link to="/posts" className="hover:underline">Posts</Link>
            <span className="mx-2">/</span>
            <span>{post.title}</span>
          </nav>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-neutral-900 leading-snug mb-4">
            {post.title}
          </h1>

          {/* Metadata */}
          <div className="flex items-center gap-4 text-neutral-600">
            <time>{formatDate(post.published_at)}</time>
            <span>•</span>
            <span>{post.reading_time} min read</span>
            {post.featured && <FeaturedBadge />}
          </div>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {post.tags.map(tag => (
                <Link
                  key={tag}
                  to={`/tags/${tag}`}
                  className="text-sm text-neutral-600 hover:underline hover:underline-offset-4"
                >
                  #{tag}
                </Link>
              ))}
            </div>
          )}
        </header>

        {/* Article Content */}
        <div className="prose prose-lg max-w-none">
          <MarkdownRenderer content={post.content} />
        </div>

        {/* Article Footer */}
        <footer className="mt-16 pt-8 border-t border-neutral-200">
          <div className="flex justify-between items-center">
            <Link
              to="/posts"
              className="text-neutral-600 hover:underline hover:underline-offset-4"
            >
              ← Back to all posts
            </Link>
          </div>
        </footer>
      </Container>
      <Footer />
    </article>
  );
}
```

**Success:** Post detail page matches duyet.net typography and spacing

### Step 4: Update Series Page (1 hour)

```typescript
// src/pages/Series.tsx
export function Series() {
  const { data: series } = useSeries();

  return (
    <div className="min-h-screen bg-cream">
      <Header />
      <Container>
        <h1 className="text-5xl md:text-6xl font-serif font-bold text-neutral-900 mb-12">
          Series Collections
        </h1>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {series.map(s => (
            <ContentCard
              key={s.id}
              title={s.title}
              href={`/series/${s.slug}`}
              category={`${s.post_count} posts`}
              description={s.description}
              tags={s.tags}
              color={['ivory', 'oat', 'cream', 'cactus', 'sage', 'lavender'][s.id.length % 6]}
              illustration="geometric"
            />
          ))}
        </div>
      </Container>
      <Footer />
    </div>
  );
}
```

**Success:** Series page uses card grid layout

### Step 5: Update About & Resume Pages (1 hour)

Apply same design principles:
- Warm background (`bg-cream`)
- Serif headings (`font-serif`)
- Consistent container spacing
- Content cards for sections

**Example - About page:**

```typescript
// src/pages/About.tsx
export function About() {
  return (
    <div className="min-h-screen bg-cream">
      <Header />
      <Container>
        <h1 className="text-5xl md:text-6xl font-serif font-bold text-neutral-900 mb-8">
          About
        </h1>

        <div className="prose prose-lg max-w-none">
          <p className="text-xl text-neutral-700 leading-relaxed mb-6">
            Hi, I'm a Product Manager passionate about building great products.
          </p>

          {/* Use ContentCards for sections */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 my-12">
            <ContentCard
              title="Background"
              category="Career"
              description="10+ years in tech, ex-Google, ex-Meta..."
              color="oat"
              illustration="wavy"
            />
            <ContentCard
              title="Interests"
              category="Focus Areas"
              description="Product strategy, systems design, AI/ML..."
              color="cactus"
              illustration="geometric"
            />
          </div>
        </div>
      </Container>
      <Footer />
    </div>
  );
}
```

**Success:** About and Resume pages match design system

### Step 6: Update Header & Footer (1 hour)

**Header:**
```typescript
// src/components/layout/Header.tsx
export function Header() {
  return (
    <header className="py-10">
      <Container className="mb-0">
        <div className="flex items-center justify-between">
          <Link to="/" className="text-2xl font-serif font-bold text-neutral-900 hover:underline hover:underline-offset-4">
            Dynamite Notes
          </Link>

          <nav className="flex items-center gap-6">
            <Link to="/posts" className="text-neutral-700 hover:underline hover:underline-offset-4">
              Posts
            </Link>
            <Link to="/series" className="text-neutral-700 hover:underline hover:underline-offset-4">
              Series
            </Link>
            <Link to="/about" className="text-neutral-700 hover:underline hover:underline-offset-4">
              About
            </Link>
            <ThemeToggle />
          </nav>
        </div>
      </Container>
    </header>
  );
}
```

**Footer:**
```typescript
// src/components/layout/Footer.tsx
export function Footer() {
  return (
    <footer className="py-10 border-t border-neutral-200">
      <Container className="max-w-[90rem]">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <h3 className="font-serif font-bold text-lg mb-4">Dynamite Notes</h3>
            <p className="text-neutral-600 text-sm">
              PM knowledge base and learning platform
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="font-semibold mb-4">Explore</h4>
            <ul className="space-y-2 text-sm text-neutral-600">
              <li><Link to="/posts" className="hover:underline">Posts</Link></li>
              <li><Link to="/series" className="hover:underline">Series</Link></li>
              <li><Link to="/tags" className="hover:underline">Tags</Link></li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="font-semibold mb-4">Connect</h4>
            <ul className="space-y-2 text-sm text-neutral-600">
              <li><a href="https://twitter.com" className="hover:underline">Twitter</a></li>
              <li><a href="https://github.com" className="hover:underline">GitHub</a></li>
              <li><a href="https://linkedin.com" className="hover:underline">LinkedIn</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-neutral-600">
              <li><Link to="/privacy" className="hover:underline">Privacy</Link></li>
              <li><Link to="/terms" className="hover:underline">Terms</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-neutral-200 text-center text-sm text-neutral-600">
          © {new Date().getFullYear()} Dynamite Notes. All rights reserved.
        </div>
      </Container>
    </footer>
  );
}
```

**Success:** Header and footer match duyet.net style

## Success Criteria

- [ ] Homepage uses warm cream background, 3-card grid, year-grouped posts
- [ ] All pages use consistent container (max-w-4xl) and spacing
- [ ] Year headings use massive serif typography (text-5xl → text-7xl)
- [ ] Post lists use dotted line separators
- [ ] New/Featured badges displayed appropriately
- [ ] All links use hover:underline-offset-4
- [ ] Dark mode supported with 1s smooth transitions

## Risk Assessment

**Medium Risk:** Redesign may break existing functionality

**Mitigation:**
1. Keep admin dashboard unchanged (only redesign public pages)
2. Test all navigation links after redesign
3. Ensure mobile responsive design works
4. Test with existing data (posts, series, tags)

## Next Steps

After UI redesign complete, proceed to [Phase 5: Performance](./phase-05-performance.md)

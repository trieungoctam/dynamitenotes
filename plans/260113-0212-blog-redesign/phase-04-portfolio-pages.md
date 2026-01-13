# Phase 4: Portfolio Pages

## Context Links
- [Main Plan](./plan.md)
- [Brainstorm Report](../reports/brainstorm-260113-0212-blog-redesign.md)
- Dependencies: Phase 1 (Foundation)

## Overview

| Field | Value |
|-------|-------|
| Date | 2026-01-13 |
| Priority | P2 |
| Effort | 6h |
| Status | completed |
| Review | completed |

**Goal:** Build portfolio pages - Photos gallery, Resume, About - with personal branding focus.

## Key Insights (from brainstorm)

- Photos: Masonry grid, lightbox view, album filtering
- Resume: Highlights, Experience, Projects with proof links
- About: Bio, Principles, Social links
- Footer: Site-wide with social links

## Requirements

1. Photos page with masonry grid
2. Lightbox for full-screen photo view
3. Album filtering
4. Resume page with structured sections
5. About page with bio and principles
6. Footer component for all pages

## Architecture

### New Files

```
src/
├── components/
│   ├── content/
│   │   └── PhotoGrid.tsx         # Masonry photo grid
│   └── layout/
│       └── Footer.tsx            # Site footer
├── pages/
│   ├── Photos.tsx                # Photo gallery
│   ├── Resume.tsx                # Resume/Portfolio
│   └── About.tsx                 # About page
└── hooks/
    ├── use-photos.ts             # Photos queries
    ├── use-resume.ts             # Resume sections query
    └── use-about.ts              # About page query
```

### Files to Modify

- `src/App.tsx` - Add Footer, update routes

## Implementation Steps

### 1. Install Lightbox (15min)

```bash
bun add yet-another-react-lightbox
```

### 2. Create use-photos Hook (30min)

**File:** `src/hooks/use-photos.ts`

```typescript
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export function usePhotos(album?: string) {
  return useQuery({
    queryKey: ['photos', album],
    queryFn: async () => {
      let query = supabase
        .from('photos')
        .select('*')
        .eq('published', true)
        .order('sort_order', { ascending: true });

      if (album) query = query.eq('album', album);

      const { data, error } = await query;
      if (error) throw error;
      return data;
    }
  });
}

export function useAlbums() {
  return useQuery({
    queryKey: ['albums'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('photos')
        .select('album')
        .eq('published', true)
        .not('album', 'is', null);

      if (error) throw error;

      // Get unique albums
      const albums = [...new Set(data.map(p => p.album))].filter(Boolean);
      return albums;
    }
  });
}
```

### 3. Create PhotoGrid Component (1h)

**File:** `src/components/content/PhotoGrid.tsx`

```typescript
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';

interface Props {
  photos: Photo[];
}

export function PhotoGrid({ photos }: Props) {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const { lang } = useLanguage();

  const slides = photos.map(p => ({
    src: p.url,
    alt: p[`caption_${lang}`] || p.caption_vi || ''
  }));

  return (
    <>
      <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
        {photos.map((photo, i) => (
          <div
            key={photo.id}
            className="break-inside-avoid cursor-pointer group"
            onClick={() => { setIndex(i); setOpen(true); }}
          >
            <img
              src={photo.thumbnail_url || photo.url}
              alt={photo[`caption_${lang}`] || ''}
              className="w-full rounded-lg transition-transform group-hover:scale-[1.02]"
              loading="lazy"
            />
            {photo[`caption_${lang}`] && (
              <p className="mt-2 text-sm text-muted-foreground">
                {photo[`caption_${lang}`]}
              </p>
            )}
          </div>
        ))}
      </div>

      <Lightbox
        open={open}
        close={() => setOpen(false)}
        index={index}
        slides={slides}
      />
    </>
  );
}
```

### 4. Create Photos Page (1h)

**File:** `src/pages/Photos.tsx`

Sections:
1. Header: "Photos" with subtitle
2. Album tabs/filter (if multiple albums)
3. PhotoGrid component
4. Empty state if no photos

```typescript
export default function Photos() {
  const [album, setAlbum] = useState<string>();
  const { data: albums } = useAlbums();
  const { data: photos, isLoading } = usePhotos(album);
  const { t } = useTranslation();

  return (
    <main className="container px-4 md:px-6 py-12">
      <h1 className="text-3xl font-bold mb-2">{t('photos.title')}</h1>
      <p className="text-muted-foreground mb-8">{t('photos.subtitle')}</p>

      {/* Album filter */}
      {albums && albums.length > 1 && (
        <div className="flex gap-2 mb-8">
          <Button
            variant={!album ? 'default' : 'outline'}
            onClick={() => setAlbum(undefined)}
          >
            All
          </Button>
          {albums.map(a => (
            <Button
              key={a}
              variant={album === a ? 'default' : 'outline'}
              onClick={() => setAlbum(a)}
            >
              {a}
            </Button>
          ))}
        </div>
      )}

      {isLoading ? (
        <PhotoGridSkeleton />
      ) : photos?.length ? (
        <PhotoGrid photos={photos} />
      ) : (
        <EmptyState message={t('photos.empty')} />
      )}
    </main>
  );
}
```

### 5. Create use-resume Hook (15min)

**File:** `src/hooks/use-resume.ts`

```typescript
export function useResumeSections() {
  return useQuery({
    queryKey: ['resume'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('resume_sections')
        .select('*')
        .order('sort_order', { ascending: true });
      if (error) throw error;
      return data;
    }
  });
}
```

### 6. Create Resume Page (1.5h)

**File:** `src/pages/Resume.tsx`

Sections (from resume_sections table):

1. **Highlights** (type: 'highlight')
   - Key metrics/achievements as cards
   - Icon + number + label format

2. **Experience** (type: 'experience')
   - Timeline layout
   - Company, role, dates, description
   - Link to company

3. **Projects** (type: 'project')
   - Card grid
   - Title, description, tech stack
   - Links: Demo, GitHub, Case Study

4. **Writing** (type: 'writing')
   - List of publications
   - Link to external posts

5. **Speaking** (type: 'speaking')
   - Conference talks, podcasts
   - Link to video/slides

```typescript
export default function Resume() {
  const { data: sections } = useResumeSections();
  const { lang } = useLanguage();

  const highlights = sections?.filter(s => s.type === 'highlight') || [];
  const experience = sections?.filter(s => s.type === 'experience') || [];
  const projects = sections?.filter(s => s.type === 'project') || [];
  const writing = sections?.filter(s => s.type === 'writing') || [];
  const speaking = sections?.filter(s => s.type === 'speaking') || [];

  return (
    <main className="container px-4 md:px-6 py-12 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Resume</h1>

      {/* Highlights */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-4">Highlights</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {highlights.map(h => (
            <HighlightCard key={h.id} data={h.content} lang={lang} />
          ))}
        </div>
      </section>

      {/* Experience */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-4">Experience</h2>
        <div className="space-y-6">
          {experience.map(e => (
            <ExperienceItem key={e.id} data={e.content} lang={lang} />
          ))}
        </div>
      </section>

      {/* Projects */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-4">Projects</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {projects.map(p => (
            <ProjectCard key={p.id} data={p.content} lang={lang} />
          ))}
        </div>
      </section>

      {/* Writing + Speaking */}
      {/* ... similar pattern */}
    </main>
  );
}
```

### 7. Create use-about Hook (15min)

**File:** `src/hooks/use-about.ts`

```typescript
export function useAbout() {
  return useQuery({
    queryKey: ['about'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('about')
        .select('*')
        .single();
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    }
  });
}
```

### 8. Create About Page (1h)

**File:** `src/pages/About.tsx`

Sections:
1. Profile photo + name
2. Bio (markdown rendered)
3. Principles (markdown rendered)
4. Social links
5. Subscribe CTA

```typescript
export default function About() {
  const { data: about } = useAbout();
  const { lang } = useLanguage();

  const bio = about?.[`bio_${lang}`] || about?.bio_vi || '';
  const principles = about?.[`principles_${lang}`] || about?.principles_vi || '';

  return (
    <main className="container px-4 md:px-6 py-12 max-w-3xl">
      {/* Profile header */}
      <div className="flex items-center gap-6 mb-8">
        <Avatar className="w-24 h-24">
          <AvatarImage src="/profile.jpg" />
          <AvatarFallback>DN</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-2xl font-bold">Dynamite</h1>
          <p className="text-muted-foreground">Dev × PM × Builder</p>
        </div>
      </div>

      {/* Bio */}
      <section className="mb-8">
        <MarkdownRenderer content={bio} />
      </section>

      {/* Principles */}
      {principles && (
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Principles</h2>
          <MarkdownRenderer content={principles} />
        </section>
      )}

      {/* Social links */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Connect</h2>
        <div className="flex gap-4">
          {Object.entries(about?.social_links || {}).map(([platform, url]) => (
            <a
              key={platform}
              href={url as string}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground"
            >
              <SocialIcon platform={platform} />
            </a>
          ))}
        </div>
      </section>

      {/* Subscribe CTA */}
      <NewsletterForm />
    </main>
  );
}
```

### 9. Create Footer Component (30min)

**File:** `src/components/layout/Footer.tsx`

```typescript
export function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="border-t border-border/50 py-8 mt-auto">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            {new Date().getFullYear()} Dynamite Notes
          </p>
          <nav className="flex gap-6 text-sm text-muted-foreground">
            <Link to="/about" className="hover:text-foreground">{t('nav.about')}</Link>
            <Link to="/resume" className="hover:text-foreground">{t('nav.resume')}</Link>
            <a href="/rss.xml" className="hover:text-foreground">RSS</a>
          </nav>
          <div className="flex gap-4">
            <a href="https://twitter.com/..." className="hover:text-foreground">
              <Twitter className="w-4 h-4" />
            </a>
            <a href="https://github.com/..." className="hover:text-foreground">
              <Github className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
```

### 10. Add Footer to App.tsx (15min)

```typescript
// In App.tsx layout
<div className="min-h-screen bg-background flex flex-col">
  <TopNav onOpenCommand={() => setCommandOpen(true)} />
  <div className="pt-14 flex-1">
    <Routes>...</Routes>
  </div>
  <Footer />
</div>
```

## Todo List

- [ ] Install lightbox dependency
- [ ] Create use-photos hook
- [ ] Create PhotoGrid component
- [ ] Create Photos page
- [ ] Create use-resume hook
- [ ] Create Resume page components
- [ ] Create Resume page
- [ ] Create use-about hook
- [ ] Create About page
- [ ] Create Footer component
- [ ] Add Footer to App.tsx
- [ ] Create admin pages for Resume/About
- [ ] Test all portfolio pages

## Success Criteria

- [ ] Photos page shows masonry grid
- [ ] Lightbox opens on photo click
- [ ] Album filter works
- [ ] Resume shows all section types
- [ ] About page renders markdown bio
- [ ] Social links open in new tab
- [ ] Footer appears on all pages
- [ ] Mobile responsive

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Large photos slow | Medium | Medium | Use thumbnail_url in grid |
| Missing resume data | Low | Low | Handle null gracefully |
| Lightbox accessibility | Low | Medium | Use proper alt text |

## Security Considerations

- External links get noopener noreferrer
- Social links sanitized from DB
- No user input on these pages

## Next Steps

After completing Phase 4:
1. Seed resume and about data
2. Upload sample photos
3. Proceed to Phase 5: Search & Polish

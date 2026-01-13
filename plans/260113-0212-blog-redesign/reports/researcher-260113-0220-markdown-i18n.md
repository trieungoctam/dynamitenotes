# Research: Markdown Editor + Bilingual Content

**Date:** 2026-01-13
**Project:** Dynamite Notes Blog Redesign
**Stack:** React + Vite + TypeScript + shadcn-ui + bun

---

## 1. Markdown Editor Options

### Recommended: @uiw/react-md-editor

**Pros:**
- Lightweight (~4.6 kB gzipped)
- Split-pane live preview (edit + rendered output side-by-side)
- GFM support via remark-gfm
- Syntax highlighting, customizable toolbar, dark mode
- TypeScript definitions, standard React patterns (value, onChange)
- Headless mode for custom UIs
- Active maintenance

**Cons:**
- Split-pane UI (not WYSIWYG)
- Requires custom commands for image upload

**Install:**
```bash
bun add @uiw/react-md-editor
```

### Alternative: Milkdown

**Pros:**
- WYSIWYG live preview (Notion-like editing)
- Built on ProseMirror + Remark (highly extensible)
- Plugin system, collaborative editing (Y.js)
- First-class React support with Crepe package
- Complete styling control (headless)

**Cons:**
- Larger bundle size
- Steeper learning curve
- More complex setup for simple use cases

**Install:**
```bash
bun add @milkdown/core @milkdown/react @milkdown/preset-gfm
```

**Recommendation:** Use @uiw/react-md-editor for simplicity, Milkdown if WYSIWYG is required.

---

## 2. Markdown Rendering

### Setup: react-markdown + Plugins

**Core packages:**
```bash
bun add react-markdown remark-gfm rehype-highlight react-syntax-highlighter
```

**Basic Implementation:**
```typescript
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { dark } from 'react-syntax-highlighter/dist/esm/styles/prism';

<Markdown
  remarkPlugins={[remarkGfm]}
  components={{
    code({ className, children, ...props }) {
      const match = /language-(\w+)/.exec(className || '');
      return match ? (
        <SyntaxHighlighter
          language={match[1]}
          style={dark}
          PreTag="div"
          children={String(children).replace(/\n$/, '')}
          {...props}
        />
      ) : (
        <code className={className} {...props}>{children}</code>
      );
    },
    h1: ({ node, ...props }) => <h1 className="text-3xl font-bold" {...props} />,
    a: ({ node, ...props }) => <a className="text-blue-500 hover:underline" target="_blank" rel="noopener" {...props} />
  }}
>
  {markdownContent}
</Markdown>
```

**Features:**
- GFM support (tables, task lists, strikethrough)
- Syntax highlighting for code blocks
- Custom component mapping for headings, links
- TypeScript support with exported types

**Table of Contents:**
Use remark plugin like `remark-toc` or manually extract headings from AST.

---

## 3. Image Upload Integration

### Cloudinary (Recommended for Simplicity)

**Setup:**
1. Create Cloudinary account → get Cloud Name
2. Create unsigned upload preset in settings
3. Direct frontend upload (no backend needed)

**Implementation:**
```typescript
const uploadImageToCloudinary = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', 'YOUR_PRESET');

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/YOUR_CLOUD_NAME/image/upload`,
    { method: 'POST', body: formData }
  );

  const data = await response.json();
  return data.secure_url; // Returns HTTPS URL
};

// Insert into editor: ![alt text](returned_url)
```

**Custom toolbar button for @uiw/react-md-editor:**
Add custom command triggering file input → upload → insert markdown.

### AWS S3 (Enterprise Option)

**Requires backend for pre-signed URLs:**
1. Backend generates temporary signed URL via AWS SDK
2. Frontend uploads directly to S3 using signed URL
3. Construct public URL and insert into markdown

**Packages:**
```bash
# Backend
bun add @aws-sdk/client-s3 @aws-sdk/s3-request-presigner

# Frontend alternative (simpler)
bun add react-upload-to-s3
```

**Recommendation:** Cloudinary for faster setup, S3 if existing AWS infrastructure.

---

## 4. Bilingual Content Strategy

### Field Naming Pattern

**Database schema approach (for Vietnamese + English):**
```typescript
interface Post {
  id: string;
  slug: string;
  title_vi: string;
  title_en: string;
  content_vi: string;
  content_en: string;
  excerpt_vi?: string;
  excerpt_en?: string;
  publishedAt: Date;
}
```

**Alternative (nested objects):**
```typescript
interface Post {
  id: string;
  slug: string;
  translations: {
    vi: { title: string; content: string; excerpt?: string };
    en: { title: string; content: string; excerpt?: string };
  };
  publishedAt: Date;
}
```

**Recommendation:** Use `{field}_vi` / `{field}_en` pattern for simpler queries and indexing.

### i18n Implementation

**Install react-i18next:**
```bash
bun add i18next react-i18next i18next-browser-languagedetector
```

**Setup:**
```typescript
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: require('./locales/en/common.json') },
      vi: { translation: require('./locales/vi/common.json') }
    },
    fallbackLng: 'vi',
    supportedLngs: ['vi', 'en'],
    interpolation: { escapeValue: false }
  });
```

**Usage in components:**
```typescript
const { t, i18n } = useTranslation();
const currentLang = i18n.language;

// Display post content
const title = post[`title_${currentLang}`];
const content = post[`content_${currentLang}`];

// Fallback if translation missing
const safeTitle = post[`title_${currentLang}`] || post.title_vi || post.title_en;
```

### URL Strategy

**Option A: Language prefix (SEO-friendly, recommended)**
```
/vi/posts/my-post
/en/posts/my-post
```

**React Router setup:**
```typescript
<Routes>
  <Route path="/:lang/posts/:slug" element={<PostPage />} />
  <Route path="/posts/:slug" element={<PostPage />} /> {/* Fallback to default */}
</Routes>

// In component
const { lang, slug } = useParams();
const { i18n } = useTranslation();

useEffect(() => {
  if (lang && lang !== i18n.language) {
    i18n.changeLanguage(lang);
  }
}, [lang]);
```

**Option B: Query parameter (simpler routing)**
```
/posts/my-post?lang=en
/posts/my-post (defaults to Vietnamese)
```

**Language toggle component:**
```typescript
const LanguageToggle = () => {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const { lang, ...params } = useParams();

  const switchLanguage = (newLang: string) => {
    i18n.changeLanguage(newLang);
    // Update URL if using path-based routing
    navigate(`/${newLang}/${Object.values(params).join('/')}`);
  };

  return (
    <div>
      <button onClick={() => switchLanguage('vi')}>Tiếng Việt</button>
      <button onClick={() => switchLanguage('en')}>English</button>
    </div>
  );
};
```

**Recommendation:** Use language prefix in path (`/:lang/posts/:slug`) for better SEO and clearer URLs.

---

## Summary

**Package Installation:**
```bash
bun add @uiw/react-md-editor react-markdown remark-gfm react-syntax-highlighter
bun add i18next react-i18next i18next-browser-languagedetector
bun add -d @types/react-syntax-highlighter
```

**Architecture:**
1. Editor: @uiw/react-md-editor with custom image upload
2. Rendering: react-markdown + remark-gfm + react-syntax-highlighter
3. Upload: Cloudinary unsigned uploads
4. i18n: react-i18next with path-based routing (`/:lang/posts/:slug`)
5. Content: `{field}_vi` / `{field}_en` naming pattern

---

## Unresolved Questions

1. **Table of Contents generation:** Need to decide between remark-toc plugin vs manual heading extraction
2. **Image optimization strategy:** Auto-convert to WebP/AVIF on upload or serve-time transformation?
3. **Draft vs Published workflow:** Need separate fields or status enum?
4. **Slug generation:** Auto-generate from Vietnamese title or manual input required?
5. **Missing translations:** Show fallback language content or hide incomplete posts?
6. **Editor auto-save:** Local storage vs backend draft API?

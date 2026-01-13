/**
 * SEO utilities
 * Helper functions for managing meta tags and Open Graph data.
 */

interface MetaTagConfig {
  title: string;
  description: string;
  image?: string;
  url?: string;
  type?: "website" | "article";
  publishDate?: string;
  authors?: string[];
  keywords?: string[];
}

const SITE_NAME = "Dynamite Notes";
const DEFAULT_URL = "https://dynamitenotes.com";
const DEFAULT_OG_IMAGE = "https://dynamitenotes.com/og-default.png";

/**
 * Update or create meta tags in the document head
 */
export function updateMetaTags(config: MetaTagConfig): void {
  const {
    title,
    description,
    image = DEFAULT_OG_IMAGE,
    url = DEFAULT_URL,
    type = "website",
    publishDate,
    authors,
    keywords,
  } = config;

  // Update document title
  document.title = title;

  // Define all meta tags to set
  const metaTags: Record<string, string> = {
    // Basic SEO
    "description": description,
    "keywords": keywords?.join(", ") || "",

    // Open Graph
    "og:title": title,
    "og:description": description,
    "og:url": url,
    "og:type": type,
    "og:image": image,
    "og:site_name": SITE_NAME,

    // Article specific (if type is article)
    ...(type === "article" && {
      "article:published_time": publishDate || "",
      "article:author": authors?.join(", ") || "",
    }),

    // Twitter Card
    "twitter:card": "summary_large_image",
    "twitter:title": title,
    "twitter:description": description,
    "twitter:image": image,
    "twitter:site": "@dynamite",
  };

  // Apply each meta tag
  Object.entries(metaTags).forEach(([name, content]) => {
    if (!content) return; // Skip empty tags

    const isOg = name.startsWith("og:") || name.startsWith("article:") || name.startsWith("twitter:");
    const selector = isOg ? `meta[property="${name}"]` : `meta[name="${name}"]`;

    let element = document.querySelector(selector) as HTMLMetaElement | null;

    if (!element) {
      element = document.createElement("meta");
      element.setAttribute(isOg ? "property" : "name", name);
      document.head.appendChild(element);
    }

    element.setAttribute("content", content);
  });

  // Update canonical link
  let canonical = document.querySelector("link[rel='canonical']") as HTMLLinkElement | null;
  if (!canonical) {
    canonical = document.createElement("link");
    canonical.rel = "canonical";
    document.head.appendChild(canonical);
  }
  canonical.href = url;
}

/**
 * Generate meta tags config for a post
 */
export function getPostMetaConfig(post: {
  title_vi: string;
  title_en: string | null;
  excerpt_vi: string | null;
  excerpt_en: string | null;
  slug: string;
  published_at: string | null;
  cover_image?: string | null;
}, lang: "vi" | "en"): MetaTagConfig {
  const title = lang === "en" && post.title_en
    ? post.title_en
    : post.title_vi;

  const excerpt = lang === "en" && post.excerpt_en
    ? post.excerpt_en
    : post.excerpt_vi;

  return {
    title: `${title} | Dynamite Notes`,
    description: excerpt || "Build. Ship. Learn. Repeat.",
    image: post.cover_image || DEFAULT_OG_IMAGE,
    url: `${DEFAULT_URL}/posts/${post.slug}`,
    type: "article",
    publishDate: post.published_at || undefined,
    authors: ["Dynamite"],
  };
}

/**
 * Generate meta tags config for a static page
 */
export function getPageMetaConfig(
  pageTitle: string,
  description: string,
  path: string
): MetaTagConfig {
  return {
    title: `${pageTitle} | Dynamite Notes`,
    description,
    url: `${DEFAULT_URL}${path}`,
    type: "website",
  };
}

/**
 * Reset meta tags to default (homepage)
 */
export function resetMetaTags(): void {
  updateMetaTags({
    title: "Dynamite Notes - Build. Ship. Learn. Repeat.",
    description: "A personal blog about product management, engineering, and continuous learning.",
    url: DEFAULT_URL,
    type: "website",
  });
}

import { lazy, Suspense } from "react";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { BlogTitleFallback } from "./BlogTitleFallback";

// Lazy load the 3D component to minimize initial bundle impact
const BlogTitle3D = lazy(() =>
  import("./BlogTitle3D").then((m) => ({
    default: m.BlogTitle3D
  }))
);

interface BlogTitleWrapperProps {
  text?: string;
  className?: string;
}

/**
 * Wrapper component for 3D Blog Title
 *
 * Features:
 * - Lazy loads 3D component (~50KB chunk)
 * - Shows CSS fallback for prefers-reduced-motion
 * - Shows CSS fallback during lazy load (Suspense)
 * - Progressively enhances from CSS to WebGL
 */
export function BlogTitleWrapper({
  text = "Dynamite",
  className = ""
}: BlogTitleWrapperProps) {
  const reducedMotion = useReducedMotion();

  // Show CSS fallback immediately for reduced motion preference
  if (reducedMotion) {
    return <BlogTitleFallback text={text} className={className} />;
  }

  return (
    <Suspense fallback={<BlogTitleFallback text={text} className={className} />}>
      <BlogTitle3D text={text} className={className} />
    </Suspense>
  );
}

// Re-export for convenience
export { BlogTitleFallback };
export type { BlogTitle3DProps } from "./BlogTitle3D";

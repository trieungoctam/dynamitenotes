/**
 * CSS-only fallback for 3D Blog Title
 *
 * Used when:
 * - User prefers reduced motion (prefers-reduced-motion)
 * - 3D component is lazy loading
 * - WebGL not available
 *
 * Matches existing HeroScene.tsx animation patterns
 */
import './blog-title-fallback.css';

interface BlogTitleFallbackProps {
  text?: string;
  className?: string;
}

export function BlogTitleFallback({
  text = "Dynamite",
  className = ""
}: BlogTitleFallbackProps) {
  return (
    <div className={`blog-title-fallback ${className}`}>
      <div className="blog-title-text">{text}</div>
      <div className="blog-title-glow" />
    </div>
  );
}

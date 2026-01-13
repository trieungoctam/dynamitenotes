/**
 * 3D Blog Title Component
 *
 * Displays "Dynamite" in 3D using Troika-Three-Text with custom GLSL shaders.
 * Features wave distortion animation, gradient coloring, and pulse effect.
 *
 * Falls back to CSS animation for prefers-reduced-motion.
 */
import { BlogTitleWrapper } from "./BlogTitle3D";

export function Title3D() {
  return <BlogTitleWrapper text="Dynamite" className="w-full" />;
}

/**
 * 3D Blog Title Component
 *
 * Exports BlogTitleWrapper which provides:
 * - Lazy-loaded 3D text with custom GLSL shaders
 * - CSS fallback for accessibility
 * - Progressive enhancement
 *
 * Usage:
 * ```tsx
 * import { BlogTitleWrapper } from '@/components/three/BlogTitle3D';
 *
 * <BlogTitleWrapper text="Dynamite" />
 * ```
 */

export { BlogTitleWrapper } from "./BlogTitleWrapper";
export { BlogTitleFallback } from "./BlogTitleFallback";
export type { BlogTitle3DProps } from "./BlogTitle3D";

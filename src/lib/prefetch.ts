/**
 * Route prefetching utility for improved navigation performance
 * Prefetches route chunks on hover/focus to reduce perceived load times
 */

// Track prefetched routes to avoid duplicate prefetch requests
const prefetchedRoutes = new Set<string>();

/**
 * Prefetch a route's JavaScript chunk
 * Uses link rel="prefetch" for browser-level optimization
 */
export function prefetchRoute(path: string): void {
  // Skip if already prefetched
  if (prefetchedRoutes.has(path)) return;

  // Mark as prefetched immediately to prevent duplicate requests
  prefetchedRoutes.add(path);

  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = path;
  document.head.appendChild(link);
}

/**
 * Prefetch on hover with a small delay to avoid prefetching on quick mouse passes
 * Returns cleanup function for use in useEffect
 */
export function createHoverPrefetch(
  element: HTMLElement | null,
  importFn: () => Promise<unknown>
): () => void {
  if (!element) return () => {};

  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let prefetched = false;

  const handleMouseEnter = () => {
    if (prefetched) return;

    timeoutId = setTimeout(() => {
      prefetched = true;
      importFn().catch(() => {
        // Silently fail - chunk will load on navigation
      });
    }, 100); // 100ms delay to avoid prefetching on quick passes
  };

  const handleMouseLeave = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  };

  element.addEventListener('mouseenter', handleMouseEnter);
  element.addEventListener('mouseleave', handleMouseLeave);

  return () => {
    element.removeEventListener('mouseenter', handleMouseEnter);
    element.removeEventListener('mouseleave', handleMouseLeave);
    if (timeoutId) clearTimeout(timeoutId);
  };
}

/**
 * Route import functions for prefetching
 * Maps route paths to their lazy import functions
 */
export const routeImports = {
  '/': () => import('@/pages/Index'),
  '/posts': () => import('@/pages/Posts'),
  '/insights': () => import('@/pages/Insights'),
  '/series': () => import('@/pages/Series'),
  '/photos': () => import('@/pages/Photos'),
  '/resume': () => import('@/pages/Resume'),
  '/about': () => import('@/pages/About'),
  '/search': () => import('@/pages/Search'),
} as const;

/**
 * Prefetch a route by path
 * Triggers the lazy import to load the chunk ahead of navigation
 */
export function prefetchRouteByPath(path: keyof typeof routeImports): void {
  const importFn = routeImports[path];
  if (importFn) {
    importFn().catch(() => {
      // Silently fail - chunk will load on navigation
    });
  }
}

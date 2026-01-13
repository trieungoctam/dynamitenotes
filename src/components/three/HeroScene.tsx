/**
 * HeroScene - CSS-only Background with Animated Particles
 * Lightweight replacement for Three.js version
 * Respects prefers-reduced-motion for accessibility
 */

import { useEffect, useState, useMemo } from "react";

// Check for reduced motion preference
function useReducedMotion() {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  return reducedMotion;
}

// Generate random particle positions
function generateParticles(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: 2 + Math.random() * 4,
    delay: Math.random() * 8,
    duration: 15 + Math.random() * 20,
    opacity: 0.2 + Math.random() * 0.4,
  }));
}

// CSS Particle component
function Particle({
  x, y, size, delay, duration, opacity, color, reducedMotion
}: {
  x: number;
  y: number;
  size: number;
  delay: number;
  duration: number;
  opacity: number;
  color: string;
  reducedMotion: boolean;
}) {
  return (
    <div
      className="absolute rounded-full"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        width: size,
        height: size,
        backgroundColor: color,
        opacity: reducedMotion ? opacity * 0.5 : opacity,
        animation: reducedMotion
          ? "none"
          : `hero-float ${duration}s ease-in-out infinite, hero-pulse ${duration * 0.5}s ease-in-out infinite`,
        animationDelay: `${delay}s`,
      }}
    />
  );
}

export function HeroScene() {
  const reducedMotion = useReducedMotion();

  // Generate particles once
  const orangeParticles = useMemo(() => generateParticles(30), []);
  const purpleParticles = useMemo(() => generateParticles(15), []);

  return (
    <div className="absolute inset-0 -z-10 overflow-hidden">
      {/* Animated gradient background */}
      <div
        className="absolute inset-0"
        style={{
          background: reducedMotion
            ? "linear-gradient(135deg, var(--background) 0%, var(--background) 60%, hsl(var(--primary) / 0.05) 100%)"
            : undefined,
          animation: reducedMotion ? "none" : "hero-gradient 15s ease infinite",
          backgroundSize: "400% 400%",
        }}
      />

      {/* Orange particles (primary) */}
      <div className="absolute inset-0 pointer-events-none">
        {orangeParticles.map((p) => (
          <Particle
            key={`orange-${p.id}`}
            {...p}
            color="#f97316"
            reducedMotion={reducedMotion}
          />
        ))}
      </div>

      {/* Purple particles (secondary) */}
      <div className="absolute inset-0 pointer-events-none">
        {purpleParticles.map((p) => (
          <Particle
            key={`purple-${p.id}`}
            {...p}
            size={p.size * 0.8}
            opacity={p.opacity * 0.5}
            color="#a855f7"
            reducedMotion={reducedMotion}
          />
        ))}
      </div>

      {/* Gradient overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background pointer-events-none" />
    </div>
  );
}

export default HeroScene;

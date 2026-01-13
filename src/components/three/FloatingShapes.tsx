/**
 * FloatingShapes - Decorative 3D floating shapes for section backgrounds
 * Lightweight alternative to full 3D scenes for secondary sections
 * Uses CSS 3D transforms for better performance
 */

import { useEffect, useState, useRef } from "react";

interface FloatingShapesProps {
  variant?: "dots" | "rings" | "cubes";
  count?: number;
  color?: string;
  className?: string;
}

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

// Generate random positions for shapes
function generateShapes(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: 4 + Math.random() * 12,
    delay: Math.random() * 5,
    duration: 15 + Math.random() * 10,
    rotateStart: Math.random() * 360,
  }));
}

export function FloatingShapes({
  variant = "dots",
  count = 8,
  color = "currentColor",
  className = "",
}: FloatingShapesProps) {
  const reducedMotion = useReducedMotion();
  const [shapes] = useState(() => generateShapes(count));

  if (reducedMotion) {
    // Static version for reduced motion
    return (
      <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
        {shapes.slice(0, 3).map((shape) => (
          <div
            key={shape.id}
            className="absolute rounded-full opacity-10"
            style={{
              left: `${shape.x}%`,
              top: `${shape.y}%`,
              width: shape.size,
              height: shape.size,
              backgroundColor: color,
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {shapes.map((shape) => (
        <div
          key={shape.id}
          className="absolute"
          style={{
            left: `${shape.x}%`,
            top: `${shape.y}%`,
            animation: `float-${variant} ${shape.duration}s ease-in-out infinite`,
            animationDelay: `${shape.delay}s`,
          }}
        >
          {variant === "dots" && (
            <div
              className="rounded-full opacity-20"
              style={{
                width: shape.size,
                height: shape.size,
                backgroundColor: color,
                animation: `pulse-soft 3s ease-in-out infinite`,
                animationDelay: `${shape.delay}s`,
              }}
            />
          )}
          {variant === "rings" && (
            <div
              className="rounded-full border-2 opacity-15"
              style={{
                width: shape.size * 2,
                height: shape.size * 2,
                borderColor: color,
                animation: `spin-slow ${20 + shape.duration}s linear infinite`,
              }}
            />
          )}
          {variant === "cubes" && (
            <div
              className="opacity-10"
              style={{
                width: shape.size,
                height: shape.size,
                backgroundColor: color,
                transform: `rotate(${shape.rotateStart}deg)`,
                animation: `rotate-cube ${shape.duration}s linear infinite`,
              }}
            />
          )}
        </div>
      ))}
    </div>
  );
}

export default FloatingShapes;

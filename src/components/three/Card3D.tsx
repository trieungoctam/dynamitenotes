/**
 * Card3D - Interactive 3D tilt effect for cards
 * Creates a perspective tilt effect on mouse hover
 * Respects prefers-reduced-motion for accessibility
 */

import { useRef, useState, useEffect, ReactNode } from "react";

interface Card3DProps {
  children: ReactNode;
  className?: string;
  intensity?: number; // Tilt intensity (default: 10)
  glare?: boolean; // Enable glare effect
  scale?: number; // Scale on hover (default: 1.02)
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

export function Card3D({
  children,
  className = "",
  intensity = 10,
  glare = true,
  scale = 1.02,
}: Card3DProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState("");
  const [glareStyle, setGlareStyle] = useState({});
  const reducedMotion = useReducedMotion();

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (reducedMotion || !cardRef.current) return;

    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const mouseX = e.clientX - centerX;
    const mouseY = e.clientY - centerY;

    // Calculate rotation based on mouse position
    const rotateX = (mouseY / (rect.height / 2)) * -intensity;
    const rotateY = (mouseX / (rect.width / 2)) * intensity;

    setTransform(
      `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(${scale}, ${scale}, ${scale})`
    );

    // Calculate glare position
    if (glare) {
      const glareX = ((e.clientX - rect.left) / rect.width) * 100;
      const glareY = ((e.clientY - rect.top) / rect.height) * 100;
      setGlareStyle({
        background: `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255,255,255,0.15) 0%, transparent 60%)`,
        opacity: 1,
      });
    }
  };

  const handleMouseLeave = () => {
    setTransform("");
    setGlareStyle({ opacity: 0 });
  };

  return (
    <div
      ref={cardRef}
      className={`relative transition-transform duration-200 ease-out ${className}`}
      style={{
        transform: transform || "perspective(1000px) rotateX(0) rotateY(0)",
        transformStyle: "preserve-3d",
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      {/* Glare overlay */}
      {glare && !reducedMotion && (
        <div
          className="absolute inset-0 rounded-[inherit] pointer-events-none transition-opacity duration-300"
          style={glareStyle}
        />
      )}
    </div>
  );
}

export default Card3D;

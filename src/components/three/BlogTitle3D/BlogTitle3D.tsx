import { Canvas } from "@react-three/fiber";
import { PerspectiveCamera, OrbitControls } from "@react-three/drei";
import { BlogTitleText } from "./BlogTitleText";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { useIsMobile } from "@/hooks/use-mobile";

interface BlogTitle3DProps {
  text?: string;
  className?: string;
}

/**
 * 3D Blog Title Component
 *
 * Renders "Dynamite" in 3D using Troika-Three-Text with custom GLSL shaders.
 * Features:
 * - Floating/bobbing motion animation
 * - 3D depth with beveled edges
 * - Orange-purple gradient with lighting
 * - Pulse animation effect
 * - Performance optimizations (DPR limiting, quality regulation)
 * - Mobile-optimized
 *
 * Returns null for prefers-reduced-motion (handled by wrapper)
 */
export function BlogTitle3D({
  text = "Dynamite",
  className = ""
}: BlogTitle3DProps) {
  const reducedMotion = useReducedMotion();
  const isMobile = useIsMobile();

  // Early return for reduced motion - fallback handled by wrapper
  if (reducedMotion) {
    return null;
  }

  return (
    <div className={`w-full h-[400px] ${className}`}>
      <Canvas
        dpr={[1, isMobile ? 1 : 2]} // Limit pixel ratio for performance
        performance={{ min: isMobile ? 0.5 : 0.7 }} // Regulate quality on mobile
        frameloop="always"
      >
        <PerspectiveCamera
          makeDefault
          position={[0, 0, 5]}
          fov={50}
        />

        {/* Enhanced lighting for 3D depth */}
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 5, 5]} intensity={0.8} />
        <pointLight position={[-5, -5, 5]} intensity={0.5} color="#a855f7" />
        <pointLight position={[5, -5, -5]} intensity={0.3} color="#f97316" />

        <BlogTitleText text={text} isMobile={isMobile} />

        {/* Enable mouse interaction for subtle rotation */}
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          minPolarAngle={Math.PI / 2 - 0.2}
          maxPolarAngle={Math.PI / 2 + 0.2}
          minAzimuthAngle={-0.2}
          maxAzimuthAngle={0.2}
          enableDamping
          dampingFactor={0.05}
        />
      </Canvas>
    </div>
  );
}

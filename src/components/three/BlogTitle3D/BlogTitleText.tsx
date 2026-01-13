import { useRef, useMemo } from "react";
import { Text } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { vertexShader, fragmentShader } from "./shaders";

interface BlogTitleTextProps {
  text: string;
  isMobile: boolean;
}

/**
 * 3D Text mesh with custom shader material
 * Features floating motion, gradient coloring, and lighting effects
 */
export function BlogTitleText({ text, isMobile }: BlogTitleTextProps) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  // Update time uniform for smooth animation
  useFrame(({ clock }) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = clock.getElapsedTime();
    }
  });

  // Memoize material props to prevent unnecessary recreations
  const materialProps = useMemo(() => ({
    uTime: { value: 0 },
    uColor1: { value: new THREE.Color("#f97316") }, // Orange
    uColor2: { value: new THREE.Color("#a855f7") }, // Purple
  }), []);

  return (
    <Text
      fontSize={isMobile ? 0.8 : 1.2}
      anchorX="center"
      anchorY="middle"
      position={[0, 0, 0]}
      depth={0.3}  // Add 3D thickness to the text
      curveSegments={12}  // Smooth curves
      bevelEnabled={true}  // Enable bevel for 3D look
      bevelThickness={0.03}
      bevelSize={0.02}
      bevelSegments={5}
    >
      {text}
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={materialProps}
        attach="material"
      />
    </Text>
  );
}

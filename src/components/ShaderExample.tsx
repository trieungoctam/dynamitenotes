import React, { useRef } from 'react';
import { Canvas, useFrame, extend } from '@react-three/fiber';
import { OrbitControls, shaderMaterial } from '@react-three/drei';
import * as THREE from 'three';

// Define the custom shader material
const CustomShaderMaterial = shaderMaterial(
  {
    uTime: 0,
    uColor: new THREE.Color(0.8, 0.2, 0.5), // Initial color
  },
  // Vertex Shader
  /*glsl*/ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  // Fragment Shader
  /*glsl*/ `
    uniform float uTime;
    uniform vec3 uColor;
    varying vec2 vUv;
    void main() {
      vec3 color = uColor + vec3(sin(vUv.x * 10.0 + uTime) * 0.5 + 0.5, 0.0, 0.0);
      gl_FragColor = vec4(color, 1.0);
    }
  `
);

// Extend it
extend({ CustomShaderMaterial });

// TypeScript type extension for the custom material
declare global {
  namespace JSX {
    interface IntrinsicElements {
      customShaderMaterial: JSX.IntrinsicElements['shaderMaterial'] & {
        uTime?: number;
        uColor?: THREE.Color;
      };
    }
  }
}

function ShaderPlane() {
  const materialRef = useRef<THREE.ShaderMaterial>();

  useFrame((state, delta) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value += delta;
      // Example of updating color dynamically based on time
      // materialRef.current.uniforms.uColor.value.setRGB(
      //   (Math.sin(state.clock.elapsedTime * 0.5) * 0.5 + 0.5),
      //   (Math.sin(state.clock.elapsedTime * 0.8 + Math.PI / 2) * 0.5 + 0.5),
      //   (Math.sin(state.clock.elapsedTime * 1.2 + Math.PI) * 0.5 + 0.5)
      // );
    }
  });

  return (
    <mesh>
      <planeGeometry args={[2, 2, 32, 32]} />
      {/*
        The customShaderMaterial is now available as a JSX element.
        Props like uTime and uColor are passed directly as uniforms.
        The ref is used to access the material instance for dynamic updates.
      */}
      <customShaderMaterial ref={materialRef} uColor={new THREE.Color('hotpink')} />
    </mesh>
  );
}

export function ShaderExample() {
  return (
    <div style={{ height: '100vh', width: '100vw' }}>
      <Canvas camera={{ position: [0, 0, 3] }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <ShaderPlane />
        <OrbitControls />
      </Canvas>
    </div>
  );
}

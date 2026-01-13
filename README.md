# Troika Three Text Setup with React, TypeScript, and Vite

This guide outlines the steps to integrate `troika-three-text` for high-quality 3D text rendering in a React application set up with TypeScript and Vite.

## 1. Project Setup

Start by creating a new Vite project with the React and TypeScript template:

```bash
npm create vite@latest my-three-text-app -- --template react-ts
cd my-three-text-app
npm install
```

## 2. Install Dependencies

Install the necessary libraries: `three`, `@react-three/fiber`, `@react-three/drei`, and `troika-three-text`.

```bash
npm install three @react-three/fiber @react-three/drei troika-three-text
```

## 3. Basic Usage

Integrate `troika-three-text` within your `src/App.tsx` file using `@react-three/drei`'s `Text` component:

```tsx
import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import * as THREE from 'three';

function AnimatedText() {
  const textRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (textRef.current) {
      textRef.current.rotation.y = clock.getElapsedTime() * 0.5;
    }
  });

  return (
    <Text
      ref={textRef}
      position={[0, 0, 0]}
      fontSize={0.5}
      color="hotpink"
      anchorX="center"
      anchorY="middle"
    >
      Hello Troika!
      <meshBasicMaterial attach="material" color="hotpink" />
    </Text>
  );
}

function App() {
  return (
    <div style={{ width: '100vw', height: '100vh', background: '#222' }}>
      <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <AnimatedText />
        <OrbitControls />
      </Canvas>
    </div>
  );
}

export default App;
```

## 4. Run the Development Server

Execute the following command to start your development server and view the application:

```bash
npm run dev
```

This setup leverages `Canvas` from `@react-three/fiber` for scene management, `OrbitControls` from `@react-three/drei` for camera interaction, and the `Text` component from `@react-three/drei` as a wrapper for `troika-three-text`'s `TextMesh` object, simplifying 3D text integration.
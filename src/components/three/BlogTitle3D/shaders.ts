/**
 * GLSL Shaders for 3D Blog Title
 *
 * Vertex Shader: Subtle floating/bobbing motion
 * Fragment Shader: Orange-purple gradient with lighting effects
 */

export const vertexShader = `
uniform float uTime;

varying vec2 vUv;
varying vec3 vPosition;
varying vec3 vNormal;

void main() {
  vUv = uv;
  vPosition = position;
  vNormal = normal;

  // Gentle floating motion - entire text bobs up and down
  float floatOffset = sin(uTime * 0.8) * 0.05;

  // Very subtle tilt based on time
  float tiltAngle = sin(uTime * 0.5) * 0.02;

  vec3 newPos = position;
  newPos.y += floatOffset;

  // Apply subtle rotation around Y axis
  float cosT = cos(tiltAngle);
  float sinT = sin(tiltAngle);
  float x = newPos.x * cosT - newPos.z * sinT;
  float z = newPos.x * sinT + newPos.z * cosT;
  newPos.x = x;
  newPos.z = z;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(newPos, 1.0);
}
`;

export const fragmentShader = `
uniform float uTime;
uniform vec3 uColor1;  // Orange #f97316
uniform vec3 uColor2;  // Purple #a855f7

varying vec2 vUv;
varying vec3 vPosition;
varying vec3 vNormal;

void main() {
  // Create gradient based on UV coordinates
  float mixFactor = smoothstep(0.0, 1.0, vUv.x);

  // Blend between orange and purple
  vec3 baseColor = mix(uColor1, uColor2, mixFactor);

  // Add subtle pulse
  float pulse = 0.95 + 0.1 * sin(uTime * 1.0);

  // Add lighting effect based on normal (fake 3D depth)
  float lightIntensity = dot(vNormal, normalize(vec3(1.0, 1.0, 1.0))) * 0.5 + 0.5;
  float lighting = mix(0.8, 1.2, lightIntensity);

  // Combine all effects
  vec3 finalColor = baseColor * pulse * lighting;

  gl_FragColor = vec4(finalColor, 1.0);
}
`;

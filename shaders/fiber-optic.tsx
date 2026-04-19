"use client";
/**
 * FiberOpticShader — Viktor Oddy crypto hero-style fiber optic glow
 *
 * Usage:
 *   <FiberOpticShader className="absolute inset-0" color={[1, 0.3, 0.5]} />
 */
import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

const fragmentShader = `
  uniform float u_time;
  uniform vec2 u_resolution;
  uniform vec3 u_color;
  varying vec2 vUv;

  // Hash / noise helpers
  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
      mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
      u.y
    );
  }

  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 5; i++) {
      v += a * noise(p);
      p *= 2.0;
      a *= 0.5;
    }
    return v;
  }

  void main() {
    vec2 uv = vUv;
    vec2 p = uv * 2.0 - 1.0;
    p.x *= u_resolution.x / u_resolution.y;

    // Flowing fiber strands
    float t = u_time * 0.1;
    float flow1 = fbm(p * 3.0 + vec2(t, 0.0));
    float flow2 = fbm(p * 5.0 - vec2(0.0, t * 1.5));

    // Glow concentration near top-center (hero focal)
    float focal = smoothstep(1.0, 0.0, length(p - vec2(0.0, 0.6)) * 0.9);

    // Strand intensity
    float strand = pow(flow1 * flow2, 2.0) * 3.0;
    float glow = strand * focal;

    // Color: shift from warm (orange) to cool (pink/magenta) by flow
    vec3 warm = vec3(1.0, 0.4, 0.2);
    vec3 cool = vec3(0.8, 0.2, 0.6);
    vec3 color = mix(warm, cool, flow2) * u_color;

    // Final
    vec3 final = color * glow;
    final += vec3(0.02, 0.01, 0.04);    // subtle base

    gl_FragColor = vec4(final, 1.0);
  }
`;

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

function FiberOpticMesh({ color = [1.0, 0.5, 0.8] }: { color?: [number, number, number] }) {
  const mesh = useRef<THREE.Mesh>(null);
  const uniforms = useMemo(
    () => ({
      u_time: { value: 0 },
      u_resolution: { value: new THREE.Vector2(1, 1) },
      u_color: { value: new THREE.Vector3(...color) },
    }),
    [color]
  );

  useFrame((state, delta) => {
    uniforms.u_time.value += delta;
    uniforms.u_resolution.value.set(state.size.width, state.size.height);
  });

  return (
    <mesh ref={mesh}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
      />
    </mesh>
  );
}

export function FiberOpticShader({
  className = "",
  color = [1.0, 0.5, 0.8] as [number, number, number],
}: {
  className?: string;
  color?: [number, number, number];
}) {
  return (
    <div className={className}>
      <Canvas
        orthographic
        camera={{ zoom: 1, position: [0, 0, 1] }}
        gl={{ antialias: true, powerPreference: "low-power", alpha: false }}
        dpr={[1, 1.5]}
      >
        <FiberOpticMesh color={color} />
      </Canvas>
    </div>
  );
}

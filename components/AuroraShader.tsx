"use client";
/**
 * AuroraShader — WebGL fullscreen shader for AIOW hero.
 * Inspired by FWA/Awwwards organic flow shaders.
 * Renders a GPU-driven aurora with cursor interaction.
 */
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useRef, useMemo } from "react";
import * as THREE from "three";

const vertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`;

const fragment = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform float uTime;
  uniform vec2 uMouse;
  uniform vec2 uResolution;
  uniform float uIntensity;

  // Simplex-ish noise
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec3 permute(vec3 x) { return mod289(((x * 34.0) + 1.0) * x); }

  float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                       -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);
    vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod289(i);
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0))
          + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy),
                             dot(x12.zw, x12.zw)), 0.0);
    m = m * m; m = m * m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
    vec3 g;
    g.x = a0.x * x0.x + h.x * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 5; i++) {
      v += a * snoise(p);
      p *= 2.0;
      a *= 0.5;
    }
    return v;
  }

  vec3 aurora(vec2 uv, float t) {
    vec2 p = uv * 2.0 - 1.0;
    p.x *= uResolution.x / uResolution.y;

    // Mouse-influenced warp
    vec2 m = (uMouse * 2.0 - 1.0);
    m.x *= uResolution.x / uResolution.y;
    p += (m - p) * 0.08 * uIntensity;

    // Flowing field
    float n1 = fbm(p * 1.2 + vec2(t * 0.05, t * 0.03));
    float n2 = fbm(p * 0.6 - vec2(t * 0.04, -t * 0.07));
    float n3 = fbm(p * 2.2 + vec2(-t * 0.02, t * 0.06));

    float g1 = smoothstep(0.0, 1.2, n1 * 0.5 + 0.5);
    float g2 = smoothstep(0.1, 1.1, n2 * 0.5 + 0.5);
    float g3 = smoothstep(0.2, 1.0, n3 * 0.5 + 0.5);

    // Aurora palette — cyan, magenta, gold
    vec3 c1 = vec3(0.0, 0.94, 1.0) * g1;             // cyan
    vec3 c2 = vec3(1.0, 0.31, 0.85) * g2 * 0.95;     // magenta
    vec3 c3 = vec3(1.0, 0.72, 0.25) * g3 * 0.3;      // warm accent

    vec3 col = c1 + c2 * 0.6 + c3;

    // Vignette
    float vig = 1.0 - smoothstep(0.4, 1.3, length(p));
    col *= mix(0.35, 1.0, vig);

    // Scanline-ish subtle grain
    float scan = sin(uv.y * 800.0 + t * 2.0) * 0.008;
    col += scan;

    return col;
  }

  void main() {
    vec3 col = aurora(vUv, uTime);
    // deep void base
    col = mix(vec3(0.04, 0.04, 0.045), col, 0.9);
    gl_FragColor = vec4(col, 1.0);
  }
`;

function ShaderMesh({ intensity = 1.0 }: { intensity?: number }) {
  const ref = useRef<THREE.Mesh>(null);
  const { size, gl } = useThree();
  const mouse = useRef(new THREE.Vector2(0.5, 0.5));

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uResolution: { value: new THREE.Vector2(size.width, size.height) },
      uIntensity: { value: intensity },
    }),
    [size.width, size.height, intensity],
  );

  useFrame((state) => {
    uniforms.uTime.value = state.clock.elapsedTime;
    uniforms.uMouse.value.lerp(mouse.current, 0.05);
  });

  // Mouse tracking
  if (typeof window !== "undefined") {
    window.onpointermove = (e: PointerEvent) => {
      mouse.current.set(e.clientX / size.width, 1.0 - e.clientY / size.height);
    };
  }

  return (
    <mesh ref={ref}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        vertexShader={vertex}
        fragmentShader={fragment}
        uniforms={uniforms}
        depthTest={false}
        depthWrite={false}
      />
    </mesh>
  );
}

export function AuroraShader({
  className = "",
  intensity = 1.0,
}: {
  className?: string;
  intensity?: number;
}) {
  return (
    <div className={className}>
      <Canvas
        gl={{ antialias: false, powerPreference: "high-performance", alpha: false }}
        camera={{ position: [0, 0, 1] }}
        dpr={[1, 1.5]}
      >
        <ShaderMesh intensity={intensity} />
      </Canvas>
    </div>
  );
}

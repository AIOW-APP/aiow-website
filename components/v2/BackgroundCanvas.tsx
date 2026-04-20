"use client";
/**
 * BackgroundCanvas — Persistent WebGL canvas living under ALL sections.
 * A flowing gold liquid shader + particles that responds to scroll + mouse.
 * Fixed position, z-0, all content z-10+.
 */
import { useRef, useEffect, useMemo, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Sparkles, Environment } from "@react-three/drei";
import { EffectComposer, Bloom, ChromaticAberration, Vignette } from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import * as THREE from "three";

/** Flowing liquid gold shader */
const liquidVertex = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vPosition;
  void main() {
    vUv = uv;
    vPosition = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const liquidFragment = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vPosition;
  uniform float uTime;
  uniform float uScroll;
  uniform vec2 uMouse;
  uniform vec2 uRes;

  // Simplex noise
  vec3 mod289(vec3 x){return x - floor(x * (1.0 / 289.0)) * 289.0;}
  vec4 mod289(vec4 x){return x - floor(x * (1.0 / 289.0)) * 289.0;}
  vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}
  vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}
  float snoise(vec3 v) {
    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i  = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    i = mod289(i);
    vec4 p = permute(permute(permute(
              i.z + vec4(0.0, i1.z, i2.z, 1.0))
            + i.y + vec4(0.0, i1.y, i2.y, 1.0))
            + i.x + vec4(0.0, i1.x, i2.x, 1.0));
    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);
    vec4 x = x_ * ns.x + ns.yyyy;
    vec4 y = y_ * ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    vec4 s0 = floor(b0) * 2.0 + 1.0;
    vec4 s1 = floor(b1) * 2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
    p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
  }

  void main() {
    vec2 uv = vUv;
    float t = uTime * 0.08;

    // Multi-octave noise flow
    float n1 = snoise(vec3(uv * 2.5, t)) * 0.5;
    float n2 = snoise(vec3(uv * 5.0, t * 1.3)) * 0.25;
    float n3 = snoise(vec3(uv * 10.0, t * 1.8)) * 0.125;
    float n = n1 + n2 + n3;

    // Scroll bends the flow
    n += sin(uv.y * 3.14 + uScroll * 6.28) * 0.15;

    // Mouse pulls flow
    float md = length(uv - uMouse) * 2.0;
    n += smoothstep(0.6, 0.0, md) * 0.2;

    // 3-color gradient by noise value
    vec3 c1 = vec3(0.05, 0.02, 0.1);      // deep space
    vec3 c2 = vec3(0.45, 0.15, 0.55);     // royal magenta #731F9E
    vec3 c3 = vec3(1.0, 0.72, 0.12);      // gold #FFB820
    vec3 c4 = vec3(1.0, 0.31, 0.85);      // hyper pink #FF4FD8

    vec3 col = c1;
    col = mix(col, c2, smoothstep(-0.3, 0.3, n));
    col = mix(col, c3, smoothstep(0.25, 0.55, n));
    col = mix(col, c4, smoothstep(0.55, 0.75, n));

    // Vignette
    float vig = 1.0 - smoothstep(0.5, 1.4, length(uv - 0.5));
    col *= mix(0.5, 1.0, vig);

    // Film grain
    float grain = fract(sin(dot(uv * uRes, vec2(12.9898, 78.233)) + uTime) * 43758.5453);
    col += (grain - 0.5) * 0.02;

    gl_FragColor = vec4(col, 1.0);
  }
`;

function LiquidPlane() {
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const { size } = useThree();
  const scrollRef = useRef(0);
  const mouseRef = useRef({ x: 0.5, y: 0.5 });

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uScroll: { value: 0 },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uRes: { value: new THREE.Vector2(size.width, size.height) },
    }),
    [size.width, size.height]
  );

  useEffect(() => {
    function onScroll() {
      scrollRef.current =
        window.scrollY / Math.max(1, document.body.scrollHeight - window.innerHeight);
    }
    function onMove(e: MouseEvent) {
      mouseRef.current = { x: e.clientX / window.innerWidth, y: 1 - e.clientY / window.innerHeight };
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("mousemove", onMove);
    };
  }, []);

  useFrame(({ clock }) => {
    if (!matRef.current) return;
    matRef.current.uniforms.uTime.value = clock.getElapsedTime();
    // Smooth follow
    const tgtScroll = scrollRef.current;
    matRef.current.uniforms.uScroll.value +=
      (tgtScroll - matRef.current.uniforms.uScroll.value) * 0.08;
    const m = matRef.current.uniforms.uMouse.value as THREE.Vector2;
    m.x += (mouseRef.current.x - m.x) * 0.04;
    m.y += (mouseRef.current.y - m.y) * 0.04;
  });

  return (
    <mesh position={[0, 0, -5]}>
      <planeGeometry args={[30, 20]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={liquidVertex}
        fragmentShader={liquidFragment}
        uniforms={uniforms}
      />
    </mesh>
  );
}

/** Floating metallic gold rings */
function MetaObjects() {
  const group = useRef<THREE.Group>(null);
  useFrame(({ clock, mouse }) => {
    if (!group.current) return;
    const t = clock.getElapsedTime();
    group.current.rotation.y = t * 0.05 + mouse.x * 0.2;
    group.current.rotation.x = mouse.y * 0.1;
  });
  return (
    <group ref={group}>
      <mesh position={[3, 0.5, -2]}>
        <torusGeometry args={[0.8, 0.04, 32, 100]} />
        <meshStandardMaterial color="#FFB820" metalness={1} roughness={0.1} />
      </mesh>
      <mesh position={[-3.5, -0.8, -1]} rotation={[0.5, 0.8, 0]}>
        <torusGeometry args={[1.1, 0.03, 32, 100]} />
        <meshStandardMaterial color="#FF4FD8" metalness={1} roughness={0.15} />
      </mesh>
      <mesh position={[0, -2.5, -3]} rotation={[1.2, 0, 0.3]}>
        <torusGeometry args={[1.6, 0.025, 32, 100]} />
        <meshStandardMaterial color="#B845FF" metalness={1} roughness={0.12} />
      </mesh>
    </group>
  );
}

export function BackgroundCanvas() {
  return (
    <div
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
      aria-hidden
    >
      <Canvas
        dpr={[1, 1.6]}
        camera={{ position: [0, 0, 4], fov: 50 }}
        gl={{ antialias: true, alpha: false }}
      >
        <color attach="background" args={["#050210"]} />
        <ambientLight intensity={0.3} />
        <pointLight position={[3, 3, 3]} intensity={1.5} color="#FFB820" />
        <pointLight position={[-3, -2, 2]} intensity={1.2} color="#FF4FD8" />

        <Suspense fallback={null}>
          <LiquidPlane />
          <MetaObjects />
          <Sparkles count={100} scale={[14, 8, 6]} size={2} speed={0.15} color="#FFB820" />
          <Environment preset="night" />

          <EffectComposer>
            <Bloom intensity={0.55} luminanceThreshold={0.35} luminanceSmoothing={0.75} mipmapBlur />
            <ChromaticAberration blendFunction={BlendFunction.NORMAL} offset={[0.0004, 0.0008]} />
            <Vignette darkness={0.55} offset={0.25} />
          </EffectComposer>
        </Suspense>
      </Canvas>
    </div>
  );
}

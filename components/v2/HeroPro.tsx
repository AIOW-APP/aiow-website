"use client";
/**
 * HeroPro — dark cinematic 3D hero with abstract gold/purple flowing geometry.
 * Inspired by Linear.app, Framer, Vercel Ship.
 * No mascot. AIOW brand = the hero.
 */
import { Suspense, useRef, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  Environment,
  Text3D,
  Center,
  MeshTransmissionMaterial,
  Sparkles,
} from "@react-three/drei";
import { EffectComposer, Bloom, Vignette, ChromaticAberration } from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import * as THREE from "three";

/** Architectural gold torus knot — the centerpiece */
function GoldKnot() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock, mouse }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();
    ref.current.rotation.y = t * 0.15 + mouse.x * 0.15;
    ref.current.rotation.x = t * 0.08 + mouse.y * 0.1;
  });
  return (
    <mesh ref={ref} position={[0, 0, 0]} castShadow>
      <torusKnotGeometry args={[1.4, 0.35, 256, 48, 2, 3]} />
      <meshStandardMaterial
        color="#FFB820"
        metalness={1}
        roughness={0.08}
        emissive="#FF8A00"
        emissiveIntensity={0.15}
        envMapIntensity={2.5}
      />
    </mesh>
  );
}

/** Glass sphere that refracts the knot */
function GlassOrb({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();
    ref.current.position.y = position[1] + Math.sin(t * 0.7 + position[0]) * 0.2;
  });
  return (
    <mesh ref={ref} position={position} scale={scale}>
      <sphereGeometry args={[0.5, 64, 64]} />
      <MeshTransmissionMaterial
        thickness={0.4}
        roughness={0.02}
        transmission={1}
        ior={1.5}
        chromaticAberration={0.06}
        backside
        color="#ffffff"
      />
    </mesh>
  );
}

/** Flowing data particles — GPU instanced */
function DataStreams({ count = 300 }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const particles = useMemo(() => {
    const arr = [];
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 2.5 + Math.random() * 5;
      arr.push({
        angle,
        radius,
        y: (Math.random() - 0.5) * 6,
        speed: 0.1 + Math.random() * 0.3,
        hue: Math.random() > 0.6 ? "#FFB820" : Math.random() > 0.5 ? "#B845FF" : "#FF4FD8",
      });
    }
    return arr;
  }, [count]);

  const tmp = useMemo(() => new THREE.Object3D(), []);
  const col = useMemo(() => new THREE.Color(), []);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();
    particles.forEach((p, i) => {
      const a = p.angle + t * p.speed;
      tmp.position.set(
        Math.cos(a) * p.radius,
        p.y + Math.sin(t * 0.5 + i) * 0.3,
        Math.sin(a) * p.radius
      );
      tmp.scale.setScalar(0.03 + Math.sin(t * 2 + i) * 0.015);
      tmp.updateMatrix();
      ref.current!.setMatrixAt(i, tmp.matrix);
      col.set(p.hue);
      ref.current!.setColorAt(i, col);
    });
    ref.current.instanceMatrix.needsUpdate = true;
    if (ref.current.instanceColor) ref.current.instanceColor.needsUpdate = true;
  });

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, count]}>
      <sphereGeometry args={[1, 8, 8]} />
      <meshStandardMaterial
        metalness={0.4}
        roughness={0.15}
        emissive="#ffffff"
        emissiveIntensity={1.2}
        toneMapped={false}
      />
    </instancedMesh>
  );
}

/** Big AIOW letters behind scene */
function AiowText() {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock, mouse }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();
    ref.current.rotation.y = mouse.x * 0.05;
    ref.current.position.y = 1.2 + Math.sin(t * 0.4) * 0.08;
  });
  return (
    <group ref={ref} position={[0, 1.2, -4]}>
      <Center>
        <Text3D
          font="/fonts/helvetiker_bold.typeface.json"
          size={2}
          height={0.25}
          curveSegments={16}
          bevelEnabled
          bevelSize={0.03}
          bevelThickness={0.04}
          bevelSegments={8}
        >
          AIOW
          <meshStandardMaterial
            color="#2a1847"
            metalness={0.95}
            roughness={0.25}
            emissive="#B845FF"
            emissiveIntensity={0.08}
          />
        </Text3D>
      </Center>
    </group>
  );
}

function CameraRig() {
  const { camera, mouse } = useThree();
  useFrame(() => {
    camera.position.x += (mouse.x * 1.8 - camera.position.x) * 0.03;
    camera.position.y += (-mouse.y * 0.8 + 0.3 - camera.position.y) * 0.03;
    camera.lookAt(0, 0, 0);
  });
  return null;
}

export function HeroPro() {
  return (
    <section
      className="relative h-screen w-full overflow-hidden"
      style={{
        background:
          "radial-gradient(ellipse at 50% 40%, #1a0b2e 0%, #0A0618 60%, #050210 100%)",
      }}
    >
      <Canvas
        dpr={[1, 2]}
        camera={{ position: [0, 0.3, 6], fov: 38 }}
        style={{ position: "absolute", inset: 0 }}
        gl={{ antialias: true, alpha: true }}
      >
        <fog attach="fog" args={["#0A0618", 9, 22]} />

        <ambientLight intensity={0.15} />
        <directionalLight position={[5, 6, 5]} intensity={1.6} color="#FFB820" />
        <pointLight position={[-5, 2, 3]} intensity={3} color="#FF4FD8" />
        <pointLight position={[5, -2, 2]} intensity={2.2} color="#B845FF" />
        <spotLight position={[0, 6, 3]} intensity={2.5} angle={0.4} penumbra={0.9} color="#ffffff" />

        <Suspense fallback={null}>
          <Environment preset="night" />
          <AiowText />
          <GoldKnot />
          <GlassOrb position={[-2.4, 0.6, 0.5]} scale={0.9} />
          <GlassOrb position={[2.5, -0.4, 0.8]} scale={1.1} />
          <GlassOrb position={[0.2, -1.6, 1.8]} scale={0.6} />
          <DataStreams count={400} />
          <Sparkles count={200} scale={[16, 10, 10]} size={2.5} speed={0.2} color="#FFB820" />
          <CameraRig />

          <EffectComposer>
            <Bloom intensity={1.2} luminanceThreshold={0.12} luminanceSmoothing={0.8} mipmapBlur />
            <ChromaticAberration blendFunction={BlendFunction.NORMAL} offset={[0.0006, 0.0012]} />
            <Vignette darkness={0.7} offset={0.2} />
          </EffectComposer>
        </Suspense>
      </Canvas>

      {/* Text overlay — left-aligned, editorial */}
      <div className="absolute inset-0 pointer-events-none flex items-center z-10">
        <div className="container-wide">
          <div className="max-w-xl pointer-events-auto">
            <p className="font-mono text-[0.7rem] md:text-xs uppercase tracking-[0.35em] text-[#FFB820]/90 mb-6">
              AIOW · AI-transformatie voor MKB
            </p>
            <h1
              className="font-display font-medium text-white leading-[0.95] tracking-tight"
              style={{ fontSize: "clamp(2.75rem, 6.5vw, 5.75rem)" }}
            >
              Van chaos<br />
              naar <span
                className="bg-clip-text text-transparent"
                style={{ backgroundImage: "linear-gradient(120deg,#FFB820 0%,#FF4FD8 60%,#B845FF 100%)" }}
              >
                compounding.
              </span>
            </h1>
            <p className="mt-6 text-white/60 text-base md:text-lg max-w-md leading-relaxed">
              Eén partner. Van strategie tot operationele AI-implementatie. Voor Nederlandse bedrijven die niet willen wachten.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <a
                href="#scan"
                className="group px-7 py-3.5 rounded-full font-medium text-sm tracking-wide"
                style={{
                  background: "linear-gradient(135deg,#FFB820 0%,#FF8A00 100%)",
                  color: "#14071F",
                  boxShadow: "0 10px 40px rgba(255,184,32,0.3)",
                }}
              >
                Start de AI-scan
                <span className="inline-block ml-2 group-hover:translate-x-1 transition-transform">→</span>
              </a>
              <a
                href="#approach"
                className="text-white/70 hover:text-white text-sm font-medium tracking-wide border-b border-white/20 hover:border-white/60 pb-0.5"
              >
                Bekijk de aanpak
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Corner marks */}
      <div className="absolute top-6 left-6 md:top-8 md:left-8 flex items-center gap-2.5 z-10">
        <div className="w-2 h-2 rounded-full bg-[#FFB820] animate-pulse" />
        <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/60">
          Live · NL
        </span>
      </div>
      <div className="absolute top-6 right-6 md:top-8 md:right-8 font-mono text-[10px] uppercase tracking-[0.3em] text-white/50 z-10">
        v3.0
      </div>
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/25 text-[10px] font-mono tracking-[0.3em] uppercase z-10 animate-pulse">
        ↓ Scroll
      </div>
    </section>
  );
}

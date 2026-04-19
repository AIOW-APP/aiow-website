"use client";
/**
 * Hero3D — React Three Fiber scene with Spunky GLB + AIOW letters + particles + bloom.
 * This is the V3 centerpiece: interactive 3D, camera parallax, post-processing.
 */
import { Suspense, useRef, useMemo, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  Environment,
  Float,
  useGLTF,
  Text3D,
  Center,
  MeshReflectorMaterial,
  Sparkles,
  useProgress,
} from "@react-three/drei";
import { EffectComposer, Bloom, ChromaticAberration, Vignette } from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import * as THREE from "three";

useGLTF.preload("/spunky/spunky.glb");

function Spunky({ scale = 2, position = [0, -0.5, 0] as [number, number, number] }) {
  const { scene } = useGLTF("/spunky/spunky.glb");
  const ref = useRef<THREE.Group>(null);
  const { mouse, clock } = useThree();

  // Enhance materials
  useMemo(() => {
    scene.traverse((obj: any) => {
      if (obj.isMesh) {
        obj.castShadow = true;
        obj.receiveShadow = true;
        if (obj.material) {
          obj.material.envMapIntensity = 1.6;
          obj.material.metalness = Math.min((obj.material.metalness ?? 0) + 0.1, 0.4);
          obj.material.roughness = Math.max((obj.material.roughness ?? 0.5) - 0.1, 0.15);
          obj.material.needsUpdate = true;
        }
      }
    });
  }, [scene]);

  useFrame(() => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();
    // idle sway
    ref.current.rotation.y = Math.sin(t * 0.4) * 0.15 + mouse.x * 0.4;
    ref.current.rotation.x = mouse.y * 0.15;
    ref.current.position.y = position[1] + Math.sin(t * 1.2) * 0.06;
  });

  return (
    <group ref={ref} position={position} scale={scale}>
      <primitive object={scene} />
    </group>
  );
}

function GoldCubes({ count = 60 }) {
  const group = useRef<THREE.Group>(null);
  const cubes = useMemo(() => {
    const arr = [];
    for (let i = 0; i < count; i++) {
      arr.push({
        pos: [
          (Math.random() - 0.5) * 16,
          (Math.random() - 0.5) * 10,
          (Math.random() - 0.5) * 10 - 3,
        ] as [number, number, number],
        scale: 0.08 + Math.random() * 0.35,
        speed: 0.3 + Math.random() * 0.8,
        rotSpeed: 0.3 + Math.random() * 0.6,
        phase: Math.random() * Math.PI * 2,
        hue: Math.random() > 0.5 ? "#FFB820" : Math.random() > 0.5 ? "#FF4FD8" : "#B845FF",
      });
    }
    return arr;
  }, [count]);

  useFrame(({ clock }) => {
    if (!group.current) return;
    const t = clock.getElapsedTime();
    group.current.children.forEach((c, i) => {
      const cfg = cubes[i];
      c.position.y = cfg.pos[1] + Math.sin(t * cfg.speed + cfg.phase) * 0.6;
      c.rotation.x = t * cfg.rotSpeed;
      c.rotation.y = t * cfg.rotSpeed * 0.7;
    });
  });

  return (
    <group ref={group}>
      {cubes.map((c, i) => (
        <mesh key={i} position={c.pos} scale={c.scale}>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial
            color={c.hue}
            metalness={0.9}
            roughness={0.1}
            emissive={c.hue}
            emissiveIntensity={0.4}
          />
        </mesh>
      ))}
    </group>
  );
}

function AiowLetters() {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock, mouse }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();
    ref.current.rotation.y = Math.sin(t * 0.3) * 0.08 + mouse.x * 0.1;
    ref.current.position.y = 2 + Math.sin(t * 0.6) * 0.1;
  });
  return (
    <group ref={ref} position={[0, 2, -2]}>
      <Center>
        <Text3D
          font="/fonts/helvetiker_bold.typeface.json"
          size={1.2}
          height={0.35}
          curveSegments={12}
          bevelEnabled
          bevelSize={0.04}
          bevelThickness={0.05}
          bevelSegments={6}
        >
          AIOW
          <meshStandardMaterial
            color="#FFB820"
            metalness={1}
            roughness={0.05}
            emissive="#FF8A00"
            emissiveIntensity={0.25}
          />
        </Text3D>
      </Center>
    </group>
  );
}

function Loader() {
  const { progress } = useProgress();
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-[#06020D] z-50">
      <div className="text-center">
        <div className="font-mono text-xs uppercase tracking-[0.3em] text-[#FFB820] mb-3">
          Spunky wordt wakker
        </div>
        <div className="w-48 h-1 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full transition-all duration-300"
            style={{
              width: `${progress}%`,
              background: "linear-gradient(90deg,#FFB820,#FF4FD8)",
            }}
          />
        </div>
        <div className="text-white/40 text-xs mt-2">{Math.round(progress)}%</div>
      </div>
    </div>
  );
}

function CameraRig() {
  const { camera, mouse } = useThree();
  useFrame(() => {
    camera.position.x += (mouse.x * 1.2 - camera.position.x) * 0.04;
    camera.position.y += (-mouse.y * 0.6 + 0.5 - camera.position.y) * 0.04;
    camera.lookAt(0, 0.5, 0);
  });
  return null;
}

export function Hero3D() {
  return (
    <section className="relative h-screen w-full overflow-hidden" style={{ background: "#06020D" }}>
      {/* 3D canvas */}
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{ position: [0, 1, 6], fov: 45 }}
        style={{ position: "absolute", inset: 0 }}
      >
        <color attach="background" args={["#0A0618"]} />
        <fog attach="fog" args={["#0A0618", 8, 22]} />

        <ambientLight intensity={0.3} />
        <directionalLight
          position={[5, 8, 5]}
          intensity={2.2}
          color="#FFB820"
          castShadow
          shadow-mapSize={[2048, 2048]}
        />
        <pointLight position={[-4, 3, 3]} intensity={2} color="#FF4FD8" />
        <pointLight position={[4, -2, 2]} intensity={1.4} color="#B845FF" />
        <spotLight
          position={[0, 6, 3]}
          intensity={3}
          angle={0.5}
          penumbra={0.8}
          color="#ffffff"
        />

        <Suspense fallback={null}>
          <Environment preset="city" />

          <AiowLetters />
          <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.4}>
            <Spunky scale={1.6} position={[0, -0.3, 0]} />
          </Float>

          <GoldCubes count={50} />

          <Sparkles count={150} scale={[14, 8, 8]} size={2} speed={0.3} color="#FFB820" />

          {/* Reflective floor */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.6, 0]} receiveShadow>
            <planeGeometry args={[40, 40]} />
            <MeshReflectorMaterial
              mirror={0}
              blur={[300, 100]}
              resolution={1024}
              mixBlur={1}
              mixStrength={2}
              roughness={0.8}
              depthScale={1}
              minDepthThreshold={0.4}
              maxDepthThreshold={1.4}
              color="#1a0b2e"
              metalness={0.6}
            />
          </mesh>

          <CameraRig />

          <EffectComposer>
            <Bloom
              intensity={0.9}
              luminanceThreshold={0.15}
              luminanceSmoothing={0.7}
              mipmapBlur
            />
            <ChromaticAberration
              blendFunction={BlendFunction.NORMAL}
              offset={[0.0005, 0.001]}
            />
            <Vignette darkness={0.5} offset={0.2} />
          </EffectComposer>
        </Suspense>
      </Canvas>

      {/* Text overlay */}
      <div className="absolute inset-0 pointer-events-none flex flex-col justify-end pb-20 z-10">
        <div className="container-wide">
          <div className="pointer-events-auto max-w-2xl">
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-[#FFB820] mb-4">
              — AI-transformatie voor Nederlandse MKB
            </p>
            <h1
              className="font-display font-medium text-white leading-[0.95] tracking-tight"
              style={{ fontSize: "clamp(3rem, 8vw, 7rem)" }}
            >
              Dit is{" "}
              <span
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage: "linear-gradient(120deg, #FFB820, #FF4FD8, #B845FF)",
                }}
              >
                Spunky.
              </span>
            </h1>
            <p className="mt-6 text-white/70 text-lg md:text-xl max-w-xl">
              Onze AI-kameleon kent jouw bedrijf in 5 minuten.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#scan"
                className="px-7 py-3.5 rounded-full font-medium"
                style={{
                  background: "linear-gradient(135deg,#FFB820,#FF8A00)",
                  color: "#14071F",
                  boxShadow: "0 12px 40px rgba(255,184,32,0.4)",
                }}
              >
                Chat met Spunky →
              </a>
              <a
                href="#journey"
                className="px-7 py-3.5 rounded-full font-medium text-white/80 border border-white/20 hover:border-white/50"
              >
                Zie hoe 't werkt
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll hint */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/30 text-xs font-mono tracking-widest uppercase animate-pulse z-10">
        ↓ ontdek
      </div>
    </section>
  );
}

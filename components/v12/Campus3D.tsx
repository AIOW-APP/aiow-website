"use client";
import { useRef, useState, useMemo, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Text, useTexture, Stars, Float } from "@react-three/drei";
import * as THREE from "three";
import { useRouter } from "next/navigation";
import { CAPABILITIES, Capability } from "@/core/content/capabilities";
import { useLang, LangToggle } from "@/components/v12/LangContext";

function BuildingNode({
  cap, position, rotation, onFocus, focused, anyFocused, lang,
}: {
  cap: Capability;
  position: [number, number, number];
  rotation: [number, number, number];
  onFocus: (id: string) => void;
  focused: boolean;
  anyFocused: boolean;
  lang: "nl" | "en";
}) {
  const groupRef = useRef<THREE.Group>(null!);
  const [hovered, setHovered] = useState(false);
  const texture = useTexture(cap.buildingImage);

  useFrame((state) => {
    if (!groupRef.current) return;
    groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.8 + position[0]) * 0.08;
  });

  const dim = anyFocused && !focused;
  const active = hovered || focused;

  return (
    <group
      ref={groupRef}
      position={position}
      rotation={rotation}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = "pointer"; }}
      onPointerOut={() => { setHovered(false); document.body.style.cursor = "default"; }}
      onClick={(e) => { e.stopPropagation(); onFocus(cap.id); }}
    >
      <mesh position={[0, 0, -0.05]} scale={active ? 1.35 : 1.15}>
        <planeGeometry args={[2.6, 1.8]} />
        <meshBasicMaterial color={active ? "#FFB820" : "#4FC3F7"} transparent opacity={active ? 0.35 : 0.12} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <mesh>
        <planeGeometry args={[2.2, 1.47]} />
        <meshStandardMaterial map={texture} transparent opacity={dim ? 0.3 : 1} emissive={active ? "#FFB820" : "#000000"} emissiveIntensity={active ? 0.15 : 0} />
      </mesh>
      <mesh>
        <boxGeometry args={[2.25, 1.52, 0.04]} />
        <meshPhysicalMaterial color="#ffffff" metalness={0.9} roughness={0.1} transmission={0.85} thickness={0.5} ior={1.4} transparent opacity={0.3} />
      </mesh>
      <group position={[0, -1.15, 0.1]}>
        <mesh>
          <planeGeometry args={[2.4, 0.5]} />
          <meshBasicMaterial color="#0A0618" transparent opacity={0.75} />
        </mesh>
        <Text position={[0, 0.08, 0.02]} fontSize={0.18} color={active ? "#FFB820" : "#FFFFFF"} anchorX="center" anchorY="middle" outlineWidth={0.005} outlineColor="#000000">
          {cap.emoji}  {cap.label[lang]}
        </Text>
        <Text position={[0, -0.13, 0.02]} fontSize={0.09} color="#B0B0D0" anchorX="center" anchorY="middle" maxWidth={2.2}>
          {cap.tagline[lang]}
        </Text>
      </group>
    </group>
  );
}

function Core() {
  const ref = useRef<THREE.Mesh>(null!);
  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.y = state.clock.elapsedTime * 0.3;
    const s = 1 + Math.sin(state.clock.elapsedTime * 1.2) * 0.05;
    ref.current.scale.set(s, s, s);
  });
  return (
    <group>
      <mesh ref={ref}>
        <icosahedronGeometry args={[0.8, 2]} />
        <meshStandardMaterial color="#FFB820" emissive="#FFB820" emissiveIntensity={2} transparent opacity={0.7} wireframe />
      </mesh>
      <pointLight color="#FFB820" intensity={3} distance={12} />
      <mesh>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshStandardMaterial color="#FF4FD8" emissive="#FF4FD8" emissiveIntensity={1.5} transparent opacity={0.5} />
      </mesh>
    </group>
  );
}

function CameraRig({ focused }: { focused: string | null }) {
  const { camera } = useThree();
  const targetPos = useRef(new THREE.Vector3(0, 0.5, 8));
  const lookAt = useRef(new THREE.Vector3(0, 0, 0));
  useFrame((state) => {
    if (focused) {
      const idx = CAPABILITIES.findIndex((c) => c.id === focused);
      if (idx >= 0) {
        const angle = (idx / CAPABILITIES.length) * Math.PI * 2 - Math.PI / 2;
        const r = 4.5;
        const tx = Math.cos(angle) * r, tz = Math.sin(angle) * r;
        const cx = Math.cos(angle) * (r - 2.5), cz = Math.sin(angle) * (r - 2.5);
        targetPos.current.set(cx, 0.2, cz);
        lookAt.current.set(tx, 0, tz);
      }
    } else {
      const mx = state.mouse.x * 0.8, my = state.mouse.y * 0.4;
      targetPos.current.set(mx, 0.5 + my, 8);
      lookAt.current.set(0, 0, 0);
    }
    camera.position.lerp(targetPos.current, 0.05);
    camera.lookAt(lookAt.current);
  });
  return null;
}

function Scene({ focused, setFocused, lang }: { focused: string | null; setFocused: (id: string | null) => void; lang: "nl" | "en" }) {
  const positions = useMemo(() => {
    const r = 4.5;
    return CAPABILITIES.map((_, i) => {
      const angle = (i / CAPABILITIES.length) * Math.PI * 2 - Math.PI / 2;
      return {
        pos: [Math.cos(angle) * r, 0, Math.sin(angle) * r] as [number, number, number],
        rot: [0, -angle - Math.PI / 2, 0] as [number, number, number],
      };
    });
  }, []);
  return (
    <>
      <color attach="background" args={["#0A0618"]} />
      <fog attach="fog" args={["#0A0618", 8, 25]} />
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 5, 5]} intensity={0.6} />
      <Stars radius={100} depth={50} count={3000} factor={3} saturation={0} fade speed={0.5} />
      <Core />
      {CAPABILITIES.map((cap, i) => (
        <Float key={cap.id} speed={1.2} rotationIntensity={0} floatIntensity={0.3}>
          <BuildingNode cap={cap} position={positions[i].pos} rotation={positions[i].rot} onFocus={setFocused} focused={focused === cap.id} anyFocused={!!focused} lang={lang} />
        </Float>
      ))}
      <CameraRig focused={focused} />
    </>
  );
}

export default function Campus3D() {
  const [focused, setFocused] = useState<string | null>(null);
  const router = useRouter();
  const { lang, t } = useLang();
  const focusedCap = focused ? CAPABILITIES.find((c) => c.id === focused) : null;

  return (
    <div className="fixed inset-0 bg-[#0A0618]">
      <Canvas camera={{ position: [0, 0.5, 8], fov: 55 }} gl={{ antialias: true, alpha: false }} dpr={[1, 2]}>
        <Suspense fallback={null}>
          <Scene focused={focused} setFocused={setFocused} lang={lang} />
        </Suspense>
      </Canvas>

      {/* AIOW wordmark top-left */}
      <div className="absolute top-5 left-6 z-10 flex items-center gap-2 pointer-events-none select-none">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#FFB820] to-[#FF4FD8] flex items-center justify-center text-[#0A0618] font-black">A</div>
        <div className="flex flex-col">
          <span className="text-xl font-black tracking-tight bg-gradient-to-r from-[#FFB820] via-[#FF4FD8] to-[#4FC3F7] bg-clip-text text-transparent leading-none">AIOW</span>
          <span className="text-[9px] uppercase tracking-[0.3em] text-white/40 leading-none mt-1">{t("tagline")}</span>
        </div>
      </div>

      {/* Lang toggle top-right */}
      <div className="absolute top-5 right-6 z-10">
        <LangToggle />
      </div>

      {/* Idle hint */}
      {!focused && (
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-center pointer-events-none z-10 px-4">
          <div className="text-[10px] uppercase tracking-[0.3em] text-white/40 mb-2">{t("hint_label")}</div>
          <div className="text-white/80 text-sm sm:text-base">{t("hint_sub")}</div>
        </div>
      )}

      {/* Focused panel */}
      {focusedCap && (
        <div className="absolute inset-x-4 bottom-5 sm:inset-x-auto sm:right-6 sm:bottom-6 sm:max-w-md z-20">
          <div className="rounded-2xl ring-1 ring-white/15 bg-black/70 backdrop-blur-xl p-5 text-white shadow-2xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-3xl">{focusedCap.emoji}</div>
                <h2 className="text-2xl font-bold mt-1 bg-gradient-to-r from-[#FFB820] via-[#FF4FD8] to-[#4FC3F7] bg-clip-text text-transparent">
                  {focusedCap.label[lang]}
                </h2>
                <p className="text-sm text-white/70 mt-1">{focusedCap.tagline[lang]}</p>
              </div>
              <button onClick={() => setFocused(null)} className="text-white/50 hover:text-white text-xl leading-none" aria-label={t("close")}>✕</button>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {focusedCap.rooms.map((r) => (
                <div key={r.id} className="rounded-lg ring-1 ring-white/10 bg-white/5 px-3 py-2">
                  <div className="text-xs text-white/90 font-medium">{r.emoji} {r.title[lang]}</div>
                  <div className="text-[10px] text-white/50 mt-0.5">{t("priceFromLabel")} {r.priceFrom[lang]}</div>
                </div>
              ))}
            </div>
            <button onClick={() => router.push(`/h/${focusedCap.id}`)} className="mt-4 w-full px-4 py-2.5 rounded-full bg-gradient-to-r from-[#FFB820] to-[#FF4FD8] text-[#0A0618] font-semibold text-sm hover:scale-[1.02] transition-transform">
              {t("enterHouse")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

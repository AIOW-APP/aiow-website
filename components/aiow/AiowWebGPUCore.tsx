"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./AiowWebGPUCore.module.css";

type Lang = "nl" | "en";

type ThreeWebGPU = typeof import("three/webgpu");

type CoreStatus = "checking" | "webgpu" | "fallback";

const copy = {
  nl: {
    badge: "WebGPU + WASM physics",
    title: "Control Room",
    subtitle: "Zie hoe data, beleid en agents gecontroleerd samenkomen — scroll en cursor sturen de laag.",
    fallback: "Canvas fallback actief",
    stages: [
      "AI-chaos wordt zichtbaar",
      "Datagrenzen worden bepaald",
      "Beleid stuurt de route",
      "Agents voeren werk uit",
      "Rust, snelheid en controle",
    ],
  },
  en: {
    badge: "WebGPU + WASM physics",
    title: "Control Room",
    subtitle: "See data, policy and agents come together under control — scroll and cursor drive the layer.",
    fallback: "Canvas fallback active",
    stages: [
      "AI chaos becomes visible",
      "Data boundaries are defined",
      "Policy controls the route",
      "Agents execute the work",
      "Calm, speed and control",
    ],
  },
} as const;

function makeTextTexture(label: string, W: ThreeWebGPU, dark: boolean) {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 192;
  const ctx = canvas.getContext("2d")!;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = dark ? "rgba(12,14,12,.72)" : "rgba(250,244,232,.78)";
  ctx.strokeStyle = dark ? "rgba(119,217,170,.42)" : "rgba(31,122,91,.34)";
  ctx.lineWidth = 4;
  const r = 58;
  ctx.beginPath();
  ctx.moveTo(r, 18);
  ctx.arcTo(494, 18, 494, 174, r);
  ctx.arcTo(494, 174, 18, 174, r);
  ctx.arcTo(18, 174, 18, 18, r);
  ctx.arcTo(18, 18, 494, 18, r);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = dark ? "#f8f2e8" : "#11130f";
  ctx.font = "900 54px Inter, Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(label, 256, 98);
  const texture = new W.CanvasTexture(canvas);
  texture.colorSpace = W.SRGBColorSpace;
  return texture;
}

export function AiowWebGPUCore({ lang = "nl" }: { lang?: Lang }) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const progressRef = useRef({ value: 0, stage: 0 });
  const activeRef = useRef(false);
  const [shouldInit, setShouldInit] = useState(false);
  const [status, setStatus] = useState<CoreStatus>("checking");
  const [stage, setStage] = useState(0);
  const text = copy[lang];

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    if (!("IntersectionObserver" in window)) {
      activeRef.current = true;
      setShouldInit(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        activeRef.current = entry.isIntersecting;
        if (entry.isIntersecting) setShouldInit(true);
      },
      { root: null, rootMargin: "420px 0px", threshold: 0.01 }
    );
    observer.observe(mount);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const update = () => {
      const mount = mountRef.current;
      if (!mount) return;
      const rect = mount.getBoundingClientRect();
      const viewport = Math.max(1, window.innerHeight);
      const raw = (viewport - rect.top) / (viewport + Math.max(1, rect.height));
      const value = Math.min(1, Math.max(0, raw));
      const nextStage = Math.min(text.stages.length - 1, Math.floor(value * text.stages.length));
      progressRef.current = { value, stage: nextStage };
      setStage((current) => current === nextStage ? current : nextStage);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update, { passive: true });
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [text.stages.length]);

  useEffect(() => {
    if (!shouldInit) return;
    const mount = mountRef.current;
    if (!mount) return;
    let disposed = false;
    let cleanup = () => {};

    async function init() {
      if (!("gpu" in navigator)) {
        setStatus("fallback");
        return;
      }

      try {
        const W: ThreeWebGPU = await import("three/webgpu");
        const RAPIER = await import("@dimforge/rapier3d-compat");
        await RAPIER.init();
        if (disposed || !mount) return;

        const dark = document.querySelector("main")?.getAttribute("data-theme") === "dark";
        const renderer = new W.WebGPURenderer({ antialias: true, alpha: true });
        await renderer.init();
        if (disposed || !mount) {
          renderer.dispose();
          return;
        }

        renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
        mount.innerHTML = "";
        mount.appendChild(renderer.domElement);
        renderer.domElement.className = styles.webgpuCanvas;

        const scene = new W.Scene();
        scene.background = null;
        const camera = new W.PerspectiveCamera(40, 1, 0.1, 100);
        camera.position.set(0, 0, 8.5);

        const group = new W.Group();
        scene.add(group);

        const world = new RAPIER.World({ x: 0, y: 0, z: 0 });
        const bodies: InstanceType<typeof RAPIER.RigidBody>[] = [];
        const homePositions: { x: number; y: number; z: number }[] = [];

        const ambient = new W.AmbientLight(dark ? 0xf8f2e8 : 0xffffff, dark ? 0.9 : 1.2);
        scene.add(ambient);
        const key = new W.DirectionalLight(dark ? 0x77d9aa : 0xffffff, 2.2);
        key.position.set(-3.5, 4, 5);
        scene.add(key);
        const gold = new W.PointLight(0xd8bd72, 8, 18);
        gold.position.set(2.7, -1.5, 3.2);
        scene.add(gold);

        const planeMaterial = new W.MeshBasicMaterial({ color: dark ? 0x77d9aa : 0x1f7a5b, transparent: true, opacity: dark ? 0.055 : 0.075 });
        const laneMaterial = new W.MeshBasicMaterial({ color: 0xd8bd72, transparent: true, opacity: 0.085 });
        const boundary = new W.Mesh(new W.PlaneGeometry(6.7, 3.6), planeMaterial);
        boundary.position.set(0.35, 0.05, -0.28);
        group.add(boundary);
        const laneTop = new W.Mesh(new W.PlaneGeometry(6.9, 0.018), laneMaterial);
        laneTop.position.set(0.25, 0.86, -0.18);
        group.add(laneTop);
        const laneMid = new W.Mesh(new W.PlaneGeometry(6.9, 0.018), laneMaterial.clone());
        laneMid.position.set(0.25, -0.18, -0.18);
        group.add(laneMid);
        const laneBottom = new W.Mesh(new W.PlaneGeometry(6.9, 0.018), laneMaterial.clone());
        laneBottom.position.set(0.25, -1.22, -0.18);
        group.add(laneBottom);

        const coreMaterial = new W.MeshPhysicalMaterial({
          color: dark ? 0x111413 : 0xf8f2e8,
          metalness: 0.18,
          roughness: 0.32,
          transparent: true,
          opacity: dark ? 0.58 : 0.68,
          clearcoat: 0.5,
          clearcoatRoughness: 0.22,
        });
        const core = new W.Mesh(new W.BoxGeometry(1.15, 0.72, 0.12), coreMaterial);
        core.position.set(0, -0.18, 0.16);
        group.add(core);

        const ringMat = new W.MeshBasicMaterial({ color: dark ? 0x77d9aa : 0x1f7a5b, transparent: true, opacity: 0.10 });
        const ring = new W.Mesh(new W.TorusGeometry(0.86, 0.012, 10, 96), ringMat);
        ring.scale.set(1.55, .58, 1);
        ring.position.set(0, -0.18, 0.22);
        group.add(ring);
        const ring2 = new W.Mesh(new W.TorusGeometry(1.42, 0.01, 10, 96), new W.MeshBasicMaterial({ color: 0xd8bd72, transparent: true, opacity: 0.08 }));
        ring2.scale.set(1.3, .42, 1);
        ring2.position.set(0, -0.18, 0.24);
        group.add(ring2);

        const logoTexture = makeTextTexture("AIOW", W, true);
        const logo = new W.Mesh(
          new W.PlaneGeometry(1.34, 0.50),
          new W.MeshBasicMaterial({ map: logoTexture, transparent: true, opacity: 0.92 })
        );
        logo.position.set(0, -0.18, 0.34);
        group.add(logo);

        const nodeLabels = lang === "nl" ? ["Proces", "Data", "Policy", "Agent", "Approval"] : ["Process", "Data", "Policy", "Agent", "Approval"];
        const nodePositions: [number, number, number][] = [[-3.15, 1.25, 0], [-1.62, 0.36, 0], [0, -0.18, 0.08], [1.62, 0.36, 0], [3.15, -1.05, 0]];
        const nodes: InstanceType<ThreeWebGPU["Group"]>[] = [];
        const nodeCards: InstanceType<ThreeWebGPU["Mesh"]>[] = [];

        nodeLabels.forEach((label, i) => {
          const n = new W.Group();
          n.position.set(...nodePositions[i]);
          const tex = makeTextTexture(label, W, dark);
          const card = new W.Mesh(new W.PlaneGeometry(1.58, 0.56), new W.MeshBasicMaterial({ map: tex, transparent: true, opacity: 0.82 }));
          nodeCards.push(card);
          n.add(card);
          const dot = new W.Mesh(new W.SphereGeometry(0.055, 16, 8), new W.MeshBasicMaterial({ color: i === 4 ? 0xd8bd72 : (dark ? 0x77d9aa : 0x1f7a5b) }));
          dot.position.set(-0.66, 0, 0.04);
          n.add(dot);
          const bodyDesc = RAPIER.RigidBodyDesc.dynamic()
            .setTranslation(nodePositions[i][0], nodePositions[i][1], 0)
            .setLinearDamping(7.8)
            .setAngularDamping(8.5);
          const body = world.createRigidBody(bodyDesc);
          world.createCollider(RAPIER.ColliderDesc.ball(0.34), body);
          bodies.push(body);
          homePositions.push({ x: nodePositions[i][0], y: nodePositions[i][1], z: 0 });
          nodes.push(n);
          group.add(n);
        });

        const lineMat = new W.LineBasicMaterial({ color: dark ? 0x77d9aa : 0x1f7a5b, transparent: true, opacity: 0.32 });
        const lines: InstanceType<ThreeWebGPU["Line"]>[] = [];
        for (let i = 0; i < nodePositions.length - 1; i += 1) {
          const from = nodePositions[i];
          const to = nodePositions[i + 1];
          const curve = new W.CatmullRomCurve3([
            new W.Vector3(from[0], from[1], 0.08),
            new W.Vector3((from[0] + to[0]) / 2, (from[1] + to[1]) / 2 + (i % 2 === 0 ? 0.28 : -0.22), 0.20),
            new W.Vector3(to[0], to[1], 0.08),
          ]);
          const points = curve.getPoints(48);
          const geom = new W.BufferGeometry().setFromPoints(points);
          const line = new W.Line(geom, lineMat.clone());
          lines.push(line);
          group.add(line);
        }

        const particles = lines.map((line, i) => {
          const m = new W.Mesh(new W.SphereGeometry(0.04, 16, 8), new W.MeshBasicMaterial({ color: i >= 3 ? 0xd8bd72 : (dark ? 0x77d9aa : 0x1f7a5b) }));
          group.add(m);
          return { mesh: m, line, phase: i * 0.22 };
        });

        const pointer = { x: 0, y: 0, active: false };
        const onPointerMove = (event: PointerEvent) => {
          const rect = renderer.domElement.getBoundingClientRect();
          pointer.x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
          pointer.y = -(((event.clientY - rect.top) / rect.height - 0.5) * 2);
          pointer.active = true;
        };
        const onPointerLeave = () => { pointer.active = false; };
        renderer.domElement.addEventListener("pointermove", onPointerMove, { passive: true });
        renderer.domElement.addEventListener("pointerleave", onPointerLeave, { passive: true });

        const resize = () => {
          const rect = mount.getBoundingClientRect();
          renderer.setSize(Math.max(1, rect.width), Math.max(1, rect.height));
          camera.aspect = Math.max(1, rect.width) / Math.max(1, rect.height);
          camera.updateProjectionMatrix();
        };
        resize();
        window.addEventListener("resize", resize, { passive: true });

        let raf = 0;
        const clock = new W.Clock();
        const animate = () => {
          if (!activeRef.current && document.visibilityState === "visible") {
            raf = requestAnimationFrame(animate);
            return;
          }
          if (document.visibilityState === "hidden") {
            raf = requestAnimationFrame(animate);
            return;
          }
          const t = clock.getElapsedTime();
          const scroll = progressRef.current.value;
          const activeStage = progressRef.current.stage;
          const px = pointer.active ? pointer.x * 0.13 : 0;
          const py = pointer.active ? pointer.y * 0.10 : 0;
          const targetY = px + (scroll - 0.5) * 0.42;
          const targetX = -py + Math.sin(scroll * Math.PI * 2) * 0.055;
          group.rotation.y += ((targetY - group.rotation.y) * 0.04);
          group.rotation.x += ((targetX - group.rotation.x) * 0.04);
          core.rotation.y = Math.sin(t * 0.45) * 0.035 + scroll * 0.10;
          const coreScale = 1 + Math.sin(scroll * Math.PI) * 0.035;
          core.scale.setScalar(coreScale);
          ring.rotation.z = Math.sin(t * 0.34) * 0.12;
          ring2.rotation.z = -Math.sin(t * 0.28) * 0.10;
          ring.scale.set(1.55 + scroll * 0.10, .58 + scroll * 0.04, 1);
          ring2.scale.set(1.3 + scroll * 0.08, .42 + scroll * 0.03, 1);
          const boundaryMaterial = boundary.material as InstanceType<ThreeWebGPU["MeshBasicMaterial"]>;
          boundaryMaterial.opacity = (dark ? 0.045 : 0.062) + Math.sin(t * 0.55) * 0.012;
          logo.lookAt(camera.position);

          bodies.forEach((body, i) => {
            const home = homePositions[i];
            const pos = body.translation();
            const focus = i === activeStage ? 1 : 0;
            const pull = 0.85 + focus * 0.38;
            body.addForce({
              x: (home.x - pos.x) * pull,
              y: (home.y - pos.y) * pull,
              z: (home.z - pos.z) * pull,
            }, true);
            if (pointer.active) {
              const pointerWorld = { x: pointer.x * 3.15, y: pointer.y * 2.35, z: 0 };
              const dx = pos.x - pointerWorld.x;
              const dy = pos.y - pointerWorld.y;
              const dist = Math.max(0.18, Math.hypot(dx, dy));
              const force = Math.max(0, 1.55 - dist) * (0.55 + focus * 0.24);
              body.addForce({ x: (dx / dist) * force, y: (dy / dist) * force, z: focus * 0.08 }, true);
            }
          });
          world.timestep = 1 / 60;
          world.step();

          nodes.forEach((node, i) => {
            const focus = i === activeStage ? 1 : 0;
            const pos = bodies[i].translation();
            node.position.set(pos.x, pos.y, Math.sin(t * 1.05 + i) * 0.08 + focus * 0.16 + pos.z);
            node.scale.setScalar(1 + focus * 0.09);
            node.lookAt(camera.position);
          });
          nodeCards.forEach((card, i) => {
            const material = card.material as InstanceType<ThreeWebGPU["MeshBasicMaterial"]>;
            material.opacity = i === activeStage ? 1 : 0.66;
          });
          lines.forEach((line, i) => {
            const material = line.material as InstanceType<ThreeWebGPU["LineBasicMaterial"]>;
            material.opacity = (i === activeStage ? 0.44 : 0.18) + Math.sin(t * 1.25 + i) * 0.035;
          });
          particles.forEach((p, i) => {
            const progress = (t * (0.16 + scroll * 0.09) + p.phase) % 1;
            const geom = p.line.geometry as InstanceType<ThreeWebGPU["BufferGeometry"]>;
            const attr = geom.getAttribute("position") as InstanceType<ThreeWebGPU["BufferAttribute"]>;
            const idx = Math.min(attr.count - 1, Math.max(0, Math.floor(progress * (attr.count - 1))));
            p.mesh.position.set(attr.getX(idx), attr.getY(idx), attr.getZ(idx) + 0.06);
            p.mesh.scale.setScalar(0.72 + Math.sin(progress * Math.PI) * 0.62);
          });
          renderer.render(scene, camera);
          raf = requestAnimationFrame(animate);
        };
        animate();
        setStatus("webgpu");

        cleanup = () => {
          cancelAnimationFrame(raf);
          window.removeEventListener("resize", resize);
          renderer.domElement.removeEventListener("pointermove", onPointerMove);
          renderer.domElement.removeEventListener("pointerleave", onPointerLeave);
          logoTexture.dispose();
          scene.traverse((object) => {
            const mesh = object as InstanceType<ThreeWebGPU["Mesh"]>;
            if (mesh.geometry) mesh.geometry.dispose();
            const mat = mesh.material as unknown;
            if (Array.isArray(mat)) mat.forEach((m) => m?.dispose?.());
            else (mat as { dispose?: () => void })?.dispose?.();
          });
          world.free();
          renderer.dispose();
          mount.innerHTML = "";
        };
      } catch (error) {
        console.warn("AIOW WebGPU core fallback", error);
        setStatus("fallback");
      }
    }

    init();
    return () => {
      disposed = true;
      cleanup();
    };
  }, [lang, shouldInit]);

  const fallbackNodes = lang === "nl"
    ? ["Proces", "Data", "Policy", "Agent", "Approval"]
    : ["Process", "Data", "Policy", "Agent", "Approval"];

  const handleFallbackPointerMove = (event: React.PointerEvent<HTMLElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / Math.max(1, rect.width) - 0.5) * 2;
    const y = ((event.clientY - rect.top) / Math.max(1, rect.height) - 0.5) * 2;
    event.currentTarget.style.setProperty("--ptr-x", x.toFixed(3));
    event.currentTarget.style.setProperty("--ptr-y", y.toFixed(3));
    event.currentTarget.setAttribute("data-pointer", "true");
  };

  const handleFallbackPointerLeave = (event: React.PointerEvent<HTMLElement>) => {
    event.currentTarget.style.setProperty("--ptr-x", "0");
    event.currentTarget.style.setProperty("--ptr-y", "0");
    event.currentTarget.setAttribute("data-pointer", "false");
  };

  if (status === "fallback") {
    return (
      <figure className={`${styles.webgpuCore} ${styles.fallbackCore}`} aria-label={text.title} onPointerMove={handleFallbackPointerMove} onPointerLeave={handleFallbackPointerLeave}>
        <div ref={mountRef} className={styles.stage}>
          <div className={styles.fallbackMap} aria-hidden="true">
            <div className={styles.fallbackBoundary} />
            <div className={styles.fallbackRoute} />
            {fallbackNodes.map((node, index) => (
              <span key={node} className={styles.fallbackNode} data-active={index === stage ? "true" : "false"}>
                {node}
              </span>
            ))}
          </div>
        </div>
        <figcaption>
          <span>{text.fallback}</span>
          <strong>{text.title}</strong>
          <small>{text.subtitle}</small>
          <em>{text.stages[stage]}</em>
          <b>{lang === "nl" ? "Beweeg je muis door de laag" : "Move through the layer"}</b>
        </figcaption>
      </figure>
    );
  }

  return (
    <figure className={styles.webgpuCore} aria-label={text.title} onPointerMove={handleFallbackPointerMove} onPointerLeave={handleFallbackPointerLeave}>
      <div ref={mountRef} className={styles.stage} />
      <figcaption>
        <span>{status === "checking" ? "Lazy WebGPU" : text.badge}</span>
        <strong>{text.title}</strong>
        <small>{text.subtitle}</small>
        <em>{text.stages[stage]}</em>
        <b>{lang === "nl" ? "Live: scroll + cursor sturen de laag" : "Live: scroll + cursor drive the layer"}</b>
      </figcaption>
    </figure>
  );
}

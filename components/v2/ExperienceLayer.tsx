"use client";
import dynamic from "next/dynamic";

export const BackgroundCanvas = dynamic(
  () => import("./BackgroundCanvas").then((m) => ({ default: m.BackgroundCanvas })),
  { ssr: false, loading: () => null }
);

export const Cursor = dynamic(
  () => import("./Cursor").then((m) => ({ default: m.Cursor })),
  { ssr: false, loading: () => null }
);

export const SmoothScroll = dynamic(
  () => import("./SmoothScroll").then((m) => ({ default: m.SmoothScroll })),
  { ssr: false, loading: () => null }
);

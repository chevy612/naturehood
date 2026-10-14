"use client";

import { useEffect, useMemo, useRef } from "react";
import type { AnimationItem } from "lottie-web";
import loadingLogo from "./loading-logo.json";

function hexToLottieColor(hex: string): [number, number, number, number] {
  const raw = hex.trim().replace("#", "");
  const full = raw.length === 3 ? raw.split("").map((channel) => channel + channel).join("") : raw;
  if (!/^[0-9a-fA-F]{6}$/.test(full)) return [1, 1, 1, 1];
  const n = Number.parseInt(full, 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255, 1];
}

// The draw is baked into the Lottie file. Recolor only the bolt fill.
function withLogoColor(color: string) {
  const data = JSON.parse(JSON.stringify(loadingLogo)) as {
    layers?: { nm?: string; shapes?: { it?: { nm?: string; c?: { k?: number[] } }[] }[] }[];
  };
  const rgb = hexToLottieColor(color);
  for (const layer of data.layers ?? []) {
    if (layer.nm !== "Bolt") continue;
    for (const group of layer.shapes ?? []) {
      for (const item of group.it ?? []) {
        if (item.nm === "Logo Fill" && item.c?.k) item.c.k = rgb;
      }
    }
  }
  return data;
}

export function LogoSpinner({
  size = 48,
  color = "#FFFFFF",
}: {
  size?: number;
  color?: string;
}) {
  const container = useRef<HTMLDivElement>(null);
  const animationData = useMemo(() => withLogoColor(color), [color]);

  useEffect(() => {
    const node = container.current;
    if (!node) return;
    let anim: AnimationItem | undefined;
    let cancelled = false;

    void import("lottie-web")
      .then((mod) => {
        if (cancelled || !container.current) return;
        const lottie = typeof mod.default?.loadAnimation === "function" ? mod.default : null;
        if (!lottie) {
          console.error("lottie-web export missing loadAnimation");
          return;
        }
        anim = lottie.loadAnimation({
          container: container.current,
          renderer: "svg",
          loop: true,
          autoplay: true,
          animationData,
          rendererSettings: { preserveAspectRatio: "xMidYMid meet" },
        });
      })
      .catch((error) => {
        console.error("logo spinner failed", error);
      });

    return () => {
      cancelled = true;
      anim?.destroy();
    };
  }, [animationData]);

  return (
    <div
      ref={container}
      style={{ width: size, height: size }}
      role="status"
      aria-label="Loading"
    />
  );
}

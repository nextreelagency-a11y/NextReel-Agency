import React from "react";
import { AbsoluteFill, Easing, interpolate, OffthreadVideo, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import reel from "../data/reel.json";
import { Captions } from "./Captions";
import { Popups } from "./Popups";

const SLIDE = 0.24; // durata slide (s)
const FADE = 0.1; // durata fade to black (s)

const Footage: React.FC<{ scale: number; x: number; blur: number }> = ({ scale, x, blur }) => (
  <AbsoluteFill style={{ transform: `translateX(${x}px)`, filter: blur > 0.5 ? `blur(${blur}px)` : undefined }}>
    <OffthreadVideo
      src={staticFile("source.mp4")}
      muted
      style={{ width: "100%", height: "100%", objectFit: "cover", transform: `scale(${scale})`, transformOrigin: "50% 38%" }}
    />
  </AbsoluteFill>
);

// layer: "full" = tutto insieme, "base" = solo video con zoom/transizioni,
// "overlay" = solo icone e numeri su sfondo trasparente (per CapCut)
export type ReelProps = { layer?: "full" | "base" | "overlay"; captions?: boolean };

export const Reel: React.FC<ReelProps> = ({ layer = "full", captions = false }) => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();
  const t = frame / fps;

  // Taglio dinamico: zoom del 10% a scatto sui cambi di frase
  const zoom = reel.zooms.find((z) => t >= z.start && t < z.end);
  const scale = zoom ? zoom.scale : 1;

  // Transizioni solo sui cambi di capitolo
  let layers: { x: number; blur: number; scale: number }[] = [{ x: 0, blur: 0, scale }];
  let black = 0;
  for (const c of reel.chapters) {
    if (c.transition === "slide" && Math.abs(t - c.time) < SLIDE / 2) {
      const p = interpolate(t, [c.time - SLIDE / 2, c.time + SLIDE / 2], [0, 1], { easing: Easing.inOut(Easing.cubic) });
      const speed = Math.sin(p * Math.PI); // massimo a metà transizione
      const prev = reel.zooms.find((z) => c.time - 0.01 >= z.start && c.time - 0.01 < z.end)?.scale ?? 1;
      const next = reel.zooms.find((z) => c.time + 0.01 >= z.start && c.time + 0.01 < z.end)?.scale ?? 1;
      layers = [
        { x: -p * width, blur: speed * 18, scale: prev },
        { x: (1 - p) * width, blur: speed * 18, scale: next },
      ];
    }
    if (c.transition === "fade") {
      black = Math.max(black, interpolate(Math.abs(t - c.time), [0, FADE / 2], [1, 0], { extrapolateRight: "clamp" }));
    }
  }

  if (layer === "overlay") {
    return (
      <AbsoluteFill>
        <Popups />
      </AbsoluteFill>
    );
  }

  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {layers.map((l, i) => (
        <Footage key={i} scale={l.scale} x={l.x} blur={l.blur} />
      ))}
      {black > 0 && <AbsoluteFill style={{ backgroundColor: "#000", opacity: black }} />}
      {layer === "full" && <Popups />}
      {layer === "full" && captions && <Captions />}
    </AbsoluteFill>
  );
};

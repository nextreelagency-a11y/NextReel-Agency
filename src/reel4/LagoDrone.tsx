import React from "react";
import { AbsoluteFill, Easing, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";

// Finta ripresa da drone sul lago di Como, ricavata da un'unica immagine fotorealistica (2160x3840):
// 0-0,85 s il lago, 0,85-1,5 s la camera scende sulle ville con il fotovoltaico,
// da 1,54 s ("è vietato?") compaiono croci rosse illuminate sui tre impianti.
const IMG_W = 2160;
const IMG_H = 3840;
const BAN_AT = 1.54;

// impianti nell'immagine (coordinate in pixel dell'immagine originale)
const PANELS = [
  { x: 470, y: 1868, size: 210 },
  { x: 1840, y: 2025, size: 230 },
  { x: 1115, y: 2590, size: 400 },
];

const Cross: React.FC<{ size: number; at: number }> = ({ size, at }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const k = spring({ frame: frame - Math.round(at * fps), fps, config: { damping: 9, stiffness: 220, mass: 0.5 } });
  if (k <= 0.001) return null;
  const pulse = 0.75 + 0.25 * Math.sin((t - at) * 9);
  const bar = size * 0.2;
  const barStyle = (rot: number): React.CSSProperties => ({
    position: "absolute",
    left: (size - size * 1.25) / 2,
    top: (size - bar) / 2,
    width: size * 1.25,
    height: bar,
    borderRadius: bar / 2,
    background: "linear-gradient(180deg, #ff6b6b, #ff1f1f 45%, #c30000)",
    transform: `rotate(${rot}deg)`,
    boxShadow: `0 0 ${size * 0.12}px ${size * 0.04}px rgba(255,40,40,${0.9 * pulse}), 0 0 ${size * 0.45}px ${size * 0.12}px rgba(255,0,0,${0.55 * pulse})`,
  });
  return (
    <div style={{ position: "relative", width: size, height: size, transform: `scale(${k})` }}>
      {/* alone rosso sull'impianto */}
      <div
        style={{
          position: "absolute",
          inset: -size * 0.35,
          borderRadius: "50%",
          background: `radial-gradient(circle, rgba(255,30,30,${0.45 * pulse}) 0%, rgba(255,0,0,0) 65%)`,
        }}
      />
      <div style={barStyle(45)} />
      <div style={barStyle(-45)} />
    </div>
  );
};

export const LagoDrone: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const t = frame / fps;

  // camera (centro e scala in pixel dell'immagine)
  const move = interpolate(t, [0.8, 1.5], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.cubic) });
  const drift = interpolate(t, [0, 4], [0, 1]);
  const lake = { x: 1000 + 120 * drift, y: 930 - 40 * drift, s: 1.05 + 0.06 * drift };
  const push = interpolate(t, [1.5, 4], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const houses = { x: 1150, y: 2030 + 20 * push, s: 0.57 + 0.04 * push };
  const cx = lake.x + (houses.x - lake.x) * move;
  const cy = lake.y + (houses.y - lake.y) * move;
  const s = lake.s + (houses.s - lake.s) * move;
  // micro-movimenti da drone
  const shakeX = Math.sin(t * 1.7) * 3 + Math.sin(t * 4.3) * 1.2;
  const shakeY = Math.cos(t * 1.3) * 3 + Math.cos(t * 3.7) * 1.2;
  const rot = interpolate(t, [0, 4], [-1.2, 1.2]);
  // sfocatura di movimento durante la discesa
  const speed = Math.sin(move * Math.PI);
  const blur = speed * 3.5;

  const dark = interpolate(t, [BAN_AT - 0.05, BAN_AT + 0.25], [0, 0.32], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ backgroundColor: "#000", overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: IMG_W,
          height: IMG_H,
          transformOrigin: "0 0",
          transform: `translate(${width / 2 + shakeX}px, ${height / 2 + shakeY}px) rotate(${rot}deg) scale(${s}) translate(${-cx}px, ${-cy}px)`,
          filter: blur > 0.3 ? `blur(${blur}px)` : undefined,
        }}
      >
        <Img src={staticFile("reel4/lago.jpg")} style={{ width: IMG_W, height: IMG_H, display: "block" }} />
        {/* leggero oscuramento per far risaltare le croci */}
        <div style={{ position: "absolute", inset: 0, background: `rgba(0,0,0,${dark})` }} />
        {PANELS.map((p, i) => (
          <div key={i} style={{ position: "absolute", left: p.x - p.size / 2, top: p.y - p.size / 2 }}>
            <Cross size={p.size} at={BAN_AT + i * 0.12} />
          </div>
        ))}
      </div>
      {/* luce calda e vignettatura cinematografica */}
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(255,220,170,0.10) 0%, transparent 35%)" }} />
      <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 50%, transparent 60%, rgba(0,0,0,0.45) 100%)" }} />
    </AbsoluteFill>
  );
};

import React from "react";
import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import map from "../../projects/reel3/varese.json";
import { Headline } from "../Headline";
import { fontFamily } from "../theme";
import { BRAND } from "../wallbox/Logo";

// Solo la provincia di Varese: si solleva in 3D con una lenta spinta della camera,
// il segnaposto cade su Origgio. Inserto a schermo intero, entra/esce a taglio netto.
const ORIGGIO = map.cities.find((c) => c.name === "Origgio")!;
const LABELS = ["Varese", "Busto Arsizio", "Gallarate", "Luino"];

export const MapVarese: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const u = frame / fps;

  // camera: provincia intera -> leggero avvicinamento verso Origgio
  const k = interpolate(u, [0, 3], [0, 1], { extrapolateRight: "clamp", easing: Easing.inOut(Easing.cubic) });
  const base = 1000 / map.height;
  const s = base * (1 + 0.15 * k);
  const cx = map.width / 2 + (ORIGGIO.x - map.width / 2) * 0.2 * k;
  const cy = map.height / 2 + (ORIGGIO.y - map.height / 2) * 0.2 * k;
  const rot = interpolate(u, [0, 3], [-3, 2]);
  const CY = height * 0.6;
  const toScreen = (x: number, y: number) => {
    const dx = (x - cx) * s;
    const dy = (y - cy) * s;
    const r = (rot * Math.PI) / 180;
    return { X: width / 2 + dx * Math.cos(r) - dy * Math.sin(r), Y: CY + dx * Math.sin(r) + dy * Math.cos(r) };
  };

  const appear = spring({ frame, fps, config: { damping: 14, stiffness: 110 } });
  const lift = spring({ frame: frame - 6, fps, config: { damping: 9, stiffness: 120, mass: 0.7 } });
  const depth = 22 * lift;
  const pulse = 0.5 + 0.5 * Math.sin(u * 6);
  const sweep = interpolate(u, [0.4, 1.3], [-0.3, 1.3], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const pin = spring({ frame: frame - Math.round(0.9 * fps), fps, config: { damping: 7, stiffness: 170, mass: 0.6 } });
  const ring = ((u - 1.1) * 0.9) % 1;
  const dest = toScreen(ORIGGIO.x, ORIGGIO.y);
  const labelsOn = interpolate(u, [0.5, 0.9], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 45%, #183a57 0%, #0b1a28 60%, #060e16 100%)", fontFamily, overflow: "hidden" }}>
      <svg width={width} height={height} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <pattern id="gridV" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M40 0 H0 V40" fill="none" stroke="#ffffff" strokeOpacity="0.05" strokeWidth={1} />
          </pattern>
          <filter id="glowV" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation={14} />
          </filter>
          <linearGradient id="sweepV" x1="0" x2="1" y1="0" y2="0.3">
            <stop offset={Math.max(0, sweep - 0.15)} stopColor="#fff" stopOpacity="0" />
            <stop offset={Math.min(1, Math.max(0, sweep))} stopColor="#fff" stopOpacity="0.55" />
            <stop offset={Math.min(1, sweep + 0.15)} stopColor="#fff" stopOpacity="0" />
          </linearGradient>
          <clipPath id="clipV">
            <path d={map.varese} />
          </clipPath>
        </defs>
        <g opacity={appear} transform={`translate(${width / 2} ${CY}) rotate(${rot}) scale(${s * (0.92 + 0.08 * appear)}) translate(${-cx} ${-cy})`}>
          <rect x={-3000} y={-3000} width={7000} height={7000} fill="url(#gridV)" />
          {map.near.map((p) => (
            <path key={p.name} d={p.d} fill="#24405a" fillOpacity={0.55} stroke="#6f8ca6" strokeOpacity={0.6} strokeWidth={2 / s} />
          ))}
          <path d={map.varese} fill={BRAND.yellow} opacity={(0.35 + 0.3 * pulse) * lift} filter="url(#glowV)" />
          {Array.from({ length: 10 }).map((_, i) => (
            <path key={i} d={map.varese} transform={`translate(0 ${(depth * (1 - i / 10)) / s})`} fill="#9c8a06" opacity={lift} />
          ))}
          <path d={map.varese} fill={BRAND.yellow} stroke="#fff" strokeWidth={4 / s} transform={`translate(0 ${(-depth * 0.15) / s})`} />
          <rect x={-50} y={-50} width={map.width + 100} height={map.height + 100} fill="url(#sweepV)" clipPath="url(#clipV)" />
          {map.cities
            .filter((c) => LABELS.includes(c.name))
            .map((c) => (
              <g key={c.name} opacity={labelsOn}>
                <circle cx={c.x} cy={c.y} r={9 / s} fill="#fff" stroke="#1d1d1d" strokeWidth={3 / s} />
                <text x={c.x} y={c.y - 18 / s} fontSize={30 / s} fontWeight={900} fill="#3b3000" textAnchor="middle" fontFamily="Montserrat, sans-serif">
                  {c.name.toUpperCase()}
                </text>
              </g>
            ))}
        </g>
      </svg>

      {/* onde attorno a Origgio */}
      {u > 1.1 && (
        <div
          style={{
            position: "absolute",
            left: dest.X - 70,
            top: dest.Y - 25,
            width: 140,
            height: 50,
            borderRadius: "50%",
            border: `5px solid ${BRAND.green}`,
            transform: `scale(${1 + ring * 1.4})`,
            opacity: 1 - ring,
          }}
        />
      )}
      {/* segnaposto */}
      <div style={{ position: "absolute", left: dest.X - 60, top: dest.Y - 150, transform: `translateY(${(1 - Math.min(1, pin)) * -160}px) scale(${pin})`, transformOrigin: "50% 100%" }}>
        <svg width={120} height={150} viewBox="0 0 24 30" style={{ filter: "drop-shadow(6px 7px 0 #161616)" }}>
          <path d="M12 29 C12 29 3 18 3 11 A9 9 0 0 1 21 11 C21 18 12 29 12 29 Z" fill={BRAND.green} stroke="#161616" strokeWidth={1.4} />
          <circle cx={12} cy={11} r={3.8} fill="#fff" stroke="#161616" strokeWidth={1.2} />
        </svg>
      </div>

      {/* titolo */}
      <div style={{ position: "absolute", top: 230, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
        <Headline
          curve
          start={0.15}
          end={99}
          lines={[
            { text: "ORIGGIO", color: "yellow", size: 112 },
            { text: "PROVINCIA DI VARESE", color: "white", size: 64 },
          ]}
        />
      </div>
      <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 50%, transparent 55%, rgba(0,0,0,0.55) 100%)" }} />
    </AbsoluteFill>
  );
};

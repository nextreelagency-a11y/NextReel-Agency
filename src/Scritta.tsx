import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { Headline, Line, PALETTE } from "./Headline";

// Singola scritta in stile NextReel su sfondo trasparente (per esportarla in PNG),
// con icona o logo opzionale sopra il testo.
export type ScrittaProps = { lines: Line[]; curve?: boolean; icon?: "sun" | "ev" | "pin"; logo?: string; logoWidth?: number };

const INK = "#161616";
const Sun: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="-100 -100 200 200" style={{ filter: `drop-shadow(8px 10px 0 ${INK})`, overflow: "visible" }}>
    {Array.from({ length: 12 }, (_, i) => i * 30).map((a) => (
      <path key={a} d="M-11 -58 L0 -92 L11 -58 Z" transform={`rotate(${a})`} fill={PALETTE.yellow} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
    ))}
    <circle r={52} fill={PALETTE.yellow} stroke={INK} strokeWidth={7} />
    <circle cx={-16} cy={-18} r={14} fill="#fff" opacity={0.55} />
  </svg>
);
// auto elettrica vista di lato con presa e fulmine
const Ev: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size * 1.5} height={size} viewBox="0 0 150 100" style={{ filter: `drop-shadow(8px 10px 0 ${INK})`, overflow: "visible" }}>
    <path d="M12 70 V58 Q12 50 22 48 L40 44 L58 26 Q62 22 70 22 H104 Q112 22 118 30 L130 46 Q140 48 140 58 V70 Z" fill={PALETTE.yellow} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
    <path d="M62 30 H80 V45 H48 Z M86 30 H102 Q106 30 110 35 L118 45 H86 Z" fill="#fff" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
    {[38, 112].map((x) => (
      <g key={x}>
        <circle cx={x} cy={72} r={14} fill={INK} />
        <circle cx={x} cy={72} r={6} fill="#cfd3d8" />
      </g>
    ))}
    <circle cx={128} cy={18} r={17} fill={PALETTE.green} stroke={INK} strokeWidth={4} />
    <path d="M131 7 L122 20 H129 L125 30 L135 16 H128 Z" fill="#fff" stroke={INK} strokeWidth={1.5} strokeLinejoin="round" />
  </svg>
);
const Pin: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size * 0.8} height={size} viewBox="0 0 24 30" style={{ filter: `drop-shadow(6px 7px 0 ${INK})` }}>
    <path d="M12 29 C12 29 3 18 3 11 A9 9 0 0 1 21 11 C21 18 12 29 12 29 Z" fill={PALETTE.green} stroke={INK} strokeWidth={1.4} />
    <circle cx={12} cy={11} r={3.8} fill="#fff" stroke={INK} strokeWidth={1.2} />
  </svg>
);

export const Scritta: React.FC<ScrittaProps> = ({ lines, curve, icon, logo, logoWidth = 600 }) => (
  <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
    {icon === "sun" && <Sun size={300} />}
    {icon === "ev" && <Ev size={190} />}
    {icon === "pin" && <Pin size={200} />}
    {logo && (
      <div style={{ background: "#fff", borderRadius: 26, padding: "26px 34px", boxShadow: `10px 12px 0 ${INK}` }}>
        <Img src={staticFile(logo)} style={{ width: logoWidth, display: "block" }} />
      </div>
    )}
    <div style={{ marginTop: logo ? -12 : icon ? -34 : 0, position: "relative" }}>
      <Headline start={0} end={999} lines={lines} curve={curve} />
    </div>
  </AbsoluteFill>
);

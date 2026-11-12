import React from "react";
import { AbsoluteFill } from "remotion";
import { Headline, Line, PALETTE } from "./Headline";

// Singola scritta in stile NextReel su sfondo trasparente (per esportarla in PNG),
// con icona opzionale sopra il testo.
export type ScrittaProps = { lines: Line[]; curve?: boolean; icon?: "sun" };

const Sun: React.FC<{ size: number }> = ({ size }) => {
  const rays = Array.from({ length: 12 }, (_, i) => i * 30);
  return (
    <svg width={size} height={size} viewBox="-100 -100 200 200" style={{ filter: "drop-shadow(8px 10px 0 #161616)", overflow: "visible" }}>
      {rays.map((a) => (
        <path
          key={a}
          d="M-11 -58 L0 -92 L11 -58 Z"
          transform={`rotate(${a})`}
          fill={PALETTE.yellow}
          stroke="#161616"
          strokeWidth={6}
          strokeLinejoin="round"
        />
      ))}
      <circle r={52} fill={PALETTE.yellow} stroke="#161616" strokeWidth={7} />
      <circle cx={-16} cy={-18} r={14} fill="#fff" opacity={0.55} />
    </svg>
  );
};

export const Scritta: React.FC<ScrittaProps> = ({ lines, curve, icon }) => (
  <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
    {icon === "sun" && <Sun size={300} />}
    <div style={{ marginTop: icon ? -40 : 0 }}>
      <Headline start={0} end={999} lines={lines} curve={curve} />
    </div>
  </AbsoluteFill>
);

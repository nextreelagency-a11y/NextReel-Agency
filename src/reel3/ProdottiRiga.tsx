import React from "react";
import { AbsoluteFill, Img, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Headline } from "../Headline";

// Riga con i tre prodotti SunPower (foto scontornata + scritta sotto),
// che entrano uno dopo l'altro con effetto pop. `only` esporta un singolo prodotto.
const ITEMS = [
  { src: "reel3/pannelli.png", text: "PANNELLI", color: "yellow" },
  { src: "reel3/inverter.png", text: "INVERTER", color: "white" },
  { src: "reel3/accumulo.png", text: "ACCUMULO", color: "green" },
];
const STEP = 0.3; // secondi tra un prodotto e l'altro

export type ProdottiRigaProps = { only?: number };

const Item: React.FC<{ i: number; at: number }> = ({ i, at }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const k = spring({ frame: frame - Math.round(at * fps), fps, config: { damping: 8, stiffness: 180, mass: 0.6 } });
  const it = ITEMS[i];
  return (
    <div style={{ width: 340, display: "flex", flexDirection: "column", alignItems: "center", transform: `scale(${k})`, transformOrigin: "50% 80%" }}>
      <div style={{ width: 310, height: 380, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
        <Img
          src={staticFile(it.src)}
          style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain", filter: "drop-shadow(10px 12px 0 rgba(22,22,22,0.9))" }}
        />
      </div>
      <div style={{ marginTop: -26, position: "relative" }}>
        <Headline start={at + 0.05} end={999} lines={[{ text: it.text, color: it.color, size: 66 }]} />
      </div>
    </div>
  );
};

export const ProdottiRiga: React.FC<ProdottiRigaProps> = ({ only }) => (
  <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "center", gap: 4 }}>
      {ITEMS.map((_, i) => (only === undefined || only === i ? <Item key={i} i={i} at={only === undefined ? i * STEP : 0} /> : null))}
    </div>
  </AbsoluteFill>
);

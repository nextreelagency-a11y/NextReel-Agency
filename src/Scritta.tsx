import React from "react";
import { AbsoluteFill } from "remotion";
import { Headline, Line } from "./Headline";

// Singola scritta in stile NextReel su sfondo trasparente (per esportarla in PNG)
export type ScrittaProps = { lines: Line[]; curve?: boolean };

export const Scritta: React.FC<ScrittaProps> = ({ lines, curve }) => (
  <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
    <Headline start={0} end={999} lines={lines} curve={curve} />
  </AbsoluteFill>
);

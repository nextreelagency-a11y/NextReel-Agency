import React from "react";
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from "remotion";
import reel from "../data/reel.json";
import { CAPTION_Y, COLORS, fontFamily } from "./theme";

// Sottotitoli karaoke parola per parola, tutto maiuscolo
export const Captions: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, height } = useVideoConfig();
  const t = frame / fps;
  const group = reel.captions.find((g) => t >= g.start && t < g.end);
  if (!group) return null;

  const enter = spring({ frame: frame - Math.round(group.start * fps), fps, config: { damping: 14, stiffness: 260, mass: 0.5 } });

  return (
    <AbsoluteFill>
      <div
        style={{
          position: "absolute",
          top: height * CAPTION_Y,
          left: 70,
          right: 70,
          transform: `translateY(-50%) scale(${0.85 + 0.15 * enter})`,
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: "4px 60px",
          fontFamily,
          fontWeight: 900,
          fontSize: 96,
          lineHeight: 1.1,
          textAlign: "center",
          textTransform: "uppercase",
        }}
      >
        {group.words.map((w, i) => {
          const active = t >= w.s && t < w.e;
          return (
            <span
              key={i}
              style={{
                color: active ? COLORS.active : COLORS.text,
                WebkitTextStroke: `14px ${COLORS.stroke}`,
                paintOrder: "stroke fill",
                textShadow: "0 8px 18px rgba(0,0,0,0.55)",
                transform: active ? "scale(1.04)" : "scale(1)",
                display: "inline-block",
              }}
            >
              {w.text}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

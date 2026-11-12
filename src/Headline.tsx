import React from "react";
import { continueRender, delayRender, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";

// Stile grafiche NextReel: Rubik Black maiuscolo, righe di colori diversi,
// testo inclinato, contorno scuro e ombra netta (senza sfocatura).
export const HEADLINE_FONT = "'Rubik Black', 'Rubik', Impact, sans-serif";
export const PALETTE: Record<string, string> = {
  yellow: "#FFE806",
  green: "#5AAF30",
  white: "#FFFFFF",
  lime: "#FFE806", // stesso giallo del logo
};

if (typeof document !== "undefined") {
  const h = delayRender("Caricamento font Rubik Black");
  new FontFace("Rubik Black", `url(${staticFile("fonts/Rubik-Black-latin.woff2")}) format("woff2")`, { weight: "900" })
    .load()
    .then((f) => {
      document.fonts.add(f);
      continueRender(h);
    })
    .catch(() => continueRender(h));
}

export type Line = { text: string; color?: string; size?: number };
export type HeadlineProps = { start: number; end: number; lines: Line[]; rotate?: number; img?: string; imgHeight?: number; scale?: number };

export const Headline: React.FC<HeadlineProps> = ({ start, end, lines, rotate = 0, img, imgHeight = 240, scale = 1 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = Math.round(start * fps);
  const e = Math.round(end * fps);
  const pop = spring({ frame: frame - s, fps, config: { damping: 8, stiffness: 190, mass: 0.6 } });
  const out = interpolate(frame, [e - 3, e], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const rot = rotate;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, transform: `scale(${pop * out * scale}) rotate(${rot}deg)` }}>
      {img && <Img src={staticFile(img)} style={{ height: imgHeight, filter: "drop-shadow(10px 14px 0 rgba(20,20,20,0.85))", marginRight: 6 }} />}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", lineHeight: 0.92 }}>
        {lines.map((l, i) => {
          // ogni riga entra con un leggero ritardo
          const k = spring({ frame: frame - s - i * 3, fps, config: { damping: 9, stiffness: 200, mass: 0.5 } });
          return (
            <div key={i} style={{ transform: `translateY(${(1 - k) * 40}px)`, opacity: Math.min(1, k * 1.5), marginTop: i ? -(l.size ?? 150) * 0.05 : 0 }}>
              <div
                style={{
                  fontFamily: HEADLINE_FONT,
                  fontWeight: 900,
                  fontSize: l.size ?? 150,
                  lineHeight: 1,
                  whiteSpace: "nowrap",
                  textAlign: "center",
                  color: PALETTE[l.color ?? "yellow"] ?? PALETTE.yellow,
                  WebkitTextStroke: "6px #161616",
                  paintOrder: "stroke fill",
                  textShadow: "6px 7px 0 #161616",
                }}
              >
                {l.text}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

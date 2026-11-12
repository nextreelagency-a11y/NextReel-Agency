import React from "react";
import { AbsoluteFill, Img, OffthreadVideo, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import reel from "../../projects/wallbox/reel.json";
import { IconPop, Popup, StatPop, usePop } from "../Popups";
import { COLORS, fontFamily, POPUP_Y } from "../theme";
import { Aerial } from "./Aerial";
import { MapLombardia } from "./MapLombardia";

// Reel "Installazione Calolzio": nessuna musica, SFX, sottotitoli o transizioni.
// Solo grafiche animate + due inserti a schermo intero (vista dall'alto e cartina).

type P = { start: number; end: number; type: string; text?: string; label?: string; labelTop?: boolean; icon?: string; scale?: number; y?: number };

const WallboxPop: React.FC<{ p: P }> = ({ p }) => {
  const k = usePop(p.start, p.end);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 26, transform: `scale(${k})`, fontFamily }}>
      <Img src={staticFile("wallbox/wallbox.png")} style={{ height: 330, filter: "drop-shadow(0 18px 30px rgba(0,0,0,0.5))" }} />
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 10 }}>
        <div
          style={{
            fontSize: 170,
            fontWeight: 900,
            lineHeight: 1,
            color: COLORS.active,
            WebkitTextStroke: "16px #000",
            paintOrder: "stroke fill",
            textShadow: "0 14px 30px rgba(0,0,0,0.5)",
            whiteSpace: "nowrap",
          }}
        >
          {p.text}
        </div>
        <div style={{ fontSize: 40, fontWeight: 900, color: "#111", background: "#fff", padding: "6px 18px", borderRadius: 12 }}>{p.label}</div>
      </div>
    </div>
  );
};

export const WallboxReel: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, height } = useVideoConfig();
  const t = frame / fps;
  const pops = reel.popups as P[];
  const active = pops.filter((p) => t >= p.start && t < p.end);

  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <OffthreadVideo src={staticFile("wallbox/source.mp4")} muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      {active.map((p, i) => {
        if (p.type === "aerial") return <Aerial key={i} start={p.start} end={p.end} />;
        if (p.type === "map") return <MapLombardia key={i} start={p.start} end={p.end} />;
        const inner =
          p.type === "wallbox" ? <WallboxPop p={p} /> : p.type === "stat" ? <StatPop p={p as unknown as Popup} /> : <IconPop p={p as unknown as Popup} />;
        return (
          <div
            key={i}
            style={{ position: "absolute", left: 0, right: 0, top: height * (p.y ?? POPUP_Y), transform: "translateY(-50%)", display: "flex", justifyContent: "center" }}
          >
            {inner}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

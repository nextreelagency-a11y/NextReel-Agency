import React from "react";
import { AbsoluteFill, Img, OffthreadVideo, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import reel from "../../projects/wallbox/reel.json";
import { IconPop, Popup, StatPop, usePop } from "../Popups";
import { COLORS, fontFamily, POPUP_Y } from "../theme";
import { Headline, Line } from "../Headline";
import { Aerial } from "./Aerial";
import { MapLombardia } from "./MapLombardia";

// Reel "Installazione Calolzio": nessuna musica, SFX, sottotitoli o transizioni.
// Solo grafiche animate + due inserti a schermo intero (vista dall'alto e cartina).

type P = { start: number; end: number; type: string; text?: string; label?: string; labelTop?: boolean; icon?: string; scale?: number; y?: number; src?: string; card?: boolean; curve?: boolean; imgWidth?: number; lines?: Line[]; rotate?: number; img?: string };

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

// mode: "full" = tutto; "overlay" = solo scritte/icone su trasparente;
// "inserts" = solo vista dall'alto e cartina (per esportarle come clip separate)
export type WallboxProps = { mode?: "full" | "overlay" | "inserts" };

// Logo del prodotto (es. SunPower) su cartellino bianco, con effetto pop
const LogoPop: React.FC<{ p: P }> = ({ p }) => {
  const k = usePop(p.start, p.end);
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
      {p.card === false ? (
        // logo libero: entra ruotando in 3D e si ferma perfettamente dritto
        <div style={{ perspective: 1400 }}>
          <Img
            src={staticFile(p.src ?? "")}
            style={{
              width: p.imgWidth ?? 560,
              display: "block",
              transform: `scale(${k}) rotateY(${(1 - Math.min(1, k)) * -70}deg)`,
              filter: "drop-shadow(0 16px 24px rgba(0,0,0,0.45))",
            }}
          />
        </div>
      ) : (
        <div style={{ transform: `scale(${k})`, background: "#fff", borderRadius: 26, padding: "26px 34px", boxShadow: "10px 12px 0 #161616" }}>
          <Img src={staticFile(p.src ?? "")} style={{ width: 600, display: "block" }} />
        </div>
      )}
      {p.lines && (
        // la scritta si sovrappone leggermente alla parte bassa del logo/foto
        <div style={{ marginTop: p.card === false ? -34 : -34, position: "relative" }}>
          <Headline start={p.start + 0.08} end={p.end} lines={p.lines} curve={p.curve} />
        </div>
      )}
    </div>
  );
};

export const WallboxReel: React.FC<WallboxProps> = ({ mode = "full" }) => {
  const frame = useCurrentFrame();
  const { fps, height } = useVideoConfig();
  const t = frame / fps;
  const pops = reel.popups as P[];
  const active = pops.filter((p) => t >= p.start && t < p.end);

  return (
    <AbsoluteFill style={{ backgroundColor: mode === "overlay" ? undefined : "#000" }}>
      {mode === "full" && <OffthreadVideo src={staticFile("wallbox/source.mp4")} muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
      {active.map((p, i) => {
        const insert = p.type === "aerial" || p.type === "map";
        if (mode === "overlay" && insert) return null;
        if (mode === "inserts" && !insert) return null;
        if (p.type === "aerial") return <Aerial key={i} start={p.start} end={p.end} />;
        if (p.type === "map") return <MapLombardia key={i} start={p.start} end={p.end} />;
        const inner =
          p.type === "headline" ? (
            <Headline start={p.start} end={p.end} lines={p.lines ?? []} rotate={p.rotate} img={p.img} scale={p.scale} curve={p.curve} />
          ) : p.type === "wallbox" ? <WallboxPop p={p} /> : p.type === "logo" ? <LogoPop p={p} /> : p.type === "stat" ? <StatPop p={p as unknown as Popup} /> : <IconPop p={p as unknown as Popup} />;
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

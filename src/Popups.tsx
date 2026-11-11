import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import reel from "../data/reel.json";
import { Icon } from "./icons";
import { Phone } from "./Phone";
import { COLORS, fontFamily, POPUP_Y } from "./theme";

type Popup = (typeof reel.popups)[number] & {
  icon?: string;
  text?: string;
  label?: string;
  labelTop?: boolean;
  scale?: number;
  comment?: string;
  typeStart?: number;
  charDur?: number;
  send?: number;
  posted?: number;
};

// Effetto "Pop": scala da 0 a 1 con molla elastica, uscita rapida
const usePop = (start: number, end: number) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = Math.round(start * fps);
  const e = Math.round(end * fps);
  const inScale = spring({ frame: frame - s, fps, config: { damping: 7, stiffness: 170, mass: 0.6 } });
  const out = interpolate(frame, [e - 4, e], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return inScale * out;
};

const IconPop: React.FC<{ p: Popup }> = ({ p }) => {
  const k = usePop(p.start, p.end);
  const frame = useCurrentFrame();
  const wobble = Math.sin(frame / 6) * 4;
  return (
    <div
      style={{
        width: 250,
        height: 250,
        borderRadius: "50%",
        background: COLORS.active,
        border: "10px solid #fff",
        boxShadow: "0 18px 40px rgba(0,0,0,0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transform: `scale(${k}) rotate(${wobble}deg)`,
      }}
    >
      <Icon name={p.icon ?? "sparkle"} size={150} color="#111" />
    </div>
  );
};

const StatPop: React.FC<{ p: Popup }> = ({ p }) => {
  const k = usePop(p.start, p.end);
  const label = (
    <div
      style={{
        fontSize: 54,
        fontWeight: 900,
        color: "#111",
        background: "#fff",
        padding: "6px 22px",
        borderRadius: 12,
        letterSpacing: 1,
      }}
    >
      {p.label}
    </div>
  );
  const long = (p.text ?? "").length > 6;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, transform: `scale(${k * (p.scale ?? 1)})`, fontFamily }}>
      {p.labelTop && label}
      <div
        style={{
          fontSize: long ? 150 : 210,
          fontWeight: 900,
          lineHeight: 1,
          color: COLORS.active,
          WebkitTextStroke: "18px #000",
          paintOrder: "stroke fill",
          textShadow: "0 14px 30px rgba(0,0,0,0.5)",
          whiteSpace: "nowrap",
        }}
      >
        {p.text}
      </div>
      {!p.labelTop && label}
    </div>
  );
};

export const Popups: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, height } = useVideoConfig();
  const t = frame / fps;
  const active = (reel.popups as Popup[]).filter((p) => t >= p.start && t < p.end);
  return (
    <AbsoluteFill>
      {active.map((p, i) => (
        <div
          key={i}
          style={{ position: "absolute", left: 0, right: 0, top: height * (p.type === "phone" ? 0.68 : POPUP_Y), transform: "translateY(-50%)", display: "flex", justifyContent: "center" }}
        >
          {p.type === "phone" ? (
            <Phone
              start={p.start}
              end={p.end}
              typeStart={p.typeStart ?? p.start}
              charDur={p.charDur ?? 0.09}
              send={p.send ?? p.start}
              posted={p.posted ?? p.start}
              comment={p.comment ?? ""}
            />
          ) : p.type === "stat" ? (
            <StatPop p={p} />
          ) : (
            <IconPop p={p} />
          )}
        </div>
      ))}
    </AbsoluteFill>
  );
};

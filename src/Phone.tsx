import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS, fontFamily } from "./theme";

// Telefono con sezione commenti generica: il testo viene digitato,
// inviato e compare in cima alla lista con un cuore.
type Props = { start: number; end: number; typeStart: number; charDur: number; send: number; posted: number; comment: string };

const W = 440;
const H = 760;
const UI = "#161618";
const LINE = "#2a2a2e";
const MUTED = "#8e8e93";

const Avatar: React.FC<{ letter: string; color: string }> = ({ letter, color }) => (
  <div
    style={{
      width: 52,
      height: 52,
      borderRadius: "50%",
      background: color,
      flexShrink: 0,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "#111",
      fontWeight: 900,
      fontSize: 24,
    }}
  >
    {letter}
  </div>
);

const Heart: React.FC<{ filled?: boolean; size?: number }> = ({ filled, size = 26 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? "#ff3b5c" : "none"} stroke={filled ? "#ff3b5c" : MUTED} strokeWidth={2}>
    <path d="M12 20.5 C5 15.5 2.5 12.5 2.5 8.8 A4.6 4.6 0 0 1 12 6.6 A4.6 4.6 0 0 1 21.5 8.8 C21.5 12.5 19 15.5 12 20.5 Z" />
  </svg>
);

const Comment: React.FC<{ name: string; text: React.ReactNode; letter: string; color: string; time: string; liked?: boolean; highlight?: number }> = ({
  name,
  text,
  letter,
  color,
  time,
  liked,
  highlight = 0,
}) => (
  <div
    style={{
      display: "flex",
      gap: 16,
      padding: "16px 22px",
      alignItems: "flex-start",
      background: `rgba(255,215,0,${0.16 * highlight})`,
    }}
  >
    <Avatar letter={letter} color={color} />
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontSize: 20, color: MUTED, fontWeight: 700 }}>
        {name} <span style={{ fontWeight: 600 }}>· {time}</span>
      </div>
      <div style={{ fontSize: 27, color: "#fff", fontWeight: 700, marginTop: 4 }}>{text}</div>
    </div>
    <Heart filled={liked} />
  </div>
);

export const Phone: React.FC<Props> = ({ start, end, typeStart, charDur, send, posted, comment }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  // Entrata: sale dal basso con molla elastica, esce in dissolvenza sull'ultimo frame
  const enter = spring({ frame: frame - Math.round(start * fps), fps, config: { damping: 11, stiffness: 140, mass: 0.7 } });
  const out = interpolate(t, [end - 0.12, end], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const typed = Math.max(0, Math.min(comment.length, Math.floor((t - typeStart) / charDur) + 1));
  const isPosted = t >= posted;
  const inputText = isPosted ? "" : t >= typeStart ? comment.slice(0, typed) : "";
  const cursorOn = Math.floor(t * 2.5) % 2 === 0;
  const pressed = t >= send && t < send + 0.15;
  const pop = spring({ frame: frame - Math.round(posted * fps), fps, config: { damping: 9, stiffness: 200, mass: 0.5 } });
  const glow = isPosted ? interpolate(t, [posted, posted + 1.2], [1, 0.35], { extrapolateRight: "clamp" }) : 0;
  const liked = t >= posted + 0.5;

  return (
    <div
      style={{
        width: W,
        height: H,
        transform: `translateY(${(1 - enter) * 420}px) scale(${0.85 + 0.15 * enter}) rotate(${(1 - enter) * -6}deg)`,
        opacity: out,
        fontFamily,
      }}
    >
      {/* Scocca */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: 64,
          background: "#0b0b0c",
          border: "3px solid #3a3a3e",
          boxShadow: "0 30px 70px rgba(0,0,0,0.6)",
          padding: 14,
        }}
      >
        {/* Schermo */}
        <div style={{ position: "relative", width: "100%", height: "100%", borderRadius: 52, background: UI, overflow: "hidden" }}>
          {/* Isola della fotocamera */}
          <div style={{ position: "absolute", top: 14, left: "50%", width: 120, height: 34, marginLeft: -60, borderRadius: 20, background: "#000" }} />
          {/* Intestazione */}
          <div style={{ paddingTop: 66, textAlign: "center", borderBottom: `2px solid ${LINE}`, paddingBottom: 18 }}>
            <div style={{ width: 60, height: 6, borderRadius: 3, background: "#48484c", margin: "0 auto 16px" }} />
            <div style={{ fontSize: 28, fontWeight: 900, color: "#fff" }}>Commenti</div>
          </div>

          {/* Nuovo commento in cima */}
          {isPosted && (
            <div style={{ transform: `scale(${0.6 + 0.4 * pop})`, transformOrigin: "50% 0%", opacity: pop }}>
              <Comment
                name="tu"
                letter="T"
                color={COLORS.active}
                time="ora"
                liked={liked}
                highlight={glow}
                text={<span style={{ color: COLORS.active, fontSize: 32, fontWeight: 900 }}>{comment}</span>}
              />
            </div>
          )}
          <Comment name="giulia.casa" letter="G" color="#8fd3ff" time="2 min" text="Quanto produce in inverno?" />
          <Comment name="marco_rossi" letter="M" color="#b6f2a0" time="5 min" text="Nero totale, bellissimo" liked />
          <Comment name="ste.energia" letter="S" color="#ffb3c7" time="8 min" text="Info sulla garanzia?" />

          {/* Barra per scrivere */}
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: 0,
              padding: "18px 18px 30px",
              borderTop: `2px solid ${LINE}`,
              background: UI,
              display: "flex",
              alignItems: "center",
              gap: 14,
            }}
          >
            <Avatar letter="T" color={COLORS.active} />
            <div
              style={{
                flex: 1,
                height: 64,
                borderRadius: 32,
                border: `2px solid ${inputText ? COLORS.active : "#3a3a3e"}`,
                display: "flex",
                alignItems: "center",
                padding: "0 22px",
                fontSize: 28,
                fontWeight: 800,
                color: inputText ? "#fff" : MUTED,
                whiteSpace: "nowrap",
                overflow: "hidden",
              }}
            >
              {inputText || (t < typeStart || isPosted ? "Aggiungi un commento..." : "")}
              {!isPosted && t >= typeStart && (
                <span style={{ display: "inline-block", width: 3, height: 34, marginLeft: 3, background: cursorOn ? COLORS.active : "transparent" }} />
              )}
            </div>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                background: inputText ? COLORS.active : "#3a3a3e",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transform: `scale(${pressed ? 0.82 : 1})`,
              }}
            >
              <svg width={30} height={30} viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth={2.8} strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 19 V5 M5.5 11.5 L12 5 L18.5 11.5" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

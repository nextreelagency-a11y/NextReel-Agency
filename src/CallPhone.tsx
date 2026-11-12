import React from "react";
import { AbsoluteFill, Easing, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { fontFamily } from "./theme";

// Telefono 3D che chiama Domus Solaris srl (interfaccia generica, sfondo trasparente).
const GREEN = "#5AAF30";
const YELLOW = "#FFE806";
const W = 560;
const H = 1140;
const DEPTH = 14; // strati per lo spessore

const Ico: React.FC<{ d: React.ReactNode; size?: number; color?: string }> = ({ d, size = 44, color = "#fff" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    {d}
  </svg>
);
const HANDSET = <path d="M5 4 H9 L11 9 L8.5 10.5 A11 11 0 0 0 13.5 15.5 L15 13 L20 15 V19 A2 2 0 0 1 18 21 A16 16 0 0 1 3 6 A2 2 0 0 1 5 4 Z" />;
const BUTTONS: { label: string; icon: React.ReactNode }[] = [
  { label: "muto", icon: <><path d="M12 3 A3 3 0 0 1 15 6 V11 A3 3 0 0 1 9 11 V6 A3 3 0 0 1 12 3 Z" /><path d="M5.5 11 A6.5 6.5 0 0 0 18.5 11 M12 17.5 V21" /><path d="M4 4 L20 20" /></> },
  { label: "tastierino", icon: <>{[6, 12, 18].flatMap((y) => [6, 12, 18].map((x) => <circle key={`${x}${y}`} cx={x} cy={y} r={1.6} fill="#fff" stroke="none" />))}</> },
  { label: "vivavoce", icon: <><path d="M4 9 H8 L13 5 V19 L8 15 H4 Z" /><path d="M16.5 8.5 A5 5 0 0 1 16.5 15.5 M19 6 A8.5 8.5 0 0 1 19 18" /></> },
  { label: "aggiungi", icon: <path d="M12 5 V19 M5 12 H19" /> },
  { label: "video", icon: <><rect x={3} y={7} width={12} height={10} rx={2} /><path d="M15 11 L21 8 V16 L15 13" /></> },
  { label: "contatti", icon: <><circle cx={12} cy={8} r={4} /><path d="M4 20 A8 8 0 0 1 20 20" /></> },
];

export const CallPhone: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  // entrata in 3D, poi resta leggermente inclinato e fluttua
  const enter = spring({ frame, fps, config: { damping: 13, stiffness: 90, mass: 0.9 } });
  const rotY = interpolate(enter, [0, 1], [-62, -16]) + Math.sin(t * 1.6) * 3;
  const rotX = interpolate(enter, [0, 1], [24, 8]) + Math.cos(t * 1.3) * 2;
  const rotZ = interpolate(enter, [0, 1], [8, 2]);
  const ty = interpolate(enter, [0, 1], [900, 0]) + Math.sin(t * 2) * 8;

  const connected = 1.9; // la chiamata risponde dopo 1,9 s
  const isOn = t >= connected;
  const secs = Math.max(0, Math.floor(t - connected));
  const dots = ".".repeat(1 + (Math.floor(t * 3) % 3));
  const glare = interpolate(t, [0.3, 1.6], [-0.4, 1.4], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.quad) });

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", perspective: 2200, fontFamily }}>
      <div style={{ width: W, height: H, position: "relative", transformStyle: "preserve-3d", transform: `translateY(${ty}px) rotateX(${rotX}deg) rotateY(${rotY}deg) rotateZ(${rotZ}deg)` }}>
        {/* spessore: strati sovrapposti */}
        {Array.from({ length: DEPTH }).map((_, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: 96,
              background: i === DEPTH - 1 ? "#1b1d22" : `rgb(${58 - i * 2},${62 - i * 2},${70 - i * 2})`,
              transform: `translateZ(${-(i + 1) * 3}px)`,
            }}
          />
        ))}
        {/* tasti laterali */}
        <div style={{ position: "absolute", left: -6, top: 260, width: 8, height: 90, borderRadius: 4, background: "#5c6069", transform: "translateZ(-20px)" }} />
        <div style={{ position: "absolute", left: -6, top: 380, width: 8, height: 90, borderRadius: 4, background: "#5c6069", transform: "translateZ(-20px)" }} />
        <div style={{ position: "absolute", right: -6, top: 320, width: 8, height: 140, borderRadius: 4, background: "#5c6069", transform: "translateZ(-20px)" }} />

        {/* frontale */}
        <div style={{ position: "absolute", inset: 0, borderRadius: 96, background: "linear-gradient(145deg,#8a8f99,#3a3e46 40%,#9aa0aa 70%,#4a4e56)", padding: 10 }}>
          <div style={{ position: "relative", width: "100%", height: "100%", borderRadius: 86, background: "#000", padding: 12 }}>
            <div
              style={{
                position: "relative",
                width: "100%",
                height: "100%",
                borderRadius: 76,
                overflow: "hidden",
                background: `radial-gradient(circle at 50% 28%, #2f5a24 0%, #14261a 45%, #070b09 100%)`,
                color: "#fff",
              }}
            >
              {/* barra di stato */}
              <div style={{ display: "flex", justifyContent: "space-between", padding: "26px 54px 0", fontSize: 28, fontWeight: 800 }}>
                <span>15:34</span>
                <span style={{ letterSpacing: 4 }}>▮▮▮ ◔</span>
              </div>
              <div style={{ position: "absolute", top: 20, left: "50%", width: 150, height: 44, marginLeft: -75, borderRadius: 24, background: "#000" }} />

              {/* contatto */}
              <div style={{ position: "absolute", top: 110, left: 0, right: 0, display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div style={{ position: "relative", width: 180, height: 180 }}>
                  {!isOn &&
                    [0, 1, 2].map((k) => {
                      const ph = ((t * 0.9 + k / 3) % 1 + 1) % 1;
                      return (
                        <div
                          key={k}
                          style={{
                            position: "absolute",
                            inset: 0,
                            borderRadius: "50%",
                            border: `5px solid ${GREEN}`,
                            transform: `scale(${1 + ph * 0.9})`,
                            opacity: 1 - ph,
                          }}
                        />
                      );
                    })}
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      borderRadius: "50%",
                      background: "#fff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: isOn ? `0 0 0 8px ${GREEN}` : "0 10px 30px rgba(0,0,0,0.5)",
                    }}
                  >
                    <Img src={staticFile("wallbox/domus_mark.png")} style={{ width: 110 }} />
                  </div>
                </div>
                <div style={{ marginTop: 40, fontSize: 50, fontWeight: 900, textAlign: "center", lineHeight: 1.05 }}>Domus Solaris srl</div>
                <div style={{ marginTop: 14, fontSize: 34, fontWeight: 700, color: "#c9d3cc" }}>+39 377 395 5687</div>
                <div style={{ marginTop: 22, fontSize: 32, fontWeight: 800, color: isOn ? GREEN : YELLOW }}>
                  {isOn ? `00:${String(secs).padStart(2, "0")}` : `Chiamata in corso${dots}`}
                </div>
              </div>

              {/* pulsanti */}
              <div style={{ position: "absolute", left: 40, right: 40, bottom: 215, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", rowGap: 26 }}>
                {BUTTONS.map((b) => (
                  <div key={b.label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 100, height: 100, borderRadius: "50%", background: "rgba(255,255,255,0.14)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Ico d={b.icon} />
                    </div>
                    <span style={{ fontSize: 22, fontWeight: 700, color: "#dfe5e1" }}>{b.label}</span>
                  </div>
                ))}
              </div>
              {/* riaggancia */}
              <div style={{ position: "absolute", bottom: 60, left: "50%", marginLeft: -60, width: 120, height: 120, borderRadius: "50%", background: "#e5342f", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 10px 30px rgba(229,52,47,0.45)" }}>
                <div style={{ transform: "rotate(135deg)" }}>
                  <Ico d={HANDSET} size={56} />
                </div>
              </div>

              {/* riflesso sul vetro */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: `linear-gradient(120deg, transparent ${glare * 100 - 18}%, rgba(255,255,255,0.22) ${glare * 100}%, transparent ${glare * 100 + 18}%)`,
                  pointerEvents: "none",
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

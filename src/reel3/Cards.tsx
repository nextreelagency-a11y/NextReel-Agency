import React from "react";
import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { HEADLINE_FONT } from "../Headline";
import { BRAND, LogoMark } from "../wallbox/Logo";

// Animazioni a cartellini (sfondo trasparente) per il reel "Stessa marca":
// checklist SunPower, piano pagamenti, logo finale Domus Solaris.

const INK = "#161616";
const useSpring = (at: number, cfg = { damping: 9, stiffness: 180, mass: 0.6 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - Math.round(at * fps), fps, config: cfg });
};

const Check: React.FC<{ at: number; size?: number }> = ({ at, size = 84 }) => {
  const k = useSpring(at, { damping: 7, stiffness: 220, mass: 0.5 });
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: BRAND.green, border: `5px solid ${INK}`, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${k})`, flexShrink: 0 }}>
      <svg width={size * 0.6} height={size * 0.6} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={3.6} strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12.5 L10 17.5 L19 7" />
      </svg>
    </div>
  );
};

const Ico: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ width: 96, height: 96, borderRadius: 24, background: BRAND.yellow, border: `5px solid ${INK}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
    <svg width={62} height={62} viewBox="0 0 24 24" fill="none" stroke={INK} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      {children}
    </svg>
  </div>
);
export const ICONS = {
  panel: <><path d="M4 5 H20 L22 16 H2 Z" fill="#fff" /><path d="M3 10.5 H21 M9.3 5 L8.6 16 M14.7 5 L15.4 16" /><path d="M12 16 V20 M8 20 H16" /></>,
  inverter: <><rect x={4} y={3} width={16} height={18} rx={2.5} fill="#fff" /><path d="M7 12 C8.5 8.5 10 8.5 12 12 C14 15.5 15.5 15.5 17 12" /><path d="M8 18 H10 M14 18 H16" /></>,
  battery: <><rect x={6} y={4} width={12} height={17} rx={2.5} fill="#fff" /><path d="M10 2.5 H14" /><path d="M12.8 7.5 L9.8 13 H12.6 L11.2 17.5 L14.6 11.5 H11.8 Z" fill={BRAND.green} /></>,
  lock: <><rect x={5} y={11} width={14} height={10} rx={2} fill="#fff" /><path d="M8 11 V8 A4 4 0 0 1 16 8 V11" /></>,
  unlock: <><rect x={5} y={11} width={14} height={10} rx={2} fill="#fff" /><path d="M8 11 V8 A4 4 0 0 1 15.6 6.3" /></>,
  plug: <><path d="M9 3 V7 M15 3 V7" /><path d="M6 7 H18 V11 A6 6 0 0 1 6 11 Z" fill="#fff" /><path d="M12 17 V21" /></>,
};

const Pill: React.FC<{ at: number; children: React.ReactNode; tint?: string }> = ({ at, children, tint = "#fff" }) => {
  const k = useSpring(at);
  return (
    <div
      style={{
        width: 860,
        display: "flex",
        alignItems: "center",
        gap: 26,
        padding: "20px 26px",
        background: tint,
        borderRadius: 30,
        border: `5px solid ${INK}`,
        boxShadow: `9px 11px 0 ${INK}`,
        transform: `translateX(${(1 - k) * -140}px) scale(${0.6 + 0.4 * k})`,
        opacity: Math.min(1, k * 1.6),
      }}
    >
      {children}
    </div>
  );
};
const Label: React.FC<{ children: React.ReactNode; size?: number; color?: string }> = ({ children, size = 64, color = INK }) => (
  <div style={{ flex: 1, fontFamily: HEADLINE_FONT, fontWeight: 900, fontSize: size, color, lineHeight: 1 }}>{children}</div>
);

// --- Checklist "tutto SunPower" ---
export const ChecklistSunPower: React.FC = () => {
  const logo = useSpring(0);
  const rows: [keyof typeof ICONS, string][] = [
    ["panel", "PANNELLI"],
    ["inverter", "INVERTER"],
    ["battery", "ACCUMULO"],
  ];
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", gap: 34, flexDirection: "column" }}>
      <div style={{ transform: `scale(${logo})`, background: "#fff", borderRadius: 26, padding: "26px 40px", border: `5px solid ${INK}`, boxShadow: `9px 11px 0 ${INK}`, marginBottom: 10 }}>
        <Img src={staticFile("wallbox/sunpower.png")} style={{ width: 620, display: "block" }} />
      </div>
      {rows.map(([ic, txt], i) => (
        <Pill key={txt} at={0.35 + i * 0.35}>
          <Ico>{ICONS[ic]}</Ico>
          <Label>{txt}</Label>
          <Check at={0.65 + i * 0.35} />
        </Pill>
      ))}
    </AbsoluteFill>
  );
};

// --- Piano pagamenti: l'ultima rata si sblocca con l'allaccio alla rete ---
export const PianoPagamenti: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const UNLOCK = 2.3;
  const title = useSpring(0);
  const plugIn = interpolate(t, [1.5, 2.2], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const unlocked = t >= UNLOCK;
  const glow = unlocked ? interpolate(t, [UNLOCK, UNLOCK + 0.6], [1, 0.4], { extrapolateRight: "clamp" }) : 0;
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", gap: 28, flexDirection: "column" }}>
      <div style={{ transform: `scale(${title})`, fontFamily: HEADLINE_FONT, fontSize: 92, color: "#fff", WebkitTextStroke: `6px ${INK}`, paintOrder: "stroke fill", textShadow: `6px 7px 0 ${INK}`, marginBottom: 6 }}>
        PAGAMENTI
      </div>
      {["RATA 1", "RATA 2", "RATA 3"].map((r, i) => (
        <Pill key={r} at={0.2 + i * 0.22}>
          <Label size={58}>{r}</Label>
          <Check at={0.45 + i * 0.22} size={76} />
        </Pill>
      ))}
      <Pill at={0.9} tint={unlocked ? "#eaf6e3" : "#fff"}>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
          <Label size={58}>ULTIMA RATA</Label>
          <div style={{ fontFamily: HEADLINE_FONT, fontSize: 30, whiteSpace: "nowrap", color: unlocked ? BRAND.green : "#7a7a7a" }}>DOPO L'ALLACCIO ALLA RETE</div>
        </div>
        {/* spina che entra nella presa */}
        <div style={{ position: "relative", width: 90, height: 90, flexShrink: 0 }}>
          <div style={{ position: "absolute", left: 0, top: (1 - plugIn) * -70, opacity: unlocked ? 0 : 1 }}>
            <Ico>{ICONS.plug}</Ico>
          </div>
        </div>
        {unlocked ? (
          <Check at={UNLOCK} size={76} />
        ) : (
          <div style={{ width: 76, height: 76, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width={70} height={70} viewBox="0 0 24 24" fill="none" stroke={INK} strokeWidth={2.2} strokeLinecap="round">
              {ICONS.lock}
            </svg>
          </div>
        )}
      </Pill>
      {unlocked && <div style={{ position: "absolute", width: 900, height: 200, bottom: "33%", borderRadius: 40, background: BRAND.green, filter: "blur(60px)", opacity: glow * 0.5, zIndex: -1 }} />}
    </AbsoluteFill>
  );
};

// --- Logo finale Domus Solaris ---
export const LogoDomus: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const card = useSpring(0, { damping: 11, stiffness: 140, mass: 0.7 });
  const mark = useSpring(0.15, { damping: 8, stiffness: 160, mass: 0.6 });
  const reveal = interpolate(t, [0.35, 0.9], [0, 100], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const sub = useSpring(0.8);
  const sweep = interpolate(t, [1.1, 1.8], [-30, 130], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 22 }}>
      <div
        style={{
          position: "relative",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          gap: 30,
          padding: "40px 56px",
          background: "#fff",
          borderRadius: 40,
          border: `5px solid ${INK}`,
          boxShadow: `10px 12px 0 ${INK}`,
          transform: `scale(${card})`,
        }}
      >
        <div style={{ transform: `scale(${mark}) rotate(${(1 - mark) * -90}deg)` }}>
          <LogoMark size={190} />
        </div>
        <div style={{ clipPath: `inset(0 ${100 - reveal}% 0 0)`, display: "flex", flexDirection: "column", lineHeight: 0.95, fontFamily: "Montserrat, sans-serif" }}>
          <span style={{ color: BRAND.green, fontWeight: 500, fontSize: 104, letterSpacing: 14 }}>Domus</span>
          <span style={{ color: BRAND.yellow, fontWeight: 900, fontSize: 98, letterSpacing: 12, WebkitTextStroke: "1.5px #d9c400" }}>SOLARIS</span>
        </div>
        <div style={{ position: "absolute", inset: 0, background: `linear-gradient(115deg, transparent ${sweep - 12}%, rgba(255,255,255,0.85) ${sweep}%, transparent ${sweep + 12}%)` }} />
      </div>
      <div style={{ transform: `scale(${sub})`, fontFamily: HEADLINE_FONT, fontSize: 52, color: "#fff", WebkitTextStroke: `5px ${INK}`, paintOrder: "stroke fill", textShadow: `5px 6px 0 ${INK}` }}>
        IMPIANTI FOTOVOLTAICI
      </div>
    </AbsoluteFill>
  );
};

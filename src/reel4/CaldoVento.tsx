import React from "react";
import { AbsoluteFill, Easing, interpolate, interpolateColors, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Headline, PALETTE } from "../Headline";

// Animazione illustrata: "il caldo riduce le prestazioni dei pannelli,
// mentre il vento del lago può aiutarli a restare freschi e a produrre meglio".
// Tempi locali (0 = "il caldo" a 13,90 s nel video).
const SWITCH = 1.94; // "mentre"
const WIND = 2.36; // "vento"
const BETTER = 4.74; // "produrre meglio"
const INK = "#161616";
const RED = "#ff3b2f";
const COOL = "#5cc8ff";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const Sun: React.FC<{ t: number; heat: number }> = ({ t, heat }) => (
  <svg width={300} height={300} viewBox="-100 -100 200 200" style={{ overflow: "visible", filter: `drop-shadow(8px 10px 0 ${INK})` }}>
    <g transform={`rotate(${t * 25})`}>
      {Array.from({ length: 12 }, (_, i) => i * 30).map((a) => (
        <path key={a} d={`M-11 -58 L0 ${-88 - heat * 14} L11 -58 Z`} transform={`rotate(${a})`} fill={PALETTE.yellow} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
      ))}
    </g>
    <circle r={54} fill={interpolateColors(heat, [0, 1], [PALETTE.yellow, "#ffb000"])} stroke={INK} strokeWidth={7} />
    <circle cx={-17} cy={-19} r={14} fill="#fff" opacity={0.55} />
  </svg>
);

// pannello in prospettiva (vista dal basso, inclinato) con le celle
const Panel: React.FC<{ tint: string; tintOp: number }> = ({ tint, tintOp }) => {
  const cells = [];
  for (let r = 0; r < 4; r++)
    for (let c = 0; c < 6; c++) {
      // interpolazione bilineare dentro il trapezio
      const quad = (u: number, v: number) => {
        const top = { x: 150 + 400 * u, y: 0 };
        const bot = { x: 0 + 700 * u, y: 380 };
        return { x: top.x + (bot.x - top.x) * v, y: top.y + (bot.y - top.y) * v };
      };
      const g = 0.015;
      const p1 = quad(c / 6 + g, r / 4 + g);
      const p2 = quad((c + 1) / 6 - g, r / 4 + g);
      const p3 = quad((c + 1) / 6 - g, (r + 1) / 4 - g);
      const p4 = quad(c / 6 + g, (r + 1) / 4 - g);
      cells.push(<path key={`${r}${c}`} d={`M${p1.x} ${p1.y} L${p2.x} ${p2.y} L${p3.x} ${p3.y} L${p4.x} ${p4.y} Z`} fill="#141a24" stroke="#3a4558" strokeWidth={2} />);
    }
  return (
    <svg width={700} height={460} viewBox="-10 -10 720 480" style={{ overflow: "visible", filter: `drop-shadow(10px 12px 0 ${INK})` }}>
      {/* supporti */}
      <path d="M180 380 L160 460 M520 380 L540 460" stroke="#9aa3ad" strokeWidth={14} strokeLinecap="round" />
      <path d="M150 0 L550 0 L700 380 L0 380 Z" fill="#dfe4ea" stroke={INK} strokeWidth={8} strokeLinejoin="round" />
      <g transform="translate(0 0)">{cells}</g>
      <path d="M150 0 L550 0 L700 380 L0 380 Z" fill={tint} opacity={tintOp} />
      <path d="M210 30 L330 30 L250 350 L80 350 Z" fill="#fff" opacity={0.08} />
    </svg>
  );
};

const Thermo: React.FC<{ level: number; color: string }> = ({ level, color }) => (
  <svg width={130} height={460} viewBox="0 0 130 460" style={{ filter: `drop-shadow(8px 10px 0 ${INK})` }}>
    <rect x={40} y={10} width={50} height={360} rx={25} fill="#fff" stroke={INK} strokeWidth={7} />
    <circle cx={65} cy={395} r={55} fill={color} stroke={INK} strokeWidth={7} />
    <rect x={52} y={30 + 330 * (1 - level)} width={26} height={340 - 330 * (1 - level)} rx={13} fill={color} />
    {[0, 1, 2, 3, 4].map((i) => (
      <line key={i} x1={92} x2={110} y1={60 + i * 70} y2={60 + i * 70} stroke={INK} strokeWidth={6} strokeLinecap="round" />
    ))}
  </svg>
);

const Arrow: React.FC<{ up: boolean; color: string; k: number }> = ({ up, color, k }) => (
  <svg width={110} height={130} viewBox="0 0 24 28" style={{ transform: `scale(${k}) rotate(${up ? 0 : 180}deg)`, filter: `drop-shadow(6px 7px 0 ${INK})` }}>
    <path d="M12 2 L22 13 H16 V26 H8 V13 H2 Z" fill={color} stroke={INK} strokeWidth={1.6} strokeLinejoin="round" />
  </svg>
);

export const CaldoVento: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();
  const t = frame / fps;

  const intro = spring({ frame, fps, config: { damping: 12, stiffness: 140 } });
  const heat = interpolate(t, [0.1, 1.6], [0, 1], { ...clamp, easing: Easing.out(Easing.quad) });
  const cool = interpolate(t, [WIND, WIND + 1.6], [0, 1], { ...clamp, easing: Easing.inOut(Easing.quad) });
  const hot = heat * (1 - cool);

  const thermo = 0.35 + 0.55 * heat - 0.6 * cool;
  const thermoColor = interpolateColors(cool, [0, 1], [RED, COOL]);
  const prod = 1 - 0.35 * heat + 0.4 * cool; // barra produzione
  const prodColor = interpolateColors(prod, [0.65, 1], [RED, PALETTE.green]);
  const downK = spring({ frame: frame - Math.round(0.6 * fps), fps, config: { damping: 8, stiffness: 200, mass: 0.5 } }) * (1 - interpolate(t, [SWITCH, SWITCH + 0.15], [0, 1], clamp));
  const upK = spring({ frame: frame - Math.round(BETTER * fps - 6), fps, config: { damping: 8, stiffness: 200, mass: 0.5 } });

  const panelTint = interpolateColors(cool, [0, 1], [RED, COOL]);
  const panelTintOp = 0.45 * hot + 0.28 * cool * (1 - interpolate(t, [WIND + 2.2, WIND + 2.9], [0, 1], clamp));

  return (
    <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 40%, #183a57 0%, #0b1a28 60%, #060e16 100%)", overflow: "hidden" }}>
      {/* bagliore caldo dall'alto, che svanisce col vento */}
      <AbsoluteFill style={{ background: `radial-gradient(circle at 78% 18%, rgba(255,120,30,${0.55 * hot}) 0%, transparent 55%)` }} />

      {/* titoli */}
      <div style={{ position: "absolute", top: 210, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
        {t < SWITCH ? (
          <Headline start={0.1} end={SWITCH} lines={[{ text: "IL CALDO", color: "yellow", size: 120 }, { text: "RIDUCE LE PRESTAZIONI", color: "white", size: 64 }]} />
        ) : (
          <Headline start={SWITCH + 0.05} end={99} lines={[{ text: "IL VENTO DEL LAGO", color: "white", size: 84 }, { text: "LI RINFRESCA", color: "green", size: 112 }]} />
        )}
      </div>

      {/* sole */}
      <div style={{ position: "absolute", left: 700, top: 470, transform: `scale(${intro * (1 - 0.25 * cool)})`, opacity: 1 - 0.3 * cool }}>
        <Sun t={t} heat={hot} />
      </div>

      {/* onde di calore che salgono dal pannello */}
      <svg width={width} height={1920} style={{ position: "absolute", inset: 0, opacity: hot }}>
        {[0, 1, 2, 3, 4].map((i) => {
          const ph = ((t * 0.9 + i / 5) % 1 + 1) % 1;
          const x = 260 + i * 140;
          const y = 900 - ph * 260;
          return (
            <path
              key={i}
              d={`M${x} ${y} q 22 -30 0 -60 q -22 -30 0 -60`}
              fill="none"
              stroke={i % 2 ? "#ff7a2f" : RED}
              strokeWidth={14}
              strokeLinecap="round"
              opacity={Math.sin(ph * Math.PI)}
            />
          );
        })}
      </svg>

      {/* pannello */}
      <div style={{ position: "absolute", left: 200, top: 860, transform: `scale(${intro})`, transformOrigin: "50% 50%" }}>
        <Panel tint={panelTint} tintOp={panelTintOp} />
      </div>

      {/* termometro */}
      <div style={{ position: "absolute", left: 50, top: 820, transform: `scale(${intro * 0.85})` }}>
        <Thermo level={Math.max(0.08, Math.min(1, thermo))} color={thermoColor} />
      </div>

      {/* vento: folate con frecce che arrivano dal lago */}
      <svg width={width} height={1920} style={{ position: "absolute", inset: 0 }}>
        {[0, 1, 2, 3, 4, 5].map((i) => {
          const start = WIND - 0.1 + i * 0.12;
          const p = ((t - start) * 0.75) % 1;
          if (t < start) return null;
          const y = 1330 - i * 78;
          const x = -500 + p * 1900;
          const op = Math.sin(Math.min(1, p) * Math.PI);
          return (
            <g key={i} opacity={op}>
              <path d={`M${x} ${y} C ${x + 120} ${y - 50}, ${x + 260} ${y + 40}, ${x + 420} ${y - 20}`} fill="none" stroke="#e8f7ff" strokeWidth={16} strokeLinecap="round" style={{ filter: "drop-shadow(0 0 10px rgba(92,200,255,0.9))" }} />
              <path d={`M${x + 400} ${y - 50} L${x + 440} ${y - 18} L${x + 398} ${y + 12}`} fill="none" stroke="#e8f7ff" strokeWidth={16} strokeLinecap="round" strokeLinejoin="round" />
            </g>
          );
        })}
      </svg>

      {/* barra di produzione */}
      <div style={{ position: "absolute", left: 120, top: 1430, width: 840, transform: `scale(${intro})` }}>
        <div style={{ fontFamily: "'Rubik Black', sans-serif", fontSize: 46, color: "#fff", WebkitTextStroke: `5px ${INK}`, paintOrder: "stroke fill", textShadow: `5px 6px 0 ${INK}`, marginBottom: 12 }}>
          PRODUZIONE
        </div>
        <div style={{ height: 70, borderRadius: 35, background: "#fff", border: `6px solid ${INK}`, boxShadow: `8px 10px 0 ${INK}`, padding: 6 }}>
          <div style={{ width: `${Math.max(0.1, Math.min(1, prod)) * 100}%`, height: "100%", borderRadius: 28, background: prodColor }} />
        </div>
      </div>
      <div style={{ position: "absolute", left: 860, top: 1290 }}>
        {t < SWITCH + 0.2 ? <Arrow up={false} color={RED} k={downK} /> : <Arrow up color={PALETTE.green} k={upK} />}
      </div>
      {t > BETTER - 0.2 && (
        <div style={{ position: "absolute", top: 1590, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
          <Headline start={BETTER} end={99} lines={[{ text: "PRODUCE MEGLIO", color: "yellow", size: 86 }]} />
        </div>
      )}

      {/* lago in basso */}
      <svg width={width} height={300} viewBox="0 0 1080 300" style={{ position: "absolute", left: 0, bottom: 0 }}>
        {[0, 1, 2].map((i) => {
          const off = (t * (40 + i * 20)) % 240;
          const y = 120 + i * 60;
          let d = `M${-240 + off} ${y}`;
          for (let x = -240; x < 1400; x += 120) d += ` q 30 -26 60 0 t 60 0`;
          return <path key={i} d={d + ` V300 H-300 Z`} fill={["#2f7fc4", "#2369a8", "#1a548a"][i]} stroke={INK} strokeWidth={5} />;
        })}
      </svg>
      <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 50%, transparent 60%, rgba(0,0,0,0.45) 100%)" }} />
    </AbsoluteFill>
  );
};

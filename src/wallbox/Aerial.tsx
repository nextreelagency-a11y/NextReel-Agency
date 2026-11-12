import React from "react";
import { AbsoluteFill, Easing, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { fontFamily } from "../theme";
import { BRAND } from "./Logo";

// Ripresa "drone" illustrata: tetto con 20 pannelli total black -> la camera si allarga
// sulla casa e sul vialetto -> l'auto elettrica si ricarica dalla wallbox.

const PANEL_W = 66;
const PANEL_H = 112;
const ROOF = { x: 150, y: 210, w: 780, h: 780 };
const RIDGE = ROOF.y + ROOF.h * 0.47;
const WALL_Y = ROOF.y + ROOF.h; // facciata sul vialetto
const WB = { x: 740, y: WALL_Y + 4 }; // wallbox sul muro
const CAR = { x: 680, y: 1150, w: 230, h: 470 };
const PORT = { x: CAR.x + 36, y: CAR.y + 58 };

const Panels: React.FC<{ glint: number }> = ({ glint }) => {
  const cols = 10;
  const rows = 2;
  const gx = 7;
  const gy = 10;
  const totalW = cols * PANEL_W + (cols - 1) * gx;
  const x0 = ROOF.x + (ROOF.w - totalW) / 2;
  const y0 = RIDGE + 40;
  const out = [];
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++) {
      const x = x0 + c * (PANEL_W + gx);
      const y = y0 + r * (PANEL_H + gy);
      out.push(
        <g key={`${r}-${c}`}>
          <rect x={x} y={y} width={PANEL_W} height={PANEL_H} rx={3} fill="#0b0c10" stroke="#23262e" strokeWidth={2} />
          {[1, 2, 3, 4, 5].map((k) => (
            <line key={k} x1={x + 3} x2={x + PANEL_W - 3} y1={y + (PANEL_H / 6) * k} y2={y + (PANEL_H / 6) * k} stroke="#16181e" strokeWidth={1.2} />
          ))}
          {[1, 2].map((k) => (
            <line key={`v${k}`} y1={y + 3} y2={y + PANEL_H - 3} x1={x + (PANEL_W / 3) * k} x2={x + (PANEL_W / 3) * k} stroke="#16181e" strokeWidth={1.2} />
          ))}
        </g>,
      );
    }
  // riflesso del sole che scorre sui moduli
  const gxPos = x0 - 300 + glint * (totalW + 600);
  return (
    <g>
      <defs>
        <linearGradient id="glint" x1="0" x2="1" y1="0" y2="0.4">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.5" stopColor="#fff" stopOpacity="0.28" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <clipPath id="panelsClip">
          <rect x={x0} y={y0} width={totalW} height={rows * PANEL_H + gy} />
        </clipPath>
      </defs>
      {out}
      <rect x={gxPos} y={y0 - 50} width={220} height={rows * PANEL_H + 150} fill="url(#glint)" clipPath="url(#panelsClip)" transform={`skewX(-20)`} />
    </g>
  );
};

const Car: React.FC = () => (
  <g transform={`translate(${CAR.x} ${CAR.y})`}>
    <ellipse cx={CAR.w / 2} cy={CAR.h / 2 + 14} rx={CAR.w / 2 + 10} ry={CAR.h / 2 + 6} fill="rgba(0,0,0,0.28)" />
    {/* ruote */}
    {[
      [-8, 70],
      [CAR.w - 14, 70],
      [-8, CAR.h - 130],
      [CAR.w - 14, CAR.h - 130],
    ].map(([x, y], i) => (
      <rect key={i} x={x} y={y} width={22} height={70} rx={8} fill="#15161a" />
    ))}
    <rect x={0} y={0} width={CAR.w} height={CAR.h} rx={70} fill="#e9ebef" stroke="#c3c7ce" strokeWidth={3} />
    {/* parabrezza, tetto in vetro, lunotto */}
    <path d={`M28 140 Q${CAR.w / 2} 100 ${CAR.w - 28} 140 L${CAR.w - 36} 196 H36 Z`} fill="#1d2733" />
    <rect x={36} y={200} width={CAR.w - 72} height={150} rx={18} fill="#121820" />
    <path d={`M36 354 H${CAR.w - 36} L${CAR.w - 30} 400 Q${CAR.w / 2} 420 30 400 Z`} fill="#1d2733" />
    <path d={`M44 214 L90 214 L60 336 L44 336 Z`} fill="rgba(255,255,255,0.08)" />
    {/* specchietti e fari */}
    <rect x={-16} y={170} width={22} height={14} rx={5} fill="#d5d8de" />
    <rect x={CAR.w - 6} y={170} width={22} height={14} rx={5} fill="#d5d8de" />
    <rect x={26} y={14} width={58} height={10} rx={5} fill="#cfe9ff" />
    <rect x={CAR.w - 84} y={14} width={58} height={10} rx={5} fill="#cfe9ff" />
    <rect x={30} y={CAR.h - 20} width={CAR.w - 60} height={8} rx={4} fill="#d6403a" />
  </g>
);

export const Aerial: React.FC<{ start: number; end: number }> = ({ start, end }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const u = frame / fps - start;
  const D = end - start;

  // camera: stretto sul tetto -> casa intera -> avvicinamento su auto e wallbox
  const k1 = interpolate(u, [0, 1.25], [0, 1], { extrapolateRight: "clamp", easing: Easing.inOut(Easing.cubic) });
  const k2 = interpolate(u, [1.6, D], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.quad) });
  const scale = interpolate(k1, [0, 1], [2.3, 1.0]) * interpolate(k2, [0, 1], [1, 1.18]);
  const cx = 540;
  const cy = interpolate(k1, [0, 1], [RIDGE + 150, 960]) + 220 * k2;
  const rot = interpolate(u, [0, D], [-4, 2]);


  // energia: tetto -> wallbox -> auto
  const flowOn = interpolate(u, [1.0, 1.3], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const dash = -u * 260;
  const charge = interpolate(u, [1.3, D - 0.1], [38, 100], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const card = spring({ frame: frame - Math.round((start + 1.35) * fps), fps, config: { damping: 9, stiffness: 160, mass: 0.6 } });
  const led = 0.55 + 0.45 * Math.sin(u * 10);

  const energyPath = `M540 ${RIDGE + 160} C 560 ${WALL_Y - 120}, ${WB.x - 40} ${WALL_Y - 40}, ${WB.x} ${WB.y + 10}`;
  const cablePath = `M${WB.x} ${WB.y + 16} C ${WB.x - 10} ${WB.y + 110}, ${PORT.x + 30} ${PORT.y - 70}, ${PORT.x} ${PORT.y}`;

  return (
    <AbsoluteFill style={{ backgroundColor: "#5f9a45", overflow: "hidden", fontFamily }}>
      <svg width={width} height={height} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <pattern id="grass" width="40" height="40" patternUnits="userSpaceOnUse">
            <rect width="40" height="40" fill="#5f9a45" />
            <path d="M0 10 H40 M0 30 H40" stroke="#68a54d" strokeWidth="8" />
          </pattern>
          <pattern id="tiles" width="34" height="26" patternUnits="userSpaceOnUse">
            <rect width="34" height="26" fill="#a9512f" />
            <path d="M0 25 H34 M17 0 V13 M0 13 H34 M0 13 V26 M34 13 V26" stroke="#8c4024" strokeWidth="2" />
          </pattern>
          <pattern id="paving" width="60" height="30" patternUnits="userSpaceOnUse">
            <rect width="60" height="30" fill="#bdbab3" />
            <path d="M0 29 H60 M30 0 V15 M0 15 H60 M0 15 V30 M60 15 V30" stroke="#a9a69f" strokeWidth="2" />
          </pattern>
        </defs>
        <g transform={`translate(${width / 2} ${height / 2}) rotate(${rot}) scale(${scale}) translate(${-cx} ${-cy})`}>
          <rect x={-1500} y={-1500} width={4200} height={5000} fill="url(#grass)" />
          {/* vialetto */}
          <rect x={430} y={WALL_Y} width={560} height={1100} fill="url(#paving)" />
          {/* siepe e alberi */}
          {[
            [70, 1180, 90],
            [60, 1420, 110],
            [1010, 300, 100],
            [1030, 560, 80],
            [90, 120, 120],
          ].map(([x, y, r], i) => (
            <g key={i}>
              <circle cx={x + 10} cy={y + 14} r={r} fill="rgba(0,0,0,0.25)" />
              <circle cx={x} cy={y} r={r} fill="#3f7a32" />
              <circle cx={x - r * 0.3} cy={y - r * 0.3} r={r * 0.55} fill="#4f8f3e" />
            </g>
          ))}
          {/* casa: ombra, tetto a due falde */}
          <rect x={ROOF.x + 18} y={ROOF.y + 22} width={ROOF.w} height={ROOF.h} fill="rgba(0,0,0,0.3)" />
          <rect x={ROOF.x} y={ROOF.y} width={ROOF.w} height={RIDGE - ROOF.y} fill="url(#tiles)" />
          <rect x={ROOF.x} y={RIDGE} width={ROOF.w} height={ROOF.y + ROOF.h - RIDGE} fill="url(#tiles)" />
          <rect x={ROOF.x} y={RIDGE} width={ROOF.w} height={ROOF.y + ROOF.h - RIDGE} fill="rgba(0,0,0,0.12)" />
          <line x1={ROOF.x} x2={ROOF.x + ROOF.w} y1={RIDGE} y2={RIDGE} stroke="#6f2f18" strokeWidth={10} />
          <Panels glint={interpolate(u, [0.1, 1.4], [0, 1], { extrapolateRight: "clamp" })} />
          {/* gronda */}
          <rect x={ROOF.x} y={WALL_Y - 8} width={ROOF.w} height={10} fill="#5b2a17" />
          {/* wallbox vista dall'alto */}
          <rect x={WB.x - 22} y={WB.y} width={44} height={20} rx={4} fill="#111" stroke="#e8e8e8" strokeWidth={3} />
          <rect x={WB.x - 14} y={WB.y + 4} width={28} height={4} rx={2} fill={BRAND.green} opacity={led} />
          <Car />
          {/* flusso di energia e cavo */}
          <path d={energyPath} fill="none" stroke={BRAND.yellow} strokeWidth={10} strokeLinecap="round" strokeDasharray="4 26" strokeDashoffset={dash} opacity={flowOn} />
          <path d={cablePath} fill="none" stroke="#1a1a1a" strokeWidth={9} strokeLinecap="round" />
          <path d={cablePath} fill="none" stroke={BRAND.green} strokeWidth={6} strokeLinecap="round" strokeDasharray="4 22" strokeDashoffset={dash} opacity={flowOn} />
          <circle cx={PORT.x} cy={PORT.y} r={9} fill={BRAND.green} opacity={flowOn * led} />
        </g>
      </svg>

      {/* scheda wallbox + batteria in carica */}
      <div
        style={{
          position: "absolute",
          left: 70,
          top: 1330,
          transform: `scale(${card})`,
          transformOrigin: "0% 50%",
          display: "flex",
          alignItems: "center",
          gap: 22,
          background: "rgba(10,12,16,0.82)",
          borderRadius: 32,
          padding: "22px 28px",
          border: "3px solid rgba(255,255,255,0.15)",
          boxShadow: "0 20px 50px rgba(0,0,0,0.45)",
        }}
      >
        <div style={{ position: "relative" }}>
          <div style={{ position: "absolute", left: 40, top: 70, width: 70, height: 16, borderRadius: 8, background: BRAND.green, filter: "blur(14px)", opacity: led }} />
          <Img src={staticFile("wallbox/wallbox.png")} style={{ height: 300, display: "block", position: "relative" }} />
        </div>
        <div style={{ color: "#fff", display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ fontSize: 34, fontWeight: 900, color: BRAND.green, letterSpacing: 1 }}>IN RICARICA</div>
          <div style={{ width: 240, height: 70, borderRadius: 14, border: "5px solid #fff", padding: 6, position: "relative" }}>
            <div style={{ width: `${charge}%`, height: "100%", borderRadius: 7, background: BRAND.green }} />
            <div style={{ position: "absolute", right: -16, top: 18, width: 10, height: 24, borderRadius: 3, background: "#fff" }} />
          </div>
          <div style={{ fontSize: 56, fontWeight: 900 }}>{Math.round(charge)}%</div>
          <div style={{ fontSize: 26, fontWeight: 800, color: "#c9cdd4" }}>ENERGIA DAL TETTO</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

import React from "react";
import {
  AbsoluteFill,
  continueRender,
  delayRender,
  Easing,
  Img,
  interpolate,
  interpolateColors,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

// "Il caldo riduce le prestazioni dei pannelli, mentre il vento del lago può aiutarli
// a restare freschi e a produrre meglio" — motion graphic in stile spot di brand:
// sfondi pieni, prodotto fotorealistico, nastri curvi, testi condensati in corsivo.
// Tempi locali (0 = "il caldo" a 13,90 s nel video).
const SWITCH = 1.94; // "mentre"
const WIND = 2.36; // "vento"
const INK = "#121212";
const HOT_BG = "#fbe7cf";
const HOT = "#e8361f";
const LAKE = "#0d4f86";
const YELLOW = "#FFE806";
const GREEN = "#5AAF30";
const COND = "'Anton', Impact, sans-serif";
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const easeOut = Easing.bezier(0.16, 1, 0.3, 1);

if (typeof document !== "undefined") {
  const h = delayRender("Font Anton");
  new FontFace("Anton", `url(${staticFile("fonts/Anton-latin.woff2")}) format("woff2")`)
    .load()
    .then((f) => {
      document.fonts.add(f);
      continueRender(h);
    })
    .catch(() => continueRender(h));
}

// riga di testo che sale da una maschera
const Line: React.FC<{ at: number; size: number; color: string; outline?: boolean; children: React.ReactNode }> = ({ at, size, color, outline, children }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = interpolate(frame / fps, [at, at + 0.45], [0, 1], { ...clamp, easing: easeOut });
  return (
    <div style={{ overflow: "hidden", lineHeight: 0.98, paddingRight: 30 }}>
      <div
        style={{
          fontFamily: COND,
          fontSize: size,
          fontStyle: "italic",
          transform: `translateY(${(1 - p) * 110}%) skewX(-8deg)`,
          color: outline ? "transparent" : color,
          WebkitTextStroke: outline ? `4px ${color}` : undefined,
          whiteSpace: "nowrap",
          letterSpacing: 1,
        }}
      >
        {children}
      </div>
    </div>
  );
};

// nastro curvo che si disegna
const Ribbon: React.FC<{ d: string; color: string; w: number; at: number; dur: number; len?: number; tail?: boolean }> = ({ d, color, w, at, dur, len = 3000, tail }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const p = interpolate(t, [at, at + dur], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  // con tail il nastro scorre via (effetto folata), altrimenti resta disegnato
  const q = tail ? interpolate(t, [at + dur * 0.45, at + dur * 1.25], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) }) : 0;
  return (
    <path
      d={d}
      fill="none"
      stroke={color}
      strokeWidth={w}
      strokeLinecap="round"
      strokeDasharray={`${len * (p - q)} ${len * 2}`}
      strokeDashoffset={-len * q}
    />
  );
};

// grafico a linea delle prestazioni
const Chart: React.FC<{ t: number }> = ({ t }) => {
  const down = interpolate(t, [0.55, 1.8], [0, 1], { ...clamp, easing: Easing.inOut(Easing.quad) });
  const up = interpolate(t, [WIND + 0.3, WIND + 2.2], [0, 1], { ...clamp, easing: Easing.inOut(Easing.quad) });
  const ptsDown = [[0, 30], [70, 34], [140, 60], [210, 95], [280, 140]];
  const ptsUp = [[280, 140], [350, 110], [420, 70], [490, 38], [560, 12]];
  const cut = (pts: number[][], f: number) => {
    const n = (pts.length - 1) * f;
    const i = Math.floor(n);
    const out = pts.slice(0, i + 1);
    if (i < pts.length - 1) {
      const k = n - i;
      out.push([pts[i][0] + (pts[i + 1][0] - pts[i][0]) * k, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * k]);
    }
    return out;
  };
  const a = cut(ptsDown, down);
  const b = up > 0 ? cut(ptsUp, up) : [];
  const last = b.length ? b[b.length - 1] : a[a.length - 1];
  const isUp = up > 0.02;
  return (
    <svg width={600} height={190} viewBox="-20 -20 600 190" style={{ overflow: "visible" }}>
      <line x1={0} x2={560} y1={170} y2={170} stroke="currentColor" strokeOpacity={0.35} strokeWidth={3} />
      <polyline points={a.map((p) => p.join(",")).join(" ")} fill="none" stroke={HOT} strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" />
      {b.length > 0 && <polyline points={b.map((p) => p.join(",")).join(" ")} fill="none" stroke={GREEN} strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" />}
      <circle cx={last[0]} cy={last[1]} r={16} fill={isUp ? GREEN : HOT} stroke="#fff" strokeWidth={5} />
    </svg>
  );
};

export const CaldoVento: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const t = frame / fps;

  // passaggio caldo -> lago: cerchio che si espande dal pannello
  const wipe = interpolate(t, [SWITCH, SWITCH + 0.5], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const isWind = t >= SWITCH;
  const ink = isWind ? "#fff" : INK;

  // pannello fotorealistico
  const enter = spring({ frame: frame - 2, fps, config: { damping: 15, stiffness: 90, mass: 0.9 } });
  const float = Math.sin(t * 1.6) * 10;
  const panelRot = interpolate(enter, [0, 1], [28, -8]) + interpolate(t, [SWITCH, SWITCH + 0.8], [0, 4], clamp);
  const heat = interpolate(t, [0.3, 1.6], [0, 1], clamp) * (1 - interpolate(t, [WIND, WIND + 1.2], [0, 1], clamp));
  const coolGlow = interpolate(t, [WIND, WIND + 1.2], [0, 1], clamp);

  // sole
  const sun = spring({ frame: frame - 4, fps, config: { damping: 14, stiffness: 120 } }) * (1 - wipe);
  const pulse = 0.85 + 0.15 * Math.sin(t * 7);

  const chartIn = spring({ frame: frame - Math.round(0.45 * fps), fps, config: { damping: 15, stiffness: 140 } });

  return (
    <AbsoluteFill style={{ backgroundColor: HOT_BG, overflow: "hidden" }}>
      {/* --- scena caldo --- */}
      <svg width={width} height={height} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <radialGradient id="sunG">
            <stop offset="0" stopColor="#fff6c2" />
            <stop offset="0.35" stopColor="#ffc400" />
            <stop offset="0.7" stopColor="#ff7a00" stopOpacity="0.85" />
            <stop offset="1" stopColor="#ff4d00" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx={880} cy={520} r={330 * sun * pulse} fill="url(#sunG)" />
        <Ribbon d="M-200 1400 C 200 1150, 500 1650, 820 1300 S 1200 900, 1350 1050" color={HOT} w={90} at={0.15} dur={0.9} />
      </svg>

      {/* --- scena vento (si apre con un cerchio dal pannello) --- */}
      <AbsoluteFill style={{ backgroundColor: LAKE, clipPath: `circle(${wipe * 1500}px at 600px 1180px)` }}>
        <svg width={width} height={height} style={{ position: "absolute", inset: 0 }}>
          {/* riflessi d'acqua sul fondo */}
          {[0, 1, 2, 3].map((i) => (
            <path
              key={i}
              d={`M-100 ${1650 + i * 70} q 135 -40 270 0 t 270 0 t 270 0 t 270 0 t 270 0`}
              fill="none"
              stroke="#fff"
              strokeOpacity={0.12}
              strokeWidth={8}
              transform={`translate(${((t * 60 + i * 50) % 270) - 135} 0)`}
            />
          ))}
        </svg>
      </AbsoluteFill>

      {/* pannello (resta per continuità tra le due scene) */}
      <div
        style={{
          position: "absolute",
          left: 330,
          top: 840,
          width: 640,
          transform: `translate(${(1 - enter) * 700}px, ${(1 - enter) * 300 + float}px) rotate(${panelRot}deg) scale(${0.85 + 0.15 * enter})`,
          transformOrigin: "50% 50%",
        }}
      >
        <Img
          src={staticFile("reel3/pannelli.png")}
          style={{
            width: "100%",
            display: "block",
            filter: `drop-shadow(0 40px 50px rgba(0,0,0,0.35)) drop-shadow(0 0 ${60 * heat}px rgba(255,70,20,${0.9 * heat})) drop-shadow(0 0 ${50 * coolGlow}px rgba(120,210,255,${0.7 * coolGlow}))`,
          }}
        />
        {/* velo rosso del calore / riflesso freddo */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            WebkitMaskImage: `url(${staticFile("reel3/pannelli.png")})`,
            WebkitMaskSize: "100% 100%",
            background: interpolateColors(coolGlow, [0, 1], ["rgba(255,60,20,0.45)", "rgba(110,200,255,0.30)"]),
            opacity: Math.max(heat, coolGlow * (1 - interpolate(t, [WIND + 2, WIND + 2.8], [0, 0.6], clamp))),
          }}
        />
      </div>

      {/* folate di vento davanti al pannello */}
      <svg width={width} height={height} style={{ position: "absolute", inset: 0, clipPath: `circle(${wipe * 1500}px at 600px 1180px)` }}>
          {/* folate di vento: nastri bianchi che attraversano lo schermo */}
          {[0, 1, 2, 3, 4, 5].map((i) => {
            const at = WIND - 0.25 + i * 0.42;
            const y = 1430 - (i % 3) * 200;
            return (
              <Ribbon
                key={i}
                d={`M-300 ${y} C 100 ${y - 200}, 400 ${y + 120}, 700 ${y - 80} S 1150 ${y - 260}, 1450 ${y - 140}`}
                color={i % 2 ? "#cfeeff" : "#ffffff"}
                w={i % 2 ? 26 : 40}
                at={at}
                dur={1.1}
                len={2200}
                tail
              />
            );
          })}
      </svg>

      {/* --- testi --- */}
      <div style={{ position: "absolute", left: 80, top: 230 }}>
        {!isWind ? (
          <>
            <Line at={0.08} size={190} color={HOT}>
              IL CALDO
            </Line>
            <Line at={0.22} size={112} color={INK} outline>
              RIDUCE LE
            </Line>
            <Line at={0.32} size={112} color={INK} outline>
              PRESTAZIONI
            </Line>
          </>
        ) : (
          <>
            <Line at={SWITCH + 0.12} size={118} color="#fff">
              IL VENTO DEL LAGO
            </Line>
            <Line at={SWITCH + 0.24} size={150} color="#fff" outline>
              LI RINFRESCA
            </Line>
            <Line at={WIND + 0.25} size={118} color={YELLOW}>
              E PRODUCONO MEGLIO
            </Line>
          </>
        )}
      </div>

      {/* grafico prestazioni */}
      <div style={{ position: "absolute", left: 80, top: 1560, color: ink, transform: `translateX(${(1 - chartIn) * -400}px)`, opacity: chartIn }}>
        <div style={{ fontFamily: COND, fontSize: 40, letterSpacing: 4, marginBottom: 14 }}>
          PRESTAZIONI {isWind ? <span style={{ color: GREEN }}>▲</span> : <span style={{ color: HOT }}>▼</span>}
        </div>
        <Chart t={t} />
      </div>

    </AbsoluteFill>
  );
};

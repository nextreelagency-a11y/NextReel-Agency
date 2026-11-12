import React from "react";
import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import italy from "../../projects/wallbox/assets/italy.json";
import { fontFamily } from "../theme";
import { Headline } from "../Headline";
import { BRAND, LogoMark } from "./Logo";
import { Truck } from "./Truck";

// Ripresa animata della cartina: la camera vola dall'Italia intera fino alla Lombardia,
// la regione si solleva in 3D e il furgone Domus Solaris la percorre con la camera che lo segue.
// Entra ed esce a taglio netto (le transizioni si aggiungono a mano in CapCut).

const ROUTE = ["Calolziocorte", "Lecco", "Como", "Varese", "Milano", "Pavia", "Lodi", "Cremona", "Mantova", "Brescia", "Bergamo", "Calolziocorte"];
const city = (n: string) => italy.cities.find((c) => c.name === n)!;
const pts = ROUTE.map((n) => [city(n).x, city(n).y] as [number, number]);
const segLen = pts.slice(1).map((p, i) => Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]));
const total = segLen.reduce((a, b) => a + b, 0);

const pointAt = (f: number) => {
  let d = f * total;
  for (let i = 0; i < segLen.length; i++) {
    if (d <= segLen[i]) {
      const k = d / segLen[i];
      return { x: pts[i][0] + (pts[i + 1][0] - pts[i][0]) * k, y: pts[i][1] + (pts[i + 1][1] - pts[i][1]) * k, dx: pts[i + 1][0] - pts[i][0], seg: i };
    }
    d -= segLen[i];
  }
  const n = pts.length - 1;
  return { x: pts[n][0], y: pts[n][1], dx: 1, seg: n - 1 };
};

const ARRIVE = 1.15; // secondi per arrivare sulla Lombardia

export const MapLombardia: React.FC<{ start: number; end: number }> = ({ start, end }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const u = frame / fps - start;
  const D = end - start;

  // --- camera ---
  const [bx0, by0, bx1, by1] = italy.lombardia.bbox;
  const lx = (bx0 + bx1) / 2;
  const ly = (by0 + by1) / 2;
  const ease = Easing.inOut(Easing.cubic);
  const z = interpolate(u, [0, ARRIVE], [0, 1], { extrapolateRight: "clamp", easing: ease });
  const s0 = 0.62;
  const s1 = 880 / (bx1 - bx0);
  const push = interpolate(u, [ARRIVE, D], [1, 1.14], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const s = Math.exp(Math.log(s0) + (Math.log(s1) - Math.log(s0)) * z) * push;

  // velocità dello zoom -> motion blur
  const zPrev = interpolate(u - 1 / fps, [0, ARRIVE], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });
  const blur = Math.min(4, Math.abs(z - zPrev) * 90);

  // percorso del furgone
  const f = interpolate(u, [ARRIVE - 0.1, D - 0.05], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.sin) });
  const p = pointAt(f);
  const follow = interpolate(u, [ARRIVE - 0.2, ARRIVE + 0.5], [0, 0.4], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const cx = italy.width / 2 + (lx - italy.width / 2) * z + (p.x - lx) * follow;
  const cy = italy.height / 2 + (ly - italy.height / 2) * z + (p.y - ly) * follow;
  const rot = interpolate(u, [0, ARRIVE, D], [-10, 0, 3], { extrapolateRight: "clamp", easing: Easing.out(Easing.quad) });
  const CY = height * 0.52;

  const toScreen = (x: number, y: number) => {
    const dx = (x - cx) * s;
    const dy = (y - cy) * s;
    const r = (rot * Math.PI) / 180;
    return { X: width / 2 + dx * Math.cos(r) - dy * Math.sin(r), Y: CY + dx * Math.sin(r) + dy * Math.cos(r) };
  };

  // regione che si alza in 3D
  const lift = interpolate(u, [ARRIVE - 0.35, ARRIVE + 0.25], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.back(2)) });
  const layers = 9;
  const depth = (16 * lift) / s; // spessore in unità mappa
  const pulse = 0.5 + 0.5 * Math.sin(u * 6);
  const others = interpolate(z, [0.3, 1], [1, 0.45]);
  const sweep = interpolate(u, [ARRIVE + 0.1, ARRIVE + 0.9], [-0.3, 1.3], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const reached = new Set(ROUTE.slice(0, f > 0 ? p.seg + 1 : 0));
  const trail = [...pts.slice(0, p.seg + 1), [p.x, p.y]].map(([x, y]) => `${x},${y}`).join(" ");
  const truck = toScreen(p.x, p.y);
  const truckIn = spring({ frame: frame - Math.round((start + ARRIVE - 0.15) * fps), fps, config: { damping: 8, stiffness: 180, mass: 0.6 } });
  const sede = toScreen(city("Calolziocorte").x, city("Calolziocorte").y);

  return (
    <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 45%, #183a57 0%, #0b1a28 60%, #060e16 100%)", fontFamily, overflow: "hidden" }}>
      <svg width={width} height={height} style={{ position: "absolute", inset: 0, filter: blur > 0.3 ? `blur(${blur}px)` : undefined }}>
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M40 0 H0 V40" fill="none" stroke="#ffffff" strokeOpacity="0.05" strokeWidth={1} />
          </pattern>
          <filter id="lombGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation={10 / s} />
          </filter>
          <linearGradient id="sweep" x1="0" x2="1" y1="0" y2="0">
            <stop offset={Math.max(0, sweep - 0.15)} stopColor="#fff" stopOpacity="0" />
            <stop offset={Math.min(1, Math.max(0, sweep))} stopColor="#fff" stopOpacity="0.55" />
            <stop offset={Math.min(1, sweep + 0.15)} stopColor="#fff" stopOpacity="0" />
          </linearGradient>
          <clipPath id="lombClip">
            <path d={italy.lombardia.d} />
          </clipPath>
        </defs>
        <g transform={`translate(${width / 2} ${CY}) rotate(${rot}) scale(${s}) translate(${-cx} ${-cy})`}>
          <rect x={-2000} y={-2000} width={5000} height={5500} fill="url(#grid)" />
          {italy.regions
            .filter((r) => r.name !== "Lombardia")
            .map((r) => (
              <path key={r.name} d={r.d} fill="#24405a" fillOpacity={others} stroke="#6f8ca6" strokeOpacity={others} strokeWidth={1.4 / s} />
            ))}
          {/* bagliore sotto la regione */}
          <path d={italy.lombardia.d} fill={BRAND.yellow} opacity={(0.35 + 0.3 * pulse) * lift} filter="url(#lombGlow)" />
          {/* spessore 3D */}
          {Array.from({ length: layers }).map((_, i) => (
            <path key={i} d={italy.lombardia.d} transform={`translate(0 ${depth * (1 - i / layers)})`} fill="#9c7a06" opacity={lift} />
          ))}
          <path
            d={italy.lombardia.d}
            fill={z < 0.2 ? "#24405a" : BRAND.yellow}
            stroke="#fff"
            strokeWidth={3 / s}
            transform={`translate(0 ${-depth * 0.15})`}
          />
          <rect x={bx0 - 20} y={by0 - 20} width={bx1 - bx0 + 40} height={by1 - by0 + 40} fill="url(#sweep)" clipPath="url(#lombClip)" />
          {/* scia del furgone */}
          {f > 0 && (
            <>
              <polyline points={trail} fill="none" stroke={BRAND.green} strokeOpacity={0.35} strokeWidth={16 / s} strokeLinecap="round" strokeLinejoin="round" />
              <polyline points={trail} fill="none" stroke={BRAND.green} strokeWidth={7 / s} strokeLinecap="round" strokeLinejoin="round" />
            </>
          )}
          {/* città */}
          {italy.cities
            .filter((c) => ROUTE.includes(c.name) && c.name !== "Calolziocorte")
            .map((c) => {
              const on = reached.has(c.name);
              const vis = interpolate(u, [ARRIVE - 0.2, ARRIVE + 0.2], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
              return (
                <g key={c.name} opacity={vis}>
                  <circle cx={c.x} cy={c.y} r={(on ? 11 : 7) / s} fill={on ? BRAND.green : "#fff"} stroke="#fff" strokeWidth={3 / s} />
                  <text
                    x={c.x}
                    y={c.y - 16 / s}
                    fontSize={(on ? 30 : 24) / s}
                    fontWeight={900}
                    fill={on ? "#0d2a12" : "#3b3000"}
                    textAnchor="middle"
                    fontFamily="Montserrat, sans-serif"
                  >
                    {c.name.toUpperCase()}
                  </text>
                </g>
              );
            })}
        </g>
      </svg>

      {/* sede Domus Solaris (Calolziocorte) */}
      <div style={{ position: "absolute", left: sede.X - 40, top: sede.Y - 110, transform: `scale(${truckIn})`, transformOrigin: "50% 100%" }}>
        <div style={{ background: "#fff", borderRadius: 16, padding: 7, boxShadow: "0 8px 20px rgba(0,0,0,0.4)" }}>
          <LogoMark size={64} />
        </div>
        <div style={{ width: 0, height: 0, margin: "0 auto", borderLeft: "12px solid transparent", borderRight: "12px solid transparent", borderTop: "16px solid #fff" }} />
      </div>

      {/* furgone */}
      <div
        style={{
          position: "absolute",
          left: truck.X - 130,
          top: truck.Y - 118 + Math.sin(u * 40) * 2,
          transform: `scale(${truckIn})`,
          transformOrigin: "50% 100%",
          filter: "drop-shadow(0 10px 14px rgba(0,0,0,0.5))",
        }}
      >
        <Truck width={260} wheel={u * 1100} flip={p.dx < 0} />
      </div>

      {/* titolo in stile NextReel */}
      <div style={{ position: "absolute", top: 230, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
        <Headline
          curve
          start={start + ARRIVE - 0.1}
          end={end + 1}
          lines={[
            { text: "TUTTA LA", color: "yellow", size: 90 },
            { text: "LOMBARDIA", color: "green", size: 112 },
          ]}
        />
      </div>
      {/* vignettatura */}
      <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 50%, transparent 55%, rgba(0,0,0,0.55) 100%)" }} />
    </AbsoluteFill>
  );
};

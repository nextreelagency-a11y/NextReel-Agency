import React from "react";
import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import italy from "../../projects/wallbox/assets/italy.json";
import { fontFamily } from "../theme";
import { BRAND, LogoMark } from "./Logo";
import { Truck } from "./Truck";

// Cartina animata: Italia -> zoom sulla Lombardia -> il furgone gira per la regione
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

export const MapLombardia: React.FC<{ start: number; end: number }> = ({ start, end }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const u = frame / fps - start;
  const D = end - start;

  const appear = spring({ frame: frame - Math.round(start * fps), fps, config: { damping: 14, stiffness: 120 } });
  const fadeOut = interpolate(u, [D - 0.15, D], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // camera: Italia intera -> Lombardia
  const [bx0, by0, bx1, by1] = italy.lombardia.bbox;
  const z = interpolate(u, [0.45, 1.05], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.cubic) });
  const s0 = 1.0;
  const s1 = 900 / (bx1 - bx0);
  const s = s0 + (s1 - s0) * z;
  const cx = italy.width / 2 + ((bx0 + bx1) / 2 - italy.width / 2) * z;
  const cy = italy.height / 2 + ((by0 + by1) / 2 - italy.height / 2) * z;
  const toScreen = (x: number, y: number) => ({ X: width / 2 + (x - cx) * s, Y: height * 0.5 + (y - cy) * s });

  // percorso del furgone
  const f = interpolate(u, [1.05, D - 0.2], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.sin) });
  const p = pointAt(f);
  const truck = toScreen(p.x, p.y);
  const reached = new Set(ROUTE.slice(0, p.seg + 1));
  const trail = [...pts.slice(0, p.seg + 1), [p.x, p.y]].map(([x, y]) => `${x},${y}`).join(" ");
  const glow = 0.6 + 0.4 * Math.sin(u * 7);
  const hl = interpolate(u, [0.15, 0.45], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ opacity: fadeOut, background: "radial-gradient(circle at 50% 40%, #16314a 0%, #0a1724 70%)", fontFamily }}>
      <svg width={width} height={height} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation={6 / s} result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <g transform={`translate(${width / 2} ${height * 0.5}) scale(${s * (0.9 + 0.1 * appear)}) translate(${-cx} ${-cy})`} opacity={appear}>
          {italy.regions.map((r) => (
            <path key={r.name} d={r.d} fill={r.name === "Lombardia" ? "#2c4a63" : "#22394f"} stroke="#5d7a94" strokeWidth={1.4 / s} />
          ))}
          <path d={italy.lombardia.d} fill={BRAND.yellow} fillOpacity={hl * (0.85 + 0.15 * glow)} stroke="#fff" strokeWidth={3 / s} filter="url(#glow)" />
          <polyline points={trail} fill="none" stroke={BRAND.green} strokeWidth={7 / s} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={`${14 / s} ${10 / s}`} opacity={z} />
          {italy.cities
            .filter((c) => ROUTE.includes(c.name))
            .map((c) => {
              const on = reached.has(c.name);
              return (
                <g key={c.name} opacity={z}>
                  <circle cx={c.x} cy={c.y} r={(on ? 9 : 6) / s} fill={on ? BRAND.green : "#fff"} stroke="#fff" strokeWidth={2.5 / s} />
                  <text x={c.x} y={c.y - 14 / s} fontSize={26 / s} fontWeight={800} fill="#10202e" textAnchor="middle" fontFamily="Montserrat, sans-serif">
                    {c.name === "Calolziocorte" ? "" : c.name.toUpperCase()}
                  </text>
                </g>
              );
            })}
        </g>
      </svg>

      {/* sede di Calolziocorte */}
      {z > 0.95 &&
        (() => {
          const c = city("Calolziocorte");
          const q = toScreen(c.x, c.y);
          return (
            <div style={{ position: "absolute", left: q.X - 36, top: q.Y - 96, transform: `scale(${z})` }}>
              <div style={{ background: "#fff", borderRadius: 14, padding: 6, boxShadow: "0 6px 16px rgba(0,0,0,0.35)" }}>
                <LogoMark size={60} />
              </div>
            </div>
          );
        })()}

      {/* furgone */}
      {u > 0.95 && (
        <div style={{ position: "absolute", left: truck.X - 110, top: truck.Y - 100, transform: `scale(${interpolate(u, [0.95, 1.2], [0, 1], { extrapolateRight: "clamp" })})` }}>
          <Truck width={220} wheel={u * 900} flip={p.dx < 0} />
        </div>
      )}

      {/* titolo */}
      <div style={{ position: "absolute", top: 250, left: 0, right: 0, display: "flex", justifyContent: "center", transform: `scale(${appear})` }}>
        <div style={{ background: "#fff", color: "#111", fontWeight: 900, fontSize: 64, padding: "14px 34px", borderRadius: 18, boxShadow: "0 12px 30px rgba(0,0,0,0.4)" }}>
          TUTTA LA <span style={{ color: BRAND.green }}>LOMBARDIA</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

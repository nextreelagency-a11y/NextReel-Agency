import React from "react";
import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import italy from "../../projects/wallbox/assets/italy.json";
import { Headline } from "../Headline";
import { fontFamily } from "../theme";
import { BRAND, LogoMark } from "../wallbox/Logo";
import { Truck } from "../wallbox/Truck";

// Ripresa sulla cartina: Italia -> Lombardia -> zoom sul tragitto dalla sede (Calolziocorte)
// al cliente (Origgio, VA). Il furgone percorre il tragitto e sul punto d'arrivo cade il pin.
// Sfondo trasparente all'esterno della scena? No: scena a schermo intero (inserto per CapCut).

const city = (n: string) => italy.cities.find((c) => c.name === n)!;
const FROM = city("Calolziocorte");
const TO = city("Origgio");
const CONTEXT = ["Varese", "Como", "Lecco", "Milano", "Monza", "Bergamo"];

export const MapTrip: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const u = frame / fps;

  const [bx0, by0, bx1, by1] = italy.lombardia.bbox;
  const lx = (bx0 + bx1) / 2;
  const ly = (by0 + by1) / 2;
  const mx = (FROM.x + TO.x) / 2;
  const my = (FROM.y + TO.y) / 2 + 4;

  // zoom in due tappe (scala logaritmica per un movimento continuo)
  const k = interpolate(u, [0, 1.05, 1.8], [0, 1, 2], { extrapolateRight: "clamp", easing: Easing.inOut(Easing.cubic) });
  const sItaly = 0.62;
  const sLomb = 880 / (bx1 - bx0);
  const sTrip = 7.5;
  const logS = k <= 1 ? Math.log(sItaly) + (Math.log(sLomb) - Math.log(sItaly)) * k : Math.log(sLomb) + (Math.log(sTrip) - Math.log(sLomb)) * (k - 1);
  const s = Math.exp(logS) * interpolate(u, [1.8, 3.6], [1, 1.06], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const cx = k <= 1 ? italy.width / 2 + (lx - italy.width / 2) * k : lx + (mx - lx) * (k - 1);
  const cy = k <= 1 ? italy.height / 2 + (ly - italy.height / 2) * k : ly + (my - ly) * (k - 1);
  const kPrev = interpolate(u - 1 / fps, [0, 1.05, 1.8], [0, 1, 2], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.cubic) });
  const blur = Math.min(4, Math.abs(k - kPrev) * 70);
  const rot = interpolate(u, [0, 1.05, 3.6], [-10, 0, 2], { extrapolateRight: "clamp", easing: Easing.out(Easing.quad) });
  const CY = height * 0.55;

  const toScreen = (x: number, y: number) => {
    const dx = (x - cx) * s;
    const dy = (y - cy) * s;
    const r = (rot * Math.PI) / 180;
    return { X: width / 2 + dx * Math.cos(r) - dy * Math.sin(r), Y: CY + dx * Math.sin(r) + dy * Math.cos(r) };
  };

  const lift = interpolate(u, [0.7, 1.3], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.back(2)) });
  const depth = (16 * lift) / s;
  const pulse = 0.5 + 0.5 * Math.sin(u * 6);
  const others = interpolate(k, [0.3, 1], [1, 0.45], { extrapolateRight: "clamp" });

  // tragitto del furgone (curva morbida)
  const f = interpolate(u, [1.55, 3.0], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.sin) });
  const ctrl = { x: mx + 8, y: my + 10 };
  const bez = (q: number) => ({
    x: (1 - q) ** 2 * FROM.x + 2 * (1 - q) * q * ctrl.x + q ** 2 * TO.x,
    y: (1 - q) ** 2 * FROM.y + 2 * (1 - q) * q * ctrl.y + q ** 2 * TO.y,
  });
  const p = bez(f);
  const pNext = bez(Math.min(1, f + 0.01));
  const trail = Array.from({ length: 40 }, (_, i) => bez((f * i) / 39)).map((q) => `${q.x},${q.y}`).join(" ");
  const truck = toScreen(p.x, p.y);
  const truckIn = spring({ frame: frame - Math.round(1.45 * fps), fps, config: { damping: 8, stiffness: 180, mass: 0.6 } });
  const pin = spring({ frame: frame - Math.round(2.95 * fps), fps, config: { damping: 7, stiffness: 170, mass: 0.6 } });
  const sede = toScreen(FROM.x, FROM.y);
  const dest = toScreen(TO.x, TO.y);
  const ctxOn = interpolate(u, [1.3, 1.7], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 45%, #183a57 0%, #0b1a28 60%, #060e16 100%)", fontFamily, overflow: "hidden" }}>
      <svg width={width} height={height} style={{ position: "absolute", inset: 0, filter: blur > 0.3 ? `blur(${blur}px)` : undefined }}>
        <defs>
          <pattern id="grid3" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M40 0 H0 V40" fill="none" stroke="#ffffff" strokeOpacity="0.05" strokeWidth={1} />
          </pattern>
          <filter id="glow3" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation={Math.min(10 / s, 3)} />
          </filter>
        </defs>
        <g transform={`translate(${width / 2} ${CY}) rotate(${rot}) scale(${s}) translate(${-cx} ${-cy})`}>
          <rect x={-2000} y={-2000} width={5000} height={5500} fill="url(#grid3)" />
          {italy.regions
            .filter((r) => r.name !== "Lombardia")
            .map((r) => (
              <path key={r.name} d={r.d} fill="#24405a" fillOpacity={others} stroke="#6f8ca6" strokeOpacity={others} strokeWidth={1.4 / s} />
            ))}
          <path d={italy.lombardia.d} fill={BRAND.yellow} opacity={(0.35 + 0.3 * pulse) * lift} filter="url(#glow3)" />
          {Array.from({ length: 9 }).map((_, i) => (
            <path key={i} d={italy.lombardia.d} transform={`translate(0 ${depth * (1 - i / 9)})`} fill="#9c8a06" opacity={lift} />
          ))}
          <path d={italy.lombardia.d} fill={k < 0.2 ? "#24405a" : BRAND.yellow} stroke="#fff" strokeWidth={3 / s} transform={`translate(0 ${-depth * 0.15})`} />
          {f > 0 && (
            <>
              <polyline points={trail} fill="none" stroke={BRAND.green} strokeOpacity={0.35} strokeWidth={16 / s} strokeLinecap="round" />
              <polyline points={trail} fill="none" stroke={BRAND.green} strokeWidth={7 / s} strokeLinecap="round" strokeDasharray={`${16 / s} ${10 / s}`} />
            </>
          )}
          {italy.cities
            .filter((c) => CONTEXT.includes(c.name))
            .map((c) => (
              <g key={c.name} opacity={ctxOn}>
                <circle cx={c.x} cy={c.y} r={8 / s} fill="#fff" stroke="#1d1d1d" strokeWidth={2 / s} />
                <text x={c.x} y={c.y - 14 / s} fontSize={30 / s} fontWeight={900} fill="#3b3000" textAnchor="middle" fontFamily="Montserrat, sans-serif">
                  {c.name.toUpperCase()}
                </text>
              </g>
            ))}
        </g>
      </svg>

      {/* sede Domus Solaris */}
      <div style={{ position: "absolute", left: sede.X - 44, top: sede.Y - 118, transform: `scale(${truckIn})`, transformOrigin: "50% 100%" }}>
        <div style={{ background: "#fff", borderRadius: 18, padding: 8, boxShadow: "0 8px 20px rgba(0,0,0,0.4)" }}>
          <LogoMark size={70} />
        </div>
        <div style={{ width: 0, height: 0, margin: "0 auto", borderLeft: "12px solid transparent", borderRight: "12px solid transparent", borderTop: "16px solid #fff" }} />
      </div>

      {/* pin di arrivo: Origgio */}
      <div style={{ position: "absolute", left: dest.X - 60, top: dest.Y - 150, transform: `translateY(${(1 - Math.min(1, pin)) * -120}px) scale(${pin})`, transformOrigin: "50% 100%" }}>
        <svg width={120} height={150} viewBox="0 0 24 30" style={{ filter: "drop-shadow(6px 7px 0 #161616)" }}>
          <path d="M12 29 C12 29 3 18 3 11 A9 9 0 0 1 21 11 C21 18 12 29 12 29 Z" fill={BRAND.green} stroke="#161616" strokeWidth={1.4} />
          <circle cx={12} cy={11} r={3.8} fill="#fff" stroke="#161616" strokeWidth={1.2} />
        </svg>
      </div>

      {/* furgone */}
      <div
        style={{
          position: "absolute",
          left: truck.X - 130,
          top: truck.Y - 118 + Math.sin(u * 40) * 2,
          transform: `scale(${truckIn * (1 - interpolate(u, [3.0, 3.25], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }))})`,
          transformOrigin: "50% 100%",
          filter: "drop-shadow(0 10px 14px rgba(0,0,0,0.5))",
        }}
      >
        <Truck width={260} wheel={u * 1100} flip={pNext.x - p.x < 0} />
      </div>

      {/* titolo */}
      <div style={{ position: "absolute", top: 230, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
        <Headline
          curve
          start={1.0}
          end={99}
          lines={[
            { text: "ORIGGIO", color: "yellow", size: 112 },
            { text: "PROVINCIA DI VARESE", color: "white", size: 64 },
          ]}
        />
      </div>
      <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 50%, transparent 55%, rgba(0,0,0,0.55) 100%)" }} />
    </AbsoluteFill>
  );
};

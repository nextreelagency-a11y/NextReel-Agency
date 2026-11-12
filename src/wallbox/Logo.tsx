import React from "react";
import { Img, staticFile } from "remotion";

// Logo Domus Solaris ricostruito in vettoriale (marchio + scritta)
// colori presi dal logo Domus Solaris
export const BRAND = { green: "#5AAF30", yellow: "#FFE806" };

// marchio originale (PNG con sfondo trasparente)
export const LogoMark: React.FC<{ size: number }> = ({ size }) => (
  <Img src={staticFile("wallbox/domus_mark.png")} style={{ width: size, height: size, objectFit: "contain", display: "block" }} />
);

export const Logo: React.FC<{ height: number }> = ({ height }) => (
  <div style={{ display: "flex", alignItems: "center", gap: height * 0.15 }}>
    <LogoMark size={height} />
    <div style={{ display: "flex", flexDirection: "column", lineHeight: 0.95, fontFamily: "Montserrat, sans-serif" }}>
      <span style={{ color: BRAND.green, fontWeight: 500, fontSize: height * 0.42, letterSpacing: height * 0.04 }}>Domus</span>
      <span style={{ color: BRAND.yellow, fontWeight: 900, fontSize: height * 0.4, letterSpacing: height * 0.05 }}>SOLARIS</span>
    </div>
  </div>
);

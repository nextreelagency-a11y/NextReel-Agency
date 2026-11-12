import React from "react";

// Logo Domus Solaris ricostruito in vettoriale (marchio + scritta)
export const BRAND = { green: "#3d9b35", yellow: "#f2c916" };

export const LogoMark: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 100 100">
    <rect x="4" y="30" width="62" height="66" fill={BRAND.green} />
    <circle cx="60" cy="40" r="36" fill={BRAND.yellow} />
    <path d="M30 96 C30 70 60 72 60 48 C60 34 50 26 40 26 C58 22 76 32 76 50 C76 76 46 76 46 96 Z" fill="#fff" />
  </svg>
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

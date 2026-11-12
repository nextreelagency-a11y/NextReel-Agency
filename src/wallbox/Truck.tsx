import React from "react";
import { Logo } from "./Logo";

// Pickup bianco Domus Solaris visto di lato (ruote che girano)
export const Truck: React.FC<{ width: number; wheel: number; flip?: boolean }> = ({ width, wheel, flip }) => {
  const h = width * 0.5;
  return (
    <div style={{ position: "relative", width, height: h, transform: flip ? "scaleX(-1)" : undefined }}>
      <svg width={width} height={h} viewBox="0 0 300 150" style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <ellipse cx="150" cy="140" rx="135" ry="8" fill="rgba(0,0,0,0.35)" />
        {/* portapacchi con scala */}
        <path d="M18 52 H178 M30 52 V74 M168 52 V74" stroke="#2b2f36" strokeWidth="6" fill="none" />
        <rect x="24" y="40" width="150" height="9" rx="4" fill="#c9ccd2" />
        <path d="M34 44 H164" stroke="#8f949c" strokeWidth="2" strokeDasharray="6 8" />
        {/* cassone */}
        <path d="M10 74 H182 V118 H10 Z" fill="#f4f5f7" stroke="#c4c8ce" strokeWidth="3" />
        <path d="M12 82 H180" stroke="#2b2f36" strokeWidth="4" />
        {/* cabina */}
        <path d="M182 118 V50 Q184 38 198 38 H236 Q248 38 256 52 L276 82 Q290 86 290 100 V118 Z" fill="#f4f5f7" stroke="#c4c8ce" strokeWidth="3" />
        <path d="M196 48 H234 Q242 48 248 58 L262 82 H196 Z" fill="#26323f" />
        <path d="M200 52 L214 52 L204 80 L198 80 Z" fill="rgba(255,255,255,0.18)" />
        <rect x="280" y="94" width="10" height="7" rx="2" fill="#ffd36b" />
        <rect x="226" y="88" width="16" height="4" rx="2" fill="#2b2f36" />
        <path d="M12 118 H290" stroke="#3a3f47" strokeWidth="5" />
        {/* ruote */}
        {[60, 240].map((cx) => (
          <g key={cx} transform={`rotate(${wheel} ${cx} 120)`}>
            <circle cx={cx} cy="120" r="21" fill="#17191d" />
            <circle cx={cx} cy="120" r="11" fill="#9aa0a8" />
            <path d={`M${cx - 11} 120 H${cx + 11} M${cx} 109 V131`} stroke="#5b6068" strokeWidth="3" />
          </g>
        ))}
      </svg>
      {/* logo sulla portiera e sul cassone (non specchiato) */}
      <div style={{ position: "absolute", left: (196 / 300) * width, top: (84 / 150) * h, transform: flip ? "scaleX(-1)" : undefined, transformOrigin: "center" }}>
        <Logo height={width * 0.07} />
      </div>
      <div style={{ position: "absolute", left: (40 / 300) * width, top: (88 / 150) * h, transform: flip ? "scaleX(-1)" : undefined }}>
        <Logo height={width * 0.085} />
      </div>
    </div>
  );
};

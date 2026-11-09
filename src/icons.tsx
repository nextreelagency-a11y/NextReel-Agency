import React from "react";

// Icone vettoriali disegnate in viewBox 24x24, tratto pieno
const P: Record<string, React.ReactNode> = {
  warning: (<><path d="M12 3 L22 20 H2 Z" /><path d="M12 9.5 V14" /><circle cx="12" cy="17" r="0.6" /></>),
  clock: (<><circle cx="12" cy="12" r="9" /><path d="M12 7 V12 L15.5 14.5" /></>),
  house: (<><path d="M3 11.5 L12 4 L21 11.5" /><path d="M5.5 9.8 V20 H18.5 V9.8" /><path d="M10 20 V14.5 H14 V20" /></>),
  panel: (<><path d="M5 5 H19 L21.5 15 H2.5 Z" /><path d="M3.8 10 H20.2 M9.7 5 L9 15 M14.3 5 L15 15" /><path d="M12 15 V20 M8 20 H16" /></>),
  layers: (<><path d="M12 3 L21 8 L12 13 L3 8 Z" /><path d="M3 12.3 L12 17.3 L21 12.3" /><path d="M3 16.3 L12 21.3 L21 16.3" /></>),
  cloud: (<><path d="M7 19 H17 A4 4 0 0 0 17.4 11 A5.5 5.5 0 0 0 6.6 11.6 A3.7 3.7 0 0 0 7 19 Z" /></>),
  bolt: (<><path d="M13.5 2 L4 14 H11 L10 22 L20 9.5 H13 Z" /></>),
  link: (<><path d="M10 14 A4 4 0 0 0 15.66 14 L18.66 11 A4 4 0 0 0 13 5.34 L11.5 6.84" /><path d="M14 10 A4 4 0 0 0 8.34 10 L5.34 13 A4 4 0 0 0 11 18.66 L12.5 17.16" /></>),
  shield: (<><path d="M12 3 L20 6 V12 C20 16.5 16.5 19.5 12 21 C7.5 19.5 4 16.5 4 12 V6 Z" /><path d="M8.5 12 L11 14.5 L15.5 9.5" /></>),
  badge: (<><circle cx="12" cy="12" r="9" /><path d="M7.8 12.3 L10.8 15.2 L16.5 9" /></>),
  sparkle: (<><path d="M12 3 L13.8 10.2 L21 12 L13.8 13.8 L12 21 L10.2 13.8 L3 12 L10.2 10.2 Z" /></>),
  diamond: (<><path d="M6.5 4 H17.5 L22 9.5 L12 21 L2 9.5 Z" /><path d="M2 9.5 H22 M9 4 L7.5 9.5 L12 21 L16.5 9.5 L15 4" /></>),
  ruler: (<><path d="M2.5 16.5 L16.5 2.5 L21.5 7.5 L7.5 21.5 Z" /><path d="M6.5 12.5 L8.5 14.5 M9.5 9.5 L11 11 M12.5 6.5 L14.5 8.5" /></>),
  pencil: (<><path d="M4 20 L5 15 L16 4 L20 8 L9 19 Z" /><path d="M13.5 6.5 L17.5 10.5" /></>),
  wrench: (<><path d="M14.7 6.3 a1 1 0 0 0 0 1.4 l1.6 1.6 a1 1 0 0 0 1.4 0 l3.3-3.3 a6 6 0 0 1 -7.9 7.9 l-6.9 6.9 a2.1 2.1 0 0 1 -3-3 l6.9-6.9 a6 6 0 0 1 7.9-7.9 Z" /></>),
  document: (<><path d="M6 3 H14 L19 8 V21 H6 Z" /><path d="M14 3 V8 H19" /><path d="M9 13 H16 M9 17 H14" /></>),
};

export const Icon: React.FC<{ name: string; size: number; color: string }> = ({ name, size, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.1} strokeLinecap="round" strokeLinejoin="round">
    {P[name] ?? P.sparkle}
  </svg>
);

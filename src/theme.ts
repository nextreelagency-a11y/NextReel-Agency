import { continueRender, delayRender, staticFile } from "remotion";

// Montserrat (variabile, pesi 100-900) inclusa nel progetto: il render non dipende dalla rete
export const fontFamily = "Montserrat, Impact, sans-serif";
if (typeof document !== "undefined") {
  const handle = delayRender("Caricamento font Montserrat");
  const face = new FontFace("Montserrat", `url(${staticFile("fonts/Montserrat-latin.woff2")}) format("woff2")`, { weight: "100 900" });
  face
    .load()
    .then((f) => {
      document.fonts.add(f);
      continueRender(handle);
    })
    .catch((err) => {
      console.error(err);
      continueRender(handle);
    });
}

export const COLORS = {
  text: "#FFFFFF",
  active: "#FFD700", // parola pronunciata
  accent: "#00FF00",
  stroke: "#000000",
};

// Safe zone: niente testi/grafiche nei 200px in alto e in basso
export const SAFE = { top: 200, bottom: 200 };
export const CAPTION_Y = 0.7; // centro dei sottotitoli al 70% dell'altezza
export const POPUP_Y = 0.52; // centro di icone e numeri

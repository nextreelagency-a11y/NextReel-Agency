import React from "react";
import { Composition } from "remotion";
import { Reel, ReelProps } from "./Reel";
import reel from "../data/reel.json";
import wallbox from "../projects/wallbox/reel.json";
import { WallboxProps, WallboxReel } from "./wallbox/WallboxReel";
import { Scritta, ScrittaProps } from "./Scritta";
import { CallPhone } from "./CallPhone";

export const RemotionRoot: React.FC = () => (
  <>
    {(["Reel", "ReelSottotitoli", "Base", "Overlay"] as const).map((id) => (
      <Composition
        key={id}
        id={id}
        component={Reel}
        defaultProps={{ layer: id.startsWith("Reel") ? "full" : id === "Base" ? "base" : "overlay", captions: id === "ReelSottotitoli" } as ReelProps}
        fps={reel.fps}
        width={reel.width}
        height={reel.height}
        durationInFrames={Math.floor(reel.duration * reel.fps)}
      />
    ))}
    {(["Wallbox", "WallboxOverlay", "WallboxInserts"] as const).map((id) => (
      <Composition
        key={id}
        id={id}
        component={WallboxReel}
        defaultProps={{ mode: id === "Wallbox" ? "full" : id === "WallboxOverlay" ? "overlay" : "inserts" } as WallboxProps}
        fps={wallbox.fps}
        width={wallbox.width}
        height={wallbox.height}
        durationInFrames={Math.floor(wallbox.duration * wallbox.fps)}
      />
    ))}
    <Composition id="Chiamata" component={CallPhone} fps={30} width={1080} height={1920} durationInFrames={120} />
    <Composition
      id="Scritta"
      component={Scritta}
      defaultProps={{ lines: [{ text: "TESTO", color: "yellow", size: 120 }], curve: false } as ScrittaProps}
      fps={30}
      width={1080}
      height={1920}
      durationInFrames={60}
    />
  </>
);

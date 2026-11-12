import React from "react";
import { Composition } from "remotion";
import { Reel, ReelProps } from "./Reel";
import reel from "../data/reel.json";
import wallbox from "../projects/wallbox/reel.json";
import { WallboxReel } from "./wallbox/WallboxReel";

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
    <Composition
      id="Wallbox"
      component={WallboxReel}
      fps={wallbox.fps}
      width={wallbox.width}
      height={wallbox.height}
      durationInFrames={Math.floor(wallbox.duration * wallbox.fps)}
    />
  </>
);

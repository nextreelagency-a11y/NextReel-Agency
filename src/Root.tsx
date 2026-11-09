import React from "react";
import { Composition } from "remotion";
import { Reel } from "./Reel";
import reel from "../data/reel.json";

export const RemotionRoot: React.FC = () => (
  <Composition
    id="Reel"
    component={Reel}
    fps={reel.fps}
    width={reel.width}
    height={reel.height}
    durationInFrames={Math.floor(reel.duration * reel.fps)}
  />
);

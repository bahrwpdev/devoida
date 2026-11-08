import React from "react";
import { Composition } from "remotion";
import { DURATION, Promo } from "./Promo";
import { FPS, H, W } from "./tokens";

export const Root: React.FC = () => (
  <Composition id="Promo" component={Promo} durationInFrames={DURATION} fps={FPS} width={W} height={H} />
);

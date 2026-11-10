import React from "react";
import { Composition } from "remotion";
import { Part1 } from "./Part1";
import { FPS, H, W } from "./tokens";

export const Root: React.FC = () => (
  <Composition id="Part1" component={Part1} durationInFrames={960} fps={FPS} width={W} height={H} />
);

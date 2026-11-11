import React from "react";
import { Composition } from "remotion";
import { Overview } from "./Overview";
import { TOTAL_FRAMES } from "./timeline";
import { H, W } from "./tokens";

export const Root: React.FC = () => (
  <Composition id="Overview" component={Overview} durationInFrames={TOTAL_FRAMES} fps={60} width={W} height={H} />
);

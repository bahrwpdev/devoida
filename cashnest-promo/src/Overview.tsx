import React from "react";
import { AbsoluteFill, Img } from "remotion";
import { useCurrentFrame } from "remotion";
import { Fonts } from "./Fonts";
import { StatusBar } from "./ui/StatusBar";
import { Reveal, frameSrc } from "./Reveal";
import { itemAt } from "./timeline";
import { C, H, W } from "./tokens";

/**
 * Overview video, screen only: 1170x2532 = a 390x844 phone screen at 3x, 60 fps.
 * Every frame of the app comes from the real Flutter screens (capture/tour_test.dart),
 * including the popups. Only the status bar is drawn here. No zoom, no tap markers.
 */
export const Overview: React.FC = () => {
  const f = useCurrentFrame();
  const { item, t } = itemAt(f);
  return (
    <AbsoluteFill style={{ background: C.page, overflow: "hidden" }}>
      <Fonts />
      {item.kind === "real" ? (
        <Img src={frameSrc(item.a + t)} style={{ position: "absolute", left: 0, top: 0, width: W, height: H }} />
      ) : (
        <Reveal settled={item.settled} base={item.base} units={item.units} bottom={item.bottom} t={t} under={item.under} rows={item.rows} fabs={item.fabs} />
      )}
      {/* the status bar stays put (delete this block if your mockup has its own) */}
      <div style={{ position: "absolute", left: 0, top: 0, width: 390, height: 47, transform: "scale(3)", transformOrigin: "0 0" }}>
        <StatusBar color={C.inkDeep} />
      </div>
    </AbsoluteFill>
  );
};

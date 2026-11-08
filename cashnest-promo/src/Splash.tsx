import React from "react";
import { staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { C, NAV_SHADOW, easeOut, inter, prog } from "./tokens";
import { Icon, MIcon } from "./ui/Icon";

/**
 * Port of lib/widgets/ui/icon_orbit.dart, the splash animation: nine rings of
 * category icons turning in opposite directions, a wave pushing icons in and
 * out along each ring, rings fading outwards. Same constants as the app.
 */
const ICONS = [
  "food", "shopping", "goals", "budget", "split", "diagram-up", "money",
  "assets", "travel", "entertainment", "medical", "investment", "coffee",
  "gift", "dumbbell", "music",
];
const RINGS = 9;
const FIRST_RADIUS = 180;
const GAP = 116;
const TURNS = [3, 3, 2, 2, 1, 1, 1, 1, 1];
const LOOP_SECONDS = 80;

type Item = {
  asset: string;
  baseAngle: number;
  radius: number;
  ring: number;
  turns: number;
  clockwise: boolean;
  size: number;
  alpha: number;
};

const items: Item[] = (() => {
  const out: Item[] = [];
  let k = 0;
  for (let r = 0; r < RINGS; r++) {
    const radius = FIRST_RADIUS + r * GAP;
    const count = Math.floor((2 * Math.PI * radius) / 98);
    const alpha = Math.min(0.13, Math.max(0.03, 0.13 - r * 0.012));
    const size = r % 2 === 0 ? 30 : 22;
    for (let j = 0; j < count; j++) {
      out.push({
        asset: ICONS[k++ % ICONS.length],
        baseAngle: (2 * Math.PI * j) / count + r * 0.5,
        radius,
        ring: r,
        turns: TURNS[r],
        clockwise: r % 2 === 0,
        size,
        alpha,
      });
    }
  }
  return out;
})();

export const IconOrbit: React.FC<{
  cx: number;
  cy: number;
  scale: number;
  /** playback speed relative to the app (1 = same as the splash) */
  speed?: number;
  opacity?: number;
}> = ({ cx, cy, scale, speed = 1, opacity = 1 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = (((frame / fps) * speed) / LOOP_SECONDS) % 1;
  return (
    <div
      style={{
        position: "absolute",
        left: cx,
        top: cy,
        width: 0,
        height: 0,
        opacity,
        transform: `scale(${scale})`,
        transformOrigin: "0 0",
      }}
    >
      {items.map((it, i) => {
        const dir = it.clockwise ? 1 : -1;
        const theta = it.baseAngle + dir * t * 2 * Math.PI * it.turns;
        const wave = Math.sin(it.baseAngle * 3 - t * 2 * Math.PI * 10 + it.ring * 0.9);
        const r = it.radius + 22 * wave;
        const s = 1 + 0.18 * wave;
        const x = r * Math.cos(theta);
        const y = r * Math.sin(theta);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: -it.size / 2,
              top: -it.size / 2,
              transform: `translate(${x}px, ${y}px) rotate(${theta + Math.PI / 2}rad) scale(${s})`,
            }}
          >
            <Icon name={it.asset} size={it.size} color={`rgba(17,45,65,${it.alpha})`} />
          </div>
        );
      })}
    </div>
  );
};

/**
 * Splash timings (splash_screen.dart): one 1200ms controller; the logo fades in
 * over the first 40% with easeOut, the CTA over 50%-90%.
 */
export const logoFade = (frame: number, fps: number) =>
  prog(frame, 0, 0.4 * 1.2 * fps, easeOut);
export const bottomFade = (frame: number, fps: number) =>
  prog(frame, 0.5 * 1.2 * fps, 0.9 * 1.2 * fps, easeOut);

export const Logo: React.FC<{ size: number; style?: React.CSSProperties }> = ({
  size,
  style,
}) => (
  <img
    src={staticFile("logo.png")}
    width={size}
    height={size}
    style={{ display: "block", ...style }}
  />
);

/** _buildNavStyleCTA: the red "Let's Start" pill with the nav bar's shadow. */
export const StartPill: React.FC<{
  label?: string;
  width: number;
  pressed?: number;
  arrow?: boolean;
}> = ({ label = "Let's Start", width, pressed = 0, arrow = true }) => (
  <div
    style={{
      width,
      height: 56,
      borderRadius: 50,
      background: C.red,
      boxShadow: NAV_SHADOW,
      transform: `scale(${1 - 0.04 * pressed})`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
    }}
  >
    <div style={inter(15, 600, -0.1, C.white)}>{label}</div>
    {arrow && <MIcon name="arrow_forward" size={18} color={C.white} />}
  </div>
);

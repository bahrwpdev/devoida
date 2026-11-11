import React from "react";
import { Img, staticFile } from "remotion";
import { C, H, W, clamp01, easeOutCubic } from "./tokens";

export const frameSrc = (i: number) => staticFile(`seq/tour/${String(Math.max(0, i)).padStart(4, "0")}.png`);

/** Slice height range [y1, y2) in output pixels. */
type Slice = [number, number];

/**
 * A screen opening, the way the splash loads: the components of a finished screen
 * (taken from the app's own frame) appear one by one over the page background,
 * header first, each fading in while rising a few pixels. The page ends exactly
 * as the real frame, so the real frames can continue from there.
 */
export const Reveal: React.FC<{
  settled: number;
  units: number[][];
  bottom: number;
  t: number;
  under?: number;
  rows?: number;
}> = ({ settled, units, bottom, t, under, rows }) => {
  // components, top to bottom; a tall card can be cut into its rows
  // overlapping rectangles (a card and a box inside it) become one component
  let us: number[][] = [];
  for (const u of [...units].sort((a, b) => a[1] - b[1])) {
    const last = us[us.length - 1];
    if (last && u[1] < last[1] + last[3] - 4) {
      const bottom = Math.max(last[1] + last[3], u[1] + u[3]);
      last[3] = bottom - last[1];
    } else us.push([...u]);
  }
  if (rows) {
    us = us.flatMap(([x, y, w, h]) => {
      const n = Math.floor(h / rows);
      if (n < 2) return [[x, y, w, h]];
      return Array.from({ length: n }, (_, i) => [x, y + (h / n) * i, w, h / n]);
    });
  }
  // slices tile the page: [header][first card][gap + card]... so text between cards
  // loads with the card below it
  const slices: Slice[] = [];
  if (us.length === 0) slices.push([0, bottom]);
  else {
    slices.push([0, us[0][1]]);
    slices.push([us[0][1], us[0][1] + us[0][3]]);
    for (let k = 1; k < us.length; k++) slices.push([us[k - 1][1] + us[k - 1][3], us[k][1] + us[k][3]]);
    slices[slices.length - 1][1] = Math.max(slices[slices.length - 1][1], bottom);
  }

  const STAGGER = 4; // frames between components
  const DUR = 26; // frames each takes
  const underIdx = under === undefined ? undefined : under + t;

  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: W, height: H, background: C.page }}>
      {/* fixed bottom (the nav bar keeps its real glide on tab screens) */}
      {underIdx !== undefined && (
        <Img src={frameSrc(underIdx)} style={{ position: "absolute", left: 0, top: 0, width: W, height: H, clipPath: `inset(${bottom}px 0 0 0)` }} />
      )}
      {slices.map(([y1, y2], i) => {
        const p = easeOutCubic(clamp01((t - i * STAGGER) / DUR));
        if (p <= 0) return null;
        return (
          <Img
            key={i}
            src={frameSrc(settled)}
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: W,
              height: H,
              opacity: p,
              transform: `translateY(${(1 - p) * (rows ? 24 : 54)}px)`,
              clipPath: `inset(${y1}px 0 ${H - Math.min(H, y2)}px 0)`,
            }}
          />
        );
      })}
      {/* pushed screens: their bottom bar comes in after the last component */}
      {underIdx === undefined && bottom < H && (() => {
        const p = easeOutCubic(clamp01((t - slices.length * STAGGER) / DUR));
        return (
          <Img
            src={frameSrc(settled)}
            style={{ position: "absolute", left: 0, top: 0, width: W, height: H, opacity: p, transform: `translateY(${(1 - p) * 54}px)`, clipPath: `inset(${bottom}px 0 0 0)` }}
          />
        );
      })()}
    </div>
  );
};

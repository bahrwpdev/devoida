import React from "react";
import { AbsoluteFill, Easing, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Fonts } from "./Fonts";
import { StatusBar } from "./ui/StatusBar";
import { HeadsUp } from "./ui/HeadsUp";
import events from "./part1.events.json";
import { C, H, W, clamp01, easeInOut, easeOutCubic, ink, prog } from "./tokens";

/**
 * Overview video, part 1 (0:00 to 0:32), screen only: 1170x2532 = a 390x844 phone
 * screen at 3x. Every frame of the app comes from the real Flutter screens
 * (capture/tour_a_test.dart); only the Android notification and the status bar
 * are drawn here.
 */
export const PART1_FRAMES = 941; // captured frames, about 31.4 s at 30 fps

/** The Android notification: slides in as detection happens, flips to Saved, leaves. */
const BANNER = { in: 212, flip: 247, out: 322 };

const frameSrc = (i: number) =>
  staticFile(`seq/part1/${String(Math.min(PART1_FRAMES - 1, Math.max(0, i))).padStart(4, "0")}.png`);

/* ------------------------------ camera ------------------------------ */
/** A gentle push-in: [frame, zoom, focusX, focusY] in output pixels. */
const CAM: [number, number, number, number][] = [
  [0, 1, 585, 1266],
  [60, 1.04, 585, 1000],
  [150, 1.04, 585, 1000],
  [205, 1, 585, 1266],
  [236, 1.07, 585, 500],
  [262, 1.07, 585, 500],
  [276, 1.08, 585, 1150],
  [302, 1.08, 585, 1150],
  [318, 1.07, 585, 700],
  [356, 1.07, 585, 700],
  [390, 1, 585, 1266],
  [596, 1, 585, 1266],
  [622, 1.07, 585, 900],
  [650, 1.07, 585, 1000],
  [706, 1.06, 585, 1300],
  [790, 1.06, 585, 1450],
  [826, 1, 585, 1266],
  [846, 1.06, 585, 1500],
  [900, 1.06, 585, 1500],
  [930, 1, 585, 1266],
];
const camAt = (f: number) => {
  const ease = Easing.bezier(0.65, 0, 0.35, 1);
  const frames = CAM.map((k) => k[0]);
  const v = (i: number) =>
    interpolate(f, frames, CAM.map((k) => k[i]), { easing: ease, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const s = v(1);
  // never pan past the screen edge
  const x = Math.min(W - W / 2 / s, Math.max(W / 2 / s, v(2)));
  const y = Math.min(H - H / 2 / s, Math.max(H / 2 / s, v(3)));
  return { s, x, y };
};

/* ------------------------------ taps ------------------------------ */
/** Taps that matter, from the capture log (typing-field taps are left out). */
const TAP_NAMES = new Set(["tapSplitsNav", "tapFab", "tapTax", "tapTip", "tapNewPerson", "tapSave", "tapDone"]);
const TAPS = (events as { name: string; frame: number; x?: number; y?: number }[]).filter(
  (e) => TAP_NAMES.has(e.name) && e.x !== undefined && e.y !== undefined,
) as { name: string; frame: number; x: number; y: number }[];

const TapMarkers: React.FC<{ f: number }> = ({ f }) => (
  <>
    {TAPS.map((tp, i) => {
      const t = clamp01((f - (tp.frame - 3)) / 18);
      if (t <= 0 || t >= 1) return null;
      const g = easeOutCubic(t);
      const a = t < 0.2 ? t / 0.2 : 1 - (t - 0.2) / 0.8;
      const r = 54 + 70 * g;
      return (
        <div key={i} style={{ position: "absolute", left: tp.x, top: tp.y, width: 0, height: 0, zIndex: 50 }}>
          <div style={{ position: "absolute", left: -r, top: -r, width: r * 2, height: r * 2, borderRadius: "50%", border: `5px solid ${ink(0.4)}`, background: ink(0.12), opacity: a }} />
          <div style={{ position: "absolute", left: -22, top: -22, width: 44, height: 44, borderRadius: "50%", background: ink(0.4), opacity: a }} />
        </div>
      );
    })}
  </>
);

/* ------------------------------ composition ------------------------------ */
export const Part1: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const cam = camAt(f);

  const bIn = spring({ frame: f - BANNER.in, fps, config: { damping: 13, stiffness: 190, mass: 0.6 } });
  const bOut = prog(f, BANNER.out, BANNER.out + 14, easeInOut);
  const bSaved = prog(f, BANNER.flip, BANNER.flip + 8, easeInOut);
  const bShow = f >= BANNER.in - 1 && f < BANNER.out + 16;

  return (
    <AbsoluteFill style={{ background: C.page, overflow: "hidden" }}>
      <Fonts />
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: W,
          height: H,
          transformOrigin: "0 0",
          transform: `translate(${W / 2 - cam.x * cam.s}px, ${H / 2 - cam.y * cam.s}px) scale(${cam.s})`,
        }}
      >
        <Img src={frameSrc(f)} style={{ position: "absolute", left: 0, top: 0, width: W, height: H }} />

        {/* hides the few pixels of a card that peek out above the nav bar on Home */}
        {f < 520 && <div style={{ position: "absolute", left: 0, top: 2096, width: W, height: 180, background: C.page }} />}

        <TapMarkers f={f} />

        {/* status bar and the notification live in screen space, in front of the app */}
        <div style={{ position: "absolute", left: 0, top: 0, width: 390, height: 844, transform: "scale(3)", transformOrigin: "0 0", zIndex: 40 }}>
          <StatusBar color={C.inkDeep} />
          {bShow && (
            <div
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                top: 38,
                opacity: clamp01(bIn * 1.5) * (1 - bOut),
                transform: `translateY(${(1 - bIn) * -130 - bOut * 130}px) scale(${0.94 + 0.06 * bIn})`,
                transformOrigin: "50% 0%",
              }}
            >
              <HeadsUp saved={bSaved} />
            </div>
          )}
        </div>
      </div>
    </AbsoluteFill>
  );
};

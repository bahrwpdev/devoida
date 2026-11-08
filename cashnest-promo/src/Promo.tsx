import React from "react";
import { AbsoluteFill, Easing, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Fonts } from "./Fonts";
import { LockScreen } from "./Lock";
import { StatusBar } from "./ui/StatusBar";
import { C, H, W, clamp01, easeInOut, easeOutCubic, ink, prog } from "./tokens";

/**
 * Screen-only promo (no device frame): 1170x2532 = a 390x844 iPhone screen at 3x.
 *
 * Everything inside the app is the app's own rendering: the frames in
 * public/seq are captured from the real Flutter screens (see ../capture).
 * Only the OS lock screen and the status bar are drawn here.
 */
export const DURATION = 450; // 15 s at 30 fps

/** Timeline, frames at 30 fps. */
const T = {
  sms: 14,
  detect: 58,
  tapNotif: 90,
  toHome: [94, 112] as const,
  homeBase: 100, // home frame 0 plays at this video frame
  rowLands: 124, // the new expense lands (home frame 24)
  tapRow: 188,
  reveal: [190, 208] as const,
  detailsBase: 192,
  toLogo: [296, 316] as const,
  logoBase: 296,
};

const HOME_FRAMES = 100;
const DETAILS_FRAMES = 75;
const SPLASH_FRAMES = 150;
const HOME_LAND_IDX = T.rowLands - T.homeBase; // 24

/** Row of the new expense in the home frames, in output pixels. */
const ROW = { x: 48, y: 1140, w: 1074, h: 150, r: 36 };
const ROW_CENTER = { x: ROW.x + ROW.w / 2, y: ROW.y + ROW.h / 2 };

const pad = (n: number) => String(Math.max(0, n)).padStart(4, "0");
const seq = (name: string, idx: number, max: number) =>
  staticFile(`seq/${name}/${pad(Math.min(max - 1, Math.max(0, idx)))}.png`);

const bump = (f: number, a: number, dur = 10) => {
  const t = clamp01((f - a) / dur);
  return t <= 0 || t >= 1 ? 0 : Math.sin(Math.PI * t);
};

/* ------------------------------ camera ------------------------------ */
/** A gentle push-in: [frame, zoom, focusX, focusY] in output pixels. */
const CAM: [number, number, number, number][] = [
  [0, 1, 585, 1266],
  [14, 1, 585, 1266],
  [40, 1.1, 585, 1100],
  [58, 1.1, 585, 1100],
  [80, 1.12, 585, 1230],
  [92, 1.12, 585, 1250],
  [112, 1, 585, 1266],
  [118, 1, 585, 1266],
  [136, 1.1, 585, 1230],
  [150, 1.1, 585, 1230],
  [170, 1.08, 585, 900],
  [186, 1, 585, 1266],
  [206, 1, 585, 1266],
  [226, 1.08, 585, 1000],
  [250, 1.1, 585, 1400],
  [272, 1.1, 585, 1400],
  [296, 1, 585, 1266],
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
const TAPS = [
  { f: T.tapNotif, x: 585, y: 1296 },
  { f: T.tapRow, x: ROW_CENTER.x, y: ROW_CENTER.y },
];
const TapMarker: React.FC<{ f: number }> = ({ f }) => (
  <>
    {TAPS.map((tp, i) => {
      const t = clamp01((f - (tp.f - 4)) / 18);
      if (t <= 0 || t >= 1) return null;
      const g = easeOutCubic(t);
      const a = t < 0.2 ? t / 0.2 : 1 - (t - 0.2) / 0.8;
      const r = 60 + 80 * g;
      return (
        <div key={i} style={{ position: "absolute", left: tp.x, top: tp.y, width: 0, height: 0, zIndex: 50 }}>
          <div style={{ position: "absolute", left: -r, top: -r, width: r * 2, height: r * 2, borderRadius: "50%", border: `6px solid ${ink(0.4)}`, background: ink(0.12), opacity: a }} />
          <div style={{ position: "absolute", left: -26, top: -26, width: 52, height: 52, borderRadius: "50%", background: ink(0.4), opacity: a }} />
        </div>
      );
    })}
  </>
);

/* ------------------------------ composition ------------------------------ */
const Frame: React.FC<{ src: string; style?: React.CSSProperties }> = ({ src, style }) => (
  <Img src={src} style={{ position: "absolute", left: 0, top: 0, width: W, height: H, ...style }} />
);

export const Promo: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sp = (start: number) => spring({ frame: f - start, fps, config: { damping: 10, stiffness: 230, mass: 0.5 } });
  const cam = camAt(f);

  const thr = prog(f, ...T.toHome, easeInOut); // lock -> home
  const homeIn = prog(f, T.toHome[0] + 2, T.toHome[1] + 4, easeOutCubic);
  const rev = prog(f, ...T.reveal, easeOutCubic); // home -> details
  const logo = prog(f, ...T.toLogo, easeInOut); // details -> logo

  const homeIdx = f - T.homeBase;
  const landing = prog(homeIdx, HOME_LAND_IDX, HOME_LAND_IDX + 3, easeInOut);
  const pop = sp(T.rowLands);
  const glow = bump(f, T.rowLands + 2, 34);

  const darkBar = thr;
  const lightBar = 1 - thr;

  return (
    <AbsoluteFill style={{ background: C.page, overflow: "hidden" }}>
      <Fonts />

      {/* everything the camera moves */}
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
        {/* 1. lock screen (OS) */}
        {thr < 1 && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              opacity: 1 - thr,
              transform: `scale(${1 + 0.35 * thr})`,
              filter: `blur(${thr * 24}px)`,
            }}
          >
            <div style={{ width: 390, height: 844, transform: "scale(3)", transformOrigin: "0 0", position: "relative" }}>
              <LockScreen f={f} sms={sp(T.sms)} detect={sp(T.detect)} glow={bump(f, 62, 26)} />
            </div>
          </div>
        )}

        {/* 2. the real Home */}
        {thr > 0 && logo < 1 && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              opacity: homeIn,
              transform: `scale(${(0.86 + 0.14 * homeIn) * (1 - 0.05 * rev)})`,
              filter: `brightness(${1 - 0.12 * rev})`,
            }}
          >
            <Frame src={seq("home", Math.min(homeIdx, HOME_LAND_IDX - 1), HOME_FRAMES)} />
            {homeIdx >= HOME_LAND_IDX - 1 && (
              <Frame src={seq("home", homeIdx, HOME_FRAMES)} style={{ opacity: landing }} />
            )}
            {/* the new expense pops in: a copy of its row, springing up with a red glow */}
            {homeIdx >= HOME_LAND_IDX && (
              <div
                style={{
                  position: "absolute",
                  left: ROW.x,
                  top: ROW.y,
                  width: ROW.w,
                  height: ROW.h,
                  borderRadius: ROW.r,
                  overflow: "hidden",
                  opacity: clamp01(pop * 2),
                  transform: `scale(${0.9 + 0.1 * pop})`,
                  boxShadow: `0 0 0 ${10 * glow}px rgba(255,59,48,${0.4 * glow})`,
                }}
              >
                <Img
                  src={seq("home", homeIdx, HOME_FRAMES)}
                  style={{ position: "absolute", left: -ROW.x, top: -ROW.y, width: W, height: H }}
                />
              </div>
            )}
            {/* covers the few pixels of a lower card that peek out above the nav bar */}
            <div style={{ position: "absolute", left: 0, top: 2096, width: W, height: 180, background: C.page }} />
          </div>
        )}

        {/* 3. the real Expense details, opened from the row with a radial reveal */}
        {rev > 0 && logo < 1 && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              opacity: 1 - logo,
              clipPath: `circle(${rev * 2900}px at ${ROW_CENTER.x}px ${ROW_CENTER.y}px)`,
              transform: `scale(${(1.05 - 0.05 * rev) * (1 - 0.1 * logo)})`,
              transformOrigin: `${ROW_CENTER.x}px ${ROW_CENTER.y}px`,
            }}
          >
            <Frame src={seq("details", f - T.detailsBase, DETAILS_FRAMES)} />
          </div>
        )}

        {/* 4. the real splash: logo and the icon orbit */}
        {logo > 0 && (
          <div style={{ position: "absolute", inset: 0, opacity: logo, transform: `scale(${1.12 - 0.12 * logo})` }}>
            <Frame src={seq("splash", f - T.logoBase, SPLASH_FRAMES)} />
          </div>
        )}

        <TapMarker f={f} />
        {/* status bar (moves with the screen like the rest of the content) */}
        <div style={{ position: "absolute", left: 0, top: 0, width: 390, height: 47, transform: "scale(3)", transformOrigin: "0 0", zIndex: 40 }}>
          <div style={{ position: "absolute", inset: 0, opacity: lightBar }}>
            <StatusBar color="#FFFFFF" />
          </div>
          <div style={{ position: "absolute", inset: 0, opacity: darkBar }}>
            <StatusBar color={C.inkDeep} />
          </div>
        </div>
      </div>

    </AbsoluteFill>
  );
};

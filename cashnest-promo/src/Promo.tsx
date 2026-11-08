import React from "react";
import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Fonts } from "./Fonts";
import { IconOrbit, Logo, StartPill } from "./Splash";
import { DetailsScreen, HomeScreen, LockScreen, Pop, useSpring } from "./screens/app";
import { C, H, W, clamp01, easeInOut, easeOutCubic, ink, inter, prog } from "./tokens";

const SPLASH_SCALE = H / 844; // the splash's logical-to-canvas scale
const PS = 1.88; // phone screen scale (390 logical px -> canvas)
const PHONE_TOP = 285;

export const DURATION = 450; // 15 s

/** Whole timeline, in frames at 30 fps. */
const T = {
  phoneIn: 26,
  sms: 16,
  detect: 60,
  tapNotif: 92,
  toHome: [96, 112] as const,
  homeT0: 98,
  rowAt: 124,
  tapRow: 192,
  reveal: [194, 212] as const,
  detailsT0: 198,
  totalPulse: 262,
  phoneOut: [300, 336] as const,
  outro: 312,
};

const bump = (f: number, a: number, dur = 10) => {
  const t = clamp01((f - a) / dur);
  return t <= 0 || t >= 1 ? 0 : Math.sin(Math.PI * t);
};

/* ------------------------------ camera ------------------------------ */
/** A screen magnifier inside the phone: focus point (logical px) + zoom. */
const CAM: [number, number, number, number][] = [
  [0, 1, 195, 422],
  [14, 1, 195, 422],
  [40, 1.1, 195, 352],
  [58, 1.1, 195, 352],
  [82, 1.13, 195, 400],
  [94, 1.13, 195, 405],
  [112, 1, 195, 422],
  [118, 1, 195, 422],
  [138, 1.12, 195, 345],
  [148, 1.12, 195, 345],
  [170, 1.1, 195, 215],
  [184, 1.04, 195, 300],
  [192, 1.04, 195, 330],
  [206, 1.04, 195, 300],
  [226, 1.07, 195, 300],
  [250, 1.09, 195, 400],
  [272, 1.09, 195, 400],
  [296, 1, 195, 422],
];
const camAt = (f: number) => {
  const ease = Easing.bezier(0.65, 0, 0.35, 1);
  const frames = CAM.map((k) => k[0]);
  const v = (i: number) => interpolate(f, frames, CAM.map((k) => k[i]), {
    easing: ease,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const sc = v(1);
  // never pan past the screen edge
  const x = Math.min(390 - 195 / sc, Math.max(195 / sc, v(2)));
  const y = Math.min(844 - 422 / sc, Math.max(422 / sc, v(3)));
  return { s: sc, x, y };
};

/* ------------------------------ taps ------------------------------ */
const TAPS = [
  { f: T.tapNotif, x: 195, y: 432 },
  { f: T.tapRow, x: 195, y: 358 },
];
const TapMarker: React.FC<{ f: number }> = ({ f }) => (
  <>
    {TAPS.map((tp, i) => {
      const t = clamp01((f - (tp.f - 4)) / 18);
      if (t <= 0 || t >= 1) return null;
      const g = easeOutCubic(t);
      const a = t < 0.2 ? t / 0.2 : 1 - (t - 0.2) / 0.8;
      const r = 20 + 26 * g;
      return (
        <div key={i} style={{ position: "absolute", left: tp.x, top: tp.y, width: 0, height: 0, zIndex: 50 }}>
          <div style={{ position: "absolute", left: -r, top: -r, width: r * 2, height: r * 2, borderRadius: "50%", border: `2px solid ${ink(0.4)}`, background: ink(0.12), opacity: a }} />
          <div style={{ position: "absolute", left: -8, top: -8, width: 16, height: 16, borderRadius: "50%", background: ink(0.4), opacity: a }} />
        </div>
      );
    })}
  </>
);

/* --------------------------- app inside phone --------------------------- */
const PhoneApp: React.FC<{ f: number }> = ({ f }) => {
  const sp = useSpring();
  const cam = camAt(f);

  // lock -> home zoom-through
  const thr = prog(f, ...T.toHome, easeInOut);
  const homeIn = prog(f, T.toHome[0] + 2, T.toHome[1] + 4, easeOutCubic);
  // home -> details radial reveal from the tapped row
  const rev = prog(f, ...T.reveal, easeOutCubic);

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: 390,
        height: 844,
        transformOrigin: "0 0",
        transform: `translate(${195 - cam.x * cam.s}px, ${422 - cam.y * cam.s}px) scale(${cam.s})`,
      }}
    >
      {thr < 1 && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            opacity: 1 - thr,
            transform: `scale(${1 + 0.35 * thr})`,
            transformOrigin: "50% 50%",
            filter: `blur(${thr * 8}px)`,
          }}
        >
          <LockScreen f={f} sms={sp(f, T.sms)} detect={sp(f, T.detect)} glow={bump(f, 62, 26)} />
        </div>
      )}
      {thr > 0 && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            opacity: homeIn,
            transform: `scale(${(0.86 + 0.14 * homeIn) * (1 - 0.05 * rev)})`,
            transformOrigin: "50% 50%",
            filter: `brightness(${1 - 0.12 * rev})`,
          }}
        >
          <HomeScreen f={f} t0={T.homeT0} rowAt={T.rowAt} glow={bump(f, T.rowAt + 4, 30)} />
        </div>
      )}
      {rev > 0 && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            clipPath: `circle(${rev * 1000}px at 195px 358px)`,
            transform: `scale(${1.05 - 0.05 * rev})`,
            transformOrigin: "195px 358px",
          }}
        >
          <DetailsScreen f={f} t0={T.detailsT0} totalPulse={bump(f, T.totalPulse, 16)} />
        </div>
      )}
      <TapMarker f={f} />
    </div>
  );
};

/* ------------------------------ device ------------------------------ */
const Phone: React.FC<{ f: number }> = ({ f }) => {
  const bezel = 14;
  const sw = 390 * PS;
  const sh = 844 * PS;
  const enter = prog(f, 0, T.phoneIn, Easing.out(Easing.cubic));
  const exit = prog(f, ...T.phoneOut, Easing.in(Easing.cubic));
  const idle = enter >= 1 && exit === 0 ? 1 : 0;
  const floatY = Math.sin(f / 22) * 5 * idle;
  const tilt = Math.sin(f / 31) * 0.5 * idle;
  return (
    <div
      style={{
        position: "absolute",
        left: (W - (sw + bezel * 2)) / 2,
        top: PHONE_TOP,
        width: sw + bezel * 2,
        height: sh + bezel * 2,
        boxSizing: "border-box",
        padding: bezel,
        borderRadius: 112,
        background: "#0E1A26",
        boxShadow: `0 50px 110px rgba(17,45,65,0.28), 0 0 0 3px rgba(255,255,255,0.9) inset, 0 0 0 2px rgba(17,45,65,0.15)`,
        transform: `perspective(2600px) translateY(${(1 - enter) * 1500 + exit * 1900 + floatY}px) rotateX(${(1 - enter) * 16}deg) rotateZ(${(1 - enter) * -6 + exit * 9 + tilt}deg) scale(${0.9 + 0.1 * enter})`,
        transformOrigin: "50% 60%",
      }}
    >
      <div style={{ position: "relative", width: sw, height: sh, borderRadius: 98, overflow: "hidden", background: C.page }}>
        <div style={{ position: "absolute", left: 0, top: 0, width: 390, height: 844, transform: `scale(${PS})`, transformOrigin: "0 0" }}>
          <PhoneApp f={f} />
        </div>
        <div style={{ position: "absolute", top: 14, left: "50%", marginLeft: -62, width: 124, height: 36, borderRadius: 20, background: "#05080C" }} />
        <div style={{ position: "absolute", bottom: 12, left: "50%", marginLeft: -70, width: 140, height: 5, borderRadius: 3, background: "rgba(6,16,35,0.85)", opacity: 0 }} />
      </div>
    </div>
  );
};

/* ----------------------------- captions ----------------------------- */
const Em: React.FC<{ children: React.ReactNode }> = ({ children }) => <span style={{ color: C.red }}>{children}</span>;

const CAPTIONS: { a: number; b: number; node: React.ReactNode }[] = [
  { a: 8, b: 58, node: <>SMS <Em>arrives</Em></> },
  { a: 58, b: 102, node: <>CashNest <Em>detects</Em> it</> },
  { a: 102, b: 192, node: <>Straight to <Em>Home</Em></> },
  { a: 192, b: 302, node: <>Every <Em>detail</Em>, saved</> },
];

const Captions: React.FC<{ f: number }> = ({ f }) => {
  const sp = useSpring();
  return (
    <>
      {CAPTIONS.map((c, i) => {
        if (f < c.a || f > c.b + 2) return null;
        const t = sp(f, c.a);
        const out = prog(f, c.b - 6, c.b, easeInOut);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              top: 120,
              width: W,
              textAlign: "center",
              opacity: clamp01(t * 2) * (1 - out),
              transform: `translateY(${(1 - t) * 34 - out * 20}px) scale(${0.86 + 0.14 * t})`,
              ...inter(92, 600, -3.2),
              lineHeight: 1.05,
            }}
          >
            {c.node}
          </div>
        );
      })}
    </>
  );
};

/* ----------------------------- composition ----------------------------- */
export const Promo: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sp = (start: number, cfg = { damping: 11, stiffness: 160, mass: 0.6 }) =>
    spring({ frame: f - start, fps, config: cfg });

  const phoneVisible = f < T.phoneOut[1];
  const logoT = sp(T.outro);
  const textT = sp(T.outro + 10);
  const pillT = sp(T.outro + 20);
  const press = bump(f, T.outro + 84, 12);

  return (
    <AbsoluteFill style={{ background: C.splash, overflow: "hidden" }}>
      <Fonts />
      <IconOrbit cx={W / 2} cy={388 * SPLASH_SCALE} scale={SPLASH_SCALE} speed={1.8} />

      {phoneVisible && <Captions f={f} />}
      {phoneVisible && <Phone f={f} />}

      {f >= T.outro && (
        <>
          <div
            style={{
              position: "absolute",
              left: W / 2 - 260,
              top: 700 - 260,
              opacity: clamp01(logoT * 1.5),
              transform: `scale(${0.5 + 0.5 * logoT})`,
            }}
          >
            <Logo size={520} />
          </div>
          <div
            style={{
              position: "absolute",
              top: 1000,
              width: W,
              textAlign: "center",
              opacity: clamp01(textT * 1.6),
              transform: `translateY(${(1 - textT) * 40}px) scale(${0.9 + 0.1 * textT})`,
            }}
          >
            <div style={{ ...inter(92, 600, -3.2), lineHeight: 1.05 }}>Payments that</div>
            <div style={{ ...inter(92, 600, -3.2, C.red), lineHeight: 1.05 }}>log themselves.</div>
          </div>
          <div
            style={{
              position: "absolute",
              left: W / 2,
              top: 1480,
              opacity: clamp01(pillT * 1.6),
              transform: `translate(-50%, -50%) translateY(${(1 - pillT) * 50}px) scale(${SPLASH_SCALE * (0.8 + 0.2 * pillT)})`,
            }}
          >
            <StartPill width={300} label="Get CashNest" pressed={press} />
          </div>
          <div
            style={{
              position: "absolute",
              top: 1600,
              width: W,
              textAlign: "center",
              opacity: clamp01(pillT * 1.6),
              ...inter(34, 400, -0.4, ink(0.55)),
            }}
          >
            Available on iOS &amp; Android
          </div>
        </>
      )}
    </AbsoluteFill>
  );
};

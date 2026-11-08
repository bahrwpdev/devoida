import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { Fonts } from "./Fonts";
import {
  IconOrbit,
  Logo,
  StartPill,
  bottomFade,
  logoFade,
} from "./Splash";
import {
  AddSplitScreen,
  CaptureSheet,
  ExpensesScreen,
  ReviewSheet,
  SplitsScreen,
} from "./screens/screens";
import { NavBar, Popup } from "./ui/kit";
import { Icon } from "./ui/Icon";
import { C, H, W, clamp01, easeInOut, easeOut, easeOutCubic, ink, inter, prog } from "./tokens";

/** Splash/app logical size -> canvas. 844 logical px = full video height. */
const SPLASH_SCALE = H / 844; // 2.275
/** Phone: logical 390x844 screen scale inside the device mock. */
const PS = 1.88;
const PHONE_TOP = 285;

export const DURATION = 1080;

/** Timeline in frames at 30 fps (one place to retime the whole video). */
const T = {
  splashPress: 70,
  hookIn: 104,
  phoneIn: [172, 214] as const,
  popupIn: 232,
  popupOut: 298,
  sheetIn: [318, 345] as const,
  amount: [334, 356] as const,
  merchant: [340, 364] as const,
  category: [370, 380] as const,
  tapAdd: 440,
  sheetOut: [452, 474] as const,
  rowIn: [470, 496] as const,
  tapNav: 545,
  navMove: [548, 563] as const,
  tapFab: 598,
  pushIn: [610, 634] as const,
  billAmount: [644, 672] as const,
  tax: [680, 692] as const,
  tip: [698, 710] as const,
  people: [716, 728, 740] as const,
  tapReview: 774,
  reviewIn: [786, 812] as const,
  tapConfirm: 854,
  reviewOut: [866, 888] as const,
  splitRow: [888, 912] as const,
  savedIn: 892,
  savedOut: 944,
  phoneOut: [940, 978] as const,
  outro: 950,
};

const bump = (f: number, a: number, dur = 10) => {
  const t = clamp01((f - a) / dur);
  return t <= 0 || t >= 1 ? 0 : Math.sin(Math.PI * t);
};

/* ------------------------------------------------------------------ */
/* Tap marker: where the finger lands on the phone screen              */
/* ------------------------------------------------------------------ */
const TAPS = [
  { f: T.tapAdd, x: 248, y: 794 },
  { f: T.tapNav, x: 240, y: 792 },
  { f: T.tapFab, x: 339, y: 675 },
  { f: T.tapReview, x: 248, y: 794 },
  { f: T.tapConfirm, x: 248, y: 794 },
];

const TapMarker: React.FC<{ f: number }> = ({ f }) => (
  <>
    {TAPS.map((tp, i) => {
      const t = clamp01((f - (tp.f - 6)) / 22);
      if (t <= 0 || t >= 1) return null;
      const grow = easeOutCubic(t);
      const a = t < 0.25 ? t / 0.25 : 1 - (t - 0.25) / 0.75;
      return (
        <div key={i} style={{ position: "absolute", left: tp.x, top: tp.y, width: 0, height: 0 }}>
          <div
            style={{
              position: "absolute",
              left: -26 * (0.7 + 0.8 * grow),
              top: -26 * (0.7 + 0.8 * grow),
              width: 52 * (0.7 + 0.8 * grow),
              height: 52 * (0.7 + 0.8 * grow),
              borderRadius: "50%",
              border: `2px solid ${ink(0.35)}`,
              background: ink(0.1),
              opacity: a,
            }}
          />
          <div
            style={{
              position: "absolute",
              left: -9,
              top: -9,
              width: 18,
              height: 18,
              borderRadius: "50%",
              background: ink(0.35),
              opacity: a,
            }}
          />
        </div>
      );
    })}
  </>
);

/* ------------------------------------------------------------------ */
/* The app, driven by the global frame                                 */
/* ------------------------------------------------------------------ */
const PhoneApp: React.FC<{ f: number }> = ({ f }) => {
  // Expenses -> Splits
  const navIdx = 1 + prog(f, ...T.navMove, easeInOut);
  const toSplits = prog(f, T.navMove[0] + 4, T.navMove[1] + 8, easeOut);

  // Add split (pushed from the right)
  const push = prog(f, ...T.pushIn) - prog(f, T.reviewOut[0] + 4, T.reviewOut[1] + 4);
  const pushAmt = Math.max(0, push);

  // Sheets
  const capIn = prog(f, ...T.sheetIn);
  const capOut = prog(f, ...T.sheetOut, easeInOut);
  const capY = (1 - capIn) * 105 + capOut * 105;
  const revIn = prog(f, ...T.reviewIn);
  const revOut = prog(f, ...T.reviewOut, easeInOut);
  const revY = (1 - revIn) * 105 + revOut * 105;
  const barrier = 0.45 * (Math.min(capIn, 1 - capOut) + Math.min(revIn, 1 - revOut));

  // Capture content
  const amount = 6.85 * prog(f, ...T.amount);
  const typed = Math.round(9 * prog(f, ...T.merchant, (x) => x));
  const caret = f % 16 < 9 && typed < 9 && f > T.merchant[0] ? "|" : "";
  const merchant = "Starbucks".slice(0, typed) + caret;
  const selected = prog(f, ...T.category, easeOut);

  // Add split content
  const billAmount = 86.4 * prog(f, ...T.billAmount);
  const taxT = prog(f, ...T.tax);
  const tipT = prog(f, ...T.tip);
  const total = billAmount + 7.2 * taxT + 9 * tipT;
  const ppl = T.people.map((s) => prog(f, s, s + 12));
  const share = total / 3;

  // Popups
  const smsT = prog(f, T.popupIn, T.popupIn + 16) - prog(f, T.popupOut, T.popupOut + 14, easeInOut);
  const savedT = prog(f, T.savedIn, T.savedIn + 16) - prog(f, T.savedOut, T.savedOut + 14, easeInOut);

  return (
    <div style={{ position: "absolute", inset: 0, background: C.page, overflow: "hidden" }}>
      {/* tab screens */}
      <div style={{ position: "absolute", inset: 0, opacity: 1 - toSplits }}>
        <ExpensesScreen newRow={prog(f, ...T.rowIn)} />
      </div>
      <div style={{ position: "absolute", inset: 0, opacity: toSplits }}>
        <SplitsScreen newRow={prog(f, ...T.splitRow)} fabPressed={bump(f, T.tapFab, 12)} />
      </div>

      {/* nav bar slides away while a form is open */}
      <div
        style={{
          position: "absolute",
          left: 14,
          bottom: 18,
          transform: `translateY(${pushAmt * 140}px)`,
        }}
      >
        <NavBar index={navIdx} />
      </div>

      {/* add split bill, pushed over the list */}
      {pushAmt > 0 && (
        <div style={{ position: "absolute", inset: 0, transform: `translateX(${(1 - pushAmt) * 390}px)` }}>
          <AddSplitScreen
            amount={billAmount}
            tax={7.2}
            taxT={taxT}
            tip={9}
            tipT={tipT}
            total={total}
            people={ppl}
            share={share}
            reviewPressed={bump(f, T.tapReview, 12)}
          />
        </div>
      )}

      {/* barrier + sheets */}
      {barrier > 0.001 && (
        <div style={{ position: "absolute", inset: 0, background: `rgba(6,16,35,${barrier})` }} />
      )}
      {capIn > 0 && capOut < 1 && (
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, transform: `translateY(${capY}%)` }}>
          <CaptureSheet amount={amount} merchant={merchant} selected={selected} addPressed={bump(f, T.tapAdd, 12)} />
        </div>
      )}
      {revIn > 0 && revOut < 1 && (
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, transform: `translateY(${revY}%)` }}>
          <ReviewSheet confirmPressed={bump(f, T.tapConfirm, 12)} />
        </div>
      )}

      {/* popups (slide down from the top) */}
      {smsT > 0.001 && (
        <div style={{ position: "absolute", left: 0, right: 0, top: 54, transform: `translateY(${(1 - smsT) * -130}px)`, opacity: smsT }}>
          <Popup
            tile={C.ink}
            glyph={<Icon name="sms" size={20} color={C.white} />}
            title="Bank message"
            message="Purchase $6.85 at STARBUCKS, card ending 4821."
          />
        </div>
      )}
      {savedT > 0.001 && (
        <div style={{ position: "absolute", left: 0, right: 0, top: 54, transform: `translateY(${(1 - savedT) * -130}px)`, opacity: savedT }}>
          <Popup
            tile={C.red}
            glyph={<Icon name="split" size={20} color={C.white} />}
            title="Split saved"
            message="Dinner at Nobu, 3 people, $34.20 each."
          />
        </div>
      )}

      <TapMarker f={f} />
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Device mock                                                         */
/* ------------------------------------------------------------------ */
const Phone: React.FC<{ f: number; y: number }> = ({ f, y }) => {
  const bezel = 14;
  const sw = 390 * PS;
  const sh = 844 * PS;
  return (
    <div
      style={{
        position: "absolute",
        left: (W - (sw + bezel * 2)) / 2,
        top: PHONE_TOP + y,
        width: sw + bezel * 2,
        height: sh + bezel * 2,
        boxSizing: "border-box",
        padding: bezel,
        borderRadius: 112,
        background: "#0E1A26",
        boxShadow: `0 50px 110px rgba(17,45,65,0.28), 0 0 0 3px rgba(255,255,255,0.9) inset, 0 0 0 2px rgba(17,45,65,0.15)`,
      }}
    >
      <div style={{ position: "relative", width: sw, height: sh, borderRadius: 98, overflow: "hidden", background: C.page }}>
        <div style={{ width: 390, height: 844, transform: `scale(${PS})`, transformOrigin: "0 0", position: "relative" }}>
          <PhoneApp f={f} />
        </div>
        <div
          style={{
            position: "absolute",
            top: 14,
            left: "50%",
            marginLeft: -62,
            width: 124,
            height: 36,
            borderRadius: 20,
            background: "#05080C",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 12,
            left: "50%",
            marginLeft: -70,
            width: 140,
            height: 5,
            borderRadius: 3,
            background: "rgba(6,16,35,0.85)",
          }}
        />
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Text                                                                */
/* ------------------------------------------------------------------ */
const Em: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span style={{ color: C.red }}>{children}</span>
);

const CAPTIONS: { a: number; b: number; title: React.ReactNode; sub: string }[] = [
  { a: 186, b: 328, title: <>Payments <Em>log themselves</Em></>, sub: "CashNest reads the bank message for you." },
  { a: 328, b: 470, title: <>Confirm in <Em>one tap</Em></>, sub: "Amount, merchant and category, filled in." },
  { a: 470, b: 546, title: <>Saved to <Em>Expenses</Em></>, sub: "No typing. No spreadsheets." },
  { a: 546, b: 700, title: <>Split <Em>any bill</Em></>, sub: "Add tax and tip. Even or custom." },
  { a: 700, b: 860, title: <>Everyone gets <Em>their number</Em></>, sub: "Even to the cent, tax and tip included." },
  { a: 860, b: 948, title: <>Split <Em>saved</Em></>, sub: "Notify your friends in one tap." },
];

const Caption: React.FC<{ f: number }> = ({ f }) => (
  <>
    {CAPTIONS.map((c, i) => {
      const inT = prog(f, c.a, c.a + 16);
      const outT = prog(f, c.b - 10, c.b, easeInOut);
      const o = Math.min(inT, 1 - outT);
      if (o <= 0.001) return null;
      return (
        <div
          key={i}
          style={{
            position: "absolute",
            top: 92,
            left: 0,
            width: W,
            textAlign: "center",
            opacity: o,
            transform: `translateY(${(1 - inT) * 26 - outT * 14}px)`,
          }}
        >
          <div style={{ ...inter(74, 600, -2.4), lineHeight: 1.1 }}>{c.title}</div>
          <div style={{ ...inter(36, 400, -0.5, ink(0.55)), marginTop: 14 }}>{c.sub}</div>
        </div>
      );
    })}
  </>
);

/* ------------------------------------------------------------------ */
/* Composition                                                         */
/* ------------------------------------------------------------------ */
export const Promo: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();

  // ---- logo: splash position -> header -> (hidden) -> outro
  const toHook = prog(f, 96, 134, easeInOut);
  const hideLogo = prog(f, 172, 196, easeInOut);
  const outroLogo = prog(f, T.outro + 4, T.outro + 40);
  const splashSize = 252 * SPLASH_SCALE;
  const logoSize = splashSize + (250 - splashSize) * toHook;
  const logoCy = 880 + (250 - 880) * toHook;
  const logoOpacity =
    f < 190
      ? logoFade(f, fps) * (1 - hideLogo)
      : outroLogo;
  const oSize = 470;
  const outroSize = f >= 190 ? oSize : logoSize;
  const outroCy = f >= 190 ? 650 + (1 - outroLogo) * 40 : logoCy;

  // ---- splash CTA pill
  const pillOpacity = bottomFade(f, fps) * (1 - prog(f, 84, 104, easeInOut));
  const pillPressed = bump(f, T.splashPress, 12);
  const pillY = 1824 + prog(f, 84, 104, easeInOut) * 80;

  // ---- hook headline
  const hookIn = prog(f, T.hookIn, T.hookIn + 20);
  const hookOut = prog(f, 168, 186, easeInOut);
  const hook = Math.min(hookIn, 1 - hookOut);

  // ---- phone
  const phoneEnter = prog(f, ...T.phoneIn);
  const phoneExit = prog(f, ...T.phoneOut, easeInOut);
  const phoneY = (1 - phoneEnter) * 1800 + phoneExit * 1900;

  // ---- outro
  const outroText = prog(f, T.outro + 22, T.outro + 44);
  const outroCta = prog(f, T.outro + 38, T.outro + 60);
  const ctaPress = bump(f, T.outro + 86, 12);

  return (
    <AbsoluteFill style={{ background: C.splash, overflow: "hidden" }}>
      <Fonts />
      <IconOrbit cx={W / 2} cy={388 * SPLASH_SCALE} scale={SPLASH_SCALE} speed={1.6} />

      {/* logo */}
      {logoOpacity > 0.001 && (
        <div
          style={{
            position: "absolute",
            left: W / 2 - outroSize / 2,
            top: outroCy - outroSize / 2,
            opacity: logoOpacity,
          }}
        >
          <Logo size={outroSize} />
        </div>
      )}

      {/* splash CTA */}
      {pillOpacity > 0.001 && (
        <div
          style={{
            position: "absolute",
            left: W / 2,
            top: pillY,
            opacity: pillOpacity,
            transform: `translate(-50%, -50%) scale(${SPLASH_SCALE})`,
          }}
        >
          <StartPill width={362} pressed={pillPressed} />
        </div>
      )}

      {/* hook */}
      {hook > 0.001 && (
        <div
          style={{
            position: "absolute",
            top: 470,
            width: W,
            textAlign: "center",
            opacity: hook,
            transform: `translateY(${(1 - hookIn) * 30 - hookOut * 20}px)`,
          }}
        >
          <div style={{ ...inter(112, 600, -4), lineHeight: 1.04 }}>Expenses that</div>
          <div style={{ ...inter(112, 600, -4, C.red), lineHeight: 1.04 }}>add themselves.</div>
          <div style={{ ...inter(42, 400, -0.6, ink(0.55)), marginTop: 34 }}>
            And splits that settle themselves.
          </div>
        </div>
      )}

      {/* captions + phone */}
      <Caption f={f} />
      {phoneEnter > 0 && phoneExit < 1 && <Phone f={f} y={phoneY} />}

      {/* outro */}
      {outroText > 0.001 && (
        <div
          style={{
            position: "absolute",
            top: 960,
            width: W,
            textAlign: "center",
            opacity: outroText,
            transform: `translateY(${(1 - outroText) * 30}px)`,
          }}
        >
          <div style={{ ...inter(88, 600, -3), lineHeight: 1.06 }}>Auto expenses.</div>
          <div style={{ ...inter(88, 600, -3, C.red), lineHeight: 1.06 }}>Effortless splits.</div>
        </div>
      )}
      {outroCta > 0.001 && (
        <>
          <div
            style={{
              position: "absolute",
              left: W / 2,
              top: 1500,
              opacity: outroCta,
              transform: `translate(-50%, -50%) translateY(${(1 - outroCta) * 40}px) scale(${SPLASH_SCALE})`,
            }}
          >
            <StartPill width={300} label="Get CashNest" pressed={ctaPress} />
          </div>
          <div
            style={{
              position: "absolute",
              top: 1620,
              width: W,
              textAlign: "center",
              opacity: outroCta,
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

import React from "react";
import { staticFile } from "remotion";
import { C, clamp01, inter } from "./tokens";
import { Icon } from "./ui/Icon";

/**
 * The only part that is not rendered by the app itself: the OS lock screen with
 * the bank SMS and CashNest's detection notification. Brand palette only.
 */

/** Animated wave lines, same maths as animated_wave_lines.dart. */
const WaveLines: React.FC<{ f: number; w: number; h: number }> = ({ f, w, h }) => {
  const t = (f / 30 / 14) * 2 * Math.PI;
  const swell = 0.6 + 0.4 * Math.sin(t * 0.5);
  const groups: [string, number, number][] = [
    ["255,255,255", 0.12, 1],
    ["255,59,48", 0.18, -1],
  ];
  return (
    <svg width={w} height={h} style={{ position: "absolute", left: 0, top: 0 }}>
      {groups.flatMap(([rgb, alpha, dir]) =>
        [0, 1, 2].map((k) => {
          let d = "";
          for (let x = 0; x <= w + 4; x += 4) {
            const u = x / w;
            const y = h * (0.6 + k * 0.09) + dir * 16 * swell * Math.sin(u * 5.5 + t * dir + k * 0.7);
            d += (x === 0 ? "M" : "L") + x + " " + y.toFixed(1);
          }
          return <path key={`${rgb}${k}`} d={d} fill="none" stroke={`rgba(${rgb},${alpha - k * 0.03})`} strokeWidth={0.8} />;
        }),
      )}
    </svg>
  );
};

const Pop: React.FC<{ t: number; children: React.ReactNode }> = ({ t, children }) => (
  <div
    style={{
      opacity: clamp01(t * 1.6),
      transform: `translateY(${(1 - t) * 18}px) scale(${0.8 + 0.2 * t})`,
      transformOrigin: "50% 0%",
    }}
  >
    {children}
  </div>
);

const Banner: React.FC<{
  icon: React.ReactNode;
  app: string;
  title: string;
  body: string;
  glow?: number;
}> = ({ icon, app, title, body, glow = 0 }) => (
  <div
    style={{
      margin: "0 12px",
      padding: 12,
      boxSizing: "border-box",
      borderRadius: 22,
      background: "rgba(246,246,248,0.92)",
      boxShadow: `0 8px 30px rgba(0,0,0,0.25), 0 0 0 ${3 * glow}px rgba(255,59,48,${0.5 * glow})`,
      display: "flex",
      gap: 10,
    }}
  >
    <div style={{ width: 38, height: 38, borderRadius: 9, overflow: "hidden", flexShrink: 0 }}>{icon}</div>
    <div style={{ flex: 1 }}>
      <div style={{ display: "flex", alignItems: "baseline" }}>
        <div style={{ flex: 1, ...inter(13.5, 600, -0.2, "#111") }}>{title}</div>
        <div style={inter(11.5, 400, 0, "rgba(60,60,67,0.6)")}>now</div>
      </div>
      <div style={{ ...inter(13, 400, -0.1, "#222"), lineHeight: 1.3, marginTop: 1 }}>{body}</div>
      <div style={{ ...inter(10.5, 500, 0.2, "rgba(60,60,67,0.55)"), marginTop: 3, textTransform: "uppercase" }}>{app}</div>
    </div>
  </div>
);

export const LockScreen: React.FC<{ f: number; sms: number; detect: number; glow: number }> = ({
  f,
  sms,
  detect,
  glow,
}) => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      overflow: "hidden",
      background: `linear-gradient(170deg, ${C.ink} 0%, #0B1D2D 55%, ${C.inkDeep} 100%)`,
    }}
  >
    <WaveLines f={f} w={390} h={844} />
    <div style={{ height: 47 }} />
    <div style={{ textAlign: "center", marginTop: 14 }}>
      <svg width="16" height="20" viewBox="0 0 16 20">
        <rect x="2" y="8" width="12" height="10" rx="2.5" fill="#fff" />
        <path d="M5 8V5.5a3 3 0 0 1 6 0V8" fill="none" stroke="#fff" strokeWidth="1.8" />
      </svg>
      <div style={{ ...inter(17, 500, -0.2, "rgba(255,255,255,0.75)"), marginTop: 8 }}>Sunday, November 8</div>
      <div style={{ ...inter(92, 600, -3, "#fff"), lineHeight: 1, marginTop: 2 }}>9:41</div>
    </div>

    <div style={{ position: "absolute", left: 0, right: 0, top: 300 }}>
      <Pop t={sms}>
        <Banner
          icon={
            <div style={{ width: 38, height: 38, background: "#34C759", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon name="sms" size={22} color="#fff" />
            </div>
          }
          app="Messages"
          title="BANKALERT"
          body="Purchase of $6.85 at STARBUCKS #1182 with card ending 4821."
        />
      </Pop>
      <div style={{ height: 8 }} />
      <Pop t={detect}>
        <Banner
          icon={<img src={staticFile("app_icon_ios.png")} width={38} height={38} style={{ display: "block" }} />}
          app="CashNest"
          title="Payment detected"
          body="Starbucks, $6.85 added to Coffee."
          glow={glow}
        />
      </Pop>
    </div>

    <div style={{ position: "absolute", left: 40, right: 40, bottom: 52, display: "flex", justifyContent: "space-between" }}>
      {[0, 1].map((i) => (
        <div key={i} style={{ width: 50, height: 50, borderRadius: "50%", background: "rgba(255,255,255,0.16)" }} />
      ))}
    </div>
    <div style={{ position: "absolute", bottom: 8, left: "50%", marginLeft: -70, width: 140, height: 5, borderRadius: 3, background: "rgba(255,255,255,0.85)" }} />
  </div>
);

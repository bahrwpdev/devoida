import React from "react";
import { spring, staticFile, useVideoConfig } from "remotion";
import { C, S, clamp01, easeOut, easeOutCubic, ink, inter, money, prog } from "../tokens";
import { Icon, MIcon } from "../ui/Icon";
import {
  AppTopBar,
  Chip,
  DateHeader,
  ExpenseRow,
  Hair,
  NavBar,
  SplitRow,
  StatusBar,
  UiCard,
} from "../ui/kit";

/** Light, fast spring: the "components expand" feel (small overshoot). */
export const useSpring = () => {
  const { fps } = useVideoConfig();
  return (f: number, start: number) =>
    spring({ frame: f - start, fps, config: { damping: 10, stiffness: 230, mass: 0.5 } });
};

/** Pops a component in: grows from 88%, rises 14px, fades. */
export const Pop: React.FC<{
  t: number;
  children: React.ReactNode;
  origin?: string;
  style?: React.CSSProperties;
}> = ({ t, children, origin = "50% 0%", style }) => (
  <div
    style={{
      opacity: clamp01(t * 1.6),
      transform: `translateY(${(1 - t) * 18}px) scale(${0.8 + 0.2 * t})`,
      transformOrigin: origin,
      ...style,
    }}
  >
    {children}
  </div>
);

/* ============================= Lock screen ============================= */

const WaveLines: React.FC<{ f: number; w: number; h: number }> = ({ f, w, h }) => {
  // animated_wave_lines.dart: 14 s loop, white (dir +1) and red (dir -1) groups
  const t = ((f / 30) / 14) * 2 * Math.PI;
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
          return (
            <path key={`${rgb}${k}`} d={d} fill="none" stroke={`rgba(${rgb},${alpha - k * 0.03})`} strokeWidth={0.8} />
          );
        }),
      )}
    </svg>
  );
};

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
      background: "rgba(246,246,248,0.9)",
      boxShadow: `0 8px 30px rgba(0,0,0,0.25), 0 0 0 ${3 * glow}px rgba(255,59,48,${0.45 * glow})`,
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

export const LockScreen: React.FC<{
  f: number;
  sms: number; // spring 0..1
  detect: number; // spring 0..1
  glow: number;
}> = ({ f, sms, detect, glow }) => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      overflow: "hidden",
      background: "linear-gradient(165deg,#1c4a6b 0%,#112D41 42%,#061023 100%)",
    }}
  >
    <WaveLines f={f} w={390} h={844} />
    <StatusBar light />
    <div style={{ textAlign: "center", marginTop: 14 }}>
      <svg width="16" height="20" viewBox="0 0 16 20">
        <rect x="2" y="8" width="12" height="10" rx="2.5" fill="#fff" />
        <path d="M5 8V5.5a3 3 0 0 1 6 0V8" fill="none" stroke="#fff" strokeWidth="1.8" />
      </svg>
      <div style={{ ...inter(17, 500, -0.2, "rgba(255,255,255,0.75)"), marginTop: 8 }}>Sunday, November 8</div>
      <div style={{ ...inter(92, 600, -3, "#fff"), lineHeight: 1, marginTop: 2 }}>9:41</div>
    </div>

    {/* notifications */}
    <div style={{ position: "absolute", left: 0, right: 0, top: 300 }}>
      <Pop t={sms} origin="50% 0%">
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
      <Pop t={detect} origin="50% 0%">
        <Banner
          icon={<img src={staticFile("app_icon.jpg")} width={38} height={38} style={{ display: "block" }} />}
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

/* ================================ Home ================================ */

/** Numbers for the hero card, before and after the new $6.85 expense. */
const BEFORE = { spent: 412.3, today: 14.2, week: 188.45 };
const DELTA = 6.85;
const BUDGET = 1200;

const light = inter(11.5, 400, -0.1, "rgba(255,255,255,0.65)");
const bold = inter(11.5, 600, -0.1, C.white);

const HomeHeader: React.FC = () => (
  <div style={{ height: 48, position: "relative", margin: "0 0" }}>
    <div style={{ position: "absolute", left: 16, top: 8, display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ width: 32, height: 32, borderRadius: "50%", background: C.ink, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Icon name="user" size={17} color={C.white} />
      </div>
    </div>
    <img src={staticFile("logo-1.png")} height={32} style={{ position: "absolute", left: "50%", marginLeft: -54.7, top: 11.4 }} />
    <div style={{ position: "absolute", right: 8, top: 4, display: "flex" }}>
      {["users", "notification"].map((n) => (
        <div key={n} style={{ width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon name={n} size={22} color={C.ink} />
        </div>
      ))}
    </div>
  </div>
);

const HeroCard: React.FC<{ f: number; upd: number }> = ({ f, upd }) => {
  const spent = BEFORE.spent + DELTA * upd;
  const left = BUDGET - spent;
  const pct = spent / BUDGET;
  const day = 8 / 30;
  const t = ((f / 30) / 14) * 2 * Math.PI;
  const swell = 0.6 + 0.4 * Math.sin(t * 0.5);
  const cardH = 170;
  const waves = [
    ["255,255,255", 0.12, 1],
    ["255,59,48", 0.18, -1],
  ] as const;
  return (
    <div style={{ position: "relative", margin: `0 ${S.gutter}px`, borderRadius: 12, background: C.ink, overflow: "hidden", padding: "18px 16px 12px" }}>
      <svg width={358} height={cardH} style={{ position: "absolute", left: 0, top: 0 }}>
        {waves.flatMap(([rgb, alpha, dir]) =>
          [0, 1, 2].map((k) => {
            let d = "";
            for (let x = 0; x <= 362; x += 4) {
              const u = x / 358;
              const y = cardH * (0.6 + k * 0.09) + dir * 16 * swell * Math.sin(u * 5.5 + t * dir + k * 0.7);
              d += (x === 0 ? "M" : "L") + x + " " + y.toFixed(1);
            }
            return <path key={`${rgb}${k}`} d={d} fill="none" stroke={`rgba(${rgb},${alpha - k * 0.03})`} strokeWidth={0.8} />;
          }),
        )}
      </svg>
      <div style={{ position: "relative" }}>
        <div style={{ display: "flex", alignItems: "center", height: 17 }}>
          <div style={{ flex: 1, ...inter(17, 400, 0, C.white), lineHeight: 1 }}>
            Good morning, <span style={{ color: C.red }}>Rashad</span>
          </div>
          <Icon name="reload" size={18} color={C.white} />
        </div>
        <div style={{ height: 22 }} />
        <div style={light}>
          <span style={{ color: C.red }}>Nov</span> spends · <span style={bold}>On track</span>
        </div>
        <div style={{ display: "flex", alignItems: "flex-end", marginTop: 8 }}>
          <div style={{ flex: 1 }}>
            <div style={light}>Spent</div>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 6 }}>
              <div style={{ ...inter(22, 500, -0.6, C.white), lineHeight: 1 }}>{money(spent)}</div>
              <div style={{ ...light, marginBottom: 2 }}>of {money(BUDGET)}</div>
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={light}>Left</div>
            <div style={{ ...inter(22, 500, -0.6, C.white), lineHeight: 1 }}>{money(left)}</div>
          </div>
        </div>
        <div style={{ position: "relative", height: 12, marginTop: 10 }}>
          <div style={{ position: "absolute", top: 4, left: 0, right: 0, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.15)" }} />
          <div style={{ position: "absolute", top: 4, left: 0, width: `${pct * 100}%`, height: 4, borderRadius: 2, background: C.red }} />
          <div style={{ position: "absolute", top: 0, left: `${day * 100}%`, width: 2, height: 12, borderRadius: 1, background: C.white }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
          <div style={light}>
            Today <span style={bold}>{money(BEFORE.today + DELTA * upd)}</span>
          </div>
          <div style={light}>
            Last 7 days <span style={bold}>{money(BEFORE.week + DELTA * upd)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export const HomeScreen: React.FC<{
  f: number;
  t0: number; // frame Home appears
  rowAt: number; // frame the new expense lands
  glow: number;
}> = ({ f, t0, rowAt, glow }) => {
  const sp = useSpring();
  const upd = prog(f, rowAt + 6, rowAt + 30);
  const rowT = sp(f, rowAt);
  const grow = prog(f, rowAt, rowAt + 12, easeOutCubic);
  return (
    <div style={{ position: "absolute", inset: 0, background: C.page, overflow: "hidden" }}>
      <StatusBar />
      <HomeHeader />
      <div style={{ height: 16 }} />
      <Pop t={sp(f, t0 + 2)} origin="50% 0%">
        <HeroCard f={f} upd={upd} />
      </Pop>
      <div style={{ height: 24 }} />
      <div style={{ padding: `0 ${S.gutter}px` }}>
        <Pop t={sp(f, t0 + 8)} origin="0% 50%">
          <div style={{ ...inter(14, 500, -0.2), marginBottom: 10 }}>Recent transactions</div>
        </Pop>
        {/* the new, auto-detected expense: opens up, then settles */}
        <div style={{ maxHeight: 56 * grow, opacity: clamp01(grow * 2), overflow: "visible" }}>
          <div
            style={{
              transform: `scale(${0.9 + 0.1 * rowT})`,
              transformOrigin: "50% 0%",
              borderRadius: 12,
              boxShadow: `0 0 0 ${3.5 * glow}px rgba(255,59,48,${0.35 * glow})`,
            }}
          >
            <ExpenseRow
              name="Starbucks"
              when="Today, 9:41 AM"
              amount="$6.85"
              category="Coffee"
              glyph={{ svg: "coffee" }}
            />
          </div>
        </div>
        <Pop t={sp(f, t0 + 12)}>
          <ExpenseRow name="Uber" when="Today, 8:12 AM" amount="$14.20" category="Transport" glyph={{ material: "car" }} />
        </Pop>
        <Pop t={sp(f, t0 + 16)}>
          <SplitRow name="Weekend trip" when="Yesterday" amount="$412.00" people={4} />
        </Pop>
        <Pop t={sp(f, t0 + 20)}>
          <ExpenseRow name="Whole Foods" when="Yesterday, 6:30 PM" amount="$63.40" category="Groceries" glyph={{ svg: "shopping" }} />
        </Pop>
        <Pop t={sp(f, t0 + 24)}>
          <ExpenseRow name="Netflix" when="Nov 6" amount="$15.49" category="Entertainment" glyph={{ svg: "entertainment" }} />
        </Pop>
      </div>
      <div style={{ position: "absolute", left: 14, bottom: 18 }}>
        <Pop t={sp(f, t0 + 6)} origin="50% 100%">
          <NavBar index={0} />
        </Pop>
      </div>
    </div>
  );
};

/* ========================== Expense details ========================== */

const muted = inter(11.5, 400, -0.1, ink(0.55));

const DetailRow: React.FC<{ label: string; value: string; open?: boolean; t: number }> = ({
  label,
  value,
  open,
  t,
}) => (
  <div
    style={{
      display: "flex",
      alignItems: "flex-start",
      padding: "8px 0",
      opacity: clamp01(t * 1.5),
      transform: `translateX(${(1 - t) * 18}px)`,
    }}
  >
    <div style={inter(12.5, 400, -0.1, ink(0.55))}>{label}</div>
    <div style={{ flex: 1, textAlign: "right", ...inter(12.5, 500) }}>{value}</div>
    {open && (
      <svg width="13" height="13" viewBox="0 0 24 24" style={{ marginLeft: 6, marginTop: 2 }}>
        <path
          d="M19 19H5V5h7V3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z"
          fill={ink(0.55)}
        />
      </svg>
    )}
  </div>
);

export const DetailsScreen: React.FC<{ f: number; t0: number; totalPulse: number }> = ({
  f,
  t0,
  totalPulse,
}) => {
  const sp = useSpring();
  const line = prog(f, t0 + 26, t0 + 40);
  return (
    <div style={{ position: "absolute", inset: 0, background: C.page, overflow: "hidden" }}>
      <StatusBar />
      <AppTopBar
        title="Starbucks"
        caption="Expense"
        back="arrow_back"
        actions={[
          <Icon key="e" name="edit" size={21} color={C.ink} />,
          <Icon key="d" name="delete" size={21} color={C.red} />,
        ]}
      />
      <div style={{ padding: `2px ${S.gutter}px 0` }}>
        <Pop t={sp(f, t0)}>
          <UiCard padding="12px 14px 12px">
            <div style={{ display: "flex", alignItems: "center" }}>
              <div style={{ position: "relative", width: 40, height: 40 }}>
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: C.ink, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon name="coffee" size={20} color={C.white} />
                </div>
                <div style={{ position: "absolute", right: 0, bottom: 0, width: 16, height: 16, boxSizing: "border-box", borderRadius: "50%", background: C.red, border: `1.5px solid ${C.white}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <MIcon name="north_east" size={9} color={C.white} />
                </div>
              </div>
              <div style={{ flex: 1, marginLeft: 10 }}>
                <div style={inter(15, 600, -0.2)}>Starbucks</div>
                <div style={muted}>Today · 9:41 AM</div>
              </div>
              <div style={inter(20, 500, -0.6)}>$6.85</div>
            </div>
            <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
              <Chip text="One item" />
              <Chip text="Coffee" space icon="coffee" />
            </div>
          </UiCard>
        </Pop>

        {/* tabs */}
        <Pop t={sp(f, t0 + 6)} origin="0% 50%">
          <div style={{ padding: "14px 2px 10px" }}>
            <div style={{ borderBottom: `1px solid ${ink(0.08)}`, display: "flex" }}>
              <div style={{ padding: "6px 0 9px", borderBottom: `2px solid ${C.red}`, marginBottom: -1, display: "flex", alignItems: "center", gap: 6, ...inter(12.5, 600) }}>
                <Icon name="receipt" size={16} color={C.ink} />
                Details
              </div>
            </div>
          </div>
        </Pop>

        {/* the ticket */}
        <Pop t={sp(f, t0 + 10)}>
          <div style={{ position: "relative" }}>
            <div style={{ background: C.white, borderRadius: 12, padding: "6px 14px" }}>
              <DetailRow label="Name" value="Starbucks" t={sp(f, t0 + 14)} />
              <DetailRow label="Category" value="Coffee" t={sp(f, t0 + 17)} />
              <DetailRow label="Location" value="Starbucks, 5th Avenue" open t={sp(f, t0 + 20)} />
              <DetailRow label="Details" value="Captured from payment notification" t={sp(f, t0 + 23)} />
              <DetailRow label="Date & time" value="Nov 8, 2026 · 9:41 AM" t={sp(f, t0 + 26)} />
              <div style={{ height: 1.5, background: ink(0.9), transformOrigin: "0 50%", transform: `scaleX(${line})` }} />
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "6px 0 8px",
                  opacity: clamp01(line * 2),
                }}
              >
                <div style={{ flex: 1, ...inter(13, 600) }}>Total amount</div>
                <div
                  style={{
                    ...inter(17, 600, -0.3),
                    transform: `scale(${1 + 0.18 * totalPulse})`,
                    transformOrigin: "100% 50%",
                    color: totalPulse > 0.05 ? C.red : C.ink,
                  }}
                >
                  $6.85
                </div>
              </div>
            </div>
            {[-8, 8].map((dx, i) => (
              <div
                key={i}
                style={{
                  position: "absolute",
                  top: "50%",
                  marginTop: -8,
                  [i === 0 ? "left" : "right"]: -8,
                  width: 16,
                  height: 16,
                  borderRadius: "50%",
                  background: C.page,
                }}
              />
            ))}
          </div>
        </Pop>
      </div>
    </div>
  );
};

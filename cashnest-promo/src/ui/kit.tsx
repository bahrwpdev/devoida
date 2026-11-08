import React from "react";
import { C, S, ink, inter, NAV_SHADOW } from "../tokens";
import { Icon, MIcon } from "./Icon";

/* ---------- basics (ui_card.dart) ---------- */

export const UiCard: React.FC<{
  children: React.ReactNode;
  padding?: string | number;
  style?: React.CSSProperties;
}> = ({ children, padding = S.cardPadding, style }) => (
  <div
    style={{
      width: "100%",
      boxSizing: "border-box",
      padding,
      background: C.white,
      borderRadius: S.cardRadius,
      ...style,
    }}
  >
    {children}
  </div>
);

export const SoftBox: React.FC<{
  children: React.ReactNode;
  height?: number;
  style?: React.CSSProperties;
}> = ({ children, height = 40, style }) => (
  <div
    style={{
      height,
      boxSizing: "border-box",
      padding: "0 12px",
      display: "flex",
      alignItems: "center",
      background: ink(0.04),
      borderRadius: S.fieldRadius,
      ...style,
    }}
  >
    {children}
  </div>
);

export const Hair: React.FC<{ strong?: boolean }> = ({ strong }) => (
  <div
    style={{
      height: strong ? 1.5 : 1,
      background: strong ? ink(0.85) : ink(0.08),
      width: "100%",
    }}
  />
);

/** card_link_connector.dart: 20 high dotted vertical line, 24 from the left */
export const CardLinkConnector: React.FC<{ height?: number; left?: number }> = ({
  height = 20,
  left = 24,
}) => (
  <div style={{ height, paddingLeft: left - 1, boxSizing: "border-box" }}>
    <svg width={2} height={height}>
      <line
        x1={1}
        y1={0}
        x2={1}
        y2={height}
        stroke={`rgba(6,16,35,0.4)`}
        strokeWidth={2}
        strokeDasharray="4 4"
      />
    </svg>
  </div>
);

export const StepTitle: React.FC<{ text: string; note: string }> = ({
  text,
  note,
}) => (
  <div style={{ display: "flex", alignItems: "baseline" }}>
    <div style={{ flex: 1, ...inter(14, 600) }}>{text}</div>
    <div style={inter(11.5, 400, -0.1, ink(0.55))}>{note}</div>
  </div>
);

/* ---------- top bar (app_top_bar.dart) ---------- */

export const RoundBarButton: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <div
    style={{
      width: S.barButton,
      height: S.barButton,
      borderRadius: "50%",
      background: C.white,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    {children}
  </div>
);

export const BarAction: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <div
    style={{
      width: S.barButton,
      height: S.barButton,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    {children}
  </div>
);

export const AppTopBar: React.FC<{
  title: string;
  caption?: string;
  back?: "arrow_back" | "close" | null;
  actions?: React.ReactNode[];
}> = ({ title, caption, back = null, actions = [] }) => (
  <div
    style={{
      height: S.barHeight,
      display: "flex",
      alignItems: "center",
      background: C.page,
      paddingLeft: back ? 16 : S.gutter,
    }}
  >
    {back && (
      <div style={{ marginRight: 10 }}>
        <RoundBarButton>
          <MIcon name={back} size={20} color={C.inkDeep} />
        </RoundBarButton>
      </div>
    )}
    <div style={{ flex: 1 }}>
      <div style={inter(17, 500, -0.2)}>{title}</div>
      {caption && <div style={inter(11.5, 400, -0.1, ink(0.55))}>{caption}</div>}
    </div>
    <div style={{ display: "flex", gap: 6, paddingRight: 16 }}>
      {actions.map((a, i) => (
        <BarAction key={i}>{a}</BarAction>
      ))}
    </div>
  </div>
);

export const UnderlineTabs: React.FC<{
  labels: string[];
  selected: number;
  icons?: string[];
}> = ({ labels, selected, icons }) => (
  <div
    style={{
      margin: `2px ${S.gutter}px 0`,
      display: "flex",
      gap: 22,
      borderBottom: `1px solid ${ink(0.08)}`,
    }}
  >
    {labels.map((l, i) => {
      const on = i === selected;
      return (
        <div
          key={l}
          style={{
            padding: "4px 0 9px",
            borderBottom: `2px solid ${on ? C.red : "transparent"}`,
            marginBottom: -1,
            display: "flex",
            alignItems: "center",
            gap: 6,
            ...inter(13.5, on ? 600 : 400, -0.1, on ? C.ink : ink(0.55)),
          }}
        >
          {icons && (
            <Icon name={icons[i]} size={16} color={on ? C.red : ink(0.55)} />
          )}
          {l}
        </div>
      );
    })}
  </div>
);

/* ---------- rows (expense_tracking_list_tile.dart, split_card.dart) ---------- */

const ICON_CIRCLE = 36;
const ICON_GLYPH = 20;
const ICON_BOX = 40;

export type Glyph = { svg?: string; material?: "car" };

const Badge: React.FC<{ color: string }> = ({ color }) => (
  <div
    style={{
      position: "absolute",
      right: 0,
      bottom: 0,
      width: 16,
      height: 16,
      boxSizing: "border-box",
      borderRadius: "50%",
      background: color,
      border: `1.5px solid ${C.white}`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    <MIcon name="north_east" size={9} color={C.white} />
  </div>
);

const RowIcon: React.FC<{ glyph: Glyph; bg: string; badge: string }> = ({
  glyph,
  bg,
  badge,
}) => (
  <div style={{ position: "relative", width: ICON_BOX, height: ICON_BOX }}>
    <div
      style={{
        width: ICON_CIRCLE,
        height: ICON_CIRCLE,
        borderRadius: "50%",
        background: bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {glyph.svg ? (
        <Icon name={glyph.svg} size={ICON_GLYPH} color={C.white} />
      ) : (
        <MIcon name={glyph.material ?? "car"} size={ICON_GLYPH} color={C.white} />
      )}
    </div>
    <Badge color={badge} />
  </div>
);

const rowBox: React.CSSProperties = {
  background: C.white,
  borderRadius: 12,
  padding: "5px 12px",
  display: "flex",
  alignItems: "center",
  marginBottom: 3,
  boxSizing: "border-box",
};
const light = inter(11.5, 400, 0, ink(0.55));
const nameS = inter(12, 600, -0.1);

/** ExpenseTrackingListTile(softIcon: true): space icon + red arrow badge */
export const ExpenseRow: React.FC<{
  name: string;
  when: string;
  amount: string;
  category: string;
  glyph: Glyph;
  style?: React.CSSProperties;
}> = ({ name, when, amount, category, glyph, style }) => (
  <div style={{ ...rowBox, ...style }}>
    <RowIcon glyph={glyph} bg={C.ink} badge={C.red} />
    <div style={{ flex: 1, marginLeft: 10 }}>
      <div style={nameS}>{name}</div>
      <div style={light}>{when}</div>
    </div>
    <div style={{ textAlign: "right" }}>
      <div style={inter(12, 600, -0.1)}>{amount}</div>
      <div style={{ ...light, color: C.ink, fontWeight: 500 }}>{category}</div>
    </div>
  </div>
);

const faceColors = [C.ink, "rgba(17,45,65,0.9)", "rgba(17,45,65,0.8)", "rgba(17,45,65,0.7)", C.inkDeep];

export const Face: React.FC<{ size: number; bg: string; border?: string }> = ({
  size,
  bg,
  border = C.white,
}) => (
  <div
    style={{
      width: size,
      height: size,
      boxSizing: "border-box",
      borderRadius: "50%",
      background: bg,
      border: `1px solid ${border}`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    <Icon name="user" size={size * 0.58} color={C.white} />
  </div>
);

/** SplitCard(softIcon: true): red split icon, space arrow badge, avatar stack */
export const SplitRow: React.FC<{
  name: string;
  when: string;
  amount: string;
  people: number;
  style?: React.CSSProperties;
}> = ({ name, when, amount, people, style }) => (
  <div style={{ ...rowBox, ...style }}>
    <RowIcon glyph={{ svg: "split" }} bg={C.red} badge={C.ink} />
    <div style={{ flex: 1, marginLeft: 10 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <div style={nameS}>{name}</div>
        <div style={{ position: "relative", height: 19, width: people * 14 + 5 }}>
          {Array.from({ length: Math.min(4, people) }).map((_, i) => (
            <div key={i} style={{ position: "absolute", left: i * 14 }}>
              <Face size={19} bg={faceColors[i % 5]} />
            </div>
          ))}
        </div>
      </div>
      <div style={light}>{when}</div>
    </div>
    <div style={{ textAlign: "right" }}>
      <div style={inter(12, 600, -0.1)}>{amount}</div>
      <div style={{ ...light, color: C.ink, fontWeight: 500 }}>Split Bill</div>
    </div>
  </div>
);

export const DateHeader: React.FC<{ text: string }> = ({ text }) => (
  <div style={{ ...inter(11.5, 400, -0.1, ink(0.55)), padding: "10px 4px 5px" }}>
    {text}
  </div>
);

/* ---------- navigation bar (custom_navigation_bar.dart) ---------- */

const NAV = [
  { label: "Home", icon: "home", size: 23 },
  { label: "Expenses", icon: "expenses-2arrow", size: 25 },
  { label: "Splits", icon: "split", size: 23 },
  { label: "Bills", icon: "receipt", size: 23 },
  { label: "Analytics", icon: "diagram-up", size: 20 },
];

/**
 * `index` may be fractional: the selected pill glides between items like the
 * 500ms AnimatedContainer in the app. Widths follow the same maths
 * (unselected 52, selected = rest, min 104).
 */
export const NavBar: React.FC<{ index: number; width?: number }> = ({
  index,
  width = 362,
}) => {
  const avail = width - 12;
  const unsel = Math.min(52, Math.max(40, (avail - 104) / 4));
  const selW = Math.min(160, Math.max(104, avail - unsel * 4));
  return (
    <div
      style={{
        height: 68,
        width,
        boxSizing: "border-box",
        padding: "0 6px",
        borderRadius: 50,
        background: C.white,
        boxShadow: NAV_SHADOW,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      {NAV.map((n, i) => {
        const t = Math.max(0, 1 - Math.abs(index - i)); // 1 = selected
        const w = unsel + (selW - unsel) * t;
        return (
          <div
            key={n.label}
            style={{
              width: w,
              height: 56,
              borderRadius: 50,
              background: t > 0.001 ? `rgba(255,59,48,${Math.min(1, t * 1.2)})` : "transparent",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              overflow: "hidden",
            }}
          >
            <Icon
              name={n.icon}
              size={n.size}
              color={t > 0.5 ? C.white : C.ink}
            />
            {t > 0.55 && (
              <div
                style={{
                  ...inter(15, 600, 0, C.white),
                  opacity: (t - 0.55) / 0.45,
                  whiteSpace: "nowrap",
                }}
              >
                {n.label}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

/* ---------- form_action_bar.dart ---------- */

export const FormActionBar: React.FC<{
  cancel: string;
  confirm: string;
  pressed?: number; // 0..1 press feedback on the red pill
  dim?: boolean;
}> = ({ cancel, confirm, pressed = 0, dim }) => (
  <div
    style={{
      height: 68,
      boxSizing: "border-box",
      padding: 6,
      borderRadius: 34,
      background: C.white,
      boxShadow: NAV_SHADOW,
      display: "flex",
      alignItems: "center",
    }}
  >
    <div style={{ flex: 7, textAlign: "center", ...inter(15, 600) }}>{cancel}</div>
    <div
      style={{
        flex: 16,
        height: 56,
        borderRadius: 28,
        background: C.red,
        opacity: dim ? 0.5 : 1,
        transform: `scale(${1 - 0.04 * pressed})`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        ...inter(15, 600, -0.1, C.white),
      }}
    >
      {confirm}
    </div>
  </div>
);

/* ---------- chips ---------- */

/** split_confirmation_screen _chip: red (or space) pill, white 10.5/600 */
export const Chip: React.FC<{ text: string; space?: boolean; icon?: string }> = ({
  text,
  space,
  icon,
}) => (
  <div
    style={{
      padding: "3px 9px",
      borderRadius: 10,
      background: space ? C.ink : C.red,
      display: "flex",
      alignItems: "center",
      gap: 5,
      ...inter(10.5, 600, 0, C.white),
    }}
  >
    {icon && <Icon name={icon} size={12} color={C.white} />}
    {text}
  </div>
);

/** new_split_screen _extraSharedChips: ink pill "+ Tax" */
export const AddChip: React.FC<{ text: string; style?: React.CSSProperties }> = ({
  text,
  style,
}) => (
  <div
    style={{
      minWidth: 112,
      boxSizing: "border-box",
      padding: "9px 20px",
      borderRadius: 20,
      background: C.ink,
      textAlign: "center",
      whiteSpace: "nowrap",
      ...inter(12.5, 500, 0, C.white),
      ...style,
    }}
  >
    + {text}
  </div>
);

/** Round red category icon with name under it; selected = space ring */
export const CategoryChip: React.FC<{
  name: string;
  glyph: Glyph;
  selected: number; // 0..1
}> = ({ name, glyph, selected }) => (
  <div style={{ width: 64, flexShrink: 0, textAlign: "center" }}>
    <div
      style={{
        width: 48,
        height: 48,
        boxSizing: "border-box",
        margin: "0 auto",
        padding: 2.5,
        borderRadius: "50%",
        border: `2px solid rgba(17,45,65,${selected})`,
      }}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          borderRadius: "50%",
          background: C.red,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {glyph.svg ? (
          <Icon name={glyph.svg} size={20} color={C.white} />
        ) : (
          <MIcon name={glyph.material ?? "car"} size={20} color={C.white} />
        )}
      </div>
    </div>
    <div
      style={{
        marginTop: 3,
        ...inter(
          11,
          selected > 0.5 ? 600 : 400,
          -0.1,
          selected > 0.5 ? C.ink : ink(0.6),
        ),
      }}
    >
      {name}
    </div>
  </div>
);

/** NotificationService popup: white card, 38pt square tile, title + now + message */
export const Popup: React.FC<{
  tile: string;
  glyph: React.ReactNode;
  title: string;
  message: string;
}> = ({ tile, glyph, title, message }) => (
  <div
    style={{
      margin: "0 14px",
      padding: 10,
      boxSizing: "border-box",
      background: C.white,
      borderRadius: 14,
      boxShadow: NAV_SHADOW,
      display: "flex",
      gap: 10,
      alignItems: "center",
    }}
  >
    <div
      style={{
        width: 38,
        height: 38,
        borderRadius: 10,
        background: tile,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      {glyph}
    </div>
    <div style={{ flex: 1 }}>
      <div style={{ display: "flex" }}>
        <div style={{ flex: 1, ...inter(13, 600, -0.1) }}>{title}</div>
        <div style={inter(11, 400, 0, ink(0.5))}>now</div>
      </div>
      <div style={inter(12, 400, -0.1, ink(0.65))}>{message}</div>
    </div>
  </div>
);

/** bubble_fab.dart: 70x110 red bubble, bottom-right corner squared */
export const BubbleFab: React.FC<{ pressed?: number }> = ({ pressed = 0 }) => (
  <div
    style={{
      width: 70,
      height: 110,
      background: C.red,
      borderRadius: "36px 36px 4px 36px",
      boxShadow: NAV_SHADOW,
      transform: `scale(${1 - 0.08 * pressed})`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    <MIcon name="add" size={30} color={C.white} />
  </div>
);

/** The sheet drag handle: 40x4 */
export const Handle: React.FC = () => (
  <div style={{ display: "flex", justifyContent: "center", padding: "10px 0 8px" }}>
    <div style={{ width: 40, height: 4, borderRadius: 2, background: "rgba(6,16,35,0.2)" }} />
  </div>
);

/** iOS-style status bar inside the phone screen (47 high). */
export const StatusBar: React.FC = () => (
  <div
    style={{
      height: 47,
      display: "flex",
      alignItems: "flex-end",
      justifyContent: "space-between",
      padding: "0 28px 6px",
      boxSizing: "border-box",
    }}
  >
    <div style={inter(15, 600, -0.2, C.inkDeep)}>9:41</div>
    <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
      <svg width="17" height="11" viewBox="0 0 17 11">
        {[0, 1, 2, 3].map((i) => (
          <rect key={i} x={i * 4.5} y={8 - i * 2.6} width="3" height={3 + i * 2.6} rx="0.8" fill={C.inkDeep} />
        ))}
      </svg>
      <svg width="25" height="12" viewBox="0 0 25 12">
        <rect x="0.5" y="0.5" width="21" height="11" rx="3.2" fill="none" stroke={C.inkDeep} opacity="0.4" />
        <rect x="2" y="2" width="18" height="8" rx="2" fill={C.inkDeep} />
        <rect x="22.5" y="4" width="1.8" height="4" rx="0.9" fill={C.inkDeep} opacity="0.4" />
      </svg>
    </div>
  </div>
);

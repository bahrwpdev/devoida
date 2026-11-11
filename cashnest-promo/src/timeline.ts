import events from "./tour.events.json";

/**
 * The video is a list of items played back to back, built from the capture log:
 *  - "real": frames of the app, played 1:1 (60 fps)
 *  - "reveal": a screen opens and its components load one by one, like the splash
 *    (header first, then each card or row), over the page background
 */
type Ev = { name: string; frame: number; noFabFrame?: number; resume?: number; bottom?: number; units?: number[][]; fabs?: number[][]; navVisible?: boolean };
const evs = events as Ev[];
const ev = (n: string) => {
  const e = evs.find((x) => x.name === n);
  if (!e) throw new Error(`missing capture event ${n}`);
  return e;
};
const at = (n: string) => ev(n).frame;
/** Where the real frames carry on after a screen's reveal (past the extra capture frames). */
const resume = (screen: string) => ev(`settled:${screen}`).resume ?? ev(`settled:${screen}`).frame;

/** Length of a reveal: about one second. */
export const REVEAL = 60;
/** A few frames after a tap so the real press feedback shows. */
const PRESS = 8;

export type Item =
  | { kind: "real"; a: number; b: number }
  | {
      kind: "reveal";
      screen: string;
      settled: number;
      /** the same frame with the round buttons hidden: components load from it */
      base: number;
      units: number[][];
      bottom: number;
      /** tab screens: the real frames from here keep the nav bar's glide */
      under?: number;
      fabs: number[][];
      /** sub-split a tall card (a list inside one card) into rows of this height, px */
      rows?: number;
    };

/** [from]: the frame where the screen was opened; its real frames keep the nav bar
 * wherever the app keeps it (tab screens, and details screens that do not hide it). */
const reveal = (screen: string, extra: { from?: number; rows?: number } = {}): Item => {
  const e = ev(`settled:${screen}`);
  const keepsNav = e.navVisible !== false && extra.from !== undefined;
  return {
    kind: "reveal",
    screen,
    settled: e.frame,
    base: e.noFabFrame ?? e.frame,
    units: e.units ?? [],
    // the round button belongs to the three tab screens only
    fabs: ["home", "splitsList", "billsList"].includes(screen) ? e.fabs ?? [] : [],
    bottom: keepsNav ? Math.min(e.bottom ?? 2280, 2280) : e.bottom ?? 2532,
    under: keepsNav ? extra.from : undefined,
    rows: extra.rows,
  };
};

export const ITEMS: Item[] = [
  // Home loads for the first time: its components stack in one above the other
  reveal("home", { from: 0 }),
  // then the app's own popups, and the new expense lands
  { kind: "real", a: resume("home"), b: at("tapRow") + PRESS },
  // Expense details with the location (the nav bar stays, as in the app)
  reveal("expenseDetails", { from: at("tapRow") }),
  { kind: "real", a: resume("expenseDetails"), b: at("backDone") },
  // Splits list, then a new split end to end and the Notify sheet
  reveal("splitsList", { from: at("tapSplitsNav") }),
  { kind: "real", a: resume("splitsList"), b: at("tapFab") + PRESS },
  reveal("newSplit"),
  { kind: "real", a: resume("newSplit"), b: at("tapBillsNav") },
  // Bills list, then one bill
  reveal("billsList", { from: at("tapBillsNav"), rows: 174 }),
  { kind: "real", a: resume("billsList"), b: at("tapBill") + PRESS },
  reveal("billDetail", { from: at("tapBill") }),
  { kind: "real", a: resume("billDetail"), b: at("end") },
];

export const itemLength = (it: Item) => (it.kind === "real" ? it.b - it.a : REVEAL);
export const TOTAL_FRAMES = ITEMS.reduce((n, it) => n + itemLength(it), 0);

/** The item playing at video frame f, and how far into it. */
export const itemAt = (f: number): { item: Item; t: number } => {
  let start = 0;
  for (const item of ITEMS) {
    const len = itemLength(item);
    if (f < start + len) return { item, t: f - start };
    start += len;
  }
  const last = ITEMS[ITEMS.length - 1];
  return { item: last, t: itemLength(last) - 1 };
};

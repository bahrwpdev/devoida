import events from "./tour.events.json";

/**
 * The video is a list of items played back to back, built from the capture log:
 *  - "real": frames of the app, played 1:1 (60 fps)
 *  - "reveal": a screen opens and its components load one by one, like the splash
 *    (header first, then each card or row), over the page background
 */
type Ev = { name: string; frame: number; bottom?: number; units?: number[][] };
const evs = events as Ev[];
const ev = (n: string) => {
  const e = evs.find((x) => x.name === n);
  if (!e) throw new Error(`missing capture event ${n}`);
  return e;
};
const at = (n: string) => ev(n).frame;

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
      units: number[][];
      bottom: number;
      /** tab screens: the real frames from here keep the nav bar's glide */
      under?: number;
      /** sub-split a tall card (a list inside one card) into rows of this height, px */
      rows?: number;
    };

const reveal = (screen: string, extra: { under?: number; rows?: number } = {}): Item => {
  const e = ev(`settled:${screen}`);
  return { kind: "reveal", screen, settled: e.frame, units: e.units ?? [], bottom: e.bottom ?? 2532, ...extra };
};

export const ITEMS: Item[] = [
  // Home: real staged reveal, the app's own popups, the new expense lands
  { kind: "real", a: 0, b: at("tapRow") + PRESS },
  // Expense details with the location
  reveal("expenseDetails"),
  { kind: "real", a: at("settled:expenseDetails"), b: at("backDone") },
  // Splits list, then a new split end to end and the Notify sheet
  reveal("splitsList", { under: at("tapSplitsNav") }),
  { kind: "real", a: at("settled:splitsList"), b: at("tapFab") + PRESS },
  reveal("newSplit"),
  { kind: "real", a: at("settled:newSplit"), b: at("tapBillsNav") },
  // Bills list, then one bill
  reveal("billsList", { under: at("tapBillsNav"), rows: 174 }),
  { kind: "real", a: at("settled:billsList"), b: at("tapBill") + PRESS },
  reveal("billDetail"),
  { kind: "real", a: at("settled:billDetail"), b: at("end") },
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

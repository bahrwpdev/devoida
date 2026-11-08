import React from "react";
import { C, S, ink, inter } from "../tokens";
import { Icon, MIcon } from "../ui/Icon";
import {
  AddChip,
  AppTopBar,
  BubbleFab,
  CardLinkConnector,
  CategoryChip,
  Chip,
  DateHeader,
  ExpenseRow,
  Face,
  FormActionBar,
  Glyph,
  Hair,
  Handle,
  SoftBox,
  SplitRow,
  StatusBar,
  StepTitle,
  UiCard,
  UnderlineTabs,
} from "../ui/kit";

export const G: Record<string, Glyph> = {
  Coffee: { svg: "coffee" },
  Dining: { svg: "food" },
  Groceries: { svg: "shopping" },
  Transport: { material: "car" },
  Shopping: { svg: "shopping" },
  Entertainment: { svg: "entertainment" },
};

const searchRed = <MIcon name="search" size={21} color={C.red} />;
const filterIcon = <Icon name="filter" size={21} color={C.ink} />;

/** Wraps a tab screen: page background + status bar. */
const Page: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ position: "absolute", inset: 0, background: C.page, overflow: "hidden" }}>
    <StatusBar />
    {children}
  </div>
);

/** A row that grows in (list entrance: fade + slide, height opens). */
const Entrance: React.FC<{ t: number; children: React.ReactNode }> = ({ t, children }) => (
  <div
    style={{
      maxHeight: 60 * t,
      opacity: t,
      transform: `translateY(${(1 - t) * -14}px)`,
      overflow: "hidden",
    }}
  >
    {children}
  </div>
);

/* ============================ Expenses list ============================ */

export const ExpensesScreen: React.FC<{ newRow: number }> = ({ newRow }) => (
  <Page>
    <AppTopBar
      title="Expenses"
      caption="November 2026"
      actions={[searchRed, filterIcon]}
    />
    <UnderlineTabs labels={["All", "Coffee", "Dining", "Groceries", "Transport"]} selected={0} />
    <div style={{ padding: `0 ${S.gutter}px` }}>
      <DateHeader text="Today" />
      <Entrance t={newRow}>
        <ExpenseRow
          name="Starbucks"
          when="Today, 9:41 AM"
          amount="$6.85"
          category="Coffee"
          glyph={G.Coffee}
        />
      </Entrance>
      <ExpenseRow name="Uber" when="Today, 8:12 AM" amount="$14.20" category="Transport" glyph={G.Transport} />
      <DateHeader text="Yesterday" />
      <ExpenseRow name="Whole Foods" when="Yesterday, 6:30 PM" amount="$63.40" category="Groceries" glyph={G.Groceries} />
      <ExpenseRow name="Netflix" when="Yesterday" amount="$15.49" category="Entertainment · Bills" glyph={G.Entertainment} />
      <DateHeader text="Nov 5" />
      <ExpenseRow name="Shell" when="Nov 5, 5:10 PM" amount="$42.00" category="Transport" glyph={G.Transport} />
      <ExpenseRow name="Blue Bottle" when="Nov 5, 9:02 AM" amount="$5.50" category="Coffee" glyph={G.Coffee} />
    </div>
  </Page>
);

/* ============================ Split bills list ============================ */

export const SplitsScreen: React.FC<{ newRow: number; fabPressed: number }> = ({
  newRow,
  fabPressed,
}) => (
  <Page>
    <AppTopBar title="Split Bills" caption="3 splits" actions={[searchRed, filterIcon]} />
    <UnderlineTabs labels={["Active", "Completed"]} selected={0} />
    <div style={{ padding: `0 ${S.gutter}px` }}>
      <DateHeader text="This week" />
      <Entrance t={newRow}>
        <SplitRow name="Dinner at Nobu" when="Today, 9:41 AM" amount="$102.60" people={3} />
      </Entrance>
      <SplitRow name="Weekend trip" when="Nov 2" amount="$412.00" people={4} />
      <SplitRow name="Groceries" when="Nov 1" amount="$86.30" people={3} />
      <SplitRow name="Movie night" when="Oct 28" amount="$54.00" people={2} />
    </div>
    <div style={{ position: "absolute", right: 16, bottom: 118 }}>
      <BubbleFab pressed={fabPressed} />
    </div>
  </Page>
);

/* ============================ Add split bill ============================ */

const Money: React.FC<{ value: number; size: number; w?: number }> = ({ value, size, w = 600 }) => (
  <div style={{ display: "flex", alignItems: "baseline", gap: 3 }}>
    <span style={inter(size, w, -0.8, C.red)}>$</span>
    <span style={inter(size, w, -0.8, C.inkDeep)}>{value.toFixed(2)}</span>
  </div>
);

const CostRow: React.FC<{ label: string; value: number; t: number }> = ({ label, value, t }) => (
  <div style={{ maxHeight: 48 * t, opacity: t, overflow: "hidden", transform: `translateY(${(1 - t) * -8}px)` }}>
    <div style={{ paddingTop: 8 }}>
      <SoftBox>
        <div style={{ flex: 1, ...inter(13.5, 500) }}>{label}</div>
        <div style={inter(13.5, 500, -0.1, C.inkDeep)}>
          <span style={{ color: C.red }}>$</span> {value.toFixed(2)}
        </div>
      </SoftBox>
    </div>
  </div>
);

export const AddSplitScreen: React.FC<{
  amount: number;
  tax: number;
  taxT: number;
  tip: number;
  tipT: number;
  total: number;
  people: number[]; // entrance progress per person
  share: number;
  reviewPressed: number;
}> = ({ amount, tax, taxT, tip, tipT, total, people, share, reviewPressed }) => {
  const names = ["You", "Sarah", "Mike"];
  const chips = [
    ...(taxT > 0.5 ? [] : ["Tax"]),
    ...(tipT > 0.5 ? [] : ["Tip"]),
    "Delivery",
    "Service",
    "Packaging",
  ];
  return (
    <Page>
      <AppTopBar title="New split bill" caption="Add the bill and your people" back="close" />
      <UnderlineTabs labels={["Even", "Custom"]} selected={0} icons={["even", "custom"]} />
      <div style={{ padding: `${S.cardGap}px ${S.gutter}px 0` }}>
        <UiCard padding={0}>
          <div style={{ padding: "12px 14px 8px" }}>
            <StepTitle text="1 · Bill amount" note="from the receipt" />
            <div style={{ height: 56, display: "flex", alignItems: "center", marginTop: 2 }}>
              <Money value={amount} size={36} />
            </div>
          </div>
          <Hair />
          <div style={{ padding: "12px 14px 14px" }}>
            <StepTitle text="2 · Shared costs" note="optional" />
            <CostRow label="Tax" value={tax} t={taxT} />
            <CostRow label="Tip" value={tip} t={tipT} />
            <div style={{ display: "flex", gap: 7, marginTop: 12, overflow: "hidden", width: 330 }}>
              {chips.map((c) => (
                <AddChip key={c} text={c} />
              ))}
            </div>
          </div>
          <Hair />
          <div style={{ padding: 14, display: "flex", alignItems: "center" }}>
            <div style={{ flex: 1, ...inter(15, 600) }}>Bill total</div>
            <Money value={total} size={21} />
          </div>
        </UiCard>
        <CardLinkConnector />
        <UiCard padding="12px 14px 12px">
          <StepTitle text="3 · People" note="split evenly" />
          <div style={{ marginTop: 8 }}>
            {names.map((n, i) => (
              <div
                key={n}
                style={{
                  maxHeight: 46 * people[i],
                  opacity: people[i],
                  overflow: "hidden",
                  transform: `translateY(${(1 - people[i]) * 10}px)`,
                }}
              >
                <div style={{ paddingBottom: 6 }}>
                  <SoftBox>
                    <Face size={26} bg={C.red} border={C.white} />
                    <div style={{ flex: 1, marginLeft: 10, ...inter(13.5, 500) }}>{n}</div>
                    <div style={inter(13.5, 600, -0.1, C.inkDeep)}>
                      <span style={{ color: C.red }}>$</span> {share.toFixed(2)}
                    </div>
                  </SoftBox>
                </div>
              </div>
            ))}
          </div>
        </UiCard>
      </div>
      <div style={{ position: "absolute", left: 14, right: 14, bottom: 16 }}>
        <FormActionBar cancel="Cancel" confirm="Review" pressed={reviewPressed} />
      </div>
    </Page>
  );
};

/* ============================ Sheets ============================ */

const SheetShell: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div
    style={{
      background: C.page,
      borderRadius: `${S.sheetRadius}px ${S.sheetRadius}px 0 0`,
      overflow: "hidden",
    }}
  >
    {children}
  </div>
);

const CloseDot: React.FC = () => (
  <div
    style={{
      width: 32,
      height: 32,
      borderRadius: "50%",
      background: ink(0.07),
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    <MIcon name="close" size={18} color={ink(0.85)} />
  </div>
);

/** payment_capture_bottom_sheet.dart (owner pick S1) */
export const CaptureSheet: React.FC<{
  amount: number;
  merchant: string;
  selected: number;
  addPressed: number;
}> = ({ amount, merchant, selected, addPressed }) => {
  const cats: [string, Glyph][] = [
    ["Coffee", G.Coffee],
    ["Dining", G.Dining],
    ["Groceries", G.Groceries],
    ["Transport", G.Transport],
    ["Shopping", G.Shopping],
  ];
  return (
    <SheetShell>
      <Handle />
      <div style={{ display: "flex", alignItems: "center", padding: "6px 14px 12px 20px" }}>
        <div style={{ flex: 1 }}>
          <div style={inter(17, 500, -0.2)}>Payment captured</div>
          <div style={inter(11.5, 400, -0.1, ink(0.55))}>Review before saving</div>
        </div>
        <CloseDot />
      </div>
      <div style={{ padding: "0 14px" }}>
        <UiCard padding="12px 14px 12px">
          <StepTitle text="Amount" note="from your bank message" />
          <div style={{ height: 56, display: "flex", alignItems: "center", marginTop: 2 }}>
            <Money value={amount} size={36} />
          </div>
        </UiCard>
        <CardLinkConnector />
        <UiCard padding={0}>
          <div style={{ padding: "12px 14px 10px" }}>
            <StepTitle text="Details" note="merchant and date" />
            <div style={{ marginTop: 10 }}>
              <SoftBox height={44}>
                <div style={{ flex: 1, ...inter(13.5, 500, -0.1, C.inkDeep), minHeight: 17 }}>{merchant}</div>
                <Icon name="edit" size={16} color={ink(0.45)} />
              </SoftBox>
            </div>
          </div>
          <div style={{ height: 1, background: ink(0.06) }} />
          <div style={{ padding: "14px", display: "flex", alignItems: "center", gap: 10 }}>
            <Icon name="calander-edit" size={16} color={C.ink} />
            <div style={{ flex: 1, ...inter(13.5, 500) }}>Nov 8, 2026</div>
            <MIcon name="chevron_down" size={18} color={ink(0.55)} />
          </div>
        </UiCard>
        <CardLinkConnector />
        <UiCard padding="12px 0 12px 14px">
          <div style={{ paddingRight: 14 }}>
            <StepTitle text="Category" note="pick one" />
          </div>
          <div style={{ display: "flex", marginTop: 10, height: 82, overflow: "hidden" }}>
            {cats.map(([n, g], i) => (
              <CategoryChip key={n} name={n} glyph={g} selected={i === 0 ? selected : 0} />
            ))}
          </div>
        </UiCard>
      </div>
      <div style={{ padding: "14px 14px 16px" }}>
        <FormActionBar cancel="Cancel" confirm="Add Expense" pressed={addPressed} dim={selected < 0.5} />
      </div>
    </SheetShell>
  );
};

/** split_confirmation_screen.dart review sheet (R1 + B1): twin of Split Details */
export const ReviewSheet: React.FC<{ confirmPressed: number }> = ({ confirmPressed }) => {
  const people = [
    { n: "You", note: "Paid the bill" },
    { n: "Sarah", note: "Owes you" },
    { n: "Mike", note: "Owes you" },
  ];
  const line = (k: string, v: string, bold = false) => (
    <div style={{ display: "flex", padding: "5px 0" }}>
      <div style={{ flex: 1, ...inter(13, bold ? 600 : 400, -0.1, bold ? C.ink : ink(0.6)) }}>{k}</div>
      <div style={inter(bold ? 17 : 13, bold ? 600 : 500, bold ? -0.4 : -0.1)}>{v}</div>
    </div>
  );
  return (
    <SheetShell>
      <Handle />
      <div style={{ padding: "6px 14px 0" }}>
        <UiCard padding="12px 14px 12px">
          <div style={{ display: "flex", alignItems: "center" }}>
            <div style={{ position: "relative", width: 40, height: 40 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  background: C.red,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Icon name="split" size={20} color={C.white} />
              </div>
              <div
                style={{
                  position: "absolute",
                  right: 0,
                  bottom: 0,
                  width: 16,
                  height: 16,
                  boxSizing: "border-box",
                  borderRadius: "50%",
                  background: C.ink,
                  border: `1.5px solid ${C.white}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <MIcon name="north_east" size={9} color={C.white} />
              </div>
            </div>
            <div style={{ flex: 1, marginLeft: 10 }}>
              <div style={inter(15, 600, -0.2)}>Dinner at Nobu</div>
              <div style={inter(11.5, 400, -0.1, ink(0.55))}>Nov 8, 2026</div>
            </div>
            <div style={inter(20, 500, -0.6)}>$102.60</div>
          </div>
          <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
            <Chip text="Even split" icon="even" />
            <Chip text="3 people" />
            <Chip text="Shared costs" space />
          </div>
        </UiCard>
      </div>
      <UnderlineTabs labels={["Items", "People"]} selected={1} />
      <div style={{ padding: "8px 14px 0" }}>
        <UiCard padding="4px 14px">
          {people.map((p, i) => (
            <React.Fragment key={p.n}>
              {i > 0 && <Hair />}
              <div style={{ display: "flex", alignItems: "center", padding: "9px 0" }}>
                <div
                  style={{
                    width: 34,
                    height: 34,
                    boxSizing: "border-box",
                    borderRadius: "50%",
                    background: C.white,
                    border: `1px solid ${ink(0.25)}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Icon name="user" size={17} color={C.ink} />
                </div>
                <div style={{ flex: 1, marginLeft: 10 }}>
                  <div style={inter(13.5, 600)}>{p.n}</div>
                  <div style={inter(11.5, 400, -0.1, ink(0.55))}>{p.note}</div>
                </div>
                <div style={inter(15, 600, -0.3)}>
                  <span style={{ color: C.red }}>$</span>34.20
                </div>
              </div>
            </React.Fragment>
          ))}
        </UiCard>
        <div style={{ height: 8 }} />
        <UiCard padding="8px 14px 10px">
          {line("Bill amount", "$86.40")}
          {line("Tax", "$7.20")}
          {line("Tip", "$9.00")}
          <div style={{ margin: "5px 0 4px" }}>
            <Hair strong />
          </div>
          {line("Total amount", "$102.60", true)}
        </UiCard>
      </div>
      <div style={{ padding: "14px 14px 16px" }}>
        <FormActionBar cancel="Back" confirm="Confirm" pressed={confirmPressed} />
      </div>
    </SheetShell>
  );
};

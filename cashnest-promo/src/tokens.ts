import { Easing } from "remotion";

/**
 * Design tokens copied from the app (lib/constants/app_theme.dart,
 * design_tokens.dart, ui_style.dart). Names match the Dart ones where useful.
 */
export const C = {
  ink: "#112D41", // AppTheme.darkGreen ("Space")
  inkDeep: "#061023", // AppTheme.middleGreen ("Ink")
  red: "#FF3B30", // AppTheme.accentRed
  page: "#F5F5F5", // AppTheme.pageBackground
  white: "#FFFFFF", // AppTheme.pureWhite
  splash: "#FCFCFB", // DesignTokens.brandSurfaceSplash
  mustard: "#FECB34",
  blue: "#3572EF",
};

export const ink = (a: number) => `rgba(17,45,65,${a})`;

/** UiType.inter(size, w, ls, color) */
export const inter = (
  size: number,
  w = 400,
  ls = -0.1,
  color: string = C.ink,
): React.CSSProperties => ({
  fontFamily: "Inter, sans-serif",
  fontSize: size,
  fontWeight: w,
  letterSpacing: ls,
  color,
  lineHeight: 1.25,
  fontFeatureSettings: '"tnum"',
});

/** UiSpace */
export const S = {
  gutter: 16,
  cardGap: 8,
  rowGap: 4,
  cardPadding: 14,
  cardRadius: 12,
  fieldRadius: 12,
  sheetRadius: 20,
  barHeight: 64,
  barButton: 40,
};

/** The nav bar / docked bar soft shadow. */
export const NAV_SHADOW = `0 0 12px 1px ${ink(0.1)}, 0 8px 24px ${ink(0.12)}`;

// Flutter curves
export const easeOutCubic = Easing.bezier(0.215, 0.61, 0.355, 1);
export const easeOut = Easing.bezier(0, 0, 0.58, 1); // Curves.easeOut
export const easeInOut = Easing.bezier(0.42, 0, 0.58, 1); // Curves.easeInOut

export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));

/** 0..1 progress of frame f between a and b, with a curve. */
export const prog = (
  f: number,
  a: number,
  b: number,
  curve: (t: number) => number = easeOutCubic,
) => curve(clamp01((f - a) / (b - a)));

export const FPS = 30;
/** Screen-only output: an iPhone 390x844 logical screen at 3x. */
export const W = 1170;
export const H = 2532;

export const money = (v: number) =>
  "$" +
  v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

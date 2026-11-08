# CashNest promo video

A standalone Remotion project. It is not part of the app build and shares no
code with it. It reuses the app's real assets (logo, icons, Inter fonts) and
re-creates the app's components in React with the same tokens and sizes.

**Output:** 1080x1920 (9:16), 30 fps, about 36 s. Silent, ready for music or voiceover.

## Run

```bash
npm install
npm run studio     # live preview
npm run render     # writes out/cashnest-promo.mp4
```

## Story

| Frames | Scene |
|---|---|
| 0-110 | The splash: logo fade, icon orbit and the red "Let's Start" pill (same timings and orbit maths as `splash_screen.dart` / `icon_orbit.dart`) |
| 104-190 | Hook: "Expenses that add themselves." |
| 190-546 | Auto expense: bank message popup, "Payment captured" sheet, category picked, Add Expense, new row in Expenses |
| 546-948 | Splits: nav to Splits, New split bill (amount, tax, tip, people), review sheet, confirm, saved |
| 950-1080 | Outro: logo, tagline, CTA |

All timings live in the `T` object at the top of `src/Promo.tsx`.

## Where the app design comes from (cashnest repo)

| Here | App source |
|---|---|
| `src/tokens.ts` | `app_theme.dart`, `design_tokens.dart`, `ui_style.dart` |
| `src/Splash.tsx` | `splash_screen.dart`, `icon_orbit.dart` |
| `src/ui/kit.tsx` | `ui_card.dart`, `app_top_bar.dart`, `expense_tracking_list_tile.dart`, `split_card.dart`, `custom_navigation_bar.dart`, `form_action_bar.dart`, `card_link_connector.dart`, `bubble_fab.dart` |
| `src/screens/screens.tsx` | `payment_capture_bottom_sheet.dart`, `new_split_screen.dart`, `split_confirmation_screen.dart` |

The demo data (Starbucks, Dinner at Nobu, Sarah, Mike) is made up for the video.

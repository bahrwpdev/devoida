# CashNest promo video

A standalone Remotion project. It is not part of the app build and shares no
code with it. It reuses the app's real assets (logo, icons, Inter fonts) and
re-creates the app's components in React with the same tokens and sizes.

**Output:** 1080x1920 (9:16), 30 fps, 15 s. Silent, ready for music or voiceover.

## Run

```bash
npm install
npm run studio     # live preview
npm run render     # writes out/cashnest-promo.mp4
```

## Story

| Frames | Scene |
|---|---|
| 0-60 | A bank SMS lands on the lock screen |
| 60-96 | CashNest's "Payment detected" notification appears under it |
| 92-124 | Tap: the lock screen zooms through into Home |
| 124-192 | The new Starbucks expense opens up in Recent transactions and the hero card counts up |
| 192-300 | Tap the row: a radial reveal opens the Expense details, rows stagger in, total pulses |
| 300-450 | The phone flies out and the logo, tagline and "Get CashNest" button pop in |

Motion: short springs with a little overshoot (`useSpring`, `Pop`), a screen
"camera" that magnifies inside the phone (`CAM` keyframes, clamped to the screen
edges), a 3D phone entrance, and the splash's icon orbit behind everything.
All timings live in the `T` object and `CAM` table at the top of `src/Promo.tsx`.

## Where the app design comes from (cashnest repo)

| Here | App source |
|---|---|
| `src/tokens.ts` | `app_theme.dart`, `design_tokens.dart`, `ui_style.dart` |
| `src/Splash.tsx` | `splash_screen.dart`, `icon_orbit.dart` |
| `src/ui/kit.tsx` | `ui_card.dart`, `app_top_bar.dart`, `expense_tracking_list_tile.dart`, `split_card.dart`, `custom_navigation_bar.dart`, `form_action_bar.dart`, `card_link_connector.dart`, `bubble_fab.dart` |
| `src/screens/app.tsx` | `home_dashboard.dart` (header, hero card, Recent transactions), `expense_details_screen.dart` (header card, ticket) |

The demo data (Starbucks, the bank SMS and the notification wording) is made up for the video. The lock screen and notification banners are an iOS-style mock, not app code.

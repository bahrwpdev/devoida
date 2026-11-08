# CashNest promo video

A standalone Remotion project. It is not part of the app build.

**Output:** `cashnest-promo.mp4`, 1170x2532 (an iPhone 390x844 screen at 3x), 30 fps, 15 s.
Screen only: no device frame, no captions, no background. Silent. It is meant to
be dropped into a phone mockup.

Everything inside the app is the app's own rendering. The frames in `public/seq`
come from the real Flutter screens (see `capture/README.md`), so components,
colours, fonts and icons are exact. Only the OS lock screen (SMS and detection
notification) and the status bar are drawn here, in the brand palette and with
the current app icon.

## Run

```bash
npm install
npm run studio     # live preview
npm run render     # writes out/cashnest-promo.mp4
```

`public/seq` is not committed (about 70 MB of PNG frames): regenerate it with the
capture step, or ask for the frames.

## Story

| Frames | Scene |
|---|---|
| 0-60 | A bank SMS lands on the lock screen |
| 58-96 | CashNest's "Payment detected" notification appears under it |
| 90-112 | Tap: the lock screen zooms through into the real Home |
| 124-188 | The Starbucks expense pops into Recent transactions, totals update |
| 188-296 | Tap the row: radial reveal into the real Expense details |
| 296-450 | Zoom-through into the real splash: logo, icon orbit, "Let's Start" |

Timings are the `T` object and the camera moves the `CAM` table in `src/Promo.tsx`.
Colours are encoded as BT.709 with PNG frames (see `remotion.config.ts`).

The status bar can be removed by deleting the block marked "status bar" in `Promo.tsx`.

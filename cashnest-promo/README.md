# CashNest promo videos

A standalone Remotion project, not part of the app build. Screen only: no device
frame. Output is 1170x2532 (a 390x844 phone screen at 3x), 30 fps, silent, ready
for a phone mockup and a voice-over.

Everything inside the app is the app's own rendering. The frames come from the
real Flutter screens (see `capture/README.md`), so components, colours, fonts,
icons and motion are exact. Only the Android notification and the status bar are
drawn here.

## Overview video, part 1 (0:00 to 0:32)

`npm run render` writes `out/overview-part1.mp4` (also committed as
`overview-part1.mp4`).

| Time | Scene |
|---|---|
| 0:00 | Real Home: header, hero card, then Recent transactions reveal one by one |
| 0:07 | Android notification "Payment detected, add it now?" flips to "Payment Saved"; the Starbucks expense lands and the totals update |
| 0:17 | Tap Splits: the nav pill glides over and the Splits list reveals |
| 0:19 | Tap "+": New split. Name, amount, tax, tip, two friends, each share appears |
| 0:27 | Save Bill & Notify: the Notify sheet with WhatsApp and SMS for each friend, then Done |

Timings are the `BANNER` object and the `CAM` camera table in `src/Part1.tsx`;
tap markers come from `src/part1.events.json`, written by the capture.

`public/seq` (about 240 MB of PNG frames) is not committed: regenerate it with the capture step.
Colours are encoded as BT.709 with PNG frames (see `remotion.config.ts`).
